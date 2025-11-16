# Guía de Configuración - StockApp

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Cuenta de Supabase (gratuita en https://supabase.com)

## 🚀 Pasos de Instalación

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Supabase

1. Crea un nuevo proyecto en [Supabase](https://supabase.com)
2. Ve a **Settings > API** y copia:
   - `URL` del proyecto
   - `anon` key (clave pública)
   - `service_role` key (clave privada - solo para admin)

### 3. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### 4. Configurar Base de Datos

1. Ve a **SQL Editor** en Supabase
2. Copia y ejecuta el contenido completo de `supabase/schema.sql`
3. Esto creará todas las tablas, funciones y políticas necesarias

### 5. Crear Usuario Administrador

1. Ve a **Authentication > Users** en Supabase
2. Crea un nuevo usuario manualmente o usa el registro
3. Ejecuta este SQL para asignar rol de admin:

```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'tu-email@ejemplo.com';
```

### 6. Ejecutar la Aplicación

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 📱 Funcionalidades

### Para Empleados:
- ✅ Ver dashboard con resumen
- ✅ Registrar entradas de productos
- ✅ Registrar salidas de productos
- ✅ Ver stock en tiempo real
- ✅ Buscar productos por código de barras

### Para Administradores:
- ✅ Todas las funcionalidades de empleado
- ✅ Gestionar productos (crear, editar, eliminar)
- ✅ Gestionar usuarios y roles
- ✅ Generar informes mensuales (Excel/PDF)

## 🎨 Personalización

### Colores del Tema

Los colores se pueden modificar en `tailwind.config.ts`:

```typescript
colors: {
  neon: {
    green: '#39ff14',  // Color principal verde neón
    'green-dark': '#2ecc40',
    'green-light': '#7fff00',
  },
  dark: {
    bg: '#0a0a0a',      // Fondo principal
    surface: '#1a1a1a', // Superficies
    // ...
  },
}
```

## 🔒 Seguridad

- Las rutas están protegidas con middleware
- Row Level Security (RLS) activado en Supabase
- Solo admins pueden gestionar usuarios
- Validación de stock antes de salidas

## 📊 Estructura de Base de Datos

- **users**: Usuarios del sistema con roles
- **products**: Productos del inventario
- **movements**: Registro de entradas y salidas

## 🐛 Solución de Problemas

### Error de autenticación
- Verifica que las variables de entorno estén correctas
- Asegúrate de que el usuario exista en Supabase Auth

### Error de permisos
- Verifica que las políticas RLS estén activas
- Revisa que el usuario tenga el rol correcto

### Error al crear productos
- Verifica que el SKU sea único
- Asegúrate de que todos los campos requeridos estén completos

## 📝 Notas

- El stock se actualiza automáticamente con triggers de PostgreSQL
- Los informes se generan en tiempo real desde la base de datos
- El sistema soporta múltiples unidades de medida

