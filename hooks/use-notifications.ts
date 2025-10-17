import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  priority: string
  is_read: boolean
  created_at: string
}

interface UseNotificationsOptions {
  enableAutoRefresh?: boolean
  refreshInterval?: number
  cacheTimeout?: number
  limit?: number
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { user, isAuthenticated } = useAuth()
  const {
    enableAutoRefresh = true,
    refreshInterval = 60000, // 1 minuto
    cacheTimeout = 30000, // 30 segundos
    limit = 5
  } = options

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  const fetchNotifications = useCallback(async (forceRefresh = false) => {
    if (!user || !isAuthenticated) return

    const cacheKey = `notifications_${user.id}`
    const now = Date.now()

    // ✅ Verificar cache se não for refresh forçado
    if (!forceRefresh) {
      const cachedData = localStorage.getItem(cacheKey)
      if (cachedData) {
        const { data: cached, timestamp } = JSON.parse(cachedData)
        if (now - timestamp < cacheTimeout) {
          setNotifications(cached.notifications || [])
          setUnreadCount(cached.unread_count || 0)
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
        console.log('Nenhum token encontrado, pulando busca de notificações')
        return
      }

      // ✅ Buscar notificações e contagem em paralelo
      const [notificationsRes, unreadRes] = await Promise.all([
        fetch(`${apiUrl}/api/escrow/notifications/?limit=${limit}`, {
          headers: { 'Authorization': `Token ${token}` }
        }),
        fetch(`${apiUrl}/api/escrow/notifications/unread-count/`, {
          headers: { 'Authorization': `Token ${token}` }
        })
      ])

      let notificationsData = null
      let unreadData = null

      if (notificationsRes.ok) {
        notificationsData = await notificationsRes.json()
        setNotifications(notificationsData.notifications || [])
      }

      if (unreadRes.ok) {
        unreadData = await unreadRes.json()
        setUnreadCount(unreadData.unread_count || 0)
      }

      setLastFetch(new Date())

      // ✅ Salvar no cache
      if (notificationsData || unreadData) {
        const cacheData = {
          notifications: notificationsData?.notifications || [],
          unread_count: unreadData?.unread_count || 0,
          timestamp: now
        }
        localStorage.setItem(cacheKey, JSON.stringify(cacheData))
      }

    } catch (err) {
      console.error('Erro ao carregar notificações:', err)
      setError('Erro ao carregar notificações')
    } finally {
      setLoading(false)
    }
  }, [user, isAuthenticated, cacheTimeout, limit])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('authToken')

      if (!token) {
        console.log('Nenhum token encontrado para marcar notificação como lida')
        return
      }

      const response = await fetch(`${apiUrl}/api/escrow/notifications/${notificationId}/mark-read/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` }
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, is_read: true }
              : n
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
        
        // ✅ Invalidar cache local
        const cacheKey = `notifications_${user?.id}`
        localStorage.removeItem(cacheKey)
      }
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
    }
  }, [user])

  const markAllAsRead = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('authToken')

      if (!token) {
        console.log('Nenhum token encontrado para marcar todas as notificações como lidas')
        return
      }

      const response = await fetch(`${apiUrl}/api/escrow/notifications/mark-all-read/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` }
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, is_read: true }))
        )
        setUnreadCount(0)
        
        // ✅ Invalidar cache local
        const cacheKey = `notifications_${user?.id}`
        localStorage.removeItem(cacheKey)
      }
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error)
    }
  }, [user])

  // ✅ Auto-refresh se habilitado
  useEffect(() => {
    if (user && isAuthenticated && enableAutoRefresh) {
      fetchNotifications()
      
      const interval = setInterval(() => {
        // ✅ Só atualizar se há notificações não lidas ou passou mais tempo
        const now = new Date()
        const shouldFetch = !lastFetch || 
          (now.getTime() - lastFetch.getTime() > refreshInterval) ||
          unreadCount > 0
        
        if (shouldFetch) {
          fetchNotifications()
        }
      }, refreshInterval)
      
      return () => clearInterval(interval)
    }
  }, [user, isAuthenticated, enableAutoRefresh, refreshInterval, fetchNotifications, lastFetch, unreadCount])

  // ✅ Função para invalidar cache
  const invalidateCache = useCallback(() => {
    if (user) {
      const cacheKey = `notifications_${user.id}`
      localStorage.removeItem(cacheKey)
    }
  }, [user])

  // ✅ Função para refresh manual
  const refresh = useCallback(() => {
    fetchNotifications(true)
  }, [fetchNotifications])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    lastFetch,
    markAsRead,
    markAllAsRead,
    refresh,
    invalidateCache
  }
}



