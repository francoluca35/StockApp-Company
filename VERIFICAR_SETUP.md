# ✅ Verificación de Setup de Supabase

## Paso 1: Verificar Tablas Creadas

1. En Supabase, ve a **Table Editor** (en el menú lateral)
2. Deberías ver estas 3 tablas:
   - ✅ `users`
   - ✅ `products`
   - ✅ `movements`

Si las ves, ¡perfecto! El schema se ejecutó correctamente.

## Paso 2: Verificar Funciones y Triggers

1. Ve a **Database** → **Functions** en Supabase
2. Deberías ver:
   - ✅ `update_product_stock`
   - ✅ `handle_new_user`

## Paso 3: Crear tu Primer Usuario Administrador

### Opción A: Desde Authentication (Recomendado)

1. Ve a **Authentication** → **Users** en Supabase
2. Haz clic en **"Add user"** → **"Create new user"**
3. Completa:
   - **Email**: tu-email@ejemplo.com
   - **Password**: una contraseña segura (mínimo 6 caracteres)
4. Haz clic en **"Create user"**

### Opción B: Desde SQL Editor

Si prefieres crear el usuario directamente con SQL:

```sql
-- Esto creará el usuario en auth.users
-- Luego el trigger automáticamente creará el registro en public.users
```

## Paso 4: Asignar Rol de Administrador

1. Ve al **SQL Editor** nuevamente
2. Ejecuta este SQL (reemplaza el email con el que usaste):

```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'tu-email@ejemplo.com';
```

3. Haz clic en **"Run"**
4. Deberías ver: "Success. 1 row updated" (o similar)

## Paso 5: Actualizar Variables de Entorno

1. En Supabase, ve a **Settings** → **API**
2. Copia estos valores:
   - **Project URL**
   - **anon public** key
   - **service_role** key (⚠️ secreto)

3. Edita tu archivo `.env.local` y reemplaza los valores placeholder:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-real
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-real
```

## Paso 6: Reiniciar la Aplicación

1. Detén el servidor si está corriendo (`Ctrl+C`)
2. Reinicia:
   ```bash
   npm run dev
   ```

## Paso 7: Probar el Login

1. Ve a [http://localhost:3000](http://localhost:3000)
2. Deberías ser redirigido a `/login`
3. Inicia sesión con:
   - **Email**: el que creaste
   - **Password**: la contraseña que pusiste
4. Si todo está bien, deberías entrar al dashboard

## ✅ ¡Listo!

Si llegaste hasta aquí, tu aplicación está completamente configurada y funcionando.

## 🎯 Próximos Pasos

1. **Crear productos de prueba**:
   - Ve a "Productos" → "Nuevo Producto"
   - Crea algunos productos de ejemplo

2. **Probar entradas y salidas**:
   - Ve a "Entradas" y registra algunas entradas
   - Ve a "Salidas" y registra algunas salidas
   - Verifica que el stock se actualice automáticamente

3. **Explorar el dashboard**:
   - Revisa las estadísticas
   - Ve los movimientos recientes

## 🐛 Si algo no funciona

### No puedo iniciar sesión
- Verifica que el email y contraseña sean correctos
- Asegúrate de que las variables de entorno estén actualizadas
- Reinicia el servidor después de cambiar `.env.local`

### Error "permission denied"
- Verifica que el usuario tenga el rol correcto (admin o empleado)
- Revisa que las políticas RLS estén activas

### No veo las tablas
- Vuelve a ejecutar el schema.sql completo
- Verifica que no haya errores en la consola de Supabase

