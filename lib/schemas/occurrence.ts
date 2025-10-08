import { z } from "zod"

// Schema para validação de UF brasileira
const ufSchema = z.string()
  .length(2, "UF deve ter exatamente 2 caracteres")
  .regex(/^[A-Z]{2}$/, "UF deve conter apenas letras maiúsculas")
  .refine((uf) => {
    const validUFs = [
      'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
      'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
      'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ]
    return validUFs.includes(uf)
  }, "UF inválida")

// Schema para validação de data/hora
const dateTimeSchema = z.string()
  .min(1, "Data/hora é obrigatória")
  .refine((date) => {
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime())
  }, "Data/hora inválida")
  .refine((date) => {
    const parsedDate = new Date(date)
    const now = new Date()
    return parsedDate > now
  }, "Data deve ser futura")

// Schema para validação de formulário de ocorrência
export const occurrenceFormSchema = z.object({
  start_at: dateTimeSchema,
  end_at: dateTimeSchema,
  uf: ufSchema,
  state: z.string()
    .min(2, "Estado deve ter pelo menos 2 caracteres")
    .max(100, "Estado deve ter no máximo 100 caracteres"),
  city: z.string()
    .min(2, "Cidade deve ter pelo menos 2 caracteres")
    .max(150, "Cidade deve ter no máximo 150 caracteres")
}).refine((data) => {
  const startDate = new Date(data.start_at)
  const endDate = new Date(data.end_at)
  return endDate > startDate
}, {
  message: "Data de fim deve ser posterior à data de início",
  path: ["end_at"]
})

// Schema para validação de ocorrência individual (com event_id)
export const occurrenceSchema = z.object({
  event_id: z.string().min(1, "Evento é obrigatório"),
  start_at: dateTimeSchema,
  end_at: dateTimeSchema,
  uf: ufSchema,
  state: z.string()
    .min(2, "Estado deve ter pelo menos 2 caracteres")
    .max(100, "Estado deve ter no máximo 100 caracteres"),
  city: z.string()
    .min(2, "Cidade deve ter pelo menos 2 caracteres")
    .max(150, "Cidade deve ter no máximo 150 caracteres")
}).refine((data) => {
  const startDate = new Date(data.start_at)
  const endDate = new Date(data.end_at)
  return endDate > startDate
}, {
  message: "Data de fim deve ser posterior à data de início",
  path: ["end_at"]
})

// Schema para validação de múltiplas ocorrências
export const occurrencesSchema = z.object({
  event_id: z.string().min(1, "Evento é obrigatório"),
  occurrences: z.array(occurrenceFormSchema)
    .min(1, "Pelo menos uma ocorrência é obrigatória")
    .max(10, "Máximo de 10 ocorrências por evento")
})

// Tipos inferidos dos schemas
export type OccurrenceFormData = z.infer<typeof occurrenceFormSchema>
export type OccurrenceData = z.infer<typeof occurrenceSchema>
export type OccurrencesData = z.infer<typeof occurrencesSchema>

// Função para validar UF
export function validateUF(uf: string): boolean {
  return ufSchema.safeParse(uf).success
}

// Função para validar data/hora
export function validateDateTime(dateTime: string): boolean {
  return dateTimeSchema.safeParse(dateTime).success
}

// Função para validar ocorrência
export function validateOccurrence(data: any): { success: boolean; errors?: Record<string, string[]> } {
  const result = occurrenceFormSchema.safeParse(data)
  
  if (result.success) {
    return { success: true }
  }
  
  const errors: Record<string, string[]> = {}
  result.error.errors.forEach((error) => {
    const path = error.path.join('.')
    if (!errors[path]) {
      errors[path] = []
    }
    errors[path].push(error.message)
  })
  
  return { success: false, errors }
}
