"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin, Clock, Users } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export type Event = {
  id: string
  name: string
  description: string
  category: string
  status: string
  slug: string
}

export type Occurrence = {
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

interface OccurrenceSelectorProps {
  events: Event[]
  occurrences: Occurrence[]
  selectedOccurrence: Occurrence | null
  onOccurrenceSelect: (occurrence: Occurrence | null) => void
  onEventSelect: (eventId: string) => void
  isLoading?: boolean
}

export function OccurrenceSelector({
  events,
  occurrences,
  selectedOccurrence,
  onOccurrenceSelect,
  onEventSelect,
  isLoading = false
}: OccurrenceSelectorProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>("")
  const [filteredOccurrences, setFilteredOccurrences] = useState<Occurrence[]>([])

  console.log('OccurrenceSelector rendered. selectedEventId:', selectedEventId, 'events:', events, 'events.length:', events.length)

  // Manter estado do evento selecionado quando ocorrências são carregadas
  useEffect(() => {
    if (occurrences.length > 0 && !selectedEventId) {
      console.log('Ocorrências carregadas mas selectedEventId está vazio - tentando inferir do contexto')
      // Se há ocorrências mas não há evento selecionado, pode ser que o estado foi perdido
      // Vamos tentar inferir do contexto ou manter o estado anterior
      
      // Tentar inferir o slug do evento das ocorrências
      if (occurrences.length > 0) {
        const firstOccurrence = occurrences[0]
        console.log('Primeira ocorrência:', firstOccurrence)
        if (firstOccurrence && firstOccurrence.event) {
          const eventSlug = firstOccurrence.event.slug
          console.log('Inferindo slug do evento:', eventSlug)
          setSelectedEventId(eventSlug)
        }
      }
    }
  }, [occurrences, selectedEventId])

  // Sincronizar selectedEventId quando eventos são carregados
  useEffect(() => {
    if (events.length > 0 && !selectedEventId && occurrences.length > 0) {
      console.log('Eventos carregados, tentando sincronizar selectedEventId')
      // Se há eventos e ocorrências mas não há evento selecionado, tentar inferir
      const firstOccurrence = occurrences[0]
      if (firstOccurrence && firstOccurrence.event) {
        const eventSlug = firstOccurrence.event.slug
        console.log('Sincronizando selectedEventId com:', eventSlug)
        setSelectedEventId(eventSlug)
      }
    }
  }, [events, selectedEventId, occurrences])

  useEffect(() => {
    console.log('OccurrenceSelector - selectedEventSlug:', selectedEventId)
    console.log('OccurrenceSelector - occurrences:', occurrences)
    
    // Se há um evento selecionado e ocorrências carregadas, usar as ocorrências diretamente
    // (já foram filtradas pela API)
    if (selectedEventId && occurrences.length > 0) {
      console.log('Usando ocorrências já filtradas pela API:', occurrences.length)
      setFilteredOccurrences(occurrences)
    } else if (selectedEventId && occurrences.length === 0) {
      console.log('Evento selecionado mas sem ocorrências')
      setFilteredOccurrences([])
    } else {
      console.log('Nenhum evento selecionado')
      setFilteredOccurrences([])
    }
  }, [selectedEventId, occurrences])

  // Sincronizar estado quando ocorrências são carregadas
  useEffect(() => {
    console.log('Sincronizando estado - selectedEventId:', selectedEventId, 'occurrences.length:', occurrences.length)
    if (occurrences.length > 0 && !selectedEventId) {
      console.log('Ocorrências carregadas mas sem evento selecionado - isso pode indicar um problema de sincronização')
    }
  }, [occurrences, selectedEventId])

  // Forçar re-render quando ocorrências são carregadas
  useEffect(() => {
    if (occurrences.length > 0) {
      console.log('Ocorrências carregadas, forçando re-render do componente')
      // Forçar re-render do componente
      setFilteredOccurrences(occurrences)
    }
  }, [occurrences])

  const handleEventChange = (eventSlug: string) => {
    console.log('handleEventChange chamado com slug:', eventSlug)
    setSelectedEventId(eventSlug)
    // Reset occurrence selection when event changes
    if (selectedOccurrence && selectedOccurrence.event_id !== eventSlug) {
      onOccurrenceSelect(null) // Clear selection
    }
    // Carregar ocorrências para o evento selecionado
    onEventSelect(eventSlug)
  }

  const handleOccurrenceChange = (occurrenceId: string) => {
    const occurrence = filteredOccurrences.find(occ => occ.id === occurrenceId)
    if (occurrence) {
      onOccurrenceSelect(occurrence)
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    } catch {
      return dateString
    }
  }

  const getSelectedEvent = () => {
    console.log('getSelectedEvent called - selectedEventId:', selectedEventId, 'events.length:', events.length)
    console.log('Events array:', events)
    const event = events.find(event => event.slug === selectedEventId)
    console.log('Found event:', event)
    return event
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Selecionar Evento e Ocorrência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Seleção de Evento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Selecionar Evento e Ocorrência
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Evento *</label>
            <Select value={selectedEventId} onValueChange={handleEventChange}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um evento" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.slug}>
                    <div className="flex items-center justify-between w-full">
                      <span>{event.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {event.category}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEventId && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Ocorrência *</label>
              <Select 
                value={selectedOccurrence?.id || ""} 
                onValueChange={handleOccurrenceChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha uma data/horário" />
                </SelectTrigger>
                <SelectContent>
                  {filteredOccurrences.map((occurrence) => (
                    <SelectItem key={occurrence.id} value={occurrence.id}>
                      <div className="flex flex-col items-start">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{formatDateTime(occurrence.start_at)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          <span>{occurrence.venue} - {occurrence.city}/{occurrence.uf}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações da Ocorrência Selecionada */}
      {selectedOccurrence && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              ✓ Ocorrência Selecionada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-green-800">
                  {getSelectedEvent()?.name || 'Evento não encontrado'}
                </h4>
                <p className="text-sm text-green-700">
                  {getSelectedEvent()?.description || 'Descrição não disponível'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-green-700">
                  <Clock className="h-4 w-4" />
                  <span>{formatDateTime(selectedOccurrence.start_at)}</span>
                </div>

                <div className="flex items-center gap-2 text-green-700">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedOccurrence.venue}</span>
                </div>

                <div className="flex items-center gap-2 text-green-700">
                  <Users className="h-4 w-4" />
                  <span>Capacidade: {selectedOccurrence.capacity}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={selectedOccurrence.status === 'active' ? 'default' : 'secondary'}>
                    {selectedOccurrence.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>

              <div className="text-sm text-green-700">
                <strong>Endereço:</strong> {selectedOccurrence.address}, {selectedOccurrence.city}/{selectedOccurrence.uf}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}