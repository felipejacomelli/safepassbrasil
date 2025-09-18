"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, MapPin, Info, ImageIcon, Trash2, Save, AlertCircle, CheckCircle } from "lucide-react"
import { adminApi, type AdminEventFormData } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function NewEventPage() {
  const router = useRouter()

  // Estados do formulário
  const [eventForm, setEventForm] = useState({
    name: "",
    description: "",
    category: "",
    location: "",
    address: "",
    city: "",
    state: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    imageUrl: "",
    organizer: "",
    contactEmail: "",
    contactPhone: "",
    website: "",
    ageRestriction: "none",
    additionalInfo: "",
  })

  // Estados para controle de UI
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)

  // Estados dos tipos de ingresso
  const [ticketTypes, setTicketTypes] = useState([
    {
      id: "1",
      name: "",
      description: "",
      price: 0,
      quantity: 0,
      maxPerPurchase: 1,
    },
  ])

  // Validação de campos obrigatórios
  const validateForm = (): boolean => {
    console.log('🔍 validateForm: Iniciando validação dos campos obrigatórios')
    const newErrors: Record<string, string> = {}

    if (!eventForm.name.trim()) {
      console.log('❌ validateForm: Nome do evento está vazio')
      newErrors.name = "Nome do evento é obrigatório"
    }

    if (!eventForm.description.trim()) {
      console.log('❌ validateForm: Descrição está vazia')
      newErrors.description = "Descrição é obrigatória"
    }

    if (!eventForm.category) {
      console.log('❌ validateForm: Categoria não selecionada')
      newErrors.category = "Categoria é obrigatória"
    }

    if (!eventForm.location.trim()) {
      console.log('❌ validateForm: Local está vazio')
      newErrors.location = "Local é obrigatório"
    }

    if (!eventForm.startDate) {
      console.log('❌ validateForm: Data de início não informada')
      newErrors.startDate = "Data de início é obrigatória"
    }

    if (!eventForm.startTime) {
      console.log('❌ validateForm: Horário de início não informado')
      newErrors.startTime = "Horário de início é obrigatório"
    }

    if (eventForm.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eventForm.contactEmail)) {
      console.log('❌ validateForm: Email inválido:', eventForm.contactEmail)
      newErrors.contactEmail = "Email inválido"
    }

    if (eventForm.website && !/^https?:\/\/.+/.test(eventForm.website)) {
      console.log('❌ validateForm: URL inválida:', eventForm.website)
      newErrors.website = "URL deve começar com http:// ou https://"
    }

    // Validação de datas
    if (eventForm.startDate && eventForm.endDate) {
      const startDateTime = new Date(`${eventForm.startDate}T${eventForm.startTime || '00:00'}`)
      const endDateTime = new Date(`${eventForm.endDate}T${eventForm.endTime || '23:59'}`)
      
      if (endDateTime <= startDateTime) {
        console.log('❌ validateForm: Data de término anterior à data de início')
        newErrors.endDate = "Data de término deve ser posterior à data de início"
      }
    }

    console.log('📊 validateForm: Erros encontrados:', newErrors)
    setErrors(newErrors)
    const isValid = Object.keys(newErrors).length === 0
    console.log('✅ validateForm: Resultado da validação:', isValid)
    return isValid
  }

  // Validação de tipos de ingresso
  const validateTickets = (): boolean => {
    console.log('🎫 validateTickets: Iniciando validação dos ingressos')
    console.log('🎫 validateTickets: Quantidade de tipos de ingresso:', ticketTypes.length)
    
    if (ticketTypes.length === 0) {
      console.log('❌ validateTickets: Nenhum tipo de ingresso encontrado')
      setErrors(prev => ({ ...prev, tickets: "Pelo menos um tipo de ingresso é obrigatório" }))
      return false
    }

    const ticketErrors: Record<string, string> = {}
    
    ticketTypes.forEach((ticket, index) => {
      console.log(`🎫 validateTickets: Validando ingresso ${index + 1}:`, ticket)
      
      if (!ticket.name.trim()) {
        console.log(`❌ validateTickets: Nome do ingresso ${index + 1} está vazio`)
        ticketErrors[`ticket_${index}_name`] = "Nome do ingresso é obrigatório"
      }
      if (ticket.price <= 0) {
        console.log(`❌ validateTickets: Preço do ingresso ${index + 1} inválido:`, ticket.price)
        ticketErrors[`ticket_${index}_price`] = "Preço deve ser maior que zero"
      }
      if (ticket.quantity <= 0) {
        console.log(`❌ validateTickets: Quantidade do ingresso ${index + 1} inválida:`, ticket.quantity)
        ticketErrors[`ticket_${index}_quantity`] = "Quantidade deve ser maior que zero"
      }
      if (ticket.maxPerPurchase <= 0) {
        console.log(`❌ validateTickets: Máximo por compra do ingresso ${index + 1} inválido:`, ticket.maxPerPurchase)
        ticketErrors[`ticket_${index}_maxPerPurchase`] = "Máximo por compra deve ser maior que zero"
      }
      if (ticket.maxPerPurchase > ticket.quantity) {
        console.log(`❌ validateTickets: Máximo por compra do ingresso ${index + 1} maior que quantidade disponível`)
        ticketErrors[`ticket_${index}_maxPerPurchase`] = "Máximo por compra não pode ser maior que a quantidade disponível"
      }
    })

    console.log('📊 validateTickets: Erros de ingressos encontrados:', ticketErrors)
    setErrors(prev => ({ ...prev, ...ticketErrors }))
    const isValid = Object.keys(ticketErrors).length === 0
    console.log('✅ validateTickets: Resultado da validação:', isValid)
    return isValid
  }

  // Função para lidar com mudanças no formulário
  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEventForm(prev => ({ ...prev, [name]: value }))
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  // Função para lidar com upload de imagem
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: "Apenas arquivos de imagem são permitidos" }))
        return
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: "Imagem deve ter no máximo 5MB" }))
        return
      }

      setImageFile(file)
      
      // Criar preview da imagem
      const reader = new FileReader()
      reader.onload = (e) => {
        setEventForm(prev => ({ ...prev, imageUrl: e.target?.result as string }))
      }
      reader.readAsDataURL(file)
      
      // Limpar erro de imagem
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: "" }))
      }
    }
  }

  // Adicionar novo tipo de ingresso
  const addTicketType = () => {
    const newTicket = {
      id: Date.now().toString(),
      name: "",
      description: "",
      price: 0,
      quantity: 0,
      maxPerPurchase: 1,
    }
    setTicketTypes(prev => [...prev, newTicket])
  }

  // Remover tipo de ingresso
  const removeTicketType = (id: string) => {
    setTicketTypes(prev => prev.filter(ticket => ticket.id !== id))
  }

  // Função para lidar com mudanças nos tipos de ingresso
  const handleTicketChange = (id: string, field: string, value: string | number) => {
    setTicketTypes(prev => prev.map(ticket => 
      ticket.id === id ? { ...ticket, [field]: value } : ticket
    ))
    
    // Limpar erros relacionados ao ticket
    const ticketIndex = ticketTypes.findIndex(t => t.id === id)
    const errorKey = `ticket_${ticketIndex}_${field}`
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: "" }))
    }
  }

  // Função para enviar o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🚀 handleSubmit iniciado')
    e.preventDefault()
    
    // Limpar mensagens anteriores
    setSuccessMessage("")
    setErrors({})

    console.log('📝 Dados do formulário:', eventForm)
    console.log('🎫 Tipos de ingresso:', ticketTypes)

    // Validar formulário e tickets
    console.log('🔍 Iniciando validação do formulário...')
    const isFormValid = validateForm()
    console.log('✅ Formulário válido:', isFormValid)
    
    console.log('🔍 Iniciando validação dos ingressos...')
    const areTicketsValid = validateTickets()
    console.log('✅ Ingressos válidos:', areTicketsValid)

    if (!isFormValid || !areTicketsValid) {
      console.log('❌ Validação falhou - parando execução')
      console.log('Erros encontrados:', errors)
      return
    }

    console.log('🔄 Iniciando processo de criação do evento...')
    setIsLoading(true)

    try {
      // Preparar dados do evento para a API
      const eventData: AdminEventFormData = {
        name: eventForm.name,
        description: eventForm.description,
        location: `${eventForm.location}${eventForm.address ? `, ${eventForm.address}` : ''}${eventForm.city ? `, ${eventForm.city}` : ''}${eventForm.state ? `-${eventForm.state}` : ''}`,
        date: `${eventForm.startDate}T${eventForm.startTime}:00`,
        price: ticketTypes.length > 0 ? ticketTypes[0].price.toString() : "0",
        category: eventForm.category,
        image: eventForm.imageUrl,
        ticket_count: ticketTypes.reduce((total, ticket) => total + ticket.quantity, 0),
        status: 'open',
        active: true
      }

      console.log('📤 Dados preparados para envio à API:', eventData)
      console.log('🌐 Chamando adminApi.events.create...')

      // Criar evento via API
      const createdEvent = await adminApi.events.create(eventData)

      console.log('✅ Evento criado com sucesso na API:', createdEvent)
      setSuccessMessage("Evento criado com sucesso!")
      
      console.log('🔄 Redirecionando para /admin/events em 2 segundos...')
      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push('/admin/events')
      }, 2000)

    } catch (error: any) {
      console.error('❌ Erro ao criar evento:', error)
      console.log('📊 Detalhes do erro:', {
        message: error.message,
        status: error.status,
        stack: error.stack
      })
      
      if (error.status === 400) {
        // Erros de validação do backend
        try {
          const errorData = JSON.parse(error.message)
          setErrors(errorData)
        } catch {
          setErrors({ general: error.message || "Dados inválidos. Verifique os campos e tente novamente." })
        }
      } else if (error.status === 401) {
        setErrors({ general: "Você não tem permissão para criar eventos. Faça login novamente." })
      } else if (error.status === 500) {
        setErrors({ general: "Erro interno do servidor. Tente novamente mais tarde." })
      } else {
        setErrors({ general: "Erro ao criar evento. Verifique sua conexão e tente novamente." })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Criar Novo Evento</h1>
            <p className="text-gray-400 mt-2">Preencha as informações para criar um novo evento</p>
          </div>
          <Button 
            onClick={() => router.push('/admin/events')} 
            variant="outline" 
            className="border-zinc-700 text-white hover:bg-zinc-800"
          >
            Voltar
          </Button>
        </div>

        {/* Mensagens de feedback */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-700 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
            <span className="text-green-400">{successMessage}</span>
          </div>
        )}

        {errors.general && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
            <span className="text-red-400">{errors.general}</span>
          </div>
        )}

        {errors.tickets && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
            <span className="text-red-400">{errors.tickets}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Informações do Evento</h2>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="bg-transparent border-zinc-700 text-white hover:bg-zinc-800"
                onClick={() => router.push("/admin/events")}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-primary hover:bg-blue-600 text-black" 
                disabled={isLoading}
              >
                <Save size={16} className="mr-2" />
                {isLoading ? 'Salvando...' : 'Salvar Evento'}
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
              <Card className="bg-zinc-900 border-zinc-800 text-white">
                <CardHeader>
                  <CardTitle className="text-xl">Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="name">Nome do Evento *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={eventForm.name}
                      onChange={handleEventChange}
                      placeholder="Digite o nome do evento"
                      className="bg-zinc-800 border-zinc-700 text-white mt-1"
                    />
                    {errors.name && (
                      <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={eventForm.description}
                      onChange={handleEventChange}
                      placeholder="Descreva o evento..."
                      className="bg-zinc-800 border-zinc-700 text-white mt-1 min-h-[120px]"
                    />
                    {errors.description && (
                      <p className="text-red-400 text-sm mt-1">{errors.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="startDate">Data de Início *</Label>
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={eventForm.startDate}
                        onChange={handleEventChange}
                        className="bg-zinc-800 border-zinc-700 text-white mt-1"
                      />
                      {errors.startDate && (
                        <p className="text-red-400 text-sm mt-1">{errors.startDate}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="endDate">Data de Término</Label>
                      <Input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={eventForm.endDate}
                        onChange={handleEventChange}
                        className="bg-zinc-800 border-zinc-700 text-white mt-1"
                      />
                      {errors.endDate && (
                        <p className="text-red-400 text-sm mt-1">{errors.endDate}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="startTime">Horário de Início *</Label>
                      <Input
                        id="startTime"
                        name="startTime"
                        type="time"
                        value={eventForm.startTime}
                        onChange={handleEventChange}
                        className="bg-zinc-800 border-zinc-700 text-white mt-1"
                      />
                      {errors.startTime && (
                        <p className="text-red-400 text-sm mt-1">{errors.startTime}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="endTime">Horário de Término</Label>
                      <Input
                        id="endTime"
                        name="endTime"
                        type="time"
                        value={eventForm.endTime}
                        onChange={handleEventChange}
                        className="bg-zinc-800 border-zinc-700 text-white mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Local *</Label>
                    <Input
                      id="location"
                      name="location"
                      value={eventForm.location}
                      onChange={handleEventChange}
                      placeholder="Nome do local do evento"
                      className="bg-zinc-800 border-zinc-700 text-white mt-1"
                    />
                    {errors.location && (
                      <p className="text-red-400 text-sm mt-1">{errors.location}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="address">Endereço</Label>
                      <Input
                        id="address"
                        name="address"
                        value={eventForm.address}
                        onChange={handleEventChange}
                        placeholder="Rua, número"
                        className="bg-zinc-800 border-zinc-700 text-white mt-1"
                      />
                    </div>

                    <div>
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
                  </div>

                  <div>
                    <Label htmlFor="imageUrl">Imagem do Evento</Label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-zinc-700 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        {eventForm.imageUrl ? (
                          <div className="mb-4">
                            <img
                              src={eventForm.imageUrl}
                              alt="Preview"
                              className="mx-auto h-32 w-auto rounded-lg"
                            />
                          </div>
                        ) : (
                          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        )}
                        <div className="flex text-sm text-gray-400">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-zinc-800 rounded-md font-medium text-primary hover:text-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary px-3 py-2"
                          >
                            <span>Fazer upload</span>
                            <input 
                              id="file-upload" 
                              name="file-upload" 
                              type="file" 
                              accept="image/*"
                              onChange={handleImageChange}
                              className="sr-only" 
                            />
                          </label>
                          <p className="pl-1 pt-2">ou arraste e solte</p>
                        </div>
                        <p className="text-xs text-gray-400">PNG, JPG, GIF até 5MB</p>
                      </div>
                    </div>
                    {errors.image && (
                      <p className="text-red-400 text-sm mt-1">{errors.image}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="category">Categoria *</Label>
                    <select
                      id="category"
                      name="category"
                      value={eventForm.category}
                      onChange={handleEventChange}
                      className="w-full bg-zinc-800 border-zinc-700 text-white rounded-md mt-1 p-2"
                    >
                      <option value="">Selecione uma categoria</option>
                      <option value="music">Música</option>
                      <option value="sports">Esportes</option>
                      <option value="theater">Teatro</option>
                      <option value="festival">Festival</option>
                      <option value="conference">Conferência</option>
                      <option value="other">Outro</option>
                    </select>
                    {errors.category && (
                      <p className="text-red-400 text-sm mt-1">{errors.category}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tickets Tab */}
            <TabsContent value="tickets">
              <Card className="bg-zinc-900 border-zinc-800 text-white">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">Tipos de Ingresso</CardTitle>
                    <Button onClick={addTicketType} className="bg-primary hover:bg-blue-600 text-black">
                      Adicionar Ingresso
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {ticketTypes.map((ticket, index) => (
                    <div key={ticket.id} className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Ingresso {index + 1}</h3>
                        {ticketTypes.length > 1 && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeTicketType(ticket.id)}
                          >
                            <Trash2 size={16} className="mr-1" />
                            Remover
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`ticket-name-${ticket.id}`}>Nome do Ingresso</Label>
                          <Input
                            id={`ticket-name-${ticket.id}`}
                            value={ticket.name}
                            onChange={(e) => handleTicketChange(ticket.id, 'name', e.target.value)}
                            placeholder="Ex: Pista, Camarote, VIP"
                            className="bg-zinc-700 border-zinc-600 text-white mt-1"
                          />
                          {errors[`ticket_${index}_name`] && (
                            <p className="text-red-400 text-sm mt-1">{errors[`ticket_${index}_name`]}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor={`ticket-price-${ticket.id}`}>Preço (R$)</Label>
                          <Input
                            id={`ticket-price-${ticket.id}`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={ticket.price}
                            onChange={(e) => handleTicketChange(ticket.id, 'price', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="bg-zinc-700 border-zinc-600 text-white mt-1"
                          />
                          {errors[`ticket_${index}_price`] && (
                            <p className="text-red-400 text-sm mt-1">{errors[`ticket_${index}_price`]}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor={`ticket-quantity-${ticket.id}`}>Quantidade Disponível</Label>
                          <Input
                            id={`ticket-quantity-${ticket.id}`}
                            type="number"
                            min="1"
                            value={ticket.quantity}
                            onChange={(e) => handleTicketChange(ticket.id, 'quantity', parseInt(e.target.value) || 0)}
                            placeholder="100"
                            className="bg-zinc-700 border-zinc-600 text-white mt-1"
                          />
                          {errors[`ticket_${index}_quantity`] && (
                            <p className="text-red-400 text-sm mt-1">{errors[`ticket_${index}_quantity`]}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor={`ticket-max-${ticket.id}`}>Máximo por Compra</Label>
                          <Input
                            id={`ticket-max-${ticket.id}`}
                            type="number"
                            min="1"
                            value={ticket.maxPerPurchase}
                            onChange={(e) => handleTicketChange(ticket.id, 'maxPerPurchase', parseInt(e.target.value) || 1)}
                            placeholder="4"
                            className="bg-zinc-700 border-zinc-600 text-white mt-1"
                          />
                          {errors[`ticket_${index}_maxPerPurchase`] && (
                            <p className="text-red-400 text-sm mt-1">{errors[`ticket_${index}_maxPerPurchase`]}</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <Label htmlFor={`ticket-description-${ticket.id}`}>Descrição</Label>
                        <Textarea
                          id={`ticket-description-${ticket.id}`}
                          value={ticket.description}
                          onChange={(e) => handleTicketChange(ticket.id, 'description', e.target.value)}
                          placeholder="Descreva o que está incluído neste ingresso..."
                          className="bg-zinc-700 border-zinc-600 text-white mt-1"
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Details Tab */}
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
                      name="organizer"
                      value={eventForm.organizer}
                      onChange={handleEventChange}
                      placeholder="Nome do organizador"
                      className="bg-zinc-800 border-zinc-700 text-white mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactEmail">Email de Contato</Label>
                    <Input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      value={eventForm.contactEmail}
                      onChange={handleEventChange}
                      placeholder="contato@exemplo.com"
                      className="bg-zinc-800 border-zinc-700 text-white mt-1"
                    />
                    {errors.contactEmail && (
                      <p className="text-red-400 text-sm mt-1">{errors.contactEmail}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="contactPhone">Telefone de Contato</Label>
                    <Input
                      id="contactPhone"
                      name="contactPhone"
                      value={eventForm.contactPhone}
                      onChange={handleEventChange}
                      placeholder="(00) 00000-0000"
                      className="bg-zinc-800 border-zinc-700 text-white mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      value={eventForm.website}
                      onChange={handleEventChange}
                      placeholder="https://exemplo.com"
                      className="bg-zinc-800 border-zinc-700 text-white mt-1"
                    />
                    {errors.website && (
                      <p className="text-red-400 text-sm mt-1">{errors.website}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="ageRestriction">Restrição de Idade</Label>
                    <select
                      id="ageRestriction"
                      name="ageRestriction"
                      value={eventForm.ageRestriction}
                      onChange={handleEventChange}
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
                      name="additionalInfo"
                      value={eventForm.additionalInfo}
                      onChange={handleEventChange}
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
                            "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&auto=format&fit=crop&q=60"
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
        </form>
      </div>
    </div>
  )
}
