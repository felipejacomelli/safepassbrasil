// Configuração da API para integração com o backend Django

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// Tipos para autenticação
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  id: string;
  email: string;
  name: string;
  phone?: string;
  created_at?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  created_at?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
}

// Tipos para os dados da API
export interface ApiEvent {
  id: number;
  name: string;
  image: string;
  date: string;
  location: string;
  price: string;
  slug: string;
  ticket_count: number;
  description?: string;
  category?: string;
  status: 'open' | 'closed';
  active: boolean;
  created_at: string;
  closing_date: string;
}

// Interface para o frontend
export interface Event {
  image: string;
  title: string;
  date: string;
  location: string;
  price: string;
  slug: string;
  category: string;
  city: string;
  ticket_count: number;
}

// Função para fazer requisições HTTP
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Adicionar token de autenticação se disponível
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Token ${token}`,
      };
    }
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Interface para a resposta da API de eventos
interface EventsResponse {
  events: ApiEvent[];
  count: number;
}

// Funções específicas para eventos
export const eventsApi = {
  // Listar todos os eventos
  getAll: async (): Promise<ApiEvent[]> => {
    const response = await apiRequest<EventsResponse>('/event_app/events');
    return response.events;
  },
  
  // Buscar evento por ID
  getById: (id: number): Promise<ApiEvent> => {
    return apiRequest<ApiEvent>(`/event_app/event?id=${id}`);
  },

  getBySlug: (slug: string): Promise<ApiEvent> => {
    return apiRequest<ApiEvent>(`/event_app/event/${slug}/`);
  },
  
  // Buscar eventos filtrados
  getFiltered: (filters: Record<string, string>): Promise<ApiEvent[]> => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest<ApiEvent[]>(`/event_app/events/by/?${queryParams}`);
  },

  // Buscar eventos com filtros de busca
  search: async (params: {
    q?: string;
    category?: string;
    location?: string;
  }): Promise<EventsResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params.q) queryParams.append('q', params.q);
    if (params.category) queryParams.append('category', params.category);
    if (params.location) queryParams.append('location', params.location);
    
    const queryString = queryParams.toString();
    const endpoint = `/event_app/events/search/${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<EventsResponse>(endpoint);
  },

  // Purchase tickets and update event ticket count
  purchaseTickets: async (eventId: string | number, quantity: number): Promise<{ success: boolean; message: string; remaining_tickets?: number }> => {
    // Get user ID from localStorage
    let userId = 1; // Default fallback
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          userId = parseInt(user.id) || 1;
        } catch (e) {
          console.warn('Failed to parse user from localStorage:', e);
        }
      }
    }

    return apiRequest<{ success: boolean; message: string; remaining_tickets?: number }>(`/event_app/events/${eventId}/purchase/`, {
      method: 'POST',
      body: JSON.stringify({ quantity, user_id: userId }),
    });
  },

  sellTickets: async (eventId: string | number, ticketData: {
    quantity: number;
    price: number;
    ticket_type?: string;
    description?: string;
  }): Promise<{ success: boolean; message: string; total_tickets?: number }> => {
    // Obter user_id do localStorage
    const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
    
    const requestData = {
      ...ticketData,
      user_id: userId ? parseInt(userId) : null
    };

    return apiRequest<{ success: boolean; message: string; total_tickets?: number }>(`/event_app/events/${eventId}/sell/`, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }
};

// API de autenticação
export const authApi = {
  // Login do usuário
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>('/user_app/user/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Registro de novo usuário
  register: async (userData: RegisterRequest): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>('/user_app/user/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Obter perfil do usuário autenticado
  getProfile: async (): Promise<ApiUser> => {
    return apiRequest<ApiUser>('/user_app/profile');
  },

  // Atualizar perfil do usuário autenticado
  updateProfile: async (userData: UpdateUserRequest): Promise<ApiUser> => {
    return apiRequest<ApiUser>('/user_app/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  getLoginHistory: async (): Promise<any[]> => {
    return apiRequest<any[]>('/user_app/user/login_history');
  },

  get2FAStatus: async (): Promise<{is_2fa_enabled: boolean}> => {
    return apiRequest<{is_2fa_enabled: boolean}>('/user_app/user/2fa/status');
  },

  setup2FA: async (): Promise<{secret: string, otpauth_url: string}> => {
    return apiRequest<{secret: string, otpauth_url: string}>('/user_app/user/2fa/setup', { method: 'POST' });
  },

  verify2FA: async (code: string): Promise<{success: boolean, backup_codes?: string[]}> => {
    return apiRequest<{success: boolean, backup_codes?: string[]}>('/user_app/user/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  disable2FA: async (): Promise<{success: boolean}> => {
    return apiRequest<{success: boolean}>('/user_app/user/2fa/disable', { method: 'POST' });
  },

  getBackupCodes: async (): Promise<{backup_codes: string[]}> => {
    return apiRequest<{backup_codes: string[]}>('/user_app/user/2fa/backup_codes');
  },

  regenerateBackupCodes: async (): Promise<{backup_codes: string[]}> => {
    return apiRequest<{backup_codes: string[]}>('/user_app/user/2fa/backup_codes', { method: 'POST' });
  },
};

// Função para transformar dados da API para o formato esperado pelo frontend
export function transformEventForFrontend(apiEvent: ApiEvent): Event {
  return {
    image: apiEvent.image || '',
    title: apiEvent.name || '',
    date: apiEvent.date || '',
    location: apiEvent.location || '',
    price: apiEvent.price || '',
    slug: apiEvent.slug || '',
    category: apiEvent.category || '',
    city: apiEvent.location?.split(',').pop()?.trim() || '',
    ticket_count: apiEvent.ticket_count || 0
  };
}