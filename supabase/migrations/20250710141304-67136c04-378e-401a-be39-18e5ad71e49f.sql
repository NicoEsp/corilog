-- CORRECCIÓN DE SEGURIDAD DEFINITIVA - ELIMINAR ACCESO PÚBLICO A shared_moments
-- Esta migración resuelve la alerta de seguridad sin afectar la funcionalidad

-- 1. ELIMINAR la política pública peligrosa que expone la tabla
DROP POLICY IF EXISTS "Public can view shared moments with valid token" ON public.shared_moments;

-- 2. CREAR función de seguridad definer para validación controlada desde Edge Functions
CREATE OR REPLACE FUNCTION public.validate_shared_moment_access(
  p_share_token UUID,
  p_email TEXT
)
RETURNS TABLE (
  moment_data JSONB,
  shared_by_data JSONB,
  access_valid BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  shared_moment_record RECORD;
  moment_record RECORD;
  user_profile_record RECORD;
BEGIN
  -- Verificar que el shared_moment existe, está activo y no ha expirado
  SELECT * INTO shared_moment_record
  FROM public.shared_moments sm
  WHERE sm.share_token = p_share_token
    AND sm.is_active = true
    AND (sm.expires_at IS NULL OR sm.expires_at > now());
  
  -- Si no existe o no es válido, retornar acceso denegado
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::JSONB, NULL::JSONB, FALSE;
    RETURN;
  END IF;
  
  -- Verificar que el email está autorizado
  IF NOT (shared_moment_record.recipient_email_1 = lower(trim(p_email)) OR 
          shared_moment_record.recipient_email_2 = lower(trim(p_email))) THEN
    RETURN QUERY SELECT NULL::JSONB, NULL::JSONB, FALSE;
    RETURN;
  END IF;
  
  -- Obtener datos del momento
  SELECT * INTO moment_record
  FROM public.moments m
  WHERE m.id = shared_moment_record.moment_id;
  
  -- Obtener datos del usuario que compartió
  SELECT * INTO user_profile_record
  FROM public.user_profiles up
  WHERE up.id = shared_moment_record.shared_by_user_id;
  
  -- Actualizar contador de vistas
  IF shared_moment_record.recipient_email_1 = lower(trim(p_email)) THEN
    UPDATE public.shared_moments 
    SET view_count_email_1 = view_count_email_1 + 1
    WHERE share_token = p_share_token;
  ELSIF shared_moment_record.recipient_email_2 = lower(trim(p_email)) THEN
    UPDATE public.shared_moments 
    SET view_count_email_2 = view_count_email_2 + 1
    WHERE share_token = p_share_token;
  END IF;
  
  -- Retornar datos si el acceso es válido
  RETURN QUERY SELECT 
    row_to_json(moment_record)::JSONB,
    row_to_json(user_profile_record)::JSONB,
    TRUE;
END;
$$;

-- 3. CREAR política restrictiva solo para service role (Edge Functions)
CREATE POLICY "Service role can validate shared access" 
ON public.shared_moments 
FOR SELECT 
TO service_role
USING (true);

-- 4. CREAR función para logging de seguridad
CREATE OR REPLACE FUNCTION public.log_shared_access_attempt(
  p_share_token TEXT,
  p_email TEXT,
  p_ip_address INET,
  p_user_agent TEXT,
  p_success BOOLEAN
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    table_name,
    operation,
    details,
    ip_address,
    user_agent
  ) VALUES (
    'shared_moments',
    'access_attempt',
    jsonb_build_object(
      'share_token', p_share_token,
      'email', p_email,
      'success', p_success,
      'timestamp', now()
    ),
    p_ip_address,
    p_user_agent
  );
END;
$$;

-- 5. VERIFICAR que las políticas existentes para usuarios autenticados siguen intactas
-- (Estas políticas ya existen y no se tocan)
-- - "Users can view their own shared moments"
-- - "Users can create their own shared moments" 
-- - "Users can update their own shared moments"
-- - "Users can delete their own shared moments"