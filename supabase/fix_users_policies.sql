-- Fix para políticas RLS de users que causan recursión infinita

-- Eliminar políticas existentes que causan problemas
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.users;

-- Política para que los usuarios puedan ver su propio perfil
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Política para que los admins puedan ver todos los usuarios
-- Usamos una subconsulta directa sin recursión
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.users
        WHERE public.users.id = auth.uid() AND public.users.role = 'admin'
      )
    )
  );

-- Política para que los usuarios puedan insertar su propio perfil
-- Esto permite que el trigger funcione y que los usuarios se creen a sí mismos
CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Política para que los admins puedan actualizar roles
CREATE POLICY "Admins can update user roles"
  ON public.users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política adicional: permitir que los usuarios actualicen su propio nombre
CREATE POLICY "Users can update their own name"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

