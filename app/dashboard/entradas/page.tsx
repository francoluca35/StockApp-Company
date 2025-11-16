'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Plus, Search, Package, ArrowDownCircle } from 'lucide-react'
import BarcodeScanner from '@/components/BarcodeScanner'
import type { Product } from '@/lib/types'

export default function EntradasPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [recentEntradas, setRecentEntradas] = useState<any[]>([])
  const [showNewProductForm, setShowNewProductForm] = useState(false)
  const [newProductData, setNewProductData] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: '',
    unit: 'unidad',
    min_stock: 0,
  })
  const supabase = createSupabaseClient()
  const router = useRouter()

  useEffect(() => {
    loadProducts()
    loadRecentEntradas()
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

  const loadRecentEntradas = async () => {
    try {
      // Cargar productos recientes en lugar de entradas
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)
      setRecentEntradas(data || [])
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const handleCreateProductAndEntrada = async () => {
    if (!newProductData.name || !newProductData.sku) {
      alert('Nombre y SKU son requeridos')
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      // Crear el producto
      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert({
          name: newProductData.name,
          sku: newProductData.sku.toUpperCase(),
          barcode: newProductData.barcode || null,
          category: newProductData.category || null,
          unit: newProductData.unit,
          min_stock: newProductData.min_stock,
          current_stock: 0,
        })
        .select()
        .single()

      if (productError) throw productError

      // Si hay cantidad, registrar la entrada
      if (quantity && parseInt(quantity) > 0) {
        const { error: movementError } = await supabase.from('movements').insert({
          product_id: newProduct.id,
          type: 'entrada',
          quantity: parseInt(quantity),
          reason: reason || 'Primera entrada - Producto nuevo',
          user_id: user.id,
        })

        if (movementError) throw movementError
      }

      // Reset form
      setSelectedProduct(newProduct)
      setShowNewProductForm(false)
      setNewProductData({
        name: '',
        sku: '',
        barcode: '',
        category: '',
        unit: 'unidad',
        min_stock: 0,
      })
      setQuantity('')
      setReason('')
      setSearchTerm('')
      loadProducts()
      loadRecentEntradas()
      router.refresh()
    } catch (error: any) {
      console.error('Error creating product:', error)
      alert(error.message || 'Error al crear el producto')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const { error } = await supabase.from('movements').insert({
        product_id: selectedProduct.id,
        type: 'entrada',
        quantity: parseInt(quantity),
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
      loadRecentEntradas()
      router.refresh()
    } catch (error: any) {
      console.error('Error creating entrada:', error)
      alert(error.message || 'Error al registrar la entrada')
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
        <h1 className="text-3xl font-bold mb-2">Agregar Nuevo Producto</h1>
        <p className="text-gray-400">Crea un nuevo producto y registra su primera entrada al inventario</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <Plus className="w-6 h-6 text-neon-green" />
            <h2 className="text-xl font-bold">Crear Producto</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Buscar Producto Existente (opcional)
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Si el producto ya existe, búscalo aquí. Si no existe, crea uno nuevo abajo.
              </p>
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

              {searchTerm && !selectedProduct && (
                <>
                  {filteredProducts.length > 0 ? (
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
                  ) : (
                    <div className="mt-2 p-4 border border-dark-border rounded-lg bg-dark-surface-light">
                      <p className="text-sm text-gray-400 mb-3">
                        No se encontró el producto "{searchTerm}"
                      </p>
                      {!showNewProductForm ? (
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewProductForm(true)
                            setNewProductData({
                              ...newProductData,
                              name: searchTerm,
                              sku: searchTerm.toUpperCase().replace(/\s+/g, '-').substring(0, 20),
                            })
                          }}
                          className="btn-primary text-sm py-2 px-4"
                        >
                          <Plus className="w-4 h-4 inline mr-2" />
                          Crear Producto Nuevo
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium mb-1">Nombre *</label>
                            <input
                              type="text"
                              value={newProductData.name}
                              onChange={(e) => setNewProductData({ ...newProductData, name: e.target.value })}
                              className="input-field text-sm py-2"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-medium mb-1">SKU *</label>
                              <input
                                type="text"
                                value={newProductData.sku}
                                onChange={(e) => setNewProductData({ ...newProductData, sku: e.target.value.toUpperCase() })}
                                className="input-field text-sm py-2 font-mono"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1">Unidad</label>
                              <select
                                value={newProductData.unit}
                                onChange={(e) => setNewProductData({ ...newProductData, unit: e.target.value })}
                                className="input-field text-sm py-2"
                              >
                                <option value="unidad">Unidad</option>
                                <option value="kg">Kg</option>
                                <option value="g">g</option>
                                <option value="l">L</option>
                                <option value="ml">ml</option>
                                <option value="m">m</option>
                              </select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <label className="block text-xs font-medium mb-1">Cantidad Inicial (opcional)</label>
                              <input
                                type="number"
                                min="0"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="input-field text-sm py-2"
                                placeholder="0"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Si ingresas una cantidad, se registrará automáticamente como primera entrada
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={handleCreateProductAndEntrada}
                              className="btn-primary text-sm py-2 px-4 w-full"
                              disabled={loading}
                            >
                              {loading ? 'Creando...' : 'Crear Producto'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowNewProductForm(false)
                                setNewProductData({
                                  name: '',
                                  sku: '',
                                  barcode: '',
                                  category: '',
                                  unit: 'unidad',
                                  min_stock: 0,
                                })
                              }}
                              className="btn-secondary text-sm py-2 px-4"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {selectedProduct && (
                <div className="mt-2 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{selectedProduct.name}</div>
                      <div className="text-sm text-gray-400">
                        SKU: {selectedProduct.sku} | Stock actual: {selectedProduct.current_stock} {selectedProduct.unit}
                      </div>
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

            {selectedProduct && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Cantidad de Entrada (opcional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="input-field"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Si ingresas una cantidad, se registrará una entrada para este producto existente
                  </p>
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
                    placeholder="Ej: Compra, Devolución, Ajuste..."
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full flex items-center justify-center gap-2"
                  disabled={loading || (quantity && parseInt(quantity) <= 0)}
                >
                  <Plus className="w-5 h-5" />
                  {loading ? 'Registrando...' : quantity ? 'Registrar Entrada' : 'Solo Ver Producto'}
                </button>
              </>
            )}
          </form>
        </div>

        {/* Recent Products */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Productos Creados Recientemente</h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-hide">
            {recentEntradas.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay productos creados</p>
            ) : (
              recentEntradas.map((product: Product) => (
                <div
                  key={product.id}
                  className="p-4 bg-dark-surface-light rounded-lg border border-dark-border"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-400">
                        SKU: {product.sku}
                      </div>
                      {product.barcode && (
                        <div className="text-xs text-gray-500 mt-1">
                          Código: {product.barcode}
                        </div>
                      )}
                    </div>
                    <span className="px-2 py-1 bg-neon-green/20 text-neon-green rounded text-xs font-medium">
                      Stock: {product.current_stock}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Creado: {new Date(product.created_at).toLocaleString('es-AR')}
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

