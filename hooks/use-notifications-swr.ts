import useSWR from 'swr'
import { useAuth } from '@/contexts/auth-context'
import { useCallback } from 'react'

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  priority: string
  is_read: boolean
  created_at: string
}

export interface NotificationStats {
  total_notifications: number
  unread_count: number
}

interface NotificationsResponse {
  notifications: Notification[]
}

interface UnreadCountResponse {
  unread_count: number
}

interface UseNotificationsOptions {
  enableAutoRefresh?: boolean
  refreshInterval?: number
  limit?: number
}

// ✅ Fetcher otimizado com cache automático
const fetcher = async (url: string, token: string) => {
  const response = await fetch(url, {
    headers: { 'Authorization': `Token ${token}` }
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch')
  }
  
  return response.json()
}

export function useNotificationsSWR(options: UseNotificationsOptions = {}) {
  const { user, isAuthenticated } = useAuth()
  const {
    enableAutoRefresh = true,
    refreshInterval = 60000, // 1 minuto
    limit = 5
  } = options

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  // ✅ SWR para notificações com deduplicação automática
  const { 
    data: notificationsData, 
    error: notificationsError, 
    mutate: mutateNotifications,
    isLoading: notificationsLoading 
  } = useSWR<NotificationsResponse>(
    user && isAuthenticated && token 
      ? [`${apiUrl}/api/escrow/notifications/?limit=${limit}`, token] 
      : null,
    ([url, token]: [string, string]) => fetcher(url, token),
    {
      refreshInterval: enableAutoRefresh ? refreshInterval : 0,
      dedupingInterval: 10000, // Deduplica requests em 10s
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      onError: (error) => {
        console.error('Erro ao carregar notificações:', error)
      }
    }
  )

  // ✅ SWR para contagem de não lidas
  const { 
    data: unreadData, 
    error: unreadError, 
    mutate: mutateUnread,
    isLoading: unreadLoading 
  } = useSWR<UnreadCountResponse>(
    user && isAuthenticated && token 
      ? [`${apiUrl}/api/escrow/notifications/unread-count/`, token] 
      : null,
    ([url, token]: [string, string]) => fetcher(url, token),
    {
      refreshInterval: enableAutoRefresh ? refreshInterval : 0,
      dedupingInterval: 10000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      onError: (error) => {
        console.error('Erro ao carregar contagem de não lidas:', error)
      }
    }
  )

  // ✅ Marcar notificação como lida com otimistic update
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!token) return

    // Otimistic update
    mutateNotifications((data: NotificationsResponse | undefined) => {
      if (!data) return data
      return {
        ...data,
        notifications: data.notifications?.map((n: Notification) => 
          n.id === notificationId ? { ...n, is_read: true } : n
        ) || []
      }
    }, false)

    mutateUnread((data: UnreadCountResponse | undefined) => {
      if (!data) return data
      return {
        ...data,
        unread_count: Math.max(0, (data.unread_count || 0) - 1)
      }
    }, false)

    try {
      const response = await fetch(`${apiUrl}/api/escrow/notifications/${notificationId}/mark-read/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` }
      })

      if (!response.ok) {
        // Reverter em caso de erro
        mutateNotifications()
        mutateUnread()
        throw new Error('Failed to mark as read')
      }
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
      // Reverter em caso de erro
      mutateNotifications()
      mutateUnread()
    }
  }, [token, apiUrl, mutateNotifications, mutateUnread])

  // ✅ Marcar todas como lidas com otimistic update
  const markAllAsRead = useCallback(async () => {
    if (!token) return

    // Otimistic update
    mutateNotifications((data: NotificationsResponse | undefined) => {
      if (!data) return data
      return {
        ...data,
        notifications: data.notifications?.map((n: Notification) => ({ ...n, is_read: true })) || []
      }
    }, false)

    mutateUnread((data: UnreadCountResponse | undefined) => {
      if (!data) return data
      return { ...data, unread_count: 0 }
    }, false)

    try {
      const response = await fetch(`${apiUrl}/api/escrow/notifications/mark-all-read/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` }
      })

      if (!response.ok) {
        // Reverter em caso de erro
        mutateNotifications()
        mutateUnread()
        throw new Error('Failed to mark all as read')
      }
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error)
      // Reverter em caso de erro
      mutateNotifications()
      mutateUnread()
    }
  }, [token, apiUrl, mutateNotifications, mutateUnread])

  // ✅ Refresh manual
  const refresh = useCallback(() => {
    mutateNotifications()
    mutateUnread()
  }, [mutateNotifications, mutateUnread])

  // ✅ Invalidar cache
  const invalidateCache = useCallback(() => {
    mutateNotifications()
    mutateUnread()
  }, [mutateNotifications, mutateUnread])

  return {
    notifications: notificationsData?.notifications || [],
    unreadCount: unreadData?.unread_count || 0,
    loading: notificationsLoading || unreadLoading,
    error: notificationsError || unreadError,
    markAsRead,
    markAllAsRead,
    refresh,
    invalidateCache
  }
}

// ✅ Hook adicional para estatísticas de performance
export function useNotificationStats() {
  const { user, isAuthenticated } = useAuth()
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const { data, error, isLoading } = useSWR<NotificationStats>(
    user && isAuthenticated && token 
      ? [`${apiUrl}/api/escrow/notifications/stats/`, token] 
      : null,
    ([url, token]: [string, string]) => fetcher(url, token),
    {
      refreshInterval: 300000, // 5 minutos
      dedupingInterval: 60000, // 1 minuto
      revalidateOnFocus: false,
      revalidateOnReconnect: true
    }
  )

  return {
    stats: data,
    loading: isLoading,
    error
  }
}

