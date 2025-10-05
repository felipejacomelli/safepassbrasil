"use client"

import { memo } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type ApiOccurrence } from "@/lib/api"

interface OccurrenceSelectorProps {
  occurrences: ApiOccurrence[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export const OccurrenceSelector = memo(({ occurrences, value, onChange, disabled = false }: OccurrenceSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="occurrence" className="text-white font-medium">
        Data e Local do Evento
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger 
          id="occurrence"
          className="bg-zinc-800 border-zinc-700 text-white rounded"
          aria-label="Selecionar data e local do evento"
        >
          <SelectValue placeholder="Selecione uma data e local" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-800 border-zinc-700">
          {occurrences.map((occurrence) => (
            <SelectItem 
              key={occurrence.id} 
              value={occurrence.id}
              className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
            >
              {new Date(occurrence.start_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })} - {occurrence.city}, {occurrence.state}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
})

OccurrenceSelector.displayName = "OccurrenceSelector"
