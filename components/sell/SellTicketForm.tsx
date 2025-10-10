"use client"

import { memo, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Share2, Copy } from "lucide-react"
import { sellTicketSchema, type SellTicketFormData } from "@/lib/schemas/sell-ticket"
import { type ApiEvent, type ApiOccurrence } from "@/lib/api"
import { OccurrenceSelector } from "./OccurrenceSelector"
import { TicketTypeSelector } from "./TicketTypeSelector"
import { PriceConfiguration } from "./PriceConfiguration"
import { QuantitySelector } from "./QuantitySelector"

interface SellTicketFormProps {
  event: ApiEvent | null
  selectedOccurrence: string
  currentOccurrence: ApiOccurrence | null
  onOccurrenceChange: (value: string) => void
  onSubmit: (data: SellTicketFormData) => void
  isSubmitting: boolean
  error: string | null
  success: boolean
  shareLink?: string | null
}

export const SellTicketForm = memo(({
  event,
  selectedOccurrence,
  currentOccurrence,
  onOccurrenceChange,
  onSubmit,
  isSubmitting,
  error,
  success,
  shareLink
}: SellTicketFormProps) => {
  const [linkCopied, setLinkCopied] = useState(false)
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar link:', err)
    }
  }
  
  const form = useForm<SellTicketFormData>({
    resolver: zodResolver(sellTicketSchema),
    defaultValues: {
      occurrenceId: selectedOccurrence || "",
      ticketTypeId: "",
      price: 0,
      quantity: 1,
      description: "",
      termsAccepted: false,
      price_blocked: false
    }
  })

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form

  // Sincronizar occurrenceId sempre que selectedOccurrence mudar
  useEffect(() => {
    if (selectedOccurrence) {
      setValue("occurrenceId", selectedOccurrence)
    }
  }, [selectedOccurrence, setValue])

  const handleFormError = (errors: any) => {
    console.log('=== FORM VALIDATION ERRORS ===')
    console.log('Validation errors:', errors)
    console.log('Form state:', form.formState)
  }

  const watchedPrice = watch("price")
  const watchedQuantity = watch("quantity")
  const watchedTicketType = watch("ticketTypeId")
  const watchedTerms = watch("termsAccepted")

  const handleFormSubmit = (data: SellTicketFormData) => {
    console.log('=== FORM SUBMISSION DEBUG ===')
    console.log('Form data:', data)
    console.log('Form errors:', errors)
    console.log('Selected occurrence:', selectedOccurrence)
    console.log('Current occurrence:', currentOccurrence)
    console.log('Watched values:', {
      price: watchedPrice,
      quantity: watchedQuantity,
      ticketType: watchedTicketType,
      terms: watchedTerms
    })
    
    // Garantir que o occurrenceId seja definido corretamente
    if (selectedOccurrence && !data.occurrenceId) {
      console.log('Setting occurrenceId from selectedOccurrence:', selectedOccurrence)
      data.occurrenceId = selectedOccurrence
    }
    
    // Garantir que o preço seja válido
    if (!data.price || data.price <= 0) {
      console.error('Preço inválido:', data.price)
      return
    }
    
    console.log('Final data being submitted:', data)
    console.log('Calling onSubmit...')
    onSubmit(data)
  }

  if (success) {
    return (
      <Card className="bg-zinc-900 border-zinc-800 rounded">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-green-950/20 rounded flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            {watchedQuantity > 1 ? "Ingressos publicados com sucesso!" : "Ingresso publicado com sucesso!"}
          </h2>
          <p className="text-zinc-400 mb-6">
            {watchedQuantity > 1 
              ? `Seus ${watchedQuantity} ingressos para ${event?.name || "este evento"} foram publicados individualmente e já estão disponíveis para compradores.`
              : `Seu ingresso para ${event?.name || "este evento"} foi publicado e já está disponível para compradores.`
            }
          </p>
          
          {/* Link Compartilhado */}
          {shareLink && (
            <div className="mb-6 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
              <div className="flex items-center gap-2 mb-3">
                <Share2 className="w-5 h-5 text-blue-400" />
                <h3 className="text-white font-medium">Link para Compartilhar</h3>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 bg-zinc-900 border border-zinc-600 text-white text-sm px-3 py-2 rounded"
                />
                <Button
                  onClick={() => copyToClipboard(shareLink)}
                  variant="outline"
                  size="sm"
                  className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  {linkCopied ? "Copiado!" : "Copiar"}
                </Button>
              </div>
              <p className="text-zinc-500 text-xs mt-2">
                Compartilhe este link para que outras pessoas possam ver e comprar seu ingresso.
              </p>
            </div>
          )}
          
          <Button 
            onClick={() => window.location.href = `/event/${event?.slug}`}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Voltar para o evento
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit, handleFormError)} className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800 rounded">
        <CardHeader>
          <CardTitle className="text-white">Detalhes do Ingresso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Occurrence Selection */}
          <OccurrenceSelector
            occurrences={(event as any)?.occurrences || []}
            value={selectedOccurrence}
            onChange={onOccurrenceChange}
          />

          {/* Ticket Type */}
          <TicketTypeSelector
            ticketTypes={(currentOccurrence as any)?.ticket_types || []}
            value={watchedTicketType}
            onChange={(value) => setValue("ticketTypeId", value)}
            disabled={!selectedOccurrence}
          />

          {/* Price Configuration */}
          <PriceConfiguration
            price={watchedPrice}
            onChange={(price) => setValue("price", price)}
            platformFeeRate={0.075}
          />

          {/* Quantity */}
          <QuantitySelector
            value={watchedQuantity}
            onChange={(quantity) => setValue("quantity", quantity)}
            maxQuantity={10}
          />

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white font-medium">
              Descrição (opcional)
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Adicione informações relevantes sobre o ingresso (setor, fileira, assento, etc.)"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[120px] rounded"
            />
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card className="bg-zinc-900 border-zinc-800 rounded">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              {...register("termsAccepted")}
              className="mt-1"
              required
            />
            <Label 
              htmlFor="terms"
              className="text-zinc-300 text-sm leading-relaxed cursor-pointer"
            >
              Eu confirmo que sou o proprietário legítimo deste ingresso e concordo com os{" "}
              <a
                href="#"
                className="text-blue-400 hover:text-blue-300 underline"
                onClick={(e) => e.preventDefault()}
              >
                Termos e Condições
              </a>{" "}
              e{" "}
              <a
                href="#"
                className="text-blue-400 hover:text-blue-300 underline"
                onClick={(e) => e.preventDefault()}
              >
                Política de Privacidade
              </a>{" "}
              da ReTicket.
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert className="bg-red-950/20 border-red-500/30 rounded">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <AlertDescription className="text-red-400">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting || !watchedTerms}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded"
        onClick={() => {
          console.log('=== BUTTON CLICKED ===')
          console.log('isSubmitting:', isSubmitting)
          console.log('watchedTerms:', watchedTerms)
          console.log('Form is valid:', form.formState.isValid)
          console.log('Form errors:', form.formState.errors)
        }}
      >
        {isSubmitting 
          ? (watchedQuantity > 1 
              ? `Publicando ${watchedQuantity} ingressos...` 
              : "Publicando..."
            )
          : (watchedQuantity > 1 
              ? `Publicar ${watchedQuantity} Ingressos` 
              : "Publicar Ingresso"
            )
        }
      </Button>
    </form>
  )
})

SellTicketForm.displayName = "SellTicketForm"
