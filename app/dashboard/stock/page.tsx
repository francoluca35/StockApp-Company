'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Search, AlertTriangle, Package, Download } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import type { Product } from '@/lib/types'

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all')
  const searchParams = useSearchParams()
  const supabase = createSupabaseClient()

  useEffect(() => {
    const filterParam = searchParams.get('filter')
    if (filterParam === 'low') {
      setFilter('low')
    }
    loadProducts()
  }, [searchParams])

  useEffect(() => {
    loadProducts()
  }, [filter])

  const loadProducts = async () => {
    try {
      let query = supabase.from('products').select('*')

      if (filter === 'low') {
        query = query.lte('current_stock', supabase.raw('min_stock'))
      } else if (filter === 'out') {
        query = query.eq('current_stock', 0)
      }

      const { data } = await query.order('name')
      setProducts(data || [])
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const lowStockCount = products.filter(p => p.current_stock <= p.min_stock).length
  const outOfStockCount = products.filter(p => p.current_stock === 0).length

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
          <h1 className="text-3xl font-bold mb-2">Stock en Tiempo Real</h1>
          <p className="text-gray-400">Monitorea el estado de tu inventario</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
                placeholder="Buscar productos..."
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'all'
                  ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                  : 'bg-dark-surface-light text-gray-400 hover:text-white'
              }`}
            >
              Todos ({products.length})
            </button>
            <button
              onClick={() => setFilter('low')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'low'
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'bg-dark-surface-light text-gray-400 hover:text-white'
              }`}
            >
              Stock Bajo ({lowStockCount})
            </button>
            <button
              onClick={() => setFilter('out')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'out'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-dark-surface-light text-gray-400 hover:text-white'
              }`}
            >
              Sin Stock ({outOfStockCount})
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No se encontraron productos
          </div>
        ) : (
          filteredProducts.map((product) => {
            const stockPercentage = product.max_stock
              ? (product.current_stock / product.max_stock) * 100
              : null
            const isLowStock = product.current_stock <= product.min_stock
            const isOutOfStock = product.current_stock === 0

            return (
              <div
                key={product.id}
                className={`card hover:border-neon-green/50 transition-all ${
                  isOutOfStock
                    ? 'border-red-500/30 bg-red-500/5'
                    : isLowStock
                    ? 'border-orange-500/30 bg-orange-500/5'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                    <div className="text-sm text-gray-400 space-y-1">
                      <div>SKU: <span className="font-mono">{product.sku}</span></div>
                      {product.barcode && (
                        <div>Código: <span className="font-mono">{product.barcode}</span></div>
                      )}
                      {product.category && (
                        <div>Categoría: {product.category}</div>
                      )}
                    </div>
                  </div>
                  {isLowStock && (
                    <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  )}
                  {isOutOfStock && (
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Stock Actual</span>
                      <span
                        className={`text-2xl font-bold ${
                          isOutOfStock
                            ? 'text-red-400'
                            : isLowStock
                            ? 'text-orange-400'
                            : 'text-neon-green'
                        }`}
                      >
                        {product.current_stock}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.unit} • Mín: {product.min_stock}
                      {product.max_stock && ` • Máx: ${product.max_stock}`}
                    </div>
                  </div>

                  {stockPercentage !== null && (
                    <div>
                      <div className="w-full bg-dark-surface-light rounded-full h-2 mb-1">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            stockPercentage > 50
                              ? 'bg-neon-green'
                              : stockPercentage > 25
                              ? 'bg-orange-400'
                              : 'bg-red-400'
                          }`}
                          style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 text-right">
                        {stockPercentage.toFixed(0)}%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

