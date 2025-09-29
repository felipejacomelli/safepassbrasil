"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Star, Plus, Trash2, Save, AlertCircle, CheckCircle, Upload, X, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Tipos para Ingresso Único
type UniqueTicket = {
  id?: string
  occurrence_id?: string
  name: string
  price: string
  quantity: string
  max_per_purchase: string
  description: string
  image?: File | null
  imagePreview?: string
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

export default function UniqueTicketsPage() {
  const router = useRouter()
  
  // Estados para controle de UI e dados
  const [uniqueTickets, setUniqueTickets] = useState<UniqueTicket[]>([
    {
      name: "",
      price: "",
      quantity: "",
      max_per_purchase: "",
      description: "",
      image: null,
      imagePreview: "",
    },
  ])
  
  const [occurrences, setOccurrences] = useState<Occurrence[]>([])
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState<string>("")
  const [occurrencesLoading, setOccurrencesLoading] = useState(true)
  const [occurrencesError, setOccurrencesError] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [qrObfuscated, setQrObfuscated] = useState<{ [key: number]: boolean }>({})

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

  // Função para adicionar novo ingresso único
  const addUniqueTicket = () => {
    setUniqueTickets([
      ...uniqueTickets,
      {
        name: "",
        price: "",
        quantity: "",
        max_per_purchase: "",
        description: "",
        image: null,
        imagePreview: "",
      },
    ])
  }

  // Função para remover ingresso único
  const removeUniqueTicket = (index: number) => {
    if (uniqueTickets.length > 1) {
      setUniqueTickets(uniqueTickets.filter((_, i) => i !== index))
      // Remover estado de ofuscação do QR Code
      const newQrObfuscated = { ...qrObfuscated }
      delete newQrObfuscated[index]
      setQrObfuscated(newQrObfuscated)
    }
  }

  // Função para atualizar ingresso único
  const updateUniqueTicket = (index: number, field: keyof UniqueTicket, value: string | File | null) => {
    const updated = [...uniqueTickets]
    updated[index] = { ...updated[index], [field]: value }
    setUniqueTickets(updated)
  }

  // Função para lidar com upload de imagem
  const handleImageUpload = (index: number, file: File | null) => {
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const updated = [...uniqueTickets]
        updated[index] = { 
          ...updated[index], 
          image: file,
          imagePreview: e.target?.result as string
        }
        setUniqueTickets(updated)
      }
      reader.readAsDataURL(file)
    } else {
      const updated = [...uniqueTickets]
      updated[index] = { 
        ...updated[index], 
        image: null,
        imagePreview: ""
      }
      setUniqueTickets(updated)
    }
  }

  // Função para alternar ofuscação do QR Code
  const toggleQrObfuscation = (index: number) => {
    setQrObfuscated(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  // Função para salvar ingressos únicos
  const handleSave = async () => {
    if (!selectedOccurrenceId) {
      setMessage({ type: 'error', text: 'Selecione uma ocorrência antes de salvar os ingressos únicos' })
      return
    }

    // Validação básica
    const hasEmptyFields = uniqueTickets.some(ticket => 
      !ticket.name || !ticket.price || !ticket.quantity || !ticket.max_per_purchase
    )

    if (hasEmptyFields) {
      setMessage({ type: 'error', text: 'Preencha todos os campos obrigatórios' })
      return
    }

    // Validação de números
    const hasInvalidNumbers = uniqueTickets.some(ticket => {
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
      
      setMessage({ type: 'success', text: 'Ingressos únicos salvos com sucesso!' })
      
      // Limpar formulário após sucesso
      setTimeout(() => {
        setUniqueTickets([{
          name: "",
          price: "",
          quantity: "",
          max_per_purchase: "",
          description: "",
          image: null,
          imagePreview: "",
        }])
        setSelectedOccurrenceId("")
        setQrObfuscated({})
        setMessage(null)
      }, 2000)
      
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar ingressos únicos. Tente novamente.' })
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
          <h1 className="text-2xl font-bold text-white">Gerenciar Ingressos Únicos</h1>
          <p className="text-gray-400">Configure ingressos personalizados e exclusivos com imagens e QR Codes</p>
        </div>
        <Button 
          onClick={addUniqueTicket}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Ingresso Único
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
            <Star className="h-5 w-5" />
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

      {/* Formulário de Ingressos Únicos */}
      <div className="space-y-4">
        {uniqueTickets.map((uniqueTicket, index) => (
          <Card key={index} className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Ingresso Único {index + 1}
                </CardTitle>
                {uniqueTickets.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUniqueTicket(index)}
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
                    value={uniqueTicket.name}
                    onChange={(e) => updateUniqueTicket(index, 'name', e.target.value)}
                    placeholder="Ex: VIP Exclusivo, Meet & Greet"
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
                    value={uniqueTicket.price}
                    onChange={(e) => updateUniqueTicket(index, 'price', e.target.value)}
                    placeholder="Ex: 500.00"
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
                    value={uniqueTicket.quantity}
                    onChange={(e) => updateUniqueTicket(index, 'quantity', e.target.value)}
                    placeholder="Ex: 10"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`max-${index}`} className="text-white">Máximo por Compra *</Label>
                  <Input
                    id={`max-${index}`}
                    type="number"
                    min="1"
                    value={uniqueTicket.max_per_purchase}
                    onChange={(e) => updateUniqueTicket(index, 'max_per_purchase', e.target.value)}
                    placeholder="Ex: 2"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor={`description-${index}`} className="text-white">Descrição</Label>
                <Textarea
                  id={`description-${index}`}
                  value={uniqueTicket.description}
                  onChange={(e) => updateUniqueTicket(index, 'description', e.target.value)}
                  placeholder="Descreva os benefícios exclusivos e características especiais deste ingresso único..."
                  className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
                />
              </div>

              {/* Upload de Imagem */}
              <div className="space-y-2">
                <Label className="text-white">Imagem do Ingresso</Label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        handleImageUpload(index, file)
                      }}
                      className="bg-zinc-800 border-zinc-700 text-white file:bg-zinc-700 file:text-white file:border-0 file:rounded file:px-3 file:py-1"
                    />
                  </div>
                  {uniqueTicket.imagePreview && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleImageUpload(index, null)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900 hover:bg-opacity-20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {/* Preview da Imagem */}
                {uniqueTicket.imagePreview && (
                  <div className="relative">
                    <div className="relative w-full max-w-md mx-auto">
                      <img
                        src={uniqueTicket.imagePreview}
                        alt="Preview do ingresso"
                        className="w-full h-48 object-cover rounded-lg border border-zinc-700"
                      />
                      
                      {/* Simulação de QR Code ofuscado */}
                      <div className="absolute bottom-2 right-2">
                        <div className={`w-16 h-16 bg-white rounded ${qrObfuscated[index] ? 'blur-sm' : ''} flex items-center justify-center`}>
                          <div className="w-12 h-12 bg-black rounded grid grid-cols-4 gap-px p-1">
                            {Array.from({ length: 16 }).map((_, i) => (
                              <div
                                key={i}
                                className={`bg-white ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-0'}`}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleQrObfuscation(index)}
                          className="absolute -top-8 -right-2 bg-zinc-800 bg-opacity-80 text-white hover:bg-zinc-700"
                        >
                          {qrObfuscated[index] ? (
                            <Eye className="h-3 w-3" />
                          ) : (
                            <EyeOff className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-2">
                      QR Code será gerado automaticamente no ingresso final
                    </p>
                  </div>
                )}
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
          {saving ? 'Salvando...' : 'Salvar Ingressos Únicos'}
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