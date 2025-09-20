"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, MapPin, Users, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ApiOccurrence } from "@/lib/api"

interface DateOccurrenceSelectorProps {
  eventId: string
  occurrences: ApiOccurrence[]
  selectedOccurrenceId?: string
  onOccurrenceSelect?: (occurrence: ApiOccurrence) => void
  className?: string
}

export function DateOccurrenceSelector({
  eventId,
  occurrences,
  selectedOccurrenceId,
  onOccurrenceSelect,
  className
}: DateOccurrenceSelectorProps) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string | undefined>(selectedOccurrenceId)

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

  const getStatusBadge = (occurrence: ApiOccurrence) => {
    if (occurrence.status === 'sold_out') {
      return <Badge variant="destructive">Esgotado</Badge>
    }
    if (occurrence.available_tickets === 0) {
      return <Badge variant="destructive">Sem ingressos</Badge>
    }
    if (occurrence.available_tickets < 10) {
      return <Badge variant="secondary">Últimos ingressos</Badge>
    }
    return <Badge variant="default">Disponível</Badge>
  }

  const handleOccurrenceSelect = (occurrence: ApiOccurrence) => {
    setSelectedId(occurrence.id)
    
    if (onOccurrenceSelect) {
      onOccurrenceSelect(occurrence)
    } else {
      // Navegação padrão para a página da occurrence
      router.push(`/event/${eventId}/occurrence/${occurrence.id}`)
    }
  }

  const isOccurrenceDisabled = (occurrence: ApiOccurrence) => {
    return occurrence.status === 'inactive' || 
           occurrence.status === 'sold_out' || 
           occurrence.available_tickets === 0
  }

  if (!occurrences || occurrences.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhuma data disponível</h3>
        <p className="text-muted-foreground">
          Este evento não possui datas programadas no momento.
        </p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Escolha a data e horário</h2>
      </div>

      <div className="grid gap-4">
        {occurrences.map((occurrence) => {
          const isSelected = selectedId === occurrence.id
          const isDisabled = isOccurrenceDisabled(occurrence)
          
          return (
            <Card 
              key={occurrence.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md",
                isSelected && "ring-2 ring-primary border-primary",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {formatDate(occurrence.start_at)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {formatTime(occurrence.start_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {occurrence.venue_name && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{occurrence.venue_name}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Ticket className="h-3 w-3" />
                        <span>{occurrence.available_tickets} ingressos disponíveis</span>
                      </div>

                      {occurrence.max_capacity && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>Capacidade: {occurrence.max_capacity}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(occurrence)}
                    
                    <Button
                      onClick={() => handleOccurrenceSelect(occurrence)}
                      disabled={isDisabled}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                    >
                      {isSelected ? "Selecionado" : "Selecionar"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {occurrences.length > 0 && (
        <div className="text-center text-sm text-muted-foreground mt-6">
          <p>Selecione uma data para ver os tipos de ingressos disponíveis</p>
        </div>
      )}
    </div>
  )
}