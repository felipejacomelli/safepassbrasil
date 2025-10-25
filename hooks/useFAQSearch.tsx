"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import MiniSearch from "minisearch"

interface FAQItem {
  question: string
  answer: string
}

interface FAQSection {
  title: string
  icon: React.ReactNode
  items: FAQItem[]
}

interface SearchableItem extends FAQItem {
  id: string
  sectionTitle: string
  sectionIndex: number
  itemIndex: number
}

interface SearchResult extends SearchableItem {
  score: number
  match: {
    question?: string[]
    answer?: string[]
  }
}

interface UseFAQSearchProps {
  faqSections: FAQSection[]
  debounceMs?: number
}

// Função para normalizar texto (remover acentos e caracteres especiais)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^\w\s]/g, " ") // Remove caracteres especiais
    .replace(/\s+/g, " ") // Remove espaços extras
    .trim()
}

export function useFAQSearch({ faqSections, debounceMs = 300 }: UseFAQSearchProps) {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Debounce da query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [query, debounceMs])

  // Preparar dados para busca
  const searchableItems = useMemo(() => {
    const items: SearchableItem[] = []
    
    faqSections.forEach((section, sectionIndex) => {
      section.items.forEach((item, itemIndex) => {
        items.push({
          id: `${sectionIndex}-${itemIndex}`,
          question: item.question,
          answer: item.answer,
          sectionTitle: section.title,
          sectionIndex,
          itemIndex
        })
      })
    })
    
    return items
  }, [faqSections])

  // Configurar MiniSearch
  const miniSearch = useMemo(() => {
    const ms = new MiniSearch({
      fields: ['question', 'answer', 'sectionTitle'], // Campos para busca
      storeFields: ['id', 'question', 'answer', 'sectionTitle', 'sectionIndex', 'itemIndex'], // Campos para retornar
      searchOptions: {
        boost: { question: 2, sectionTitle: 1.5, answer: 1 }, // Priorizar pergunta
        fuzzy: 0.2, // Tolerância para erros de digitação
        prefix: true, // Busca por prefixo
        combineWith: 'AND' // Todos os termos devem estar presentes
      },
      processTerm: (term) => {
        // Normalizar termos durante a indexação e busca
        const normalized = normalizeText(term)
        return normalized.length >= 2 ? normalized : null // Ignorar termos muito curtos
      }
    })

    // Adicionar documentos ao índice
    ms.addAll(searchableItems.map(item => ({
      ...item,
      question: normalizeText(item.question),
      answer: normalizeText(item.answer),
      sectionTitle: normalizeText(item.sectionTitle)
    })))

    return ms
  }, [searchableItems])

  // Executar busca
  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return []
    }

    setIsLoading(true)

    try {
      const normalizedQuery = normalizeText(debouncedQuery)
      
      if (normalizedQuery.length < 2) {
        return []
      }

      const results = miniSearch.search(normalizedQuery, {
        fuzzy: 0.2,
        prefix: true
      }).slice(0, 20) // Limitar resultados após a busca

      // Mapear resultados com dados originais
      const mappedResults: SearchResult[] = results.map(result => {
        const originalItem = searchableItems.find(item => item.id === result.id)!
        return {
          ...originalItem,
          score: result.score,
          match: result.match || {}
        }
      })

      return mappedResults
    } catch (error) {
      console.error("Erro na busca:", error)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [debouncedQuery, miniSearch, searchableItems])

  // Filtrar seções baseado nos resultados
  const filteredSections = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return faqSections // Retornar todas as seções se não há busca
    }

    if (searchResults.length === 0) {
      return [] // Nenhum resultado encontrado
    }

    // Agrupar resultados por seção
    const sectionMap = new Map<number, SearchResult[]>()
    
    searchResults.forEach(result => {
      const sectionIndex = result.sectionIndex
      if (!sectionMap.has(sectionIndex)) {
        sectionMap.set(sectionIndex, [])
      }
      sectionMap.get(sectionIndex)!.push(result)
    })

    // Construir seções filtradas
    const filtered: FAQSection[] = []
    
    sectionMap.forEach((results, sectionIndex) => {
      const originalSection = faqSections[sectionIndex]
      const filteredItems = results.map(result => ({
        question: result.question,
        answer: result.answer
      }))

      filtered.push({
        ...originalSection,
        items: filteredItems
      })
    })

    return filtered
  }, [faqSections, searchResults, debouncedQuery])

  const handleSearch = useCallback((newQuery: string) => {
    setQuery(newQuery)
    if (newQuery.trim()) {
      setIsLoading(true)
    }
  }, [])

  const handleClear = useCallback(() => {
    setQuery("")
    setDebouncedQuery("")
    setIsLoading(false)
  }, [])

  return {
    query,
    debouncedQuery,
    isLoading,
    searchResults,
    filteredSections,
    hasResults: searchResults.length > 0,
    hasQuery: debouncedQuery.trim().length > 0,
    handleSearch,
    handleClear
  }
}