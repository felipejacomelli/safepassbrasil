import { z } from "zod"

// Schema para tipos de ingresso
export const ticketTypeSchema = z.object({
  name: z.string().min(1, "Nome do ingresso é obrigatório"),
  description: z.string().optional(),
  price: z.number().min(0.01, "Preço deve ser maior que zero"),
  quantity: z.number().int().min(1, "Quantidade deve ser maior que zero"),
  max_per_purchase: z.number().int().min(1, "Máximo por compra deve ser maior que zero"),
})

// Schema para ingressos únicos
export const uniqueTicketSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome do ingresso é obrigatório"),
  description: z.string().optional(),
  price: z.number().min(0.01, "Preço deve ser maior que zero"),
  quantity: z.number().int().min(1, "Quantidade deve ser maior que zero"),
  max_per_purchase: z.number().int().min(1, "Máximo por compra deve ser maior que zero"),
})

// Schema para ocorrências
export const occurrenceSchema = z.object({
  start_at: z.string().min(1, "Data e hora de início é obrigatória"),
  end_at: z.string().optional(),
  uf: z.string().min(2, "UF é obrigatório").max(2, "UF deve ter 2 caracteres"),
  state: z.string().min(1, "Estado é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  address: z.string().optional(),
  venue: z.string().optional(),
  ticket_types: z.array(ticketTypeSchema).min(1, "Pelo menos um tipo de ingresso é obrigatório"),
}).refine((data) => {
  if (data.end_at && data.end_at.length > 0) {
    return new Date(data.end_at) > new Date(data.start_at)
  }
  return true
}, {
  message: "Data de término deve ser posterior à data de início",
  path: ["end_at"]
})

// Schema para eventos
export const eventSchema = z.object({
  name: z.string().min(1, "Nome do evento é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  category: z.string().min(1, "Categoria é obrigatória"),
  category_id: z.string().min(1, "ID da categoria é obrigatório"),
  image: z.string().min(1, "Imagem é obrigatória"),
})

// Tipos TypeScript derivados dos schemas
export type TicketType = z.infer<typeof ticketTypeSchema>
export type UniqueTicket = z.infer<typeof uniqueTicketSchema>
export type Occurrence = z.infer<typeof occurrenceSchema>
export type Event = z.infer<typeof eventSchema>

// Schema para formulário de criação (com campos opcionais para UI)
export const eventFormSchema = eventSchema

export type EventFormData = z.infer<typeof eventFormSchema>