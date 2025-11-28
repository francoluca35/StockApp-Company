'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Search, ArrowUpCircle, Download, Calendar } from 'lucide-react'
import type { Movement } from '@/lib/types'

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

  const loadSalidas = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('movements')
        .select(`
          *,
          products (id, name, sku, unit, category)
        `)
        .eq('type', 'salida')
        .order('created_at', { ascending: false })

      // Filtrar por fechas si están definidas
      if (fechaDesde) {
        query = query.gte('fecha', fechaDesde)
      }
      if (fechaHasta) {
        query = query.lte('fecha', fechaHasta)
      }

      const { data, error } = await query

      if (error) throw error
      setSalidas(data || [])
    } catch (error) {
      console.error('Error loading salidas:', error)
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
    const headers = ['Fecha', 'Hora', 'Producto', 'SKU', 'Cantidad', 'Unidad', 'Despachado Por', 'Registrado']
    const rows = filteredSalidas.map((salida) => [
      salida.fecha ? new Date(salida.fecha).toLocaleDateString('es-AR') : 'N/A',
      salida.hora || 'N/A',
      salida.product?.name || 'N/A',
      salida.product?.sku || 'N/A',
      salida.quantity.toString(),
      salida.product?.unit || 'N/A',
      salida.despachado_por || 'N/A',
      new Date(salida.created_at).toLocaleString('es-AR'),
    ])

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
          <h1 className="text-3xl font-bold mb-2">Historial de Stock de Salidas</h1>
          <p className="text-gray-400">Historial completo de productos que salieron de la empresa</p>
        </div>
        <button
          onClick={exportToCSV}
          className="btn-secondary flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Exportar CSV
        </button>
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
            <label className="block text-xs text-gray-400 mb-1">Desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="text-sm text-gray-400 mb-1">Total de Salidas</div>
          <div className="text-2xl font-bold text-red-400">{filteredSalidas.length}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-400 mb-1">Cantidad Total</div>
          <div className="text-2xl font-bold text-red-400">{totalCantidad}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-400 mb-1">Período</div>
          <div className="text-sm font-medium">
            {fechaDesde || 'Inicio'} - {fechaHasta || 'Hoy'}
          </div>
        </div>
      </div>

      {/* Tabla de Salidas */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Fecha</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Hora</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Producto</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">SKU</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Cantidad</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Unidad</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Despachado Por</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Registrado</th>
              </tr>
            </thead>
            <tbody>
              {filteredSalidas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    No se encontraron salidas
                  </td>
                </tr>
              ) : (
                filteredSalidas.map((salida) => (
                  <tr
                    key={salida.id}
                    className="border-b border-dark-border hover:bg-dark-surface-light transition-colors"
                  >
                    <td className="py-3 px-4">
                      {salida.fecha ? new Date(salida.fecha).toLocaleDateString('es-AR') : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {salida.hora || 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {salida.product?.name || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-gray-400 font-mono text-sm">
                      {salida.product?.sku || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-red-400">
                      -{salida.quantity}
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-sm">
                      {salida.product?.unit || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <ArrowUpCircle className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{salida.despachado_por || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">
                      {new Date(salida.created_at).toLocaleString('es-AR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

