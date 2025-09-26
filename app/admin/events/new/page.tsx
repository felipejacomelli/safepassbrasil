"use client"

import type React from "react"
import { useState, useActionState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, MapPin, Info, ImageIcon, Trash2, Save, AlertCircle, CheckCircle, Plus, Upload } from "lucide-react"
import { createEvent, type ActionState } from "@/lib/actions/events"
import { type EventFormData, type Occurrence, type TicketType, type UniqueTicket } from "@/lib/schemas"
import { uploadImage, validateImageFile, fileToDataURL } from "@/lib/upload"
import { processImageWithQRObfuscation } from "@/lib/qr-obfuscation"
import { categoriesApi, type ApiCategory } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function NewEventPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Estado do formulário usando useActionState
  const [state, formAction] = useActionState(createEvent, {
    success: false,
    message: "",
    errors: {},
  })

  // Estados para controle de UI e dados do formulário
  const [eventForm, setEventForm] = useState({
    name: "",
    description: "",
    category: "",
    organizer: "",
    contact_email: "",
    contact_phone: "",
    website: "",
    age_restriction: "none" as const,
    additional_info: "",
    image: "",
  })

  // Estados para ocorrências (suporte a múltiplas ocorrências)
  const [occurrences, setOccurrences] = useState<Occurrence[]>([
    {
      start_at: "",
      end_at: "",
      uf: "",
      state: "",
      city: "",
      address: "",
      venue: "",
      ticket_types: [
        {
          name: "",
          description: "",
          price: 0,
          quantity: 0,
          max_per_purchase: 1,
        },
      ],
    },
  ])

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [imageUploading, setImageUploading] = useState(false)
  const [imageError, setImageError] = useState<string>("")

  // Estados para categorias
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState<string>("")

  // Estados para ingressos únicos
  const [uniqueTickets, setUniqueTickets] = useState<UniqueTicket[]>([])
  
  // Tipo para estado das imagens de ingressos únicos
  type UniqueTicketImageState = {
    file: File | null
    preview: string
    uploading: boolean
    error: string
  }
  
  const [uniqueTicketImages, setUniqueTicketImages] = useState<{[key: string]: UniqueTicketImageState}>({})

  // useEffect para carregar categorias
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true)
        setCategoriesError("")
        const response = await categoriesApi.getAll()
        setCategories(response)
      } catch (error) {
        console.error('Erro ao carregar categorias:', error)
        setCategoriesError("Erro ao carregar categorias")
      } finally {
        setCategoriesLoading(false)
      }
    }

    loadCategories()
   }, [])

   // Função para lidar com upload de imagem de ingresso único
   const handleUniqueTicketImageChange = async (ticketId: string, file: File | null) => {
    
    if (!file) {
      setUniqueTicketImages(prev => ({
        ...prev,
        [ticketId]: { file: null, preview: "", uploading: false, error: "" }
      }))
      return
    }

    // Validar arquivo
    const validation = validateImageFile(file)
    if (!validation.valid) {
      setUniqueTicketImages(prev => ({
        ...prev,
        [ticketId]: { 
          file: null, 
          preview: "", 
          uploading: false, 
          error: validation.error || "Erro na validação do arquivo" 
        }
      }))
      return
    }

    // Definir estado de carregamento
    setUniqueTicketImages(prev => ({
      ...prev,
      [ticketId]: { file: null, preview: "", uploading: true, error: "" }
    }))

    try {
      // Processar imagem com ofuscação de QR codes
      const result = await processImageWithQRObfuscation(file)
      
      setUniqueTicketImages(prev => ({
        ...prev,
        [ticketId]: { 
          file, 
          preview: result.processedImageUrl, 
          uploading: false, 
          error: "" 
        }
      }))
      
      // Mostrar feedback se QR codes foram encontrados
      if (result.hasQRCodes) {
        console.log(`${result.qrRegionsFound} QR code(s) detectado(s) e ofuscado(s) automaticamente`)
      }
      
    } catch (error) {
      console.error('Erro ao processar imagem:', error)
      
      // Em caso de erro, usar preview normal sem ofuscação
      const preview = await fileToDataURL(file)
      setUniqueTicketImages(prev => ({
        ...prev,
        [ticketId]: { 
          file, 
          preview, 
          uploading: false, 
          error: "Erro ao processar ofuscação. Imagem carregada sem processamento." 
        }
      }))
    }
  }

  // Função para lidar com mudanças no formulário
  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEventForm(prev => ({ ...prev, [name]: value }))
  }

  // Função para lidar com mudanças nas ocorrências
  const handleOccurrenceChange = (
    occurrenceIndex: number,
    field: keyof Occurrence,
    value: string
  ) => {
    setOccurrences(prev => prev.map((occurrence, index) => 
      index === occurrenceIndex 
        ? { ...occurrence, [field]: value }
        : occurrence
    ))
  }

  // Função para lidar com mudanças nos tipos de ingresso
  const handleTicketTypeChange = (
    occurrenceIndex: number,
    ticketIndex: number,
    field: keyof TicketType,
    value: string | number
  ) => {
    setOccurrences(prev => prev.map((occurrence, oIndex) => 
      oIndex === occurrenceIndex 
        ? {
            ...occurrence,
            ticket_types: occurrence.ticket_types.map((ticket, tIndex) =>
              tIndex === ticketIndex 
                ? { ...ticket, [field]: value }
                : ticket
            )
          }
        : occurrence
    ))
  }

  // Adicionar nova ocorrência
  const addOccurrence = () => {
    const newOccurrence: Occurrence = {
      start_at: "",
      end_at: "",
      uf: "",
      state: "",
      city: "",
      address: "",
      venue: "",
      ticket_types: [
        {
          name: "",
          description: "",
          price: 0,
          quantity: 0,
          max_per_purchase: 1,
        },
      ],
    }
    setOccurrences(prev => [...prev, newOccurrence])
  }

  // Remover ocorrência
  const removeOccurrence = (index: number) => {
    if (occurrences.length > 1) {
      setOccurrences(prev => prev.filter((_, i) => i !== index))
    }
  }

  // Adicionar novo tipo de ingresso a uma ocorrência
  const addTicketType = (occurrenceIndex: number) => {
    const newTicket: TicketType = {
      name: "",
      description: "",
      price: 0,
      quantity: 0,
      max_per_purchase: 1,
    }
    
    setOccurrences(prev => prev.map((occurrence, index) => 
      index === occurrenceIndex 
        ? { ...occurrence, ticket_types: [...occurrence.ticket_types, newTicket] }
        : occurrence
    ))
  }

  // Remover tipo de ingresso de uma ocorrência
  const removeTicketType = (occurrenceIndex: number, ticketIndex: number) => {
    setOccurrences(prev => prev.map((occurrence, oIndex) => 
      oIndex === occurrenceIndex 
        ? {
            ...occurrence,
            ticket_types: occurrence.ticket_types.filter((_, tIndex) => tIndex !== ticketIndex)
          }
        : occurrence
    ))
  }

  // Funções para gerenciar ingressos únicos
  const addUniqueTicket = () => {
    const newTicket = {
      id: Date.now().toString(),
      name: "",
      description: "",
      price: 0,
      quantity: 1,
      max_per_purchase: 1,
    }
    setUniqueTickets(prev => [...prev, newTicket])
  }

  const removeUniqueTicket = (ticketId: string) => {
    setUniqueTickets(prev => prev.filter(ticket => ticket.id !== ticketId))
  }

  const handleUniqueTicketChange = (
    ticketId: string,
    field: string,
    value: string | number
  ) => {
    setUniqueTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, [field]: value }
        : ticket
    ))
  }

  // Função para lidar com upload de imagem
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limpar estados anteriores
    setImageError("")
    setImageUploading(true)

    try {
      // Validar arquivo
      const validation = validateImageFile(file)
      if (!validation.valid) {
        setImageError(validation.error || "Arquivo inválido")
        return
      }

      // Fazer upload da imagem
      const uploadResult = await uploadImage(file)
      if (!uploadResult.success) {
        setImageError(uploadResult.error || "Erro no upload")
        return
      }

      // Atualizar estados
      setImageFile(file)
      setImagePreview(uploadResult.url || "")
      setEventForm(prev => ({ ...prev, image: uploadResult.url || "" }))
      
    } catch (error) {
      setImageError("Erro inesperado no upload")
      console.error("Erro no upload:", error)
    } finally {
      setImageUploading(false)
    }
  }

  // Função para preparar dados do formulário para envio
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const formData = new FormData()
    
    // Adicionar dados do evento
    Object.entries(eventForm).forEach(([key, value]) => {
      formData.append(key, value)
    })
    
    // Adicionar ocorrências como JSON
    formData.append("occurrences", JSON.stringify(occurrences))
    
    // Adicionar ingressos únicos como JSON
    formData.append("unique_tickets", JSON.stringify(uniqueTickets))
    
    // Chamar Server Action usando startTransition
    startTransition(() => {
      formAction(formData)
    })
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
        {state.success && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-700 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
            <span className="text-green-400">{state.message}</span>
          </div>
        )}

        {state.message && !state.success && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
            <span className="text-red-400">{state.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-zinc-900">
              <TabsTrigger value="basic" className="data-[state=active]:bg-zinc-700">
                Informações Básicas
              </TabsTrigger>
              <TabsTrigger value="occurrences" className="data-[state=active]:bg-zinc-700">
                Ocorrências
              </TabsTrigger>
              <TabsTrigger value="tickets" className="data-[state=active]:bg-zinc-700">
                Tipos de Ingresso
              </TabsTrigger>
              <TabsTrigger value="unique-tickets" className="data-[state=active]:bg-zinc-700">
                Ingressos Únicos
              </TabsTrigger>
            </TabsList>

            {/* Aba: Informações Básicas */}
            <TabsContent value="basic" className="space-y-6">
              <Card className="bg-zinc-900 border-zinc-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Info className="w-5 h-5 mr-2" />
                    Informações do Evento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-white">Nome do Evento *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={eventForm.name}
                        onChange={handleEventChange}
                        className="bg-zinc-800 border-zinc-600 text-white"
                        placeholder="Digite o nome do evento"
                        required
                      />
                      {state.errors?.name && (
                        <p className="text-red-400 text-sm mt-1">{state.errors.name[0]}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="category" className="text-white">Categoria *</Label>
                      <Select 
                        name="category" 
                        value={eventForm.category} 
                        onValueChange={(value) => setEventForm(prev => ({ ...prev, category: value }))}
                        disabled={categoriesLoading}
                      >
                        <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
                          <SelectValue placeholder={
                            categoriesLoading 
                              ? "Carregando categorias..." 
                              : categoriesError 
                                ? "Erro ao carregar categorias" 
                                : "Selecione uma categoria"
                          } />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-600">
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {categoriesError && (
                        <p className="text-yellow-400 text-sm mt-1">
                          {categoriesError}. Tente recarregar a página.
                        </p>
                      )}
                      {state.errors?.category && (
                        <p className="text-red-400 text-sm mt-1">{state.errors.category[0]}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-white">Descrição *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={eventForm.description}
                      onChange={handleEventChange}
                      className="bg-zinc-800 border-zinc-600 text-white min-h-[100px]"
                      placeholder="Descreva o evento..."
                      required
                    />
                    {state.errors?.description && (
                      <p className="text-red-400 text-sm mt-1">{state.errors.description[0]}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="image" className="text-white">Imagem do Evento</Label>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="bg-zinc-800 border-zinc-600 text-white"
                          disabled={imageUploading}
                        />
                        {imageUploading && (
                          <div className="flex items-center text-blue-400">
                            <Upload className="w-4 h-4 mr-2 animate-pulse" />
                            Enviando...
                          </div>
                        )}
                      </div>
                      
                      {imageError && (
                        <p className="text-red-400 text-sm">{imageError}</p>
                      )}
                      
                      {imagePreview && (
                        <div className="w-32 h-32 rounded-lg overflow-hidden border border-zinc-600">
                          <img 
                            src={imagePreview} 
                            alt="Preview do evento" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba: Ocorrências */}
            <TabsContent value="occurrences" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Ocorrências do Evento</h3>
                <Button
                  type="button"
                  onClick={addOccurrence}
                  variant="outline"
                  className="border-zinc-700 text-white hover:bg-zinc-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Ocorrência
                </Button>
              </div>

              {occurrences.map((occurrence, occurrenceIndex) => (
                <Card key={occurrenceIndex} className="bg-zinc-900 border-zinc-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center text-white">
                        <Calendar className="w-5 h-5 mr-2" />
                        Ocorrência {occurrenceIndex + 1}
                      </CardTitle>
                      {occurrences.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeOccurrence(occurrenceIndex)}
                          variant="outline"
                          size="sm"
                          className="border-red-600 text-red-400 hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Data e Hora */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">Data e Hora de Início *</Label>
                        <Input
                          type="datetime-local"
                          value={occurrence.start_at}
                          onChange={(e) => handleOccurrenceChange(occurrenceIndex, 'start_at', e.target.value)}
                          className="bg-zinc-800 border-zinc-600 text-white"
                          required
                        />
                        {state.errors?.[`occurrences.${occurrenceIndex}.start_at`] && (
                          <p className="text-red-400 text-sm mt-1">{state.errors[`occurrences.${occurrenceIndex}.start_at`][0]}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-white">Data e Hora de Término</Label>
                        <Input
                          type="datetime-local"
                          value={occurrence.end_at}
                          onChange={(e) => handleOccurrenceChange(occurrenceIndex, 'end_at', e.target.value)}
                          className="bg-zinc-800 border-zinc-600 text-white"
                        />
                        {state.errors?.[`occurrences.${occurrenceIndex}.end_at`] && (
                          <p className="text-red-400 text-sm mt-1">{state.errors[`occurrences.${occurrenceIndex}.end_at`][0]}</p>
                        )}
                      </div>
                    </div>

                    {/* Localização */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-white">UF *</Label>
                        <Input
                          value={occurrence.uf}
                          onChange={(e) => handleOccurrenceChange(occurrenceIndex, 'uf', e.target.value)}
                          className="bg-zinc-800 border-zinc-600 text-white"
                          placeholder="SP"
                          maxLength={2}
                          required
                        />
                        {state.errors?.[`occurrences.${occurrenceIndex}.uf`] && (
                          <p className="text-red-400 text-sm mt-1">{state.errors[`occurrences.${occurrenceIndex}.uf`][0]}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-white">Estado *</Label>
                        <Input
                          value={occurrence.state}
                          onChange={(e) => handleOccurrenceChange(occurrenceIndex, 'state', e.target.value)}
                          className="bg-zinc-800 border-zinc-600 text-white"
                          placeholder="São Paulo"
                          required
                        />
                        {state.errors?.[`occurrences.${occurrenceIndex}.state`] && (
                          <p className="text-red-400 text-sm mt-1">{state.errors[`occurrences.${occurrenceIndex}.state`][0]}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-white">Cidade *</Label>
                        <Input
                          value={occurrence.city}
                          onChange={(e) => handleOccurrenceChange(occurrenceIndex, 'city', e.target.value)}
                          className="bg-zinc-800 border-zinc-600 text-white"
                          placeholder="São Paulo"
                          required
                        />
                        {state.errors?.[`occurrences.${occurrenceIndex}.city`] && (
                          <p className="text-red-400 text-sm mt-1">{state.errors[`occurrences.${occurrenceIndex}.city`][0]}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">Endereço</Label>
                        <Input
                          value={occurrence.address}
                          onChange={(e) => handleOccurrenceChange(occurrenceIndex, 'address', e.target.value)}
                          className="bg-zinc-800 border-zinc-600 text-white"
                          placeholder="Rua, número, bairro"
                        />
                        {state.errors?.[`occurrences.${occurrenceIndex}.address`] && (
                          <p className="text-red-400 text-sm mt-1">{state.errors[`occurrences.${occurrenceIndex}.address`][0]}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-white">Local/Venue</Label>
                        <Input
                          value={occurrence.venue}
                          onChange={(e) => handleOccurrenceChange(occurrenceIndex, 'venue', e.target.value)}
                          className="bg-zinc-800 border-zinc-600 text-white"
                          placeholder="Nome do local"
                        />
                        {state.errors?.[`occurrences.${occurrenceIndex}.venue`] && (
                          <p className="text-red-400 text-sm mt-1">{state.errors[`occurrences.${occurrenceIndex}.venue`][0]}</p>
                        )}
                      </div>
                    </div>

                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Aba: Tipos de Ingresso */}
            <TabsContent value="tickets" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Tipos de Ingresso</h3>
                <Button
                  type="button"
                  onClick={() => addTicketType(0)}
                  variant="outline"
                  className="border-zinc-700 text-white hover:bg-zinc-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Tipo de Ingresso
                </Button>
              </div>

              {occurrences[0]?.ticket_types.map((ticket, ticketIndex) => (
                <Card key={ticketIndex} className="bg-zinc-900 border-zinc-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center text-white">
                        <Info className="w-5 h-5 mr-2" />
                        Tipo de Ingresso {ticketIndex + 1}
                      </CardTitle>
                      {occurrences[0]?.ticket_types.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeTicketType(0, ticketIndex)}
                          variant="outline"
                          size="sm"
                          className="border-red-600 text-red-400 hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">Nome *</Label>
                        <Input
                          value={ticket.name}
                          onChange={(e) => handleTicketTypeChange(0, ticketIndex, 'name', e.target.value)}
                          className="bg-zinc-800 border-zinc-600 text-white"
                          placeholder="Ex: Pista, VIP, Camarote"
                          required
                        />
                        {state.errors?.[`occurrences.0.ticket_types.${ticketIndex}.name`] && (
                          <p className="text-red-400 text-sm mt-1">{state.errors[`occurrences.0.ticket_types.${ticketIndex}.name`][0]}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-white">Preço (R$) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={ticket.price}
                          onChange={(e) => handleTicketTypeChange(0, ticketIndex, 'price', parseFloat(e.target.value) || 0)}
                          className="bg-zinc-800 border-zinc-600 text-white"
                          required
                        />
                        {state.errors?.[`occurrences.0.ticket_types.${ticketIndex}.price`] && (
                          <p className="text-red-400 text-sm mt-1">{state.errors[`occurrences.0.ticket_types.${ticketIndex}.price`][0]}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">Quantidade *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={ticket.quantity}
                          onChange={(e) => handleTicketTypeChange(0, ticketIndex, 'quantity', parseInt(e.target.value) || 0)}
                          className="bg-zinc-800 border-zinc-600 text-white"
                          required
                        />
                        {state.errors?.[`occurrences.0.ticket_types.${ticketIndex}.quantity`] && (
                          <p className="text-red-400 text-sm mt-1">{state.errors[`occurrences.0.ticket_types.${ticketIndex}.quantity`][0]}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-white">Máximo por Compra *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={ticket.max_per_purchase}
                          onChange={(e) => handleTicketTypeChange(0, ticketIndex, 'max_per_purchase', parseInt(e.target.value) || 1)}
                          className="bg-zinc-800 border-zinc-600 text-white"
                          required
                        />
                        {state.errors?.[`occurrences.0.ticket_types.${ticketIndex}.max_per_purchase`] && (
                          <p className="text-red-400 text-sm mt-1">{state.errors[`occurrences.0.ticket_types.${ticketIndex}.max_per_purchase`][0]}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-white">Descrição</Label>
                      <Textarea
                        value={ticket.description}
                        onChange={(e) => handleTicketTypeChange(0, ticketIndex, 'description', e.target.value)}
                        className="bg-zinc-800 border-zinc-600 text-white"
                        placeholder="Descrição do ingresso (opcional)"
                        rows={2}
                      />
                      {state.errors?.[`occurrences.0.ticket_types.${ticketIndex}.description`] && (
                        <p className="text-red-400 text-sm mt-1">{state.errors[`occurrences.0.ticket_types.${ticketIndex}.description`][0]}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

            </TabsContent>

            {/* Aba: Ingressos Únicos */}
            <TabsContent value="unique-tickets" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Ingressos Únicos</h3>
                <Button
                  type="button"
                  onClick={addUniqueTicket}
                  variant="outline"
                  className="border-zinc-700 text-white hover:bg-zinc-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Ingresso Único
                </Button>
              </div>

              {uniqueTickets.length === 0 ? (
                <Card className="bg-zinc-900 border-zinc-700">
                  <CardContent className="text-center py-8">
                    <Info className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Nenhum Ingresso Único</h3>
                    <p className="text-zinc-400 mb-4">
                      Adicione ingressos únicos que não se enquadram em tipos específicos.
                    </p>
                    <Button
                      type="button"
                      onClick={addUniqueTicket}
                      variant="outline"
                      className="border-zinc-700 text-white hover:bg-zinc-800"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Primeiro Ingresso
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                uniqueTickets.map((ticket, index) => (
                  <Card key={ticket.id} className="bg-zinc-900 border-zinc-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center text-white">
                          <Info className="w-5 h-5 mr-2" />
                          Ingresso Único {index + 1}
                        </CardTitle>
                        <Button
                          type="button"
                          onClick={() => ticket.id && removeUniqueTicket(ticket.id)}
                          variant="outline"
                          size="sm"
                          className="border-red-600 text-red-400 hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white">Nome do Ingresso *</Label>
                          <Input
                            value={ticket.name}
                            onChange={(e) => ticket.id && handleUniqueTicketChange(ticket.id, 'name', e.target.value)}
                            className="bg-zinc-800 border-zinc-600 text-white"
                            placeholder="Ex: Ingresso VIP, Acesso Especial"
                            required
                          />
                        </div>
                        <div>
                          <Label className="text-white">Preço (R$) *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={ticket.price}
                            onChange={(e) => ticket.id && handleUniqueTicketChange(ticket.id, 'price', parseFloat(e.target.value) || 0)}
                            className="bg-zinc-800 border-zinc-600 text-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white">Quantidade Disponível *</Label>
                          <Input
                            type="number"
                            min="1"
                            value={ticket.quantity}
                            onChange={(e) => ticket.id && handleUniqueTicketChange(ticket.id, 'quantity', parseInt(e.target.value) || 1)}
                            className="bg-zinc-800 border-zinc-600 text-white"
                            required
                          />
                        </div>
                        <div>
                          <Label className="text-white">Máximo por Compra *</Label>
                          <Input
                            type="number"
                            min="1"
                            value={ticket.max_per_purchase}
                            onChange={(e) => ticket.id && handleUniqueTicketChange(ticket.id, 'max_per_purchase', parseInt(e.target.value) || 1)}
                            className="bg-zinc-800 border-zinc-600 text-white"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-white">Descrição do Ingresso</Label>
                        <Textarea
                          value={ticket.description}
                          onChange={(e) => handleUniqueTicketChange(ticket.id || "", 'description', e.target.value)}
                          className="bg-zinc-800 border-zinc-600 text-white"
                          placeholder="Descreva as características especiais deste ingresso..."
                          rows={3}
                        />
                      </div>

                      {/* Campo de Upload de Imagem do Ingresso */}
                      <div>
                        <Label className="text-white">Imagem do Ingresso</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null
                                ticket.id && handleUniqueTicketImageChange(ticket.id, file)
                              }}
                              className="bg-zinc-800 border-zinc-600 text-white file:bg-zinc-700 file:text-white file:border-0 file:rounded file:px-3 file:py-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="border-zinc-600 text-white hover:bg-zinc-800"
                              onClick={() => {
                                const input = document.querySelector(`input[type="file"]`) as HTMLInputElement
                                input?.click()
                              }}
                            >
                              <Upload className="w-4 h-4 mr-1" />
                              Escolher
                            </Button>
                          </div>
                          
                          {/* Preview da imagem */}
                          {uniqueTicketImages[ticket.id || ""]?.preview && (
                            <div className="relative w-32 h-32 border border-zinc-600 rounded-lg overflow-hidden">
                              <img
                                src={uniqueTicketImages[ticket.id || ""].preview}
                                alt="Preview do ingresso"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <span className="text-white text-xs text-center px-2">
                                  QR Code será ofuscado automaticamente
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {/* Erro de validação */}
                          {uniqueTicketImages[ticket.id || ""]?.error && (
                            <p className="text-red-400 text-sm">
                              {uniqueTicketImages[ticket.id || ""].error}
                            </p>
                          )}
                          
                          <p className="text-zinc-400 text-sm">
                            Faça upload da imagem do ingresso. QR codes visíveis serão automaticamente ofuscados por segurança.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-zinc-700">
            <Button
              type="button"
              onClick={() => router.push('/admin/events')}
              variant="outline"
              className="border-zinc-700 text-white hover:bg-zinc-800"
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Criar Evento
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
