# StockApp - Sistema de Gestión de Stock Industrial

Aplicación web moderna para gestión de stock industrial con Next.js, TypeScript, Tailwind CSS y Supabase.

## 🚀 Características

- ✅ Autenticación con roles (Admin/Empleado)
- ✅ Entradas y salidas de productos
- ✅ Stock en tiempo real
- ✅ Códigos de barras
- ✅ Panel de administración
- ✅ Exportación de informes (Excel/PDF)
- ✅ Diseño dark mode con tema verde neón

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, React, TypeScript
- **Estilos**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Estado**: Zustand
- **Formularios**: React Hook Form + Zod

## 📦 Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.local.example .env.local
```

Editar `.env.local` con tus credenciales de Supabase.

3. Ejecutar en desarrollo:
```bash
npm run dev
```

4. Abrir [http://localhost:3000](http://localhost:3000)

## 🗄️ Base de Datos

Ejecutar los scripts SQL en Supabase SQL Editor (ver `supabase/schema.sql`)

## 📝 Licencia

MIT

