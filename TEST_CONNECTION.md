# 🧪 Verificar Conexión con Supabase

## Pasos para Verificar que Todo Funciona

### 1. Verificar Variables de Entorno

Asegúrate de que tu `.env.local` tenga valores reales (no placeholder):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

**Importante**: 
- La URL debe empezar con `https://` y terminar con `.supabase.co`
- Las keys deben ser muy largas (más de 100 caracteres)
- No deben contener la palabra "placeholder"

### 2. Reiniciar el Servidor

**MUY IMPORTANTE**: Después de cambiar `.env.local`, debes reiniciar el servidor:

1. Detén el servidor actual (`Ctrl+C` en la terminal)
2. Inicia de nuevo:
   ```bash
   npm run dev
   ```

Next.js solo carga las variables de entorno al iniciar, así que **siempre reinicia después de cambiar .env.local**.

### 3. Verificar que el Login Funciona

1. Ve a [http://localhost:3000](http://localhost:3000)
2. Deberías ver la página de login
3. **NO deberías ver** el mensaje naranja de "⚠️ Modo Demo"
4. Intenta iniciar sesión con el usuario que creaste en Supabase

### 4. Verificar en la Consola del Navegador

1. Abre las DevTools (F12)
2. Ve a la pestaña "Console"
3. No deberías ver errores relacionados con Supabase
4. Si ves errores, compártelos para ayudarte

### 5. Verificar que Puedes Crear Productos

1. Inicia sesión
2. Ve a "Productos" → "Nuevo Producto"
3. Intenta crear un producto de prueba
4. Si funciona, ¡todo está bien configurado!

## ✅ Checklist de Verificación

- [ ] `.env.local` tiene valores reales (no placeholder)
- [ ] El servidor fue reiniciado después de cambiar `.env.local`
- [ ] No aparece el mensaje "Modo Demo" en el login
- [ ] Puedo iniciar sesión con mi usuario
- [ ] Puedo ver el dashboard
- [ ] Puedo crear productos
- [ ] No hay errores en la consola del navegador

## 🐛 Problemas Comunes

### "Modo Demo" sigue apareciendo
- Verifica que `.env.local` tenga valores reales
- Reinicia el servidor (`Ctrl+C` y luego `npm run dev`)
- Verifica que la URL empiece con `https://` y termine con `.supabase.co`

### Error de autenticación
- Verifica que el usuario exista en Supabase (Authentication → Users)
- Verifica que el email y contraseña sean correctos
- Asegúrate de que el usuario tenga un registro en la tabla `users`

### Error "permission denied"
- Verifica que ejecutaste todo el `schema.sql`
- Verifica que las políticas RLS estén activas
- Asegúrate de que el usuario tenga el rol correcto

### No puedo crear productos
- Verifica que estés autenticado
- Revisa la consola del navegador para ver errores específicos
- Verifica que la tabla `products` exista en Supabase

