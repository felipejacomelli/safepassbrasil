"use client"

import { useEffect, useState, use } from "react"
import { useParams, useRouter } from "next/navigation"
import { Calendar, MapPin, Clock, Users, ArrowLeft } from "lucide-react"
import { eventsApi, ApiEventWithOccurrences, ApiOccurrence } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"

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
            const formattedDate = `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1)
                .toString()
                .padStart(2, "0")}-${date.getFullYear()}`

            const path = `/event/${slug}/${city}-${formattedDate}`
            console.log("➡️ Redirecionando para ocorrência:", path)

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

    const breadcrumbItems = [
        { label: "Events", href: "/" },
        { label: event.name, href: `/event/${slug}` }
    ]

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumbs */}
                <Breadcrumbs items={breadcrumbItems} />

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

                                                <div className="text-sm text-gray-400">
                                                    {occurrence.available_tickets > 0 ? (
                                                        <span className="text-green-400">
                              {occurrence.available_tickets} ingressos disponíveis
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
        </div>
    )
}
