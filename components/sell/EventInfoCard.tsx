"use client"

import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type ApiEvent, type ApiOccurrence } from "@/lib/api"

interface EventInfoCardProps {
  event: ApiEvent | null
  selectedOccurrence: string
  currentOccurrence: ApiOccurrence | null
}

export const EventInfoCard = memo(({ event, selectedOccurrence, currentOccurrence }: EventInfoCardProps) => {
  if (!event) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Carregando evento...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
          Vender Ingressos: {event.name}
        </h1>

        {/* Event Image */}
        <div className="relative aspect-video bg-muted mb-6 overflow-hidden rounded">
          <img
            src={event.image || "/placeholder.svg"}
            alt={event.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Event Details */}
        <Card className="bg-card border-border rounded">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center text-muted-foreground">
              <span className="mr-2">📅</span>
              <span>
                {currentOccurrence?.start_at 
                  ? new Date(currentOccurrence.start_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit', 
                      year: 'numeric'
                    })
                  : selectedOccurrence 
                    ? "Data a definir"
                    : "Selecione uma data"
                }
              </span>
            </div>
            
            <div className="flex items-center text-muted-foreground">
              <span className="mr-2">📍</span>
              <span>
                {currentOccurrence 
                  ? `${currentOccurrence.city}, ${currentOccurrence.state} - ${currentOccurrence.uf}`
                  : selectedOccurrence 
                    ? "Local a definir"
                    : "Selecione um local"
                }
              </span>
            </div>
            
            <div className="flex items-center text-muted-foreground">
              <span className="mr-2">⏰</span>
              <span>
                {currentOccurrence?.start_at 
                  ? new Date(currentOccurrence.start_at).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : selectedOccurrence 
                    ? "Horário a definir"
                    : "Selecione um horário"
                }
                {currentOccurrence?.end_at 
                  ? ` - ${new Date(currentOccurrence.end_at).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}`
                  : ""
                }
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Seller Guidelines */}
        <Card className="bg-blue-50 border-blue-200 rounded">
          <CardHeader>
            <CardTitle className="text-blue-600 text-lg">Dicas para vendedores</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-muted-foreground text-sm space-y-2 list-disc list-inside">
              <li>Defina um preço justo para aumentar suas chances de venda</li>
              <li>Descreva detalhes importantes sobre o ingresso (setor, fileira, etc.)</li>
              <li>Responda rapidamente às perguntas dos compradores</li>
              <li>Você receberá o pagamento após a validação do ingresso</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
})

EventInfoCard.displayName = "EventInfoCard"
