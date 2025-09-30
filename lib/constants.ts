// Constantes para métodos de pagamento (conforme API Backend)
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'CREDIT_CARD',
  DEBIT_CARD: 'DEBIT_CARD',
  PIX: 'PIX',
  BOLETO: 'BOLETO',
  TRANSFER: 'TRANSFER'
} as const

export type PaymentMethodType = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS]

// Labels amigáveis para exibição
export const PAYMENT_METHOD_LABELS: Record<PaymentMethodType, string> = {
  [PAYMENT_METHODS.CREDIT_CARD]: 'Cartão de Crédito',
  [PAYMENT_METHODS.DEBIT_CARD]: 'Cartão de Débito',
  [PAYMENT_METHODS.PIX]: 'PIX',
  [PAYMENT_METHODS.BOLETO]: 'Boleto Bancário',
  [PAYMENT_METHODS.TRANSFER]: 'Transferência Bancária'
}

// Descrições dos métodos
export const PAYMENT_METHOD_DESCRIPTIONS: Record<PaymentMethodType, string> = {
  [PAYMENT_METHODS.CREDIT_CARD]: 'Aprovação imediata | Parcelamento disponível',
  [PAYMENT_METHODS.DEBIT_CARD]: 'Aprovação imediata | À vista',
  [PAYMENT_METHODS.PIX]: 'Aprovação instantânea',
  [PAYMENT_METHODS.BOLETO]: 'Aprovação em até 2 dias úteis',
  [PAYMENT_METHODS.TRANSFER]: 'Aprovação em até 1 dia útil'
}
