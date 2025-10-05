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
      <Label htmlFor="ticket-type" className="text-white font-medium">
        Tipo de Ingresso
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger 
          id="ticket-type"
          className={`${disabled ? 'bg-zinc-900 text-zinc-500 cursor-not-allowed' : 'bg-zinc-800 text-white'} border-zinc-700 rounded`}
          aria-label="Selecionar tipo de ingresso"
        >
          <SelectValue 
            placeholder={disabled ? "Primeiro selecione uma data e local" : "Selecione um tipo de ingresso"} 
          />
        </SelectTrigger>
        <SelectContent className="bg-zinc-800 border-zinc-700">
          {ticketTypes.map((ticketType) => (
            <SelectItem 
              key={ticketType.id} 
              value={ticketType.id}
              className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
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
