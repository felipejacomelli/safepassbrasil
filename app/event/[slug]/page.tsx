"use client"

import { useEffect, useState, use } from "react"
import { useParams, useRouter } from "next/navigation"
import { Calendar, MapPin, Clock, Users, ArrowLeft, ChevronRight, Ticket } from "lucide-react"
import { eventsApi, ApiEventWithOccurrences, ApiOccurrence } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface EventPageProps {
    params: Promise<{ slug: string }>
}

export default function EventPage({ params }: EventPageProps) {
    const router = useRouter()
    const { slug } = use(params)

    const [event, setEvent] = useState<ApiEventWithOccurrences | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadEvent = async () => {
            try {
                setLoading(true)
                setError(null)

                console.log("🔎 Buscando evento com slug:", slug)

                const eventData = await eventsApi.getBySlug(slug)

                console.log("✅ Evento carregado:", eventData)
                setEvent(eventData)
            } catch (err: any) {
                console.error("❌ Erro ao carregar evento:", err)

                // Captura detalhes úteis do erro
                if (err.response) {
                    console.error("🔴 Resposta da API:", err.response.status, err.response.data)
                } else if (err.request) {
                    console.error("🔴 Nenhuma resposta recebida. Request:", err.request)
                } else {
                    console.error("🔴 Erro ao configurar request:", err.message)
                }

                setError("Evento não encontrado ou erro na API")
            } finally {
                setLoading(false)
            }
        }

        if (slug) {
            loadEvent()
        } else {
            console.warn("⚠ Nenhum slug encontrado nos params")
        }
    }, [slug])

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString("pt-BR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            })
        } catch (e) {
            console.error("⚠ Erro ao formatar data:", dateString, e)
            return "Data inválida"
        }
    }

    const formatTime = (dateString: string) => {
        try {
            const date = new Date(dateString)
            return date.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit"
            })
        } catch (e) {
            console.error("⚠ Erro ao formatar hora:", dateString, e)
            return "--:--"
        }
    }

    const handleOccurrenceClick = (occurrence: ApiOccurrence) => {
        try {
            const city = occurrence.city?.toLowerCase().replace(/\s+/g, "-") || "local"
            const date = new Date(occurrence.start_at)
            
            // Formato correto: dd-mm-yyyy (como esperado pela página de destino)
            const day = date.getDate().toString().padStart(2, "0")
            const month = (date.getMonth() + 1).toString().padStart(2, "0")
            const year = date.getFullYear().toString()
            const formattedDate = `${day}-${month}-${year}`

            const path = `/event/${slug}/${city}-${formattedDate}`
            console.log("➡️ Redirecionando para ocorrência:", path)
            console.log("📅 Data formatada:", formattedDate, "da data original:", occurrence.start_at)

            router.push(path)
        } catch (e) {
            console.error("⚠ Erro ao processar occurrence:", occurrence, e)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <p>Carregando evento...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-black text-white">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <p className="text-red-400">{error || "Evento não encontrado"}</p>
                        <Button
                            onClick={() => router.push("/")}
                            className="mt-4"
                            variant="outline"
                        >
                            Voltar ao início
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <nav
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "20px",
                        fontSize: "14px",
                        color: "#A1A1AA",
                    }}
                >
                    <a
                        href="/"
                        style={{
                            color: "#A1A1AA",
                            textDecoration: "none",
                            transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.color = "#3B82F6"
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.color = "#A1A1AA"
                        }}
                    >
                        Home
                    </a>
                    <ChevronRight size={16} />
                    <a
                        href="/"
                        style={{
                            color: "#A1A1AA",
                            textDecoration: "none",
                            transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.color = "#3B82F6"
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.color = "#A1A1AA"
                        }}
                    >
                        Eventos
                    </a>
                    <ChevronRight size={16} />
                    <span style={{ color: "white" }}>{event.name}</span>
                </nav>

                {/* Header */}
                <div className="flex items-center gap-4 mb-8 mt-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="text-gray-400 hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar
                    </Button>
                </div>

                {/* Event Info */}
                <div className="mb-8">
                    {event.image && (
                        <div className="mb-6">
                            <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden">
                                <img
                                    src={event.image}
                                    alt={event.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    )}

                    <h1 className="text-4xl font-bold mb-4">{event.name}</h1>
                    {event.description && (
                        <p className="text-gray-300 text-lg mb-6">{event.description}</p>
                    )}

                    <div className="flex flex-wrap gap-6 text-gray-300">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            <span>{event.occurrences?.length || 0} datas disponíveis</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                            <Users className="w-5 h-5" />
                            <span>Categoria: {event.category || "Não informado"}</span>
                        </div>
                    </div>
                </div>

                {/* Occurrences List */}
                <div>
                    <h2 className="text-2xl font-bold mb-6">Escolha a data e local</h2>

                    {event.occurrences && event.occurrences.length > 0 ? (
                        <div className="grid gap-4">
                            {event.occurrences.map((occurrence) => (
                                <Card
                                    key={occurrence.id}
                                    className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                                    onClick={() => handleOccurrenceClick(occurrence)}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-4 mb-2">
                                                    <div className="flex items-center gap-2 text-primary">
                                                        <Calendar className="w-5 h-5" />
                                                        <span className="font-semibold">
                              {formatDate(occurrence.start_at)}
                            </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-300">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{formatTime(occurrence.start_at)}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 text-gray-300 mb-3">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{occurrence.city}</span>
                                                </div>

                                                <div className="flex items-center gap-1 text-blue-500 text-xs">
                                                    <Ticket size={16} className="mr-2" />
                                                    {occurrence.available_tickets > 0 ? (
                                                        <span>
                              {occurrence.available_tickets}
                            </span>
                                                    ) : (
                                                        <span className="text-red-400">Esgotado</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-lg font-bold text-primary mb-2">
                                                    A partir de R$ 50,00
                                                </div>
                                                <Button
                                                    className="bg-primary text-black hover:bg-primary/90"
                                                    disabled={occurrence.available_tickets === 0}
                                                >
                                                    {occurrence.available_tickets > 0 ? "Comprar" : "Esgotado"}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-400">Nenhuma data disponível no momento.</p>
                        </div>
                    )}
                </div>
            </div>
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
