/**
 * Cliente API para pagamentos com retry e timeout
 */

import { PaymentErrorHandler } from './payment-error-handler'

export interface PaymentRequest {
  billing_type: string
  value: number
  description: string
  customer_cpf: string
  customer_phone: string
  customer_mobile_phone: string
  credit_card?: any
  due_date?: string
  installment_count?: number
  items?: any[]
}

export interface PaymentResponse {
  success: boolean
  payment_id?: string
  status?: string
  error?: string
  qr_code?: string
  pix_code?: string
  bank_slip_url?: string
}

export class PaymentApiClient {
  private baseUrl: string
  private timeout: number
  private maxRetries: number

  constructor(
    baseUrl: string = 'http://localhost:8000',
    timeout: number = 60000, // Aumentado para 60 segundos
    maxRetries: number = 2   // Reduzido para 2 tentativas
  ) {
    this.baseUrl = baseUrl
    this.timeout = timeout
    this.maxRetries = maxRetries
  }

  /**
   * Cria um pagamento com retry automático
   */
  async createPayment(
    paymentData: PaymentRequest,
    authToken: string
  ): Promise<PaymentResponse> {
    console.log('🔍 PaymentApiClient.createPayment iniciado')
    console.log('📦 Dados recebidos:', paymentData)
    
    // Validar dados antes de enviar
    console.log('🧪 Iniciando validação de dados...')
    const validation = PaymentErrorHandler.validatePaymentData({
      cpf: paymentData.customer_cpf,
      phone: paymentData.customer_phone,
      cardNumber: paymentData.credit_card?.number,
      expiryMonth: paymentData.credit_card?.expiry_month,
      expiryYear: paymentData.credit_card?.expiry_year,
      cvv: paymentData.credit_card?.ccv
    })

    console.log('✅ Validação:', validation.valid ? 'PASSOU' : 'FALHOU')
    if (!validation.valid) {
      console.error('❌ Erros de validação:', validation.errors)
      throw new Error(validation.errors.join('. '))
    }

    // Sanitizar dados
    console.log('🧹 Sanitizando dados...')
    const sanitizedData = PaymentErrorHandler.sanitizePaymentData(paymentData)
    console.log('✅ Dados sanitizados:', sanitizedData)

    // Tentar requisição com retry
    let lastError: any
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🔄 Tentativa ${attempt}/${this.maxRetries}`)
        
        const response = await this.makeRequest(sanitizedData, authToken)
        
        console.log('✅ Pagamento criado com sucesso')
        return response
        
      } catch (error: any) {
        lastError = error
        const errorInfo = PaymentErrorHandler.handlePaymentError(error)
        
        console.error(`❌ Erro na tentativa ${attempt}:`, errorInfo.userMessage)
        console.error(`📊 Detalhes do erro:`, error)
        
        // Não retentar se não for erro recuperável
        if (!errorInfo.shouldRetry) {
          console.error('❌ Erro não recuperável, parando tentativas')
          throw new Error(errorInfo.userMessage)
        }
        
        // Aguardar antes de retentar (backoff exponencial)
        if (attempt < this.maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
          console.log(`⏳ Aguardando ${delay}ms antes de retentar...`)
          await this.sleep(delay)
        }
      }
    }

    // Se chegou aqui, todas as tentativas falharam
    console.error('❌ Todas as tentativas falharam')
    const finalError = PaymentErrorHandler.handlePaymentError(lastError)
    throw new Error(finalError.userMessage)
  }

  /**
   * Faz a requisição HTTP com timeout
   */
  private async makeRequest(
    data: any,
    authToken: string
  ): Promise<PaymentResponse> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const url = `${this.baseUrl}/api/payment/create/`
      
      console.log('📡 Enviando requisição para:', url)
      console.log('📦 Dados:', { ...data, credit_card: data.credit_card ? '***' : undefined })

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${authToken}`
        },
        body: JSON.stringify(data),
        signal: controller.signal,
        cache: 'no-store'
      })

      clearTimeout(timeoutId)

      console.log('📊 Status da resposta:', response.status)

      const result = await response.json()
      console.log('📦 Resposta completa do backend:', result)

      if (!response.ok) {
        console.error('❌ Erro do backend:', {
          status: response.status,
          data: result,
          url: url
        })
        throw {
          status: response.status,
          data: result,
          message: result.error || result.detail || 'Erro desconhecido'
        }
      }

      return result

    } catch (error: any) {
      clearTimeout(timeoutId)
      
      // Tratar erro de timeout
      if (error.name === 'AbortError') {
        throw {
          name: 'AbortError',
          message: 'A requisição excedeu o tempo limite de ' + (this.timeout / 1000) + 's'
        }
      }

      throw error
    }
  }

  /**
   * Verifica saúde do backend
   */
  async healthCheck(): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // Aumentado para 10 segundos

      const response = await fetch(`${this.baseUrl}/api/payment/methods/`, {
        method: 'GET',
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      
      return response.ok
    } catch (error) {
      console.error('❌ Backend não está respondendo:', error)
      return false
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Instância singleton com URL baseada no ambiente
const getApiUrl = () => {
  // Usa NEXT_PUBLIC_API_URL em todos os ambientes
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
}

export const paymentClient = new PaymentApiClient(getApiUrl())
