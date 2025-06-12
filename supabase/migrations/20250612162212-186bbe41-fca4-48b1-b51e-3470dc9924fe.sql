
-- Cambiar el valor por defecto de share_token para usar 'hex' en lugar de 'base64url'
ALTER TABLE public.shared_moments 
ALTER COLUMN share_token SET DEFAULT encode(extensions.gen_random_bytes(32), 'hex');
