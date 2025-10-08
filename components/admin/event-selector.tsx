"use client"

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Calendar, Loader2, Search, X, ChevronDown } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Event } from '@/lib/types/occurrence'

interface EventSelectorProps {
  events: Event[]
  selectedEventId: string
  loading: boolean
  error: string | null
  onEventChange: (eventId: string) => void
}

export function EventSelector({
  events,
  selectedEventId,
  loading,
  error,
  onEventChange
}: EventSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filtrar eventos baseado no termo de busca
  const filteredEvents = useMemo(() => {
    if (!searchTerm.trim()) return events
    
    return events.filter(event => 
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [events, searchTerm])

  // Encontrar o evento selecionado
  const selectedEvent = events.find(event => event.id === selectedEventId)

  // Atualizar input quando evento é selecionado
  useEffect(() => {
    if (selectedEvent) {
      setInputValue(selectedEvent.name)
      setSearchTerm('')
    } else {
      setInputValue('')
      setSearchTerm('')
    }
  }, [selectedEvent])

  const handleInputChange = (value: string) => {
    setInputValue(value)
    setSearchTerm(value)
    if (!isOpen) {
      setIsOpen(true)
    }
  }

  const handleEventSelect = (event: Event) => {
    onEventChange(event.id)
    setInputValue(event.name)
    setSearchTerm('')
    setIsOpen(false)
  }

  const handleClear = () => {
    onEventChange('')
    setInputValue('')
    setSearchTerm('')
    setIsOpen(false)
  }

  const handleToggle = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        if (selectedEvent) {
          setInputValue(selectedEvent.name)
          setSearchTerm('')
        } else {
          setInputValue('')
          setSearchTerm('')
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [selectedEvent])

  return (
    <Card className="bg-zinc-900 border-zinc-800 rounded">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center gap-2 text-lg font-semibold">
          <Calendar className="h-5 w-5" />
          Selecionar Evento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando eventos...
          </div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="event-select" className="text-white">
              Evento *
            </Label>
            
            {/* Combobox com busca integrada */}
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  ref={inputRef}
                  id="event-select"
                  type="text"
                  placeholder="Buscar e selecionar evento..."
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onFocus={() => setIsOpen(true)}
                  className="bg-zinc-800 border-zinc-700 text-white pl-10 pr-20 rounded"
                />
                <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  {inputValue && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClear}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggle}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                  >
                    <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </div>
              </div>

              {/* Dropdown com resultados */}
              {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded shadow-lg max-h-60 overflow-auto">
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => handleEventSelect(event)}
                        className="p-3 hover:bg-zinc-700 cursor-pointer border-b border-zinc-700 last:border-b-0 first:rounded-t last:rounded-b"
                      >
                        <span className="text-white font-medium">{event.name}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-gray-400 text-sm rounded">
                      {searchTerm ? 'Nenhum evento encontrado' : 'Nenhum evento disponível'}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Contador de resultados */}
            {isOpen && searchTerm && (
              <p className="text-sm text-gray-400">
                {filteredEvents.length} evento(s) encontrado(s)
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
