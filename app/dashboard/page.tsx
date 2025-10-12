"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Wallet, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Bell
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface UserBalance {
  available_balance: number
  locked_balance: number
  total_balance: number
  pending_transfers: number
}

interface EscrowTransaction {
  id: string
  order_id: string
  locked_amount: number
  status: 'locked' | 'released' | 'refunded' | 'disputed'
  created_at: string
  expires_at: string
  order: {
    id: string
    total_amount: number
    status: number
    created_at: string
  }
}

interface Dispute {
  id: string
  dispute_type: string
  status: string
  disputed_amount: number
  created_at: string
  order_id: string
}

interface TransferRequest {
  id: string
  amount: number
  status: string
  created_at: string
  processed_at?: string
}

interface Notification {
  id: string
  type: string
  title: string
  message: string
  priority: string
  is_read: boolean
  created_at: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [balance, setBalance] = useState<UserBalance | null>(null)
  const [escrows, setEscrows] = useState<EscrowTransaction[]>([])
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [transfers, setTransfers] = useState<TransferRequest[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('token')

      // Buscar dados em paralelo
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

      if (balanceRes.ok) {
        const balanceData = await balanceRes.json()
        setBalance(balanceData)
      }

      if (escrowsRes.ok) {
        const escrowsData = await escrowsRes.json()
        setEscrows(escrowsData.escrows || [])
      }

      if (disputesRes.ok) {
        const disputesData = await disputesRes.json()
        setDisputes(disputesData.disputes || [])
      }

      if (transfersRes.ok) {
        const transfersData = await transfersRes.json()
        setTransfers(transfersData.transfers || [])
      }

      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json()
        setNotifications(notificationsData.notifications || [])
      }

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'locked': { label: 'Bloqueado', variant: 'secondary' as const },
      'released': { label: 'Liberado', variant: 'default' as const },
      'refunded': { label: 'Reembolsado', variant: 'destructive' as const },
      'disputed': { label: 'Em Disputa', variant: 'destructive' as const },
      'open': { label: 'Aberta', variant: 'destructive' as const },
      'under_review': { label: 'Em Análise', variant: 'secondary' as const },
      'resolved': { label: 'Resolvida', variant: 'default' as const },
      'pending': { label: 'Pendente', variant: 'secondary' as const },
      'approved': { label: 'Aprovado', variant: 'default' as const },
      'rejected': { label: 'Rejeitado', variant: 'destructive' as const }
    }

    const config = statusConfig[status] || { label: status, variant: 'secondary' as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
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

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dashboard...</p>
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
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo, {user?.name}! Gerencie seus saldos e transações
          </p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline">
          Atualizar
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(balance?.available_balance || 0, 'BRL')}
            </div>
            <p className="text-xs text-muted-foreground">
              Disponível para saque
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Escrow</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(balance?.locked_balance || 0, 'BRL')}
            </div>
            <p className="text-xs text-muted-foreground">
              Bloqueado em transações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disputas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {disputes.filter(d => d.status === 'open' || d.status === 'under_review').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Em aberto
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notificações</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.filter(n => !n.is_read).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Não lidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="escrows">Escrows</TabsTrigger>
          <TabsTrigger value="disputes">Disputas</TabsTrigger>
          <TabsTrigger value="transfers">Transferências</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Escrows Recentes */}
            <Card>
              <CardHeader>
                <CardTitle>Escrows Recentes</CardTitle>
                <CardDescription>Últimas transações de escrow</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {escrows.slice(0, 5).map((escrow) => (
                    <div key={escrow.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <DollarSign className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Pedido #{escrow.order_id.slice(-8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(escrow.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(escrow.locked_amount, 'BRL')}</p>
                        {getStatusBadge(escrow.status)}
                      </div>
                    </div>
                  ))}
                  {escrows.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhum escrow encontrado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Disputas Recentes */}
            <Card>
              <CardHeader>
                <CardTitle>Disputas Recentes</CardTitle>
                <CardDescription>Últimas disputas abertas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {disputes.slice(0, 5).map((dispute) => (
                    <div key={dispute.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-destructive/10 rounded-full">
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        </div>
                        <div>
                          <p className="font-medium">Pedido #{dispute.order_id.slice(-8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(dispute.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(dispute.disputed_amount, 'BRL')}</p>
                        {getStatusBadge(dispute.status)}
                      </div>
                    </div>
                  ))}
                  {disputes.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhuma disputa encontrada
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Escrows */}
        <TabsContent value="escrows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transações de Escrow</CardTitle>
              <CardDescription>Todas as suas transações de escrow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {escrows.map((escrow) => (
                  <div key={escrow.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <DollarSign className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Pedido #{escrow.order_id.slice(-8)}</p>
                          <p className="text-sm text-muted-foreground">
                            Criado em {new Date(escrow.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{formatCurrency(escrow.locked_amount, 'BRL')}</p>
                        {getStatusBadge(escrow.status)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <p>Expira em: {new Date(escrow.expires_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <p>Status do Pedido: {getStatusBadge(escrow.order.status.toString())}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {escrows.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma transação de escrow encontrada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Disputas */}
        <TabsContent value="disputes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Disputas</CardTitle>
              <CardDescription>Gerencie suas disputas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {disputes.map((dispute) => (
                  <div key={dispute.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-destructive/10 rounded-full">
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        </div>
                        <div>
                          <p className="font-medium">Pedido #{dispute.order_id.slice(-8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {dispute.dispute_type} - {new Date(dispute.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{formatCurrency(dispute.disputed_amount, 'BRL')}</p>
                        {getStatusBadge(dispute.status)}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Ver Detalhes
                      </Button>
                      {dispute.status === 'open' && (
                        <Button size="sm" variant="outline">
                          Responder
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {disputes.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma disputa encontrada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transferências */}
        <TabsContent value="transfers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transferências</CardTitle>
              <CardDescription>Histórico de saques</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transfers.map((transfer) => (
                  <div key={transfer.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <ArrowUpRight className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Saque</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transfer.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{formatCurrency(transfer.amount, 'BRL')}</p>
                        {getStatusBadge(transfer.status)}
                      </div>
                    </div>
                    {transfer.processed_at && (
                      <p className="text-sm text-muted-foreground">
                        Processado em: {new Date(transfer.processed_at).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                ))}
                {transfers.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma transferência encontrada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificações */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>Suas notificações recentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className={`p-4 border rounded-lg ${!notification.is_read ? 'bg-blue-50 border-blue-200' : ''}`}>
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">
                        {getPriorityIcon(notification.priority)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">{notification.title}</p>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleDateString('pt-BR')} às {new Date(notification.created_at).toLocaleTimeString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma notificação encontrada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

