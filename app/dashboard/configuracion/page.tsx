'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { UserCog, Save, Eye, EyeOff } from 'lucide-react'
import Swal from 'sweetalert2'

export default function ConfiguracionPage() {
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState({
    email: '',
    name: '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Obtener datos del usuario desde la tabla users
      const { data: userProfile } = await supabase
        .from('users')
        .select('email, name')
        .eq('id', user.id)
        .single()

      setUserData({
        email: userProfile?.email || user.email || '',
        name: userProfile?.name || '',
      })
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      // Actualizar email en auth.users
      if (userData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: userData.email,
        })

        if (emailError) throw emailError
      }

      // Actualizar nombre y email en public.users
      const { error: profileError } = await supabase
        .from('users')
        .update({ 
          name: userData.name || null,
          email: userData.email,
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      await Swal.fire({
        title: '¡Actualizado!',
        text: 'Tu perfil ha sido actualizado correctamente.',
        icon: 'success',
        confirmButtonColor: '#10b981',
      })

      // Recargar datos
      await loadUserData()
    } catch (error: any) {
      console.error('Error updating profile:', error)
      Swal.fire({
        title: 'Error',
        text: error.message || 'Error al actualizar el perfil',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validaciones
      if (!passwordData.currentPassword) {
        Swal.fire({
          title: 'Error de validación',
          text: 'Debes ingresar tu contraseña actual',
          icon: 'error',
          confirmButtonColor: '#ef4444',
        })
        setLoading(false)
        return
      }

      if (passwordData.newPassword.length < 6) {
        Swal.fire({
          title: 'Error de validación',
          text: 'La nueva contraseña debe tener al menos 6 caracteres',
          icon: 'error',
          confirmButtonColor: '#ef4444',
        })
        setLoading(false)
        return
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        Swal.fire({
          title: 'Error de validación',
          text: 'Las contraseñas no coinciden',
          icon: 'error',
          confirmButtonColor: '#ef4444',
        })
        setLoading(false)
        return
      }

      // Verificar contraseña actual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      // Intentar iniciar sesión con la contraseña actual para verificar
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: passwordData.currentPassword,
      })

      if (signInError) {
        Swal.fire({
          title: 'Error',
          text: 'La contraseña actual es incorrecta',
          icon: 'error',
          confirmButtonColor: '#ef4444',
        })
        setLoading(false)
        return
      }

      // Actualizar contraseña
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (updateError) throw updateError

      await Swal.fire({
        title: '¡Contraseña actualizada!',
        text: 'Tu contraseña ha sido actualizada correctamente.',
        icon: 'success',
        confirmButtonColor: '#10b981',
      })

      // Limpiar formulario
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error: any) {
      console.error('Error updating password:', error)
      Swal.fire({
        title: 'Error',
        text: error.message || 'Error al actualizar la contraseña',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <UserCog className="w-8 h-8 text-neon-green" />
        <div>
          <h1 className="text-3xl font-bold dark:text-white text-gray-900">Configuración</h1>
          <p className="dark:text-gray-400 text-gray-600">Gestiona tu perfil y preferencias</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de Perfil */}
        <div className="card">
          <h2 className="text-xl font-bold mb-6 dark:text-white text-gray-900">Información del Perfil</h2>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 dark:text-white text-gray-900">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                className="input-field"
                placeholder="tu@email.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2 dark:text-white text-gray-900">
                Nombre
              </label>
              <input
                id="name"
                type="text"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                className="input-field"
                placeholder="Tu nombre"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={loading}
            >
              <Save className="w-5 h-5" />
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>

        {/* Formulario de Contraseña */}
        <div className="card">
          <h2 className="text-xl font-bold mb-6 dark:text-white text-gray-900">Cambiar Contraseña</h2>
          
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium mb-2 dark:text-white text-gray-900">
                Contraseña Actual *
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="input-field pr-10"
                  placeholder="Ingresa tu contraseña actual"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 dark:text-gray-400 text-gray-600 hover:dark:text-white hover:text-gray-900"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs dark:text-gray-500 text-gray-500 mt-1">
                Requerida para cambiar la contraseña
              </p>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium mb-2 dark:text-white text-gray-900">
                Nueva Contraseña *
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="input-field pr-10"
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 dark:text-gray-400 text-gray-600 hover:dark:text-white hover:text-gray-900"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 dark:text-white text-gray-900">
                Confirmar Nueva Contraseña *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="input-field pr-10"
                  placeholder="Confirma tu nueva contraseña"
                  minLength={6}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 dark:text-gray-400 text-gray-600 hover:dark:text-white hover:text-gray-900"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={loading || !passwordData.currentPassword}
            >
              <Save className="w-5 h-5" />
              {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

