"use client"

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
import { Bell, BellOff, CheckCircle, AlertTriangle, DollarSign, ArrowUpRight } from 'lucide-react'
import { formatCurrency } from '@/utils/formatCurrency'
import Link from 'next/link'

export default function NotificationBell() {
  const { user, isAuthenticated } = useAuth()
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

  if (!user || !isAuthenticated) {
    return null
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
            <Badge variant="secondary" className="text-xs">
              {unreadCount} não lidas
            </Badge>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        ) : notifications.length > 0 ? (
          <>
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-pointer ${!notification.is_read ? 'bg-blue-50' : ''}`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className="mt-1">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate">{notification.title}</p>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.created_at).toLocaleDateString('pt-BR')} às {new Date(notification.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem asChild>
              <Link href="/dashboard/notifications" className="flex items-center justify-center w-full">
                <Bell className="h-4 w-4 mr-2" />
                Ver todas as notificações
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          <div className="p-4 text-center">
            <BellOff className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

