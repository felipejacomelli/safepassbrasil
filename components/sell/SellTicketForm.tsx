"use client"

import { memo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"
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
}

export const SellTicketForm = memo(({
  event,
  selectedOccurrence,
  currentOccurrence,
  onOccurrenceChange,
  onSubmit,
  isSubmitting,
  error,
  success
}: SellTicketFormProps) => {
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

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form

  const watchedPrice = watch("price")
  const watchedQuantity = watch("quantity")
  const watchedTicketType = watch("ticketTypeId")
  const watchedTerms = watch("termsAccepted")

  const handleFormSubmit = (data: SellTicketFormData) => {
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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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
