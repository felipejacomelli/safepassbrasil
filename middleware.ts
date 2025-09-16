import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Para aplicações client-side que usam localStorage, o middleware não pode
  // verificar diretamente o token. Vamos permitir o acesso e deixar que
  // os componentes React façam a verificação de autenticação
  const { pathname } = request.nextUrl
  
  // Apenas redireciona se explicitamente não autenticado via cookie
  // (para casos onde o token é definido via cookie em login SSR)
  if (pathname.startsWith('/admin') || pathname.startsWith('/account')) {
    const cookieToken = request.cookies.get('authToken')?.value
    const authHeader = request.headers.get('authorization')?.replace('Bearer ', '')
    
    // Só redireciona se tiver certeza de que não há autenticação
    // Como usamos localStorage, vamos ser mais permissivos aqui
    if (cookieToken === 'null' || cookieToken === 'undefined') {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*', '/login']
}
