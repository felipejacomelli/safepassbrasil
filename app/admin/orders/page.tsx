"use client"

import { useState } from "react"
import { Download, Filter, ExternalLink, Calendar, UserIcon, Search, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import { formatCurrency } from "@/utils/formatCurrency"

// Mock orders data
const mockOrders = [
  {
    id: "ORD123456",
    user: {
      id: "1",
      name: "João Silva",
      email: "joao.silva@example.com",
    },
    event: {
      id: "rock-in-rio-2025",
      name: "Rock in Rio 2025",
    },
    ticketType: "Pista Premium",
    quantity: 2,
    total: 1500.0,
    status: "completed",
    paymentMethod: "credit-card",
    date: "2025-04-22T14:30:00",
  },
  {
    id: "ORD123457",
    user: {
      id: "2",
      name: "Maria Oliveira",
      email: "maria.oliveira@example.com",
    },
    event: {
      id: "lollapalooza-2025",
      name: "Lollapalooza 2025",
    },
    ticketType: "Pista",
    quantity: 1,
    total: 450.0,
    status: "completed",
    paymentMethod: "pix",
    date: "2025-04-21T10:15:00",
  },
  {
    id: "ORD123458",
    user: {
      id: "3",
      name: "Pedro Santos",
      email: "pedro.santos@example.com",
    },
    event: {
      id: "festival-de-verao-2025",
      name: "Festival de Verão 2025",
    },
    ticketType: "VIP",
    quantity: 2,
    total: 700.0,
    status: "pending",
    paymentMethod: "bank-transfer",
    date: "2025-04-21T16:45:00",
  },
  {
    id: "ORD123459",
    user: {
      id: "4",
      name: "Ana Costa",
      email: "ana.costa@example.com",
    },
    event: {
      id: "show-metallica-2025",
      name: "Show Metallica",
    },
    ticketType: "Camarote",
    quantity: 1,
    total: 550.0,
    status: "completed",
    paymentMethod: "credit-card",
    date: "2025-04-20T09:30:00",
  },
  {
    id: "ORD123460",
    user: {
      id: "5",
      name: "Lucas Ferreira",
      email: "lucas.ferreira@example.com",
    },
    event: {
      id: "show-bruno-mars-2025",
      name: "Show Bruno Mars",
    },
    ticketType: "Pista",
    quantity: 3,
    total: 1950.0,
    status: "failed",
    paymentMethod: "credit-card",
    date: "2025-04-20T11:20:00",
  },
]

export default function AdminOrdersPage() {
  const [orders] = useState(mockOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState("date")
  const [sortDirection, setSortDirection] = useState("desc")
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }

  // Filter and sort orders
  const filteredOrders = orders
    .filter(
      (order) =>
        (order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.event.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (statusFilter === "all" || order.status === statusFilter),
    )
    .sort((a, b) => {
      const fieldA = a[sortField as keyof typeof a]
      const fieldB = b[sortField as keyof typeof b]

      if (typeof fieldA === "string" && typeof fieldB === "string") {
        return sortDirection === "asc" ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA)
      } else if (typeof fieldA === "number" && typeof fieldB === "number") {
        return sortDirection === "asc" ? fieldA - fieldB : fieldB - fieldA
      }
      return 0
    })

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header/Navigation */}
      <header className="bg-black sticky top-0 z-10 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded">
              <div className="w-6 h-6 bg-black rounded"></div>
            </div>
            <span className="text-white text-2xl font-bold">reticket</span>
          </a>

          {/* Navigation Links */}
          <nav className="flex items-center gap-4">
            <a href="/#como-funciona" className="text-white text-sm">
              Como Funciona
            </a>
            <a href="#" className="text-white text-sm">
              WhatsApp
            </a>

            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="bg-transparent border border-primary text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-bold"
                >
                  <UserIcon className="w-4 h-4" />
                  {user.name.split(" ")[0]}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={showUserMenu ? "transform rotate-180" : ""}
                  >
                    <path
                      d="M6 9L12 15L18 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg min-w-[200px] z-50">
                    <div className="p-3 border-b border-zinc-700">
                      <p className="font-medium text-white">{user.name}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>

                    <a href="/account" className="block px-3 py-2 text-white hover:bg-zinc-800 text-sm">
                      Minha Conta
                    </a>

                    <a href="/account/orders" className="block px-3 py-2 text-white hover:bg-zinc-800 text-sm">
                      Meus Pedidos
                    </a>

                    {user.isAdmin && (
                      <a href="/admin" className="block px-3 py-2 text-blue-500 hover:bg-zinc-800 text-sm">
                        Painel Admin
                      </a>
                    )}

                    <div className="border-t border-zinc-700 mt-1">
                      <button
                        onClick={handleLogout}
                        className="block w-full px-3 py-2 text-red-500 hover:bg-zinc-800 text-left text-sm"
                      >
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Gerenciar Pedidos</h1>
            <p className="text-gray-400">Visualize e gerencie todos os pedidos da plataforma</p>
          </div>

          {/* Filters and Search */}
          <div className="bg-zinc-900 rounded-lg p-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Buscar por ID, cliente ou evento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white pl-10 w-full md:w-80"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="all">Todos os Status</option>
                  <option value="completed">Concluído</option>
                  <option value="pending">Pendente</option>
                  <option value="failed">Falha</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="border-zinc-700 text-white bg-transparent hover:bg-zinc-800">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
                <Button className="bg-primary hover:bg-blue-600 text-black">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-zinc-900 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white"
                      onClick={() => handleSort("id")}
                    >
                      ID do Pedido
                      {sortField === "id" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white"
                      onClick={() => handleSort("user")}
                    >
                      Cliente
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white"
                      onClick={() => handleSort("event")}
                    >
                      Evento
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white"
                      onClick={() => handleSort("total")}
                    >
                      Total
                      {sortField === "total" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white"
                      onClick={() => handleSort("status")}
                    >
                      Status
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white"
                      onClick={() => handleSort("date")}
                    >
                      Data
                      {sortField === "date" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-zinc-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{order.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center mr-3">
                            <UserIcon className="w-4 h-4 text-gray-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{order.user.name}</div>
                            <div className="text-sm text-gray-400">{order.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">{order.event.name}</div>
                          <div className="text-sm text-gray-400">
                            {order.ticketType} • Qtd: {order.quantity}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === "completed"
                              ? "bg-green-900 bg-opacity-20 text-green-500"
                              : order.status === "pending"
                                ? "bg-yellow-900 bg-opacity-20 text-yellow-500"
                                : "bg-red-900 bg-opacity-20 text-red-500"
                          }`}
                        >
                          {order.status === "completed"
                            ? "Concluído"
                            : order.status === "pending"
                              ? "Pendente"
                              : "Falha"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-400">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(order.date).toLocaleDateString("pt-BR")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.date).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="text-primary hover:text-blue-400">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredOrders.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-gray-400">Nenhum pedido encontrado com os filtros aplicados.</p>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-zinc-900 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-900 bg-opacity-20 rounded-lg">
                  <UserIcon className="w-6 h-6 text-blue-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total de Pedidos</p>
                  <p className="text-2xl font-bold text-white">{orders.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-900 bg-opacity-20 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Concluídos</p>
                  <p className="text-2xl font-bold text-white">
                    {orders.filter((o) => o.status === "completed").length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-900 bg-opacity-20 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Pendentes</p>
                  <p className="text-2xl font-bold text-white">{orders.filter((o) => o.status === "pending").length}</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-900 bg-opacity-20 rounded-lg">
                  <Download className="w-6 h-6 text-purple-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Receita Total</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(orders.reduce((sum, order) => sum + order.total, 0))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
