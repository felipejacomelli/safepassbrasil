"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, ShoppingBag, DollarSign, TrendingUp, BarChart3 } from "lucide-react"

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>

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
                  <p className="text-2xl font-bold">R$ 125.430,00</p>
                )}
              </div>
              <div className="bg-blue-900 bg-opacity-20 p-3 rounded-full">
                <DollarSign className="text-primary h-6 w-6" />
              </div>
            </div>
            {!isLoading && (
              <div className="flex items-center mt-4 text-xs">
                <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
                <span className="text-green-500">+12.5%</span>
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
                  <p className="text-2xl font-bold">1.234</p>
                )}
              </div>
              <div className="bg-blue-900 bg-opacity-20 p-3 rounded-full">
                <ShoppingBag className="text-primary h-6 w-6" />
              </div>
            </div>
            {!isLoading && (
              <div className="flex items-center mt-4 text-xs">
                <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
                <span className="text-green-500">+8.2%</span>
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
                  <p className="text-2xl font-bold">12</p>
                )}
              </div>
              <div className="bg-blue-900 bg-opacity-20 p-3 rounded-full">
                <Calendar className="text-primary h-6 w-6" />
              </div>
            </div>
            {!isLoading && (
              <div className="flex items-center mt-4 text-xs">
                <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
                <span className="text-green-500">+3</span>
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
                  <p className="text-2xl font-bold">5.678</p>
                )}
              </div>
              <div className="bg-blue-900 bg-opacity-20 p-3 rounded-full">
                <Users className="text-primary h-6 w-6" />
              </div>
            </div>
            {!isLoading && (
              <div className="flex items-center mt-4 text-xs">
                <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
                <span className="text-green-500">+124</span>
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
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-green-900 bg-opacity-20 p-2 rounded-full">
                    <ShoppingBag className="text-green-500 h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Novo pedido #ORD123462</p>
                    <p className="text-xs text-gray-400">Rock in Rio 2025 - 2 ingressos</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">Há 5 minutos</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-900 bg-opacity-20 p-2 rounded-full">
                    <Users className="text-blue-500 h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Novo usuário registrado</p>
                    <p className="text-xs text-gray-400">Carlos Oliveira</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">Há 12 minutos</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-900 bg-opacity-20 p-2 rounded-full">
                    <DollarSign className="text-yellow-500 h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Pagamento confirmado</p>
                    <p className="text-xs text-gray-400">Pedido #ORD123459 - R$ 550,00</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">Há 25 minutos</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-red-900 bg-opacity-20 p-2 rounded-full">
                    <ShoppingBag className="text-red-500 h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Pagamento falhou</p>
                    <p className="text-xs text-gray-400">Pedido #ORD123460 - R$ 1.950,00</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">Há 42 minutos</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-900 bg-opacity-20 p-2 rounded-full">
                    <Calendar className="text-purple-500 h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Novo evento criado</p>
                    <p className="text-xs text-gray-400">Festival de Jazz 2025</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">Há 1 hora</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
