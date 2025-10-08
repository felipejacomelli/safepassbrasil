import { useState, useCallback } from 'react'

export interface TicketTypeFormData {
  id?: string
  occurrence_id?: string
  name: string
  description: string
  price: string
}

export interface TicketTypeValidationErrors {
  name?: string[]
  description?: string[]
  price?: string[]
}

interface UseTicketTypesProps {
  initialTicketTypes?: TicketTypeFormData[]
  onError?: (error: string) => void
  onSuccess?: (message: string) => void
}

export function useTicketTypes({ 
  initialTicketTypes = [], 
  onError, 
  onSuccess 
}: UseTicketTypesProps = {}) {
  const [ticketTypes, setTicketTypes] = useState<TicketTypeFormData[]>(
    initialTicketTypes.length > 0 ? initialTicketTypes : [{
      name: "",
      description: "",
      price: "",
    }]
  )
  
  const [errors, setErrors] = useState<Record<number, TicketTypeValidationErrors>>({})
  const [isValidating, setIsValidating] = useState(false)

  // Adicionar novo tipo de ingresso
  const addTicketType = useCallback(() => {
    setTicketTypes(prev => [...prev, {
      name: "",
      description: "",
      price: "",
    }])
  }, [])

  // Remover tipo de ingresso
  const removeTicketType = useCallback((index: number) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(prev => prev.filter((_, i) => i !== index))
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[index]
        // Reindexar erros
        const reindexed: Record<number, TicketTypeValidationErrors> = {}
        Object.keys(newErrors).forEach(key => {
          const oldIndex = parseInt(key)
          if (oldIndex > index) {
            reindexed[oldIndex - 1] = newErrors[oldIndex]
          } else if (oldIndex < index) {
            reindexed[oldIndex] = newErrors[oldIndex]
          }
        })
        return reindexed
      })
    }
  }, [ticketTypes.length])

  // Atualizar tipo de ingresso
  const updateTicketType = useCallback((index: number, field: keyof TicketTypeFormData, value: string) => {
    setTicketTypes(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
    
    // Limpar erro do campo específico
    setErrors(prev => {
      const newErrors = { ...prev }
      if (newErrors[index] && field in newErrors[index]) {
        delete (newErrors[index] as any)[field]
      }
      return newErrors
    })
  }, [])

  // Validar tipo de ingresso específico
  const validateTicketTypeAtIndex = useCallback((index: number): boolean => {
    const ticketType = ticketTypes[index]
    if (!ticketType) return false

    const validation = validateTicketType(ticketType)
    
    if (validation.success) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[index]
        return newErrors
      })
      return true
    }

    setErrors(prev => ({
      ...prev,
      [index]: validation.errors || {}
    }))
    
    return false
  }, [ticketTypes])

  // Validar todas os tipos de ingressos
  const validateAllTicketTypes = useCallback((): boolean => {
    setIsValidating(true)
    
    let allValid = true
    const newErrors: Record<number, TicketTypeValidationErrors> = {}

    ticketTypes.forEach((ticketType, index) => {
      const validation = validateTicketType(ticketType)
      
      if (!validation.success) {
        allValid = false
        newErrors[index] = validation.errors || {}
      }
    })

    setErrors(newErrors)
    setIsValidating(false)
    
    return allValid
  }, [ticketTypes])

  // Limpar erros
  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  // Resetar formulário
  const resetForm = useCallback(() => {
    setTicketTypes([{
      name: "",
      description: "",
      price: "",
    }])
    setErrors({})
  }, [])

  // Obter erro de campo específico
  const getFieldError = useCallback((index: number, field: keyof TicketTypeFormData): string | undefined => {
    const validationFields: (keyof TicketTypeValidationErrors)[] = ['name', 'description', 'price']
    if (validationFields.includes(field as keyof TicketTypeValidationErrors)) {
      return errors[index]?.[field as keyof TicketTypeValidationErrors]?.[0]
    }
    return undefined
  }, [errors])

  // Verificar se há erros
  const hasErrors = useCallback((): boolean => {
    return Object.keys(errors).length > 0
  }, [errors])

  return {
    ticketTypes,
    errors,
    isValidating,
    addTicketType,
    removeTicketType,
    updateTicketType,
    validateTicketTypeAtIndex,
    validateAllTicketTypes,
    clearErrors,
    resetForm,
    getFieldError,
    hasErrors
  }
}

// Função de validação de tipo de ingresso
function validateTicketType(ticketType: TicketTypeFormData): {
  success: boolean
  errors?: TicketTypeValidationErrors
} {
  const errors: TicketTypeValidationErrors = {}

  // Validar nome
  if (!ticketType.name.trim()) {
    errors.name = ['Nome do ingresso é obrigatório']
  }

  // Validar preço
  if (!ticketType.price.trim()) {
    errors.price = ['Preço é obrigatório']
  } else {
    const price = parseFloat(ticketType.price)
    if (isNaN(price) || price <= 0) {
      errors.price = ['Preço deve ser um número válido maior que zero']
    }
  }

  // Validar descrição
  if (!ticketType.description.trim()) {
    errors.description = ['Descrição é obrigatória']
  }

  return {
    success: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined
  }
}