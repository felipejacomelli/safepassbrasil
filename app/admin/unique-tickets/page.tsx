"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  Plus, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Sparkles,
  Info,
  Calendar
} from "lucide-react"

import { useUniqueTickets } from "@/hooks/use-unique-tickets"
import { TicketForm } from "@/components/admin/unique-tickets/ticket-form"
import { OccurrenceSelector } from "@/components/admin/unique-tickets/occurrence-selector"
import { ProcessSummary } from "@/components/admin/unique-tickets/process-summary"
import { uploadImage } from "@/lib/upload"

interface Event {
  id: string
  name: string
  description: string
  category: string
  status: string
  slug: string
}

interface Occurrence {
  id: string | number
  event_id: string | number
  event?: {
    id: string
    name: string
    slug: string
    status: string
  }
  start_at: string
  end_at?: string
  venue?: string
  address?: string
  city?: string
  uf?: string
  capacity?: number
  status?: string
}

interface TicketType {
  id: string
  name: string
  price: string
  available_quantity: number
  description: string
}

export default function UniqueTicketsPage() {
  // Estados principais
  const [events, setEvents] = useState<Event[]>([])
  const [occurrences, setOccurrences] = useState<Occurrence[]>([])
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(null)
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
  
  // Estados de controle
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)

  // Hook personalizado para gerenciar ingressos únicos
  const {
    tickets,
    errors,
    addTicket,
    removeTicket,
    updateTicket,
    validateTickets,
    duplicateTicket,
    getTotalTickets,
    getTotalValue,
    clearTickets
  } = useUniqueTickets()

  // Carregar dados iniciais
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        
         // Carregar eventos usando endpoint existente
         const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
         const eventsResponse = await fetch(`${baseUrl}/api/events/events/`, {
           headers: {
             'Content-Type': 'application/json',
             ...(typeof window !== 'undefined' && localStorage.getItem('authToken') && {
               'Authorization': `Token ${localStorage.getItem('authToken')}`
             })
           }
         })
         if (eventsResponse.ok) {
           const eventsData = await eventsResponse.json()
           console.log('Eventos carregados:', eventsData)
           const eventsArray = eventsData.results || eventsData
           setEvents(eventsArray)
           console.log('Eventos setados no estado:', eventsArray.length, 'eventos')
         } else {
           console.error('Erro ao carregar eventos:', eventsResponse.status, eventsResponse.statusText)
         }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        setFeedback({
          type: 'error',
          message: 'Erro ao carregar eventos. Tente recarregar a página.'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [])

   // Função para carregar ocorrências quando evento for selecionado
   const handleEventSelect = async (eventSlug: string) => {
     try {
       setLoading(true)
       const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
       
       // Tentar diferentes formatos de filtro (priorizando slug)
       const filterOptions = [
         `event_slug=${eventSlug}`,
         `event__slug=${eventSlug}`,
         `event__id=${eventSlug}`,
         `event=${eventSlug}`,
         `event_id=${eventSlug}`
       ]
       
       console.log('Tentando carregar ocorrências para slug:', eventSlug)
       console.log('Filtros que serão testados:', filterOptions)
       
       let response = null
       let lastError = null
       
       // Primeiro, testar se o endpoint básico funciona
       try {
         console.log('Testando endpoint básico...')
         const basicResponse = await fetch(`${baseUrl}/api/events/occurrences/`, {
           headers: {
             'Content-Type': 'application/json',
             'Authorization': `Token ${localStorage.getItem('authToken')}`
           }
         })
         console.log('Endpoint básico status:', basicResponse.status)
         if (basicResponse.ok) {
           const basicData = await basicResponse.json()
           console.log('Endpoint básico funcionou, dados:', basicData)
         }
       } catch (error) {
         console.log('Erro no endpoint básico:', error)
       }
       
       for (const filter of filterOptions) {
         try {
           console.log(`Tentando filtro: ${filter}`)
           response = await fetch(`${baseUrl}/api/events/occurrences/?${filter}`, {
             headers: {
               'Content-Type': 'application/json',
               'Authorization': `Token ${localStorage.getItem('authToken')}`
             }
           })
           
           if (response.ok) {
             console.log(`Filtro ${filter} funcionou!`)
             break
           } else {
             console.log(`Filtro ${filter} falhou:`, response.status)
             lastError = response.status
           }
         } catch (error) {
           console.log(`Erro com filtro ${filter}:`, error)
           lastError = error
         }
       }
       
       if (response && response.ok) {
         const data = await response.json()
         console.log('Resposta completa de ocorrências:', data)
         const occurrencesData = data.results || data
         console.log('Ocorrências processadas:', occurrencesData)
         
         // Log da estrutura das ocorrências para debug
         if (occurrencesData.length > 0) {
           console.log('Primeira ocorrência estrutura:', occurrencesData[0])
           console.log('Campo event da primeira ocorrência:', occurrencesData[0].event)
         }
         
         setOccurrences(occurrencesData)
         
         // Log para debug
         console.log('Estado atualizado - eventSlug:', eventSlug, 'occurrencesData.length:', occurrencesData.length)
       } else {
         console.error('Todos os filtros falharam. Último erro:', lastError)
         setOccurrences([])
       }
     } catch (error) {
       console.error('Erro ao carregar ocorrências:', error)
       setOccurrences([])
     } finally {
       setLoading(false)
     }
   }

  // Carregar tipos de ingressos quando ocorrência for selecionada
  useEffect(() => {
    const fetchTicketTypes = async (occurrenceId: string) => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        console.log('Carregando ticket types para occurrence:', occurrenceId)
        const response = await fetch(`${baseUrl}/api/ticket-types/?occurrence=${occurrenceId}&include_inactive=true`, {
          headers: {
            'Content-Type': 'application/json',
            ...(typeof window !== 'undefined' && localStorage.getItem('authToken') && {
              'Authorization': `Token ${localStorage.getItem('authToken')}`
            })
          }
        })
        console.log('Response status:', response.status)
        if (response.ok) {
          const data = await response.json()
          console.log('Ticket types data:', data)
          setTicketTypes(data.results || data)
        } else {
          console.error('Erro ao carregar ticket types:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Erro ao carregar tipos de ingressos:', error)
      }
    }

    if (selectedOccurrence?.id) {
      fetchTicketTypes(String(selectedOccurrence.id))
    }
  }, [selectedOccurrence?.id])

  // Função para salvar ingressos únicos
  const handleSave = async () => {
    if (!selectedOccurrence) {
      setFeedback({
        type: 'error',
        message: 'Selecione uma ocorrência antes de salvar.'
      })
      return
    }

    const validationErrors = validateTickets()
    if (Object.keys(validationErrors).length > 0) {
      setFeedback({
        type: 'error',
        message: 'Corrija os erros nos formulários antes de continuar.'
      })
      return
    }

    if (tickets.length === 0) {
      setFeedback({
        type: 'error',
        message: 'Adicione pelo menos um ingresso único.'
      })
      return
    }

    try {
      setSaving(true)
      setFeedback(null)

      // Preparar dados para envio
      const ticketsToCreate = []
      
      // Pegar o primeiro ticket type da ocorrência (ou criar um ticket único sem ticket_type)
      const defaultTicketType = ticketTypes.length > 0 ? ticketTypes[0] : null
      
      // Fazer upload das imagens primeiro usando Vercel Blob Storage
      for (const ticket of tickets) {
        const imageUrls = []
        console.log('Processing ticket:', ticket.name, 'with', ticket.images.length, 'images')
        
        // Upload de imagens usando a função uploadImage do lib/upload.ts
        if (ticket.images.length > 0) {
          console.log('Iniciando upload de', ticket.images.length, 'imagens')
          for (const imageFile of ticket.images) {
            try {
              console.log('Uploading image:', imageFile.name, 'type:', imageFile.type, 'size:', imageFile.size)
              
              const uploadResult = await uploadImage(imageFile)
              
              if (uploadResult.success && uploadResult.url) {
                console.log('Upload successful:', uploadResult.url)
                imageUrls.push(uploadResult.url)
                console.log('Imagem enviada:', uploadResult.url)
              } else {
                console.error('Erro ao fazer upload da imagem:', uploadResult.error)
                throw new Error(uploadResult.error || 'Erro no upload da imagem')
              }
            } catch (error) {
              console.error('Erro ao fazer upload da imagem:', error)
              throw error
            }
          }
        } else {
          console.log('Nenhuma imagem para upload')
        }
        
        // Criar tickets com URLs das imagens
        for (let i = 0; i < ticket.quantity; i++) {
          const ticketData: any = {
            name: ticket.name,
            quantity: 1,
            price: parseFloat(ticket.price.replace(/[^\d,]/g, '').replace(',', '.')),
            price_blocked: ticket.price_blocked || false,
            status: 'ACTIVE'
          }
          
          // Se houver ticket type, usar ele; senão, será um ticket único
          if (defaultTicketType) {
            ticketData.ticket_type = defaultTicketType.id
          }
          
          // Adicionar URL da imagem se disponível
          if (imageUrls.length > 0) {
            const imageIndex = i % imageUrls.length
            ticketData.image = imageUrls[imageIndex]
            console.log('Adicionando URL da imagem ao ticket:', ticketData.image)
          } else {
            console.log('Nenhuma URL de imagem disponível para o ticket')
          }
          
          console.log('Ticket data final:', ticketData)
          ticketsToCreate.push(ticketData)
        }
      }

      // Enviar requisições para criar ingressos usando endpoint existente
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      console.log('Criando tickets, total:', ticketsToCreate.length)
      const promises = ticketsToCreate.map((data, index) => {
        console.log(`Criando ticket ${index + 1}/${ticketsToCreate.length}`, data)
        
        return fetch(`${baseUrl}/api/tickets/sell/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(typeof window !== 'undefined' && localStorage.getItem('authToken') && {
              'Authorization': `Token ${localStorage.getItem('authToken')}`
            })
          },
          body: JSON.stringify(data),
        })
      })

      const responses = await Promise.all(promises)
      const failedRequests = responses.filter(response => !response.ok)

      if (failedRequests.length > 0) {
        throw new Error(`${failedRequests.length} ingressos falharam ao ser criados`)
      }

      // Sucesso
      setFeedback({
        type: 'success',
        message: `${getTotalTickets()} ingressos únicos criados com sucesso!`
      })
      
      // Limpar formulário
      clearTickets()
      setSelectedOccurrence(null)
      setTicketTypes([])
      
    } catch (error) {
      console.error('Erro ao salvar ingressos:', error)
      setFeedback({
        type: 'error',
        message: 'Erro ao criar ingressos. Tente novamente.'
      })
    } finally {
      setSaving(false)
    }
  }

  // Verificar se há erros de validação
  const hasValidationErrors = Object.keys(errors).length > 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-foreground" />
          </div>
        <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Criar Ingressos Únicos
            </h1>
            <p className="text-gray-600 mt-1">
              Adicione ingressos especiais e personalizados para seus eventos
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
      {feedback && (
        <Alert className={`mb-6 ${
          feedback.type === 'success' 
            ? 'border-green-500 bg-green-50' 
            : feedback.type === 'error'
              ? 'border-red-500 bg-red-50'
              : 'border-blue-500 bg-blue-50'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
            {feedback.type === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
            {feedback.type === 'info' && <Info className="h-4 w-4 text-blue-600" />}
            <AlertDescription className={
              feedback.type === 'success' 
                ? 'text-green-800' 
                : feedback.type === 'error'
                  ? 'text-red-800'
                  : 'text-blue-800'
            }>
              {feedback.message}
            </AlertDescription>
        </div>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Principal - Formulários */}
        <div className="lg:col-span-2 space-y-6">
          {/* Seletor de Ocorrência */}
          <OccurrenceSelector
            events={events}
            occurrences={occurrences}
            selectedOccurrence={selectedOccurrence}
            onOccurrenceSelect={(occurrence) => setSelectedOccurrence(occurrence)}
            onEventSelect={handleEventSelect}
            isLoading={loading}
          />

          {/* Tipos de Ingressos Disponíveis */}
          {selectedOccurrence && ticketTypes.length > 0 && (
            <Card>
        <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  Tipos de Ingressos Disponíveis
          </CardTitle>
        </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ticketTypes.map((type) => (
                    <div key={type.id} className="border rounded-lg p-4 bg-accent">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{type.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {type.available_quantity} disponíveis
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                      <p className="text-lg font-semibold text-green-600">{type.price}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Dica:</strong> Os ingressos únicos que você criar serão adicionados aos tipos existentes acima. 
                    Eles são perfeitos para ingressos promocionais ou com características únicas.
                  </p>
            </div>
              </CardContent>
            </Card>
          )}

          {/* Prompt para Selecionar Ocorrência */}
          {!selectedOccurrence && (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecione uma Ocorrência
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Para começar a criar ingressos únicos, primeiro selecione um evento e sua ocorrência específica.
                </p>
        </CardContent>
      </Card>
          )}

          {/* Formulários de Ingressos Únicos */}
          {selectedOccurrence && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Ingressos Únicos
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Adicione ingressos especiais com imagens personalizadas
                  </p>
              </div>

                <Button
                  onClick={addTicket}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Ingresso
                </Button>
              </div>

              {/* Lista de Formulários */}
              {tickets.length > 0 ? (
                <div className="space-y-6">
                  {tickets.map((ticket, index) => (
                    <TicketForm
                      key={ticket.id}
                      ticket={ticket}
                      index={index}
                      errors={errors}
                      onUpdate={updateTicket}
                      onRemove={removeTicket}
                      onDuplicate={duplicateTicket}
                      canRemove={tickets.length > 1}
                    />
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-2 border-gray-300">
                  <CardContent className="text-center py-8">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum ingresso criado ainda
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Clique no botão acima para adicionar seu primeiro ingresso único.
                    </p>
                  </CardContent>
                </Card>
              )}
                  </div>
                )}
              </div>

        {/* Sidebar - Resumo e Progresso */}
        <div className="space-y-6">
          <ProcessSummary
            selectedOccurrence={selectedOccurrence}
            ticketsCount={tickets.length}
            totalTickets={getTotalTickets()}
            totalValue={getTotalValue()}
            hasValidationErrors={hasValidationErrors}
          />

          {/* Botão de Salvar */}
          {selectedOccurrence && tickets.length > 0 && (
            <Card>
              <CardContent className="pt-6">
        <Button
          onClick={handleSave}
                  disabled={saving || hasValidationErrors}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-muted"
                  size="lg"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
          <Save className="h-4 w-4 mr-2" />
                      Salvar {getTotalTickets()} Ingresso{getTotalTickets() !== 1 ? 's' : ''}
                    </>
                  )}
        </Button>
        
                {hasValidationErrors && (
                  <p className="text-sm text-red-600 mt-2 text-center">
                    Corrija os erros antes de salvar
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}