"use client"

import { memo } from "react"
import { EventCard } from "@/app/page"
import { SearchResultsProps, ApiEvent } from "@/lib/search-types"

const LoadingSkeleton = memo(() => (
  <div className="flex items-center justify-center py-12">
    <div className="flex items-center space-x-3">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      <span className="text-zinc-400">Carregando eventos...</span>
    </div>
  </div>
))

LoadingSkeleton.displayName = "LoadingSkeleton"

const ErrorMessage = memo(({ error }: { error: string }) => (
  <div className="bg-red-950/20 border border-red-500/30 rounded p-6 mb-8">
    <div className="flex items-center space-x-3">
      <div className="text-red-400 text-xl">⚠️</div>
      <div>
        <h3 className="text-red-400 font-semibold mb-2">Erro ao carregar eventos</h3>
        <p className="text-red-300">{error}</p>
      </div>
    </div>
  </div>
))

ErrorMessage.displayName = "ErrorMessage"

const EmptyState = memo(({ query }: { query: string }) => (
  <div className="text-center py-12">
    <div className="text-zinc-400 mb-4">
      {query ? `Nenhum resultado encontrado para "${query}"` : "Nenhum evento encontrado"}
    </div>
    <p className="text-zinc-500 text-sm">
      Tente outra busca ou remova os filtros aplicados
    </p>
  </div>
))

EmptyState.displayName = "EmptyState"

const transformEventForCard = (event: ApiEvent) => ({
  ...event,
  name: event.name || event.title,
  total_available_tickets: event.total_available_tickets || event.ticket_count || event.available_tickets
})

export const SearchResults = memo(({ 
  events, 
  categories, 
  locations, 
  isLoading, 
  error, 
  query, 
  categoryFilter, 
  locationFilter 
}: SearchResultsProps) => {
  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorMessage error={error} />
  }

  if (events.length === 0) {
    return <EmptyState query={query} />
  }

  return (
    <div className="space-y-8">
      {/* Results Count */}
      <div className="text-zinc-400">
        Encontramos {events.length} evento{events.length !== 1 ? 's' : ''}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {events.map((event: ApiEvent) => (
          <EventCard 
            key={`search-event-${event.id}`} 
            event={transformEventForCard(event)} 
          />
        ))}
      </div>

      {/* Categories Section */}
      {!categoryFilter && !locationFilter && query && categories.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            Categorias ({categories.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <a
                key={`search-category-${category.name}`}
                href={`/search?category=${encodeURIComponent(category.slug)}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                className="group block"
              >
                <div className="relative aspect-square rounded overflow-hidden">
                  <img
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold text-lg mb-1">
                      {category.name}
                    </h3>
                    <p className="text-zinc-300 text-sm">
                      {category.event_count || 0} eventos
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Locations Section */}
      {!categoryFilter && !locationFilter && query && locations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            Localizações ({locations.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {locations.map((location) => (
              <a
                key={`search-location-${location.state}`}
                href={`/search?location=${encodeURIComponent(location.uf || '')}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                className="group block"
              >
                <div className="relative aspect-square rounded overflow-hidden">
                  <img
                    src="/placeholder.svg"
                    alt={location.state}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold text-lg mb-1">
                      {location.state}
                    </h3>
                    <p className="text-zinc-300 text-sm">
                      {location.event_count || 0} eventos
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
})

SearchResults.displayName = "SearchResults"
