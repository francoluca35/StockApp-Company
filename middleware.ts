import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Si no hay configuración, permitir acceso (modo demo)
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
    // En modo demo, solo redirigir si intenta acceder a dashboard sin estar en login
    if (req.nextUrl.pathname.startsWith('/dashboard') && !req.nextUrl.pathname.includes('/login')) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    return response
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            req.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: req.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            req.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: req.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Redirect to dashboard if logged in and trying to access login
    if (req.nextUrl.pathname === '/login' && session) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Protect dashboard routes
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
      if (!session) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }
  } catch (error) {
    // Si hay error, permitir acceso pero redirigir dashboard a login
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}

