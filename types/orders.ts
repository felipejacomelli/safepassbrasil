export type TicketStatus = 'available' | 'sold' | 'pending' | 'cancelled' | 'expired'

export type TicketType = 'purchased' | 'sale'

export type TabType = 'compras' | 'vendas'

export type SalesTabType = 'efetivadas' | 'anunciadas'

export type StatusFilter = 'all' | TicketStatus

export type PaymentMethod = 'pix' | 'bank_transfer'

export interface PurchasedTicket {
  id: string
  eventName: string
  eventDate: string
  eventLocation: string
  ticketType: string
  quantity: number
  price: number
  status: TicketStatus
  purchaseDate: string
  qrCode?: string
  downloadUrl?: string
}

export interface SaleTicket {
  id: string
  eventName: string
  eventDate: string
  eventLocation: string
  ticketType: string
  quantity: number
  price: number
  originalPrice: number
  status: TicketStatus
  listingDate: string
  views?: number
  interested?: number
}

export interface Balance {
  available: number
  pending: number
  total: number
}

export interface WithdrawalData {
  amount: number
  paymentMethod: PaymentMethod
  pixKey?: string
  bankAccount?: {
    bank: string
    agency: string
    account: string
    accountType: 'checking' | 'savings'
  }
}