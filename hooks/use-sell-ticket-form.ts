"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { sellTicketSchema, type SellTicketFormData } from "@/lib/schemas/sell-ticket"
import { type ApiEvent, type ApiOccurrence } from "@/lib/api"
import { useState, useEffect, useMemo } from "react"

interface UseSellTicketFormProps {
  event: ApiEvent | null
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function useSellTicketForm({ event, onSuccess, onError }: UseSellTicketFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedOccurrence, setSelectedOccurrence] = useState<string>("")
  const [currentOccurrence, setCurrentOccurrence] = useState<ApiOccurrence | null>(null)

  const form = useForm<SellTicketFormData>({
    resolver: zodResolver(sellTicketSchema),
    defaultValues: {
      occurrenceId: "",
      ticketTypeId: "",
      price: 0,
      quantity: 1,
      description: "",
      termsAccepted: false
    }
  })

  // Atualizar occurrence quando selecionada
  useEffect(() => {
    if (selectedOccurrence && (event as any)?.occurrences) {
      const occurrence = (event as any).occurrences.find((occ: any) => occ.id === selectedOccurrence)
      setCurrentOccurrence(occurrence || null)
    }
  }, [selectedOccurrence, event])

  // Reset ticket type quando occurrence muda
  useEffect(() => {
    if (selectedOccurrence) {
      form.setValue("ticketTypeId", "")
      form.setValue("price", 0)
    }
  }, [selectedOccurrence, form])

  // Auto-popular primeira occurrence se disponível
  useEffect(() => {
    if ((event as any)?.occurrences && (event as any).occurrences.length > 0 && !selectedOccurrence) {
      const firstOccurrence = (event as any).occurrences[0]
      setSelectedOccurrence(firstOccurrence.id)
      form.setValue("occurrenceId", firstOccurrence.id)
    }
  }, [event, selectedOccurrence, form])

  const handleOccurrenceChange = (value: string) => {
    setSelectedOccurrence(value)
    form.setValue("occurrenceId", value)
  }

  const handleTicketTypeChange = (value: string) => {
    form.setValue("ticketTypeId", value)
  }

  const handlePriceChange = (price: number) => {
    form.setValue("price", price)
  }

  const handleQuantityChange = (quantity: number) => {
    form.setValue("quantity", quantity)
  }

  const handleDescriptionChange = (description: string) => {
    form.setValue("description", description)
  }

  const handleTermsChange = (accepted: boolean) => {
    form.setValue("termsAccepted", accepted)
  }

  const onSubmit = async (data: SellTicketFormData) => {
    setIsSubmitting(true)
    try {
      // Lógica de submissão será implementada no hook de submissão
      onSuccess?.()
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Erro desconhecido")
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    form,
    isSubmitting,
    selectedOccurrence,
    currentOccurrence,
    handleOccurrenceChange,
    handleTicketTypeChange,
    handlePriceChange,
    handleQuantityChange,
    handleDescriptionChange,
    handleTermsChange,
    onSubmit: form.handleSubmit(onSubmit)
  }
}
