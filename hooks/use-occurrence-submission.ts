import { useState, useCallback } from 'react'
import { OccurrenceFormData, OccurrenceCreateRequest, OccurrenceCreateResponse } from '@/lib/types/occurrence'
import { apiRequest } from '@/lib/api'

interface UseOccurrenceSubmissionProps {
  onSuccess?: (message: string) => void
  onError?: (error: string) => void
}

export function useOccurrenceSubmission({ onSuccess, onError }: UseOccurrenceSubmissionProps = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  // Criar ocorrência individual
  const createOccurrence = useCallback(async (data: OccurrenceCreateRequest): Promise<OccurrenceCreateResponse> => {
    const response = await apiRequest('/occurrences/', {
      method: 'POST',
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Erro ao criar ocorrência')
    }

    return response.json()
  }, [])

  // Criar múltiplas ocorrências
  const createOccurrences = useCallback(async (
    eventId: string, 
    occurrences: OccurrenceFormData[]
  ): Promise<OccurrenceCreateResponse[]> => {
    setIsSubmitting(true)
    setSubmissionError(null)

    try {
      const results: OccurrenceCreateResponse[] = []
      
      // Criar cada ocorrência individualmente
      for (const occurrence of occurrences) {
        const requestData: OccurrenceCreateRequest = {
          event: eventId,
          start_at: occurrence.start_at,
          end_at: occurrence.end_at,
          uf: occurrence.uf,
          state: occurrence.state,
          city: occurrence.city
        }

        const result = await createOccurrence(requestData)
        results.push(result)
      }

      onSuccess?.(`${results.length} ocorrência(s) criada(s) com sucesso!`)
      return results

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao criar ocorrências'
      setSubmissionError(errorMessage)
      onError?.(errorMessage)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }, [createOccurrence, onSuccess, onError])

  // Limpar erro
  const clearError = useCallback(() => {
    setSubmissionError(null)
  }, [])

  return {
    isSubmitting,
    submissionError,
    createOccurrences,
    clearError
  }
}

