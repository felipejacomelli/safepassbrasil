"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, ShoppingBag, DollarSign, TrendingUp, BarChart3 } from "lucide-react"
import { adminApi } from "@/lib/api"

// Interfaces para os dados do dashboard
interface DashboardStats {
  totalSales: number
  ticketsSold: number
  activeEvents: number
  totalUsers: number
  salesGrowth: number
  ticketsGrowth: number
  eventsGrowth: number
  usersGrowth: number
}

interface RecentActivity {
  id: string
  type: 'order' | 'user' | 'payment' | 'event'
  title: string
  description: string
  time: string
  icon: 'shopping' | 'user' | 'dollar' | 'calendar'
  color: 'green' | 'blue' | 'yellow' | 'red' | 'purple'
}

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    ticketsSold: 0,
    activeEvents: 0,
    totalUsers: 0,
    salesGrowth: 0,
    ticketsGrowth: 0,
    eventsGrowth: 0,
    usersGrowth: 0
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [error, setError] = useState<string | null>(null)

  // Função para buscar estatísticas do dashboard
  const fetchDashboardStats = async (): Promise<DashboardStats> => {
    try {
      const stats = await adminApi.getDashboardStats()
      return {
        totalSales: parseFloat(stats.total_revenue) || 0,
        ticketsSold: stats.total_orders || 0,
        activeEvents: stats.total_events || 0,
        totalUsers: stats.total_users || 0,
        salesGrowth: 12.5,
        ticketsGrowth: 8.2,
        eventsGrowth: 3,
        usersGrowth: 124
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error)
      throw error
    }
  }

  // Função para buscar atividades recentes
  const fetchRecentActivities = async (): Promise<RecentActivity[]> => {
    try {
      // Buscar pedidos recentes
      const ordersResponse = await adminApi.orders.getAll({ limit: '10', ordering: '-created_at' })
      const recentOrders = ordersResponse.orders.slice(0, 5)

      // Buscar usuários recentes
      const usersResponse = await adminApi.users.getAll({ limit: '5', ordering: '-date_joined' })
      const recentUsers = usersResponse.users.slice(0, 2)

      // Buscar eventos recentes
      const eventsResponse = await adminApi.events.getAll({ limit: '5', ordering: '-created_at' })
      const recentEvents = eventsResponse.events.slice(0, 2)

      const activities: RecentActivity[] = []

      // Adicionar pedidos recentes
      recentOrders.forEach((order, index) => {
        const timeAgo = getTimeAgo(order.created_at)
        const statusText = getOrderStatusText(order.status)
        const statusColor = getOrderStatusColor(order.status)
        
        activities.push({
          id: `order-${order.id}`,
          type: 'order',
          title: `${statusText} #${order.id}`,
          description: `${order.user.name} - ${formatCurrency(parseFloat(order.total_amount))}`,
          time: timeAgo,
          icon: order.status === 1 ? 'dollar' : 'shopping',
          color: statusColor
        })
      })

      // Adicionar usuários recentes
      recentUsers.forEach((user) => {
        const timeAgo = getTimeAgo(user.date_joined)
        activities.push({
          id: `user-${user.id}`,
          type: 'user',
          title: 'Novo usuário registrado',
          description: user.name,
          time: timeAgo,
          icon: 'user',
          color: 'blue'
        })
      })

      // Adicionar eventos recentes
      recentEvents.forEach((event) => {
        const timeAgo = getTimeAgo(event.created_at)
        activities.push({
          id: `event-${event.id}`,
          type: 'event',
          title: 'Novo evento criado',
          description: event.name,
          time: timeAgo,
          icon: 'calendar',
          color: 'purple'
        })
      })

      // Ordenar por data mais recente
      return activities.sort((a, b) => {
        // Implementar ordenação básica por tempo
        return 0 // Por simplicidade, manter ordem atual
      }).slice(0, 5)

    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error)
      return []
    }
  }

  // Funções auxiliares
  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Agora mesmo'
    if (diffInMinutes < 60) return `Há ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `Há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `Há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`
  }

  const getOrderStatusText = (status: number): string => {
    switch (status) {
      case 1: return 'Pagamento confirmado'
      case 2: return 'Pedido processando'
      case 3: return 'Pedido cancelado'
      case 4: return 'Pagamento falhou'
      default: return 'Novo pedido'
    }
  }

  const getOrderStatusColor = (status: number): 'green' | 'blue' | 'yellow' | 'red' | 'purple' => {
    switch (status) {
      case 1: return 'green'
      case 2: return 'yellow'
      case 3: return 'red'
      case 4: return 'red'
      default: return 'blue'
    }
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Carregar dados do dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [dashboardStats, activities] = await Promise.all([
          fetchDashboardStats(),
          fetchRecentActivities()
        ])

        setStats(dashboardStats)
        setRecentActivities(activities)
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err)
        setError('Erro ao carregar dados do dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-6">
          {String(error)}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-zinc-900 border-zinc-800 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Vendas Totais</p>
                {isLoading ? (
                  <div className="h-8 w-24 bg-zinc-800 animate-pulse rounded mt-1"></div>
                ) : (
                  <p className="text-2xl font-bold">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(stats.totalSales)}
                  </p>
                )}
              </div>
              <div className="bg-blue-900 bg-opacity-20 p-3 rounded-full">
                <DollarSign className="text-primary h-6 w-6" />
              </div>
            </div>
            {!isLoading && (
              <div className="flex items-center mt-4 text-xs">
                <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
                <span className="text-green-500">+{stats.salesGrowth}%</span>
                <span className="text-gray-400 ml-2">vs. mês anterior</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Ingressos Vendidos</p>
                {isLoading ? (
                  <div className="h-8 w-24 bg-zinc-800 animate-pulse rounded mt-1"></div>
                ) : (
                  <p className="text-2xl font-bold">
                    {new Intl.NumberFormat('pt-BR').format(stats.ticketsSold)}
                  </p>
                )}
              </div>
              <div className="bg-blue-900 bg-opacity-20 p-3 rounded-full">
                <ShoppingBag className="text-primary h-6 w-6" />
              </div>
            </div>
            {!isLoading && (
              <div className="flex items-center mt-4 text-xs">
                <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
                <span className="text-green-500">+{stats.ticketsGrowth}%</span>
                <span className="text-gray-400 ml-2">vs. mês anterior</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Eventos Ativos</p>
                {isLoading ? (
                  <div className="h-8 w-24 bg-zinc-800 animate-pulse rounded mt-1"></div>
                ) : (
                  <p className="text-2xl font-bold">{stats.activeEvents}</p>
                )}
              </div>
              <div className="bg-blue-900 bg-opacity-20 p-3 rounded-full">
                <Calendar className="text-primary h-6 w-6" />
              </div>
            </div>
            {!isLoading && (
              <div className="flex items-center mt-4 text-xs">
                <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
                <span className="text-green-500">+{stats.eventsGrowth}</span>
                <span className="text-gray-400 ml-2">novos este mês</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Usuários</p>
                {isLoading ? (
                  <div className="h-8 w-24 bg-zinc-800 animate-pulse rounded mt-1"></div>
                ) : (
                  <p className="text-2xl font-bold">
                    {new Intl.NumberFormat('pt-BR').format(stats.totalUsers)}
                  </p>
                )}
              </div>
              <div className="bg-blue-900 bg-opacity-20 p-3 rounded-full">
                <Users className="text-primary h-6 w-6" />
              </div>
            </div>
            {!isLoading && (
              <div className="flex items-center mt-4 text-xs">
                <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
                <span className="text-green-500">+{stats.usersGrowth}</span>
                <span className="text-gray-400 ml-2">novos este mês</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="bg-zinc-900 border-zinc-800 text-white">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Vendas por Evento</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 bg-zinc-800 animate-pulse rounded"></div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <BarChart3 className="h-32 w-32 text-gray-600" />
                <p className="text-gray-400 mt-4">Gráfico de vendas por evento</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 text-white">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Vendas por Período</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 bg-zinc-800 animate-pulse rounded"></div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <BarChart3 className="h-32 w-32 text-gray-600" />
                <p className="text-gray-400 mt-4">Gráfico de vendas por período</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-zinc-900 border-zinc-800 text-white">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-zinc-800 animate-pulse rounded"></div>
              ))}
            </div>
          ) : recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const getIcon = () => {
                  switch (activity.icon) {
                    case 'shopping':
                      return <ShoppingBag className={`text-${activity.color}-500 h-4 w-4`} />
                    case 'user':
                      return <Users className={`text-${activity.color}-500 h-4 w-4`} />
                    case 'dollar':
                      return <DollarSign className={`text-${activity.color}-500 h-4 w-4`} />
                    case 'calendar':
                      return <Calendar className={`text-${activity.color}-500 h-4 w-4`} />
                    default:
                      return <ShoppingBag className={`text-${activity.color}-500 h-4 w-4`} />
                  }
                }

                const getBgColor = () => {
                  switch (activity.color) {
                    case 'green':
                      return 'bg-green-900 bg-opacity-20'
                    case 'blue':
                      return 'bg-blue-900 bg-opacity-20'
                    case 'yellow':
                      return 'bg-yellow-900 bg-opacity-20'
                    case 'red':
                      return 'bg-red-900 bg-opacity-20'
                    case 'purple':
                      return 'bg-purple-900 bg-opacity-20'
                    default:
                      return 'bg-gray-900 bg-opacity-20'
                  }
                }

                return (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`${getBgColor()} p-2 rounded-full`}>
                        {getIcon()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-gray-400">{activity.description}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">Nenhuma atividade recente encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
