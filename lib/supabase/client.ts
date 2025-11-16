'use client'

import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Validar que existan las variables de entorno
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    )
  }

  // Detectar si son valores placeholder o de ejemplo
  const isPlaceholder = supabaseUrl.includes('placeholder') || 
                        supabaseKey.includes('placeholder') ||
                        supabaseUrl.includes('tu-proyecto') ||
                        supabaseUrl.includes('ejemplo') ||
                        !supabaseUrl.startsWith('https://') ||
                        supabaseKey.length < 100 // Las keys reales son mucho más largas

  // Si son valores placeholder, usar cliente directo (modo demo)
  if (isPlaceholder) {
    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  }

  // Si hay valores reales, usar createBrowserClient de @supabase/ssr
  // Esto maneja las cookies correctamente en Next.js 14
  return createBrowserClient(supabaseUrl, supabaseKey)
}

export const createSupabaseAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase admin environment variables. Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    )
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

