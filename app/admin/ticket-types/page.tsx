'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ticket, Save, ArrowLeft, Plus, CheckCircle, Circle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Hooks customizados
import { useEvents } from '@/hooks/use-events'
import { useOccurrenceLoader } from '@/hooks/use-occurrence-loader'
import { useTicketTypes } from '@/hooks/use-ticket-types'
import { useTicketTypeSubmission } from '@/hooks/use-ticket-type-submission'

// Componentes customizados
import { EventSelector } from '@/components/admin/event-selector'
import { OccurrenceSelector } from '@/components/admin/OccurrenceSelector'
import { TicketTypeForm } from '@/components/admin/TicketTypeForm'
import { FeedbackMessage } from '@/components/admin/feedback-message'

// Types
import { Event, Occurrence } from '@/lib/types/occurrence'
import { TicketTypeFormData } from '@/hooks/use-ticket-types'

export default function TicketTypesPage() {
  const router = useRouter()
  
  // Estados para seleção
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
  } | null>(null)

  // Hooks customizados
  const { events, loading: eventsLoading, error: eventsError } = useEvents()
  
  const { 
    occurrences, 
    isLoading: occurrencesLoading, 
    error: occurrencesError,
    loadOccurrences 
  } = useOccurrenceLoader({ eventId: selectedEvent?.id })

  const {
    ticketTypes,
    addTicketType,
    removeTicketType,
    updateTicketType,
    getFieldError,
    resetForm,
    clearErrors,
    hasErrors
  } = useTicketTypes()

  const { 
    isSubmitting, 
    submissionError, 
    createTicketTypes, 
    clearError 
  } = useTicketTypeSubmission({
    onSuccess: (message) => {
      setFeedbackMessage({ type: 'success', message })
      resetForm()
      setSelectedEvent(null)
      setSelectedOccurrence(null)
      // Auto-hide success message after 5 seconds
      setTimeout(() => setFeedbackMessage(null), 5000)
    },
    onError: (error) => {
      setFeedbackMessage({ type: 'error', message: error })
    }
  })

  // Manipular seleção de evento
  const handleEventSelect = (event: Event | null) => {
    setSelectedEvent(event)
    setSelectedOccurrence(null)
    clearErrors()
    clearError()
    setFeedbackMessage(null)
  }

  // Manipular seleção de ocorrência
  const handleOccurrenceSelect = (occurrence: Occurrence | null) => {
    setSelectedOccurrence(occurrence)
    clearErrors()
    clearError()
    setFeedbackMessage(null)
  }

  // Manipular submissão do formulário
  const handleSubmit = async () => {
    if (!selectedOccurrence) {
      setFeedbackMessage({
        type: 'error',
        message: 'Selecione uma ocorrência antes de criar os tipos de ingressos'
      })
      return
    }

    // Validar tipos de ingressos
    const isValid = !hasErrors()
    if (!isValid) {
      setFeedbackMessage({
        type: 'error',
        message: 'Corrija os erros no formulário antes de continuar'
      })
      return
    }

    try {
      await createTicketTypes(selectedOccurrence.id!, ticketTypes)
    } catch (error) {
      // Erro já tratado pelo hook
    }
  }

  // Fechar mensagem de feedback
  const closeFeedbackMessage = () => {
    setFeedbackMessage(null)
    clearError()
  }

  // Componente de indicador de progresso
  const ProgressStep = ({ step, currentStep, title, description, isCompleted }: {
    step: number
    currentStep: number
    title: string
    description: string
    isCompleted: boolean
  }) => {
    const isActive = step === currentStep
    const isPast = step < currentStep || isCompleted

    return (
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
          isCompleted 
            ? 'bg-green-600 border-green-600 text-white' 
            : isActive 
            ? 'bg-blue-600 border-blue-600 text-white' 
            : 'bg-zinc-800 border-zinc-600 text-zinc-400'
        }`}>
          {isCompleted ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <span className="text-sm font-semibold">{step}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-medium transition-colors ${
            isActive ? 'text-white' : isPast ? 'text-green-400' : 'text-zinc-400'
          }`}>
            {title}
          </h3>
          <p className="text-xs text-zinc-500 mt-1">{description}</p>
        </div>
      </div>
    )
  }

  // Determinar o passo atual
  const getCurrentStep = () => {
    if (!selectedEvent) return 1
    if (!selectedOccurrence) return 2
    if (ticketTypes.length === 0) return 3
    return 4
  }

  const currentStep = getCurrentStep()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gerenciar Tipos de Ingressos</h1>
          <p className="text-gray-400">Configure preços, quantidades e tipos de ingressos para as ocorrências</p>
        </div>
        <Button 
          onClick={() => router.push('/admin/events')}
          variant="outline"
          className="border-zinc-700 text-white hover:bg-zinc-800 rounded-lg"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Eventos
        </Button>
      </div>

      {/* Indicador de Progresso */}
      <Card className="bg-zinc-900 border-zinc-800 rounded-lg">
        <CardContent className="p-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Progresso da Configuração</h2>
            <div className="space-y-4">
              <ProgressStep
                step={1}
                currentStep={currentStep}
                title="Selecionar Evento"
                description="Escolha o evento para configurar os tipos de ingressos"
                isCompleted={!!selectedEvent}
              />
              <ProgressStep
                step={2}
                currentStep={currentStep}
                title="Selecionar Ocorrência"
                description="Escolha a data/horário específico do evento"
                isCompleted={!!selectedOccurrence}
              />
              <ProgressStep
                step={3}
                currentStep={currentStep}
                title="Configurar Tipos de Ingressos"
                description="Adicione e configure os tipos de ingressos disponíveis"
                isCompleted={ticketTypes.length > 0}
              />
              <ProgressStep
                step={4}
                currentStep={currentStep}
                title="Salvar Tipos de Ingressos"
                description="Revise e salve os tipos de ingressos configurados"
                isCompleted={false}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mensagem de feedback */}
      {(feedbackMessage || submissionError) && (
        <FeedbackMessage
          type={feedbackMessage?.type || 'error'}
          message={feedbackMessage?.message || submissionError || ''}
          onClose={closeFeedbackMessage}
          autoClose={feedbackMessage?.type === 'success'}
        />
      )}

      {/* Seleção de Evento */}
      <Card className={`bg-zinc-900 border-zinc-800 rounded-lg transition-all duration-200 ${
        currentStep >= 1 ? 'ring-2 ring-blue-500 ring-opacity-20' : ''
      }`}>
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${
              selectedEvent ? 'bg-green-600' : currentStep === 1 ? 'bg-blue-600' : 'bg-zinc-700'
            }`}>
              <Ticket className="h-5 w-5" />
            </div>
            Selecionar Evento
            {selectedEvent && <Badge variant="secondary" className="ml-2 bg-green-600 text-white">Concluído</Badge>}
            {eventsLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EventSelector
            events={events}
            selectedEventId={selectedEvent?.id || ''}
            loading={eventsLoading}
            error={eventsError}
            onEventChange={(eventId) => {
              const event = events.find(e => e.id === eventId) || null
              handleEventSelect(event)
            }}
          />
          {selectedEvent && (
            <div className="mt-4 p-3 bg-green-900 bg-opacity-20 border border-green-800 rounded-lg">
              <p className="text-green-400 text-sm">
                <strong>Evento selecionado:</strong> {selectedEvent.name}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seleção de Ocorrência */}
      {selectedEvent && (
        <Card className={`bg-zinc-900 border-zinc-800 rounded-lg transition-all duration-200 ${
          currentStep >= 2 ? 'ring-2 ring-blue-500 ring-opacity-20' : ''
        }`}>
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${
                selectedOccurrence ? 'bg-green-600' : currentStep === 2 ? 'bg-blue-600' : 'bg-zinc-700'
              }`}>
                <Ticket className="h-5 w-5" />
              </div>
              Selecionar Ocorrência
              {selectedOccurrence && <Badge variant="secondary" className="ml-2 bg-green-600 text-white">Concluído</Badge>}
              {occurrencesLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OccurrenceSelector
              occurrences={occurrences}
              selectedOccurrence={selectedOccurrence}
              onSelect={handleOccurrenceSelect}
              isLoading={occurrencesLoading}
              error={occurrencesError}
              placeholder="Selecione uma ocorrência"
              label="Ocorrência"
              required
            />
            {selectedOccurrence && (
              <div className="mt-4 p-3 bg-green-900 bg-opacity-20 border border-green-800 rounded-lg">
                <p className="text-green-400 text-sm">
                  <strong>Ocorrência selecionada:</strong> {new Date(selectedOccurrence.start_at).toLocaleDateString('pt-BR')} às {new Date(selectedOccurrence.start_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-green-400 text-sm mt-1">
                  <strong>Local:</strong> {selectedOccurrence.city}, {selectedOccurrence.state}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Formulário de Tipos de Ingressos */}
      {selectedOccurrence && (
        <Card className={`bg-zinc-900 border-zinc-800 rounded-lg transition-all duration-200 ${
          currentStep >= 3 ? 'ring-2 ring-blue-500 ring-opacity-20' : ''
        }`}>
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${
                ticketTypes.length > 0 ? 'bg-green-600' : currentStep === 3 ? 'bg-blue-600' : 'bg-zinc-700'
              }`}>
                <Ticket className="h-5 w-5" />
              </div>
              Tipos de Ingressos
              {ticketTypes.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-green-600 text-white">
                  {ticketTypes.length} {ticketTypes.length === 1 ? 'tipo' : 'tipos'} configurado{ticketTypes.length > 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ticketTypes.length === 0 ? (
              <div className="text-center py-8">
                <Ticket className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-zinc-400 mb-2">Nenhum tipo de ingresso configurado</h3>
                <p className="text-zinc-500 mb-4">Adicione pelo menos um tipo de ingresso para continuar</p>
                <Button
                  onClick={addTicketType}
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Tipo
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <TicketTypeForm
                  ticketTypes={ticketTypes}
                  onAddTicketType={addTicketType}
                  onRemoveTicketType={removeTicketType}
                  onUpdateTicketType={updateTicketType}
                  getFieldError={getFieldError}
                  disabled={isSubmitting}
                />
                
                {/* Preview dos tipos de ingressos */}
                <div className="mt-6 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                  <h4 className="text-white font-medium mb-3">Resumo dos Tipos de Ingressos</h4>
                  <div className="space-y-2">
                    {ticketTypes.map((ticketType, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg">
                        <div className="flex-1">
                          <p className="text-white font-medium">{ticketType.name}</p>
                          <p className="text-zinc-400 text-sm">
                            R$ {ticketType.price}
                          </p>
                          <p className="text-zinc-500 text-xs mt-1">
                            {ticketType.description}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="outline" className="text-zinc-400 border-zinc-600">
                            R$ {ticketType.price}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Botões de Ação */}
      {selectedOccurrence && ticketTypes.length > 0 && (
        <Card className={`bg-zinc-900 border-zinc-800 rounded-lg transition-all duration-200 ${
          currentStep >= 4 ? 'ring-2 ring-green-500 ring-opacity-20' : ''
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Pronto para salvar!</h3>
                <p className="text-zinc-400 text-sm mt-1">
                  {ticketTypes.length} {ticketTypes.length === 1 ? 'tipo de ingresso' : 'tipos de ingressos'} configurado{ticketTypes.length > 1 ? 's' : ''} para a ocorrência
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setSelectedEvent(null)
                    setSelectedOccurrence(null)
                    resetForm()
                  }}
                  variant="outline"
                  className="border-zinc-700 text-white hover:bg-zinc-800 rounded-lg"
                  disabled={isSubmitting}
                >
                  Limpar Tudo
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !selectedOccurrence}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Tipos de Ingressos
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}