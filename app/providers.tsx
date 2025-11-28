'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { ThemeProvider } from '@/components/ThemeProvider'

type UserContextType = {
  user: User | null
  loading: boolean
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
})

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const getUser = async () => {
      try {
        const supabase = createSupabaseClient()
        
        // Primero intentar obtener la sesión
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (mounted) {
          if (session?.user) {
            setUser(session.user)
            setLoading(false)
          } else {
            // Si no hay sesión, no hay usuario
            setUser(null)
            setLoading(false)
          }
        }

        // Escuchar cambios en el estado de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, newSession) => {
            if (mounted) {
              setUser(newSession?.user ?? null)
              setLoading(false)
            }
          }
        )

        return () => subscription.unsubscribe()
      } catch (error: any) {
        if (mounted) {
          setUser(null)
          setLoading(false)
        }
        // Solo loguear errores críticos, ignorar errores de sesión faltante
        if (error?.message && !error.message.includes('session missing') && !error.message.includes('JWT')) {
          console.warn('Error en Providers:', error?.message)
        }
      }
    }

    getUser()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <ThemeProvider>
      <UserContext.Provider value={{ user, loading }}>
        {children}
      </UserContext.Provider>
    </ThemeProvider>
  )
}

export const useUser = () => useContext(UserContext)

