# 🔍 Guía de Debug para Problemas de Login

## Pasos para Diagnosticar

### 1. Verificar en la Consola del Navegador

1. Abre las DevTools (F12)
2. Ve a la pestaña **Console**
3. Intenta iniciar sesión
4. Revisa los mensajes que aparecen:
   - ✅ "Intentando iniciar sesión con: [email]" - El formulario está funcionando
   - ✅ "Login exitoso, usuario: [email]" - La autenticación funcionó
   - ❌ Cualquier error en rojo - Indica el problema

### 2. Verificar que el Usuario Existe en Supabase

1. Ve a tu proyecto en Supabase
2. Ve a **Authentication** → **Users**
3. Verifica que el usuario que intentas usar existe
4. Si no existe, créalo:
   - Haz clic en **"Add user"** → **"Create new user"**
   - Ingresa email y contraseña
   - Haz clic en **"Create user"**

### 3. Verificar que el Usuario Existe en la Tabla `users`

1. Ve a **Table Editor** en Supabase
2. Abre la tabla `users`
3. Verifica que haya un registro con el email que usas
4. Si no existe, el trigger debería crearlo automáticamente, pero puedes crearlo manualmente:

```sql
-- Reemplaza con el ID y email de tu usuario
INSERT INTO public.users (id, email, role)
VALUES (
  'uuid-del-usuario-aqui',
  'tu-email@ejemplo.com',
  'empleado'
);
```

Para obtener el UUID del usuario:
1. Ve a **Authentication** → **Users**
2. Haz clic en el usuario
3. Copia el **UUID** que aparece

### 4. Verificar Variables de Entorno

Abre `.env.local` y verifica que tenga valores reales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

**Importante**: Después de cambiar `.env.local`, **reinicia el servidor**:
```bash
# Detén el servidor (Ctrl+C)
npm run dev
```

### 5. Verificar Políticas RLS

1. Ve a **Authentication** → **Policies** en Supabase
2. Verifica que las políticas estén activas
3. Si no están, ejecuta nuevamente el `schema.sql`

### 6. Errores Comunes y Soluciones

#### "Invalid login credentials"
- **Causa**: Email o contraseña incorrectos
- **Solución**: Verifica que el email y contraseña sean exactamente los mismos que en Supabase

#### "Email not confirmed"
- **Causa**: El email no ha sido confirmado
- **Solución**: 
  1. Ve a **Authentication** → **Users**
  2. Haz clic en el usuario
  3. Haz clic en **"Confirm email"** o verifica el email

#### "User not found"
- **Causa**: El usuario no existe en Supabase Auth
- **Solución**: Crea el usuario en **Authentication** → **Users**

#### El login parece funcionar pero no redirige
- **Causa**: Problema con la sesión o el router
- **Solución**: 
  1. Revisa la consola del navegador
  2. Verifica que no haya errores de CORS
  3. Intenta limpiar las cookies del navegador

#### "permission denied" después del login
- **Causa**: El usuario no existe en la tabla `users` o las políticas RLS están bloqueando
- **Solución**: 
  1. Verifica que el usuario exista en la tabla `users`
  2. Si no existe, créalo manualmente (ver paso 3)
  3. Verifica las políticas RLS

### 7. Probar con un Usuario Nuevo

Si nada funciona, crea un usuario completamente nuevo:

1. En Supabase: **Authentication** → **Users** → **"Add user"**
2. Email: `test@ejemplo.com`
3. Password: `test123456`
4. Haz clic en **"Create user"**
5. En el SQL Editor, ejecuta:
```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'test@ejemplo.com';
```
6. Intenta iniciar sesión con este usuario

### 8. Verificar Logs en Supabase

1. Ve a **Logs** → **Auth Logs** en Supabase
2. Revisa los intentos de login
3. Esto te mostrará errores específicos del lado del servidor

## ✅ Checklist de Verificación

- [ ] El usuario existe en **Authentication** → **Users**
- [ ] El usuario existe en la tabla `users` (Table Editor)
- [ ] Las variables de entorno están correctas en `.env.local`
- [ ] El servidor fue reiniciado después de cambiar `.env.local`
- [ ] No hay errores en la consola del navegador
- [ ] Las políticas RLS están activas
- [ ] El email está confirmado (si es requerido)

## 📞 Si Nada Funciona

Comparte esta información:
1. El mensaje de error exacto de la consola
2. El mensaje de error que aparece en la pantalla
3. Una captura de pantalla de la consola del navegador
4. Verifica que el usuario exista en Supabase

