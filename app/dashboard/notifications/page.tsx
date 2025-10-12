"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Bell, 
  BellOff, 
  Mail, 
  MailOpen, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  DollarSign,
  MessageSquare,
  ArrowUpRight,
  Settings,
  MarkAsRead
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  priority: string
  is_read: boolean
  data: any
  created_at: string
  read_at?: string
}

interface NotificationSettings {
  receive_email: boolean
  receive_in_app: boolean
  email_notifications: Record<string, boolean>
  email_summary_frequency: string
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [markingAsRead, setMarkingAsRead] = useState(false)
  const [updatingSettings, setUpdatingSettings] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('token')

      const [notificationsRes, settingsRes] = await Promise.all([
        fetch(`${apiUrl}/api/escrow/notifications/`, {
          headers: { 'Authorization': `Token ${token}` }
        }),
        fetch(`${apiUrl}/api/escrow/notification-settings/`, {
          headers: { 'Authorization': `Token ${token}` }
        })
      ])

      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json()
        setNotifications(notificationsData.notifications || [])
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json()
        setSettings(settingsData)
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('token')

      const response = await fetch(`${apiUrl}/api/escrow/notifications/${notificationId}/mark-read/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` }
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, is_read: true, read_at: new Date().toISOString() }
              : n
          )
        )
      }
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      setMarkingAsRead(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('token')

      const response = await fetch(`${apiUrl}/api/escrow/notifications/mark-all-read/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` }
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
        )
      }
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
    } finally {
      setMarkingAsRead(false)
    }
  }

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      setUpdatingSettings(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('token')

      const response = await fetch(`${apiUrl}/api/escrow/notification-settings/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(newSettings)
      })

      if (response.ok) {
        const updatedSettings = await response.json()
        setSettings(updatedSettings)
      }
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error)
    } finally {
      setUpdatingSettings(false)
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'medium': return <Bell className="h-4 w-4 text-blue-500" />
      case 'low': return <Bell className="h-4 w-4 text-gray-500" />
      default: return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

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
      case 'payment_received':
      case 'payment_failed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const getTypeLabel = (type: string) => {
    const types = {
      'escrow_created': 'Escrow Criado',
      'escrow_released': 'Escrow Liberado',
      'escrow_refunded': 'Escrow Reembolsado',
      'escrow_expired': 'Escrow Expirado',
      'dispute_opened': 'Disputa Aberta',
      'dispute_resolved': 'Disputa Resolvida',
      'transfer_requested': 'Saque Solicitado',
      'transfer_approved': 'Saque Aprovado',
      'transfer_rejected': 'Saque Rejeitado',
      'payment_received': 'Pagamento Recebido',
      'payment_failed': 'Pagamento Falhou',
      'system_alert': 'Alerta do Sistema'
    }
    return types[type] || type
  }

  const filteredNotifications = notifications.filter(notification => {
    switch (activeTab) {
      case 'unread':
        return !notification.is_read
      case 'escrow':
        return notification.type.startsWith('escrow_')
      case 'disputes':
        return notification.type.startsWith('dispute_')
      case 'transfers':
        return notification.type.startsWith('transfer_')
      case 'payments':
        return notification.type.startsWith('payment_')
      default:
        return true
    }
  })

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando notificações...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notificações</h1>
          <p className="text-muted-foreground">
            Gerencie suas notificações e configurações
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button 
              onClick={markAllAsRead} 
              variant="outline" 
              disabled={markingAsRead}
            >
              <MarkAsRead className="h-4 w-4 mr-2" />
              {markingAsRead ? 'Marcando...' : `Marcar ${unreadCount} como lidas`}
            </Button>
          )}
          <Button onClick={() => router.back()} variant="outline">
            Voltar
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{notifications.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
                <p className="text-xs text-muted-foreground">Não lidas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {notifications.filter(n => n.type.startsWith('escrow_')).length}
                </p>
                <p className="text-xs text-muted-foreground">Escrow</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {notifications.filter(n => n.type.startsWith('dispute_')).length}
                </p>
                <p className="text-xs text-muted-foreground">Disputas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Notificações */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>Suas notificações recentes</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="unread">Não lidas</TabsTrigger>
                  <TabsTrigger value="escrow">Escrow</TabsTrigger>
                  <TabsTrigger value="disputes">Disputas</TabsTrigger>
                  <TabsTrigger value="transfers">Saques</TabsTrigger>
                  <TabsTrigger value="payments">Pagamentos</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-4">
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredNotifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          !notification.is_read 
                            ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => !notification.is_read && markNotificationAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="mt-1">
                            {getTypeIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-sm">{notification.title}</p>
                                {getPriorityIcon(notification.priority)}
                                <Badge variant="outline" className="text-xs">
                                  {getTypeLabel(notification.type)}
                                </Badge>
                              </div>
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground">
                                {new Date(notification.created_at).toLocaleDateString('pt-BR')} às {new Date(notification.created_at).toLocaleTimeString('pt-BR')}
                              </p>
                              {notification.is_read && (
                                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                  <MailOpen className="h-3 w-3" />
                                  <span>Lida</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {filteredNotifications.length === 0 && (
                      <div className="text-center py-8">
                        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Nenhuma notificação encontrada</h3>
                        <p className="text-muted-foreground">
                          {activeTab === 'unread' 
                            ? 'Você não possui notificações não lidas'
                            : 'Não há notificações neste filtro'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Configurações */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações
              </CardTitle>
              <CardDescription>Gerencie suas preferências de notificação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {settings && (
                <>
                  {/* Configurações Gerais */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Configurações Gerais</h4>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="receive_email">Receber por Email</Label>
                        <p className="text-sm text-muted-foreground">
                          Receber notificações por email
                        </p>
                      </div>
                      <Switch
                        id="receive_email"
                        checked={settings.receive_email}
                        onCheckedChange={(checked) => 
                          updateSettings({ receive_email: checked })
                        }
                        disabled={updatingSettings}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="receive_in_app">Notificações In-App</Label>
                        <p className="text-sm text-muted-foreground">
                          Mostrar notificações na aplicação
                        </p>
                      </div>
                      <Switch
                        id="receive_in_app"
                        checked={settings.receive_in_app}
                        onCheckedChange={(checked) => 
                          updateSettings({ receive_in_app: checked })
                        }
                        disabled={updatingSettings}
                      />
                    </div>
                  </div>

                  {/* Frequência de Resumo */}
                  <div className="space-y-2">
                    <Label htmlFor="email_summary">Frequência de Resumo</Label>
                    <select
                      id="email_summary"
                      value={settings.email_summary_frequency}
                      onChange={(e) => 
                        updateSettings({ email_summary_frequency: e.target.value })
                      }
                      className="w-full p-2 border rounded-md"
                      disabled={updatingSettings}
                    >
                      <option value="never">Nunca</option>
                      <option value="daily">Diário</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensal</option>
                    </select>
                  </div>

                  {/* Configurações por Tipo */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Notificações por Tipo</h4>
                    
                    {Object.entries(settings.email_notifications).map(([type, enabled]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor={type}>{getTypeLabel(type)}</Label>
                          <p className="text-sm text-muted-foreground">
                            Receber por email
                          </p>
                        </div>
                        <Switch
                          id={type}
                          checked={enabled}
                          onCheckedChange={(checked) => {
                            const newEmailNotifications = {
                              ...settings.email_notifications,
                              [type]: checked
                            }
                            updateSettings({ email_notifications: newEmailNotifications })
                          }}
                          disabled={updatingSettings}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

