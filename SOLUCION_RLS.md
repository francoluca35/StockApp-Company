# 🔧 Solución para Error de RLS (Row Level Security)

## Problema

Estás viendo este error:
```
infinite recursion detected in policy for relation "users"
new row violates row-level security policy for table "users"
```

## Causa

Las políticas RLS de la tabla `users` están causando recursión infinita cuando intentamos crear un usuario.

## Solución

### Paso 1: Ejecutar el SQL de Fix

1. Ve a **SQL Editor** en Supabase
2. Abre el archivo `supabase/fix_users_policies.sql`
3. Copia TODO el contenido
4. Pégalo en el SQL Editor
5. Haz clic en **"Run"**

Esto:
- Eliminará las políticas problemáticas
- Creará nuevas políticas que no causan recursión
- Permitirá que los usuarios se creen a sí mismos
- Permitirá que el trigger funcione correctamente

### Paso 2: Verificar que el Trigger Funciona

El trigger `handle_new_user` debería crear automáticamente un registro en `users` cuando se crea un usuario en `auth.users`.

Para verificar:
1. Ve a **Database** → **Functions** en Supabase
2. Deberías ver `handle_new_user`
3. Ve a **Database** → **Triggers**
4. Deberías ver `on_auth_user_created`

### Paso 3: Probar de Nuevo

1. Intenta iniciar sesión nuevamente
2. El trigger debería crear automáticamente el registro en `users`
3. Si el usuario ya existía antes del trigger, puedes crearlo manualmente:

```sql
-- Reemplaza con el ID y email de tu usuario
INSERT INTO public.users (id, email, role)
VALUES (
  '420957ca-db0b-44ec-9066-b1ad01b62c33',  -- Tu user ID
  'franco@gmail.com',
  'empleado'
);
```

Para obtener el ID del usuario:
1. Ve a **Authentication** → **Users**
2. Haz clic en tu usuario
3. Copia el **UUID**

### Paso 4: Si el Usuario Ya Existe

Si el usuario ya existe en `auth.users` pero no en `public.users`, créalo manualmente con el SQL de arriba.

## Verificación

Después de ejecutar el fix:

1. ✅ Las políticas RLS deberían funcionar sin recursión
2. ✅ Los nuevos usuarios se crearán automáticamente con el trigger
3. ✅ Podrás iniciar sesión sin problemas
4. ✅ El usuario aparecerá en la tabla `users`

## Si Aún No Funciona

1. Verifica que ejecutaste el SQL de fix
2. Verifica que el trigger existe y está activo
3. Crea el usuario manualmente con el SQL de arriba
4. Intenta iniciar sesión nuevamente

