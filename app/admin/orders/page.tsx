"use client"

import { useState } from "react"
import { Search, Download, MoreVertical, Eye, CheckCircle, XCircle, ArrowUpDown, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
  {
    id: "ORD123461",
    user: {
      id: "6",
      name: "Juliana Almeida",
      email: "juliana.almeida@example.com",
    },
    event: {
      id: "rock-in-rio-2025",
      name: "Rock in Rio 2025",
    },
    ticketType: "Pista",
    quantity: 2,
    total: 1000.0,
    status: "pending",
    paymentMethod: "boleto",
    date: "2025-04-19T14:10:00",
  },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(mockOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState("date")
  const [sortDirection, setSortDirection] = useState("desc")

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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Gerenciar Pedidos</h1>
        <Button variant="outline" className="bg-transparent border-zinc-700 text-white hover:bg-zinc-800">
          <Download size={16} className="mr-2" />
          Exportar Pedidos
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Buscar por ID, cliente ou evento..."
            className="pl-10 bg-zinc-900 border-zinc-800 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className={`bg-transparent border-zinc-700 ${statusFilter === "all" ? "text-primary border-primary" : "text-white"}`}
            onClick={() => setStatusFilter("all")}
          >
            Todos
          </Button>
          <Button
            variant="outline"
            className={`bg-transparent border-zinc-700 ${statusFilter === "completed" ? "text-primary border-primary" : "text-white"}`}
            onClick={() => setStatusFilter("completed")}
          >
            Concluídos
          </Button>
          <Button
            variant="outline"
            className={`bg-transparent border-zinc-700 ${statusFilter === "pending" ? "text-primary border-primary" : "text-white"}`}
            onClick={() => setStatusFilter("pending")}
          >
            Pendentes
          </Button>
          <Button
            variant="outline"
            className={`bg-transparent border-zinc-700 ${statusFilter === "failed" ? "text-primary border-primary" : "text-white"}`}
            onClick={() => setStatusFilter("failed")}
          >
            Falhas
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <Card className="bg-zinc-900 border-zinc-800 text-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">
                    <button className="flex items-center" onClick={() => handleSort("id")}>
                      ID do Pedido
                      <ArrowUpDown size={14} className="ml-1" />
                    </button>
                  </th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">
                    <button className="flex items-center" onClick={() => handleSort("user")}>
                      Cliente
                      <ArrowUpDown size={14} className="ml-1" />
                    </button>
                  </th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">
                    <button className="flex items-center" onClick={() => handleSort("event")}>
                      Evento
                      <ArrowUpDown size={14} className="ml-1" />
                    </button>
                  </th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">
                    <button className="flex items-center" onClick={() => handleSort("total")}>
                      Total
                      <ArrowUpDown size={14} className="ml-1" />
                    </button>
                  </th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">
                    <button className="flex items-center" onClick={() => handleSort("status")}>
                      Status
                      <ArrowUpDown size={14} className="ml-1" />
                    </button>
                  </th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">
                    <button className="flex items-center" onClick={() => handleSort("date")}>
                      Data
                      <ArrowUpDown size={14} className="ml-1" />
                    </button>
                  </th>
                  <th className="text-center py-4 px-6 text-gray-400 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-zinc-800">
                    <td className="py-4 px-6 font-medium">{order.id}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <div>
                          <p>{order.user.name}</p>
                          <p className="text-gray-400 text-xs">{order.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p>{order.event.name}</p>
                        <p className="text-gray-400 text-xs">
                          {order.ticketType} x {order.quantity}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium">R$ {order.total.toFixed(2).replace(".", ",")}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          order.status === "completed"
                            ? "bg-green-900 bg-opacity-20 text-green-500"
                            : order.status === "pending"
                              ? "bg-yellow-900 bg-opacity-20 text-yellow-500"
                              : "bg-red-900 bg-opacity-20 text-red-500"
                        }`}
                      >
                        {order.status === "completed" ? "Concluído" : order.status === "pending" ? "Pendente" : "Falha"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        {new Date(order.date).toLocaleDateString("pt-BR")}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700 text-white">
                          <DropdownMenuItem className="cursor-pointer hover:bg-zinc-700">
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Ver Detalhes</span>
                          </DropdownMenuItem>
                          {order.status === "pending" && (
                            <DropdownMenuItem className="cursor-pointer hover:bg-zinc-700">
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              <span>Aprovar</span>
                            </DropdownMenuItem>
                          )}
                          {order.status === "pending" && (
                            <DropdownMenuItem className="cursor-pointer hover:bg-zinc-700">
                              <XCircle className="mr-2 h-4 w-4 text-red-500" />
                              <span>Rejeitar</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="cursor-pointer hover:bg-zinc-700">
                            <Download className="mr-2 h-4 w-4" />
                            <span>Baixar Comprovante</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
