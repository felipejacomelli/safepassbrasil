"use client"

import {useEffect, useState, useMemo} from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useData } from "@/contexts/data-context"
import Header from "@/components/Header"
import { DateFilterTabs } from "@/components/DateFilterTabs"
import {
    MapPin,
    User,
    ShoppingCart,
    Plus,
    ChevronLeft,
    ChevronRight,
    X,
    ChevronDown,
    LogOut,
    UserCircle,
    Ticket,
    Calendar,
    MessageCircle,
} from "lucide-react"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import {
    MobileCarousel,
    MobileCarouselContent,
    MobileCarouselItem,
} from "@/components/ui/mobile-carousel"

export default function Page() {
    const router = useRouter()
    const { isAuthenticated, logout, user } = useAuth()
    const { events, categories, locations, isLoading, error } = useData()
    const [searchQuery, setSearchQuery] = useState("")
    const [locationsPage, setLocationsPage] = useState(1)
    const [selectedState, setSelectedState] = useState<string | null>(null)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [isSellModalOpen, setIsSellModalOpen] = useState(false)
    const [isLoadingRedirect, setIsLoadingRedirect] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const locationsPageSize = 8

    const handleLogout = () => {
        logout()
        router.push("/account") // Redireciona para a página de conta após logout
    }

    const handleAccountAccess = () => {
        router.push("/account")
        setIsUserMenuOpen(false)
    }

    const handleLogoutFromDropdown = () => {
        logout()
        setIsUserMenuOpen(false)
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchQuery.trim()) return
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }

    // Filtrar eventos por estado selecionado
    const filteredEvents = selectedState 
        ? events.filter((event: any) => {
            if (event.occurrences && event.occurrences.length > 0) {
                return event.occurrences.some((occ: any) => 
                    occ.uf === selectedState || occ.state === selectedState
                )
            }
            return false
        })
        : events

    
    // Paginação para locais
    const totalLocationsPages = Math.ceil(locations.length / locationsPageSize) || 1
    const paginatedLocations = locations.slice((locationsPage - 1) * locationsPageSize, locationsPage * locationsPageSize)


    // Função para selecionar/deselecionar estado
    const handleStateSelect = (state: string) => {
        if (selectedState === state) {
            setSelectedState(null) // Deselecionar se já estiver selecionado
        } else {
            setSelectedState(state) // Selecionar novo estado
        }
    }

    // Função para limpar filtro
    const clearFilter = () => {
        setSelectedState(null)
    }

    // Função para lidar com a seleção de evento para venda
    const handleSellEventSelect = async (event: any) => {
        if (!isAuthenticated) {
            // Se não estiver autenticado, redireciona para login com parâmetro de retorno
            const returnUrl = encodeURIComponent(`/event/${event.slug}/sell`)
            router.push(`/login?returnUrl=${returnUrl}`)
            return
        }

        setIsLoadingRedirect(true)
        setIsSellModalOpen(false)
        
        // Simular um pequeno delay para feedback visual
        setTimeout(() => {
            router.push(`/event/${event.slug}/sell`)
            setIsLoadingRedirect(false)
        }, 300)
    }

    // Função para abrir modal de venda
    const handleSellClick = () => {
        setIsSellModalOpen(true)
    }

    // Função para fechar modal
    const closeSellModal = () => {
        setIsSellModalOpen(false)
        setSearchTerm('') // Limpar busca ao fechar modal
    }

    // Função para filtrar eventos baseado no termo de busca (modal de venda)
    const filteredSellEvents = useMemo(() => {
        if (!searchTerm.trim()) {
            return events
        }
        
        return events.filter(event => {
            const searchLower = searchTerm.toLowerCase()
            
            // Verificar se as propriedades existem antes de chamar toLowerCase()
            const title = event.title || ''
            const location = event.location || ''
            const date = event.date || ''
            
            return title.toLowerCase().includes(searchLower) ||
                   location.toLowerCase().includes(searchLower) ||
                   date.toLowerCase().includes(searchLower)
        })
    }, [events, searchTerm])

    // Função para lidar com teclas de atalho
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isSellModalOpen) {
                closeSellModal()
            }
        }

        if (isSellModalOpen) {
            document.addEventListener('keydown', handleKeyDown)
            // Prevenir scroll do body quando modal estiver aberta
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'unset'
        }
    }, [isSellModalOpen])

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Header />

            {/* Main Content */}
            <main role="main">
                {/* Hero Section */}
                <section className="max-w-6xl mx-auto px-4 py-12 pb-24 md:pb-32 text-center" aria-labelledby="hero-title">
                    <h1 id="hero-title" className="text-4xl font-bold mb-4">
                        COMPRA E VENDA DE INGRESSOS COM SEGURANÇA
                    </h1>
                    <p className="text-primary text-lg mb-6">
                        Compre e revenda com proteção total sem estresse e sem golpe.
                    </p>

                    <form onSubmit={handleSearch} className="max-w-lg mx-auto mb-6 relative" role="search">
                        <label htmlFor="search-input" className="sr-only">
                            Buscar eventos
                        </label>
                        <input
                            id="search-input"
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Busque por evento, categoria ou palavra-chave"
                            className="w-full px-4 py-3 rounded bg-muted text-foreground placeholder-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </form>

                    <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                        <button
                            onClick={() =>
                                router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
                            }
                            className="bg-primary text-primary-foreground font-bold py-3 px-6 rounded flex-1 hover:bg-primary/90 transition-colors"
                        >
                            Buscar Eventos
                        </button>
                        <button
                            onClick={handleSellClick}
                            disabled={isLoadingRedirect}
                            className="border-2 border-primary text-primary font-bold py-3 px-6 rounded flex items-center justify-center gap-2 flex-1 hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoadingRedirect ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    Redirecionando...
                                </>
                            ) : (
                                <>
                                    <Plus size={18} />
                                    Vender Ingressos
                                </>
                            )}
                        </button>
                    </div>
                </section>

                {/* Date Filter Tabs - Floating card 50/50 overlap */}
                <div className="relative z-20 -mb-16">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="relative flex justify-center -translate-y-1/2">
                            <DateFilterTabs />
                        </div>
                    </div>
                </div>

                {/* Events Section */}
                <section className="bg-muted py-12 pt-24 md:pt-34 px-4" aria-labelledby="events-title">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 id="events-title" className="text-2xl font-bold">
                                {selectedState ? `Eventos em ${selectedState}` : "Próximos eventos"}
                            </h2>
                            {selectedState && (
                                <button
                                    onClick={clearFilter}
                                    className="flex items-center gap-2 bg-background hover:bg-accent px-3 py-2 rounded-lg text-sm transition-colors"
                                    aria-label={`Remover filtro de ${selectedState}`}
                                >
                                    <X size={16} />
                                    Limpar filtro
                                </button>
                            )}
                        </div>

                        {isLoading ? (
                            <div className="text-center py-8" role="status" aria-live="polite">
                                <p>Carregando eventos...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8" role="alert">
                                <p className="text-destructive">Erro ao carregar eventos.</p>
                            </div>
                        ) : filteredEvents.length === 0 ? (
                            <div className="text-center py-8">
                                <p>
                                    {selectedState 
                                        ? `Nenhum evento encontrado em ${selectedState}.` 
                                        : "Nenhum evento encontrado."
                                    }
                                </p>
                            </div>
                        ) : (
                        <>
                            {/* Mobile Carousel */}
                            <div className="block md:hidden">
                                <MobileCarousel>
                                    <MobileCarouselContent>
                                        {filteredEvents.map((event: any) => (
                                            <MobileCarouselItem key={event.id}>
                                                <EventCard event={event} />
                                            </MobileCarouselItem>
                                        ))}
                                    </MobileCarouselContent>
                                </MobileCarousel>
                            </div>

                            {/* Desktop/Tablet Carousel */}
                            <div className="hidden md:block">
                                <Carousel
                                    opts={{
                                        align: "start",
                                        loop: true,
                                    }}
                                    className="w-full"
                                >
                                    <CarouselContent className="-ml-2 md:-ml-4">
                                        {filteredEvents.map((event: any) => (
                                            <CarouselItem key={event.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/4">
                                                <EventCard event={event} />
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious />
                                    <CarouselNext />
                                </Carousel>
                            </div>
                        </>
                    )}

                </div>
            </section>

            {/* Categorias */}
            <section className="bg-card py-12 px-4 border-t border-border" aria-labelledby="categories-title">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 id="categories-title" className="text-2xl font-bold">Eventos por categoria</h2>
                        <button
                            onClick={() => router.push("/search")}
                            className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                        >
                            Todas as Categorias
                        </button>
                    </div>
                    
                    {categories.length === 0 ? (
                        <div className="text-center py-8">
                            <p>Nenhuma categoria encontrada.</p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile Carousel */}
                            <div className="block sm:hidden">
                                <MobileCarousel>
                                    <MobileCarouselContent>
                                        {categories.map((cat: any) => (
                                            <MobileCarouselItem key={cat.id}>
                                                <article
                                                    className="bg-accent rounded-lg overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer h-full"
                                                    onClick={() =>
                                                        router.push(`/search?category=${encodeURIComponent(cat.slug)}`)
                                                    }
                                                >
                                                    <div className="relative">
                                                        {cat.image && (
                                                            <Image
                                                                src={cat.image}
                                                                alt={cat.name}
                                                                width={300}
                                                                height={128}
                                                                className="w-full h-32 object-cover"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="p-3">
                                                        <h3 className="font-semibold text-card-foreground text-sm mb-1 line-clamp-2">
                                                            {cat.name}
                                                        </h3>
                                                        <div className="flex items-center gap-1 text-blue-500 text-xs">
                                                            <span>{cat.event_count} eventos</span>
                                                        </div>
                                                    </div>
                                                </article>
                                            </MobileCarouselItem>
                                        ))}
                                    </MobileCarouselContent>
                                </MobileCarousel>
                            </div>

                            {/* Desktop/Tablet Carousel */}
                            <div className="hidden sm:block">
                                <Carousel
                                    opts={{
                                        align: "start",
                                        loop: true,
                                    }}
                                    className="w-full"
                                >
                                    <CarouselContent className="-ml-2 md:-ml-4">
                                        {categories.map((cat: any) => (
                                            <CarouselItem key={cat.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/4">
                                                <article
                                                    className="bg-accent rounded-lg overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
                                                    onClick={() =>
                                                        router.push(`/search?category=${encodeURIComponent(cat.slug)}`)
                                                    }
                                                >
                                                    <div className="relative">
                                                        {cat.image && (
                                                            <Image
                                                                src={cat.image}
                                                                alt={cat.name}
                                                                width={300}
                                                                height={128}
                                                                className="w-full h-32 object-cover"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="p-3">
                                                        <h3 className="font-semibold text-card-foreground text-sm mb-1 line-clamp-2">
                                                            {cat.name}
                                                        </h3>
                                                        <div className="flex items-center gap-1 text-blue-500 text-xs">
                                                            <span>{cat.event_count} eventos</span>
                                                        </div>
                                                    </div>
                                                </article>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious />
                                    <CarouselNext />
                                </Carousel>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Popular Events Section */}
            <section className="bg-muted py-12 px-4 border-t border-border" aria-labelledby="popular-events-title">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 id="popular-events-title" className="text-2xl font-bold">Eventos populares</h2>
                        <button
                            onClick={() => router.push("/search")}
                            className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                        >
                            Ver tudo
                        </button>
                    </div>
                    
                    {isLoading ? (
                        <div className="text-center py-8" role="status" aria-live="polite">
                            <p>Carregando eventos...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8" role="alert">
                            <p className="text-destructive">Erro ao carregar eventos.</p>
                        </div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-8">
                            <p>Nenhum evento encontrado.</p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile Carousel */}
                            <div className="block sm:hidden">
                                <MobileCarousel>
                                    <MobileCarouselContent>
                                        {events
                                            .sort((a: any, b: any) => {
                                                // Ordenar por número de ingressos vendidos (assumindo que existe uma propriedade tickets_sold)
                                                const ticketsSoldA = a.tickets_sold || 0
                                                const ticketsSoldB = b.tickets_sold || 0
                                                return ticketsSoldB - ticketsSoldA
                                            })
                                            .slice(0, 8)
                                            .map((event: any) => (
                                                <MobileCarouselItem key={event.id}>
                                                    <article
                                                        className="bg-card rounded-lg overflow-hidden hover:shadow-lg hover:scale-105 transition cursor-pointer h-full"
                                                        onClick={() => {
                                                            if (event.occurrences && event.occurrences.length > 0) {
                                                                const firstOccurrence = event.occurrences[0]
                                                                const cityDate = `${firstOccurrence.city}-${new Date(firstOccurrence.start_at).toISOString().split('T')[0]}`
                                                                router.push(`/event/${event.slug}/${cityDate}`)
                                                            }
                                                        }}
                                                    >
                                                        <div className="relative">
                                                            <Image
                                                                src={event.image || "/placeholder.jpg"}
                                                                alt={event.name}
                                                                width={300}
                                                                height={128}
                                                                className="w-full h-32 object-cover"
                                                            />
                                                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                                                                {event.occurrences && event.occurrences.length > 0 && (
                                                                    <>
                                                                        {new Date(event.occurrences[0].start_at).toLocaleDateString('pt-BR', {
                                                                            day: '2-digit',
                                                                            month: '2-digit'
                                                                        })}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="p-3">
                                                            <h3 className="font-semibold text-card-foreground text-sm mb-1 line-clamp-2">
                                                                {event.name}
                                                            </h3>
                                                            <div className="flex items-center gap-1 text-muted-foreground text-xs mb-2">
                                                                <MapPin size={12} />
                                                                <span>
                                                                    {event.occurrences && event.occurrences.length > 0 && (
                                                                        `${event.occurrences[0].city}, ${event.occurrences[0].uf}`
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-blue-500 text-xs">
                                                                <Ticket size={12} className="mr-1 text-blue-500" />
                                                                <span>
                                                                    {event.total_available_tickets !== undefined 
                                                                        ? `${event.total_available_tickets} ingressos` 
                                                                        : "Ingressos esgotados"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </article>
                                                </MobileCarouselItem>
                                            ))}
                                    </MobileCarouselContent>
                                </MobileCarousel>
                            </div>

                            {/* Desktop/Tablet Carousel */}
                            <div className="hidden sm:block">
                                <Carousel
                                    opts={{
                                        align: "start",
                                        loop: true,
                                    }}
                                    className="w-full"
                                >
                                    <CarouselContent className="-ml-2 md:-ml-4">
                                        {events
                                            .sort((a: any, b: any) => {
                                                // Ordenar por número de ingressos vendidos (assumindo que existe uma propriedade tickets_sold)
                                                const ticketsSoldA = a.tickets_sold || 0
                                                const ticketsSoldB = b.tickets_sold || 0
                                                return ticketsSoldB - ticketsSoldA
                                            })
                                            .slice(0, 8)
                                            .map((event: any) => (
                                                <CarouselItem key={event.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/4">
                                                    <article
                                                        className="bg-card rounded-lg overflow-hidden hover:shadow-lg hover:scale-105 transition cursor-pointer"
                                                        onClick={() => {
                                                            if (event.occurrences && event.occurrences.length > 0) {
                                                                const firstOccurrence = event.occurrences[0]
                                                                const cityDate = `${firstOccurrence.city}-${new Date(firstOccurrence.start_at).toISOString().split('T')[0]}`
                                                                router.push(`/event/${event.slug}/${cityDate}`)
                                                            }
                                                        }}
                                                    >
                                                        <div className="relative">
                                                            <Image
                                                                src={event.image || "/placeholder.jpg"}
                                                                alt={event.name}
                                                                width={300}
                                                                height={128}
                                                                className="w-full h-32 object-cover"
                                                            />
                                                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                                                                {event.occurrences && event.occurrences.length > 0 && (
                                                                    <>
                                                                        {new Date(event.occurrences[0].start_at).toLocaleDateString('pt-BR', {
                                                                            day: '2-digit',
                                                                            month: '2-digit'
                                                                        })}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="p-3">
                                                            <h3 className="font-semibold text-card-foreground text-sm mb-1 line-clamp-2">
                                                                {event.name}
                                                            </h3>
                                                            <div className="flex items-center gap-1 text-muted-foreground text-xs mb-2">
                                                                <MapPin size={12} />
                                                                <span>
                                                                    {event.occurrences && event.occurrences.length > 0 && (
                                                                        `${event.occurrences[0].city}, ${event.occurrences[0].uf}`
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-blue-500 text-xs">
                                                                <Ticket size={12} className="mr-1 text-blue-500" />
                                                                <span>
                                                                    {event.total_available_tickets !== undefined 
                                                                        ? `${event.total_available_tickets} ingressos` 
                                                                        : "Ingressos esgotados"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </article>
                                                </CarouselItem>
                                            ))}
                                    </CarouselContent>
                                    <CarouselPrevious />
                                    <CarouselNext />
                                </Carousel>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </main>

            {/* Modal de Seleção de Evento para Venda */}
            {isSellModalOpen && (
                <div 
                    className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={closeSellModal}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="sell-modal-title"
                >
                    <div 
                        className="bg-card rounded-xl border border-border w-full max-w-2xl max-h-[80vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header da Modal */}
                        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
                            <h2 id="sell-modal-title" className="text-xl font-bold text-foreground">
                                Selecione um evento para vender
                            </h2>
                            <button
                                onClick={closeSellModal}
                                className="p-2 hover:bg-accent rounded-lg transition-colors"
                                aria-label="Fechar modal"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Campo de Busca */}
                        <div className="p-6 border-b border-border flex-shrink-0">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar por nome do evento, localização ou data..."
                                    className="w-full px-4 py-3 pl-10 bg-accent border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    aria-label="Campo de busca de eventos"
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                    <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-zinc-700 rounded transition-colors"
                                        aria-label="Limpar busca"
                                    >
                                        <X size={16} className="text-muted-foreground" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Conteúdo da Modal */}
                        <div className="flex-1 overflow-y-auto min-h-0 p-6">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    <span className="ml-3 text-muted-foreground">Carregando eventos...</span>
                                </div>
                            ) : error ? (
                                <div className="text-center py-8">
                                    <p className="text-red-500 mb-4">Erro ao carregar eventos.</p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="bg-blue-500 hover:bg-blue-600 text-black font-semibold py-2 px-4 rounded transition-colors"
                                    >
                                        Tentar novamente
                                    </button>
                                </div>
                            ) : events.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground mb-4">Nenhum evento disponível no momento.</p>
                                    <button
                                        onClick={closeSellModal}
                                        className="bg-secondary hover:bg-accent text-foreground font-semibold py-2 px-4 rounded transition-colors"
                                    >
                                        Fechar
                                    </button>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {filteredSellEvents.length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="text-muted-foreground mb-2">Nenhum evento encontrado para "{searchTerm}"</p>
                                            <button
                                                onClick={() => setSearchTerm('')}
                                                className="text-blue-400 hover:text-blue-300 text-sm underline"
                                            >
                                                Limpar busca
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            {searchTerm && (
                                                <div className="mb-4 p-3 bg-accent/50 rounded-xl">
                                                    <p className="text-sm text-muted-foreground">
                                                        Encontrados <span className="font-semibold text-blue-400">{filteredSellEvents.length}</span> eventos para "{searchTerm}"
                                                    </p>
                                                </div>
                                            )}
                                            {filteredSellEvents.map((event: any) => (
                                        <button
                                            key={event.id}
                                            onClick={() => handleSellEventSelect(event)}
                                            className="flex items-center gap-4 p-4 bg-accent hover:bg-secondary rounded-xl transition-colors text-left w-full group"
                                            aria-label={`Selecionar evento ${event.name}`}
                                        >
                                            <div className="flex-shrink-0">
                                                <Image
                                                    src={event.image || "/placeholder.svg"}
                                                    alt={event.name}
                                                    width={64}
                                                    height={64}
                                                    className="w-16 h-16 object-cover rounded-xl"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                                    {event.name}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                    <MapPin size={14} />
                                                    <span className="truncate">
                                                        {(() => {
                                                            if (event.occurrences && event.occurrences.length > 0) {
                                                                const ufs = event.occurrences
                                                                    .map((occ: any) => occ.uf)
                                                                    .filter((uf: string) => uf && uf.trim() !== '')
                                                                    .filter((uf: string, index: number, array: string[]) => array.indexOf(uf) === index);
                                                                
                                                                if (ufs.length > 0) {
                                                                    return ufs.join(', ');
                                                                }
                                                            }
                                                            return 'Local não informado';
                                                        })()}
                                                    </span>
                                                </div>
                                                {event.occurrences && event.occurrences.length > 0 && (
                                                    <div className="text-sm text-blue-400 mt-1 font-medium">
                                                        {event.occurrences.length === 1 
                                                            ? new Date(event.occurrences[0].start_at).toLocaleDateString('pt-BR', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric'
                                                            })
                                                            : (() => {
                                                                const dates = event.occurrences
                                                                    .map((occ: any) => new Date(occ.start_at))
                                                                    .sort((a: Date, b: Date) => a.getTime() - b.getTime());
                                                                const firstDate = dates[0].toLocaleDateString('pt-BR', {
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                    year: 'numeric'
                                                                });
                                                                const lastDate = dates[dates.length - 1].toLocaleDateString('pt-BR', {
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                    year: 'numeric'
                                                                });
                                                                return `${firstDate} até ${lastDate}`;
                                                            })()
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-shrink-0">
                                                <ChevronRight size={20} className="text-muted-foreground group-hover:text-blue-400 transition-colors" />
                                            </div>
                                        </button>
                                    ))}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer da Modal */}
                        <div className="p-6 border-t border-border bg-accent/30 flex-shrink-0">
                            <div className="flex items-center justify-center gap-2 mb-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Precisa de ajuda?
                                </p>
                            </div>
                            <p className="text-sm text-muted-foreground text-center leading-relaxed">
                                Caso não encontre o evento desejado, entre em contato com nosso suporte através do email{' '}
                                <a 
                                    href="mailto:suporte@safepass.com" 
                                    className="text-blue-400 hover:text-blue-300 underline transition-colors"
                                >
                                    suporte@safepass.com
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Seção Como funciona */}
            <section className="py-16 bg-card">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-foreground mb-4">Como Funciona a Revenda Segura</h2>
                        <p className="text-muted-foreground">Compre e venda com segurança.</p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Como Vender */}
                        <div className="text-center">
                            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Plus className="w-10 h-10 text-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-3">Como Vender</h3>
                            <p className="text-muted-foreground">Anuncie seu ingresso, defina o preço e aguarde um comprador interessado</p>
                        </div>

                        {/* Como Comprar */}
                        <div className="text-center">
                            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShoppingCart className="w-10 h-10 text-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-3">Como Comprar</h3>
                            <p className="text-muted-foreground">Busque eventos, pague com segurança e receba seu ingresso digital</p>
                        </div>

                        {/* Suporte */}
                        <div className="text-center">
                            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <MessageCircle className="w-10 h-10 text-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-3">Suporte</h3>
                            <p className="text-muted-foreground">Não encontrou o evento? Entre em contato conosco para obter ajuda</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Rodapé */}
            <footer className="bg-card py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid md:grid-cols-5 gap-8">
                        {/* Sobre */}
                        <div>
                            <h3 className="text-foreground font-semibold mb-4">Sobre</h3>
                            <p className="text-muted-foreground text-sm mb-4">
                                Safe Pass é uma plataforma confiável para compra e venda de ingressos de eventos. 
                                Nossa missão é conectar pessoas aos eventos que elas amam.
                            </p>
                            <p className="text-muted-foreground text-sm">
                                Acesse nosso e-mail para dúvidas, sugestões e reclamações sobre nossa plataforma.
                            </p>
                            <p className="text-muted-foreground text-sm mt-2">
                                Belo Horizonte - MG, Brasil
                            </p>
                        </div>

                        {/* Acesso Rápido */}
                        <div>
                            <h3 className="text-foreground font-semibold mb-4">Acesso Rápido</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm">Como Funciona</a></li>
                                <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm">Termos de Uso</a></li>
                                <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm">Política de Privacidade</a></li>
                            </ul>
                        </div>

                        {/* FAQ e Suporte */}
                        <div>
                            <h3 className="text-foreground font-semibold mb-4">FAQ e Suporte</h3>
                            <ul className="space-y-2">
                                <li><a href="/faq" className="text-muted-foreground hover:text-foreground text-sm">Perguntas Frequentes</a></li>
                                <li><a href="/faq#revenda" className="text-muted-foreground hover:text-foreground text-sm">Revenda de Ingressos</a></li>
                                <li><a href="/faq#taxas" className="text-muted-foreground hover:text-foreground text-sm">Taxas e Pagamentos</a></li>
                                <li><a href="/faq#suporte" className="text-muted-foreground hover:text-foreground text-sm">Problemas Técnicos</a></li>
                            </ul>
                        </div>

                        {/* Garantia Safe Pass */}
                        <div>
                            <h3 className="text-foreground font-semibold mb-4">Garantia Safe Pass</h3>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-foreground text-sm font-medium">Ingressos Garantidos</p>
                                        <p className="text-muted-foreground text-xs">Sua compra é garantida até a entrada do evento</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-foreground text-sm font-medium">Pagamento Seguro</p>
                                        <p className="text-muted-foreground text-xs">Seus dados de pagamento são protegidos</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-foreground text-sm font-medium">Suporte Confiável</p>
                                        <p className="text-muted-foreground text-xs">Atendimento especializado para suas dúvidas</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Redes Sociais */}
                        <div>
                            <h3 className="text-foreground font-semibold mb-4">Redes Sociais</h3>
                            <div className="flex space-x-4">
                                <a href="#" className="w-10 h-10 bg-accent rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors">
                                    <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                                    </svg>
                                </a>
                                <a href="#" className="w-10 h-10 bg-accent rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors">
                                    <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                                    </svg>
                                </a>
                                <a href="#" className="w-10 h-10 bg-accent rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors">
                                    <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z.017 0z"/>
                                    </svg>
                                </a>
                                <a href="#" className="w-10 h-10 bg-accent rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors">
                                    <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="border-t border-zinc-800 mt-8 pt-8 text-center">
                        <p className="text-muted-foreground text-sm">© 2024 Safe Pass. Todos os direitos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export function EventCard({ event }: { event: any }) {
    const router = useRouter()
    const { isAuthenticated } = useAuth()

    // Extrair UFs únicos das ocorrências
    const getEventLocations = (event: any) => {
        if (event.occurrences && event.occurrences.length > 0) {
            const ufs = event.occurrences
                .map((occ: any) => occ.uf)
                .filter((uf: string) => uf && uf.trim() !== '')
                .filter((uf: string, index: number, array: string[]) => array.indexOf(uf) === index) // Remove duplicatas
            
            if (ufs.length > 0) {
                return ufs.join(', ')
            }
        }
        
        // Garantir que sempre retornamos uma string
        const location = event.location || 'Local não informado'
        return typeof location === 'string' ? location : String(location)
    }

    // Função para formatar datas seguindo a mesma lógica do modal
    const getEventDates = (event: any) => {
        if (event.occurrences && event.occurrences.length > 0) {
            if (event.occurrences.length === 1) {
                return new Date(event.occurrences[0].start_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                })
            } else {
                const dates = event.occurrences
                    .map((occ: any) => new Date(occ.start_at))
                    .sort((a: Date, b: Date) => a.getTime() - b.getTime())
                const firstDate = dates[0].toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                })
                const lastDate = dates[dates.length - 1].toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                })
                return `${firstDate} até ${lastDate}`
            }
        }
        return 'Data não informada'
    }

    // Função para lidar com o clique no card
    const handleCardClick = () => {
        // Redirecionar diretamente para a página do evento
        router.push(`/event/${event.slug || event.id}`)
    }

    // Função para lidar com o clique no botão de venda
    const handleSellClick = (e: React.MouseEvent) => {
        e.stopPropagation() // Evita que o clique no botão acione o clique do card
        
        if (!isAuthenticated) {
            // Se não estiver autenticado, redireciona para login com parâmetro de retorno
            const returnUrl = encodeURIComponent(`/event/${event.slug || event.id}/sell`)
            router.push(`/login?returnUrl=${returnUrl}`)
        } else {
            // Se estiver autenticado, vai direto para a página de venda
            router.push(`/event/${event.slug || event.id}/sell`)
        }
    }

    return (
        <div className="bg-background rounded overflow-hidden shadow hover:scale-105 transition-transform">
            <div
                onClick={handleCardClick}
                className="cursor-pointer"
            >
                <Image
                    src={event.image || "/placeholder.svg"}
                    alt={event.name}
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover"
                />
                <div className="p-4">
                    <h3 className="font-semibold mb-2">{event.name}</h3>
                    <div className="flex items-center text-sm text-blue-400 mb-2 font-medium">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{getEventDates(event)}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{getEventLocations(event)}</span>
                    </div>
                    <div className="flex items-center text-lg font-bold text-blue-500 mb-3">
                        <Ticket size={16} className="mr-2 text-blue-500" />
                        <span>
                            {event.total_available_tickets !== undefined 
                                ? `${event.total_available_tickets}` 
                                : "Ingressos esgotados"}
                        </span>
                    </div>
                </div>
            </div>
            

        </div>
    )
}

