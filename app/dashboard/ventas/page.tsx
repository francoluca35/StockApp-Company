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
        title: '<span style="font-size: 18px; font-weight: 600; color: #ef4444;">⚠️ Sin Stock</span>',
        html: `
          <div style="text-align: center; padding: 10px 0;">
            <div style="font-size: 40px; margin-bottom: 10px;">📦</div>
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">
              El producto <strong style="color: #111827;">"${product.name}"</strong>
            </p>
            <p style="font-size: 15px; font-weight: 600; color: #ef4444;">
              no tiene stock disponible
            </p>
          </div>
        `,
        width: '400px',
        padding: '1.5rem',
        icon: 'error',
        iconColor: '#ef4444',
        confirmButtonColor: '#ef4444',
        confirmButtonText: '<span style="padding: 0 15px; font-size: 13px;">Entendido</span>',
        buttonsStyling: true,
        customClass: {
          popup: 'swal-popup-custom',
          confirmButton: 'swal-button-custom'
        }
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
          title: '<span style="font-size: 18px; font-weight: 600; color: #f59e0b;">⚠️ Stock Insuficiente</span>',
          html: `
            <div style="text-align: center; padding: 10px 0;">
              <div style="font-size: 40px; margin-bottom: 10px;">📊</div>
              <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">
                Producto: <strong style="color: #111827;">"${product.name}"</strong>
              </p>
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 6px; margin: 10px 0;">
                <p style="font-size: 15px; font-weight: 600; color: #92400e; margin: 0;">
                  Solo hay <span style="color: #f59e0b; font-size: 18px;">${product.current_stock}</span> ${product.unit} disponibles
                </p>
              </div>
            </div>
          `,
          width: '400px',
          padding: '1.5rem',
          icon: 'warning',
          iconColor: '#f59e0b',
          confirmButtonColor: '#f59e0b',
          confirmButtonText: '<span style="padding: 0 15px; font-size: 13px;">Entendido</span>',
          buttonsStyling: true,
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
        title: '<span style="font-size: 18px; font-weight: 600; color: #f59e0b;">🔍 Producto No Encontrado</span>',
        html: `
          <div style="text-align: center; padding: 10px 0;">
            <div style="font-size: 40px; margin-bottom: 10px;">❌</div>
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">
              No se encontró un producto con el código:
            </p>
            <div style="background: #f3f4f6; padding: 10px; border-radius: 6px; margin: 10px 0;">
              <p style="font-size: 16px; font-weight: 600; color: #111827; font-family: monospace; margin: 0;">
                ${barcode}
              </p>
            </div>
            <p style="font-size: 12px; color: #9ca3af; margin-top: 8px;">
              Verifica el código e intenta nuevamente
            </p>
          </div>
        `,
        width: '400px',
        padding: '1.5rem',
        icon: 'warning',
        iconColor: '#f59e0b',
        confirmButtonColor: '#6b7280',
        confirmButtonText: '<span style="padding: 0 15px; font-size: 13px;">Intentar de nuevo</span>',
        buttonsStyling: true,
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
            title: '<span style="font-size: 18px; font-weight: 600; color: #f59e0b;">⚠️ Stock Insuficiente</span>',
            html: `
              <div style="text-align: center; padding: 10px 0;">
                <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">
                  Solo hay <strong style="color: #111827; font-size: 16px;">${product.current_stock}</strong> ${product.unit} disponibles
                </p>
              </div>
            `,
            width: '380px',
            padding: '1.5rem',
            icon: 'warning',
            iconColor: '#f59e0b',
            confirmButtonColor: '#f59e0b',
            confirmButtonText: '<span style="padding: 0 15px; font-size: 13px;">Entendido</span>',
            buttonsStyling: true,
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

  const handleFacturaA = async () => {
    // Mostrar formulario para datos del cliente
    const { value: formValues } = await Swal.fire({
      title: '<span style="font-size: 18px; font-weight: 700; color: #3b82f6;">📄 Factura Tipo A</span>',
      html: `
        <div style="text-align: left; padding: 5px 0; max-height: 60vh; overflow-y: auto;">
          <p style="font-size: 12px; color: #6b7280; margin-bottom: 12px; text-align: center;">
            Complete los datos del cliente
          </p>
          
          <div style="display: grid; grid-template-columns: 1fr; gap: 10px;">
            <div>
              <label style="display: block; font-size: 11px; font-weight: 600; color: #374151; margin-bottom: 4px;">
                Razón Social / Nombre *
              </label>
              <input id="swal-cliente-nombre" class="swal2-input" placeholder="Nombre o Razón Social" style="width: 100%; padding: 8px; font-size: 13px; margin: 0;" required>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div>
                <label style="display: block; font-size: 11px; font-weight: 600; color: #374151; margin-bottom: 4px;">
                  CUIT *
                </label>
                <input id="swal-cliente-cuit" class="swal2-input" placeholder="20-12345678-9" style="width: 100%; padding: 8px; font-size: 13px; margin: 0;" required>
              </div>
              
              <div>
                <label style="display: block; font-size: 11px; font-weight: 600; color: #374151; margin-bottom: 4px;">
                  Condición IVA *
                </label>
                <select id="swal-cliente-condicion" class="swal2-input" style="width: 100%; padding: 8px; font-size: 13px; margin: 0;" required>
                  <option value="Resp. Inscripto">Resp. Inscripto</option>
                  <option value="Exento">Exento</option>
                  <option value="No Responsable">No Responsable</option>
                  <option value="Consumidor Final">Consumidor Final</option>
                </select>
              </div>
            </div>
            
            <div>
              <label style="display: block; font-size: 11px; font-weight: 600; color: #374151; margin-bottom: 4px;">
                Dirección
              </label>
              <input id="swal-cliente-direccion" class="swal2-input" placeholder="Calle y número" style="width: 100%; padding: 8px; font-size: 13px; margin: 0;">
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div>
                <label style="display: block; font-size: 11px; font-weight: 600; color: #374151; margin-bottom: 4px;">
                  Localidad
                </label>
                <input id="swal-cliente-localidad" class="swal2-input" placeholder="Ciudad" style="width: 100%; padding: 8px; font-size: 13px; margin: 0;">
              </div>
              
              <div>
                <label style="display: block; font-size: 11px; font-weight: 600; color: #374151; margin-bottom: 4px;">
                  Provincia
                </label>
                <input id="swal-cliente-provincia" class="swal2-input" placeholder="Provincia" style="width: 100%; padding: 8px; font-size: 13px; margin: 0;">
              </div>
            </div>
          </div>
        </div>
      `,
      width: '500px',
      padding: '1.5rem',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '<span style="padding: 0 15px; font-size: 13px;">Generar Factura A</span>',
      cancelButtonText: '<span style="padding: 0 15px; font-size: 13px;">Cancelar</span>',
      preConfirm: () => {
        const nombre = (document.getElementById('swal-cliente-nombre') as HTMLInputElement)?.value
        const cuit = (document.getElementById('swal-cliente-cuit') as HTMLInputElement)?.value
        const condicion = (document.getElementById('swal-cliente-condicion') as HTMLSelectElement)?.value
        const direccion = (document.getElementById('swal-cliente-direccion') as HTMLInputElement)?.value
        const localidad = (document.getElementById('swal-cliente-localidad') as HTMLInputElement)?.value
        const provincia = (document.getElementById('swal-cliente-provincia') as HTMLInputElement)?.value

        if (!nombre || !cuit || !condicion) {
          Swal.showValidationMessage('Por favor complete los campos obligatorios (*)')
          return false
        }

        return {
          nombre,
          cuit,
          condicion,
          direccion: direccion || '',
          localidad: localidad || '',
          provincia: provincia || ''
        }
      }
    })

    if (formValues) {
      await processSale('factura-a', formValues)
    }
  }

  const handleFacturaB = async () => {
    // Mostrar formulario para datos del cliente (más simple para Factura B)
    const { value: formValues } = await Swal.fire({
      title: '<span style="font-size: 18px; font-weight: 700; color: #8b5cf6;">📋 Factura Tipo B</span>',
      html: `
        <div style="text-align: left; padding: 5px 0;">
          <p style="font-size: 12px; color: #6b7280; margin-bottom: 12px; text-align: center;">
            Complete los datos del cliente
          </p>
          
          <div style="display: grid; grid-template-columns: 1fr; gap: 10px;">
            <div>
              <label style="display: block; font-size: 11px; font-weight: 600; color: #374151; margin-bottom: 4px;">
                Nombre / Razón Social *
              </label>
              <input id="swal-cliente-nombre-b" class="swal2-input" placeholder="Nombre o Razón Social" style="width: 100%; padding: 8px; font-size: 13px; margin: 0;" required>
            </div>
            
            <div>
              <label style="display: block; font-size: 11px; font-weight: 600; color: #374151; margin-bottom: 4px;">
                CUIT / DNI (opcional)
              </label>
              <input id="swal-cliente-cuit-b" class="swal2-input" placeholder="CUIT o DNI" style="width: 100%; padding: 8px; font-size: 13px; margin: 0;">
            </div>
            
            <div>
              <label style="display: block; font-size: 11px; font-weight: 600; color: #374151; margin-bottom: 4px;">
                Dirección
              </label>
              <input id="swal-cliente-direccion-b" class="swal2-input" placeholder="Calle y número" style="width: 100%; padding: 8px; font-size: 13px; margin: 0;">
            </div>
            
            <div>
              <label style="display: block; font-size: 11px; font-weight: 600; color: #374151; margin-bottom: 4px;">
                Localidad
              </label>
              <input id="swal-cliente-localidad-b" class="swal2-input" placeholder="Ciudad" style="width: 100%; padding: 8px; font-size: 13px; margin: 0;">
            </div>
          </div>
        </div>
      `,
      width: '450px',
      padding: '1.5rem',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#8b5cf6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '<span style="padding: 0 15px; font-size: 13px;">Generar Factura B</span>',
      cancelButtonText: '<span style="padding: 0 15px; font-size: 13px;">Cancelar</span>',
      preConfirm: () => {
        const nombre = (document.getElementById('swal-cliente-nombre-b') as HTMLInputElement)?.value
        const cuit = (document.getElementById('swal-cliente-cuit-b') as HTMLInputElement)?.value
        const direccion = (document.getElementById('swal-cliente-direccion-b') as HTMLInputElement)?.value
        const localidad = (document.getElementById('swal-cliente-localidad-b') as HTMLInputElement)?.value

        if (!nombre) {
          Swal.showValidationMessage('Por favor complete el nombre del cliente')
          return false
        }

        return {
          nombre,
          cuit: cuit || '',
          direccion: direccion || '',
          localidad: localidad || '',
          provincia: ''
        }
      }
    })

    if (formValues) {
      await processSale('factura-b', formValues)
    }
  }

  const processSale = async (tipoComprobante: 'ticket' | 'factura-a' | 'factura-b', clienteData?: any) => {
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const now = new Date()
      const fecha = now.toISOString().split('T')[0]
      const hora = now.toTimeString().slice(0, 8)

      // Obtener nombre del usuario
      const { data: userData } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', user.id)
        .single()

      const despachadoPor = userData?.name || userData?.email || 'Usuario'

      // Calcular totales
      const currentTotal = cart.reduce((sum, item) => sum + item.total, 0)
      const currentTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

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

      // Guardar datos del carrito antes de limpiarlo
      const cartForTicket = [...cart]
      const totalForTicket = currentTotal

      // Generar el comprobante según el tipo
      if (tipoComprobante === 'ticket') {
        generateTicket(cartForTicket, totalForTicket, fecha, hora, despachadoPor)
      } else if (tipoComprobante === 'factura-a') {
        generateFacturaA(cartForTicket, totalForTicket, fecha, hora, despachadoPor, clienteData)
      } else if (tipoComprobante === 'factura-b') {
        generateFacturaB(cartForTicket, totalForTicket, fecha, hora, despachadoPor, clienteData)
      }

      await Swal.fire({
        title: '<span style="font-size: 20px; font-weight: 700; color: #10b981;">🎉 ¡Venta Exitosa!</span>',
        html: `
          <div style="text-align: center; padding: 10px 0;">
            <div style="font-size: 56px; margin-bottom: 12px; animation: bounce 0.6s;">✅</div>
            
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 10px; padding: 18px; margin: 12px 0; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
              <p style="font-size: 15px; color: white; margin-bottom: 12px; font-weight: 600;">
                Venta registrada correctamente
              </p>
              
              <div style="background: rgba(255, 255, 255, 0.2); border-radius: 6px; padding: 12px; margin-top: 10px;">
                <p style="font-size: 12px; color: rgba(255, 255, 255, 0.9); margin-bottom: 6px;">
                  Productos vendidos
                </p>
                <p style="font-size: 22px; font-weight: 700; color: white; margin: 0;">
                  ${cart.length} ${cart.length === 1 ? 'producto' : 'productos'}
                </p>
              </div>
              
              <div style="background: rgba(255, 255, 255, 0.2); border-radius: 6px; padding: 12px; margin-top: 8px;">
                <p style="font-size: 12px; color: rgba(255, 255, 255, 0.9); margin-bottom: 6px;">
                  Total cobrado
                </p>
                <p style="font-size: 26px; font-weight: 700; color: white; margin: 0;">
                  $${currentTotal.toFixed(2)}
                </p>
              </div>
            </div>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 6px; margin-top: 12px;">
              <p style="font-size: 12px; color: #92400e; margin: 0;">
                🎫 El comprobante se abrirá automáticamente para imprimir
              </p>
            </div>
          </div>
          <style>
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
          </style>
        `,
        width: '420px',
        padding: '1.5rem',
        icon: 'success',
        iconColor: '#10b981',
        confirmButtonColor: '#10b981',
        confirmButtonText: '<span style="padding: 0 20px; font-size: 13px; font-weight: 600;">✨ Perfecto</span>',
        buttonsStyling: true,
        timer: 3000,
        timerProgressBar: true,
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
        title: '<span style="font-size: 18px; font-weight: 600; color: #ef4444;">❌ Error en la Venta</span>',
        html: `
          <div style="text-align: center; padding: 10px 0;">
            <div style="font-size: 48px; margin-bottom: 10px;">⚠️</div>
            <p style="font-size: 15px; color: #6b7280; margin-bottom: 8px;">
              Ocurrió un error al procesar la venta
            </p>
            <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin: 10px 0;">
              <p style="font-size: 12px; color: #991b1b; margin: 0; font-family: monospace;">
                ${error.message || 'Error desconocido'}
              </p>
            </div>
            <p style="font-size: 12px; color: #9ca3af; margin-top: 10px;">
              Por favor, intenta nuevamente
            </p>
          </div>
        `,
        width: '400px',
        padding: '1.5rem',
        icon: 'error',
        iconColor: '#ef4444',
        confirmButtonColor: '#ef4444',
        confirmButtonText: '<span style="padding: 0 15px; font-size: 13px;">Reintentar</span>',
        buttonsStyling: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const generateTicket = (cartItems: CartItem[], totalAmount: number, fecha: string, hora: string, despachadoPor: string) => {
    // Formatear fecha a DD/MM/YY
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr + 'T00:00:00') // Agregar hora para evitar problemas de zona horaria
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = String(date.getFullYear()).slice(-2)
      return `${day}/${month}/${year}`
    }

    // Formatear hora a HH:MM:SS (ya viene en formato HH:MM:SS o HH:MM)
    const formatTime = (timeStr: string) => {
      // Si ya tiene segundos, devolverlo tal cual, si no, agregar :00
      if (timeStr.length === 8) {
        return timeStr
      } else if (timeStr.length === 5) {
        return timeStr + ':00'
      }
      return timeStr
    }

    // Formatear número con comas como separador decimal
    const formatNumber = (num: number, decimals: number = 2) => {
      return num.toFixed(decimals).replace('.', ',')
    }

    const formattedFecha = formatDate(fecha)
    const formattedHora = formatTime(hora)

    // Crear el HTML del ticket
    const ticketHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Ticket de Venta</title>
        <style>
          @media print {
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 10px;
            }
          }
          body {
            font-family: 'Courier New', monospace;
            width: 80mm;
            margin: 0 auto;
            padding: 10px;
            font-size: 11px;
            line-height: 1.3;
          }
          .ticket-header {
            text-align: center;
            margin-bottom: 12px;
            padding-bottom: 8px;
          }
          .ticket-title {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 4px;
            text-transform: uppercase;
          }
          .ticket-info {
            font-size: 9px;
            margin: 2px 0;
            text-align: left;
          }
          .ticket-date {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            font-size: 10px;
          }
          .ticket-items {
            margin: 12px 0;
          }
          .ticket-item {
            margin-bottom: 6px;
            padding-bottom: 4px;
          }
          .item-line1 {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 2px;
            line-height: 1.2;
          }
          .item-code {
            font-weight: bold;
            min-width: 60px;
            font-size: 10px;
          }
          .item-name {
            flex: 1;
            margin: 0 4px;
            font-size: 10px;
            text-transform: uppercase;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .item-price {
            font-weight: bold;
            text-align: right;
            min-width: 50px;
            font-size: 10px;
          }
          .item-line2 {
            font-size: 9px;
            color: #333;
            margin-left: 64px;
            line-height: 1.2;
          }
          .ticket-total {
            margin-top: 12px;
            padding-top: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid #000;
          }
          .total-label {
            font-weight: bold;
            font-size: 12px;
            text-transform: uppercase;
          }
          .total-amount {
            font-weight: bold;
            font-size: 16px;
          }
          .ticket-footer {
            text-align: center;
            margin-top: 15px;
            padding-top: 10px;
            font-size: 10px;
          }
          .ticket-divider {
            border-top: 1px dashed #000;
            margin: 8px 0;
          }
          .footer-message {
            margin: 8px 0;
          }
          .afip-logo {
            text-align: center;
            margin-top: 10px;
            padding-top: 8px;
            border-top: 1px dashed #000;
          }
          .afip-logo img {
            max-width: 120px;
            height: auto;
            margin-bottom: 2px;
            filter: grayscale(100%);
          }
          .afip-validated {
            font-size: 8px;
            color: #666;
            margin-top: 0px;
          }
        </style>
      </head>
      <body>
        <div class="ticket-header">
          <div class="ticket-title">Ticket de Venta</div>
            <div class="ticket-title">Nombre del Comercio</div>
          <div class="ticket-info">Dirección de la Empresa Línea 1</div>
          <div class="ticket-info">Dirección de la Empresa Línea 2</div>
          <div class="ticket-info">Teléfono de la Empresa</div>
        </div>
        
        <div class="ticket-date">
          <span>Fecha ${formattedFecha}</span>
          <span>Hora ${formattedHora}</span>
        </div>
        
        <div class="ticket-items">
          ${cartItems.map(item => {
            const itemName = item.product.name.length > 20 
              ? item.product.name.substring(0, 20).toUpperCase() 
              : item.product.name.toUpperCase()
            return `
            <div class="ticket-item">
              <div class="item-line1">
                <span class="item-code">${item.product.sku}</span>
                <span class="item-name">${itemName}</span>
                <span class="item-price">${formatNumber(item.total)}</span>
              </div>
              <div class="item-line2">
                ${formatNumber(item.quantity, 3)} x ${formatNumber(item.unitPrice)}
              </div>
            </div>
          `
          }).join('')}
        </div>
        
        <div class="ticket-total">
          <span class="total-label">TOTAL</span>
          <span class="total-amount">${formatNumber(totalAmount)}</span>
        </div>
        
        <div class="ticket-footer">
          <div class="ticket-divider"></div>
          <div class="footer-message">Muchas gracias por su compra</div>
          <div class="afip-logo">
            <img src="/assets/afip.png" alt="AFIP" />
            <div class="afip-validated">Ticket Validado</div>
          </div>
          <div class="ticket-divider"></div>
        </div>
      </body>
      </html>
    `

    // Abrir el ticket en una nueva ventana
    const ticketWindow = window.open('', '_blank', 'width=400,height=600')
    if (ticketWindow) {
      ticketWindow.document.write(ticketHTML)
      ticketWindow.document.close()
      
      // Esperar a que se cargue y luego imprimir automáticamente
      ticketWindow.onload = () => {
        setTimeout(() => {
          ticketWindow.print()
        }, 250)
      }
    }
  }

  const generateFacturaA = (cartItems: CartItem[], totalAmount: number, fecha: string, hora: string, despachadoPor: string, clienteData: any) => {
    // Calcular IVA (21% por defecto)
    const iva21 = totalAmount * 0.21
    const subtotal = totalAmount - iva21
    const numeroFactura = String(Math.floor(Math.random() * 900000) + 100000).padStart(8, '0')
    const puntoVenta = '0080'
    
    // Formatear fecha
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr + 'T00:00:00')
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    }

    const formatNumber = (num: number, decimals: number = 2) => {
      return num.toFixed(decimals).replace('.', ',')
    }

    const formattedFecha = formatDate(fecha)

    const facturaHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Factura A</title>
        <style>
          @media print {
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 5px;
            }
          }
          body {
            font-family: 'Courier New', monospace;
            width: 80mm;
            margin: 0 auto;
            padding: 5px;
            font-size: 9px;
            line-height: 1.2;
          }
          .header {
            text-align: center;
            margin-bottom: 8px;
            border-bottom: 2px solid #000;
            padding-bottom: 5px;
          }
          .title {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 3px;
            text-transform: uppercase;
          }
          .cod-original {
            font-size: 8px;
            margin-top: 2px;
          }
          .empresa-info {
            text-align: left;
            margin: 8px 0;
            font-size: 8px;
            line-height: 1.3;
          }
          .separator {
            border-top: 1px solid #000;
            margin: 5px 0;
          }
          .transaction-info {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            font-size: 9px;
          }
          .cliente-section {
            margin: 8px 0;
            font-size: 8px;
            line-height: 1.3;
          }
          .cliente-label {
            font-weight: bold;
          }
          .items-table {
            width: 100%;
            margin: 8px 0;
            font-size: 8px;
            border-collapse: collapse;
          }
          .items-table th {
            text-align: left;
            border-bottom: 1px solid #000;
            padding: 3px 0;
            font-weight: bold;
          }
          .items-table td {
            padding: 2px 0;
            vertical-align: top;
          }
          .item-desc {
            width: 40%;
          }
          .item-unid {
            width: 15%;
            text-align: right;
          }
          .item-price {
            width: 20%;
            text-align: right;
          }
          .item-total {
            width: 25%;
            text-align: right;
          }
          .totals {
            margin-top: 8px;
            font-size: 9px;
          }
          .total-line {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
          }
          .total-final {
            font-weight: bold;
            font-size: 12px;
            border-top: 2px solid #000;
            padding-top: 5px;
            margin-top: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 10px;
            font-size: 8px;
          }
          .footer-title {
            font-weight: bold;
            font-size: 12px;
            margin: 5px 0;
          }
          .afip-logo {
            text-align: center;
            margin-top: 10px;
            padding-top: 8px;
            border-top: 1px dashed #000;
          }
          .afip-logo img {
            max-width: 120px;
            height: auto;
            margin-bottom: 2px;
            filter: grayscale(100%);
          }
          .afip-validated {
            font-size: 8px;
            color: #666;
            margin-top: 0px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">FACTURA A</div>
          <div class="cod-original">ORIGINAL Cod.: 01</div>
        </div>
        
        <div class="empresa-info">
          <div><strong>Nombre del Comercio</strong></div>
          <div>CUIT: 20-12345678-9</div>
          <div>DIRECCION 1234</div>
          <div>CIUDAD - PROVINCIA - CP: 1234</div>
          <div>Ing. Brutos: 123-12345678</div>
          <div>Inicio Actividad: 01/01/2020</div>
        </div>
        
        <div class="separator"></div>
        
        <div class="transaction-info">
          <span>FECHA: ${formattedFecha}</span>
          <span>Nro. T: ${puntoVenta} - ${numeroFactura}</span>
        </div>
        
        <div class="separator"></div>
        
        <div class="cliente-section">
          <div><span class="cliente-label">Cliente:</span> ${clienteData.nombre}</div>
          <div><span class="cliente-label">CUIT:</span> ${clienteData.cuit}</div>
          <div><span class="cliente-label">Cond. Ante IVA:</span> ${clienteData.condicion}</div>
          ${clienteData.direccion ? `<div><span class="cliente-label">DIRECCION:</span> ${clienteData.direccion}</div>` : ''}
          ${clienteData.localidad ? `<div><span class="cliente-label">LOCALIDAD:</span> ${clienteData.localidad}</div>` : ''}
          ${clienteData.provincia ? `<div><span class="cliente-label">PROVINCIA:</span> ${clienteData.provincia}</div>` : ''}
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th class="item-desc">Descripcion</th>
              <th class="item-unid">Unid</th>
              <th class="item-price">$ Unid.</th>
              <th class="item-total">$ Total</th>
            </tr>
          </thead>
          <tbody>
            ${cartItems.map(item => {
              const desc = item.product.name.length > 30 
                ? item.product.name.substring(0, 30) 
                : item.product.name
              return `
              <tr>
                <td class="item-desc">${desc}</td>
                <td class="item-unid">${formatNumber(item.quantity, 2)}</td>
                <td class="item-price">${formatNumber(item.unitPrice)}</td>
                <td class="item-total">${formatNumber(item.total)}</td>
              </tr>
            `
            }).join('')}
          </tbody>
        </table>
        
        <div class="separator"></div>
        
        <div class="totals">
          <div class="total-line">
            <span>Descuento $</span>
            <span>0,00</span>
          </div>
          <div class="total-line">
            <span>Subtotal: $</span>
            <span>${formatNumber(subtotal)}</span>
          </div>
          <div class="total-line">
            <span>IVA 10.5%: $</span>
            <span>0,00</span>
          </div>
          <div class="total-line">
            <span>IVA 21.0%: $</span>
            <span>${formatNumber(iva21)}</span>
          </div>
          <div class="total-line total-final">
            <span>Total: $</span>
            <span>${formatNumber(totalAmount)}</span>
          </div>
        </div>
        
        <div class="footer">
          <div>CAE: ${Math.floor(Math.random() * 90000000000000) + 10000000000000}</div>
          <div>VTO. CAE:</div>
          <div class="footer-title">Gracias por su Compra</div>
          <div>Documento Validado</div>
          <div class="afip-logo">
            <img src="/assets/afip.png" alt="AFIP" />
            <div class="afip-validated">Ticket Validado</div>
          </div>
        </div>
      </body>
      </html>
    `

    const facturaWindow = window.open('', '_blank', 'width=400,height=800')
    if (facturaWindow) {
      facturaWindow.document.write(facturaHTML)
      facturaWindow.document.close()
      facturaWindow.onload = () => {
        setTimeout(() => {
          facturaWindow.print()
        }, 250)
      }
    }
  }

  const generateFacturaB = (cartItems: CartItem[], totalAmount: number, fecha: string, hora: string, despachadoPor: string, clienteData: any) => {
    // Factura B no tiene IVA desglosado
    const numeroFactura = String(Math.floor(Math.random() * 900000) + 100000).padStart(8, '0')
    const puntoVenta = '0080'
    
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr + 'T00:00:00')
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    }

    const formatNumber = (num: number, decimals: number = 2) => {
      return num.toFixed(decimals).replace('.', ',')
    }

    const formattedFecha = formatDate(fecha)

    const facturaHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Factura B</title>
        <style>
          @media print {
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 5px;
            }
          }
          body {
            font-family: 'Courier New', monospace;
            width: 80mm;
            margin: 0 auto;
            padding: 5px;
            font-size: 9px;
            line-height: 1.2;
          }
          .header {
            text-align: center;
            margin-bottom: 8px;
            border-bottom: 2px solid #000;
            padding-bottom: 5px;
          }
          .title {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 3px;
            text-transform: uppercase;
          }
          .cod-original {
            font-size: 8px;
            margin-top: 2px;
          }
          .empresa-info {
            text-align: left;
            margin: 8px 0;
            font-size: 8px;
            line-height: 1.3;
          }
          .separator {
            border-top: 1px solid #000;
            margin: 5px 0;
          }
          .transaction-info {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            font-size: 9px;
          }
          .cliente-section {
            margin: 8px 0;
            font-size: 8px;
            line-height: 1.3;
          }
          .cliente-label {
            font-weight: bold;
          }
          .items-table {
            width: 100%;
            margin: 8px 0;
            font-size: 8px;
            border-collapse: collapse;
          }
          .items-table th {
            text-align: left;
            border-bottom: 1px solid #000;
            padding: 3px 0;
            font-weight: bold;
          }
          .items-table td {
            padding: 2px 0;
            vertical-align: top;
          }
          .item-desc {
            width: 40%;
          }
          .item-unid {
            width: 15%;
            text-align: right;
          }
          .item-price {
            width: 20%;
            text-align: right;
          }
          .item-total {
            width: 25%;
            text-align: right;
          }
          .totals {
            margin-top: 8px;
            font-size: 9px;
          }
          .total-line {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
          }
          .total-final {
            font-weight: bold;
            font-size: 12px;
            border-top: 2px solid #000;
            padding-top: 5px;
            margin-top: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 10px;
            font-size: 8px;
          }
          .footer-title {
            font-weight: bold;
            font-size: 12px;
            margin: 5px 0;
          }
          .afip-logo {
            text-align: center;
            margin-top: 10px;
            padding-top: 8px;
            border-top: 1px dashed #000;
          }
          .afip-logo img {
            max-width: 120px;
            height: auto;
            margin-bottom: 2px;
            filter: grayscale(100%);
          }
          .afip-validated {
            font-size: 8px;
            color: #666;
            margin-top: 0px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">FACTURA B</div>
          <div class="cod-original">ORIGINAL Cod.: 06</div>
        </div>
        
        <div class="empresa-info">
          <div><strong>Nombre del Comercio</strong></div>
          <div>CUIT: 20-12345678-9</div>
          <div>DIRECCION 1234</div>
          <div>CIUDAD - PROVINCIA - CP: 1234</div>
          <div>Ing. Brutos: 123-12345678</div>
          <div>Inicio Actividad: 01/01/2020</div>
        </div>
        
        <div class="separator"></div>
        
        <div class="transaction-info">
          <span>FECHA: ${formattedFecha}</span>
          <span>Nro. T: ${puntoVenta} - ${numeroFactura}</span>
        </div>
        
        <div class="separator"></div>
        
        <div class="cliente-section">
          <div><span class="cliente-label">Cliente:</span> ${clienteData.nombre}</div>
          ${clienteData.cuit ? `<div><span class="cliente-label">CUIT/DNI:</span> ${clienteData.cuit}</div>` : ''}
          ${clienteData.direccion ? `<div><span class="cliente-label">DIRECCION:</span> ${clienteData.direccion}</div>` : ''}
          ${clienteData.localidad ? `<div><span class="cliente-label">LOCALIDAD:</span> ${clienteData.localidad}</div>` : ''}
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th class="item-desc">Descripcion</th>
              <th class="item-unid">Unid</th>
              <th class="item-price">$ Unid.</th>
              <th class="item-total">$ Total</th>
            </tr>
          </thead>
          <tbody>
            ${cartItems.map(item => {
              const desc = item.product.name.length > 30 
                ? item.product.name.substring(0, 30) 
                : item.product.name
              return `
              <tr>
                <td class="item-desc">${desc}</td>
                <td class="item-unid">${formatNumber(item.quantity, 2)}</td>
                <td class="item-price">${formatNumber(item.unitPrice)}</td>
                <td class="item-total">${formatNumber(item.total)}</td>
              </tr>
            `
            }).join('')}
          </tbody>
        </table>
        
        <div class="separator"></div>
        
        <div class="totals">
          <div class="total-line">
            <span>Descuento $</span>
            <span>0,00</span>
          </div>
          <div class="total-line">
            <span>Subtotal: $</span>
            <span>${formatNumber(totalAmount)}</span>
          </div>
          <div class="total-line total-final">
            <span>Total: $</span>
            <span>${formatNumber(totalAmount)}</span>
          </div>
        </div>
        
        <div class="footer">
          <div>CAE: ${Math.floor(Math.random() * 90000000000000) + 10000000000000}</div>
          <div>VTO. CAE:</div>
          <div class="footer-title">Gracias por su Compra</div>
          <div>Documento Validado</div>
          <div class="afip-logo">
            <img src="/assets/afip.png" alt="AFIP" />
            <div class="afip-validated">Ticket Validado</div>
          </div>
        </div>
      </body>
      </html>
    `

    const facturaWindow = window.open('', '_blank', 'width=400,height=800')
    if (facturaWindow) {
      facturaWindow.document.write(facturaHTML)
      facturaWindow.document.close()
      facturaWindow.onload = () => {
        setTimeout(() => {
          facturaWindow.print()
        }, 250)
      }
    }
  }

  const handleVender = async () => {
    if (cart.length === 0) {
      Swal.fire({
        title: '<span style="font-size: 18px; font-weight: 600; color: #f59e0b;">🛒 Carrito Vacío</span>',
        html: `
          <div style="text-align: center; padding: 10px 0;">
            <div style="font-size: 48px; margin-bottom: 10px;">🛒</div>
            <p style="font-size: 15px; color: #6b7280; margin-bottom: 8px;">
              No hay productos en el carrito
            </p>
            <p style="font-size: 13px; color: #9ca3af;">
              Agrega productos antes de realizar una venta
            </p>
          </div>
        `,
        width: '400px',
        padding: '1.5rem',
        icon: 'warning',
        iconColor: '#f59e0b',
        confirmButtonColor: '#6b7280',
        confirmButtonText: '<span style="padding: 0 15px; font-size: 13px;">Entendido</span>',
        buttonsStyling: true,
      })
      return
    }

    // Verificar stock antes de vender
    for (const item of cart) {
      const product = products.find(p => p.id === item.product.id)
      if (!product || product.current_stock < item.quantity) {
        Swal.fire({
          title: '<span style="font-size: 18px; font-weight: 600; color: #ef4444;">⚠️ Stock Insuficiente</span>',
          html: `
            <div style="text-align: center; padding: 10px 0;">
              <div style="font-size: 40px; margin-bottom: 10px;">📦</div>
              <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">
                El producto <strong style="color: #111827;">"${item.product.name}"</strong>
              </p>
              <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; margin: 10px 0;">
                <p style="font-size: 15px; font-weight: 600; color: #991b1b; margin: 0;">
                  No tiene suficiente stock disponible
                </p>
                <p style="font-size: 12px; color: #7f1d1d; margin-top: 6px; margin-bottom: 0;">
                  Stock actual: <strong>${product?.current_stock || 0}</strong> | Solicitado: <strong>${item.quantity}</strong>
                </p>
              </div>
            </div>
          `,
          width: '400px',
          padding: '1.5rem',
          icon: 'error',
          iconColor: '#ef4444',
          confirmButtonColor: '#ef4444',
          confirmButtonText: '<span style="padding: 0 15px; font-size: 13px;">Entendido</span>',
          buttonsStyling: true,
        })
        return
      }
    }

    // Calcular totales antes del modal
    const currentTotal = cart.reduce((sum, item) => sum + item.total, 0)
    const currentTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

    const result = await Swal.fire({
      title: '<span style="font-size: 20px; font-weight: 700; color: #111827;">💰 Confirmar Venta</span>',
      html: `
        <div style="text-align: center; padding: 10px 0;">
          <div style="font-size: 48px; margin-bottom: 12px;">🛍️</div>
          
          <div style="background: #f0fdf4; border: 2px solid #10b981; border-radius: 10px; padding: 15px; margin: 12px 0;">
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">
              <strong style="color: #111827; font-size: 16px;">${cart.length}</strong> producto${cart.length > 1 ? 's' : ''} en el historial
            </p>
            
            <div style="border-top: 2px dashed #10b981; padding-top: 10px; margin-top: 10px;">
              <p style="font-size: 11px; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
                Total a cobrar
              </p>
              <p style="font-size: 28px; font-weight: 700; color: #10b981; margin: 0;">
                $${currentTotal.toFixed(2)}
              </p>
            </div>
          </div>
          
          <div style="background: #f9fafb; border-radius: 6px; padding: 10px; margin: 10px 0;">
            <p style="font-size: 12px; color: #6b7280; margin: 0;">
              Items: <strong style="color: #111827;">${currentTotalItems}</strong>
            </p>
          </div>
          
          <div style="margin-top: 15px; padding-top: 15px; border-top: 2px dashed #e5e7eb;">
            <p style="font-size: 12px; color: #6b7280; margin-bottom: 10px; font-weight: 600;">
              Tipo de comprobante:
            </p>
            <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
              <button id="btn-ticket" style="flex: 1; min-width: 100px; padding: 10px 8px; background: #10b981; color: white; border: none; border-radius: 6px; font-weight: 600; font-size: 12px; cursor: pointer; transition: all 0.3s;">
                🎫 Ticket
              </button>
              <button id="btn-factura-a" style="flex: 1; min-width: 100px; padding: 10px 8px; background: #3b82f6; color: white; border: none; border-radius: 6px; font-weight: 600; font-size: 12px; cursor: pointer; transition: all 0.3s;">
                📄 Factura A
              </button>
              <button id="btn-factura-b" style="flex: 1; min-width: 100px; padding: 10px 8px; background: #8b5cf6; color: white; border: none; border-radius: 6px; font-weight: 600; font-size: 12px; cursor: pointer; transition: all 0.3s;">
                📋 Factura B
              </button>
            </div>
          </div>
        </div>
      `,
      width: '480px',
      padding: '1.5rem',
      icon: 'question',
      iconColor: '#10b981',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '<span style="padding: 0 20px; font-size: 13px; font-weight: 600;">✅ Confirmar</span>',
      cancelButtonText: '<span style="padding: 0 20px; font-size: 13px;">❌ Cancelar</span>',
      reverseButtons: true,
      buttonsStyling: true,
      customClass: {
        popup: 'swal-popup-custom',
        confirmButton: 'swal-button-confirm-custom',
        cancelButton: 'swal-button-cancel-custom'
      },
      didOpen: () => {
        const btnTicket = document.getElementById('btn-ticket')
        const btnFacturaA = document.getElementById('btn-factura-a')
        const btnFacturaB = document.getElementById('btn-factura-b')
        
        if (btnTicket) {
          btnTicket.addEventListener('mouseenter', () => {
            btnTicket.style.transform = 'translateY(-2px)'
            btnTicket.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)'
          })
          btnTicket.addEventListener('mouseleave', () => {
            btnTicket.style.transform = 'translateY(0)'
            btnTicket.style.boxShadow = 'none'
          })
        }
        
        if (btnFacturaA) {
          btnFacturaA.addEventListener('mouseenter', () => {
            btnFacturaA.style.transform = 'translateY(-2px)'
            btnFacturaA.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)'
          })
          btnFacturaA.addEventListener('mouseleave', () => {
            btnFacturaA.style.transform = 'translateY(0)'
            btnFacturaA.style.boxShadow = 'none'
          })
          btnFacturaA.addEventListener('click', () => {
            Swal.close()
            handleFacturaA()
          })
        }
        
        if (btnFacturaB) {
          btnFacturaB.addEventListener('mouseenter', () => {
            btnFacturaB.style.transform = 'translateY(-2px)'
            btnFacturaB.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)'
          })
          btnFacturaB.addEventListener('mouseleave', () => {
            btnFacturaB.style.transform = 'translateY(0)'
            btnFacturaB.style.boxShadow = 'none'
          })
          btnFacturaB.addEventListener('click', () => {
            Swal.close()
            handleFacturaB()
          })
        }
      },
      preConfirm: () => {
        // Por defecto, si confirma sin seleccionar botón, usa ticket
        return 'ticket'
      }
    })

    // Si canceló, salir
    if (result.dismiss === Swal.DismissReason.cancel) {
      return
    }

    // Si confirmó con el botón principal, usar ticket por defecto
    if (result.isConfirmed && result.value === 'ticket') {
      await processSale('ticket')
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

