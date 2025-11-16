'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Users, Download, FileText } from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { User, MonthlyReport } from '@/lib/types'

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Check if user is admin
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userData?.role !== 'admin') {
        window.location.href = '/dashboard'
        return
      }

      const { data } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: 'admin' | 'empleado') => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error
      loadUsers()
    } catch (error) {
      console.error('Error updating user role:', error)
      alert('Error al actualizar el rol del usuario')
    }
  }

  const generateMonthlyReport = async () => {
    try {
      const [year, month] = selectedMonth.split('-').map(Number)
      const startDate = startOfMonth(new Date(year, month - 1))
      const endDate = endOfMonth(new Date(year, month - 1))

      // Get all movements for the month
      const { data: movements } = await supabase
        .from('movements')
        .select(`
          *,
          products (name, sku)
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at')

      if (!movements) return

      // Group by product
      const productMap = new Map()
      movements.forEach((movement: any) => {
        const productId = movement.product_id
        if (!productMap.has(productId)) {
          productMap.set(productId, {
            product_id: productId,
            product_name: movement.products?.name || 'N/A',
            sku: movement.products?.sku || 'N/A',
            entradas: 0,
            salidas: 0,
          })
        }
        const product = productMap.get(productId)
        if (movement.type === 'entrada') {
          product.entradas += movement.quantity
        } else {
          product.salidas += movement.quantity
        }
      })

      // Get final stock for each product
      const productIds = Array.from(productMap.keys())
      const { data: products } = await supabase
        .from('products')
        .select('id, current_stock')
        .in('id', productIds)

      products?.forEach((product) => {
        const reportItem = productMap.get(product.id)
        if (reportItem) {
          reportItem.stock_final = product.current_stock
        }
      })

      const reportData = Array.from(productMap.values())
      const totalEntradas = reportData.reduce((sum, item) => sum + item.entradas, 0)
      const totalSalidas = reportData.reduce((sum, item) => sum + item.salidas, 0)

      return {
        month: format(startDate, 'MMMM yyyy'),
        year,
        total_entradas: totalEntradas,
        total_salidas: totalSalidas,
        products: reportData,
      }
    } catch (error) {
      console.error('Error generating report:', error)
      throw error
    }
  }

  const exportToExcel = async () => {
    try {
      const report = await generateMonthlyReport()
      if (!report) return

      const wsData = [
        ['Informe Mensual - StockApp'],
        [`Período: ${report.month}`],
        [''],
        ['Resumen'],
        ['Total Entradas', report.total_entradas],
        ['Total Salidas', report.total_salidas],
        [''],
        ['Detalle por Producto'],
        ['Producto', 'SKU', 'Entradas', 'Salidas', 'Stock Final'],
        ...report.products.map((p) => [
          p.product_name,
          p.sku,
          p.entradas,
          p.salidas,
          p.stock_final,
        ]),
      ]

      const ws = XLSX.utils.aoa_to_sheet(wsData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Informe Mensual')

      const fileName = `informe_${selectedMonth.replace('-', '_')}.xlsx`
      XLSX.writeFile(wb, fileName)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      alert('Error al exportar a Excel')
    }
  }

  const exportToPDF = async () => {
    try {
      const report = await generateMonthlyReport()
      if (!report) return

      const doc = new jsPDF()
      
      // Title
      doc.setFontSize(18)
      doc.text('Informe Mensual - StockApp', 14, 20)
      
      doc.setFontSize(12)
      doc.text(`Período: ${report.month}`, 14, 30)
      
      // Summary
      doc.setFontSize(14)
      doc.text('Resumen', 14, 45)
      doc.setFontSize(11)
      doc.text(`Total Entradas: ${report.total_entradas}`, 14, 55)
      doc.text(`Total Salidas: ${report.total_salidas}`, 14, 62)
      
      // Table
      const tableData = report.products.map((p) => [
        p.product_name,
        p.sku,
        p.entradas.toString(),
        p.salidas.toString(),
        p.stock_final.toString(),
      ])

      autoTable(doc, {
        startY: 70,
        head: [['Producto', 'SKU', 'Entradas', 'Salidas', 'Stock Final']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [57, 255, 20] },
      })

      const fileName = `informe_${selectedMonth.replace('-', '_')}.pdf`
      doc.save(fileName)
    } catch (error) {
      console.error('Error exporting to PDF:', error)
      alert('Error al exportar a PDF')
    }
  }

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
        <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
        <p className="text-gray-400">Gestiona usuarios y genera informes</p>
      </div>

      {/* Reports Section */}
      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-6 h-6 text-neon-green" />
          <h2 className="text-xl font-bold">Informes Mensuales</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Seleccionar Mes
            </label>
            <div className="flex items-center gap-4">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="input-field"
              />
              <button
                onClick={exportToExcel}
                className="btn-primary flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Exportar a Excel
              </button>
              <button
                onClick={exportToPDF}
                className="btn-secondary flex items-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Exportar a PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Users Section */}
      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-6 h-6 text-neon-green" />
          <h2 className="text-xl font-bold">Usuarios</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Nombre</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Rol</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Fecha Registro</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No hay usuarios registrados
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-dark-border hover:bg-dark-surface-light transition-colors"
                  >
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">{user.name || '-'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-neon-green/20 text-neon-green'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {user.role === 'admin' ? 'Admin' : 'Empleado'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-400">
                      {new Date(user.created_at).toLocaleDateString('es-AR')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            updateUserRole(user.id, e.target.value as 'admin' | 'empleado')
                          }
                          className="input-field text-sm py-1 px-2"
                        >
                          <option value="empleado">Empleado</option>
                          <option value="admin">Admin</option>
                        </select>
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

