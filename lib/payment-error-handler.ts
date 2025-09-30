/**
 * Tratamento de erros de pagamento com mensagens amigáveis
 */

export interface PaymentError {
  code: string
  message: string
  userMessage: string
  shouldRetry: boolean
}

export class PaymentErrorHandler {
  /**
   * Analisa e formata erros de pagamento
   */
  static handlePaymentError(error: any): PaymentError {
    // Erro de rede/conexão
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        code: 'NETWORK_ERROR',
        message: error.message,
        userMessage: 'Erro de conexão. Verifique sua internet e tente novamente.',
        shouldRetry: true
      }
    }

    // Erro de timeout
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      return {
        code: 'TIMEOUT',
        message: error.message,
        userMessage: 'A requisição demorou muito. Tente novamente.',
        shouldRetry: true
      }
    }

    // Erro de CORS
    if (error.message?.includes('CORS') || error.message?.includes('cross-origin')) {
      return {
        code: 'CORS_ERROR',
        message: error.message,
        userMessage: 'Erro de configuração do servidor. Contate o suporte.',
        shouldRetry: false
      }
    }

    // Erro de autenticação
    if (error.status === 401 || error.message?.includes('unauthorized')) {
      return {
        code: 'AUTH_ERROR',
        message: 'Token inválido ou expirado',
        userMessage: 'Sessão expirada. Faça login novamente.',
        shouldRetry: false
      }
    }

    // Erro de validação (400)
    if (error.status === 400 || error.data?.error) {
      return {
        code: 'VALIDATION_ERROR',
        message: error.data?.error || error.message,
        userMessage: error.data?.error || 'Dados inválidos. Verifique os campos.',
        shouldRetry: false
      }
    }

    // Erro do servidor (500)
    if (error.status >= 500) {
      return {
        code: 'SERVER_ERROR',
        message: error.message,
        userMessage: 'Erro no servidor. Tente novamente em alguns minutos.',
        shouldRetry: true
      }
    }

    // Erro do gateway de pagamento
    if (error.message?.includes('gateway') || error.message?.includes('asaas')) {
      return {
        code: 'GATEWAY_ERROR',
        message: error.message,
        userMessage: 'Erro no processamento do pagamento. Tente novamente.',
        shouldRetry: true
      }
    }

    // Erro genérico
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'Erro desconhecido',
      userMessage: 'Erro ao processar pagamento. Tente novamente ou contate o suporte.',
      shouldRetry: true
    }
  }

  /**
   * Valida dados antes de enviar ao backend
   */
  static validatePaymentData(data: {
    cpf?: string
    phone?: string
    cardNumber?: string
    expiryMonth?: string
    expiryYear?: string
    cvv?: string
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Validar CPF
    if (data.cpf) {
      const cleanCpf = data.cpf.replace(/\D/g, '')
      if (cleanCpf.length !== 11) {
        errors.push('CPF deve ter 11 dígitos')
      }
    }

    // Validar telefone
    if (data.phone) {
      const cleanPhone = data.phone.replace(/\D/g, '')
      if (cleanPhone.length < 10 || cleanPhone.length > 11) {
        errors.push('Telefone inválido. Digite com DDD')
      }
    }

    // Validar número do cartão
    if (data.cardNumber) {
      const cleanCard = data.cardNumber.replace(/\s/g, '')
      if (cleanCard.length < 13 || cleanCard.length > 19) {
        errors.push('Número do cartão inválido')
      }
    }

    // Validar data de expiração
    if (data.expiryMonth && data.expiryYear) {
      const month = parseInt(data.expiryMonth)
      const year = parseInt(data.expiryYear)
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() + 1

      if (month < 1 || month > 12) {
        errors.push('Mês de expiração inválido')
      }

      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        errors.push('Cartão expirado')
      }
    }

    // Validar CVV
    if (data.cvv) {
      const cleanCvv = data.cvv.replace(/\D/g, '')
      if (cleanCvv.length < 3 || cleanCvv.length > 4) {
        errors.push('CVV inválido')
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Sanitiza dados antes de enviar
   */
  static sanitizePaymentData(data: any): any {
    return {
      ...data,
      customer_cpf: data.customer_cpf?.replace(/\D/g, ''),
      customer_phone: data.customer_phone?.replace(/\D/g, ''),
      customer_mobile_phone: data.customer_mobile_phone?.replace(/\D/g, ''),
      credit_card: data.credit_card ? {
        ...data.credit_card,
        number: data.credit_card.number?.replace(/\s/g, ''),
        ccv: data.credit_card.ccv?.replace(/\D/g, '')
      } : undefined
    }
  }
}
