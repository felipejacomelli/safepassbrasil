// Tipos específicos para status
export type TicketStatus = 'active' | 'used' | 'cancelled' | 'expired' | 'transferred' | 'verified' | 'pending_verification' | 'invalid' | 'revoked' | 'sold' | 'pending_transfer'
export type OrderStatus = 'pending_payment' |'paid'| 'pending_transfer' | 'seller_marked_transferred' | 'completed' | 'cancelled' | 'buyer_confirmed' | 'dispute_open' | 'refunded'
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled'
export type PaymentMethodType = 'pix' | 'bank' | 'card'

// Interface base para eventos
export interface Event {
  id: string
  name: string
  slug: string
  status: string
}

// Interface para ocorrências
export interface Occurrence {
  id: string
  start_at: string
  city: string
  state: string
}

// Interface base para tickets
export interface BaseTicket {
  id: string
  name: string
  quantity: number
  price: string
  status: TicketStatus
  event: Event
  occurrence?: Occurrence
  created_at: string
  updated_at: string
  user: string
}

// Interfaces específicas
export interface PurchasedTicket extends BaseTicket {
  order?: string
  buyer?: string
}

export interface SaleTicket extends BaseTicket {
  buyer?: string
}

// Interface para pedidos
export interface Order {
  id: string
  total_amount: string
  status: OrderStatus
  created_at: string
  updated_at: string
  transaction: string
  user: string
}

// Interface para transações
export interface Transaction {
  id: string
  amount: string
  status: TransactionStatus
  created_at: string
  updated_at: string
  external_id: string
  payment_method?: string
  user: string
  transaction_type?: string
}

// Interface para métodos de pagamento
export interface PaymentMethod {
  method: PaymentMethodType
  details: {
    pixKey?: string
    bankName?: string
    cardNumber?: string
  }
}

// Tipos para filtros
export type StatusFilter = 'all' | TicketStatus

// Tipos para responses da API
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface OrdersResponse {
  orders: Order[]
  total: number
}

export interface TicketsResponse {
  tickets: PurchasedTicket[] | SaleTicket[]
  total: number
}

// Tipos para estados de loading
export interface LoadingState {
  orders: boolean
  tickets: boolean
  sales: boolean
  soldTickets: boolean
  balance: boolean
}

// Tipos para estados de erro
export interface ErrorState {
  orders: string | null
  tickets: string | null
  sales: string | null
  soldTickets: string | null
  balance: string | null
  general: string | null
}

// Interface para balanço
export interface Balance {
  available: number
  pending: number
  total: number
}

// Tipos para tabs
export type TabType = 'compras' | 'vendas'
export type SalesTabType = 'anunciadas' | 'efetivadas'