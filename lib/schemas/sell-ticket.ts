import { z } from "zod"

// Schema para formulário de venda de ingresso
export const sellTicketSchema = z.object({
  occurrenceId: z.string().min(1, "Selecione uma data e local"),
  ticketTypeId: z.string().min(1, "Selecione um tipo de ingresso"),
  price: z.number().min(0.01, "Preço deve ser maior que zero"),
  quantity: z.number().int().min(1, "Quantidade deve ser maior que zero").max(10, "Máximo de 10 ingressos"),
  description: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, "Você deve aceitar os termos")
})

export type SellTicketFormData = z.infer<typeof sellTicketSchema>

// Schema para validação de preço
export const priceValidationSchema = z.object({
  price: z.number().min(0.01, "Preço deve ser maior que zero"),
  platformFeeRate: z.number().min(0).max(1, "Taxa de plataforma deve estar entre 0 e 1")
})

export type PriceValidationData = z.infer<typeof priceValidationSchema>

// Schema para validação de quantidade
export const quantityValidationSchema = z.object({
  quantity: z.number().int().min(1, "Quantidade deve ser maior que zero").max(10, "Máximo de 10 ingressos")
})

export type QuantityValidationData = z.infer<typeof quantityValidationSchema>
