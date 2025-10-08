import { useState, useEffect, useCallback, useRef } from 'react'
import { Event } from '@/lib/types/occurrence'
import { adminApi } from '@/lib/api'

interface UseEventsProps {
  onError?: (error: string) => void
}

export function useEvents({ onError }: UseEventsProps = {}) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)
  
  // Usar ref para evitar recriação do callback
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError
  
  // Ref para controlar se já está carregando
  const isLoadingRef = useRef(false)

  // Carregar eventos
  const loadEvents = useCallback(async () => {
    // Evitar múltiplas chamadas simultâneas
    if (isLoadingRef.current) {
      return
    }

    try {
      isLoadingRef.current = true
      setLoading(true)
      setError(null)
      
      const response = await adminApi.events.getAll()
      setEvents(response.events)
      setHasLoaded(true)
    } catch (err) {
      const errorMessage = 'Erro ao carregar eventos'
      setError(errorMessage)
      onErrorRef.current?.(errorMessage)
      console.error('Erro ao carregar eventos:', err)
    } finally {
      setLoading(false)
      isLoadingRef.current = false
    }
  }, [])

  // Carregar eventos apenas uma vez na montagem
  useEffect(() => {
    if (!hasLoaded && !isLoadingRef.current) {
      loadEvents()
    }
  }, [loadEvents, hasLoaded])

  // Recarregar eventos manualmente
  const refreshEvents = useCallback(async () => {
    setHasLoaded(false)
    setLoading(true)
    setError(null)
    
    try {
      const response = await adminApi.events.getAll()
      setEvents(response.events)
      setHasLoaded(true)
    } catch (err) {
      const errorMessage = 'Erro ao recarregar eventos'
      setError(errorMessage)
      onErrorRef.current?.(errorMessage)
      console.error('Erro ao recarregar eventos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    events,
    loading,
    error,
    loadEvents: refreshEvents
  }
}
