import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'

interface EscrowData {
  balance: any
  escrows: any[]
  disputes: any[]
  transfers: any[]
  notifications: any[]
}

interface UseEscrowDataOptions {
  enableAutoRefresh?: boolean
  refreshInterval?: number
  cacheTimeout?: number
}

export function useEscrowData(options: UseEscrowDataOptions = {}) {
  const { user, isAuthenticated } = useAuth()
  const {
    enableAutoRefresh = true,
    refreshInterval = 300000, // 5 minutos
    cacheTimeout = 120000 // 2 minutos
  } = options

  const [data, setData] = useState<EscrowData>({
    balance: null,
    escrows: [],
    disputes: [],
    transfers: [],
    notifications: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!user || !isAuthenticated) return

    const cacheKey = `escrow_data_${user.id}`
    const now = Date.now()

    // ✅ Verificar cache se não for refresh forçado
    if (!forceRefresh) {
      const cachedData = localStorage.getItem(cacheKey)
      if (cachedData) {
        const { data: cached, timestamp } = JSON.parse(cachedData)
        if (now - timestamp < cacheTimeout) {
          setData(cached)
          setLastFetch(new Date(timestamp))
          return
        }
      }
    }

    try {
      setLoading(true)
      setError(null)
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        console.log('Nenhum token encontrado, pulando busca de dados de escrow')
        return
      }

      // ✅ Buscar dados em paralelo
      const [balanceRes, escrowsRes, disputesRes, transfersRes, notificationsRes] = await Promise.all([
        fetch(`${apiUrl}/api/escrow/balance/`, {
          headers: { 'Authorization': `Token ${token}` }
        }),
        fetch(`${apiUrl}/api/escrow/transactions/`, {
          headers: { 'Authorization': `Token ${token}` }
        }),
        fetch(`${apiUrl}/api/escrow/disputes/`, {
          headers: { 'Authorization': `Token ${token}` }
        }),
        fetch(`${apiUrl}/api/escrow/transfers/`, {
          headers: { 'Authorization': `Token ${token}` }
        }),
        fetch(`${apiUrl}/api/escrow/notifications/`, {
          headers: { 'Authorization': `Token ${token}` }
        })
      ])

      const newData: EscrowData = {
        balance: null,
        escrows: [],
        disputes: [],
        transfers: [],
        notifications: []
      }

      if (balanceRes.ok) {
        newData.balance = await balanceRes.json()
      }

      if (escrowsRes.ok) {
        const escrowsData = await escrowsRes.json()
        newData.escrows = escrowsData.escrows || []
      }

      if (disputesRes.ok) {
        const disputesData = await disputesRes.json()
        newData.disputes = disputesData.disputes || []
      }

      if (transfersRes.ok) {
        const transfersData = await transfersRes.json()
        newData.transfers = transfersData.transfers || []
      }

      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json()
        newData.notifications = notificationsData.notifications || []
      }

      setData(newData)
      setLastFetch(new Date())

      // ✅ Salvar no cache
      const cacheData = {
        data: newData,
        timestamp: now
      }
      localStorage.setItem(cacheKey, JSON.stringify(cacheData))

    } catch (err) {
      console.error('Erro ao carregar dados de escrow:', err)
      setError('Erro ao carregar dados de escrow')
    } finally {
      setLoading(false)
    }
  }, [user, isAuthenticated, cacheTimeout])

  // ✅ Auto-refresh se habilitado
  useEffect(() => {
    if (user && isAuthenticated && enableAutoRefresh) {
      fetchData()
      
      const interval = setInterval(() => {
        fetchData()
      }, refreshInterval)
      
      return () => clearInterval(interval)
    }
  }, [user, isAuthenticated, enableAutoRefresh, refreshInterval, fetchData])

  // ✅ Função para invalidar cache
  const invalidateCache = useCallback(() => {
    if (user) {
      const cacheKey = `escrow_data_${user.id}`
      localStorage.removeItem(cacheKey)
    }
  }, [user])

  // ✅ Função para refresh manual
  const refresh = useCallback(() => {
    fetchData(true)
  }, [fetchData])

  return {
    data,
    loading,
    error,
    lastFetch,
    refresh,
    invalidateCache
  }
}
