"use client"

import { useMemo } from "react"
import { useData } from "@/contexts/data-context"
import { SearchFilters, SearchResult, ApiEvent, Category, Location } from "@/lib/search-types"

export function useSearchResults(filters: SearchFilters) {
  const { events, categories, locations, isLoading, error } = useData()

  const results = useMemo((): SearchResult => {
    if (!events || !categories || !locations) {
      return {
        events: [],
        categories: [],
        locations: [],
        totalCount: 0
      }
    }

    // Filter events
    const filteredEvents = events.filter((event: any) => {
      // Category filter
      if (filters.category) {
        const eventCategorySlug = event.category ? event.category.toLowerCase().replace(/\s+/g, '-') : ''
        if (eventCategorySlug !== filters.category) return false
      }
      
      // Location filter
      if (filters.location) {
        if (event.occurrences && event.occurrences.length > 0) {
          const hasMatchingLocation = event.occurrences.some((occ: any) => 
            occ.uf === filters.location || occ.state === filters.location
          )
          if (!hasMatchingLocation) return false
        } else {
          const eventLocation = event.city || event.location || ''
          if (!eventLocation.toLowerCase().includes(filters.location.toLowerCase())) {
            return false
          }
        }
      }
      
      // Query filter
      if (filters.query) {
        const searchQuery = filters.query.toLowerCase().trim()
        const searchableFields = [
          event.title || event.name,
          event.category || event.category_name,
          event.location,
          event.city,
          event.description
        ].filter(Boolean)
        
        const hasExactMatch = searchableFields.some(field => 
          field && field.toLowerCase().includes(searchQuery)
        )
        
        const searchWords = searchQuery.split(' ').filter(word => word.length > 2)
        const hasPartialMatch = searchWords.length > 0 && searchWords.some(word =>
          searchableFields.some(field => field && field.toLowerCase().includes(word))
        )
        
        if (!hasExactMatch && !hasPartialMatch) return false
      }
      
      // Date filter
      if (filters.dateFilter) {
        const today = new Date()
        const todayStr = today.toISOString().split('T')[0]
        
        if (filters.dateFilter === 'today') {
          // Filtrar eventos que ocorrem hoje
          if (event.occurrences && event.occurrences.length > 0) {
            const hasTodayEvent = event.occurrences.some((occ: any) => {
              const eventDate = new Date(occ.start_at).toISOString().split('T')[0]
              return eventDate === todayStr
            })
            if (!hasTodayEvent) return false
          } else {
            // Se não tem occurrences, verificar se a data do evento é hoje
            const eventDate = new Date(event.date || event.start_at || '').toISOString().split('T')[0]
            if (eventDate !== todayStr) return false
          }
        } else if (filters.dateFilter === 'weekend') {
          // Filtrar eventos que ocorrem no próximo final de semana
          const currentDay = today.getDay() // 0 = domingo, 6 = sábado
          const daysUntilWeekend = currentDay === 0 ? 6 : 6 - currentDay // dias até o próximo sábado
          const saturday = new Date(today)
          saturday.setDate(today.getDate() + daysUntilWeekend)
          const sunday = new Date(saturday)
          sunday.setDate(saturday.getDate() + 1)
          
          const saturdayStr = saturday.toISOString().split('T')[0]
          const sundayStr = sunday.toISOString().split('T')[0]
          
          if (event.occurrences && event.occurrences.length > 0) {
            const hasWeekendEvent = event.occurrences.some((occ: any) => {
              const eventDate = new Date(occ.start_at).toISOString().split('T')[0]
              return eventDate === saturdayStr || eventDate === sundayStr
            })
            if (!hasWeekendEvent) return false
          } else {
            // Se não tem occurrences, verificar se a data do evento é no final de semana
            const eventDate = new Date(event.date || event.start_at || '').toISOString().split('T')[0]
            if (eventDate !== saturdayStr && eventDate !== sundayStr) return false
          }
        }
      }
      
      return true
    })

    // Filter categories
    const filteredCategories = categories.filter((category: any) => {
      if (filters.category && category.slug !== filters.category) return false
      if (filters.query && !category.name.toLowerCase().includes(filters.query.toLowerCase())) return false
      return true
    })

    // Filter locations
    const filteredLocations = locations.filter((location: any) => {
      if (filters.location && location.uf !== filters.location) return false
      if (filters.query && location.state && !location.state.toLowerCase().includes(filters.query.toLowerCase())) return false
      return true
    })

    return {
      events: filteredEvents as ApiEvent[],
      categories: filteredCategories as Category[],
      locations: filteredLocations as Location[],
      totalCount: filteredEvents.length
    }
  }, [events, categories, locations, filters])

  return {
    results,
    isLoading,
    error
  }
}
