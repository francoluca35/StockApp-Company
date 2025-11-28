'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Search, ArrowUpCircle, Download, Calendar, RefreshCw } from 'lucide-react'
import type { Movement } from '@/lib/types'
import Swal from 'sweetalert2'

export default function StockSalidasPage() {
  const [salidas, setSalidas] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadSalidas()
  }, [fechaDesde, fechaHasta])

  // Recargar cuando la página se vuelve visible (por si se hizo una venta en otra pestaña)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadSalidas()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const loadSalidas = async () => {
    try {
      setLoading(true)
      
      // Primero intentar con la relación
      let query = supabase
        .from('movements')
        .select(`
          *,
          products (id, name, sku, unit, category, price)
        `)
        .eq('type', 'salida')
        .order('created_at', { ascending: false })

      // Filtrar por fechas si están definidas
      if (fechaDesde) {
        query = query.gte('created_at', `${fechaDesde}T00:00:00`)
      }
      if (fechaHasta) {
        query = query.lte('created_at', `${fechaHasta}T23:59:59`)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error en la consulta con relación:', error)
        // Intentar sin relación como fallback
        console.log('Intentando consulta sin relación...')
        const { data: dataSimple, error: errorSimple } = await supabase
          .from('movements')
          .select('*')
          .eq('type', 'salida')
          .order('created_at', { ascending: false })
        
        if (errorSimple) {
          throw errorSimple
        }
        
        // Cargar productos por separado
        if (dataSimple && dataSimple.length > 0) {
          const productIds = [...new Set(dataSimple.map((m: any) => m.product_id))]
          const { data: productsData } = await supabase
            .from('products')
            .select('id, name, sku, unit, category, price')
            .in('id', productIds)
          
          const productsMap = new Map(productsData?.map((p: any) => [p.id, p]) || [])
          
          const dataWithProducts = dataSimple.map((movement: any) => ({
            ...movement,
            product: productsMap.get(movement.product_id) || null
          }))
          
          console.log('Salidas cargadas (sin relación):', dataWithProducts.length)
          setSalidas(dataWithProducts)
          return
        }
        
        setSalidas([])
        return
      }
      
      console.log('Salidas cargadas:', data?.length || 0)
      
      // Verificar estructura de datos
      if (data && data.length > 0) {
        console.log('Primera salida de ejemplo:', data[0])
        const firstItem = data[0] as any
        if (!firstItem.product && !firstItem.products) {
          console.warn('Los datos no tienen la relación de productos cargada')
        }
      }
      
      // Normalizar la estructura (puede venir como 'product' o 'products')
      const normalizedData = (data || []).map((item: any) => ({
        ...item,
        product: item.product || item.products || null
      }))
      
      setSalidas(normalizedData)
    } catch (error: any) {
      console.error('Error loading salidas:', error)
      Swal.fire({
        title: 'Error',
        text: error.message || 'Error al cargar el historial de salidas. Verifica la consola para más detalles.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredSalidas = salidas.filter((salida) => {
    const product = salida.product
    if (!product) return false
    
    const searchLower = searchTerm.toLowerCase()
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.sku.toLowerCase().includes(searchLower) ||
      salida.despachado_por?.toLowerCase().includes(searchLower) ||
      salida.fecha?.includes(searchLower)
    )
  })

  const exportToCSV = () => {
    const headers = ['Fecha', 'Hora', 'Producto', 'SKU', 'Cantidad', 'Unidad', 'Precio Unitario', 'Total', 'Despachado Por', 'Registrado']
    const rows = filteredSalidas.map((salida) => {
      const unitPrice = salida.product?.price || 0
      const total = unitPrice * salida.quantity
      return [
        salida.fecha ? new Date(salida.fecha).toLocaleDateString('es-AR') : 'N/A',
        salida.hora || 'N/A',
        salida.product?.name || 'N/A',
        salida.product?.sku || 'N/A',
        salida.quantity.toString(),
        salida.product?.unit || 'N/A',
        `$${unitPrice.toFixed(2)}`,
        `$${total.toFixed(2)}`,
        salida.despachado_por || 'N/A',
        new Date(salida.created_at).toLocaleString('es-AR'),
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `stock_salidas_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const totalCantidad = filteredSalidas.reduce((sum, salida) => sum + salida.quantity, 0)
  const totalVentas = filteredSalidas.reduce((sum, salida) => {
    const unitPrice = salida.product?.price || 0
    return sum + (unitPrice * salida.quantity)
  }, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-green"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 dark:text-white text-gray-900">Historial de Stock de Salidas</h1>
          <p className="dark:text-gray-400 text-gray-600">Historial completo de productos que salieron de la empresa</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadSalidas}
            className="btn-secondary flex items-center gap-2"
            title="Refrescar"
          >
            <RefreshCw className="w-5 h-5" />
            Refrescar
          </button>
          <button
            onClick={exportToCSV}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
                placeholder="Buscar por producto, SKU, despachado por..."
              />
            </div>
          </div>
          <div>
            <label className="block text-xs dark:text-gray-400 text-gray-600 mb-1">Desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs dark:text-gray-400 text-gray-600 mb-1">Hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="input-field"
            />
          </div>
          {(fechaDesde || fechaHasta) && (
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFechaDesde('')
                  setFechaHasta('')
                }}
                className="btn-secondary w-full"
              >
                Limpiar Filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-sm dark:text-gray-400 text-gray-600 mb-1">Total de Salidas</div>
          <div className="text-2xl font-bold text-red-400">{filteredSalidas.length}</div>
        </div>
        <div className="card">
          <div className="text-sm dark:text-gray-400 text-gray-600 mb-1">Cantidad Total</div>
          <div className="text-2xl font-bold text-red-400">{totalCantidad}</div>
        </div>
        <div className="card">
          <div className="text-sm dark:text-gray-400 text-gray-600 mb-1">Total Ventas</div>
          <div className="text-2xl font-bold text-neon-green">${totalVentas.toFixed(2)}</div>
        </div>
        <div className="card">
          <div className="text-sm dark:text-gray-400 text-gray-600 mb-1">Período</div>
          <div className="text-sm font-medium dark:text-white text-gray-900">
            {fechaDesde || 'Inicio'} - {fechaHasta || 'Hoy'}
          </div>
        </div>
      </div>

      {/* Tabla de Salidas */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-dark-border border-light-border">
                <th className="text-left py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">Fecha</th>
                <th className="text-left py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">Hora</th>
                <th className="text-left py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">Producto</th>
                <th className="text-left py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">SKU</th>
                <th className="text-right py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">Cantidad</th>
                <th className="text-right py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">Precio Unit.</th>
                <th className="text-right py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">Total</th>
                <th className="text-left py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">Despachado Por</th>
              </tr>
            </thead>
            <tbody>
              {filteredSalidas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 dark:text-gray-500 text-gray-500">
                    No se encontraron salidas
                  </td>
                </tr>
              ) : (
                filteredSalidas.map((salida) => {
                  const unitPrice = salida.product?.price || 0
                  const total = unitPrice * salida.quantity
                  return (
                    <tr
                      key={salida.id}
                      className="border-b dark:border-dark-border border-light-border dark:hover:bg-dark-surface-light hover:bg-light-surface-light transition-colors"
                    >
                      <td className="py-3 px-4 dark:text-white text-gray-900">
                        {salida.fecha 
                          ? new Date(salida.fecha).toLocaleDateString('es-AR')
                          : new Date(salida.created_at).toLocaleDateString('es-AR')
                        }
                      </td>
                      <td className="py-3 px-4 dark:text-gray-400 text-gray-600">
                        {salida.hora 
                          ? salida.hora
                          : new Date(salida.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
                        }
                      </td>
                      <td className="py-3 px-4 font-medium dark:text-white text-gray-900">
                        {salida.product?.name || 'N/A'}
                      </td>
                      <td className="py-3 px-4 dark:text-gray-400 text-gray-600 font-mono text-sm">
                        {salida.product?.sku || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-red-400">
                        -{salida.quantity}
                      </td>
                      <td className="py-3 px-4 text-right dark:text-gray-400 text-gray-600">
                        ${unitPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-neon-green">
                        ${total.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <ArrowUpCircle className="w-4 h-4 dark:text-gray-400 text-gray-600" />
                          <span className="text-sm dark:text-white text-gray-900">{salida.despachado_por || 'N/A'}</span>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

