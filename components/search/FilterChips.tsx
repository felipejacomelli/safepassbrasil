"use client"

import { memo } from "react"
import { X } from "lucide-react"
import { FilterChipProps } from "@/lib/search-types"

const FilterChip = memo(({ label, value, onRemove, type }: FilterChipProps) => {
  const getHref = () => {
    // Esta lógica seria implementada no componente pai
    return "#"
  }

  return (
    <div className="flex items-center bg-blue-500/20 text-blue-400 rounded px-3 py-1 text-sm">
      <span className="mr-2">
        {type === 'category' ? 'Categoria' : 'Local'}: {label}
      </span>
      <button
        onClick={onRemove}
        className="text-blue-400 hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        aria-label={`Remover filtro ${type}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
})

FilterChip.displayName = "FilterChip"

interface FilterChipsProps {
  categoryFilter: string
  locationFilter: string
  query: string
  onRemoveCategory: () => void
  onRemoveLocation: () => void
  onClearAll: () => void
}

export const FilterChips = memo(({ 
  categoryFilter, 
  locationFilter, 
  query, 
  onRemoveCategory, 
  onRemoveLocation, 
  onClearAll 
}: FilterChipsProps) => {
  const hasFilters = categoryFilter || locationFilter

  if (!hasFilters) return null

  return (
    <div className="bg-zinc-800 px-4 py-4 border-b border-zinc-700">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-2 items-center">
          {categoryFilter && (
            <FilterChip
              label={categoryFilter}
              value={categoryFilter}
              onRemove={onRemoveCategory}
              type="category"
            />
          )}
          
          {locationFilter && (
            <FilterChip
              label={locationFilter}
              value={locationFilter}
              onRemove={onRemoveLocation}
              type="location"
            />
          )}
          
          <button
            onClick={onClearAll}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            Limpar todos os filtros
          </button>
        </div>
      </div>
    </div>
  )
})

FilterChips.displayName = "FilterChips"
