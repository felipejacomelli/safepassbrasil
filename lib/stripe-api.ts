import { loadStripe, Stripe } from '@stripe/stripe-js'

// Configurações do Stripe
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SHA30PqalO77yqoviGb7ilAv1soTTGQFrbBGNTtXNz2eNTHkEWAJypPiqi0I1cb7An5iSH8pcrOrHGyw4J6IDrr00DFeDNpCm'
// ✅ TEMP: Hardcode para forçar produção a usar Render
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://reticket-backend.onrender.com'
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')

// Instância do Stripe
let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY)
  }
  return stripePromise
}

// Interfaces
export interface CreatePaymentIntentRequest {
  amount: number
  description: string
  metadata?: Record<string, any>
}

export interface CreatePaymentIntentResponse {
  success: boolean
  payment_intent_id: string
  client_secret: string
  amount: number
  currency: string
  status: string
}

export interface PaymentStatusResponse {
  success: boolean
  payment_intent_id: string
  status: string
  amount: number
  currency: string
  client_secret: string
  payment_method?: any
  charges?: any[]
}

export interface ConfirmPaymentRequest {
  payment_intent_id: string
}

export interface ConfirmPaymentResponse {
  success: boolean
  status: string
  amount: number
  currency: string
}

export interface CancelPaymentRequest {
  payment_intent_id: string
}

export interface CancelPaymentResponse {
  success: boolean
  status: string
}

export interface CreateRefundRequest {
  payment_intent_id: string
  amount?: number
  reason?: string
  description?: string
}

export interface CreateRefundResponse {
  success: boolean
  refund_id: string
  status: string
  amount: number
  currency: string
}

export interface CustomerInfoResponse {
  success: boolean
  customer_id: string
  email: string
  name: string
  phone?: string
}

export interface PaymentMethod {
  id: string
  name: string
  enabled: boolean
  types: string[]
}

export interface PaymentMethodsResponse {
  success: boolean
  payment_methods: PaymentMethod[]
}

// Classe principal da API Stripe
export class StripeApiClient {
  private baseUrl: string
  private timeout: number

  constructor(baseUrl: string = API_BASE_URL, timeout: number = 30000) {
    this.baseUrl = baseUrl
    this.timeout = timeout
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api/v1/payments/stripe/${endpoint}`
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      timeout: this.timeout,
    }

    // Adicionar token de autenticação se disponível
    const token = localStorage.getItem('token')
    if (token) {
      defaultOptions.headers = {
        ...defaultOptions.headers,
        'Authorization': `Token ${token}`,
      }
    }

    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  // Criar Payment Intent
  async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse> {
    return this.makeRequest<CreatePaymentIntentResponse>('create-intent/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Confirmar pagamento
  async confirmPayment(data: ConfirmPaymentRequest): Promise<ConfirmPaymentResponse> {
    return this.makeRequest<ConfirmPaymentResponse>('confirm/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Obter status do pagamento
  async getPaymentStatus(paymentIntentId: string): Promise<PaymentStatusResponse> {
    return this.makeRequest<PaymentStatusResponse>(`status/${paymentIntentId}/`)
  }

  // Cancelar pagamento
  async cancelPayment(data: CancelPaymentRequest): Promise<CancelPaymentResponse> {
    return this.makeRequest<CancelPaymentResponse>('cancel/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Criar estorno
  async createRefund(data: CreateRefundRequest): Promise<CreateRefundResponse> {
    return this.makeRequest<CreateRefundResponse>('refund/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Obter informações do cliente
  async getCustomerInfo(): Promise<CustomerInfoResponse> {
    return this.makeRequest<CustomerInfoResponse>('customer/')
  }

  // Obter métodos de pagamento
  async getPaymentMethods(): Promise<PaymentMethodsResponse> {
    return this.makeRequest<PaymentMethodsResponse>('methods/')
  }
}

// Instância padrão
export const stripeApi = new StripeApiClient()

// Funções utilitárias
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount)
}

export const formatCardNumber = (cardNumber: string): string => {
  return cardNumber.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
}

export const formatExpiryDate = (expiryDate: string): string => {
  return expiryDate.replace(/\D/g, '').replace(/(.{2})/, '$1/')
}

export const validateCardNumber = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\s/g, '')
  return /^\d{13,19}$/.test(cleaned)
}

export const validateExpiryDate = (expiryDate: string): boolean => {
  const cleaned = expiryDate.replace(/\D/g, '')
  if (cleaned.length !== 4) return false
  
  const month = parseInt(cleaned.substring(0, 2))
  const year = parseInt(cleaned.substring(2, 4))
  
  if (month < 1 || month > 12) return false
  
  const currentYear = new Date().getFullYear() % 100
  const currentMonth = new Date().getMonth() + 1
  
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return false
  }
  
  return true
}

export const validateCvv = (cvv: string): boolean => {
  const cleaned = cvv.replace(/\D/g, '')
  return /^\d{3,4}$/.test(cleaned)
}

// Constantes
export const PAYMENT_METHODS = {
  CARD: 'card',
  PIX: 'pix',
  BOLETO: 'boleto',
} as const

export const PAYMENT_STATUS = {
  REQUIRES_PAYMENT_METHOD: 'requires_payment_method',
  REQUIRES_CONFIRMATION: 'requires_confirmation',
  REQUIRES_ACTION: 'requires_action',
  PROCESSING: 'processing',
  REQUIRES_CAPTURE: 'requires_capture',
  CANCELED: 'canceled',
  SUCCEEDED: 'succeeded',
} as const

export const REFUND_REASONS = {
  DUPLICATE: 'duplicate',
  FRAUDULENT: 'fraudulent',
  REQUESTED_BY_CUSTOMER: 'requested_by_customer',
} as const




