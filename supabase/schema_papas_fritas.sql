-- Schema actualizado para empresa de papas fritas
-- Ejecuta este script en Supabase SQL Editor

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

-- Comentarios para documentación
COMMENT ON COLUMN public.movements.fecha IS 'Fecha del movimiento (entrada o salida)';
COMMENT ON COLUMN public.movements.hora IS 'Hora del movimiento';
COMMENT ON COLUMN public.movements.tiempo_produccion IS 'Tiempo de producción en minutos (solo para entradas)';
COMMENT ON COLUMN public.movements.despachado_por IS 'Nombre de quien despachó el producto (solo para salidas)';

