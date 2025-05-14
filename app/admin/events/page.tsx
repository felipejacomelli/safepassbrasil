"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, Calendar, MapPin, Users, MoreVertical, Edit, Trash2, Eye, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Mock events data
const mockEvents = [
  {
    id: "rock-in-rio-2025",
    name: "Rock in Rio 2025",
    date: "19-28 de Setembro, 2025",
    location: "Cidade do Rock, Rio de Janeiro",
    status: "active",
    ticketsSold: 12500,
    totalTickets: 25000,
    revenue: 9375000,
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: "lollapalooza-2025",
    name: "Lollapalooza 2025",
    date: "28-30 de Março, 2025",
    location: "Autódromo de Interlagos, São Paulo",
    status: "active",
    ticketsSold: 8750,
    totalTickets: 20000,
    revenue: 5250000,
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: "festival-de-verao-2025",
    name: "Festival de Verão 2025",
    date: "18-19 de Janeiro, 2025",
    location: "Parque de Exposições, Salvador",
    status: "upcoming",
    ticketsSold: 5000,
    totalTickets: 15000,
    revenue: 2500000,
    image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: "show-metallica-2025",
    name: "Show Metallica",
    date: "25 de Maio, 2025",
    location: "Estádio do Morumbi, São Paulo",
    status: "upcoming",
    ticketsSold: 3500,
    totalTickets: 10000,
    revenue: 1925000,
    image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: "show-bruno-mars-2025",
    name: "Show Bruno Mars",
    date: "10 de Junho, 2025",
    location: "Allianz Parque, São Paulo",
    status: "upcoming",
    ticketsSold: 4200,
    totalTickets: 12000,
    revenue: 2730000,
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: "tomorrowland-brasil-2024",
    name: "Tomorrowland Brasil 2024",
    date: "11-13 de Outubro, 2024",
    location: "Parque Maeda, Itu",
    status: "completed",
    ticketsSold: 18000,
    totalTickets: 18000,
    revenue: 14400000,
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=60",
  },
]

export default function AdminEventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState(mockEvents)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState("name")
  const [sortDirection, setSortDirection] = useState("asc")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)

  // Filter and sort events
  const filteredEvents = events
    .filter(
      (event) =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (statusFilter === "all" || event.status === statusFilter),
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

  // Handle delete
  const handleDelete = () => {
    if (eventToDelete) {
      setEvents(events.filter((event) => event.id !== eventToDelete))
      setDeleteDialogOpen(false)
      setEventToDelete(null)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Gerenciar Eventos</h1>
        <Button className="bg-primary hover:bg-blue-600 text-black" onClick={() => router.push("/admin/events/new")}>
          <Plus size={16} className="mr-2" />
          Novo Evento
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Buscar eventos..."
            className="pl-10 bg-zinc-900 border-zinc-800 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className={`bg-transparent border-zinc-700 ${
              statusFilter === "all" ? "text-primary border-primary" : "text-white"
            }`}
            onClick={() => setStatusFilter("all")}
          >
            Todos
          </Button>
          <Button
            variant="outline"
            className={`bg-transparent border-zinc-700 ${
              statusFilter === "active" ? "text-primary border-primary" : "text-white"
            }`}
            onClick={() => setStatusFilter("active")}
          >
            Ativos
          </Button>
          <Button
            variant="outline"
            className={`bg-transparent border-zinc-700 ${
              statusFilter === "upcoming" ? "text-primary border-primary" : "text-white"
            }`}
            onClick={() => setStatusFilter("upcoming")}
          >
            Próximos
          </Button>
          <Button
            variant="outline"
            className={`bg-transparent border-zinc-700 ${
              statusFilter === "completed" ? "text-primary border-primary" : "text-white"
            }`}
            onClick={() => setStatusFilter("completed")}
          >
            Concluídos
          </Button>
        </div>
      </div>

      {/* Events Table */}
      <Card className="bg-zinc-900 border-zinc-800 text-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">
                    <button className="flex items-center" onClick={() => handleSort("name")}>
                      Evento
                      <ArrowUpDown size={14} className="ml-1" />
                    </button>
                  </th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">
                    <button className="flex items-center" onClick={() => handleSort("date")}>
                      Data
                      <ArrowUpDown size={14} className="ml-1" />
                    </button>
                  </th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">
                    <button className="flex items-center" onClick={() => handleSort("location")}>
                      Local
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
                    <button className="flex items-center" onClick={() => handleSort("ticketsSold")}>
                      Ingressos
                      <ArrowUpDown size={14} className="ml-1" />
                    </button>
                  </th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">
                    <button className="flex items-center" onClick={() => handleSort("revenue")}>
                      Receita
                      <ArrowUpDown size={14} className="ml-1" />
                    </button>
                  </th>
                  <th className="text-center py-4 px-6 text-gray-400 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="border-b border-zinc-800">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md overflow-hidden">
                          <img
                            src={event.image || "/placeholder.svg"}
                            alt={event.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-medium">{event.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        {event.date}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-400" />
                        {event.location}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          event.status === "active"
                            ? "bg-green-900 bg-opacity-20 text-green-500"
                            : event.status === "upcoming"
                              ? "bg-blue-900 bg-opacity-20 text-blue-500"
                              : "bg-gray-900 bg-opacity-20 text-gray-500"
                        }`}
                      >
                        {event.status === "active" ? "Ativo" : event.status === "upcoming" ? "Próximo" : "Concluído"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-gray-400" />
                        {event.ticketsSold.toLocaleString()} / {event.totalTickets.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      R$ {(event.revenue / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700 text-white">
                          <DropdownMenuItem
                            className="cursor-pointer hover:bg-zinc-700"
                            onClick={() => router.push(`/admin/events/${event.id}`)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer hover:bg-zinc-700"
                            onClick={() => router.push(`/event/${event.id}`)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Visualizar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer text-red-500 hover:bg-zinc-700 hover:text-red-500"
                            onClick={() => {
                              setEventToDelete(event.id)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Excluir</span>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription className="text-gray-400">
              Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="bg-transparent border-zinc-700 text-white hover:bg-zinc-800"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
