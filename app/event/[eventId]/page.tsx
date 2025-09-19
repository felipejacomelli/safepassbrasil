"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, MapPin, Users, Share2, Heart, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Breadcrumbs, useBreadcrumbs } from "@/components/ui/breadcrumbs"
import { DateOccurrenceSelector } from "@/components/events/DateOccurrenceSelector"
import { eventsApi, ApiEventWithOccurrences, ApiOccurrence } from "@/lib/api"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"

interface EventPageProps {
  params: Promise<{ eventId: string }>
}

export default function EventPage({ params }: EventPageProps) {
  const { eventId } = use(params)
  const router = useRouter()
  const { createEventBreadcrumbs } = useBreadcrumbs()
  
  const [event, setEvent] = useState<ApiEventWithOccurrences | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Buscar evento com suas occurrences
        const eventData = await eventsApi.getWithOccurrences(parseInt(eventId))
        setEvent(eventData)
      } catch (err) {
        console.error('Erro ao carregar evento:', err)
        setError('Erro ao carregar informações do evento')
      } finally {
        setIsLoading(false)
      }
    }

    if (eventId) {
      fetchEvent()
    }
  }, [eventId])

  const handleOccurrenceSelect = (occurrence: ApiOccurrence) => {
    // Navegar para a página da occurrence
    router.push(`/event/${eventId}/occurrence/${occurrence.id}`)
  }

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getEventStatus = () => {
    if (!event || !event.occurrences.length) return 'Sem datas'
    
    const activeOccurrences = event.occurrences.filter(occ => 
      occ.status === 'active' && occ.available_tickets > 0
    )
    
    if (activeOccurrences.length === 0) return 'Esgotado'
    return 'Disponível'
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-4 w-64 mb-4" />
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-64 w-full rounded-lg mb-6" />
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-6" />
            <Skeleton className="h-32 w-full" />
          </div>
          
          <div>
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Evento não encontrado</h1>
          <p className="text-muted-foreground mb-6">
            {error || 'O evento que você está procurando não existe ou foi removido.'}
          </p>
          <Button asChild>
            <Link href="/search">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para eventos
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const breadcrumbItems = createEventBreadcrumbs(event.name, eventId)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Conteúdo principal */}
        <div className="lg:col-span-2">
          {/* Imagem do evento */}
          <div className="relative h-64 lg:h-80 rounded-lg overflow-hidden mb-6">
            <Image
              src={event.image || '/placeholder.jpg'}
              alt={event.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                <Heart className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Informações do evento */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant={getEventStatus() === 'Disponível' ? 'default' : 'secondary'}>
                {getEventStatus()}
              </Badge>
              {event.category && (
                <Badge variant="outline">{event.category}</Badge>
              )}
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold mb-4">{event.name}</h1>

            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
              
              {event.occurrences.length > 0 && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {event.occurrences.length === 1 
                      ? formatEventDate(event.occurrences[0].start_at)
                      : `${event.occurrences.length} datas disponíveis`
                    }
                  </span>
                </div>
              )}
            </div>

            {/* Descrição */}
            {event.description && (
              <div className="prose max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {event.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Seletor de datas */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Datas e Horários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DateOccurrenceSelector
                eventId={eventId}
                occurrences={event.occurrences}
                onOccurrenceSelect={handleOccurrenceSelect}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}