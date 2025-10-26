"use client"

import { useSearchParams } from "next/navigation"
import { useMemo } from "react"
import { SearchFilters } from "@/lib/search-types"

export function useSearchFilters(): SearchFilters {
  const searchParams = useSearchParams()
  
  return useMemo(() => ({
    query: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    date: searchParams.get('date') || undefined,
    dateFilter: (searchParams.get('dateFilter') as 'today' | 'weekend') || undefined
  }), [searchParams])
}
