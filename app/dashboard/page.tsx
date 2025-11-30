'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Package, ArrowDownCircle, ArrowUpCircle, AlertTriangle, DollarSign, TrendingUp, Clock, ExternalLink, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import type { Product, Movement } from '@/lib/types'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    lowStockProducts: [] as Product[],
    productosNuevos30Dias: 0,
    totalVentas: 0,
    totalDineroIngreso: 0,
    totalProductosVendidos: 0,
  })
  const [recentMovements, setRecentMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDateTime, setCurrentDateTime] = useState(new Date())
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadDashboardData()
    
    // Actualizar fecha y hora cada segundo
    const interval = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)

    // Recargar cuando la página se vuelve visible (por si se hizo una entrada en otra pestaña)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadDashboardData()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // 1. Total de productos (cantidad de productos diferentes)
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      // 2. Productos con stock bajo (con nombres para el tooltip)
      const { data: allProducts } = await supabase
        .from('products')
        .select('*')
        .order('name')

      const lowStockProducts = (allProducts || []).filter(
        p => p.current_stock <= p.min_stock && p.current_stock > 0
      )

      // 3. Productos nuevos agregados en los últimos 30 días
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { count: productosNuevos } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString())

      // 4. Ventas (salidas) de los últimos 30 días
      const { data: salidas30Dias } = await supabase
        .from('movements')
        .select(`
          *,
          products (id, name, price)
        `)
        .eq('type', 'salida')
        .gte('created_at', thirtyDaysAgo.toISOString())

      // Calcular estadísticas de ventas
      const totalVentas = salidas30Dias?.length || 0
      const totalProductosVendidos = salidas30Dias?.reduce((sum, s) => sum + s.quantity, 0) || 0
      
      // Calcular total de ingresos (dinero de ventas en los últimos 30 días)
      let totalDineroIngreso = 0
      if (salidas30Dias && salidas30Dias.length > 0) {
        // Verificar si los productos se cargaron en la relación
        const hasProducts = salidas30Dias.some((s: any) => s.product || s.products)
        
        if (!hasProducts) {
          // Si no se cargaron, cargar todos los productos necesarios de una vez
          const productIds = [...new Set(salidas30Dias.map((s: any) => s.product_id))]
          const { data: productsData } = await supabase
            .from('products')
            .select('id, price')
            .in('id', productIds)
          
          const productsMap = new Map(productsData?.map((p: any) => [p.id, p]) || [])
          
          totalDineroIngreso = salidas30Dias.reduce((sum, s: any) => {
            const product = productsMap.get(s.product_id)
            const price = product?.price || 0
            return sum + (price * s.quantity)
          }, 0)
        } else {
          // Si se cargaron en la relación, usar esos datos
          totalDineroIngreso = salidas30Dias.reduce((sum, s: any) => {
            const product = s.product || s.products
            const price = product?.price || 0
            return sum + (price * s.quantity)
          }, 0)
        }
      }

      // 5. Movimientos recientes (últimos 10)
      let recent: any[] = []
      
      // Intentar con relación primero
      const { data: recentWithRelation, error: recentError } = await supabase
        .from('movements')
        .select(`
          *,
          products (id, name, sku, unit, price),
          users (email, name)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (recentError) {
        console.error('Error loading recent movements with relation:', recentError)
        // Fallback: cargar sin relación
        const { data: recentSimple } = await supabase
          .from('movements')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10)
        
        if (recentSimple && recentSimple.length > 0) {
          // Cargar productos y usuarios por separado
          const productIds = [...new Set(recentSimple.map((m: any) => m.product_id))]
          const userIds = [...new Set(recentSimple.map((m: any) => m.user_id))]
          
          const { data: productsData } = await supabase
            .from('products')
            .select('id, name, sku, unit, price')
            .in('id', productIds)
          
          const { data: usersData } = await supabase
            .from('users')
            .select('id, email, name')
            .in('id', userIds)
          
          const productsMap = new Map(productsData?.map((p: any) => [p.id, p]) || [])
          const usersMap = new Map(usersData?.map((u: any) => [u.id, u]) || [])
          
          recent = recentSimple.map((movement: any) => ({
            ...movement,
            product: productsMap.get(movement.product_id) || null,
            user: usersMap.get(movement.user_id) || null,
          }))
        }
      } else {
        recent = recentWithRelation || []
      }

      // Normalizar los datos para manejar tanto 'products' como 'product'
      const normalizedRecent = recent.map((movement: any) => {
        const product = movement.product || movement.products || null
        const user = movement.user || movement.users || null
        
        // Debug: verificar si los productos se están cargando
        if (!product) {
          console.warn('Movement sin producto:', {
            movementId: movement.id,
            productId: movement.product_id,
            type: movement.type,
            movement: movement
          })
        }
        
        return {
          ...movement,
          product,
          user,
        }
      })
      
      console.log('Movimientos recientes cargados:', normalizedRecent.length)
      console.log('Tipos de movimientos:', normalizedRecent.map((m: any) => m.type))
      if (normalizedRecent.length > 0) {
        console.log('Primeros 3 movimientos:', normalizedRecent.slice(0, 3))
      }

      setStats({
        totalProducts: productCount || 0,
        lowStockCount: lowStockProducts.length,
        lowStockProducts,
        productosNuevos30Dias: productosNuevos || 0,
        totalVentas,
        totalDineroIngreso,
        totalProductosVendidos,
      })
      setRecentMovements(normalizedRecent as Movement[])
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (date: Date) => {
    return {
      date: date.toLocaleDateString('es-AR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('es-AR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-green"></div>
      </div>
    )
  }

  const { date, time } = formatDateTime(currentDateTime)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 dark:text-white text-gray-900">Dashboard</h1>
        <p className="dark:text-gray-400 text-gray-600">Resumen de tu inventario</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Productos"
          value={stats.totalProducts}
          icon={Package}
          color="blue"
          description="Productos diferentes en el inventario"
        />
        
        <StatCardWithTooltip
          title="Stock Bajo"
          value={stats.lowStockCount}
          icon={AlertTriangle}
          color="red"
          tooltipContent={
            stats.lowStockProducts.length > 0 ? (
              <div className="space-y-1">
                <p className="font-semibold mb-2">Productos con stock bajo:</p>
                {stats.lowStockProducts.map((p) => (
                  <div key={p.id} className="text-sm">
                    • {p.name} - Stock: {p.current_stock} {p.unit}
                  </div>
                ))}
              </div>
            ) : (
              <p>No hay productos con stock bajo</p>
            )
          }
          link="/dashboard/stock?filter=low"
        />
        
        <StatCard
          title="Productos Nuevos (30 días)"
          value={stats.productosNuevos30Dias}
          icon={ArrowDownCircle}
          color="green"
          description="Productos agregados este mes"
        />
        
        <StatCard
          title="Ventas Realizadas"
          value={stats.totalVentas}
          icon={ArrowUpCircle}
          color="orange"
          description="Cantidad de ventas en los últimos 30 días"
        />
      </div>

      {/* Segunda fila de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Ingresos"
          value={`$${stats.totalDineroIngreso.toFixed(2)}`}
          icon={DollarSign}
          color="green"
          description="Dinero total de ventas (30 días)"
        />
        
        <StatCard
          title="Productos Vendidos"
          value={stats.totalProductosVendidos}
          icon={TrendingUp}
          color="blue"
          description="Cantidad total de productos vendidos"
        />
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm dark:text-gray-400 text-gray-600 mb-1">Fecha y Hora Actual</p>
              <p className="text-lg font-bold dark:text-white text-gray-900 capitalize">{date}</p>
              <p className="text-2xl font-bold text-neon-green mt-2">{time}</p>
            </div>
            <div className="p-3 rounded-lg border bg-neon-green/20 text-neon-green border-neon-green/30">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Historial de Movimientos Recientes */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold dark:text-white text-gray-900">Movimientos Recientes</h2>
          <div className="flex gap-2">
            <button 
              onClick={loadDashboardData}
              className="btn-secondary flex items-center gap-2"
              title="Refrescar movimientos"
            >
              <RefreshCw className="w-4 h-4" />
              Refrescar
            </button>
            <Link href="/dashboard/stock-salidas">
              <button className="btn-secondary flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Ver Historial Completo
              </button>
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-dark-border border-light-border">
                <th className="text-left py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">Fecha</th>
                <th className="text-left py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">Hora</th>
                <th className="text-left py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">Producto</th>
                <th className="text-left py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">SKU</th>
                <th className="text-left py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">Tipo</th>
                <th className="text-right py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">Cantidad</th>
                <th className="text-left py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">Usuario</th>
              </tr>
            </thead>
            <tbody>
              {recentMovements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center dark:text-gray-500 text-gray-500">
                    No hay movimientos recientes
                  </td>
                </tr>
              ) : (
                recentMovements.map((movement: any) => {
                  // Supabase devuelve la relación como 'products' (plural) o 'product' (singular)
                  const product = movement.product || movement.products || null
                  const user = movement.user || movement.users || null
                  const fecha = movement.fecha 
                    ? new Date(movement.fecha).toLocaleDateString('es-AR')
                    : new Date(movement.created_at).toLocaleDateString('es-AR')
                  const hora = movement.hora 
                    ? movement.hora
                    : new Date(movement.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
                  
                  return (
                    <tr
                      key={movement.id}
                      className="border-b dark:border-dark-border border-light-border dark:hover:bg-dark-surface-light hover:bg-light-surface-light transition-colors"
                    >
                      <td className="py-3 px-4 dark:text-white text-gray-900">{fecha}</td>
                      <td className="py-3 px-4 dark:text-gray-400 text-gray-600">{hora}</td>
                      <td className="py-3 px-4 font-medium dark:text-white text-gray-900">
                        {product?.name || 'N/A'}
                      </td>
                      <td className="py-3 px-4 dark:text-gray-400 text-gray-600 font-mono text-sm">
                        {product?.sku || 'N/A'}
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
                      <td className="py-3 px-4 text-right dark:text-white text-gray-900">
                        {movement.type === 'entrada' ? '+' : '-'}{movement.quantity}
                      </td>
                      <td className="py-3 px-4 text-sm dark:text-gray-400 text-gray-600">
                        {user?.name || user?.email || 'N/A'}
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

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  description,
  link,
}: {
  title: string
  value: number | string
  icon: React.ElementType
  color: string
  description?: string
  link?: string
}) {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  }

  const content = (
    <div className="card hover:border-neon-green/50 transition-all cursor-pointer h-full">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm dark:text-gray-400 text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold dark:text-white text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {description && (
            <p className="text-xs dark:text-gray-500 text-gray-500 mt-1">{description}</p>
          )}
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

function StatCardWithTooltip({
  title,
  value,
  icon: Icon,
  color,
  tooltipContent,
  link,
}: {
  title: string
  value: number
  icon: React.ElementType
  color: string
  tooltipContent: React.ReactNode
  link?: string
}) {
  const [showTooltip, setShowTooltip] = useState(false)
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  }

  const content = (
    <div 
      className="card hover:border-neon-green/50 transition-all cursor-pointer h-full relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm dark:text-gray-400 text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold dark:text-white text-gray-900">{value.toLocaleString()}</p>
        </div>
        <div className={`p-3 rounded-lg border ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {showTooltip && tooltipContent && (
        <div className="absolute z-50 left-0 top-full mt-2 w-80 max-h-64 overflow-y-auto p-4 dark:bg-dark-surface bg-light-surface border dark:border-dark-border border-light-border rounded-lg shadow-xl">
          <div className="text-sm dark:text-white text-gray-900">
            {tooltipContent}
          </div>
        </div>
      )}
    </div>
  )

  if (link) {
    return <Link href={link}>{content}</Link>
  }

  return content
}
