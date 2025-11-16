# 🔍 Cómo Verificar que el Trigger se Creó

## Importante

El trigger `on_auth_user_created` se crea en la tabla `auth.users`, **NO** en `public.users`. Por eso no lo ves en la lista de triggers cuando estás viendo `public.users`.

## Cómo Verificar el Trigger

### Opción 1: Desde SQL Editor (Recomendado)

Ejecuta este SQL para verificar que el trigger existe:

```sql
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'on_auth_user_created';
```

Si el trigger existe, verás una fila con:
- `trigger_name`: `on_auth_user_created`
- `table_name`: `auth.users`
- `function_name`: `handle_new_user`

### Opción 2: Verificar en Database → Triggers

1. Ve a **Database** → **Triggers** en Supabase
2. En el filtro de schema, busca `auth` (no `public`)
3. O simplemente busca `on_auth_user_created` en el buscador

**Nota**: Los triggers de `auth.users` pueden no aparecer en la interfaz visual de Supabase, pero eso no significa que no existan. Lo importante es que funcionen.

### Opción 3: Probar que Funciona

La mejor forma de verificar es probar:

1. Crea un nuevo usuario en **Authentication** → **Users**
2. Verifica que automáticamente aparece en **Table Editor** → **users**

Si el usuario aparece automáticamente, el trigger está funcionando correctamente.

## Si el Trigger No se Creó

Si el SQL anterior no muestra el trigger, ejecuta esto para crearlo manualmente:

```sql
-- Verificar que la función existe
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- Si la función existe, crear el trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Verificar que se creó
SELECT tgname, tgrelid::regclass 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
```

## Verificar la Función

También verifica que la función existe:

```sql
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user';
```

Deberías ver la función `handle_new_user` con su código.

## Resumen

- ✅ El trigger está en `auth.users`, no en `public.users`
- ✅ Puede que no aparezca en la interfaz visual
- ✅ Lo importante es que funcione (crear usuarios automáticamente)
- ✅ Pruébalo creando un nuevo usuario en Authentication

