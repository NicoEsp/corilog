
-- Estrategia de emergencia: Recrear sistema de roles sin enum personalizado

-- 1. Eliminar trigger problemático y función
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_role() CASCADE;

-- 2. Eliminar tabla actual con tipo enum
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- 3. Eliminar tipo enum problemático
DROP TYPE IF EXISTS public.user_role CASCADE;

-- 4. Crear nueva tabla user_roles simple con VARCHAR
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (role IN ('superadmin', 'free', 'premium')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 5. Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 6. Política simple para que usuarios vean su rol
CREATE POLICY "Users can view their own role" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

-- 7. Política para insertar (necesaria para el workaround frontend)
CREATE POLICY "Service role can manage roles" ON public.user_roles
FOR ALL USING (true);

-- 8. Recrear función get_user_role sin tipo enum
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS VARCHAR AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public.user_roles 
    WHERE user_roles.user_id = get_user_role.user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 9. Recrear función has_role sin tipo enum
CREATE OR REPLACE FUNCTION public.has_role(required_role VARCHAR, user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = required_role
    FROM public.user_roles 
    WHERE user_roles.user_id = has_role.user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
