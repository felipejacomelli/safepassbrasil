"use client"

import { useState, useEffect } from "react"
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
import { adminApi, ApiEvent } from "@/lib/api"

interface Event {
  id: string
  name: string
  date: string
  location: string
  status: "active" | "upcoming" | "completed"
  ticketsSold: number
  totalTickets: number
  revenue: number
  image?: string
  price: string
  category: string
  description: string
}

export default function AdminEventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "upcoming" | "completed">("all")
  const [sortBy, setSortBy] = useState<keyof Event>("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const response = await adminApi.events.getAll()
      
      // Transform API events to frontend format
      const transformedEvents: Event[] = response.events.map((apiEvent: ApiEvent) => ({
        id: apiEvent.id,
        name: apiEvent.name,
        date: apiEvent.date || 'Data não informada', // Use the date string directly as it's already formatted
        location: apiEvent.location,
        status: getEventStatus(apiEvent.created_at), // Use created_at for status calculation since date is a formatted string
        ticketsSold: Math.max(0, (apiEvent.ticket_count || 0) - (apiEvent.ticket_count || 0)), // Placeholder
        totalTickets: apiEvent.ticket_count || 0,
        revenue: parseFloat(apiEvent.price?.replace(/[^\d,]/g, '').replace(',', '.') || '0') * 100, // Convert to cents
        image: apiEvent.image,
        price: apiEvent.price,
         category: apiEvent.category || '',
         description: apiEvent.description || ''
      }))
      
      setEvents(transformedEvents)
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEventStatus = (dateString: string): "active" | "upcoming" | "completed" => {
    const eventDate = new Date(dateString)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
    
    if (eventDateOnly < today) {
      return "completed"
    } else if (eventDateOnly > today) {
      return "upcoming"
    } else {
      return "active"
    }
  }

  const handleSort = (field: keyof Event) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  const handleDelete = async () => {
    if (!eventToDelete) return

    try {
      await adminApi.events.delete(eventToDelete)
      setEvents(events.filter(event => event.id !== eventToDelete))
      setDeleteDialogOpen(false)
      setEventToDelete(null)
    } catch (error) {
      console.error('Erro ao excluir evento:', error)
    }
  }

  // Filter and sort events
  const filteredEvents = events
    .filter((event) => {
      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.location.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || event.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue
      }
      
      return 0
    })

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Carregando eventos...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Eventos</h1>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => router.push('/admin/events/new')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Evento
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-900 border-zinc-700 text-white placeholder-gray-400"
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
                      <button className="flex items-center" onClick={() => handleSort("totalTickets")}>
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
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 px-6 text-center text-gray-400">
                        {searchTerm || statusFilter !== "all" 
                          ? "Nenhum evento encontrado com os filtros aplicados." 
                          : "Nenhum evento cadastrado ainda."}
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((event) => (
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
                    ))
                  )}
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
    </div>
  )
}
