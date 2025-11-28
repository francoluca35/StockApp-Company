'use client'

import { useEffect, useState, useRef } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { ShoppingCart, Scan, Trash2, Plus, Minus, X, Search } from 'lucide-react'
import type { Product } from '@/lib/types'
import Swal from 'sweetalert2'

interface CartItem {
  product: Product
  quantity: number
  unitPrice: number
  total: number
}

export default function VentasPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [barcodeBuffer, setBarcodeBuffer] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const scanInputRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    if (isScanning && scanInputRef.current) {
      scanInputRef.current.focus()
    }
  }, [isScanning])

  // Detectar escaneo rápido de lectores USB
  useEffect(() => {
    if (barcodeBuffer.length > 0) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      if (barcodeBuffer.length >= 3) {
        timeoutRef.current = setTimeout(() => {
          if (barcodeBuffer.trim()) {
            handleBarcodeScan(barcodeBuffer.trim())
            setBarcodeBuffer('')
            if (scanInputRef.current) {
              scanInputRef.current.value = ''
            }
          }
        }, 100)
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [barcodeBuffer])

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

  const addProductToCart = (product: Product) => {
    if (product.current_stock <= 0) {
      Swal.fire({
        title: 'Sin stock',
        text: `El producto "${product.name}" no tiene stock disponible`,
        icon: 'error',
        confirmButtonColor: '#ef4444',
      })
      return
    }

    // Buscar si el producto ya está en el carrito
    const existingItemIndex = cart.findIndex(item => item.product.id === product.id)

    if (existingItemIndex >= 0) {
      // Si ya existe, aumentar la cantidad
      const updatedCart = [...cart]
      const currentItem = updatedCart[existingItemIndex]
      const newQuantity = currentItem.quantity + 1

      // Verificar stock disponible
      if (newQuantity > product.current_stock) {
        Swal.fire({
          title: 'Stock insuficiente',
          text: `Solo hay ${product.current_stock} ${product.unit} disponibles de "${product.name}"`,
          icon: 'warning',
          confirmButtonColor: '#ef4444',
        })
        return
      }

      updatedCart[existingItemIndex] = {
        ...currentItem,
        quantity: newQuantity,
        total: newQuantity * currentItem.unitPrice,
      }
      setCart(updatedCart)
    } else {
      // Si no existe, agregarlo al carrito
      const unitPrice = product.price || 0
      setCart([
        ...cart,
        {
          product,
          quantity: 1,
          unitPrice,
          total: unitPrice,
        },
      ])
    }
  }

  const handleBarcodeScan = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode)
    
    if (!product) {
      Swal.fire({
        title: 'Producto no encontrado',
        text: `No se encontró un producto con el código de barras: ${barcode}`,
        icon: 'warning',
        confirmButtonColor: '#ef4444',
      })
      return
    }

    addProductToCart(product)

    // Mantener el foco en el input para seguir escaneando
    setTimeout(() => {
      if (scanInputRef.current) {
        scanInputRef.current.focus()
      }
    }, 100)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBarcodeBuffer(e.target.value)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && scanInputRef.current?.value) {
      e.preventDefault()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      handleBarcodeScan(scanInputRef.current.value.trim())
      setBarcodeBuffer('')
      scanInputRef.current.value = ''
    }
  }

  const updateQuantity = (productId: string, change: number) => {
    const updatedCart = cart.map(item => {
      if (item.product.id === productId) {
        const newQuantity = item.quantity + change
        const product = item.product

        if (newQuantity <= 0) {
          return null
        }

        if (newQuantity > product.current_stock) {
          Swal.fire({
            title: 'Stock insuficiente',
            text: `Solo hay ${product.current_stock} ${product.unit} disponibles`,
            icon: 'warning',
            confirmButtonColor: '#ef4444',
          })
          return item
        }

        return {
          ...item,
          quantity: newQuantity,
          total: newQuantity * item.unitPrice,
        }
      }
      return item
    }).filter((item): item is CartItem => item !== null)

    setCart(updatedCart)
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId))
  }

  const handleVender = async () => {
    if (cart.length === 0) {
      Swal.fire({
        title: 'Carrito vacío',
        text: 'Agrega productos al carrito antes de vender',
        icon: 'warning',
        confirmButtonColor: '#ef4444',
      })
      return
    }

    // Verificar stock antes de vender
    for (const item of cart) {
      const product = products.find(p => p.id === item.product.id)
      if (!product || product.current_stock < item.quantity) {
        Swal.fire({
          title: 'Stock insuficiente',
          text: `El producto "${item.product.name}" no tiene suficiente stock`,
          icon: 'error',
          confirmButtonColor: '#ef4444',
        })
        return
      }
    }

    const result = await Swal.fire({
      title: '¿Confirmar venta?',
      html: `
        <div class="text-left">
          <p class="mb-2">Se registrarán ${cart.length} producto(s) en el historial de salidas.</p>
          <p class="font-bold text-lg">Total: $${total.toFixed(2)}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, vender',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    })

    if (!result.isConfirmed) {
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const now = new Date()
      const fecha = now.toISOString().split('T')[0]
      const hora = now.toTimeString().slice(0, 5)

      // Obtener nombre del usuario
      const { data: userData } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', user.id)
        .single()

      const despachadoPor = userData?.name || userData?.email || 'Usuario'

      // Registrar cada producto vendido
      const movements = cart.map(item => ({
        product_id: item.product.id,
        type: 'salida' as const,
        quantity: item.quantity,
        user_id: user.id,
        fecha,
        hora,
        despachado_por: despachadoPor,
        reason: 'Venta',
      }))

      const { error: movementsError } = await supabase
        .from('movements')
        .insert(movements)

      if (movementsError) throw movementsError

      await Swal.fire({
        title: '¡Venta realizada!',
        html: `
          <div class="text-left">
            <p class="mb-2">Se registraron ${cart.length} producto(s) en el historial.</p>
            <p class="font-bold text-lg">Total: $${total.toFixed(2)}</p>
          </div>
        `,
        icon: 'success',
        confirmButtonColor: '#10b981',
      })

      // Limpiar carrito y recargar productos
      setCart([])
      setBarcodeBuffer('')
      setIsScanning(false)
      if (scanInputRef.current) {
        scanInputRef.current.value = ''
      }
      await loadProducts()
    } catch (error: any) {
      console.error('Error processing sale:', error)
      Swal.fire({
        title: 'Error',
        text: error.message || 'Error al procesar la venta',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter((product) => {
    if (!searchTerm) return false
    const searchLower = searchTerm.toLowerCase()
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.sku.toLowerCase().includes(searchLower) ||
      product.barcode?.toLowerCase().includes(searchLower)
    )
  }).filter(product => product.current_stock > 0) // Solo mostrar productos con stock

  const total = cart.reduce((sum, item) => sum + item.total, 0)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShoppingCart className="w-8 h-8 text-neon-green" />
        <div>
          <h1 className="text-3xl font-bold dark:text-white text-gray-900">Venta Producto</h1>
          <p className="dark:text-gray-400 text-gray-600">Escanea productos para agregarlos a la venta</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Escáner de código de barras */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 dark:text-white text-gray-900">Escáner de Código de Barras</h2>
          {!isScanning ? (
            <button
              type="button"
              onClick={() => setIsScanning(true)}
              className="btn-secondary flex items-center gap-2 w-full"
            >
              <Scan className="w-5 h-5" />
              Activar Escáner
            </button>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <input
                  ref={scanInputRef}
                  type="text"
                  value={barcodeBuffer}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Escanea el código de barras o ingresa manualmente..."
                  className="input-field font-mono pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsScanning(false)
                    setBarcodeBuffer('')
                    if (scanInputRef.current) {
                      scanInputRef.current.value = ''
                    }
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 dark:text-gray-400 text-gray-600 hover:dark:text-white hover:text-gray-900"
                  title="Desactivar escáner"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs dark:text-gray-500 text-gray-500">
                Escanea con el lector o ingresa manualmente. Presiona Enter para confirmar.
              </p>
            </div>
          )}
        </div>

        {/* Búsqueda manual de productos */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 dark:text-white text-gray-900">Búsqueda Manual</h2>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-400 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, SKU o código de barras..."
                className="input-field pl-10"
              />
            </div>

            {searchTerm && filteredProducts.length > 0 && (
              <div className="max-h-64 overflow-y-auto space-y-2 border dark:border-dark-border border-light-border rounded-lg p-2">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 dark:bg-dark-surface-light bg-light-surface-light rounded-lg hover:dark:bg-dark-surface hover:bg-light-surface transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium dark:text-white text-gray-900">{product.name}</div>
                      <div className="text-sm dark:text-gray-400 text-gray-600">
                        SKU: {product.sku} | Stock: {product.current_stock} {product.unit}
                        {product.price && ` | $${product.price.toFixed(2)}`}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        addProductToCart(product)
                        setSearchTerm('')
                      }}
                      className="ml-3 p-2 bg-neon-green text-black rounded-lg hover:bg-neon-green-dark transition-colors"
                      title="Agregar al carrito"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {searchTerm && filteredProducts.length === 0 && (
              <div className="text-center py-8 dark:text-gray-500 text-gray-500">
                No se encontraron productos con stock disponible
              </div>
            )}

            {!searchTerm && (
              <div className="text-center py-8 dark:text-gray-400 text-gray-600">
                Ingresa un término de búsqueda para encontrar productos
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lista de productos en el carrito */}
      {cart.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4 dark:text-white text-gray-900">Productos en la Venta</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-dark-border border-light-border">
                  <th className="text-left py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">Producto</th>
                  <th className="text-left py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">SKU</th>
                  <th className="text-right py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">Cantidad</th>
                  <th className="text-right py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">Precio Unit.</th>
                  <th className="text-right py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">Total</th>
                  <th className="text-center py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr
                    key={item.product.id}
                    className="border-b dark:border-dark-border border-light-border dark:hover:bg-dark-surface-light hover:bg-light-surface-light transition-colors"
                  >
                    <td className="py-3 px-4 font-medium dark:text-white text-gray-900">
                      {item.product.name}
                    </td>
                    <td className="py-3 px-4 dark:text-gray-400 text-gray-600 font-mono text-sm">
                      {item.product.sku}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="p-1 dark:text-gray-400 text-gray-600 hover:dark:text-white hover:text-gray-900 rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-medium dark:text-white text-gray-900 w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="p-1 dark:text-gray-400 text-gray-600 hover:dark:text-white hover:text-gray-900 rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right dark:text-gray-400 text-gray-600">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium dark:text-white text-gray-900">
                      ${item.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors mx-auto block"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Resumen y total */}
      {cart.length > 0 && (
        <div className="card">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg dark:text-gray-400 text-gray-600">Total de productos:</span>
              <span className="text-lg font-bold dark:text-white text-gray-900">{totalItems}</span>
            </div>
            <div className="flex justify-between items-center border-t dark:border-dark-border border-light-border pt-4">
              <span className="text-2xl font-bold dark:text-white text-gray-900">Total a pagar:</span>
              <span className="text-3xl font-bold text-neon-green">${total.toFixed(2)}</span>
            </div>
            <button
              onClick={handleVender}
              disabled={loading || cart.length === 0}
              className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
            >
              <ShoppingCart className="w-6 h-6" />
              {loading ? 'Procesando...' : 'Vender'}
            </button>
          </div>
        </div>
      )}

      {cart.length === 0 && (
        <div className="card text-center py-12">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 dark:text-gray-600 text-gray-400" />
          <p className="text-lg dark:text-gray-400 text-gray-600">
            No hay productos en el carrito. Escanea productos para comenzar una venta.
          </p>
        </div>
      )}
    </div>
  )
}

