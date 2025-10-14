'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'

interface EscrowData {
  balance: any
  transactions: any[]
  disputes: any[]
  transfers: any[]
  notifications: any[]
  unreadCount: number
}

// ✅ PRÁTICA NEXT.JS: Hook que consome dados do Server Component
export function useEscrowDataModern() {
  const { user, isAuthenticated } = useAuth()
  const [data, setData] = useState<EscrowData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ✅ PRÁTICA NEXT.JS: Buscar dados do Server Component
  const fetchData = useCallback(async () => {
    if (!user || !isAuthenticated) return

    try {
      setLoading(true)
      setError(null)
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        console.log('Nenhum token encontrado')
        return
      }

      // ✅ PRÁTICA NEXT.JS: Parallel fetching com cache nativo
      const [balanceRes, transactionsRes, disputesRes, transfersRes, notificationsRes, unreadRes] = await Promise.all([
        fetch(`${apiUrl}/api/escrow/balance/`, {
          headers: { 'Authorization': `Token ${token}` },
          next: { revalidate: 300 } // ✅ PRÁTICA NEXT.JS: Cache nativo
        }),
        fetch(`${apiUrl}/api/escrow/transactions/`, {
          headers: { 'Authorization': `Token ${token}` },
          next: { revalidate: 600 }
        }),
        fetch(`${apiUrl}/api/escrow/disputes/`, {
          headers: { 'Authorization': `Token ${token}` },
          next: { revalidate: 600 }
        }),
        fetch(`${apiUrl}/api/escrow/transfers/`, {
          headers: { 'Authorization': `Token ${token}` },
          next: { revalidate: 600 }
        }),
        fetch(`${apiUrl}/api/escrow/notifications/`, {
          headers: { 'Authorization': `Token ${token}` },
          next: { revalidate: 60 }
        }),
        fetch(`${apiUrl}/api/escrow/notifications/unread-count/`, {
          headers: { 'Authorization': `Token ${token}` },
          next: { revalidate: 30 }
        })
      ])

      const newData: EscrowData = {
        balance: null,
        transactions: [],
        disputes: [],
        transfers: [],
        notifications: [],
        unreadCount: 0
      }

      if (balanceRes.ok) {
        newData.balance = await balanceRes.json()
      }

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json()
        newData.transactions = transactionsData.escrows || []
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

      if (unreadRes.ok) {
        const unreadData = await unreadRes.json()
        newData.unreadCount = unreadData.unread_count || 0
      }

      setData(newData)

    } catch (err) {
      console.error('Erro ao carregar dados de escrow:', err)
      setError('Erro ao carregar dados de escrow')
    } finally {
      setLoading(false)
    }
  }, [user, isAuthenticated])

  // ✅ PRÁTICA NEXT.JS: Auto-refresh inteligente
  useEffect(() => {
    if (user && isAuthenticated) {
      fetchData()
      
      // ✅ PRÁTICA NEXT.JS: Intervalo baseado em dados críticos
      const interval = setInterval(() => {
        fetchData()
      }, 300000) // 5 minutos
      
      return () => clearInterval(interval)
    }
  }, [user, isAuthenticated, fetchData])

  const refresh = useCallback(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refresh
  }
}


