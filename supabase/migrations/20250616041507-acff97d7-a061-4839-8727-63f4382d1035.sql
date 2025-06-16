
-- Primero, eliminar cualquier trigger duplicado o mal configurado
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Verificar que la función existe y recrearla si es necesario
DROP FUNCTION IF EXISTS public.handle_new_user_role() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Asignar superadmin al email específico, free a todos los demás
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE 
      WHEN NEW.email = 'nicolassespindola@gmail.com' THEN 'superadmin'::user_role
      ELSE 'free'::user_role
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear el trigger correctamente en la tabla auth.users
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Verificar que todo está en orden
SELECT 
  t.trigger_name,
  t.event_manipulation,
  t.event_object_table,
  t.action_statement
FROM information_schema.triggers t
WHERE t.trigger_name LIKE '%role%' 
  AND t.event_object_schema = 'auth';
