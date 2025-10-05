export interface SearchFilters {
  query: string
  category: string
  location: string
  date?: string
}

export interface SearchResult {
  events: ApiEvent[]
  categories: Category[]
  locations: Location[]
  totalCount: number
}

export interface ApiEvent {
  id: string
  image: string
  image_url?: string
  title: string
  name?: string
  description?: string
  date: string
  location: string
  price: string
  slug: string
  category: string
  category_name?: string
  category_slug: string
  city: string
  ticket_count: number
  total_available_tickets?: number
  available_tickets?: number
  occurrences?: Array<{
    id: string
    venue_city_slug?: string
    venue?: {
      city?: string
    }
    uf?: string
    state?: string
    city?: string
  }>
}

export interface Category {
  name: string
  slug: string
  count?: string
  image?: string
  event_count?: number
}

export interface Location {
  name: string
  slug: string
  uf?: string
  state?: string
  count?: string
  image?: string
  event_count?: number
}

export interface SearchState {
  isLoading: boolean
  error: string | null
  results: SearchResult
}

export interface SearchBarProps {
  query: string
  onQueryChange: (query: string) => void
  onSubmit: (query: string) => void
  placeholder?: string
}

export interface FilterChipProps {
  label: string
  value: string
  onRemove: () => void
  type: 'category' | 'location'
}

export interface SearchResultsProps {
  events: ApiEvent[]
  categories: Category[]
  locations: Location[]
  isLoading: boolean
  error: string | null
  query: string
  categoryFilter: string
  locationFilter: string
}
