"use client"

import { useState, useEffect, use, memo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { type ApiEvent } from "@/lib/api"
import { useSellTicketForm } from "@/hooks/use-sell-ticket-form"
import { useSellTicketSubmission } from "@/hooks/use-sell-ticket-submission"
import { EventInfoCard } from "@/components/sell/EventInfoCard"
import { SellTicketForm } from "@/components/sell/SellTicketForm"
import { ErrorBoundary } from "@/components/sell/ErrorBoundary"
import Header from "@/components/Header"
import useSWR from "swr"

// Fetcher function for API calls
const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Erro ao buscar dados")
    return res.json()
  })

export default function SellTicketPage({ params }: { params: Promise<{ slug: string }> }) {
  return <SellTicketPageClient params={params} />
}

const SellTicketPageClient = memo(({ params }: { params: Promise<{ slug: string }> }) => {
  const resolvedParams = use(params)
  const [isDesktop, setIsDesktop] = useState(false)
  const router = useRouter()
  const { user } = useAuth()
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL

  // Fetch event data from API based on slug
  const { data: eventData, error: fetchError, isLoading } = useSWR(
    `${baseUrl}/api/events/events/${resolvedParams.slug}/`,
    fetcher
  )

  const event = eventData || null

  // Custom hooks for form management
  const {
    selectedOccurrence,
    currentOccurrence,
    handleOccurrenceChange
  } = useSellTicketForm({ 
    event, 
    onSuccess: () => {
      // Success handled in submission hook
    },
    onError: (error) => {
      console.error('Form error:', error)
    }
  })

  const {
    submitTickets,
    isSubmitting,
    error,
    success,
    shareLink
  } = useSellTicketSubmission({
    onSuccess: () => {
      // Success handled in form component
    },
    onError: (error) => {
      console.error('Submission error:', error)
    }
  })

  // Set desktop state after client mount to avoid hydration mismatch
  useEffect(() => {
    setIsDesktop(window.matchMedia("(min-width: 640px)").matches)
  }, [])

  // Handle form submission
  const handleFormSubmit = async (data: any) => {
    await submitTickets(data)
  }

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-6 text-zinc-400 text-sm">
          <a href="/" className="text-zinc-400 hover:text-foreground transition-colors">
            Início
          </a>
          <span>›</span>
          <a 
            href={`/event/${event?.slug || resolvedParams.slug}`}
            className="text-zinc-400 hover:text-foreground transition-colors"
          >
            {event?.name || "Carregando..."}
          </a>
          <span>›</span>
          <span className="text-blue-400">Vender Ingressos</span>
        </nav>

        <div className={`grid gap-8 ${isDesktop ? 'grid-cols-[1fr,1.5fr]' : 'grid-cols-1'}`}>
          {/* Event Info */}
          <ErrorBoundary>
            <EventInfoCard 
              event={event}
              selectedOccurrence={selectedOccurrence}
              currentOccurrence={currentOccurrence}
            />
          </ErrorBoundary>

          {/* Sell Form */}
          <ErrorBoundary>
            <SellTicketForm
              event={event}
              selectedOccurrence={selectedOccurrence}
              currentOccurrence={currentOccurrence}
              onOccurrenceChange={handleOccurrenceChange}
              onSubmit={handleFormSubmit}
              isSubmitting={isSubmitting}
              error={error}
              success={success}
              shareLink={shareLink}
            />
          </ErrorBoundary>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-zinc-800 p-8 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3">Sobre</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-3">
              Safe Pass é uma plataforma confiável para compra e venda de ingressos diretamente entre fãs.
            </p>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Nossa missão é conectar pessoas, que desejam revender seus ingressos devido a imprevistos, com compradores
              que procuram as melhores ofertas de última hora.
            </p>
          </div>

          <p className="text-zinc-500 text-xs text-center mt-6">
            © 2023 Safe Pass. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
})

SellTicketPageClient.displayName = "SellTicketPageClient"
