'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Package, ArrowDownCircle, ArrowUpCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import type { Product } from '@/lib/types'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    totalEntradas: 0,
    totalSalidas: 0,
  })
  const [recentMovements, setRecentMovements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Get total products
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      // Get low stock products
      const { data: lowStockProducts } = await supabase
        .from('products')
        .select('id')
        .lte('current_stock', supabase.raw('min_stock'))

      // Get movements from last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: movements } = await supabase
        .from('movements')
        .select('type, quantity')
        .gte('created_at', thirtyDaysAgo.toISOString())

      const entradas = movements?.filter(m => m.type === 'entrada').reduce((sum, m) => sum + m.quantity, 0) || 0
      const salidas = movements?.filter(m => m.type === 'salida').reduce((sum, m) => sum + m.quantity, 0) || 0

      // Get recent movements
      const { data: recent } = await supabase
        .from('movements')
        .select(`
          *,
          products (name, sku),
          users (email)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      setStats({
        totalProducts: productCount || 0,
        lowStock: lowStockProducts?.length || 0,
        totalEntradas: entradas,
        totalSalidas: salidas,
      })
      setRecentMovements(recent || [])
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-green"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400">Resumen de tu inventario</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Productos"
          value={stats.totalProducts}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Stock Bajo"
          value={stats.lowStock}
          icon={AlertTriangle}
          color="red"
          link="/dashboard/stock?filter=low"
        />
        <StatCard
          title="Entradas (30 días)"
          value={stats.totalEntradas}
          icon={ArrowDownCircle}
          color="green"
        />
        <StatCard
          title="Salidas (30 días)"
          value={stats.totalSalidas}
          icon={ArrowUpCircle}
          color="orange"
        />
      </div>

      {/* Recent Movements */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Movimientos Recientes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Fecha</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Producto</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Tipo</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Cantidad</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Usuario</th>
              </tr>
            </thead>
            <tbody>
              {recentMovements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No hay movimientos recientes
                  </td>
                </tr>
              ) : (
                recentMovements.map((movement) => (
                  <tr
                    key={movement.id}
                    className="border-b border-dark-border hover:bg-dark-surface-light transition-colors"
                  >
                    <td className="py-3 px-4">
                      {new Date(movement.created_at).toLocaleDateString('es-AR')}
                    </td>
                    <td className="py-3 px-4">
                      {movement.products?.name || 'N/A'}
                      <span className="text-xs text-gray-500 ml-2">
                        ({movement.products?.sku})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          movement.type === 'entrada'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {movement.type === 'entrada' ? 'Entrada' : 'Salida'}
                      </span>
                    </td>
                    <td className="py-3 px-4">{movement.quantity}</td>
                    <td className="py-3 px-4 text-sm text-gray-400">
                      {movement.users?.email || 'N/A'}
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

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  link,
}: {
  title: string
  value: number
  icon: React.ElementType
  color: string
  link?: string
}) {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  }

  const content = (
    <div className="card hover:border-neon-green/50 transition-all cursor-pointer">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value.toLocaleString()}</p>
        </div>
        <div className={`p-3 rounded-lg border ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )

  if (link) {
    return <Link href={link}>{content}</Link>
  }

  return content
}

