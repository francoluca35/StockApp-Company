export type UserRole = 'admin' | 'empleado'

export interface User {
  id: string
  email: string
  role: UserRole
  name?: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  description?: string
  sku: string
  barcode?: string
  category?: string
  unit: string
  current_stock: number
  min_stock: number
  max_stock?: number
  price?: number
  created_at: string
  updated_at: string
}

export interface Movement {
  id: string
  product_id: string
  type: 'entrada' | 'salida'
  quantity: number
  reason?: string
  user_id: string
  created_at: string
  product?: Product
  user?: User
}

export interface MonthlyReport {
  month: string
  year: number
  total_entradas: number
  total_salidas: number
  products: {
    product_id: string
    product_name: string
    entradas: number
    salidas: number
    stock_final: number
  }[]
}

