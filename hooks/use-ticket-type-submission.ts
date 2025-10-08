import { useState, useCallback } from 'react'
import { TicketTypeFormData } from './use-ticket-types'
import { apiRequest } from '@/lib/api'

export interface TicketTypeCreateRequest {
  occurrence: string
  name: string
  price: number
  quantity: number
  max_per_purchase: number
  description?: string
}

export interface TicketTypeCreateResponse {
  id: string
  occurrence: string
  name: string
  price: number
  quantity: number
  max_per_purchase: number
  description?: string
  created_at: string
  updated_at: string
}

interface UseTicketTypeSubmissionProps {
  onSuccess?: (message: string) => void
  onError?: (error: string) => void
}

export function useTicketTypeSubmission({ onSuccess, onError }: UseTicketTypeSubmissionProps = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  // Criar tipo de ingresso individual
  const createTicketType = useCallback(async (data: TicketTypeCreateRequest): Promise<TicketTypeCreateResponse> => {
    const response = await apiRequest('/ticket-types/', {
      method: 'POST',
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Erro ao criar tipo de ingresso')
    }

    return response.json()
  }, [])

  // Criar múltiplos tipos de ingressos
  const createTicketTypes = useCallback(async (
    occurrenceId: string, 
    ticketTypes: TicketTypeFormData[]
  ): Promise<TicketTypeCreateResponse[]> => {
    setIsSubmitting(true)
    setSubmissionError(null)

    try {
      const results: TicketTypeCreateResponse[] = []
      
      // Criar cada tipo de ingresso individualmente
      for (const ticketType of ticketTypes) {
        const requestData: TicketTypeCreateRequest = {
          occurrence: occurrenceId,
          name: ticketType.name,
          price: parseFloat(ticketType.price),
          quantity: parseInt(ticketType.quantity),
          max_per_purchase: parseInt(ticketType.max_per_purchase),
          description: ticketType.description || undefined
        }

        const result = await createTicketType(requestData)
        results.push(result)
      }

      onSuccess?.(`${results.length} tipo(s) de ingresso criado(s) com sucesso!`)
      return results

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao criar tipos de ingressos'
      setSubmissionError(errorMessage)
      onError?.(errorMessage)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }, [createTicketType, onSuccess, onError])

  // Limpar erro
  const clearError = useCallback(() => {
    setSubmissionError(null)
  }, [])

  return {
    isSubmitting,
    submissionError,
    createTicketTypes,
    clearError
  }
}