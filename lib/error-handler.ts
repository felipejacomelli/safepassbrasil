// Tratamento de erros robusto para o sistema
export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: Record<string, any>
}

export class ErrorHandler {
  /**
   * Trata erros de API e retorna mensagem amigável
   */
  static handleApiError(error: any): string {
    console.error('API Error:', error)

    // Erro de rede
    if (!error.response) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.'
    }

    const status = error.response?.status
    const data = error.response?.data

    switch (status) {
      case 400:
        return data?.detail || 'Dados inválidos. Verifique os campos e tente novamente.'
      case 401:
        return 'Sessão expirada. Faça login novamente.'
      case 403:
        return 'Você não tem permissão para realizar esta ação.'
      case 404:
        return 'Recurso não encontrado.'
      case 409:
        return 'Conflito de dados. Verifique as informações e tente novamente.'
      case 422:
        return this.handleValidationErrors(data)
      case 429:
        return 'Muitas tentativas. Aguarde um momento e tente novamente.'
      case 500:
        return 'Erro interno do servidor. Tente novamente mais tarde.'
      case 502:
      case 503:
      case 504:
        return 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.'
      default:
        return data?.detail || 'Erro inesperado. Tente novamente.'
    }
  }

  /**
   * Trata erros de validação
   */
  private static handleValidationErrors(data: any): string {
    if (data?.errors) {
      const errors = Object.values(data.errors).flat()
      return errors.join('. ')
    }
    
    if (data?.detail) {
      return data.detail
    }

    return 'Dados inválidos. Verifique os campos e tente novamente.'
  }

  /**
   * Trata erros de validação de formulário
   */
  static handleFormValidationErrors(errors: Record<string, string[]>): Record<string, string[]> {
    const processedErrors: Record<string, string[]> = {}
    
    Object.entries(errors).forEach(([field, messages]) => {
      processedErrors[field] = messages.map(msg => {
        // Traduzir mensagens comuns
        if (msg.includes('This field is required')) {
          return 'Este campo é obrigatório'
        }
        if (msg.includes('Invalid date')) {
          return 'Data inválida'
        }
        if (msg.includes('Invalid email')) {
          return 'Email inválido'
        }
        return msg
      })
    })

    return processedErrors
  }

  /**
   * Trata erros de validação Zod
   */
  static handleZodErrors(error: any): Record<string, string[]> {
    const errors: Record<string, string[]> = {}
    
    if (error.errors) {
      error.errors.forEach((err: any) => {
        const path = err.path.join('.')
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(err.message)
      })
    }

    return errors
  }

  /**
   * Verifica se é erro de rede
   */
  static isNetworkError(error: any): boolean {
    return !error.response && (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error'))
  }

  /**
   * Verifica se é erro de autenticação
   */
  static isAuthError(error: any): boolean {
    return error.response?.status === 401 || error.response?.status === 403
  }

  /**
   * Verifica se é erro de validação
   */
  static isValidationError(error: any): boolean {
    return error.response?.status === 422 || error.response?.status === 400
  }

  /**
   * Retorna mensagem de erro amigável baseada no tipo
   */
  static getFriendlyErrorMessage(error: any): string {
    if (this.isNetworkError(error)) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.'
    }

    if (this.isAuthError(error)) {
      return 'Sessão expirada. Faça login novamente.'
    }

    if (this.isValidationError(error)) {
      return this.handleApiError(error)
    }

    return this.handleApiError(error)
  }
}







