-- FIX SIMPLE PARA RLS - Sin Recursión

-- Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own name" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can update roles" ON public.users;

-- Crear función helper para verificar si es admin (evita recursión)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Política 1: Usuarios pueden ver su propio perfil
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Política 2: Admins pueden ver todos los usuarios (usando función para evitar recursión)
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Política 3: Usuarios pueden insertar su propio perfil
CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Política 4: Usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Política 5: Admins pueden actualizar roles
CREATE POLICY "Admins can update roles"
  ON public.users FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

