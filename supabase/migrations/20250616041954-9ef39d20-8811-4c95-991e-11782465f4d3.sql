
-- Crear el trigger específicamente en la tabla auth.users
-- Primero verificamos que la función existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'handle_new_user_role' 
        AND pronamespace = 'public'::regnamespace
    ) THEN
        RAISE EXCEPTION 'Function handle_new_user_role does not exist';
    END IF;
END $$;

-- Eliminar cualquier trigger existente para evitar duplicados
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;

-- Crear el trigger en auth.users con permisos específicos
CREATE TRIGGER on_auth_user_created_role
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user_role();

-- Verificar que el trigger se creó correctamente
SELECT 
    t.trigger_name,
    t.event_object_schema,
    t.event_object_table,
    t.event_manipulation,
    t.action_timing
FROM information_schema.triggers t
WHERE t.trigger_name = 'on_auth_user_created_role'
    AND t.event_object_schema = 'auth'
    AND t.event_object_table = 'users';
