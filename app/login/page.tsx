'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { LogIn, Loader2, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [envError, setEnvError] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if Supabase is configured with real values
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    // Detectar si son valores placeholder o de ejemplo
    const isPlaceholder = !supabaseUrl || 
                          !supabaseKey || 
                          supabaseUrl.includes('placeholder') || 
                          supabaseKey.includes('placeholder') ||
                          supabaseUrl.includes('tu-proyecto') ||
                          supabaseUrl.includes('ejemplo')
    
    setEnvError(isPlaceholder)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createSupabaseClient()
      
      console.log('Intentando iniciar sesión con:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      if (error) {
        console.error('Error de autenticación:', error)
        throw error
      }

      if (data.user && data.session) {
        console.log('Login exitoso, usuario:', data.user.email)
        console.log('User ID:', data.user.id)
        console.log('Session:', data.session)
        
        // Esperar un momento para que la sesión se establezca completamente
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Verificar que la sesión esté establecida
        const { data: { session: verifySession } } = await supabase.auth.getSession()
        if (verifySession) {
          console.log('Sesión confirmada, redirigiendo...')
          // Usar window.location para forzar una recarga completa
          window.location.href = '/dashboard'
        } else {
          console.warn('Sesión no encontrada después del login, pero tenemos data.session')
          // Si tenemos data.session, redirigir de todas formas
          if (data.session) {
            window.location.href = '/dashboard'
          } else {
            throw new Error('No se pudo establecer la sesión')
          }
        }
      } else {
        throw new Error('No se recibió información del usuario o sesión')
      }
    } catch (err: any) {
      console.error('Error completo:', err)
      let errorMessage = 'Error al iniciar sesión'
      
      if (err.message) {
        errorMessage = err.message
      } else if (err.error_description) {
        errorMessage = err.error_description
      } else if (typeof err === 'string') {
        errorMessage = err
      }

      // Mensajes más amigables
      if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = 'Email o contraseña incorrectos'
      } else if (errorMessage.includes('Email not confirmed')) {
        errorMessage = 'Por favor confirma tu email antes de iniciar sesión'
      } else if (errorMessage.includes('User not found')) {
        errorMessage = 'Usuario no encontrado. Verifica tu email.'
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold neon-text mb-2">StockApp</h1>
            <p className="text-gray-400">Sistema de Gestión de Stock Industrial</p>
          </div>

          {envError && (
            <div className="bg-orange-500/10 border border-orange-500 text-orange-400 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium mb-1">⚠️ Modo Demo</p>
                  <p className="text-sm text-orange-300 mb-2">
                    La aplicación está usando valores de ejemplo. Para usar la funcionalidad completa, configura Supabase:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-orange-300 mb-2">
                    <li>Crea un proyecto en <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a></li>
                    <li>Edita <code className="bg-dark-bg px-1 rounded">.env.local</code> con tus credenciales</li>
                    <li>Ejecuta el SQL de <code className="bg-dark-bg px-1 rounded">supabase/schema.sql</code></li>
                  </ol>
                  <p className="text-xs text-orange-400">
                    Por ahora puedes explorar la interfaz, pero el login no funcionará hasta configurar Supabase.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="tu@email.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            <p>¿No tienes cuenta? Contacta al administrador</p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Demo: admin@stockapp.com / password123</p>
        </div>
      </div>
    </div>
  )
}

