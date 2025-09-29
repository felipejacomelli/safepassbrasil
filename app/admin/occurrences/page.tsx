"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, MapPin, Plus, Trash2, Save, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Tipos para Ocorrência
type Occurrence = {
  id?: string
  event_id?: string
  start_at: string
  end_at: string
  uf: string
  state: string
  city: string
  address: string
  venue: string
}

// Tipo para Evento (para seleção)
type Event = {
  id: string
  name: string
  description: string
}

export default function OccurrencesPage() {
  const router = useRouter()
  
  // Estados para controle de UI e dados
  const [occurrences, setOccurrences] = useState<Occurrence[]>([
    {
      start_at: "",
      end_at: "",
      uf: "",
      state: "",
      city: "",
      address: "",
      venue: "",
    },
  ])
  
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>("")
  const [eventsLoading, setEventsLoading] = useState(true)
  const [eventsError, setEventsError] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Carregar eventos disponíveis
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setEventsLoading(true)
        // Simulação de carregamento de eventos - substituir por API real
        await new Promise(resolve => setTimeout(resolve, 1000))
        setEvents([
          { id: "1", name: "Festival de Música 2024", description: "Grande festival de música" },
          { id: "2", name: "Conferência Tech", description: "Conferência de tecnologia" },
          { id: "3", name: "Show de Rock", description: "Show de rock nacional" }
        ])
        setEventsError("")
      } catch (error) {
        setEventsError("Erro ao carregar eventos")
      } finally {
        setEventsLoading(false)
      }
    }

    loadEvents()
  }, [])

  // Função para adicionar nova ocorrência
  const addOccurrence = () => {
    setOccurrences([
      ...occurrences,
      {
        start_at: "",
        end_at: "",
        uf: "",
        state: "",
        city: "",
        address: "",
        venue: "",
      },
    ])
  }

  // Função para remover ocorrência
  const removeOccurrence = (index: number) => {
    if (occurrences.length > 1) {
      setOccurrences(occurrences.filter((_, i) => i !== index))
    }
  }

  // Função para atualizar ocorrência
  const updateOccurrence = (index: number, field: keyof Occurrence, value: string) => {
    const updated = [...occurrences]
    updated[index] = { ...updated[index], [field]: value }
    setOccurrences(updated)
  }

  // Função para salvar ocorrências
  const handleSave = async () => {
    if (!selectedEventId) {
      setMessage({ type: 'error', text: 'Selecione um evento antes de salvar as ocorrências' })
      return
    }

    // Validação básica
    const hasEmptyFields = occurrences.some(occ => 
      !occ.start_at || !occ.end_at || !occ.uf || !occ.state || !occ.city || !occ.address || !occ.venue
    )

    if (hasEmptyFields) {
      setMessage({ type: 'error', text: 'Preencha todos os campos obrigatórios' })
      return
    }

    try {
      setSaving(true)
      
      // Simulação de salvamento - substituir por API real
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setMessage({ type: 'success', text: 'Ocorrências salvas com sucesso!' })
      
      // Limpar formulário após sucesso
      setTimeout(() => {
        setOccurrences([{
          start_at: "",
          end_at: "",
          uf: "",
          state: "",
          city: "",
          address: "",
          venue: "",
        }])
        setSelectedEventId("")
        setMessage(null)
      }, 2000)
      
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar ocorrências. Tente novamente.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gerenciar Ocorrências</h1>
          <p className="text-gray-400">Adicione datas, horários e locais para os eventos</p>
        </div>
        <Button 
          onClick={addOccurrence}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Ocorrência
        </Button>
      </div>

      {/* Mensagem de feedback */}
      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-900 bg-opacity-20 border border-green-800 text-green-400' 
            : 'bg-red-900 bg-opacity-20 border border-red-800 text-red-400'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Seleção de Evento */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Selecionar Evento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {eventsLoading ? (
            <div className="text-gray-400">Carregando eventos...</div>
          ) : eventsError ? (
            <div className="text-red-400">{eventsError}</div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="event-select" className="text-white">Evento *</Label>
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Selecione um evento" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id} className="text-white hover:bg-zinc-700">
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulário de Ocorrências */}
      <div className="space-y-4">
        {occurrences.map((occurrence, index) => (
          <Card key={index} className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Ocorrência {index + 1}
                </CardTitle>
                {occurrences.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOccurrence(index)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900 hover:bg-opacity-20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Data e Hora */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`start-${index}`} className="text-white">Data/Hora Início *</Label>
                  <Input
                    id={`start-${index}`}
                    type="datetime-local"
                    value={occurrence.start_at}
                    onChange={(e) => updateOccurrence(index, 'start_at', e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`end-${index}`} className="text-white">Data/Hora Fim *</Label>
                  <Input
                    id={`end-${index}`}
                    type="datetime-local"
                    value={occurrence.end_at}
                    onChange={(e) => updateOccurrence(index, 'end_at', e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              {/* Localização */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`uf-${index}`} className="text-white">UF *</Label>
                  <Input
                    id={`uf-${index}`}
                    value={occurrence.uf}
                    onChange={(e) => updateOccurrence(index, 'uf', e.target.value)}
                    placeholder="Ex: SP"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`state-${index}`} className="text-white">Estado *</Label>
                  <Input
                    id={`state-${index}`}
                    value={occurrence.state}
                    onChange={(e) => updateOccurrence(index, 'state', e.target.value)}
                    placeholder="Ex: São Paulo"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`city-${index}`} className="text-white">Cidade *</Label>
                  <Input
                    id={`city-${index}`}
                    value={occurrence.city}
                    onChange={(e) => updateOccurrence(index, 'city', e.target.value)}
                    placeholder="Ex: São Paulo"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`address-${index}`} className="text-white">Endereço *</Label>
                  <Input
                    id={`address-${index}`}
                    value={occurrence.address}
                    onChange={(e) => updateOccurrence(index, 'address', e.target.value)}
                    placeholder="Ex: Rua das Flores, 123"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`venue-${index}`} className="text-white">Local *</Label>
                  <Input
                    id={`venue-${index}`}
                    value={occurrence.venue}
                    onChange={(e) => updateOccurrence(index, 'venue', e.target.value)}
                    placeholder="Ex: Teatro Municipal"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-4">
        <Button
          onClick={handleSave}
          disabled={saving || !selectedEventId}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Ocorrências'}
        </Button>
        
        <Button
          variant="outline"
          onClick={() => router.push('/admin/events')}
          className="border-zinc-700 text-white hover:bg-zinc-800"
        >
          Voltar para Eventos
        </Button>
      </div>
    </div>
  )
}