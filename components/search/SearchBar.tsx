"use client"

import { memo, useState, useCallback } from "react"
import { Search } from "lucide-react"
import { SearchBarProps } from "@/lib/search-types"

export const SearchBar = memo(({ 
  query, 
  onQueryChange, 
  onSubmit, 
  placeholder = "Busque por evento, categoria ou palavra-chave" 
}: SearchBarProps) => {
  const [localQuery, setLocalQuery] = useState(query)

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(localQuery)
  }, [localQuery, onSubmit])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalQuery(value)
    onQueryChange(value)
  }, [onQueryChange])

  return (
    <div className="bg-zinc-800 px-4 py-6 border-b border-zinc-700">
      <div className="max-w-6xl mx-auto">
        <form onSubmit={handleSubmit} className="relative w-full">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input
              type="search"
              name="q"
              value={localQuery}
              onChange={handleInputChange}
              placeholder={placeholder}
              className="w-full pl-12 pr-24 py-4 bg-zinc-700 border border-zinc-600 rounded text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              aria-label="Buscar eventos"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Buscar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
})

SearchBar.displayName = "SearchBar"
