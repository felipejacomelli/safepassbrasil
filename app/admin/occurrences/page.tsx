"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Plus, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useOccurrences } from "@/hooks/use-occurrences"
import { useEvents } from "@/hooks/use-events"
import { useOccurrenceSubmission } from "@/hooks/use-occurrence-submission"
import { OccurrenceForm } from "@/components/admin/occurrence-form"
import { EventSelector } from "@/components/admin/event-selector"
import { FeedbackMessage } from "@/components/admin/feedback-message"
import { ErrorHandler } from "@/lib/error-handler"

export default function OccurrencesPage() {
  const router = useRouter()
  
  // Estados para controle de UI e dados
  const [selectedEventId, setSelectedEventId] = useState<string>("")
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Hooks customizados
  const { events, loading: eventsLoading, error: eventsError } = useEvents({
    onError: (error) => setMessage({ type: 'error', text: error })
  })

  const {
    occurrences,
    errors,
    addOccurrence,
    removeOccurrence,
    updateOccurrence,
    validateAllOccurrences,
    clearErrors,
    resetForm,
    getFieldError
  } = useOccurrences({
    onError: (error) => setMessage({ type: 'error', text: error }),
    onSuccess: (message) => setMessage({ type: 'success', text: message })
  })

  const { isSubmitting, createOccurrences } = useOccurrenceSubmission({
    onSuccess: (message) => {
      setMessage({ type: 'success', text: message })
      resetForm()
      setSelectedEventId("")
    },
    onError: (error) => setMessage({ type: 'error', text: error })
  })

  // Handlers
  const handleEventChange = useCallback((eventId: string) => {
    setSelectedEventId(eventId)
    clearErrors()
  }, [clearErrors])

  const handleOccurrenceUpdate = useCallback((index: number, field: string, value: string) => {
    updateOccurrence(index, field as any, value)
  }, [updateOccurrence])

  const handleOccurrenceRemove = useCallback((index: number) => {
    removeOccurrence(index)
  }, [removeOccurrence])

  // Função para salvar ocorrências
  const handleSave = useCallback(async () => {
    if (!selectedEventId) {
      setMessage({ type: 'error', text: 'Selecione um evento antes de salvar as ocorrências' })
      return
    }

    // Validar todas as ocorrências
    if (!validateAllOccurrences()) {
      setMessage({ type: 'error', text: 'Corrija os erros nos formulários antes de salvar' })
      return
    }

    try {
      await createOccurrences(selectedEventId, occurrences)
    } catch (error) {
      const errorMessage = ErrorHandler.getFriendlyErrorMessage(error)
      setMessage({ type: 'error', text: errorMessage })
    }
  }, [selectedEventId, occurrences, validateAllOccurrences, createOccurrences])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gerenciar Ocorrências</h1>
          <p className="text-gray-400">Adicione datas, horários e locais para os eventos</p>
        </div>
        <Button 
          onClick={addOccurrence}
          className="bg-blue-600 rounded hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Ocorrência
        </Button>
      </div>

      {/* Mensagem de feedback */}
      {message && (
        <FeedbackMessage
          type={message.type}
          message={message.text}
          onClose={() => setMessage(null)}
          autoClose={message.type === 'success'}
        />
      )}

      {/* Seleção de Evento */}
      <EventSelector
        events={events}
        selectedEventId={selectedEventId}
        loading={eventsLoading}
        error={eventsError}
        onEventChange={handleEventChange}
      />

      {/* Formulário de Ocorrências */}
      <div className="space-y-4">
        {occurrences.map((occurrence, index) => (
          <OccurrenceForm
            key={index}
            occurrence={occurrence}
            index={index}
            canRemove={occurrences.length > 1}
            onUpdate={handleOccurrenceUpdate}
            onRemove={handleOccurrenceRemove}
            errors={errors[index]}
          />
        ))}
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-4">
        <Button
          onClick={handleSave}
          disabled={isSubmitting || !selectedEventId}
          className="bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Salvando...' : 'Salvar Ocorrências'}
        </Button>
        
        <Button
          variant="outline"
          onClick={() => router.push('/admin/events')}
          className="border-zinc-700 text-white rounded hover:bg-zinc-800"
        >
          Voltar para Eventos
        </Button>
      </div>
    </div>
  )
}