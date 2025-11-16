'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react'
import Link from 'next/link'
import type { Product } from '@/lib/types'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name')

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return

    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      loadProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Error al eliminar el producto')
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        <h1 className="text-3xl font-bold mb-2">Productos</h1>
        <p className="text-gray-400">Lista de productos - Edita o elimina productos existentes</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, SKU o código de barras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Nombre</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">SKU</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Código Barras</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Categoría</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Stock</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Unidad</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    {searchTerm ? 'No se encontraron productos' : 'No hay productos registrados'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-dark-border hover:bg-dark-surface-light transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium">{product.name}</div>
                      {product.description && (
                        <div className="text-sm text-gray-500">{product.description}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm">{product.sku}</span>
                    </td>
                    <td className="py-3 px-4">
                      {product.barcode ? (
                        <span className="font-mono text-sm">{product.barcode}</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {product.category || <span className="text-gray-500">-</span>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold ${
                            product.current_stock <= product.min_stock
                              ? 'text-red-400'
                              : 'text-white'
                          }`}
                        >
                          {product.current_stock}
                        </span>
                        {product.current_stock <= product.min_stock && (
                          <span className="text-xs text-red-400">⚠ Bajo</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Mín: {product.min_stock}
                      </div>
                    </td>
                    <td className="py-3 px-4">{product.unit}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/products/${product.id}/edit`}
                          className="p-2 text-gray-400 hover:text-neon-green transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

