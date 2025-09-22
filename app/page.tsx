"use client"

import { useState } from "react"
import useSWR from "swr"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import {
    MapPin,
    User,
    ShoppingCart,
    Plus,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"

// Fetcher padrão
const fetcher = (url: string) =>
    fetch(url).then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar dados")
        return res.json()
    })

export default function Page() {
    const router = useRouter()
    const { isAuthenticated, logout } = useAuth()
    const [searchQuery, setSearchQuery] = useState("")
    const [page, setPage] = useState(1)
    const [locationsPage, setLocationsPage] = useState(1)
    const pageSize = 4
    const locationsPageSize = 8

    const baseUrl = process.env.NEXT_PUBLIC_API_URL

    // ✅ Uma única chamada para home
    const { data, error, isLoading } = useSWR(
        `${baseUrl}/api/events/home/`,
        fetcher
    )

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchQuery.trim()) return
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }

    // Paginação manual só sobre os eventos recebidos
    const events = data?.events || []
    const categories = data?.categories || []
    const locations = data?.locations || []
    const totalPages = Math.ceil(events.length / pageSize) || 1
    const paginatedEvents = events.slice((page - 1) * pageSize, page * pageSize)
    
    // Paginação para locais
    const totalLocationsPages = Math.ceil(locations.length / locationsPageSize) || 1
    const paginatedLocations = locations.slice((locationsPage - 1) * locationsPageSize, locationsPage * locationsPageSize)

    return (
        <div className="min-h-screen rounded flex flex-col bg-black text-white">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-black border-b border-zinc-800">
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <a href="/" className="flex items-center gap-2 font-bold text-xl">
                        <div className="bg-blue-500 p-1.5 rounded">
                            <div className="w-6 h-6 bg-black rounded" />
                        </div>
                        reticket
                    </a>
                    <nav className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <button
                                onClick={logout}
                                className="border border-blue-500 px-3 py-1.5 rounded text-sm font-semibold"
                            >
                                Sair
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => router.push("/login")}
                                    className="p-2 border border-blue-500 rounded"
                                >
                                    <User size={18} />
                                </button>
                                <button
                                    onClick={() => router.push("/cart")}
                                    className="p-2 border border-blue-500 rounded"
                                >
                                    <ShoppingCart size={18} />
                                </button>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            {/* Hero */}
            <section className="max-w-6xl mx-auto rounded px-4 py-12 text-center">
                <h1 className="text-4xl font-bold mb-4">
                    COMPRA E VENDA DE INGRESSOS COM SEGURANÇA
                </h1>
                <p className="text-blue-500 text-lg mb-6">
                    Compre e revenda com proteção total sem estresse e sem golpe.
                </p>

                <form onSubmit={handleSearch} className="max-w-lg rounded mx-auto mb-6 relative">
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Busque por evento, categoria ou palavra-chave"
                        className="w-full px-4 py-3 rounded bg-zinc-800 text-white placeholder-zinc-500"
                    />
                </form>

                <div className="flex rounded flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                    <button
                        onClick={() =>
                            router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
                        }
                        className="bg-blue-500 text-black font-bold py-3 px-6 rounded flex-1"
                    >
                        Buscar Eventos
                    </button>
                    <button
                        onClick={() => router.push("/sell")}
                        className="border-2 border-blue-500 text-blue-500 font-bold py-3 px-6 rounded flex items-center justify-center gap-2 flex-1"
                    >
                        <Plus size={18} />
                        Vender Ingressos
                    </button>
                </div>
            </section>

            {/* Eventos */}
            <section className="bg-zinc-900 py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6">Próximos eventos</h2>

                    {isLoading ? (
                        <p>Carregando...</p>
                    ) : error ? (
                        <p className="text-red-500">Erro ao carregar eventos.</p>
                    ) : paginatedEvents.length === 0 ? (
                        <p>Nenhum evento encontrado.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {paginatedEvents.map((event: any) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    )}

                    {/* Paginação */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-6">
                            <button
                                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                disabled={page === 1}
                                className="p-2 border rounded disabled:opacity-50"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <span>
                Página {page} de {totalPages}
              </span>
                            <button
                                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                                disabled={page === totalPages}
                                className="p-2 border rounded disabled:opacity-50"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Categorias */}
            <section className="bg-black py-12 px-4 border-t border-zinc-800">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6">Categorias</h2>
                    {categories.length === 0 ? (
                        <p>Nenhuma categoria encontrada.</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                            {categories.map((cat: any) => (
                                <button
                                    key={cat.id}
                                    onClick={() =>
                                        router.push(`/search?category=${encodeURIComponent(cat.slug)}`)
                                    }
                                    className="bg-zinc-800 rounded overflow-hidden hover:shadow-lg hover:scale-105 transition"
                                >
                                    {cat.image && (
                                        <img
                                            src={cat.image}
                                            alt={cat.name}
                                            className="w-full h-32 object-cover"
                                        />
                                    )}
                                    <div className="p-3 text-left">
                                        <span className="font-semibold">{cat.name}</span>
                                        <span className="block text-sm text-zinc-400">
                {cat.event_count} eventos
              </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Localizações */}
            <section className="bg-zinc-900 py-12 px-4 border-t border-zinc-800">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6">Locais</h2>
                    {locations.length === 0 ? (
                        <p>Nenhum local encontrado.</p>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                {paginatedLocations.map((loc: any) => {
                                    // Função para obter imagem da cidade baseada no UF
                                    const getCityImage = (uf: string) => {
                                        const cityImages: { [key: string]: string } = {
                                            'SP': 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=300&fit=crop&crop=entropy&auto=format&q=60',
                                            'RJ': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400&h=300&fit=crop&crop=entropy&auto=format&q=60',
                                            'MG': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=entropy&auto=format&q=60',
                                            'RS': 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=300&fit=crop&crop=entropy&auto=format&q=60',
                                            'PR': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=entropy&auto=format&q=60',
                                            'SC': 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=300&fit=crop&crop=entropy&auto=format&q=60',
                                            'BA': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=entropy&auto=format&q=60',
                                            'GO': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=entropy&auto=format&q=60',
                                            'PE': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=entropy&auto=format&q=60',
                                            'CE': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=entropy&auto=format&q=60',
                                            'DF': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=entropy&auto=format&q=60',
                                            'ES': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=entropy&auto=format&q=60'
                                        }
                                        return cityImages[uf] || 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=300&fit=crop&crop=entropy&auto=format&q=60'
                                    }

                                    return (
                                        <button
                                            key={loc.state || loc.uf}
                                            onClick={() =>
                                                router.push(`/search?location=${encodeURIComponent(loc.state || loc.uf)}`)
                                            }
                                            className="bg-zinc-800 rounded overflow-hidden hover:shadow-lg hover:scale-105 transition"
                                        >
                                            <img
                                                src={getCityImage(loc.uf || loc.state)}
                                                alt={`Imagem de ${loc.state || loc.uf}`}
                                                className="w-full h-32 object-cover"
                                            />
                                            <div className="p-3 text-left">
                                                <span className="font-semibold">{loc.state || loc.uf}</span>
                                                <span className="block text-sm text-zinc-400">
                                                    {loc.event_count} eventos
                                                </span>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Controles de paginação para locais */}
                            {totalLocationsPages > 1 && (
                                <div className="flex justify-center items-center mt-8 gap-4">
                                    <button
                                        onClick={() => setLocationsPage(Math.max(1, locationsPage - 1))}
                                        disabled={locationsPage === 1}
                                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        {/*Anterior*/}
                                    </button>
                                    
                                    <span className="text-zinc-400">
                                        Página {locationsPage} de {totalLocationsPages}
                                    </span>
                                    
                                    <button
                                        onClick={() => setLocationsPage(Math.min(totalLocationsPages, locationsPage + 1))}
                                        disabled={locationsPage === totalLocationsPages}
                                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        {/*Próximo*/}
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Seção Como funciona */}
            <section className="py-16 bg-black">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">Como funciona</h2>
                        <p className="text-zinc-400">Compre e venda ingressos online de um jeito 4 seguro</p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Passo 1 */}
                        <div className="text-center">
                            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Encontre seu evento</h3>
                            <p className="text-zinc-400">Busque por eventos, categorias ou localização e encontre a experiência que você procura</p>
                        </div>

                        {/* Passo 2 */}
                        <div className="text-center">
                            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Compre com segurança</h3>
                            <p className="text-zinc-400">Realize o pagamento de forma segura e receba seu ingresso digital na entrada do evento</p>
                        </div>

                        {/* Passo 3 */}
                        <div className="text-center">
                            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Aproveite o evento</h3>
                            <p className="text-zinc-400">Apresente seu ingresso digital na entrada do evento e aproveite</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Rodapé */}
            <footer className="bg-zinc-900 py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8">
                        {/* Sobre */}
                        <div>
                            <h3 className="text-white font-semibold mb-4">Sobre</h3>
                            <p className="text-zinc-400 text-sm mb-4">
                                ReTicket é uma plataforma confiável para compra e venda de ingressos de eventos. 
                                Nossa missão é conectar pessoas aos eventos que elas amam.
                            </p>
                            <p className="text-zinc-400 text-sm">
                                Acesse nosso e-mail para dúvidas, sugestões e reclamações sobre nossa plataforma.
                            </p>
                            <p className="text-zinc-400 text-sm mt-2">
                                Belo Horizonte - MG, Brasil
                            </p>
                        </div>

                        {/* Acesso Rápido */}
                        <div>
                            <h3 className="text-white font-semibold mb-4">Acesso Rápido</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-zinc-400 hover:text-white text-sm">Como Funciona</a></li>
                                <li><a href="#" className="text-zinc-400 hover:text-white text-sm">Termos de Uso</a></li>
                                <li><a href="#" className="text-zinc-400 hover:text-white text-sm">Política de Privacidade</a></li>
                            </ul>
                        </div>

                        {/* Garantia ReTicket */}
                        <div>
                            <h3 className="text-white font-semibold mb-4">Garantia ReTicket</h3>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-white text-sm font-medium">Ingressos Garantidos</p>
                                        <p className="text-zinc-400 text-xs">Sua compra é garantida até a entrada do evento</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-white text-sm font-medium">Pagamento Seguro</p>
                                        <p className="text-zinc-400 text-xs">Seus dados de pagamento são protegidos</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-white text-sm font-medium">Suporte Confiável</p>
                                        <p className="text-zinc-400 text-xs">Atendimento especializado para suas dúvidas</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Redes Sociais */}
                        <div>
                            <h3 className="text-white font-semibold mb-4">Redes Sociais</h3>
                            <div className="flex space-x-4">
                                <a href="#" className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                                    </svg>
                                </a>
                                <a href="#" className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                                    </svg>
                                </a>
                                <a href="#" className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z.017 0z"/>
                                    </svg>
                                </a>
                                <a href="#" className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="border-t border-zinc-800 mt-8 pt-8 text-center">
                        <p className="text-zinc-400 text-sm">© 2024 ReTicket. Todos os direitos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

function EventCard({ event }: { event: any }) {
    const router = useRouter()

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

    // Função para lidar com o clique no card
    const handleCardClick = () => {
        // Redirecionar diretamente para a página do evento
        router.push(`/event/${event.slug || event.id}`)
    }

    return (
        <div
            onClick={handleCardClick}
            className="bg-black rounded overflow-hidden shadow cursor-pointer hover:scale-105 transition-transform"
        >
            <img
                src={event.image || "/placeholder.svg"}
                alt={event.name}
                className="w-full h-48 object-cover"
            />
            <div className="p-4">
                <h3 className="font-semibold mb-2">{event.name}</h3>
                <div className="flex items-center text-sm text-zinc-400 mb-2">
                    {/*<span>{event.next_date || "Data não informada"}</span>*/}
                </div>
                <div className="flex items-center text-sm text-zinc-400 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{getEventLocations(event)}</span>
                </div>
                <div className="text-lg font-bold text-green-400">
                    {event.price ? `R$ ${event.price}` : "Preço não informado"}
                </div>
            </div>
        </div>
    )
}
