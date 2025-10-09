import { useState, useCallback } from 'react'

export interface UniqueTicket {
  id: string
  name: string
  price: string
  quantity: number
  description: string
  images: File[]
  imagePreviews: string[]
  price_blocked?: boolean
  status?: string
}

export interface TicketError {
  name?: string
  price?: string
  quantity?: string
  description?: string
  images?: string
}

export function useUniqueTickets() {
  const [tickets, setTickets] = useState<UniqueTicket[]>([])
  const [errors, setErrors] = useState<Record<number, TicketError>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<any[]>([])
  const [occurrences, setOccurrences] = useState<any[]>([])
  const [ticketTypes, setTicketTypes] = useState<any[]>([])

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const fetchEvents = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/events/`)
      if (!response.ok) {
        throw new Error('Falha ao carregar eventos')
      }
      
      const data = await response.json()
      setEvents(data.results || data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }, [API_BASE_URL])

  const fetchOccurrences = useCallback(async (eventId: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/events/${eventId}/occurrences/`)
      if (!response.ok) {
        throw new Error('Falha ao carregar ocorrências')
      }
      
      const data = await response.json()
      setOccurrences(data.results || data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setOccurrences([])
    } finally {
      setIsLoading(false)
    }
  }, [API_BASE_URL])

  const fetchTicketTypes = useCallback(async (occurrenceId: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/ticket_app/occurrences/${occurrenceId}/ticket-types/`)
      if (!response.ok) {
        throw new Error('Falha ao carregar tipos de ingressos')
      }
      
      const data = await response.json()
      setTicketTypes(data.results || data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setTicketTypes([])
    } finally {
      setIsLoading(false)
    }
  }, [API_BASE_URL])

  const submitTickets = useCallback(async (ticketsData: any) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/ticket_app/unique-tickets/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(ticketsData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Falha ao criar ingressos únicos')
      }
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [API_BASE_URL])

  const addTicket = useCallback(() => {
    const newTicket: UniqueTicket = {
      id: `ticket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      price: 'R$ 0,00',
      quantity: 1,
      description: '',
      images: [],
      imagePreviews: [],
      price_blocked: false,
      status: 'available'
    }
    setTickets(prev => [...prev, newTicket])
  }, [])

  const removeTicket = useCallback((index: number) => {
    setTickets(prev => prev.filter((_, i) => i !== index))
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[index]
      // Reindexar erros
      const reindexedErrors: Record<number, TicketError> = {}
      Object.entries(newErrors).forEach(([key, value]) => {
        const oldIndex = parseInt(key)
        if (oldIndex > index) {
          reindexedErrors[oldIndex - 1] = value
        } else {
          reindexedErrors[oldIndex] = value
        }
      })
      return reindexedErrors
    })
  }, [])

  const updateTicket = useCallback((index: number, field: keyof UniqueTicket, value: any) => {
    setTickets(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })

    // Limpar erro do campo quando atualizado
    setErrors(prev => {
      const newErrors = { ...prev }
      if (newErrors[index]) {
        delete newErrors[index][field as keyof TicketError]
        if (Object.keys(newErrors[index]).length === 0) {
          delete newErrors[index]
        }
      }
      return newErrors
    })
  }, [])

  const formatPrice = useCallback((value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '')
    
    // Se não há números, retorna vazio
    if (!numbers) return ''
    
    // Converte para número e formata
    const numberValue = parseInt(numbers) / 100
    return numberValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }, [])

  const validateTickets = useCallback(() => {
    const newErrors: Record<number, TicketError> = {}
    let isValid = true

    tickets.forEach((ticket, index) => {
      const ticketErrors: TicketError = {}

      // Validar nome
      if (!ticket.name.trim()) {
        ticketErrors.name = 'Nome é obrigatório'
        isValid = false
      } else if (ticket.name.trim().length < 3) {
        ticketErrors.name = 'Nome deve ter pelo menos 3 caracteres'
        isValid = false
      } else if (ticket.name.trim().length > 100) {
        ticketErrors.name = 'Nome deve ter no máximo 100 caracteres'
        isValid = false
      }

      // Validar preço
      if (!ticket.price.trim()) {
        ticketErrors.price = 'Preço é obrigatório'
        isValid = false
      } else {
        const priceValue = parseFloat(ticket.price.replace(/[^\d,]/g, '').replace(',', '.'))
        if (isNaN(priceValue) || priceValue <= 0) {
          ticketErrors.price = 'Preço deve ser um número válido maior que zero'
          isValid = false
        } else if (priceValue > 999999.99) {
          ticketErrors.price = 'Preço não pode ser maior que R$ 999.999,99'
          isValid = false
        }
      }

      // Validar quantidade
      if (ticket.quantity <= 0) {
        ticketErrors.quantity = 'Quantidade deve ser maior que zero'
        isValid = false
      } else if (ticket.quantity > 1000) {
        ticketErrors.quantity = 'Quantidade não pode ser maior que 1000'
        isValid = false
      }

      // Validar descrição
      if (ticket.description && ticket.description.length > 500) {
        ticketErrors.description = 'Descrição deve ter no máximo 500 caracteres'
        isValid = false
      }

      // Validar imagens
      if (ticket.images.length === 0) {
        ticketErrors.images = 'Pelo menos uma imagem é obrigatória'
        isValid = false
      } else if (ticket.images.length > 5) {
        ticketErrors.images = 'Máximo de 5 imagens por ingresso'
        isValid = false
      } else {
        // Validar tamanho das imagens
        const oversizedImages = ticket.images.filter(img => img.size > 5 * 1024 * 1024) // 5MB
        if (oversizedImages.length > 0) {
          ticketErrors.images = 'Imagens devem ter no máximo 5MB cada'
          isValid = false
        }
      }

      if (Object.keys(ticketErrors).length > 0) {
        newErrors[index] = ticketErrors
      }
    })

    setErrors(newErrors)
    return isValid
  }, [tickets])

  const validateField = useCallback((index: number, field: keyof UniqueTicket, value: any) => {
    const fieldErrors: Partial<TicketError> = {}

    switch (field) {
      case 'name':
        if (!value.trim()) {
          fieldErrors.name = 'Nome é obrigatório'
        } else if (value.trim().length < 3) {
          fieldErrors.name = 'Nome deve ter pelo menos 3 caracteres'
        } else if (value.trim().length > 100) {
          fieldErrors.name = 'Nome deve ter no máximo 100 caracteres'
        }
        break

      case 'price':
        if (!value.trim()) {
          fieldErrors.price = 'Preço é obrigatório'
        } else {
          const priceValue = parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.'))
          if (isNaN(priceValue) || priceValue <= 0) {
            fieldErrors.price = 'Preço deve ser um número válido maior que zero'
          } else if (priceValue > 999999.99) {
            fieldErrors.price = 'Preço não pode ser maior que R$ 999.999,99'
          }
        }
        break

      case 'quantity':
        if (value <= 0) {
          fieldErrors.quantity = 'Quantidade deve ser maior que zero'
        } else if (value > 1000) {
          fieldErrors.quantity = 'Quantidade não pode ser maior que 1000'
        }
        break

      case 'description':
        if (value && value.length > 500) {
          fieldErrors.description = 'Descrição deve ter no máximo 500 caracteres'
        }
        break

      case 'images':
        if (value.length === 0) {
          fieldErrors.images = 'Pelo menos uma imagem é obrigatória'
        } else if (value.length > 5) {
          fieldErrors.images = 'Máximo de 5 imagens por ingresso'
        } else {
          const oversizedImages = value.filter((img: File) => img.size > 5 * 1024 * 1024)
          if (oversizedImages.length > 0) {
            fieldErrors.images = 'Imagens devem ter no máximo 5MB cada'
          }
        }
        break
    }

    setErrors(prev => {
      const newErrors = { ...prev }
      if (!newErrors[index]) {
        newErrors[index] = {}
      }

      if (fieldErrors[field as keyof TicketError]) {
        newErrors[index][field as keyof TicketError] = fieldErrors[field as keyof TicketError]
      } else {
        delete newErrors[index][field as keyof TicketError]
        if (Object.keys(newErrors[index]).length === 0) {
          delete newErrors[index]
        }
      }

      return newErrors
    })
  }, [])

  const resetTickets = useCallback(() => {
    setTickets([
      {
        id: `ticket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: "",
        price: "R$ 0,00",
        quantity: 1,
        description: "",
        images: [],
        imagePreviews: [],
        price_blocked: false,
        status: "available",
      }
    ])
    setErrors({})
  }, [])

  const clearTickets = useCallback(() => {
    setTickets([])
    setErrors({})
  }, [])

  const duplicateTicket = useCallback((index: number) => {
    const ticketToDuplicate = tickets[index]
    const duplicatedTicket = {
      ...ticketToDuplicate,
      id: `ticket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${ticketToDuplicate.name} (Cópia)`,
      images: [], // Não duplicar imagens por questões de performance
      imagePreviews: []
    }
    
    setTickets(prev => [
      ...prev.slice(0, index + 1),
      duplicatedTicket,
      ...prev.slice(index + 1)
    ])
  }, [tickets])

  const getTotalTickets = useCallback(() => {
    return tickets.reduce((total, ticket) => total + ticket.quantity, 0)
  }, [tickets])

  const getTotalValue = useCallback(() => {
    return tickets.reduce((total, ticket) => {
      const price = parseFloat(ticket.price.replace(/[^\d,]/g, '').replace(',', '.')) || 0
      return total + (price * ticket.quantity)
    }, 0)
  }, [tickets])

  return {
    tickets,
    errors,
    isLoading,
    error,
    events,
    occurrences,
    ticketTypes,
    fetchEvents,
    fetchOccurrences,
    fetchTicketTypes,
    submitTickets,
    addTicket,
    removeTicket,
    updateTicket,
    validateTickets,
    validateField,
    resetTickets,
    clearTickets,
    duplicateTicket,
    formatPrice,
    getTotalTickets,
    getTotalValue,
  }
}