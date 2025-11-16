import { redirect } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'

export default async function Home() {
  try {
    const supabase = createSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      redirect('/dashboard')
    } else {
      redirect('/login')
    }
  } catch (error) {
    // If Supabase is not configured, redirect to login anyway
    // The login page will show the error if needed
    redirect('/login')
  }
}

