"use client"

import { memo } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TicketType {
  id: string
  name: string
  price: number | string
}

interface TicketTypeSelectorProps {
  ticketTypes: TicketType[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export const TicketTypeSelector = memo(({ ticketTypes, value, onChange, disabled = false }: TicketTypeSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="ticket-type" className="text-foreground font-medium">
        Tipo de Ingresso
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger 
          id="ticket-type"
          className={`${disabled ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-background text-foreground'} border-input rounded`}
          aria-label="Selecionar tipo de ingresso"
        >
          <SelectValue 
            placeholder={disabled ? "Primeiro selecione uma data e local" : "Selecione um tipo de ingresso"} 
          />
        </SelectTrigger>
        <SelectContent className="bg-background border-border">
          {ticketTypes.map((ticketType) => (
            <SelectItem 
              key={ticketType.id} 
              value={ticketType.id}
              className="text-foreground hover:bg-accent focus:bg-accent"
            >
              {ticketType.name} - R$ {Number(ticketType.price).toFixed(2)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
})

TicketTypeSelector.displayName = "TicketTypeSelector"
