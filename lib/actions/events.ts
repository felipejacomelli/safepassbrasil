"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { eventFormSchema, type EventFormData } from "@/lib/schemas"
import { adminApi } from "@/lib/api"

export type ActionState = {
  success?: boolean
  message?: string
  errors?: Record<string, string[]>
}

export async function createEvent(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    console.log("=== INÍCIO DA CRIAÇÃO DO EVENTO ===")
    
    // Log de todos os dados do FormData
    console.log("FormData entries:")
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value)
    }

    // Extrair dados do FormData
    const rawData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      image: formData.get("image") as string || "",
      organizer: formData.get("organizer") as string || "",
      contact_email: formData.get("contact_email") as string || "",
      contact_phone: formData.get("contact_phone") as string || "",
      website: formData.get("website") as string || "",
      age_restriction: (formData.get("age_restriction") as string) || "none",
      additional_info: formData.get("additional_info") as string || "",
      occurrences: JSON.parse(formData.get("occurrences") as string || "[]"),
    }

    console.log("Dados processados:", rawData)
    console.log("Ocorrências:", JSON.stringify(rawData.occurrences, null, 2))

    // Validar dados com Zod
    const validationResult = eventFormSchema.safeParse(rawData)
    
    if (!validationResult.success) {
      console.log("=== ERRO DE VALIDAÇÃO ===")
      console.log("Erros detalhados:", JSON.stringify(validationResult.error.errors, null, 2))
      
      const errors: Record<string, string[]> = {}
      
      validationResult.error.errors.forEach((error) => {
        const path = error.path.join(".")
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(error.message)
      })

      return {
        success: false,
        message: "Dados inválidos. Verifique os campos e tente novamente.",
        errors,
      }
    }

    const eventData = validationResult.data

    // Criar evento via API do backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/events/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // TODO: Adicionar token de autenticação quando implementado
        // "Authorization": `Token ${token}`,
      },
      body: JSON.stringify({
        name: eventData.name,
        description: eventData.description,
        category: eventData.category,
        image: eventData.image,
        organizer: eventData.organizer,
        contact_email: eventData.contact_email,
        contact_phone: eventData.contact_phone,
        website: eventData.website,
        age_restriction: eventData.age_restriction,
        additional_info: eventData.additional_info,
        active: true,
        status: "open",
        occurrences: eventData.occurrences,
        unique_tickets: eventData.unique_tickets,
      }),
    })

    console.log("Response status:", response.status)
    console.log("Response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.log("Error response text:", errorText)
      
      let errorData = {}
      try {
        errorData = JSON.parse(errorText)
      } catch (e) {
        console.log("Failed to parse error as JSON:", e)
      }
      
      if (response.status === 400) {
        // Erros de validação do backend
        const errors: Record<string, string[]> = {}
        
        Object.entries(errorData).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            errors[key] = value
          } else if (typeof value === "string") {
            errors[key] = [value]
          }
        })

        return {
          success: false,
          message: "Dados inválidos. Verifique os campos e tente novamente.",
          errors,
        }
      }

      return {
        success: false,
        message: response.status === 401 
          ? "Você não tem permissão para criar eventos. Faça login novamente."
          : "Erro ao criar evento. Tente novamente.",
      }
    }

    const createdEvent = await response.json()

    // Criar ocorrências para o evento
    for (const occurrence of eventData.occurrences) {
      const occurrenceResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/occurrences/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // TODO: Adicionar token de autenticação quando implementado
        },
        body: JSON.stringify({
          event: createdEvent.id,
          start_at: occurrence.start_at,
          end_at: occurrence.end_at,
          uf: occurrence.uf,
          state: occurrence.state,
          city: occurrence.city,
          address: occurrence.address,
          venue: occurrence.venue,
          status: "ACTIVE",
        }),
      })

      if (!occurrenceResponse.ok) {
        // Se falhar ao criar ocorrência, ainda consideramos sucesso parcial
        console.error("Erro ao criar ocorrência:", await occurrenceResponse.text())
        continue
      }

      const createdOccurrence = await occurrenceResponse.json()

      // Criar tipos de ingresso para a ocorrência
      for (const ticketType of occurrence.ticket_types) {
        const ticketTypeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ticket-types/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // TODO: Adicionar token de autenticação quando implementado
          },
          body: JSON.stringify({
            occurrence: createdOccurrence.id,
            name: ticketType.name,
            description: ticketType.description,
            price: ticketType.price,
            total_stock: ticketType.quantity,
            remaining_stock: ticketType.quantity,
            max_per_purchase: ticketType.max_per_purchase,
            status: "ACTIVE",
          }),
        })

        if (!ticketTypeResponse.ok) {
          console.error("Erro ao criar tipo de ingresso:", await ticketTypeResponse.text())
        }
      }
    }

    // Revalidar cache das páginas relacionadas
    revalidatePath("/admin/events")
    revalidatePath("/events")

    return {
      success: true,
      message: "Evento criado com sucesso!",
    }

  } catch (error) {
    console.error("Erro ao criar evento:", error)
    
    return {
      success: false,
      message: "Erro interno. Tente novamente mais tarde.",
    }
  }
}

export async function createEventAndRedirect(
  prevState: ActionState,
  formData: FormData
): Promise<never> {
  const result = await createEvent(prevState, formData)
  
  if (result.success) {
    redirect("/admin/events")
  }
  
  // Se chegou aqui, houve erro - retornar o estado de erro
  // Nota: Esta função nunca retorna devido ao redirect ou throw
  throw new Error(result.message || "Erro ao criar evento")
}