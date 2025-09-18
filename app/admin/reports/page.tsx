"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Calendar,
  DollarSign,
  ShoppingCart,
  Activity,
  Download,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  Eye,
  UserCheck,
  Ticket,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react"
import { adminApi, AdminDashboardStats } from "@/lib/api"

// Tipos para métricas e relatórios
interface MetricCard {
  title: string
  value: string | number
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  icon: React.ReactNode
  description?: string
}

interface ChartData {
  name: string
  value: number
  color?: string
}

interface RevenueData {
  month: string
  revenue: number
  transactions: number
  users: number
}

interface TopEvent {
  id: string
  name: string
  sales: number
  revenue: number
  date: string
  status: 'active' | 'completed' | 'cancelled'
}

interface UserActivity {
  date: string
  registrations: number
  activeUsers: number
  transactions: number
}

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState("30d")
  const [reportType, setReportType] = useState("overview")
  const [refreshing, setRefreshing] = useState(false)
  const [dashboardStats, setDashboardStats] = useState<AdminDashboardStats | null>(null)

  // Estados para dados transformados
  const [metrics, setMetrics] = useState<MetricCard[]>([])
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [categoryData, setCategoryData] = useState<ChartData[]>([])
  const [topEvents, setTopEvents] = useState<TopEvent[]>([])
  const [userActivity, setUserActivity] = useState<UserActivity[]>([])

  // Carregar dados da API
  const loadReportsData = async () => {
    try {
      setLoading(true)
      
      // Carregar estatísticas do dashboard
      const stats = await adminApi.getDashboardStats()
      setDashboardStats(stats)
      
      // Transformar dados para métricas
      const transformedMetrics: MetricCard[] = [
        {
          title: "Receita Total",
          value: `R$ ${parseFloat(stats.total_revenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          change: 12.5,
          changeType: "increase",
          icon: <DollarSign className="w-6 h-6" />,
          description: "Total de vendas"
        },
        {
          title: "Usuários Ativos",
          value: stats.total_users.toLocaleString('pt-BR'),
          change: 8.2,
          changeType: "increase",
          icon: <Users className="w-6 h-6" />,
          description: "Usuários cadastrados"
        },
        {
          title: "Pedidos",
          value: stats.total_orders.toLocaleString('pt-BR'),
          change: -2.1,
          changeType: "decrease",
          icon: <ShoppingCart className="w-6 h-6" />,
          description: "Total de pedidos"
        },
        {
          title: "Eventos Ativos",
          value: stats.total_events.toLocaleString('pt-BR'),
          change: 15.3,
          changeType: "increase",
          icon: <Calendar className="w-6 h-6" />,
          description: "Eventos disponíveis"
        },
        {
          title: "Taxa de Conversão",
          value: "3.2%",
          change: 0.5,
          changeType: "increase",
          icon: <TrendingUp className="w-6 h-6" />,
          description: "Visitantes → Compradores"
        },
        {
          title: "Ticket Médio",
          value: stats.total_orders > 0 ? 
            `R$ ${(parseFloat(stats.total_revenue) / stats.total_orders).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 
            "R$ 0,00",
          change: -1.8,
          changeType: "decrease",
          icon: <Ticket className="w-6 h-6" />,
          description: "Valor médio por pedido"
        }
      ]
      
      setMetrics(transformedMetrics)
      
      // Dados mockados para gráficos (podem ser implementados posteriormente)
      setRevenueData([
        { month: "Jan", revenue: 45000, transactions: 234, users: 1200 },
        { month: "Fev", revenue: 52000, transactions: 267, users: 1350 },
        { month: "Mar", revenue: 48000, transactions: 245, users: 1280 },
        { month: "Abr", revenue: 61000, transactions: 312, users: 1450 },
        { month: "Mai", revenue: 55000, transactions: 289, users: 1380 },
        { month: "Jun", revenue: 67000, transactions: 334, users: 1520 }
      ])
      
      setCategoryData([
        { name: "Shows", value: 35, color: "#3b82f6" },
        { name: "Esportes", value: 25, color: "#10b981" },
        { name: "Teatro", value: 20, color: "#f59e0b" },
        { name: "Festivais", value: 15, color: "#ef4444" },
        { name: "Outros", value: 5, color: "#8b5cf6" }
      ])
      
      setTopEvents([
        {
          id: "1",
          name: "Festival de Verão 2024",
          sales: 1250,
          revenue: 125000,
          date: "2024-02-15",
          status: "active"
        },
        {
          id: "2", 
          name: "Show Rock Nacional",
          sales: 980,
          revenue: 98000,
          date: "2024-02-20",
          status: "active"
        },
        {
          id: "3",
          name: "Teatro Musical",
          sales: 750,
          revenue: 75000,
          date: "2024-02-10",
          status: "completed"
        }
      ])
      
      setUserActivity([
        { date: "2024-02-01", registrations: 45, activeUsers: 1250, transactions: 89 },
        { date: "2024-02-02", registrations: 52, activeUsers: 1280, transactions: 95 },
        { date: "2024-02-03", registrations: 38, activeUsers: 1220, transactions: 78 },
        { date: "2024-02-04", registrations: 61, activeUsers: 1340, transactions: 102 },
        { date: "2024-02-05", registrations: 47, activeUsers: 1290, transactions: 87 },
        { date: "2024-02-06", registrations: 55, activeUsers: 1320, transactions: 94 },
        { date: "2024-02-07", registrations: 49, activeUsers: 1300, transactions: 91 }
      ])
      
    } catch (error) {
      console.error('Erro ao carregar dados dos relatórios:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReportsData()
  }, [dateRange])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadReportsData()
    setRefreshing(false)
  }

  const handleExport = () => {
    // Implementar exportação de relatórios
    console.log("Exportando relatórios...")
  }

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  }

  const formatNumber = (value: number) => {
    return value.toLocaleString('pt-BR')
  }

  const getChangeIcon = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'decrease':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getChangeColor = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return 'text-green-500'
      case 'decrease':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Ativo</Badge>
      case 'completed':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Concluído</Badge>
      case 'cancelled':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Cancelado</Badge>
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Carregando relatórios...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Relatórios</h1>
          <p className="text-gray-400">Análise detalhada de performance e métricas</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40 bg-zinc-900 border-zinc-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-zinc-800"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-400">
                  {metric.title}
                </CardTitle>
                <div className="text-gray-400">
                  {metric.icon}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-white">
                  {metric.value}
                </div>
                <div className="flex items-center gap-2">
                  {getChangeIcon(metric.changeType)}
                  <span className={`text-sm font-medium ${getChangeColor(metric.changeType)}`}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                  {metric.description && (
                    <span className="text-xs text-gray-500">
                      {metric.description}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs for different report views */}
      <Tabs value={reportType} onValueChange={setReportType} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-zinc-900">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Receita por Mês
                </CardTitle>
                <CardDescription>
                  Evolução da receita nos últimos 6 meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueData.map((data, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 text-sm text-gray-400">{data.month}</div>
                        <div className="flex-1">
                          <div className="w-full bg-zinc-800 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${(data.revenue / 70000) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-white">
                          {formatCurrency(data.revenue)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {data.transactions} vendas
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Distribuição por Categoria
                </CardTitle>
                <CardDescription>
                  Percentual de vendas por categoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-white">{category.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-zinc-800 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full" 
                            style={{ 
                              width: `${category.value}%`,
                              backgroundColor: category.color 
                            }}
                          />
                        </div>
                        <span className="text-sm text-white w-8 text-right">
                          {category.value}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Events */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Top Eventos</CardTitle>
              <CardDescription>
                Eventos com melhor desempenho de vendas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Evento</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Vendas</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Receita</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Data</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topEvents.map((event) => (
                      <tr key={event.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                        <td className="py-4 px-4">
                          <div className="font-medium text-white">{event.name}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-white">{formatNumber(event.sales)}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-white font-medium">
                            {formatCurrency(event.revenue)}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-gray-400">
                            {new Date(event.date).toLocaleDateString('pt-BR')}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(event.status)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Receita Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {dashboardStats ? formatCurrency(parseFloat(dashboardStats.total_revenue)) : 'R$ 0,00'}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">+18.2%</span>
                  <span className="text-xs text-gray-500">vs mês anterior</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Receita Média/Dia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {dashboardStats ? formatCurrency(parseFloat(dashboardStats.total_revenue) / 30) : 'R$ 0,00'}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">+5.7%</span>
                  <span className="text-xs text-gray-500">vs mês anterior</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Taxa de Comissão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {dashboardStats ? formatCurrency(parseFloat(dashboardStats.total_revenue) * 0.05) : 'R$ 0,00'}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-sm text-gray-400">5% das vendas</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Detalhamento de Receita</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueData.map((data, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 p-4 bg-zinc-800 rounded-lg">
                    <div>
                      <div className="text-sm text-gray-400">Mês</div>
                      <div className="text-white font-medium">{data.month}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Receita</div>
                      <div className="text-white font-medium">{formatCurrency(data.revenue)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Transações</div>
                      <div className="text-white font-medium">{formatNumber(data.transactions)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Ticket Médio</div>
                      <div className="text-white font-medium">
                        {formatCurrency(data.revenue / data.transactions)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total de Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {dashboardStats ? formatNumber(dashboardStats.total_users) : '0'}
                </div>
                <div className="text-xs text-gray-500">Usuários cadastrados</div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Usuários Verificados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {dashboardStats ? Math.floor(dashboardStats.total_users * 0.758).toLocaleString('pt-BR') : '0'}
                </div>
                <div className="text-xs text-gray-500">75.8% do total</div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Taxa de Retenção</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">68.4%</div>
                <div className="text-xs text-gray-500">Usuários ativos 30d</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Atividade de Usuários</CardTitle>
              <CardDescription>
                Registros e atividade dos últimos 7 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userActivity.map((activity, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 p-4 bg-zinc-800 rounded-lg">
                    <div>
                      <div className="text-sm text-gray-400">Data</div>
                      <div className="text-white font-medium">
                        {new Date(activity.date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Novos Registros</div>
                      <div className="text-white font-medium">{activity.registrations}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Usuários Ativos</div>
                      <div className="text-white font-medium">{formatNumber(activity.activeUsers)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Transações</div>
                      <div className="text-white font-medium">{activity.transactions}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Eventos Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {dashboardStats ? formatNumber(dashboardStats.total_events) : '0'}
                </div>
                <div className="text-xs text-gray-500">Total de eventos</div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Pedidos Concluídos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {dashboardStats?.orders_by_status?.completed || 0}
                </div>
                <div className="text-xs text-gray-500">Pedidos finalizados</div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Taxa de Ocupação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">78.5%</div>
                <div className="text-xs text-gray-500">Ingressos vendidos</div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Pedidos Cancelados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {dashboardStats?.orders_by_status?.cancelled || 0}
                </div>
                <div className="text-xs text-gray-500">Pedidos cancelados</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Performance de Eventos</CardTitle>
              <CardDescription>
                Análise detalhada dos eventos mais populares
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Evento</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Categoria</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Vendas</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Capacidade</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Ocupação</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Receita</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topEvents.map((event) => (
                      <tr key={event.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                        <td className="py-4 px-4">
                          <div className="font-medium text-white">{event.name}</div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline">Shows</Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-white">{formatNumber(event.sales)}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-gray-400">2.000</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-zinc-700 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${(event.sales / 2000) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-white">
                              {Math.round((event.sales / 2000) * 100)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-white font-medium">
                            {formatCurrency(event.revenue)}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(event.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}