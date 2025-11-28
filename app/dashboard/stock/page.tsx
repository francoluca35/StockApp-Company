'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Search, Package, Download, AlertTriangle, Trash2, Edit, X } from 'lucide-react'
import type { Product } from '@/lib/types'
import Swal from 'sweetalert2'

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [newStock, setNewStock] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadProducts()
  }, [filter])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('name')
      
      // Filtrar en el cliente ya que Supabase no permite comparar columnas directamente
      let filtered = data || []
      if (filter === 'low') {
        filtered = filtered.filter(p => p.current_stock <= p.min_stock && p.current_stock > 0)
      } else if (filter === 'out') {
        filtered = filtered.filter(p => p.current_stock === 0)
      }
      
      setProducts(filtered)
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

  const exportToCSV = () => {
    const headers = ['Producto', 'SKU', 'Código de Barras', 'Categoría', 'Stock Actual', 'Unidad', 'Stock Mínimo', 'Creado']
    const rows = filteredProducts.map((product) => [
      product.name,
      product.sku,
      product.barcode || 'N/A',
      product.category || 'N/A',
      product.current_stock.toString(),
      product.unit,
      product.min_stock.toString(),
      new Date(product.created_at).toLocaleDateString('es-AR'),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `stock_productos_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDeleteProduct = async (productId: string, productName: string) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el producto "${productName}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    })

    if (!result.isConfirmed) {
      return
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error

      // Recargar la lista de productos
      await loadProducts()
      
      Swal.fire({
        title: '¡Eliminado!',
        text: 'El producto ha sido eliminado correctamente.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })
    } catch (error) {
      console.error('Error deleting product:', error)
      Swal.fire({
        title: 'Error',
        text: 'Error al eliminar el producto',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      })
    }
  }

  const handleEditStock = (product: Product) => {
    setEditingProduct(product)
    setNewStock(product.current_stock.toString())
    setIsEditing(true)
  }

  const handleSaveStock = async () => {
    if (!editingProduct) return

    const stockValue = parseInt(newStock)
    if (isNaN(stockValue) || stockValue < 0) {
      Swal.fire({
        title: 'Error de validación',
        text: 'Por favor ingresa un valor de stock válido (número mayor o igual a 0)',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      })
      return
    }

    // Confirmar antes de guardar
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas actualizar el stock de "${editingProduct.name}" a ${stockValue} ${editingProduct.unit}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    })

    if (!result.isConfirmed) {
      return
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({ current_stock: stockValue })
        .eq('id', editingProduct.id)

      if (error) throw error

      // Cerrar el modal y recargar productos
      setIsEditing(false)
      setEditingProduct(null)
      setNewStock('')
      await loadProducts()
      
      Swal.fire({
        title: '¡Actualizado!',
        text: 'El stock ha sido actualizado correctamente.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })
    } catch (error) {
      console.error('Error updating stock:', error)
      Swal.fire({
        title: 'Error',
        text: 'Error al actualizar el stock',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      })
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditingProduct(null)
    setNewStock('')
  }

  const lowStockCount = products.filter(p => p.current_stock <= p.min_stock && p.current_stock > 0).length
  const outOfStockCount = products.filter(p => p.current_stock === 0).length
  const totalProducts = products.length

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
          <h1 className="text-3xl font-bold mb-2">Stocks</h1>
          <p className="text-gray-400">Lista de todos los productos agregados al inventario</p>
        </div>
        <button
          onClick={exportToCSV}
          className="btn-secondary flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Exportar CSV
        </button>
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
              Todos ({totalProducts})
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

      {/* Products Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Producto</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">SKU</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Código</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Categoría</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Stock Actual</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Unidad</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Stock Mínimo</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Estado</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-500">
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isLowStock = product.current_stock <= product.min_stock && product.current_stock > 0
                  const isOutOfStock = product.current_stock === 0

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-dark-border hover:bg-dark-surface-light transition-colors"
                    >
                      <td className="py-3 px-4 font-medium">
                        {product.name}
                      </td>
                      <td className="py-3 px-4 text-gray-400 font-mono text-sm">
                        {product.sku}
                      </td>
                      <td className="py-3 px-4 text-gray-400 font-mono text-sm">
                        {product.barcode || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-sm">
                        {product.category || '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        <span
                          className={
                            isOutOfStock
                              ? 'text-red-400'
                              : isLowStock
                              ? 'text-orange-400'
                              : 'text-neon-green'
                          }
                        >
                          {product.current_stock}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-sm">
                        {product.unit}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-400 text-sm">
                        {product.min_stock}
                      </td>
                      <td className="py-3 px-4">
                        {isOutOfStock ? (
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" />
                            Sin Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs font-medium flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" />
                            Stock Bajo
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-neon-green/20 text-neon-green rounded text-xs font-medium">
                            OK
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditStock(product)}
                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                            title="Editar stock"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Modal para editar stock */}
      {isEditing && editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Editar Stock</h2>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <div className="p-3 bg-dark-surface-light rounded-lg mb-4">
                <div className="font-medium text-white">{editingProduct.name}</div>
                <div className="text-sm text-gray-400 mt-1">
                  SKU: {editingProduct.sku}
                </div>
                <div className="text-sm text-gray-400">
                  Stock actual: <span className="text-neon-green font-bold">{editingProduct.current_stock}</span> {editingProduct.unit}
                </div>
              </div>

              <label className="block text-sm font-medium mb-2">
                Nuevo Stock *
              </label>
              <input
                type="number"
                min="0"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                className="input-field w-full"
                placeholder="Ingresa el nuevo stock"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Unidad: {editingProduct.unit}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelEdit}
                className="flex-1 px-4 py-2 bg-dark-surface-light text-gray-400 rounded-lg hover:bg-dark-border transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveStock}
                className="flex-1 px-4 py-2 bg-neon-green text-black rounded-lg hover:bg-neon-green/90 transition-colors font-medium"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
