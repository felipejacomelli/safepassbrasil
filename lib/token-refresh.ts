// Serviço de renovação automática de tokens JWT
import { getAuthToken, getRefreshToken, setAuthCookies, clearAuthCookies } from './secure-cookies'

interface RefreshResponse {
  access: string
  refresh?: string
}

class TokenRefreshService {
  private refreshPromise: Promise<string | null> | null = null
  private isRefreshing = false

  /**
   * Renova o access token usando o refresh token
   */
  async refreshToken(): Promise<string | null> {
    // Evita múltiplas chamadas simultâneas
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = this.performRefresh()
    const result = await this.refreshPromise
    this.refreshPromise = null
    
    return result
  }

  private async performRefresh(): Promise<string | null> {
    try {
      this.isRefreshing = true
      const refreshToken = getRefreshToken()

      if (!refreshToken) {
        console.warn('🔄 Refresh token não encontrado')
        return null
      }

      const API_BASE_URL = process.env.NODE_ENV === 'production' 
        ? 'https://safepass-back-38413960456.southamerica-east1.run.app'
        : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')

      const response = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: refreshToken
        })
      })

      if (!response.ok) {
        console.warn('🔄 Falha ao renovar token:', response.status)
        // Token refresh inválido - limpar tudo
        clearAuthCookies()
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
        }
        return null
      }

      const data: RefreshResponse = await response.json()
      
      // Salvar novos tokens
      setAuthCookies(data.access, data.refresh || refreshToken)
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', data.access)
      }

      console.log('✅ Token renovado com sucesso')
      return data.access

    } catch (error) {
      console.error('❌ Erro ao renovar token:', error)
      return null
    } finally {
      this.isRefreshing = false
    }
  }

  /**
   * Verifica se o token está próximo do vencimento (5 minutos antes)
   */
  isTokenNearExpiry(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const exp = payload.exp * 1000 // Converter para milliseconds
      const now = Date.now()
      const fiveMinutes = 5 * 60 * 1000
      
      return (exp - now) < fiveMinutes
    } catch {
      return true // Se não conseguir decodificar, considerar expirado
    }
  }

  /**
   * Intercepta requisições para renovar token automaticamente
   */
  async interceptRequest(originalFetch: typeof fetch): Promise<typeof fetch> {
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      let token = getAuthToken()

      // Verificar se precisa renovar o token
      if (token && this.isTokenNearExpiry(token) && !this.isRefreshing) {
        console.log('🔄 Token próximo do vencimento, renovando...')
        const newToken = await this.refreshToken()
        if (newToken) {
          token = newToken
        }
      }

      // Adicionar token na requisição
      const headers = new Headers(init?.headers)
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }

      const response = await originalFetch(input, {
        ...init,
        headers
      })

      // Se receber 401, tentar renovar uma vez
      if (response.status === 401 && !this.isRefreshing) {
        console.log('🔄 Recebido 401, tentando renovar token...')
        const newToken = await this.refreshToken()
        
        if (newToken) {
          // Repetir a requisição com o novo token
          headers.set('Authorization', `Bearer ${newToken}`)
          return originalFetch(input, {
            ...init,
            headers
          })
        }
      }

      return response
    }
  }
}

export const tokenRefreshService = new TokenRefreshService()