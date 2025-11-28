# 🍟 Instrucciones para Configurar la App de Papas Fritas

## 📋 Resumen de Cambios

La aplicación ha sido adaptada para el control de stock y ventas de una empresa de papas fritas con las siguientes funcionalidades:

### ✅ Funcionalidades Implementadas

1. **Agregar Producto** (`/dashboard/entradas`)
   - Formulario para crear nuevos productos
   - Campos: Nombre, SKU, Código de Barras, Categoría, Unidad, Stock Mínimo
   - Muestra productos recientes creados

2. **Stocks** (`/dashboard/stock`)
   - Lista completa de todos los productos agregados al inventario
   - Muestra: Producto, SKU, Código, Categoría, Stock Actual, Unidad, Stock Mínimo, Estado
   - Filtros: Todos, Stock Bajo, Sin Stock
   - Búsqueda por nombre, SKU o código de barras
   - Exportación a CSV

3. **Stock de Salidas** (`/dashboard/stock-salidas`)
   - Historial completo de todos los stocks que salieron de la empresa
   - Muestra: Fecha, Hora, Producto, SKU, Cantidad, Unidad, Despachado Por
   - Filtros por fecha y búsqueda
   - Exportación a CSV

## 🗄️ Actualización de Base de Datos

**IMPORTANTE:** Debes ejecutar el script SQL en Supabase para agregar los nuevos campos a la tabla `movements`.

### Pasos:

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Abre el **SQL Editor**
3. Ejecuta el siguiente script:

```sql
-- Agregar nuevas columnas a la tabla movements
ALTER TABLE public.movements 
ADD COLUMN IF NOT EXISTS fecha DATE,
ADD COLUMN IF NOT EXISTS hora TIME,
ADD COLUMN IF NOT EXISTS tiempo_produccion INTEGER, -- en minutos
ADD COLUMN IF NOT EXISTS despachado_por TEXT;

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_movements_fecha ON public.movements(fecha);
CREATE INDEX IF NOT EXISTS idx_movements_tipo_fecha ON public.movements(type, fecha);

-- Actualizar movimientos existentes con fecha y hora desde created_at
UPDATE public.movements 
SET fecha = DATE(created_at),
    hora = TIME(created_at)
WHERE fecha IS NULL;
```

O simplemente copia y ejecuta el contenido del archivo `supabase/schema_papas_fritas.sql` en el SQL Editor de Supabase.

## 📁 Archivos Modificados

- ✅ `lib/types.ts` - Actualizado con nuevos campos en Movement
- ✅ `app/dashboard/entradas/page.tsx` - Formulario para agregar productos solamente
- ✅ `app/dashboard/stock/page.tsx` - Lista de productos agregados con su stock
- ✅ `app/dashboard/stock-salidas/page.tsx` - Historial completo de salidas
- ✅ `components/Layout/DashboardLayout.tsx` - Menú actualizado
- ✅ `supabase/schema_papas_fritas.sql` - Script SQL para actualizar la BD

## 🗑️ Archivos Eliminados

- ❌ `app/dashboard/products/` - Carpeta completa eliminada
- ❌ `app/dashboard/salidas/page.tsx` - Página de salidas eliminada

## 🚀 Uso de la Aplicación

### Flujo de Trabajo:

1. **Agregar Producto:**
   - Ve a "Agregar Producto"
   - Completa el formulario: Nombre, SKU, Unidad, etc.
   - Guarda el producto

2. **Ver Stocks:**
   - Ve a "Stocks"
   - Verás todos los productos agregados con su stock actual
   - Puedes filtrar por estado (Todos, Stock Bajo, Sin Stock)
   - Buscar productos por nombre, SKU o código de barras
   - Exportar a CSV si lo necesitas

3. **Ver Historial de Salidas:**
   - Ve a "Stock de Salidas"
   - Verás el historial completo de todas las salidas
   - Puedes filtrar por fecha y buscar
   - Exportar a CSV si lo necesitas

## ⚠️ Notas Importantes

- **Agregar Producto** solo crea productos, no registra entradas de stock
- **Stocks** muestra todos los productos agregados con su stock actual
- **Stock de Salidas** muestra el historial de salidas (las salidas se registran desde otra funcionalidad o sistema)
- Los productos se crean con stock inicial de 0

## 🔧 Solución de Problemas

Si encuentras errores al guardar movimientos:

1. Verifica que ejecutaste el script SQL en Supabase
2. Verifica que las columnas existen en la tabla `movements`:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'movements';
   ```
3. Verifica los permisos RLS (Row Level Security) en Supabase

## 📝 Próximos Pasos (Opcional)

- Agregar validaciones adicionales
- Mejorar reportes y gráficos
- Agregar notificaciones de stock bajo
- Integrar con sistema de facturación

