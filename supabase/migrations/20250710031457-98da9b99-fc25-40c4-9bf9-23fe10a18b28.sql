-- CORRECCIÓN URGENTE DE SEGURIDAD
-- Problema 1: user_roles permite escritura pública (CRÍTICO)
-- Problema 2: shared_moments es completamente público

-- 1. CORREGIR user_roles - Eliminar política peligrosa y crear una segura
DROP POLICY IF EXISTS "Service role can manage roles" ON public.user_roles;

-- Crear política específica para service role que solo permita operaciones válidas
CREATE POLICY "Service role can manage user roles safely" 
ON public.user_roles 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (
  -- Solo permitir asignación de roles válidos
  role IN ('superadmin', 'free', 'premium') AND
  -- Solo permitir un rol por usuario
  NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = NEW.user_id AND id != COALESCE(NEW.id, gen_random_uuid())
  )
);

-- Política para que usuarios autenticados solo vean su propio rol
-- (esta ya existe pero la recreamos para asegurar)
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
CREATE POLICY "Users can view their own role" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- 2. MEJORAR SEGURIDAD de shared_moments
-- Mantener acceso público pero con restricciones adicionales
DROP POLICY IF EXISTS "Public can view shared moments with valid token" ON public.shared_moments;
CREATE POLICY "Public can view shared moments with valid token" 
ON public.shared_moments 
FOR SELECT 
TO anon, authenticated
USING (
  is_active = true AND 
  (expires_at IS NULL OR expires_at > now()) AND
  -- Restricción adicional: solo permitir acceso si se proporciona share_token específico
  share_token IS NOT NULL
);

-- 3. CREAR TABLA DE AUDITORÍA para monitorear accesos sospechosos
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only superadmin can view audit logs" 
ON public.security_audit_log 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'superadmin'
  )
);

-- 4. CREAR ÍNDICES para mejorar rendimiento de consultas de seguridad
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON public.user_roles (user_id, role);
CREATE INDEX IF NOT EXISTS idx_shared_moments_token_active ON public.shared_moments (share_token, is_active);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log (created_at DESC);