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

  // Calcular saldo pendente e disponível baseado em D+3 do evento
  const { pendingBalance, availableBalance } = useMemo(() => {
    const now = new Date()
    let pending = 0
    let available = 0
    
    // ✅ REGRA DE NEGÓCIO: Apenas tickets transferred geram saldo
    // Tickets anunciados (active) NÃO geram saldo
    const transferredTickets = soldTickets.filter(ticket => ticket.status === 'transferred')
    
    transferredTickets.forEach(ticket => {
      const ticketValue = parseFloat(ticket.price) * ticket.quantity
      
      // Verificar se o ticket tem data do evento
      if (ticket.occurrence?.start_at) {
        const eventDate = new Date(ticket.occurrence.start_at)
        const releaseDate = new Date(eventDate)
        releaseDate.setDate(eventDate.getDate() + 3) // D+3: 3 dias após o evento
        releaseDate.setHours(0, 0, 0, 0) // Zerar hora para comparação por dia
        
        const nowDate = new Date(now)
        nowDate.setHours(0, 0, 0, 0)
        
        if (nowDate >= releaseDate) {
          // ✅ Já passou D+3: saldo disponível para saque
          available += ticketValue
        } else {
          // ⏳ Ainda não passou D+3: saldo pendente (aguardando liberação)
          pending += ticketValue
        }
      } else {
        // ⚠️ Sem data do evento: manter como pendente por segurança
        pending += ticketValue
      }
    })
    
    return { pendingBalance: pending, availableBalance: available }
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