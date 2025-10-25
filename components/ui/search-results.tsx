"use client"

import { Search, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface SearchResultsProps {
  query: string
  hasQuery: boolean
  hasResults: boolean
  isLoading: boolean
  onClear: () => void
  children: React.ReactNode
}

export function SearchResults({
  query,
  hasQuery,
  hasResults,
  isLoading,
  onClear,
  children
}: SearchResultsProps) {
  // Estado de loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Buscando...</p>
        </div>
      </div>
    )
  }

  // Estado vazio - sem query
  if (!hasQuery) {
    return <>{children}</>
  }

  // Estado vazio - sem resultados
  if (!hasResults) {
    return (
      <Card className="shadow-lg dark:shadow-xl dark:shadow-black/20 dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-12 text-center dark:bg-gray-800">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
            <AlertCircle className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
          
          <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
            Nenhum resultado encontrado
          </h3>
          
          <p className="mb-6 text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            Não encontramos nenhuma pergunta que corresponda à sua busca por{" "}
            <span className="font-medium text-gray-900 dark:text-gray-100">"{query}"</span>.
          </p>
          
          <div className="space-y-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p className="mb-2">Tente:</p>
              <ul className="space-y-1">
                <li>• Verificar a ortografia das palavras</li>
                <li>• Usar termos mais gerais</li>
                <li>• Usar palavras-chave diferentes</li>
                <li>• Remover filtros de busca</li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={onClear}
                variant="outline"
                className="flex items-center gap-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
              >
                <Search className="h-4 w-4" />
                Limpar busca
              </Button>
              
              <Button 
                asChild
                variant="default"
                className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
              >
                <a href="mailto:suporte@safepass.com.br">
                  Entrar em contato
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Estado com resultados
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Resultados para <span className="font-medium text-gray-900 dark:text-gray-100">"{query}"</span>
        </p>
        <Button 
          onClick={onClear}
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
        >
          Limpar busca
        </Button>
      </div>
      {children}
    </div>
  )
}