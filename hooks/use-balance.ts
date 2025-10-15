import { useState, useEffect, useCallback, useMemo } from 'react'
import { Balance, SaleTicket } from '@/lib/types/orders'

interface UseBalanceProps {
  salesTickets: SaleTicket[]
  soldTickets: SaleTicket[]
}

interface UseBalanceReturn {
  balance: Balance
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useBalance({ salesTickets, soldTickets }: UseBalanceProps): UseBalanceReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calcular saldo pendente (tickets à venda)
  const pendingBalance = useMemo(() => {
    return salesTickets.reduce((sum, ticket) => {
      return sum + (parseFloat(ticket.price) * ticket.quantity)
    }, 0)
  }, [salesTickets])

  // Calcular saldo disponível (tickets vendidos)
  const availableBalance = useMemo(() => {
    return soldTickets.reduce((sum, ticket) => {
      return sum + (parseFloat(ticket.price) * ticket.quantity)
    }, 0)
  }, [soldTickets])

  // Calcular saldo total
  const totalBalance = useMemo(() => {
    return availableBalance + pendingBalance
  }, [availableBalance, pendingBalance])

  const balance: Balance = useMemo(() => ({
    available: availableBalance,
    pending: pendingBalance,
    total: totalBalance
  }), [availableBalance, pendingBalance, totalBalance])

  const refetch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      // O saldo é calculado automaticamente baseado nos tickets
      // Não há necessidade de fazer uma requisição separada
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao calcular saldo'
      setError(errorMessage)
      console.error('Erro ao calcular saldo:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return {
    balance,
    loading,
    error,
    refetch
  }
}