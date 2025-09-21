"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Calendar, Clock, MapPin, Users, ArrowLeft, Ticket, ShoppingCart, Plus, Minus } from "lucide-react"
import { eventsApi, occurrencesApi, ApiEventWithOccurrences, ApiOccurrenceWithTickets, ApiTicketType, ApiOccurrence } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { useAuth } from "@/contexts/auth-context"

interface EventOccurrencePageProps {
  params: { slug: string; "city-date": string }
}

interface TicketQuantities {
  [key: string]: number
}

export default function EventOccurrencePage({ params }: EventOccurrencePageProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { slug, "city-date": cityDate } = params
  
  const [event, setEvent] = useState<ApiEventWithOccurrences | null>(null)
  const [occurrence, setOccurrence] = useState<ApiOccurrenceWithTickets | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ticketQuantities, setTicketQuantities] = useState<TicketQuantities>({})
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  useEffect(() => {
    const loadEventAndOccurrence = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Buscar evento pelo slug
        const eventData = await eventsApi.getBySlug(slug)
        setEvent(eventData)

        // Extrair cidade e data do parâmetro cityDate
        const parts = cityDate.split('-')
        if (parts.length < 4) {
          throw new Error('Formato de URL inválido')
        }

        // Últimos 3 elementos são a data (dd-mm-yyyy)
        const day = parts[parts.length - 3]
        const month = parts[parts.length - 2]  
        const year = parts[parts.length - 1]
        const targetDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

        // Cidade é tudo antes da data
        const city = parts.slice(0, -3).join('-')

        // Encontrar a ocorrência correspondente
        const matchingOccurrence = eventData.occurrences?.find((occ: ApiOccurrence) => {
          const occDate = new Date(occ.start_at).toISOString().split('T')[0]
          const occCity = occ.city?.toLowerCase().replace(/\s+/g, '-')
          return occDate === targetDate && occCity === city
        })

        if (!matchingOccurrence) {
          throw new Error('Ocorrência não encontrada')
        }

        // Buscar detalhes da ocorrência com tipos de ingresso
        const occurrenceData = await occurrencesApi.getWithTickets(matchingOccurrence.id)
        setOccurrence(occurrenceData)

      } catch (err) {
        console.error('Erro ao carregar evento/ocorrência:', err)
        setError('Evento ou data não encontrada')
      } finally {
        setLoading(false)
      }
    }

    if (slug && cityDate) {
      loadEventAndOccurrence()
    }
  }, [slug, cityDate])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const updateTicketQuantity = (ticketTypeId: string, change: number) => {
    setTicketQuantities(prev => {
      const current = prev[ticketTypeId] || 0
      const newQuantity = Math.max(0, current + change)
      
      if (newQuantity === 0) {
        const { [ticketTypeId]: removed, ...rest } = prev
        return rest
      }
      
      return { ...prev, [ticketTypeId]: newQuantity }
    })
  }

  const getTotalQuantity = () => {
    return Object.values(ticketQuantities).reduce((sum, qty) => sum + qty, 0)
  }

  const getTotalPrice = () => {
    if (!occurrence) return 0
    
    return Object.entries(ticketQuantities).reduce((total, [ticketTypeId, quantity]) => {
      const ticketType = occurrence.ticket_types.find(tt => tt.id === ticketTypeId)
      return total + (ticketType ? parseFloat(ticketType.price) * quantity : 0)
    }, 0)
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      const returnUrl = `/event/${slug}/${cityDate}`
      router.push(`/login?redirect=${encodeURIComponent(returnUrl)}`)
      return
    }

    setIsAddingToCart(true)
    try {
      // Implementar lógica de adicionar ao carrinho
      console.log('Adicionando ao carrinho:', ticketQuantities)
      // TODO: Implementar API call para adicionar ao carrinho
      
      router.push('/cart')
    } catch (err) {
      console.error('Erro ao adicionar ao carrinho:', err)
    } finally {
      setIsAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p>Carregando evento...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !event || !occurrence) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-400">{error || 'Evento não encontrado'}</p>
            <Button 
              onClick={() => router.push('/')} 
              className="mt-4"
              variant="outline"
            >
              Voltar ao início
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const breadcrumbItems = [
      { label: "Events", href: "/" },
      { label: event.name, href: `/event/${slug}` },
      { label: `${occurrence.city} - ${formatDate(occurrence.start_at)}`, href: `/event/${slug}/${cityDate}` }
    ]

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Header */}
        <div className="flex items-center gap-4 mb-8 mt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Info */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold mb-4">{event.name}</h1>
            
            <div className="flex flex-wrap gap-6 text-gray-300 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="font-semibold">{formatDate(occurrence.start_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{formatTime(occurrence.start_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{occurrence.city}</span>
              </div>
            </div>

            {event.description && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Sobre o Evento</h2>
                <p className="text-gray-300 leading-relaxed">{event.description}</p>
              </div>
            )}

            {/* Event Image */}
            {event.image && (
              <div className="mb-8">
                <img 
                  src={event.image} 
                  alt={event.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Ticket Selection */}
          <div className="lg:col-span-1">
            <Card className="bg-zinc-900 border-zinc-800 sticky top-8">
              <CardHeader>
                <CardTitle className="text-white">Ingressos Disponíveis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {occurrence.ticket_types && occurrence.ticket_types.length > 0 ? (
                  <>
                    {occurrence.ticket_types.map((ticketType) => (
                      <div key={ticketType.id} className="border border-zinc-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-white">{ticketType.name}</h3>
                            {ticketType.description && (
                              <p className="text-sm text-gray-400">{ticketType.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">
                              R$ {parseFloat(ticketType.price).toFixed(2)}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">
                            {ticketType.quantity_available > 0 ? (
                              `${ticketType.quantity_available} disponíveis`
                            ) : (
                              <span className="text-red-400">Esgotado</span>
                            )}
                          </span>

                          {ticketType.quantity_available > 0 && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateTicketQuantity(ticketType.id, -1)}
                                disabled={!ticketQuantities[ticketType.id]}
                                className="w-8 h-8 p-0"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              
                              <span className="w-8 text-center">
                                {ticketQuantities[ticketType.id] || 0}
                              </span>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateTicketQuantity(ticketType.id, 1)}
                                disabled={
                                  (ticketQuantities[ticketType.id] || 0) >= ticketType.quantity_available
                                }
                                className="w-8 h-8 p-0"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {getTotalQuantity() > 0 && (
                      <div className="border-t border-zinc-700 pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-semibold">Total:</span>
                          <span className="text-xl font-bold text-primary">
                            R$ {getTotalPrice().toFixed(2)}
                          </span>
                        </div>
                        
                        <Button 
                          onClick={handleAddToCart}
                          disabled={isAddingToCart}
                          className="w-full bg-primary text-black hover:bg-primary/90"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {isAddingToCart ? 'Adicionando...' : 'Adicionar ao Carrinho'}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Nenhum ingresso disponível no momento.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}