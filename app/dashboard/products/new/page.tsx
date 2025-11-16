'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function NewProductPage() {
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    barcode: '',
    category: '',
    unit: 'unidad',
    min_stock: 0,
    max_stock: '',
    price: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from('products').insert({
        name: formData.name,
        description: formData.description || null,
        sku: formData.sku,
        barcode: formData.barcode || null,
        category: formData.category || null,
        unit: formData.unit,
        min_stock: formData.min_stock,
        max_stock: formData.max_stock ? parseInt(formData.max_stock) : null,
        price: formData.price ? parseFloat(formData.price) : null,
        current_stock: 0,
      })

      if (error) throw error

      router.push('/dashboard/products')
    } catch (error: any) {
      console.error('Error creating product:', error)
      alert(error.message || 'Error al crear el producto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/products"
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold mb-2">Nuevo Producto</h1>
          <p className="text-gray-400">Agrega un nuevo producto al inventario</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card max-w-2xl">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Nombre del Producto *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="Ej: Tornillo M8x20"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Descripción opcional del producto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">SKU *</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                className="input-field font-mono"
                placeholder="SKU-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Código de Barras</label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="input-field font-mono"
                placeholder="1234567890123"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Categoría</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
                placeholder="Ej: Herrajes"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Unidad *</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="input-field"
              >
                <option value="unidad">Unidad</option>
                <option value="kg">Kilogramo</option>
                <option value="g">Gramo</option>
                <option value="l">Litro</option>
                <option value="ml">Mililitro</option>
                <option value="m">Metro</option>
                <option value="cm">Centímetro</option>
                <option value="m2">Metro cuadrado</option>
                <option value="m3">Metro cúbico</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Stock Mínimo *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.min_stock}
                onChange={(e) => setFormData({ ...formData, min_stock: parseInt(e.target.value) || 0 })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Stock Máximo</label>
              <input
                type="number"
                min="0"
                value={formData.max_stock}
                onChange={(e) => setFormData({ ...formData, max_stock: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Precio Unitario</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="input-field"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-dark-border">
            <Link href="/dashboard/products" className="btn-secondary">
              Cancelar
            </Link>
            <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
              <Save className="w-5 h-5" />
              {loading ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

