"use client"

import { useState, useCallback } from 'react'
import { uploadDisputeEvidence } from '@/lib/upload'

// Tipos para disputas
export interface CreateDisputeData {
  escrow_transaction: string
  dispute_type: string
  description: string
  evidence: string[]
  disputed_amount: number
}

export interface Dispute {
  id: string
  dispute_type: string
  status: 'awaiting_seller_response' | 'under_review' | 'escalated' | 'resolved' | 'closed' | 'cancelled'
  disputed_amount: number
  created_at: string
  order_id: string
  description: string
  evidence: string[]
  seller_response?: string
  seller_evidence?: string[]
  resolution?: string
  resolution_notes?: string
  messages_count: number
  seller_response_deadline?: string  // NOVO
  escalated_at?: string  // NOVO
}

export interface EscrowTransaction {
  id: string
  order_id: string
  locked_amount: number
  status: 'locked' | 'released' | 'refunded' | 'disputed'
  created_at: string
  expires_at: string
}

export function useDisputes() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Obter token de autenticação
  const getAuthToken = useCallback(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('authToken')
  }, [])

  // Fazer requisição autenticada
  const makeAuthenticatedRequest = useCallback(async (
    url: string, 
    options: RequestInit = {}
  ) => {
    const token = getAuthToken()
    if (!token) {
      throw new Error('Token de autenticação não encontrado')
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const response = await fetch(`${apiUrl}${url}`, {
      ...options,
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Erro: ${response.status}`)
    }

    return response.json()
  }, [getAuthToken])

  // Buscar escrow_transaction por order_id
  const getEscrowByOrderId = useCallback(async (orderId: string): Promise<EscrowTransaction | null> => {
    try {
      setLoading(true)
      setError(null)

      const data = await makeAuthenticatedRequest(`/api/escrow/transactions/?order=${orderId}`)
      
      // A API pode retornar um array ou objeto único
      const escrow = Array.isArray(data) ? data[0] : data
      
      if (!escrow || !escrow.id) {
        return null
      }

      return escrow
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar escrow'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [makeAuthenticatedRequest])

  // Upload de evidência individual
  const uploadEvidence = useCallback(async (file: File): Promise<string> => {
    try {
      setLoading(true)
      setError(null)

      const result = await uploadDisputeEvidence(file)
      
      if (!result.success) {
        throw new Error(result.error || 'Erro no upload')
      }

      return result.url!
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro no upload'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  // Criar nova disputa
  const createDispute = useCallback(async (data: CreateDisputeData): Promise<Dispute> => {
    try {
      setLoading(true)
      setError(null)

      const result = await makeAuthenticatedRequest('/api/escrow/disputes/', {
        method: 'POST',
        body: JSON.stringify(data),
      })

      if (!result.success) {
        throw new Error(result.error || 'Erro ao criar disputa')
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar disputa'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [makeAuthenticatedRequest])

  // Listar disputas do usuário
  const getUserDisputes = useCallback(async (): Promise<Dispute[]> => {
    try {
      setLoading(true)
      setError(null)

      const result = await makeAuthenticatedRequest('/api/escrow/disputes/')
      
      return result.disputes || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar disputas'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [makeAuthenticatedRequest])

  // Buscar disputa por ID
  const getDisputeById = useCallback(async (disputeId: string): Promise<Dispute> => {
    try {
      setLoading(true)
      setError(null)

      const result = await makeAuthenticatedRequest(`/api/escrow/disputes/${disputeId}/`)
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar disputa'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [makeAuthenticatedRequest])

  // Validar se ticket pode ter disputa
  const validateTicketForDispute = useCallback(async (ticketId: string, orderId: string): Promise<{
    canCreateDispute: boolean
    escrow?: EscrowTransaction
    error?: string
  }> => {
    try {
      // Buscar escrow do pedido
      const escrow = await getEscrowByOrderId(orderId)
      
      if (!escrow) {
        return {
          canCreateDispute: false,
          error: 'Este pedido não possui escrow ativo'
        }
      }

      // Verificar se escrow está locked
      if (escrow.status !== 'locked') {
        return {
          canCreateDispute: false,
          error: 'Escrow não está bloqueado. Status atual: ' + escrow.status
        }
      }

      // Verificar se já existe disputa para este escrow
      try {
        const disputes = await getUserDisputes()
        const existingDispute = disputes.find(d => d.order_id === orderId)
        
        if (existingDispute) {
          return {
            canCreateDispute: false,
            error: 'Já existe uma disputa para este pedido'
          }
        }
      } catch {
        // Se não conseguir buscar disputas, continuar (pode ser problema de permissão)
      }

      return {
        canCreateDispute: true,
        escrow
      }
    } catch (err) {
      return {
        canCreateDispute: false,
        error: err instanceof Error ? err.message : 'Erro ao validar ticket'
      }
    }
  }, [getEscrowByOrderId, getUserDisputes])

  // Cancelar disputa
  const cancelDispute = useCallback(async (disputeId: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      const result = await makeAuthenticatedRequest(`/api/escrow/disputes/${disputeId}/cancel/`, {
        method: 'POST',
      })

      if (!result.success) {
        throw new Error(result.error || 'Erro ao cancelar disputa')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao cancelar disputa'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [makeAuthenticatedRequest])

  return {
    loading,
    error,
    getEscrowByOrderId,
    uploadEvidence,
    createDispute,
    getUserDisputes,
    getDisputeById,
    validateTicketForDispute,
    cancelDispute,  // NOVO
  }
}
