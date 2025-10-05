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
