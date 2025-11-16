'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Search, ArrowUpCircle, AlertCircle } from 'lucide-react'
import BarcodeScanner from '@/components/BarcodeScanner'
import type { Product } from '@/lib/types'

export default function SalidasPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [recentSalidas, setRecentSalidas] = useState<any[]>([])
  const supabase = createSupabaseClient()
  const router = useRouter()

  useEffect(() => {
    loadProducts()
    loadRecentSalidas()
  }, [])

  const loadProducts = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('name')
      setProducts(data || [])
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const loadRecentSalidas = async () => {
    try {
      const { data } = await supabase
        .from('movements')
        .select(`
          *,
          products (name, sku),
          users (email)
        `)
        .eq('type', 'salida')
        .order('created_at', { ascending: false })
        .limit(20)
      setRecentSalidas(data || [])
    } catch (error) {
      console.error('Error loading salidas:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return

    const qty = parseInt(quantity)
    if (qty > selectedProduct.current_stock) {
      alert(`No hay suficiente stock. Stock disponible: ${selectedProduct.current_stock}`)
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const { error } = await supabase.from('movements').insert({
        product_id: selectedProduct.id,
        type: 'salida',
        quantity: qty,
        reason: reason || null,
        user_id: user.id,
      })

      if (error) throw error

      // Reset form
      setSelectedProduct(null)
      setQuantity('')
      setReason('')
      setSearchTerm('')
      loadProducts()
      loadRecentSalidas()
      router.refresh()
    } catch (error: any) {
      console.error('Error creating salida:', error)
      alert(error.message || 'Error al registrar la salida')
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Salidas de Productos</h1>
        <p className="text-gray-400">Registra salidas del inventario</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <ArrowUpCircle className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-bold">Nueva Salida</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Buscar Producto *
              </label>
              <BarcodeScanner
                onScan={(barcode) => {
                  const product = products.find(
                    (p) => p.barcode === barcode || p.sku === barcode
                  )
                  if (product) {
                    setSelectedProduct(product)
                    setSearchTerm(product.name)
                  } else {
                    setSearchTerm(barcode)
                  }
                }}
                disabled={loading}
              />
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setSelectedProduct(null)
                  }}
                  className="input-field pl-10"
                  placeholder="Buscar por nombre, SKU o código de barras..."
                />
              </div>

              {searchTerm && filteredProducts.length > 0 && !selectedProduct && (
                <div className="mt-2 border border-dark-border rounded-lg bg-dark-surface-light max-h-60 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        setSelectedProduct(product)
                        setSearchTerm(product.name)
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-dark-surface transition-colors border-b border-dark-border last:border-0"
                    >
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-400">
                        SKU: {product.sku} | Stock: {product.current_stock} {product.unit}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedProduct && (
                <div className="mt-2 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{selectedProduct.name}</div>
                      <div className="text-sm text-gray-400">
                        SKU: {selectedProduct.sku} | Stock disponible: {selectedProduct.current_stock} {selectedProduct.unit}
                      </div>
                      {selectedProduct.current_stock <= selectedProduct.min_stock && (
                        <div className="flex items-center gap-1 text-xs text-red-400 mt-1">
                          <AlertCircle className="w-3 h-3" />
                          Stock bajo
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProduct(null)
                        setSearchTerm('')
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Cantidad *
              </label>
              <input
                type="number"
                required
                min="1"
                max={selectedProduct?.current_stock || 0}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="input-field"
                placeholder="0"
                disabled={!selectedProduct}
              />
              {selectedProduct && (
                <div className="text-xs text-gray-500 mt-1">
                  Máximo: {selectedProduct.current_stock} {selectedProduct.unit}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Motivo (opcional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="input-field"
                rows={3}
                placeholder="Ej: Venta, Uso interno, Ajuste..."
                disabled={!selectedProduct}
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={loading || !selectedProduct || (selectedProduct && parseInt(quantity) > selectedProduct.current_stock)}
            >
              <ArrowUpCircle className="w-5 h-5" />
              {loading ? 'Registrando...' : 'Registrar Salida'}
            </button>
          </form>
        </div>

        {/* Recent Salidas */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Salidas Recientes</h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-hide">
            {recentSalidas.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay salidas registradas</p>
            ) : (
              recentSalidas.map((salida) => (
                <div
                  key={salida.id}
                  className="p-4 bg-dark-surface-light rounded-lg border border-dark-border"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium">{salida.products?.name}</div>
                      <div className="text-sm text-gray-400">
                        {salida.products?.sku}
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium">
                      -{salida.quantity}
                    </span>
                  </div>
                  {salida.reason && (
                    <div className="text-sm text-gray-500 mb-2">{salida.reason}</div>
                  )}
                  <div className="text-xs text-gray-500">
                    {new Date(salida.created_at).toLocaleString('es-AR')} • {salida.users?.email}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

