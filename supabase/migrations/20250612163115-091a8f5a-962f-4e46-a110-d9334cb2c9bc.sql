
-- Habilitar RLS en la tabla shared_moments
ALTER TABLE public.shared_moments ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan crear sus propios enlaces compartidos
CREATE POLICY "Users can create their own shared moments" ON public.shared_moments
FOR INSERT WITH CHECK (auth.uid() = shared_by_user_id);

-- Política para que los usuarios puedan ver sus propios enlaces compartidos
CREATE POLICY "Users can view their own shared moments" ON public.shared_moments
FOR SELECT USING (auth.uid() = shared_by_user_id);

-- Política para que los usuarios puedan eliminar sus propios enlaces compartidos
CREATE POLICY "Users can delete their own shared moments" ON public.shared_moments
FOR DELETE USING (auth.uid() = shared_by_user_id);

-- Política para que cualquiera pueda acceder a enlaces compartidos válidos (para ver el momento compartido)
CREATE POLICY "Anyone can view valid shared moments" ON public.shared_moments
FOR SELECT USING (expires_at > now());

-- Hacer el campo shared_with_email opcional (permitir NULL)
ALTER TABLE public.shared_moments 
ALTER COLUMN shared_with_email DROP NOT NULL;
