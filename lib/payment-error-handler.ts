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
      // Verificar se é erro específico do Asaas
      if (error.data?.error?.includes('asaas.com') || error.message?.includes('asaas.com')) {
        return {
          code: 'GATEWAY_ERROR',
          message: error.data?.error || error.message,
          userMessage: 'Erro no processamento do pagamento. Verifique os dados e tente novamente.',
          shouldRetry: false
        }
      }
      
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

    // Erro do gateway de pagamento (Asaas)
    if (error.message?.includes('gateway') || error.message?.includes('asaas') || 
        error.message?.includes('sandbox.asaas.com') || error.message?.includes('400 Client Error')) {
      return {
        code: 'GATEWAY_ERROR',
        message: error.message,
        userMessage: 'Erro no processamento do pagamento. Verifique os dados e tente novamente.',
        shouldRetry: false
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
      
      // Aceitar CPF ofuscado (4 últimos dígitos) ou CPF completo (11 dígitos)
      if (cleanCpf.length === 4) {
        // CPF ofuscado - apenas validar se são 4 dígitos
        if (!/^\d{4}$/.test(cleanCpf)) {
          errors.push('CPF ofuscado deve ter 4 dígitos')
        }
      } else if (cleanCpf.length === 11) {
        // CPF completo - validar algoritmo
        if (cleanCpf === cleanCpf[0].repeat(11)) {
          errors.push('CPF inválido (todos os dígitos iguais)')
        } else {
          // Validar algoritmo do CPF
          if (!this.validateCpfAlgorithm(cleanCpf)) {
            errors.push('CPF inválido')
          }
        }
      } else {
        errors.push('CPF deve ter 4 dígitos (ofuscado) ou 11 dígitos (completo)')
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
  /**
   * Valida CPF usando o algoritmo oficial
   */
  private static validateCpfAlgorithm(cpf: string): boolean {
    // Calcular primeiro dígito verificador
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf[i]) * (10 - i)
    }
    let remainder = sum % 11
    let firstDigit = remainder < 2 ? 0 : 11 - remainder
    
    if (parseInt(cpf[9]) !== firstDigit) {
      return false
    }
    
    // Calcular segundo dígito verificador
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf[i]) * (11 - i)
    }
    remainder = sum % 11
    let secondDigit = remainder < 2 ? 0 : 11 - remainder
    
    return parseInt(cpf[10]) === secondDigit
  }

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
