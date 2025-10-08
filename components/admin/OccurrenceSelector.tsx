'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown, ChevronUp, Search, Calendar, MapPin, Clock } from 'lucide-react'
import { Occurrence } from '@/lib/types/occurrence'

interface OccurrenceSelectorProps {
  occurrences: Occurrence[]
  selectedOccurrence: Occurrence | null
  onSelect: (occurrence: Occurrence | null) => void
  isLoading?: boolean
  error?: string | null
  disabled?: boolean
  placeholder?: string
  label?: string
  required?: boolean
}

export function OccurrenceSelector({
  occurrences,
  selectedOccurrence,
  onSelect,
  isLoading = false,
  error = null,
  disabled = false,
  placeholder = "Selecione uma ocorrência",
  label = "Ocorrência",
  required = false
}: OccurrenceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filtrar ocorrências baseado no termo de busca
  const filteredOccurrences = occurrences.filter(occurrence => {
    const searchLower = searchTerm.toLowerCase()
    const startDate = new Date(occurrence.start_at).toLocaleDateString('pt-BR')
    const location = `${occurrence.city}, ${occurrence.state}`
    
    return (
      startDate.includes(searchLower) ||
      location.toLowerCase().includes(searchLower) ||
      occurrence.city.toLowerCase().includes(searchLower) ||
      occurrence.state.toLowerCase().includes(searchLower)
    )
  })

  // Formatar data e hora
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  }

  // Selecionar ocorrência
  const handleSelect = (occurrence: Occurrence) => {
    onSelect(occurrence)
    setIsOpen(false)
    setSearchTerm('')
  }

  // Limpar seleção
  const handleClear = () => {
    onSelect(null)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      
      <div className="relative" ref={dropdownRef}>
        <Button
          type="button"
          variant="outline"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled || isLoading}
          className={`w-full justify-between ${error ? 'border-destructive' : ''}`}
        >
          <span className="truncate">
            {isLoading ? (
              "Carregando ocorrências..."
            ) : selectedOccurrence ? (
              <div className="flex items-center gap-2 text-left">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDateTime(selectedOccurrence.start_at).date} - {selectedOccurrence.city}, {selectedOccurrence.state}
                </span>
              </div>
            ) : (
              placeholder
            )}
          </span>
          {!disabled && !isLoading && (
            isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {isOpen && !disabled && !isLoading && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-hidden">
            <CardContent className="p-0">
              {/* Campo de busca */}
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por data ou localização..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Lista de ocorrências */}
              <div className="max-h-60 overflow-y-auto">
                {filteredOccurrences.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    {occurrences.length === 0 
                      ? "Nenhuma ocorrência disponível"
                      : "Nenhuma ocorrência encontrada"
                    }
                  </div>
                ) : (
                  <>
                    {selectedOccurrence && (
                      <button
                        type="button"
                        onClick={handleClear}
                        className="w-full p-3 text-left hover:bg-muted border-b text-muted-foreground"
                      >
                        Limpar seleção
                      </button>
                    )}
                    
                    {filteredOccurrences.map((occurrence) => {
                      const { date, time } = formatDateTime(occurrence.start_at)
                      const isSelected = selectedOccurrence?.id === occurrence.id
                      
                      return (
                        <button
                          key={occurrence.id}
                          type="button"
                          onClick={() => handleSelect(occurrence)}
                          className={`w-full p-3 text-left hover:bg-muted border-b transition-colors ${
                            isSelected ? 'bg-muted' : ''
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 font-medium">
                              <Calendar className="h-4 w-4" />
                              <span>{date}</span>
                              <Clock className="h-4 w-4 ml-2" />
                              <span>{time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{occurrence.city}, {occurrence.state} ({occurrence.uf})</span>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}