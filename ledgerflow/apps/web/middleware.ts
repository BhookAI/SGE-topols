import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/', '/access', '/api/auth/validate-code', '/api/auth/client-login']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Portal cliente - verifica código en cookie
  if (pathname.startsWith('/portal/')) {
    const clientCode = req.cookies.get('client_code')?.value
    if (!clientCode) {
      return NextResponse.redirect(new URL('/access', req.url))
    }
    return res
  }

  // Dashboard requiere autenticación de usuario
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/projects') || 
      pathname.startsWith('/clients') || pathname.startsWith('/documents') ||
      pathname.startsWith('/settings') || pathname.startsWith('/api/dashboard') ||
      pathname.startsWith('/api/projects') || pathname.startsWith('/api/documents')) {
    
    if (!session) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
