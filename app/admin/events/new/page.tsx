"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, MapPin, Info, ImageIcon, Trash2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function NewEventPage() {
  const router = useRouter()

  // Event form state
  const [eventForm, setEventForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    location: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    imageUrl: "",
    category: "music",
    featured: false,
    status: "draft",
  })

  // Ticket types state
  const [ticketTypes, setTicketTypes] = useState([
    {
      id: "1",
      name: "Pista",
      description: "Acesso à área da pista",
      price: 250,
      quantity: 5000,
      maxPerPurchase: 4,
    },
  ])

  // Handle event form changes
  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    setEventForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  // Add new ticket type
  const addTicketType = () => {
    setTicketTypes([
      ...ticketTypes,
      {
        id: Date.now().toString(),
        name: "",
        description: "",
        price: 0,
        quantity: 0,
        maxPerPurchase: 4,
      },
    ])
  }

  // Remove ticket type
  const removeTicketType = (id: string) => {
    setTicketTypes(ticketTypes.filter((ticket) => ticket.id !== id))
  }

  // Handle ticket type changes
  const handleTicketChange = (id: string, field: string, value: string | number) => {
    setTicketTypes(ticketTypes.map((ticket) => (ticket.id === id ? { ...ticket, [field]: value } : ticket)))
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // In a real app, this would send data to an API
    console.log("Event data:", eventForm)
    console.log("Ticket types:", ticketTypes)

    // Redirect to events list
    router.push("/admin/events")
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Criar Novo Evento</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="bg-transparent border-zinc-700 text-white hover:bg-zinc-800"
            onClick={() => router.push("/admin/events")}
          >
            Cancelar
          </Button>
          <Button className="bg-primary hover:bg-blue-600 text-black" onClick={handleSubmit}>
            <Save size={16} className="mr-2" />
            Salvar Evento
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="bg-zinc-800 border-zinc-700 mb-6">
          <TabsTrigger value="basic" className="data-[state=active]:bg-primary data-[state=active]:text-black">
            Informações Básicas
          </TabsTrigger>
          <TabsTrigger value="tickets" className="data-[state=active]:bg-primary data-[state=active]:text-black">
            Ingressos
          </TabsTrigger>
          <TabsTrigger value="details" className="data-[state=active]:bg-primary data-[state=active]:text-black">
            Detalhes
          </TabsTrigger>
          <TabsTrigger value="preview" className="data-[state=active]:bg-primary data-[state=active]:text-black">
            Pré-visualização
          </TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="bg-zinc-900 border-zinc-800 text-white">
                <CardHeader>
                  <CardTitle className="text-xl">Informações do Evento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome do Evento</Label>
                    <Input
                      id="name"
                      name="name"
                      value={eventForm.name}
                      onChange={handleEventChange}
                      placeholder="Ex: Rock in Rio 2025"
                      className="bg-zinc-800 border-zinc-700 text-white mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={eventForm.description}
                      onChange={handleEventChange}
                      placeholder="Descreva o evento..."
                      className="bg-zinc-800 border-zinc-700 text-white mt-1 min-h-[120px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Data de Início</Label>
                      <div className="relative">
                        <Calendar
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={16}
                        />
                        <Input
                          id="startDate"
                          name="startDate"
                          type="date"
                          value={eventForm.startDate}
                          onChange={handleEventChange}
                          className="bg-zinc-800 border-zinc-700 text-white pl-10 mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="endDate">Data de Término</Label>
                      <div className="relative">
                        <Calendar
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={16}
                        />
                        <Input
                          id="endDate"
                          name="endDate"
                          type="date"
                          value={eventForm.endDate}
                          onChange={handleEventChange}
                          className="bg-zinc-800 border-zinc-700 text-white pl-10 mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime">Horário de Início</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <Input
                          id="startTime"
                          name="startTime"
                          type="time"
                          value={eventForm.startTime}
                          onChange={handleEventChange}
                          className="bg-zinc-800 border-zinc-700 text-white pl-10 mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="endTime">Horário de Término</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <Input
                          id="endTime"
                          name="endTime"
                          type="time"
                          value={eventForm.endTime}
                          onChange={handleEventChange}
                          className="bg-zinc-800 border-zinc-700 text-white pl-10 mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Local</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <Input
                        id="location"
                        name="location"
                        value={eventForm.location}
                        onChange={handleEventChange}
                        placeholder="Ex: Cidade do Rock"
                        className="bg-zinc-800 border-zinc-700 text-white pl-10 mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      name="address"
                      value={eventForm.address}
                      onChange={handleEventChange}
                      placeholder="Endereço completo"
                      className="bg-zinc-800 border-zinc-700 text-white mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        name="city"
                        value={eventForm.city}
                        onChange={handleEventChange}
                        placeholder="Cidade"
                        className="bg-zinc-800 border-zinc-700 text-white mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        name="state"
                        value={eventForm.state}
                        onChange={handleEventChange}
                        placeholder="UF"
                        className="bg-zinc-800 border-zinc-700 text-white mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="zipCode">CEP</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={eventForm.zipCode}
                        onChange={handleEventChange}
                        placeholder="00000-000"
                        className="bg-zinc-800 border-zinc-700 text-white mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="bg-zinc-900 border-zinc-800 text-white">
                <CardHeader>
                  <CardTitle className="text-xl">Imagem do Evento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-zinc-700 rounded-lg p-4 text-center">
                    {eventForm.imageUrl ? (
                      <div className="relative">
                        <img
                          src={eventForm.imageUrl || "/placeholder.svg"}
                          alt="Event preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => setEventForm({ ...eventForm, imageUrl: "" })}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ) : (
                      <div className="py-8">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4 flex text-sm leading-6 text-gray-400">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md bg-zinc-800 px-3 py-2 font-semibold text-white focus-within:outline-none focus-within:ring-2 focus-within:ring-primary"
                          >
                            <span>Fazer upload</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                          </label>
                          <p className="pl-1 pt-2">ou arraste e solte</p>
                        </div>
                        <p className="text-xs leading-5 text-gray-400">PNG, JPG, GIF até 10MB</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="imageUrl">URL da Imagem</Label>
                    <Input
                      id="imageUrl"
                      name="imageUrl"
                      value={eventForm.imageUrl}
                      onChange={handleEventChange}
                      placeholder="https://exemplo.com/imagem.jpg"
                      className="bg-zinc-800 border-zinc-700 text-white mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <select
                      id="category"
                      name="category"
                      value={eventForm.category}
                      onChange={handleEventChange}
                      className="w-full bg-zinc-800 border-zinc-700 text-white rounded-md mt-1 p-2"
                    >
                      <option value="music">Música</option>
                      <option value="sports">Esportes</option>
                      <option value="theater">Teatro</option>
                      <option value="festival">Festival</option>
                      <option value="conference">Conferência</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      name="featured"
                      checked={eventForm.featured}
                      onChange={handleEventChange}
                      className="rounded bg-zinc-800 border-zinc-700 text-primary"
                    />
                    <Label htmlFor="featured">Evento em Destaque</Label>
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      name="status"
                      value={eventForm.status}
                      onChange={handleEventChange}
                      className="w-full bg-zinc-800 border-zinc-700 text-white rounded-md mt-1 p-2"
                    >
                      <option value="draft">Rascunho</option>
                      <option value="upcoming">Próximo</option>
                      <option value="active">Ativo</option>
                      <option value="completed">Concluído</option>
                      <option value="canceled">Cancelado</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tickets Tab */}
        <TabsContent value="details">
          <Card className="bg-zinc-900 border-zinc-800 text-white">
            <CardHeader>
              <CardTitle className="text-xl">Detalhes Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="organizer">Organizador</Label>
                <Input
                  id="organizer"
                  placeholder="Nome do organizador"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                />
              </div>

              <div>
                <Label htmlFor="contactEmail">Email de Contato</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="contato@exemplo.com"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                />
              </div>

              <div>
                <Label htmlFor="contactPhone">Telefone de Contato</Label>
                <Input
                  id="contactPhone"
                  placeholder="(00) 00000-0000"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                />
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="https://exemplo.com"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                />
              </div>

              <div>
                <Label htmlFor="ageRestriction">Restrição de Idade</Label>
                <select
                  id="ageRestriction"
                  className="w-full bg-zinc-800 border-zinc-700 text-white rounded-md mt-1 p-2"
                >
                  <option value="none">Sem restrição</option>
                  <option value="12">12 anos</option>
                  <option value="14">14 anos</option>
                  <option value="16">16 anos</option>
                  <option value="18">18 anos</option>
                </select>
              </div>

              <div>
                <Label htmlFor="additionalInfo">Informações Adicionais</Label>
                <Textarea
                  id="additionalInfo"
                  placeholder="Informações adicionais sobre o evento..."
                  className="bg-zinc-800 border-zinc-700 text-white mt-1 min-h-[120px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview">
          <Card className="bg-zinc-900 border-zinc-800 text-white">
            <CardHeader>
              <CardTitle className="text-xl">Pré-visualização do Evento</CardTitle>
            </CardHeader>
            <CardContent>
              {eventForm.name ? (
                <div>
                  <div className="relative w-full h-64 rounded-lg overflow-hidden mb-6">
                    <img
                      src={
                        eventForm.imageUrl ||
                        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&auto=format&fit=crop&q=60" ||
                        "/placeholder.svg"
                      }
                      alt={eventForm.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                      <div className="p-6">
                        <h2 className="text-3xl font-bold text-white">{eventForm.name}</h2>
                        <div className="flex items-center mt-2 text-gray-300">
                          <Calendar size={16} className="mr-1" />
                          <span>
                            {eventForm.startDate
                              ? new Date(eventForm.startDate).toLocaleDateString("pt-BR")
                              : "Data não definida"}
                          </span>
                          <span className="mx-2">•</span>
                          <MapPin size={16} className="mr-1" />
                          <span>{eventForm.location || "Local não definido"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <h3 className="text-xl font-bold mb-4">Sobre o Evento</h3>
                      <p className="text-gray-300 whitespace-pre-line">
                        {eventForm.description || "Nenhuma descrição fornecida."}
                      </p>

                      <h3 className="text-xl font-bold mt-6 mb-4">Detalhes</h3>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <Calendar className="w-5 h-5 text-primary mr-3 mt-0.5" />
                          <div>
                            <p className="font-medium">Data e Hora</p>
                            <p className="text-gray-300">
                              {eventForm.startDate
                                ? new Date(eventForm.startDate).toLocaleDateString("pt-BR")
                                : "Data não definida"}
                              {eventForm.startTime ? ` às ${eventForm.startTime}` : ""}
                              {eventForm.endDate
                                ? ` até ${new Date(eventForm.endDate).toLocaleDateString("pt-BR")}`
                                : ""}
                              {eventForm.endTime ? ` às ${eventForm.endTime}` : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <MapPin className="w-5 h-5 text-primary mr-3 mt-0.5" />
                          <div>
                            <p className="font-medium">Local</p>
                            <p className="text-gray-300">
                              {eventForm.location || "Local não definido"}
                              {eventForm.address ? `, ${eventForm.address}` : ""}
                              {eventForm.city ? `, ${eventForm.city}` : ""}
                              {eventForm.state ? `-${eventForm.state}` : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <Info className="w-5 h-5 text-primary mr-3 mt-0.5" />
                          <div>
                            <p className="font-medium">Categoria</p>
                            <p className="text-gray-300">
                              {eventForm.category === "music"
                                ? "Música"
                                : eventForm.category === "sports"
                                  ? "Esportes"
                                  : eventForm.category === "theater"
                                    ? "Teatro"
                                    : eventForm.category === "festival"
                                      ? "Festival"
                                      : eventForm.category === "conference"
                                        ? "Conferência"
                                        : "Outro"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-4">Ingressos</h3>
                      {ticketTypes.length > 0 ? (
                        <div className="space-y-4">
                          {ticketTypes.map((ticket) => (
                            <div key={ticket.id} className="bg-zinc-800 rounded-lg p-4">
                              <div className="flex justify-between items-center">
                                <h4 className="font-medium">{ticket.name || "Sem nome"}</h4>
                                <span className="text-primary font-bold">R$ {ticket.price.toFixed(2)}</span>
                              </div>
                              <p className="text-gray-300 text-sm mt-1">{ticket.description || "Sem descrição"}</p>
                              <div className="flex justify-between items-center mt-3 text-sm text-gray-400">
                                <span>Disponível: {ticket.quantity}</span>
                                <span>Máx. por compra: {ticket.maxPerPurchase}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-300">Nenhum ingresso definido.</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">Nenhuma informação disponível</h3>
                  <p className="text-gray-400">
                    Preencha as informações básicas do evento para visualizar a pré-visualização.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
