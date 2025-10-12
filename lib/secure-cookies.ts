/**
 * Utilitários para gerenciar cookies seguros
 * Baseado nas melhores práticas do Next.js
 */

interface CookieOptions {
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
  maxAge?: number
  path?: string
  domain?: string
}

/**
 * Define um cookie seguro no lado do cliente
 * @param name Nome do cookie
 * @param value Valor do cookie
 * @param options Opções do cookie
 */
export function setSecureCookie(
  name: string, 
  value: string, 
  options: CookieOptions = {}
): void {
  if (typeof window === 'undefined') return

  const {
    httpOnly = false, // httpOnly não pode ser definido no cliente
    secure = process.env.NODE_ENV === 'production',
    sameSite = 'lax', // Mudança para 'lax' para melhor compatibilidade
    maxAge = 7 * 24 * 60 * 60, // 7 dias em segundos
    path = '/',
    domain
  } = options

  let cookieString = `${name}=${encodeURIComponent(value)}`
  
  if (maxAge) {
    cookieString += `; Max-Age=${maxAge}`
  }
  
  if (path) {
    cookieString += `; Path=${path}`
  }
  
  if (domain) {
    cookieString += `; Domain=${domain}`
  }
  
  if (secure) {
    cookieString += `; Secure`
  }
  
  if (sameSite) {
    cookieString += `; SameSite=${sameSite}`
  }

  document.cookie = cookieString
}

/**
 * Obtém um cookie do lado do cliente
 * @param name Nome do cookie
 * @returns Valor do cookie ou null se não encontrado
 */
export function getSecureCookie(name: string): string | null {
  if (typeof window === 'undefined') return null

  const cookies = document.cookie.split(';')
  
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=')
    if (cookieName === name) {
      return decodeURIComponent(cookieValue)
    }
  }
  
  return null
}

/**
 * Remove um cookie
 * @param name Nome do cookie
 * @param path Caminho do cookie
 * @param domain Domínio do cookie
 */
export function removeSecureCookie(
  name: string, 
  path: string = '/', 
  domain?: string
): void {
  if (typeof window === 'undefined') return

  let cookieString = `${name}=; Max-Age=0; Path=${path}`
  
  if (domain) {
    cookieString += `; Domain=${domain}`
  }

  document.cookie = cookieString
}

/**
 * Define um cookie de autenticação seguro
 * @param token Token de autenticação
 * @param refreshToken Token de refresh (opcional)
 */
export function setAuthCookies(token: string, refreshToken?: string): void {
  // Cookie principal de autenticação
  setSecureCookie('authToken', token, {
    secure: process.env.NODE_ENV === 'production', // Apenas secure em produção
    sameSite: 'lax', // Mudança para 'lax' para melhor compatibilidade
    maxAge: 60 * 60, // 1 hora
    path: '/'
  })

  // Cookie de refresh token (se fornecido)
  if (refreshToken) {
    setSecureCookie('refreshToken', refreshToken, {
      secure: process.env.NODE_ENV === 'production', // Apenas secure em produção
      sameSite: 'lax', // Mudança para 'lax' para melhor compatibilidade
      maxAge: 7 * 24 * 60 * 60, // 7 dias
      path: '/'
    })
  }
}

/**
 * Remove todos os cookies de autenticação
 */
export function clearAuthCookies(): void {
  removeSecureCookie('authToken')
  removeSecureCookie('refreshToken')
  removeSecureCookie('userData')
}

/**
 * Obtém o token de autenticação dos cookies
 * @returns Token de autenticação ou null
 */
export function getAuthToken(): string | null {
  return getSecureCookie('authToken')
}

/**
 * Obtém o refresh token dos cookies
 * @returns Refresh token ou null
 */
export function getRefreshToken(): string | null {
  return getSecureCookie('refreshToken')
}

/**
 * Verifica se o usuário está autenticado baseado nos cookies
 * @returns true se autenticado, false caso contrário
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken()
  return token !== null && token !== 'null' && token !== 'undefined'
}
