"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { eventsApi, ApiEvent } from '@/lib/api'

interface EventsContextType {
  events: ApiEvent[]
  setEvents: (events: ApiEvent[]) => void
  updateEventTicketCount: (eventId: string | number, newCount: number) => void
  refreshEvents: () => Promise<void>
  loading: boolean
}

const EventsContext = createContext<EventsContextType | undefined>(undefined)

interface EventsProviderProps {
  children: ReactNode
}

export function EventsProvider({ children }: EventsProviderProps) {
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [loading, setLoading] = useState(false)

  const updateEventTicketCount = useCallback((eventId: string | number, newCount: number) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === String(eventId) 
          ? { ...event, ticket_count: newCount }
          : event
      )
    )
  }, [])

  const refreshEvents = useCallback(async () => {
    setLoading(true)
    try {
      const updatedEvents = await eventsApi.getAll()
      setEvents(updatedEvents)
    } catch (error) {
      console.error('Erro ao atualizar eventos:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const value: EventsContextType = {
    events,
    setEvents,
    updateEventTicketCount,
    refreshEvents,
    loading
  }

  return (
    <EventsContext.Provider value={value}>
      {children}
    </EventsContext.Provider>
  )
}

export function useEvents() {
  const context = useContext(EventsContext)
  if (context === undefined) {
    throw new Error('useEvents deve ser usado dentro de um EventsProvider')
  }
  return context
}