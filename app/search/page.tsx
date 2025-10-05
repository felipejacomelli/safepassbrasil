"use client"

import { useRouter } from "next/navigation"
import { useCallback } from "react"
import Header from "@/components/Header"
import { SearchBar } from "@/components/search/SearchBar"
import { FilterChips } from "@/components/search/FilterChips"
import { SearchResults } from "@/components/search/SearchResults"
import { SearchFooter } from "@/components/search/SearchFooter"
import { useSearchFilters } from "@/hooks/use-search-filters"
import { useSearchResults } from "@/hooks/use-search-results"

export default function SearchPage() {
  const router = useRouter()
  const filters = useSearchFilters()
  const { results, isLoading, error } = useSearchResults(filters)

  const handleSearch = useCallback((query: string) => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (filters.category) params.set('category', filters.category)
    if (filters.location) params.set('location', filters.location)
    
    router.push(`/search?${params.toString()}`)
  }, [router, filters.category, filters.location])

  const handleRemoveCategory = useCallback(() => {
    const params = new URLSearchParams()
    if (filters.query) params.set('q', filters.query)
    if (filters.location) params.set('location', filters.location)
    
    router.push(`/search?${params.toString()}`)
  }, [router, filters.query, filters.location])

  const handleRemoveLocation = useCallback(() => {
    const params = new URLSearchParams()
    if (filters.query) params.set('q', filters.query)
    if (filters.category) params.set('category', filters.category)
    
    router.push(`/search?${params.toString()}`)
  }, [router, filters.query, filters.category])

  const handleClearAll = useCallback(() => {
    const params = new URLSearchParams()
    if (filters.query) params.set('q', filters.query)
    
    router.push(`/search?${params.toString()}`)
  }, [router, filters.query])

  const getSearchTitle = () => {
    if (filters.category) {
      return `Eventos de ${filters.category}`
    } else if (filters.location) {
      return `Eventos em ${filters.location}`
    } else if (filters.query) {
      return `Resultados para "${filters.query}"`
    } else {
      return "Todos os eventos"
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />

      {/* Search Bar */}
      <SearchBar
        query={filters.query}
        onQueryChange={() => {}} // Handled by URL params
        onSubmit={handleSearch}
      />

      {/* Search Footer */}
      <SearchFooter />

      {/* Filter Chips */}
      <FilterChips
        categoryFilter={filters.category}
        locationFilter={filters.location}
        query={filters.query}
        onRemoveCategory={handleRemoveCategory}
        onRemoveLocation={handleRemoveLocation}
        onClearAll={handleClearAll}
      />

      {/* Search Results */}
      <main className="flex-1 bg-zinc-800 px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">
            {getSearchTitle()}
          </h1>

          <SearchResults
            events={results.events}
            categories={results.categories}
            locations={results.locations}
            isLoading={isLoading}
            error={error}
            query={filters.query}
            categoryFilter={filters.category}
            locationFilter={filters.location}
          />
        </div>
      </main>

      {/* Footer Section */}
      <footer className="bg-zinc-800 border-t border-zinc-700 px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About Section */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">
                Sobre
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-3">
                ReTicket é uma plataforma confiável para compra e venda de ingressos diretamente entre fãs.
              </p>
              <p className="text-zinc-400 text-sm leading-relaxed mb-3">
                Nossa missão é conectar pessoas, que desejam revender seus ingressos devido a imprevistos, com
                compradores que procuram as melhores ofertas de última hora.
              </p>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Seja bem bem vindo, seja feliz, seja ReTicket!
              </p>
            </div>

            {/* Quick Access */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">
                Acesso Rápido
              </h3>
              <div className="flex flex-col gap-2">
                <a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">
                  Como Funciona
                </a>
                <a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">
                  Login
                </a>
                <a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">
                  Termos de Uso
                </a>
                <a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">
                  Política de Privacidade
                </a>
                <a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">
                  Início
                </a>
              </div>
            </div>

            {/* Guarantee Section */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">
                Garantia ReTicket
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="mt-1 flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M9 12L11 14L15 10M12 3L4 7V13C4 17.4183 7.58172 21 12 21C16.4183 21 20 17.4183 20 13V7L12 3Z"
                        stroke="#3B82F6"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium mb-1">
                      Ingresso Garantido
                    </p>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      Para o comprador: garantimos sua entrada ou seu dinheiro de volta.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-1 flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M9 12L11 14L15 10M12 3L4 7V13C4 17.4183 7.58172 21 12 21C16.4183 21 20 17.4183 20 13V7L12 3Z"
                        stroke="#3B82F6"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium mb-1">
                      Pagamento Garantido
                    </p>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      Para o vendedor: garantimos seu pagamento por ingressos válidos.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-1 flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 2L2 7L12 12L22 7L12 2Z"
                        stroke="#3B82F6"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2 17L12 22L22 17"
                        stroke="#3B82F6"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2 12L12 17L22 12"
                        stroke="#3B82F6"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium mb-1">
                      Plataforma Confiável
                    </p>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      Transações autenticadas, suporte humano e conformidade com as leis brasileiras.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">
                Redes Sociais
              </h3>
              <div className="flex gap-3 mb-6">
                <a
                  href="#"
                  className="bg-zinc-700 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-zinc-600 transition-colors"
                  aria-label="Facebook"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="bg-zinc-700 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-zinc-600 transition-colors"
                  aria-label="Instagram"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="1.5" />
                    <circle cx="18" cy="6" r="1" fill="white" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="bg-zinc-700 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-zinc-600 transition-colors"
                  aria-label="YouTube"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M22.54 6.42C22.4212 5.94541 22.1793 5.51057 21.8387 5.15941C21.498 4.80824 21.0708 4.55318 20.6 4.42C18.88 4 12 4 12 4C12 4 5.12 4 3.4 4.46C2.92925 4.59318 2.50198 4.84824 2.16134 5.19859C1.8207 5.54894 1.57884 5.98378 1.46 6.46C1 6.66 1 12.34 1 12.34C1 12.34 1 18.14 1.46 18.34C1.57884 18.8162 1.8207 19.2511 2.16134 19.6014C2.50198 19.9518 2.92925 20.2068 3.4 20.34C5.12 20.8 12 20.8 12 20.8C12 20.8 18.88 20.8 20.6 20.34C21.0708 20.2068 21.498 19.9518 21.8387 19.6014C22.1793 19.2511 22.4212 18.8162 22.54 18.34C23 18.14 23 12.34 23 12.34C23 12.34 23 6.66 22.54 6.42Z"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.75 15.02L15.5 11.75L9.75 8.48001V15.02Z"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                © 2023 ReTicket. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}