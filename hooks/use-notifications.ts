import { useState, useEffect, useCallback, useRef } from 'react'
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
  
  // Refs para controle de estado sem causar re-renders
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastFetchRef = useRef<number>(0)
  const isFetchingRef = useRef<boolean>(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchNotifications = useCallback(async (forceRefresh = false) => {
    if (!user || !isAuthenticated) return

    // ✅ Controle de requests simultâneos
    if (isFetchingRef.current) {
      console.log('Request já em andamento, pulando...')
      return
    }

    const cacheKey = `notifications_${user.id}`
    const now = Date.now()

    // ✅ Verificar cache se não for refresh forçado
    if (!forceRefresh) {
      const cachedData = localStorage.getItem(cacheKey)
      if (cachedData) {
        try {
          const cached = JSON.parse(cachedData)
          if (cached && cached.timestamp && now - cached.timestamp < cacheTimeout) {
            setNotifications(cached.notifications || [])
            setUnreadCount(cached.unread_count || 0)
            setLastFetch(new Date(cached.timestamp))
            return
          }
        } catch (parseError) {
          console.error('Erro ao fazer parse do cache:', parseError)
          // Remove cache inválido
          localStorage.removeItem(cacheKey)
        }
      }
    }

    try {
      isFetchingRef.current = true
      setLoading(true)
      setError(null)
      
      // ✅ Cancelar request anterior se existir
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      // ✅ Criar novo AbortController
      abortControllerRef.current = new AbortController()
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        console.log('Nenhum token encontrado, pulando busca de notificações')
        return
      }

      // ✅ Buscar notificações e contagem em paralelo
      const [notificationsRes, unreadRes] = await Promise.all([
        fetch(`${apiUrl}/api/escrow/notifications/?limit=${limit}`, {
          headers: { 'Authorization': `Token ${token}` },
          signal: abortControllerRef.current.signal
        }),
        fetch(`${apiUrl}/api/escrow/notifications/unread-count/`, {
          headers: { 'Authorization': `Token ${token}` },
          signal: abortControllerRef.current.signal
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
      lastFetchRef.current = now

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
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Erro ao carregar notificações:', err)
        setError('Erro ao carregar notificações')
      }
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }, [user?.id, isAuthenticated, cacheTimeout, limit])

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
  }, [user?.id])

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
  }, [user?.id])

  // ✅ Auto-refresh se habilitado - REFATORADO para evitar loop infinito
  useEffect(() => {
    if (!user || !isAuthenticated || !enableAutoRefresh) return

    // ✅ Fetch inicial
    fetchNotifications()

    // ✅ Intervalo otimizado usando useRef
    intervalRef.current = setInterval(() => {
      const now = Date.now()
      // Só buscar se passou tempo suficiente desde a última busca
      if (now - lastFetchRef.current >= refreshInterval) {
        fetchNotifications()
        lastFetchRef.current = now
      }
    }, refreshInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      // ✅ Cancelar requests pendentes ao desmontar
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [user?.id, isAuthenticated, enableAutoRefresh, refreshInterval, fetchNotifications])

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
