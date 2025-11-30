'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Plus, Search, Package, RefreshCw } from 'lucide-react'
import type { Product } from '@/lib/types'

export default function EntradasPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showNewProductForm, setShowNewProductForm] = useState(false)
  const [newProductData, setNewProductData] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: '',
    unit: 'unidad',
    min_stock: 0,
    price: '',
    initial_stock: 0,
  })
  const [updateProductData, setUpdateProductData] = useState({
    stock: '',
    price: '',
    barcode: '',
    sku: '',
    unit: 'unidad',
  })
  const supabase = createSupabaseClient()
  const router = useRouter()

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    // Cuando se selecciona un producto con stock 0, pre-llenar el formulario
    if (selectedProduct && selectedProduct.current_stock === 0) {
      setUpdateProductData({
        stock: '',
        price: selectedProduct.price?.toString() || '',
        barcode: selectedProduct.barcode || '',
        sku: selectedProduct.sku,
        unit: selectedProduct.unit,
      })
    }
  }, [selectedProduct])

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

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProductData.name || !newProductData.sku) {
      alert('Nombre y SKU son requeridos')
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const priceValue = newProductData.price ? parseFloat(newProductData.price) : null
      const initialStock = parseInt(newProductData.initial_stock.toString()) || 0

      // Crear el producto
      const { data: newProduct, error } = await supabase
        .from('products')
        .insert({
          name: newProductData.name,
          sku: newProductData.sku.toUpperCase(),
          barcode: newProductData.barcode || null,
          category: newProductData.category || null,
          unit: newProductData.unit,
          min_stock: newProductData.min_stock,
          price: priceValue,
          current_stock: initialStock,
        })
        .select()
        .single()

      if (error) throw error

      // Si se especificó stock inicial, registrar un movimiento de entrada
      if (initialStock > 0 && newProduct) {
        const now = new Date()
        const { error: movementError } = await supabase
          .from('movements')
          .insert({
            product_id: newProduct.id,
            type: 'entrada',
            quantity: initialStock,
            fecha: now.toISOString().split('T')[0],
            hora: now.toTimeString().slice(0, 5),
            user_id: user.id,
            reason: 'Producto nuevo',
          })

        if (movementError) {
          console.error('Error creating movement:', movementError)
          // No lanzar error, solo loguear, ya que el producto se creó correctamente
        }
      }

      // Reset form
      setShowNewProductForm(false)
      setNewProductData({
        name: '',
        sku: '',
        barcode: '',
        category: '',
        unit: 'unidad',
        min_stock: 0,
        price: '',
        initial_stock: 0,
      })
      setSearchTerm('')
      loadProducts()
      router.refresh()
      alert('Producto creado exitosamente')
    } catch (error: any) {
      console.error('Error creating product:', error)
      alert(error.message || 'Error al crear el producto')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProductStock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return

    if (!updateProductData.stock || parseInt(updateProductData.stock) <= 0) {
      alert('Debes ingresar una cantidad de stock válida')
      return
    }

    if (!updateProductData.sku) {
      alert('El SKU es requerido')
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const stockQuantity = parseInt(updateProductData.stock)
      const priceValue = updateProductData.price ? parseFloat(updateProductData.price) : null

      // Actualizar el producto
      const { error: updateError } = await supabase
        .from('products')
        .update({
          sku: updateProductData.sku.toUpperCase(),
          barcode: updateProductData.barcode || null,
          unit: updateProductData.unit,
          price: priceValue,
          current_stock: stockQuantity,
        })
        .eq('id', selectedProduct.id)

      if (updateError) throw updateError

      // Registrar entrada de movimiento si hay stock
      if (stockQuantity > 0) {
        const now = new Date()
        const { error: movementError } = await supabase
          .from('movements')
          .insert({
            product_id: selectedProduct.id,
            type: 'entrada',
            quantity: stockQuantity,
            fecha: now.toISOString().split('T')[0],
            hora: now.toTimeString().slice(0, 5),
            user_id: user.id,
            reason: 'Reposición de stock',
          })

        if (movementError) throw movementError
      }

      // Reset form
      setSelectedProduct(null)
      setUpdateProductData({
        stock: '',
        price: '',
        barcode: '',
        sku: '',
        unit: 'unidad',
      })
      setSearchTerm('')
      loadProducts()
      router.refresh()
      alert('Stock actualizado exitosamente')
    } catch (error: any) {
      console.error('Error updating product:', error)
      alert(error.message || 'Error al actualizar el producto')
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
        <h1 className="text-3xl font-bold mb-2">Agregar Producto</h1>
        <p className="text-gray-400">Crea nuevos productos o agrega stock a productos existentes sin stock</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <Plus className="w-6 h-6 text-neon-green" />
            <h2 className="text-xl font-bold">
              {selectedProduct && selectedProduct.current_stock === 0
                ? 'Agregar Stock a Producto'
                : 'Nuevo Producto'}
            </h2>
          </div>

          {selectedProduct && selectedProduct.current_stock === 0 ? (
            // Formulario para agregar stock a producto existente
            <form onSubmit={handleUpdateProductStock} className="space-y-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-4">
                <div className="font-medium text-blue-400">{selectedProduct.name}</div>
                <div className="text-sm text-gray-400 mt-1">
                  Stock actual: <span className="text-red-400 font-bold">0</span> {selectedProduct.unit}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Stock (Cantidad) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={updateProductData.stock}
                  onChange={(e) => setUpdateProductData({ ...updateProductData, stock: e.target.value })}
                  className="input-field"
                  placeholder="Ej: 100"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cantidad de stock a agregar
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Precio
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={updateProductData.price}
                  onChange={(e) => setUpdateProductData({ ...updateProductData, price: e.target.value })}
                  className="input-field"
                  placeholder="Ej: 1500.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  SKU *
                </label>
                <input
                  type="text"
                  value={updateProductData.sku}
                  onChange={(e) => setUpdateProductData({ ...updateProductData, sku: e.target.value.toUpperCase() })}
                  className="input-field font-mono"
                  placeholder="Ej: PAPAS-001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Código de Barras
                </label>
                <input
                  type="text"
                  value={updateProductData.barcode}
                  onChange={(e) => setUpdateProductData({ ...updateProductData, barcode: e.target.value })}
                  className="input-field"
                  placeholder="Ej: 1234567890123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Unidad *
                </label>
                <select
                  value={updateProductData.unit}
                  onChange={(e) => setUpdateProductData({ ...updateProductData, unit: e.target.value })}
                  className="input-field"
                >
                  <option value="unidad">Unidad</option>
                  <option value="kg">Kg</option>
                  <option value="g">g</option>
                  <option value="l">L</option>
                  <option value="ml">ml</option>
                  <option value="m">m</option>
                  <option value="paquete">Paquete</option>
                  <option value="caja">Caja</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  <RefreshCw className="w-5 h-5" />
                  {loading ? 'Actualizando...' : 'Actualizar Stock'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProduct(null)
                    setUpdateProductData({
                      stock: '',
                      price: '',
                      barcode: '',
                      sku: '',
                      unit: 'unidad',
                    })
                    setSearchTerm('')
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : !showNewProductForm ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Buscar Producto Existente (opcional)
                </label>
                <div className="relative">
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

                {searchTerm && (
                  <div className="mt-2 border border-dark-border rounded-lg bg-dark-surface-light max-h-60 overflow-y-auto">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => {
                            if (product.current_stock === 0) {
                              setSelectedProduct(product)
                            } else {
                              alert(`Este producto tiene stock (${product.current_stock} ${product.unit}). Solo puedes agregar stock a productos con stock 0.`)
                            }
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-dark-surface transition-colors border-b border-dark-border last:border-0 ${
                            product.current_stock === 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                          }`}
                        >
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-400">
                            SKU: {product.sku} | Stock: {product.current_stock} {product.unit}
                            {product.current_stock === 0 && (
                              <span className="ml-2 text-red-400 font-medium">(Sin stock - Click para agregar)</span>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No se encontró el producto "{searchTerm}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowNewProductForm(true)}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Crear Nuevo Producto
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  value={newProductData.name}
                  onChange={(e) => setNewProductData({ ...newProductData, name: e.target.value })}
                  className="input-field"
                  placeholder="Ej: Papas Fritas Clásicas"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={newProductData.sku}
                    onChange={(e) => setNewProductData({ ...newProductData, sku: e.target.value.toUpperCase() })}
                    className="input-field font-mono"
                    placeholder="Ej: PAPAS-001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Unidad *
                  </label>
                  <select
                    value={newProductData.unit}
                    onChange={(e) => setNewProductData({ ...newProductData, unit: e.target.value })}
                    className="input-field"
                  >
                    <option value="unidad">Unidad</option>
                    <option value="kg">Kg</option>
                    <option value="g">g</option>
                    <option value="l">L</option>
                    <option value="ml">ml</option>
                    <option value="m">m</option>
                    <option value="paquete">Paquete</option>
                    <option value="caja">Caja</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Código de Barras (opcional)
                </label>
                <input
                  type="text"
                  value={newProductData.barcode}
                  onChange={(e) => setNewProductData({ ...newProductData, barcode: e.target.value })}
                  className="input-field"
                  placeholder="Ej: 1234567890123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Categoría (opcional)
                </label>
                <input
                  type="text"
                  value={newProductData.category}
                  onChange={(e) => setNewProductData({ ...newProductData, category: e.target.value })}
                  className="input-field"
                  placeholder="Ej: Snacks, Bebidas..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Stock Mínimo
                </label>
                <input
                  type="number"
                  min="0"
                  value={newProductData.min_stock}
                  onChange={(e) => setNewProductData({ ...newProductData, min_stock: parseInt(e.target.value) || 0 })}
                  className="input-field"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Precio Unitario (opcional)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newProductData.price}
                  onChange={(e) => setNewProductData({ ...newProductData, price: e.target.value })}
                  className="input-field"
                  placeholder="Ej: 150.50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Precio de venta por unidad
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Stock Inicial (opcional)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newProductData.initial_stock}
                  onChange={(e) => setNewProductData({ ...newProductData, initial_stock: parseInt(e.target.value) || 0 })}
                  className="input-field"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Si especificas stock inicial, se registrará como entrada en movimientos
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  <Plus className="w-5 h-5" />
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
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Recent Products */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Productos Recientes</h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-hide">
            {products.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay productos creados</p>
            ) : (
              products
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 20)
                .map((product: Product) => (
                  <div
                    key={product.id}
                    className={`p-4 bg-dark-surface-light rounded-lg border ${
                      product.current_stock === 0
                        ? 'border-red-500/30 bg-red-500/5'
                        : 'border-dark-border'
                    }`}
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
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          product.current_stock === 0
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-neon-green/20 text-neon-green'
                        }`}
                      >
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
