# 📋 Guía de Configuración de Supabase

## Paso 1: Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Inicia sesión o crea una cuenta
3. Haz clic en **"New Project"**
4. Completa:
   - **Name**: StockApp (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura (guárdala)
   - **Region**: Elige la más cercana a ti
   - **Pricing Plan**: Free tier está bien para empezar
5. Haz clic en **"Create new project"**
6. Espera 2-3 minutos a que se cree el proyecto

## Paso 2: Obtener Credenciales

1. En tu proyecto de Supabase, ve a **Settings** (⚙️) en el menú lateral
2. Haz clic en **API**
3. Copia estos valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Mantén esto secreto)

## Paso 3: Configurar Variables de Entorno

1. En tu proyecto local, edita el archivo `.env.local`
2. Reemplaza los valores placeholder con los que copiaste:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-real-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-real-aqui
```

## Paso 4: Ejecutar el Schema SQL

### Opción A: SQL Editor (Recomendado)

1. En Supabase, ve a **SQL Editor** en el menú lateral
2. Haz clic en **"New query"** (botón verde)
3. Abre el archivo `supabase/schema.sql` de tu proyecto
4. **Copia TODO el contenido** del archivo
5. Pégalo en el editor SQL de Supabase
6. Haz clic en **"Run"** (o presiona `Ctrl+Enter` / `Cmd+Enter`)
7. Deberías ver un mensaje de éxito: ✅ "Success. No rows returned"

### Opción B: Desde la Terminal (Opcional)

Si tienes `psql` instalado:

```bash
psql "postgresql://postgres:[TU_PASSWORD]@db.[TU_PROYECTO_ID].supabase.co:5432/postgres" -f supabase/schema.sql
```

## Paso 5: Verificar que Funcionó

1. En Supabase, ve a **Table Editor** en el menú lateral
2. Deberías ver estas tablas:
   - ✅ `users`
   - ✅ `products`
   - ✅ `movements`

## Paso 6: Crear Usuario Administrador

1. Ve a **Authentication** → **Users** en Supabase
2. Haz clic en **"Add user"** → **"Create new user"**
3. Completa:
   - **Email**: tu-email@ejemplo.com
   - **Password**: una contraseña segura
4. Haz clic en **"Create user"**
5. Ve al **SQL Editor** nuevamente
6. Ejecuta este SQL (reemplaza el email con el que usaste):

```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'tu-email@ejemplo.com';
```

7. Haz clic en **"Run"**

## Paso 7: Reiniciar la Aplicación

1. Detén el servidor de desarrollo (`Ctrl+C`)
2. Reinicia con:
   ```bash
   npm run dev
   ```
3. Ve a [http://localhost:3000](http://localhost:3000)
4. Inicia sesión con el email y contraseña que creaste

## ✅ ¡Listo!

Tu aplicación debería estar funcionando con Supabase. Ahora puedes:
- Iniciar sesión
- Crear productos
- Registrar entradas y salidas
- Ver el stock en tiempo real
- Generar informes

## 🔍 Solución de Problemas

### Error: "relation does not exist"
- Asegúrate de haber ejecutado TODO el contenido de `schema.sql`
- Verifica que las tablas existan en **Table Editor**

### Error: "permission denied"
- Verifica que hayas ejecutado todas las políticas RLS del schema
- Revisa que el usuario tenga el rol correcto

### Error de autenticación
- Verifica que las variables de entorno estén correctas en `.env.local`
- Reinicia el servidor después de cambiar `.env.local`

### No puedo ver las tablas
- Asegúrate de estar en el proyecto correcto de Supabase
- Verifica que el SQL se ejecutó sin errores

## 📚 Recursos

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

