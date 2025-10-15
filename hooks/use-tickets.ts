import { useState, useEffect, useCallback } from 'react'
import { PurchasedTicket, SaleTicket, TicketsResponse } from '@/lib/types/orders'

interface UseTicketsReturn {
  purchasedTickets: PurchasedTicket[]
  salesTickets: SaleTicket[]
  soldTickets: SaleTicket[]
  loading: {
    purchased: boolean
    sales: boolean
    sold: boolean
  }
  error: {
    purchased: string | null
    sales: string | null
    sold: string | null
  }
  refetch: {
    purchased: () => Promise<void>
    sales: () => Promise<void>
    sold: () => Promise<void>
    all: () => Promise<void>
  }
}

export function useTickets(): UseTicketsReturn {
  const [purchasedTickets, setPurchasedTickets] = useState<PurchasedTicket[]>([])
  const [salesTickets, setSalesTickets] = useState<SaleTicket[]>([])
  const [soldTickets, setSoldTickets] = useState<SaleTicket[]>([])
  
  const [loading, setLoading] = useState({
    purchased: true,
    sales: true,
    sold: true
  })
  
  const [error, setError] = useState({
    purchased: null as string | null,
    sales: null as string | null,
    sold: null as string | null
  })

  const apiRequest = useCallback(async (endpoint: string) => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('Token de autenticação não encontrado')
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`)
    }

    return response
  }, [])

  const fetchPurchasedTickets = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, purchased: true }))
      setError(prev => ({ ...prev, purchased: null }))
      
      const response = await apiRequest('/api/tickets/purchased/')
      const data: TicketsResponse = await response.json()
      
      setPurchasedTickets(data.tickets as PurchasedTicket[] || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar tickets comprados'
      setError(prev => ({ ...prev, purchased: errorMessage }))
      console.error('Erro ao carregar tickets comprados:', err)
    } finally {
      setLoading(prev => ({ ...prev, purchased: false }))
    }
  }, [apiRequest])

  const fetchSalesTickets = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, sales: true }))
      setError(prev => ({ ...prev, sales: null }))
      
      const response = await apiRequest('/api/tickets/')
      const data: TicketsResponse = await response.json()
      
      setSalesTickets(data.tickets as SaleTicket[] || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar tickets à venda'
      setError(prev => ({ ...prev, sales: errorMessage }))
      console.error('Erro ao carregar tickets à venda:', err)
    } finally {
      setLoading(prev => ({ ...prev, sales: false }))
    }
  }, [apiRequest])

  const fetchSoldTickets = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, sold: true }))
      setError(prev => ({ ...prev, sold: null }))
      
      const response = await apiRequest('/api/tickets/sold/')
      const data: TicketsResponse = await response.json()
      
      setSoldTickets(data.tickets as SaleTicket[] || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar tickets vendidos'
      setError(prev => ({ ...prev, sold: errorMessage }))
      console.error('Erro ao carregar tickets vendidos:', err)
    } finally {
      setLoading(prev => ({ ...prev, sold: false }))
    }
  }, [apiRequest])

  const refetchAll = useCallback(async () => {
    await Promise.all([
      fetchPurchasedTickets(),
      fetchSalesTickets(),
      fetchSoldTickets()
    ])
  }, [fetchPurchasedTickets, fetchSalesTickets, fetchSoldTickets])

  useEffect(() => {
    refetchAll()
  }, [refetchAll])

  return {
    purchasedTickets,
    salesTickets,
    soldTickets,
    loading,
    error,
    refetch: {
      purchased: fetchPurchasedTickets,
      sales: fetchSalesTickets,
      sold: fetchSoldTickets,
      all: refetchAll
    }
  }
}