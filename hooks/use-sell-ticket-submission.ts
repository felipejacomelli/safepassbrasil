"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { type SellTicketFormData } from "@/lib/schemas/sell-ticket"

interface UseSellTicketSubmissionProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function useSellTicketSubmission({ onSuccess, onError }: UseSellTicketSubmissionProps = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null)
  const [shareLink, setShareLink] = useState<string | null>(null)
  const { user } = useAuth()

  const baseUrl = process.env.NEXT_PUBLIC_API_URL

  // Função para criar link compartilhado
  const createShareLink = async (ticketId: string) => {
    try {
      const response = await fetch(`${baseUrl}/api/v1/sharing/links/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(typeof window !== 'undefined' && localStorage.getItem('authToken') && {
            'Authorization': `Token ${localStorage.getItem('authToken')}`
          })
        },
        body: JSON.stringify({
          ticket_id: ticketId,
          link_type: 'public',
          message: ''
        })
      })

      if (response.ok) {
        const result = await response.json()
        const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'
        return `${frontendUrl}/shared-ticket/${result.token}`
      }
    } catch (error) {
      console.error('Erro ao criar link compartilhado:', error)
    }
    return null
  }

  const submitTickets = async (ticketData: SellTicketFormData) => {
    if (!user) {
      const errorMsg = "Usuário não autenticado"
      setError(errorMsg)
      onError?.(errorMsg)
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      // Validações básicas
      if (!ticketData.ticketTypeId) {
        const errorMsg = "Tipo de ingresso é obrigatório"
        setError(errorMsg)
        onError?.(errorMsg)
        return
      }

      if (!ticketData.price || Number(ticketData.price) <= 0) {
        const errorMsg = "Preço deve ser maior que zero"
        setError(errorMsg)
        onError?.(errorMsg)
        return
      }

      const { quantity, price, ticketTypeId, name, owner } = {
        quantity: Number(ticketData.quantity) || 1,
        price: Number(ticketData.price) || 0,
        ticketTypeId: ticketData.ticketTypeId,
        name: user.name || 'Vendedor',
        owner: user.id
      }

      let successfulTickets = 0
      let failedTickets = 0
      const errors: string[] = []

      // Se quantidade > 1, publicar cada ingresso individualmente
      if (quantity > 1) {
        for (let i = 0; i < quantity; i++) {
          try {
            const response = await fetch(`${baseUrl}/api/tickets/sell/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(typeof window !== 'undefined' && localStorage.getItem('authToken') && {
                  'Authorization': `Token ${localStorage.getItem('authToken')}`
                })
              },
              body: JSON.stringify({
                ticket_type: ticketTypeId,
                name,
                quantity: 1, // Sempre 1 para publicação individual
                price,
                price_blocked: false
              })
            })

            if (!response.ok) {
              let errorData;
              const contentType = response.headers.get('content-type');
              
              if (contentType && contentType.includes('application/json')) {
                errorData = await response.json();
              } else {
                const textResponse = await response.text();
                console.error('Non-JSON response:', textResponse);
                errorData = { error: 'Erro de comunicação com o servidor' };
              }
              
              errors.push(`Ingresso ${i + 1}: ${errorData.error || 'Erro ao anunciar ingresso'}`)
              failedTickets++
            } else {
              try {
                const result = await response.json();
                console.log(`Ticket ${i + 1} created successfully:`, result);
                
                // Se for o primeiro ingresso criado, salvar o ID e criar link compartilhado
                const ticketId = result?.id || result?.ticket?.id
                if (i === 0 && ticketId) {
                  setCreatedTicketId(ticketId)
                  const link = await createShareLink(ticketId)
                  if (link) {
                    setShareLink(link)
                  }
                }
              } catch (parseError) {
                console.error('Error parsing success response:', parseError);
              }
              successfulTickets++
            }
          } catch (err) {
            console.error(`Erro ao criar ingresso ${i + 1}:`, err)
            errors.push(`Ingresso ${i + 1}: Erro de conexão`)
            failedTickets++
          }
        }

        // Verificar resultados da publicação múltipla
        if (successfulTickets === quantity) {
          setSuccess(true)
          onSuccess?.()
        } else if (successfulTickets > 0) {
          const errorMsg = `✅ ${successfulTickets} ingressos publicados com sucesso. ❌ ${failedTickets} falharam. Detalhes: ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? '...' : ''}`
          setError(errorMsg)
          onError?.(errorMsg)
        } else {
          const errorMsg = `❌ Falha ao publicar todos os ingressos. Detalhes: ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? '...' : ''}`
          setError(errorMsg)
          onError?.(errorMsg)
        }
      } else {
        // Publicação única (quantidade = 1)
        const response = await fetch(`${baseUrl}/api/tickets/sell/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(typeof window !== 'undefined' && localStorage.getItem('authToken') && {
              'Authorization': `Token ${localStorage.getItem('authToken')}`
            })
          },
          body: JSON.stringify({
            ticket_type: ticketTypeId,
            name,
            quantity: 1,
            price,
            price_blocked: false
          })
        })

        if (!response.ok) {
          let errorData;
          const contentType = response.headers.get('content-type');
          
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json();
          } else {
            const textResponse = await response.text();
            console.error('Non-JSON response:', textResponse);
            errorData = { error: 'Erro de comunicação com o servidor' };
          }
          
          const errorMsg = errorData.error || 'Erro ao anunciar ingresso'
          setError(errorMsg)
          onError?.(errorMsg)
          return
        }

        try {
          const result = await response.json();
          console.log('Ticket created successfully:', result);
          
          // Salvar o ID do ingresso criado e criar link compartilhado
          const ticketId = result?.id || result?.ticket?.id
          if (ticketId) {
            setCreatedTicketId(ticketId)
            const link = await createShareLink(ticketId)
            if (link) {
              setShareLink(link)
            }
          }
        } catch (parseError) {
          console.error('Error parsing success response:', parseError);
        }

        setSuccess(true)
        onSuccess?.()
      }
    } catch (err) {
      console.error('Erro ao vender ingressos:', err)
      const errorMsg = "Erro ao conectar com o servidor. Tente novamente."
      setError(errorMsg)
      onError?.(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetState = () => {
    setError(null)
    setSuccess(false)
    setIsSubmitting(false)
  }

  return {
    submitTickets,
    isSubmitting,
    error,
    success,
    shareLink,
    resetState
  }
}
