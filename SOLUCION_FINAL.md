# 🔧 Solución Final - Paso a Paso

## Problema
El login no funciona debido a problemas con RLS y el usuario no existe en la tabla `users`.

## Solución Completa

### Paso 1: Ejecutar el SQL de Fix Completo

1. Ve a **SQL Editor** en Supabase
2. Abre el archivo `supabase/fix_completo.sql`
3. **IMPORTANTE**: Antes de ejecutar, reemplaza el ID del usuario en la línea 5:
   - El ID actual es: `420957ca-db0b-44ec-9066-b1ad01b62c33`
   - Si tu usuario tiene otro ID, cámbialo
   - Para obtener tu ID: **Authentication** → **Users** → Haz clic en tu usuario → Copia el UUID
4. Copia TODO el contenido del archivo
5. Pégalo en el SQL Editor
6. Haz clic en **"Run"**
7. Deberías ver: "Success. No rows returned" o similar

### Paso 2: Verificar que el Usuario Existe

1. Ve a **Table Editor** → **users**
2. Deberías ver tu usuario (`franco@gmail.com`)
3. Si no aparece, ejecuta este SQL manualmente (reemplaza con tu ID real):

```sql
INSERT INTO public.users (id, email, role)
VALUES (
  'TU-USER-ID-AQUI',  -- Reemplaza con tu ID real
  'franco@gmail.com',
  'empleado'
)
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email;
```

### Paso 3: Limpiar Cookies y Cache

1. En tu navegador, abre las DevTools (F12)
2. Ve a **Application** (o **Almacenamiento**)
3. En **Cookies**, elimina todas las cookies de `localhost:3000`
4. En **Local Storage**, elimina todo de `localhost:3000`
5. Cierra y vuelve a abrir el navegador

### Paso 4: Reiniciar el Servidor

1. Detén el servidor (`Ctrl+C`)
2. Inicia de nuevo:
   ```bash
   npm run dev
   ```

### Paso 5: Intentar Login de Nuevo

1. Ve a http://localhost:3000
2. Intenta iniciar sesión con:
   - Email: `franco@gmail.com`
   - Password: tu contraseña
3. Abre la consola del navegador (F12) para ver los mensajes

## Si Aún No Funciona

### Verificación Adicional

1. **Verifica que el usuario existe en Auth:**
   - Ve a **Authentication** → **Users**
   - Deberías ver `franco@gmail.com`
   - Si no está, créalo

2. **Verifica que el usuario existe en la tabla users:**
   - Ve a **Table Editor** → **users**
   - Deberías ver tu usuario
   - Si no está, créalo con el SQL del Paso 2

3. **Verifica las políticas RLS:**
   - Ve a **Database** → **Policies**
   - Deberías ver 5 políticas para la tabla `users`
   - Si no están, ejecuta el `fix_completo.sql` de nuevo

4. **Verifica el error exacto:**
   - Abre la consola del navegador (F12)
   - Intenta iniciar sesión
   - Copia el error exacto que aparece
   - Compártelo para ayudarte mejor

## SQL Rápido para Crear Usuario Manualmente

Si nada funciona, ejecuta esto (reemplaza con tu información real):

```sql
-- Obtener tu User ID primero desde Authentication → Users
-- Luego ejecuta esto:

INSERT INTO public.users (id, email, role)
VALUES (
  'TU-USER-ID-AQUI',  -- Reemplaza con tu ID real de auth.users
  'franco@gmail.com',  -- Tu email
  'admin'  -- O 'empleado' si prefieres
)
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email, role = EXCLUDED.role;
```

## Checklist Final

- [ ] Ejecuté el `fix_completo.sql` en Supabase
- [ ] El usuario existe en **Authentication** → **Users**
- [ ] El usuario existe en **Table Editor** → **users**
- [ ] Limpié las cookies y cache del navegador
- [ ] Reinicié el servidor (`npm run dev`)
- [ ] Intenté iniciar sesión de nuevo
- [ ] Revisé la consola del navegador para errores

Si después de todo esto aún no funciona, comparte:
1. El error exacto de la consola del navegador
2. Una captura de pantalla de la tabla `users` en Supabase
3. Una captura de pantalla de **Authentication** → **Users**

