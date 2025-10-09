import { useState, useCallback } from 'react'
import { Occurrence, OccurrenceFormData, OccurrenceValidationErrors } from '@/lib/types/occurrence'
import { validateOccurrence } from '@/lib/schemas/occurrence'

interface UseOccurrencesProps {
  initialOccurrences?: OccurrenceFormData[]
  onError?: (error: string) => void
  onSuccess?: (message: string) => void
}

export function useOccurrences({ 
  initialOccurrences = [], 
  onError, 
  onSuccess 
}: UseOccurrencesProps = {}) {
  const [occurrences, setOccurrences] = useState<OccurrenceFormData[]>(
    initialOccurrences.length > 0 ? initialOccurrences : [{
      start_at: '',
      end_at: '',
      uf: '',
      state: '',
      city: ''
    }]
  )
  
  const [errors, setErrors] = useState<Record<number, OccurrenceValidationErrors>>({})
  const [isValidating, setIsValidating] = useState(false)

  // Adicionar nova ocorrência
  const addOccurrence = useCallback(() => {
    setOccurrences(prev => [...prev, {
      start_at: '',
      end_at: '',
      uf: '',
      state: '',
      city: ''
    }])
  }, [])

  // Remover ocorrência
  const removeOccurrence = useCallback((index: number) => {
    if (occurrences.length > 1) {
      setOccurrences(prev => prev.filter((_, i) => i !== index))
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[index]
        // Reindexar erros
        const reindexed: Record<number, OccurrenceValidationErrors> = {}
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
  }, [occurrences.length])

  // Atualizar ocorrência
  const updateOccurrence = useCallback((index: number, field: keyof OccurrenceFormData, value: string) => {
    setOccurrences(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
    
    // Limpar erro do campo específico
    setErrors(prev => {
      const newErrors = { ...prev }
      if (newErrors[index] && newErrors[index][field]) {
        delete newErrors[index][field]
      }
      return newErrors
    })
  }, [])

  // Validar ocorrência específica
  const validateOccurrenceAtIndex = useCallback((index: number): boolean => {
    const occurrence = occurrences[index]
    if (!occurrence) return false

    const validation = validateOccurrence(occurrence)
    
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
  }, [occurrences])

  // Validar todas as ocorrências
  const validateAllOccurrences = useCallback((): boolean => {
    setIsValidating(true)
    
    let allValid = true
    const newErrors: Record<number, OccurrenceValidationErrors> = {}

    occurrences.forEach((occurrence, index) => {
      const validation = validateOccurrence(occurrence)
      
      if (!validation.success) {
        allValid = false
        newErrors[index] = validation.errors || {}
      }
    })

    setErrors(newErrors)
    setIsValidating(false)
    
    return allValid
  }, [occurrences])

  // Limpar erros
  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  // Resetar formulário
  const resetForm = useCallback(() => {
    setOccurrences([{
      start_at: '',
      end_at: '',
      uf: '',
      state: '',
      city: ''
    }])
    setErrors({})
  }, [])

  // Obter erro de campo específico
  const getFieldError = useCallback((index: number, field: keyof OccurrenceFormData): string | undefined => {
    return errors[index]?.[field]?.[0]
  }, [errors])

  // Verificar se há erros
  const hasErrors = useCallback((): boolean => {
    return Object.keys(errors).length > 0
  }, [errors])

  return {
    occurrences,
    errors,
    isValidating,
    addOccurrence,
    removeOccurrence,
    updateOccurrence,
    validateOccurrenceAtIndex,
    validateAllOccurrences,
    clearErrors,
    resetForm,
    getFieldError,
    hasErrors
  }
}







