"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import useSWR from 'swr'

// Fetcher function
const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Erro ao buscar dados")
    return res.json()
  })

// Types
interface Event {
  id: string
  image: string
  title: string
  date: string
  location: string
  price: string
  slug: string
  category: string
  city: string
  ticket_count: number
}

interface Category {
  id: string
  name: string
  slug: string
  image: string
  event_count: number
}

interface Location {
  uf: string
  state: string
  event_count: number
}

interface DataContextType {
  events: Event[]
  categories: Category[]
  locations: Location[]
  isLoading: boolean
  error: any
  refetch: () => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

interface DataProviderProps {
  children: ReactNode
}

export function DataProvider({ children }: DataProviderProps) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  
  const { data, error, isLoading, mutate } = useSWR(
    `${baseUrl}/api/events/home/`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000, // 5 minutos
    }
  )

  const contextValue: DataContextType = {
    events: data?.events || [],
    categories: data?.categories || [],
    locations: data?.locations || [],
    isLoading,
    error,
    refetch: mutate
  }

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData deve ser usado dentro de um DataProvider')
  }
  return context
}