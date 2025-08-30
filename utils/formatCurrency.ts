export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1000000) {
    return `R$ ${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `R$ ${(amount / 1000).toFixed(1)}K`
  }
  return formatCurrency(amount)
}

export function parseCurrency(value: string): number {
  return Number.parseFloat(value.replace(/[^\d,]/g, "").replace(",", ".")) || 0
}
