"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Ticket, Plus, Trash2, Save, AlertCircle, CheckCircle, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Tipos para Tipo de Ingresso
type TicketType = {
  id?: string
  occurrence_id?: string
  name: string
  price: string
  quantity: string
  max_per_purchase: string
  description: string
}

// Tipo para Ocorrência (para seleção)
type Occurrence = {
  id: string
  event_name: string
  start_at: string
  venue: string
  city: string
  state: string
}

export default function TicketTypesPage() {
  const router = useRouter()
  
  // Estados para controle de UI e dados
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    {
      name: "",
      price: "",
      quantity: "",
      max_per_purchase: "",
      description: "",
    },
  ])
  
  const [occurrences, setOccurrences] = useState<Occurrence[]>([])
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState<string>("")
  const [occurrencesLoading, setOccurrencesLoading] = useState(true)
  const [occurrencesError, setOccurrencesError] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Carregar ocorrências disponíveis
  useEffect(() => {
    const loadOccurrences = async () => {
      try {
        setOccurrencesLoading(true)
        // Simulação de carregamento de ocorrências - substituir por API real
        await new Promise(resolve => setTimeout(resolve, 1000))
        setOccurrences([
          { 
            id: "1", 
            event_name: "Festival de Música 2024", 
            start_at: "2024-03-15T20:00", 
            venue: "Estádio do Morumbi", 
            city: "São Paulo", 
            state: "SP" 
          },
          { 
            id: "2", 
            event_name: "Conferência Tech", 
            start_at: "2024-03-22T09:00", 
            venue: "Centro de Convenções", 
            city: "Belo Horizonte", 
            state: "MG" 
          },
          { 
            id: "3", 
            event_name: "Show de Rock", 
            start_at: "2024-03-28T21:00", 
            venue: "Arena da Baixada", 
            city: "Curitiba", 
            state: "PR" 
          }
        ])
        setOccurrencesError("")
      } catch (error) {
        setOccurrencesError("Erro ao carregar ocorrências")
      } finally {
        setOccurrencesLoading(false)
      }
    }

    loadOccurrences()
  }, [])

  // Função para adicionar novo tipo de ingresso
  const addTicketType = () => {
    setTicketTypes([
      ...ticketTypes,
      {
        name: "",
        price: "",
        quantity: "",
        max_per_purchase: "",
        description: "",
      },
    ])
  }

  // Função para remover tipo de ingresso
  const removeTicketType = (index: number) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(ticketTypes.filter((_, i) => i !== index))
    }
  }

  // Função para atualizar tipo de ingresso
  const updateTicketType = (index: number, field: keyof TicketType, value: string) => {
    const updated = [...ticketTypes]
    updated[index] = { ...updated[index], [field]: value }
    setTicketTypes(updated)
  }

  // Função para salvar tipos de ingressos
  const handleSave = async () => {
    if (!selectedOccurrenceId) {
      setMessage({ type: 'error', text: 'Selecione uma ocorrência antes de salvar os tipos de ingressos' })
      return
    }

    // Validação básica
    const hasEmptyFields = ticketTypes.some(ticket => 
      !ticket.name || !ticket.price || !ticket.quantity || !ticket.max_per_purchase
    )

    if (hasEmptyFields) {
      setMessage({ type: 'error', text: 'Preencha todos os campos obrigatórios' })
      return
    }

    // Validação de números
    const hasInvalidNumbers = ticketTypes.some(ticket => {
      const price = parseFloat(ticket.price)
      const quantity = parseInt(ticket.quantity)
      const maxPerPurchase = parseInt(ticket.max_per_purchase)
      
      return isNaN(price) || price <= 0 || 
             isNaN(quantity) || quantity <= 0 || 
             isNaN(maxPerPurchase) || maxPerPurchase <= 0
    })

    if (hasInvalidNumbers) {
      setMessage({ type: 'error', text: 'Verifique se preço, quantidade e máximo por compra são números válidos' })
      return
    }

    try {
      setSaving(true)
      
      // Simulação de salvamento - substituir por API real
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setMessage({ type: 'success', text: 'Tipos de ingressos salvos com sucesso!' })
      
      // Limpar formulário após sucesso
      setTimeout(() => {
        setTicketTypes([{
          name: "",
          price: "",
          quantity: "",
          max_per_purchase: "",
          description: "",
        }])
        setSelectedOccurrenceId("")
        setMessage(null)
      }, 2000)
      
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar tipos de ingressos. Tente novamente.' })
    } finally {
      setSaving(false)
    }
  }

  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gerenciar Tipos de Ingressos</h1>
          <p className="text-gray-400">Configure preços, quantidades e tipos de ingressos para as ocorrências</p>
        </div>
        <Button 
          onClick={addTicketType}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Tipo de Ingresso
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

      {/* Seleção de Ocorrência */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Selecionar Ocorrência
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {occurrencesLoading ? (
            <div className="text-gray-400">Carregando ocorrências...</div>
          ) : occurrencesError ? (
            <div className="text-red-400">{occurrencesError}</div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="occurrence-select" className="text-white">Ocorrência *</Label>
              <Select value={selectedOccurrenceId} onValueChange={setSelectedOccurrenceId}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Selecione uma ocorrência" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {occurrences.map((occurrence) => (
                    <SelectItem key={occurrence.id} value={occurrence.id} className="text-white hover:bg-zinc-700">
                      <div className="flex flex-col">
                        <span className="font-medium">{occurrence.event_name}</span>
                        <span className="text-sm text-gray-400">
                          {formatDate(occurrence.start_at)} - {occurrence.venue}, {occurrence.city}/{occurrence.state}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulário de Tipos de Ingressos */}
      <div className="space-y-4">
        {ticketTypes.map((ticketType, index) => (
          <Card key={index} className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Tipo de Ingresso {index + 1}
                </CardTitle>
                {ticketTypes.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTicketType(index)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900 hover:bg-opacity-20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nome e Preço */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`name-${index}`} className="text-white">Nome do Ingresso *</Label>
                  <Input
                    id={`name-${index}`}
                    value={ticketType.name}
                    onChange={(e) => updateTicketType(index, 'name', e.target.value)}
                    placeholder="Ex: Pista, VIP, Camarote"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`price-${index}`} className="text-white">Preço (R$) *</Label>
                  <Input
                    id={`price-${index}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={ticketType.price}
                    onChange={(e) => updateTicketType(index, 'price', e.target.value)}
                    placeholder="Ex: 50.00"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              {/* Quantidade e Máximo por Compra */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`quantity-${index}`} className="text-white">Quantidade Disponível *</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="1"
                    value={ticketType.quantity}
                    onChange={(e) => updateTicketType(index, 'quantity', e.target.value)}
                    placeholder="Ex: 100"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`max-${index}`} className="text-white">Máximo por Compra *</Label>
                  <Input
                    id={`max-${index}`}
                    type="number"
                    min="1"
                    value={ticketType.max_per_purchase}
                    onChange={(e) => updateTicketType(index, 'max_per_purchase', e.target.value)}
                    placeholder="Ex: 4"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor={`description-${index}`} className="text-white">Descrição</Label>
                <Textarea
                  id={`description-${index}`}
                  value={ticketType.description}
                  onChange={(e) => updateTicketType(index, 'description', e.target.value)}
                  placeholder="Descreva os benefícios e características deste tipo de ingresso..."
                  className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-4">
        <Button
          onClick={handleSave}
          disabled={saving || !selectedOccurrenceId}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Tipos de Ingressos'}
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