// Tipos para Ocorrências - Estrutura consistente com backend
export interface Occurrence {
  id?: string
  event_id: string
  start_at: string
  end_at: string
  uf: string
  state: string
  city: string
  status?: 'ACTIVE' | 'INACTIVE'
  created_at?: string
  updated_at?: string
}

export interface Event {
  id: string
  name: string
  description?: string
  active?: boolean
  created_at?: string
}

export interface OccurrenceFormData {
  start_at: string
  end_at: string
  uf: string
  state: string
  city: string
}

export interface OccurrenceValidationErrors {
  event_id?: string[]
  start_at?: string[]
  end_at?: string[]
  uf?: string[]
  state?: string[]
  city?: string[]
  general?: string[]
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

export interface OccurrenceCreateRequest {
  event: string
  start_at: string
  end_at: string
  uf: string
  state: string
  city: string
}

export interface OccurrenceCreateResponse {
  id: string
  event: string
  start_at: string
  end_at: string
  uf: string
  state: string
  city: string
  status: string
  created_at: string
  updated_at: string
}
