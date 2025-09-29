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
      category: formData.get("category") as string, // Nome da categoria
      category_id: formData.get("category_id") as string, // ID da categoria
      image: formData.get("image") as string,
    }

    console.log("Dados processados:", rawData)

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

    // Validações adicionais
    if (!eventData.image) {
      return {
        success: false,
        message: "A imagem é obrigatória para criar o evento.",
        errors: {
          image: ["A imagem é obrigatória"]
        }
      }
    }

    if (!eventData.category || !eventData.category_id) {
      return {
        success: false,
        message: "A categoria é obrigatória para criar o evento.",
        errors: {
          category: ["A categoria é obrigatória"]
        }
      }
    }

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
        category_name: eventData.category, // Nome da categoria para o backend
        image: eventData.image,
        active: true,
        status: "open",
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

    console.log("Evento criado com sucesso:", createdEvent)

    // Revalidar cache e redirecionar
    revalidatePath("/admin/events")

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