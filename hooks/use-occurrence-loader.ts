import { useState, useCallback, useEffect } from 'react'
import { Occurrence } from '@/lib/types/occurrence'
import { apiRequest } from '@/lib/api'

interface UseOccurrenceLoaderProps {
  eventId?: string
}

export function useOccurrenceLoader({ eventId }: UseOccurrenceLoaderProps = {}) {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carregar ocorrências por evento
  const loadOccurrences = useCallback(async (selectedEventId?: string) => {
    const targetEventId = selectedEventId || eventId
    
    if (!targetEventId) {
      setOccurrences([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await apiRequest(`/occurrences/?event=${targetEventId}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar ocorrências')
      }

      const data = await response.json()
      setOccurrences(data.results || data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado ao carregar ocorrências'
      setError(errorMessage)
      setOccurrences([])
    } finally {
      setIsLoading(false)
    }
  }, [eventId])

  // Carregar automaticamente quando eventId mudar
  useEffect(() => {
    if (eventId) {
      loadOccurrences()
    } else {
      setOccurrences([])
    }
  }, [eventId, loadOccurrences])

  // Limpar dados
  const clearOccurrences = useCallback(() => {
    setOccurrences([])
    setError(null)
  }, [])

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    occurrences,
    isLoading,
    error,
    loadOccurrences,
    clearOccurrences,
    clearError
  }
}