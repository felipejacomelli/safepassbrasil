"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Calendar, Clock, MapPin, Users, Ticket, ShoppingCart, ArrowLeft, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
// Separator inline component to avoid import issues
const Separator = ({ className = "" }: { className?: string }) => (
  <div className={`shrink-0 bg-border h-[1px] w-full ${className}`} />
)
import { Breadcrumbs, useBreadcrumbs } from "@/components/ui/breadcrumbs"
import { occurrencesApi, ApiOccurrenceWithTickets, ApiTicketType } from "@/lib/api"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"

interface OccurrencePageProps {
  params: Promise<{ eventId: string; occurrenceId: string }>
}

interface TicketSelection {
  ticketTypeId: string
  quantity: number
  price: number
  name: string
}

export default function OccurrencePage({ params }: OccurrencePageProps) {
  const { eventId, occurrenceId } = use(params)
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { createOccurrenceBreadcrumbs } = useBreadcrumbs()
  
  const [occurrence, setOccurrence] = useState<ApiOccurrenceWithTickets | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTickets, setSelectedTickets] = useState<TicketSelection[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const fetchOccurrence = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const occurrenceData = await occurrencesApi.getWithTickets(occurrenceId)
        setOccurrence(occurrenceData)
      } catch (err) {
        console.error('Erro ao carregar occurrence:', err)
        setError('Erro ao carregar informações da data do evento')
      } finally {
        setIsLoading(false)
      }
    }

    if (occurrenceId) {
      fetchOccurrence()
    }
  }, [occurrenceId])

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

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price)
    return numPrice.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  const updateTicketQuantity = (ticketType: ApiTicketType, quantity: number) => {
    setSelectedTickets(prev => {
      const existing = prev.find(t => t.ticketTypeId === ticketType.id)
      
      if (quantity === 0) {
        return prev.filter(t => t.ticketTypeId !== ticketType.id)
      }
      
      const newSelection: TicketSelection = {
        ticketTypeId: ticketType.id,
        quantity,
        price: parseFloat(ticketType.price),
        name: ticketType.name
      }
      
      if (existing) {
        return prev.map(t => 
          t.ticketTypeId === ticketType.id ? newSelection : t
        )
      }
      
      return [...prev, newSelection]
    })
  }

  const getTicketQuantity = (ticketTypeId: string) => {
    const selection = selectedTickets.find(t => t.ticketTypeId === ticketTypeId)
    return selection?.quantity || 0
  }

  const getTotalAmount = () => {
    return selectedTickets.reduce((total, ticket) => 
      total + (ticket.quantity * ticket.price), 0
    )
  }

  const getTotalTickets = () => {
    return selectedTickets.reduce((total, ticket) => total + ticket.quantity, 0)
  }

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      // Salvar contexto da occurrence no localStorage para retorno após login
      localStorage.setItem('pendingOccurrenceContext', JSON.stringify({
        eventId,
        occurrenceId,
        selectedTickets,
        returnUrl: `/event/${eventId}/occurrence/${occurrenceId}`
      }))
      
      // Redirecionar para login
      router.push(`/login?redirect=${encodeURIComponent(`/event/${eventId}/occurrence/${occurrenceId}`)}`)
      return
    }

    // Se autenticado, prosseguir para checkout
    // TODO: Implementar navegação para checkout com os tickets selecionados
    console.log('Prosseguir para checkout:', selectedTickets)
  }

  const isTicketTypeDisabled = (ticketType: ApiTicketType) => {
    return !ticketType.is_active || 
           ticketType.quantity_available === 0 ||
           (ticketType.sale_end_date && new Date(ticketType.sale_end_date) < new Date())
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-4 w-96 mb-4" />
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-32 w-full rounded-lg mb-6" />
            <Skeleton className="h-8 w-3/4 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          </div>
          
          <div>
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !occurrence) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Data não encontrada</h1>
          <p className="text-muted-foreground mb-6">
            {error || 'A data do evento que você está procurando não existe ou foi removida.'}
          </p>
          <Button asChild>
            <Link href={`/event/${eventId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para o evento
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const breadcrumbItems = createOccurrenceBreadcrumbs(
    occurrence.event.name,
    eventId,
    formatDate(occurrence.start_at)
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Conteúdo principal */}
        <div className="lg:col-span-2">
          {/* Informações da occurrence */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                    {occurrence.event.name}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">{formatDate(occurrence.start_at)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(occurrence.start_at)}</span>
                    </div>
                    
                    {occurrence.venue_name && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{occurrence.venue_name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Badge 
                  variant={occurrence.status === 'active' ? 'default' : 'secondary'}
                >
                  {occurrence.status === 'active' ? 'Disponível' : 'Indisponível'}
                </Badge>
              </div>

              {occurrence.venue_address && (
                <p className="text-sm text-muted-foreground">
                  {occurrence.venue_address}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tipos de ingressos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Ingressos Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {occurrence.ticket_types.length === 0 ? (
                <div className="text-center py-8">
                  <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum ingresso disponível</h3>
                  <p className="text-muted-foreground">
                    Esta data não possui ingressos disponíveis no momento.
                  </p>
                </div>
              ) : (
                occurrence.ticket_types.map((ticketType) => {
                  const isDisabled = isTicketTypeDisabled(ticketType)
                  const quantity = getTicketQuantity(ticketType.id)
                  const maxQuantity = Math.min(
                    ticketType.quantity_available,
                    ticketType.max_per_order || 10
                  )

                  return (
                    <Card 
                      key={ticketType.id}
                      className={cn(
                        "transition-all duration-200",
                        isDisabled && "opacity-50"
                      )}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">
                                {ticketType.name}
                              </h3>
                              <span className="text-2xl font-bold text-primary">
                                {formatPrice(ticketType.price)}
                              </span>
                            </div>

                            {ticketType.description && (
                              <p className="text-muted-foreground mb-3">
                                {ticketType.description}
                              </p>
                            )}

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>
                                {ticketType.quantity_available} disponíveis
                              </span>
                              {ticketType.max_per_order && (
                                <span>
                                  Máx. {ticketType.max_per_order} por pedido
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {!isDisabled && (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateTicketQuantity(ticketType, Math.max(0, quantity - 1))}
                                  disabled={quantity === 0}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                
                                <Input
                                  type="number"
                                  min="0"
                                  max={maxQuantity}
                                  value={quantity}
                                  onChange={(e) => {
                                    const newQuantity = Math.min(
                                      Math.max(0, parseInt(e.target.value) || 0),
                                      maxQuantity
                                    )
                                    updateTicketQuantity(ticketType, newQuantity)
                                  }}
                                  className="w-16 text-center"
                                />
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateTicketQuantity(ticketType, Math.min(maxQuantity, quantity + 1))}
                                  disabled={quantity >= maxQuantity}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            )}

                            {isDisabled && (
                              <Badge variant="destructive">
                                {ticketType.quantity_available === 0 ? 'Esgotado' : 'Indisponível'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Resumo do pedido */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Resumo do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTickets.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Selecione os ingressos desejados
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedTickets.map((ticket) => (
                    <div key={ticket.ticketTypeId} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{ticket.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {ticket.quantity}x {formatPrice(ticket.price.toString())}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {formatPrice((ticket.quantity * ticket.price).toString())}
                      </p>
                    </div>
                  ))}

                  <Separator />

                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(getTotalAmount().toString())}</span>
                  </div>

                  <div className="text-sm text-muted-foreground text-center">
                    {getTotalTickets()} {getTotalTickets() === 1 ? 'ingresso' : 'ingressos'}
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleProceedToCheckout}
                    disabled={isProcessing}
                  >
                    {!isAuthenticated ? 'Fazer Login para Continuar' : 'Continuar para Pagamento'}
                  </Button>

                  {!isAuthenticated && (
                    <p className="text-xs text-muted-foreground text-center">
                      É necessário fazer login para prosseguir com a compra
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}