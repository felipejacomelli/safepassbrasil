'use client'

import { Suspense } from 'react'
import { Bell, BellOff, CheckCircle, AlertTriangle, DollarSign, ArrowUpRight } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useNotifications } from '@/hooks/use-notifications'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatCurrency } from '@/utils/formatCurrency'
import Link from 'next/link'

// ✅ PRÁTICA NEXT.JS: Componente com Suspense
export default function NotificationBellModern() {
  const { user, isAuthenticated } = useAuth()

  if (!user || !isAuthenticated) {
    return null
  }

  return (
    <Suspense fallback={<NotificationBellSkeleton />}>
      <NotificationBellContent />
    </Suspense>
  )
}

// ✅ PRÁTICA NEXT.JS: Componente que consome dados
function NotificationBellContent() {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications({
    enableAutoRefresh: true,
    refreshInterval: 60000, // 1 minuto
    cacheTimeout: 30000, // 30 segundos
    limit: 5
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'escrow_created':
      case 'escrow_released':
      case 'escrow_refunded':
      case 'escrow_expired':
        return <DollarSign className="h-4 w-4 text-green-600" />
      case 'dispute_opened':
      case 'dispute_resolved':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'transfer_requested':
      case 'transfer_approved':
      case 'transfer_rejected':
        return <ArrowUpRight className="h-4 w-4 text-blue-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500'
      case 'high': return 'text-orange-500'
      case 'medium': return 'text-blue-500'
      case 'low': return 'text-gray-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-6 px-2 text-xs"
            >
              Marcar todas como lidas
            </Button>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="p-4 text-center text-sm text-gray-500">
            Carregando notificações...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            Nenhuma notificação
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex items-start gap-3 p-3 cursor-pointer"
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getTypeIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium ${getPriorityColor(notification.priority)}`}>
                      {notification.title}
                    </p>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notification.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href="/dashboard/notifications" className="flex items-center justify-center">
            Ver todas as notificações
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ✅ PRÁTICA NEXT.JS: Loading skeleton
function NotificationBellSkeleton() {
  return (
    <Button variant="ghost" size="sm" className="relative" disabled>
      <Bell className="h-5 w-5" />
      <div className="absolute -top-1 -right-1 h-5 w-5 bg-gray-200 rounded-full animate-pulse" />
    </Button>
  )
}
