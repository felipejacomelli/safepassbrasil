"use client"

import { useState, useCallback, useEffect } from "react"
import { Search, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SearchInputProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onClear?: () => void
  isLoading?: boolean
  className?: string
  debounceMs?: number
}

export function SearchInput({
  placeholder = "Buscar...",
  value,
  onChange,
  onClear,
  isLoading = false,
  className,
  debounceMs = 300
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(value)

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [internalValue, onChange, value, debounceMs])

  // Sync external value changes
  useEffect(() => {
    if (value !== internalValue) {
      setInternalValue(value)
    }
  }, [value])

  const handleClear = useCallback(() => {
    setInternalValue("")
    onChange("")
    onClear?.()
  }, [onChange, onClear])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value)
  }, [])

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={internalValue}
          onChange={handleInputChange}
          className={cn(
            "pl-10 pr-10 h-12 text-base",
            "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "transition-all duration-200",
            isLoading && "pr-16"
          )}
          aria-label="Campo de busca"
          role="searchbox"
          aria-expanded={!!internalValue}
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        
        {/* Clear button */}
        {internalValue && !isLoading && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 p-0 hover:bg-gray-100"
            aria-label="Limpar busca"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Search hint */}
      {internalValue && (
        <div className="mt-2 text-sm text-muted-foreground">
          {isLoading ? (
            "Buscando..."
          ) : (
            `Buscando por "${internalValue}"`
          )}
        </div>
      )}
    </div>
  )
}