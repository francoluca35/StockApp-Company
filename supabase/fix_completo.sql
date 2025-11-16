-- FIX COMPLETO PARA USUARIOS Y RLS

-- 1. Primero, asegurémonos de que el usuario existe en la tabla users
-- Reemplaza el ID y email con los de tu usuario
INSERT INTO public.users (id, email, role)
VALUES (
  '420957ca-db0b-44ec-9066-b1ad01b62c33',  -- Tu user ID
  'franco@gmail.com',
  'admin'
)
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email;

-- 2. Eliminar TODAS las políticas existentes (incluyendo las que puedan tener nombres diferentes)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own name" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can update roles" ON public.users;

-- 3. Crear políticas simples que funcionen
-- Política para SELECT: usuarios ven su propio perfil
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Política para SELECT: admins ven todos los usuarios
-- Usamos una función para evitar recursión
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- Política para INSERT: usuarios pueden crear su propio perfil
CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Política para UPDATE: usuarios pueden actualizar su propio perfil (excepto role)
CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Política para UPDATE: admins pueden actualizar roles
CREATE POLICY "Admins can update roles"
  ON public.users FOR UPDATE
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- 4. Asegurar que la función handle_new_user existe y funciona
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'admin')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Asegurar que el trigger existe
-- Nota: Este trigger se crea en auth.users, no en public.users
-- Por eso no aparece en la lista de triggers de public.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Verificar que el trigger se creó (esto mostrará un mensaje si hay error)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created' 
    AND tgrelid = 'auth.users'::regclass
  ) THEN
    RAISE NOTICE 'Trigger on_auth_user_created creado exitosamente';
  ELSE
    RAISE WARNING 'El trigger on_auth_user_created NO se creó';
  END IF;
END $$;

-- 6. Verificar que RLS está habilitado
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

