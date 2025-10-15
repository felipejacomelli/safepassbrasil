import { useState, useEffect, useCallback } from 'react'
import { Order, OrdersResponse, ApiResponse } from '@/lib/types/orders'

interface UseOrdersReturn {
  orders: Order[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useOrders(): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiRequest('/api/orders')
      const data: OrdersResponse = await response.json()
      
      setOrders(data.orders || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao carregar pedidos'
      setError(errorMessage)
      console.error('Erro ao carregar pedidos:', err)
    } finally {
      setLoading(false)
    }
  }, [apiRequest])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders
  }
}