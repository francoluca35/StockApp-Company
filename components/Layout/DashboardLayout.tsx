'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  LayoutDashboard,
  Package,
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Plus,
  Sun,
  Moon,
} from 'lucide-react'
import type { UserRole } from '@/lib/types'
import { useThemeStore } from '@/lib/store/themeStore'

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  roles?: UserRole[]
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Agregar Producto', href: '/dashboard/entradas', icon: Plus },
  { name: 'Stocks', href: '/dashboard/stock', icon: BarChart3 },
  { name: 'Stock de Salidas', href: '/dashboard/stock-salidas', icon: ArrowDownCircle },
  { name: 'Administración', href: '/dashboard/admin', icon: Settings, roles: ['admin'] },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userRole, setUserRole] = useState<UserRole>('empleado')
  const [userEmail, setUserEmail] = useState('')
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createSupabaseClient()
  const { theme, toggleTheme } = useThemeStore()

  useEffect(() => {
    const getUserData = async () => {
      try {
        // Primero verificar la sesión
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.warn('Error obteniendo sesión:', sessionError)
        }
        
        if (!session) {
          // Esperar un poco más por si la sesión aún se está estableciendo
          await new Promise(resolve => setTimeout(resolve, 500))
          const { data: { session: retrySession } } = await supabase.auth.getSession()
          
          if (!retrySession) {
            console.log('No hay sesión, redirigiendo a login')
            router.push('/login')
            return
          }
          
          setUserEmail(retrySession.user.email || '')
        } else {
          setUserEmail(session.user.email || '')
        }

        // Get user role (con manejo de errores)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          try {
            const { data: userData, error } = await supabase
              .from('users')
              .select('role')
              .eq('id', user.id)
              .single()

            if (userData) {
              setUserRole(userData.role)
            } else if (error) {
              console.warn('Error obteniendo rol del usuario:', error)
              // Si hay error, usar rol por defecto
              setUserRole('empleado')
            }
          } catch (error) {
            console.warn('Error en getUserData (role):', error)
            setUserRole('empleado')
          }
        }
      } catch (error) {
        console.warn('Error en getUserData:', error)
        // No redirigir aquí, dejar que el middleware lo maneje
      }
    }

    getUserData()
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const filteredNav = navigation.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  )

  return (
    <div className="min-h-screen dark:bg-dark-bg bg-light-bg">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
      >
        <div
          className="fixed inset-0 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 w-64 dark:bg-dark-surface bg-light-surface border-r dark:border-dark-border border-light-border">
          <SidebarContent
            nav={filteredNav}
            pathname={pathname}
            userRole={userRole}
            userEmail={userEmail}
            onLogout={handleLogout}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64">
        <div className="dark:bg-dark-surface bg-light-surface border-r dark:border-dark-border border-light-border h-full">
          <SidebarContent
            nav={filteredNav}
            pathname={pathname}
            userRole={userRole}
            userEmail={userEmail}
            onLogout={handleLogout}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 dark:bg-dark-surface bg-light-surface border-b dark:border-dark-border border-light-border">
          <div className="flex h-16 items-center gap-x-4 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              className="lg:hidden dark:text-gray-400 dark:hover:text-white text-gray-600 hover:text-gray-900"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg transition-colors dark:text-gray-400 dark:hover:text-white dark:hover:bg-dark-surface-light text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              <div className="text-sm dark:text-gray-400 text-gray-600">
                <User className="w-4 h-4 inline mr-1" />
                {userEmail}
                {userRole === 'admin' && (
                  <span className="ml-2 px-2 py-1 bg-neon-green/20 text-neon-green rounded text-xs">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

function SidebarContent({
  nav,
  pathname,
  userRole,
  userEmail,
  onLogout,
  onClose,
}: {
  nav: NavItem[]
  pathname: string
  userRole: UserRole
  userEmail: string
  onLogout: () => void
  onClose?: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-16 px-6 border-b dark:border-dark-border border-light-border">
        <h1 className="text-xl font-bold neon-text">StockApp</h1>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden dark:text-gray-400 dark:hover:text-white text-gray-600 hover:text-gray-900"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {nav.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                  : 'dark:text-gray-400 dark:hover:text-white dark:hover:bg-dark-surface-light text-gray-600 hover:text-gray-900 hover:bg-light-surface-light'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t dark:border-dark-border border-light-border">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-3 dark:text-gray-400 dark:hover:text-white dark:hover:bg-dark-surface-light text-gray-600 hover:text-gray-900 hover:bg-light-surface-light rounded-lg transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )
}

