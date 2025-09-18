import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Verificação específica para rotas de admin
  if (pathname.startsWith('/admin')) {
    const cookieToken = request.cookies.get('authToken')?.value
    
    // Redireciona para login se não há token
    if (!cookieToken || cookieToken === 'null' || cookieToken === 'undefined') {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // Para rotas admin, verificamos se o usuário tem permissões de admin
    // Como não podemos acessar localStorage no middleware, vamos criar uma
    // página de verificação que fará essa validação no client-side
    const userDataCookie = request.cookies.get('userData')?.value
    
    if (userDataCookie) {
      try {
        const userData = JSON.parse(userDataCookie)
        // Se o usuário não é admin, redireciona para página não autorizada
        if (!userData.isAdmin) {
          return NextResponse.redirect(new URL('/unauthorized', request.url))
        }
      } catch (error) {
        // Se não conseguir fazer parse dos dados do usuário, redireciona para login
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }
    }
    // Se não há dados do usuário no cookie, permite acesso mas o componente
    // React fará a verificação final
  }
  
  // Verificação para outras rotas protegidas
  if (pathname.startsWith('/account') || pathname.startsWith('/sell') || pathname.includes('/sell')) {
    const cookieToken = request.cookies.get('authToken')?.value
    
    // Só redireciona se tiver certeza de que não há autenticação
    if (cookieToken === 'null' || cookieToken === 'undefined') {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*', '/login', '/sell/:path*', '/event/:path*/sell']
}
