// Configuração da API para integração com o backend Django

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
  cpf?: string;
  country?: string;
  location?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  country?: string;
  cpf?: string;
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  created_at?: string;
  cpf?: string;
  country?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  phone?: string
  location?: string
  cpf?: string
  country?: string
}

// Tipos para os dados da API
export interface ApiEvent {
  id: string;
  name: string;
  image: string;
  date: string;
  location: string;
  price: string;
  slug: string;
  ticket_count: number;
  total_available_tickets: number;
  description?: string;
  category?: string;
  status: 'open' | 'closed';
  active: boolean;
  created_at: string;
  closing_date: string;
}

// Interface para o frontend
export interface Event {
  id: string;
  image: string;
  title: string;
  date: string;
  location: string;
  price: string;
  slug: string;
  category: string;
  city: string;
  ticket_count: number;
  total_available_tickets: number;
}

// Tipos para Occurrences
export interface ApiOccurrence {
  id: string;
  event_id: string;
  start_at: string;
  end_at?: string;
  uf?: string;
  state?: string;
  city?: string;
  max_capacity?: number;
  available_tickets: number;
  status: 'active' | 'inactive' | 'sold_out';
  created_at: string;
  updated_at: string;
}

// Tipos para Ticket Types
export interface ApiTicketType {
  id: string;
  occurrence_id: string;
  name: string;
  description?: string;
  price: string;
  quantity_available: number;
  quantity_sold: number;
  max_per_order?: number;
  sale_start_date?: string;
  sale_end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Tipo para evento com occurrences
export interface ApiEventWithOccurrences extends ApiEvent {
  occurrences: ApiOccurrence[];
}

// Tipo para occurrence com ticket types
export interface ApiOccurrenceWithTickets extends ApiOccurrence {
  ticket_types: ApiTicketType[];
  event: ApiEvent;
}

// Função para fazer requisições HTTP
export const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  // Verificar se estamos no lado do cliente antes de acessar localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Token ${token}` }),
    ...options.headers,
  };

  const url = endpoint.startsWith('/api/') ? `${API_BASE_URL}${endpoint}` : `${API_BASE_URL}/api${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
};

// Função auxiliar para fazer requisições que retornam JSON
async function apiRequestJson<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await apiRequest(endpoint, options);
  
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    
    // Tentar extrair detalhes do erro da resposta
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }
    } catch (parseError) {
      // Se não conseguir fazer parse, usar a mensagem padrão
      console.warn('Erro ao fazer parse da resposta de erro:', parseError);
    }
    
    const error = new Error(errorMessage);
    (error as any).response = response;
    (error as any).status = response.status;
    throw error;
  }
  
  // Verificar se a resposta tem conteúdo JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    // Se não é JSON, retornar um objeto vazio ou a resposta como texto
    const text = await response.text();
    if (!text.trim()) {
      // Resposta vazia - retornar objeto vazio para POST/PUT que podem não retornar dados
      return {} as T;
    }
    // Tentar fazer parse mesmo assim, caso o content-type esteja incorreto
    try {
      return JSON.parse(text) as T;
    } catch {
      // Se falhar, retornar como objeto com a resposta de texto
      return { success: true, message: text } as T;
    }
  }
  
  try {
    const result = await response.json();
    return result;
  } catch (parseError) {
    console.error('Erro ao fazer parse do JSON da resposta:', parseError);
    // Se falhar ao fazer parse, retornar um objeto indicando sucesso
    return { success: true, message: 'Operação realizada com sucesso' } as T;
  }
}

// Interface para a resposta da API de eventos
interface EventsResponse {
  events: ApiEvent[];
  count: number;
}

// Funções específicas para eventos
export const eventsApi = {
  // Listar todos os eventos com occurrences futuras
  getAll: async (): Promise<ApiEventWithOccurrences[]> => {
    const response = await apiRequestJson<ApiEventWithOccurrences[]>('/ticket_app/events/with_upcoming_occurrences/');
    return response;
  },
  
  // Buscar evento por ID
  getById: (id: string): Promise<ApiEvent> => {
    return apiRequestJson<ApiEvent>(`/event_app/events/${id}/`);
  },
  
  // Buscar evento com suas occurrences
  getWithOccurrences: (eventId: string): Promise<ApiEventWithOccurrences> => {
    return apiRequestJson<ApiEventWithOccurrences>(`/event_app/events/${eventId}/occurrences/`);
  },
  
  // Buscar eventos filtrados
  getFiltered: (filters: Record<string, string>): Promise<ApiEvent[]> => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequestJson<ApiEvent[]>(`/event_app/events/by/?${queryParams}`);
  },

  // Buscar eventos com filtros de busca
  search: async (params: {
    q?: string;
    category?: string;
    location?: string;
    date?: string;
  }): Promise<EventsResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params.q) queryParams.append('q', params.q);
    if (params.category) queryParams.append('category', params.category);
    if (params.location) queryParams.append('location', params.location);
    if (params.date) queryParams.append('date', params.date);
    
    const queryString = queryParams.toString();
    const endpoint = `/api/events/events/search/${queryString ? `?${queryString}` : ''}`;
    return apiRequestJson<EventsResponse>(endpoint);
  },

  // Função de busca simples para compatibilidade
  searchSimple: async (query: string): Promise<Event[]> => {
    const response = await fetch(`${API_BASE_URL}/api/events/search/?${query}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.events ? data.events.map(transformEventForFrontend) : [];
  },

  // Buscar evento por slug com suas ocorrências
  getBySlug: async (slug: string): Promise<ApiEventWithOccurrences> => {
    // Buscar o evento com suas ocorrências diretamente pelo slug
    const eventWithOccurrences = await apiRequestJson<ApiEventWithOccurrences>(`/api/events/events/${slug}/`);
    
    return eventWithOccurrences;
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

    return apiRequestJson<{ success: boolean; message: string; remaining_tickets?: number }>(`/event_app/events/${eventId}/purchase/`, {
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
    // Obter user_id do localStorage (mesmo padrão usado em purchaseTickets)
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
    
    const requestData = {
      ...ticketData,
      user_id: userId
    };

    return apiRequestJson<{ success: boolean; message: string; total_tickets?: number }>(`/event_app/events/${eventId}/sell/`, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }
};

// API para Occurrences
export const occurrencesApi = {
  // Buscar occurrence com tickets
  getWithTickets: (occurrenceId: string): Promise<ApiOccurrenceWithTickets> => {
    return apiRequestJson<ApiOccurrenceWithTickets>(`/events/occurrences/${occurrenceId}/`);
  },

  // Buscar occurrences por evento
  getByEvent: (eventId: string): Promise<ApiOccurrence[]> => {
    return apiRequestJson<ApiOccurrence[]>(`/event_app/events/${eventId}/occurrences/`);
  },

  // Reservar ingressos para uma occurrence
  reserveTickets: async (occurrenceId: string, ticketTypeId: string, quantity: number): Promise<{ success: boolean; message: string; reservation_id?: string }> => {
    try {
      const response = await apiRequestJson<{ success: boolean; message: string; reservation_id?: string }>(`/occurrence_app/occurrences/${occurrenceId}/reserve/`, {
        method: 'POST',
        body: JSON.stringify({
          ticket_type_id: ticketTypeId,
          quantity: quantity
        })
      });
      
      return response;
    } catch (error) {
      console.error('Erro ao reservar ingressos:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  },
};

// API de autenticação
export const authApi = {
  // Login do usuário
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiRequestJson<LoginResponse>('/user/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Registro de novo usuário
  register: async (userData: RegisterRequest): Promise<LoginResponse> => {
    return apiRequestJson<LoginResponse>('/user/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Obter perfil do usuário autenticado
  getProfile: async (): Promise<ApiUser> => {
    return apiRequestJson<ApiUser>('/profile');
  },

  // Atualizar perfil do usuário autenticado
  updateProfile: async (userData: UpdateUserRequest): Promise<ApiUser> => {
    return apiRequestJson<ApiUser>('/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  getLoginHistory: async (): Promise<any[]> => {
    return apiRequestJson<any[]>('/user_app/user/login_history');
  },

  get2FAStatus: async (): Promise<{is_2fa_enabled: boolean}> => {
    return apiRequestJson<{is_2fa_enabled: boolean}>('/user_app/user/2fa/status');
  },

  setup2FA: async (): Promise<{secret: string, otpauth_url: string}> => {
    return apiRequestJson<{secret: string, otpauth_url: string}>('/user_app/user/2fa/setup', { method: 'POST' });
  },

  verify2FA: async (code: string): Promise<{success: boolean, backup_codes?: string[]}> => {
    return apiRequestJson<{success: boolean, backup_codes?: string[]}>('/user_app/user/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  disable2FA: async (): Promise<{success: boolean}> => {
    return apiRequestJson<{success: boolean}>('/user_app/user/2fa/disable', { method: 'POST' });
  },

  getBackupCodes: async (): Promise<{backup_codes: string[]}> => {
    return apiRequestJson<{backup_codes: string[]}>('/user_app/user/2fa/backup_codes');
  },

  regenerateBackupCodes: async (): Promise<{backup_codes: string[]}> => {
    return apiRequestJson<{backup_codes: string[]}>('/user_app/user/2fa/backup_codes', { method: 'POST' });
  },

  logout: async (): Promise<{success: boolean}> => {
    return apiRequestJson<{success: boolean}>('/user/logout', { method: 'POST' });
  },
};

// Tipos para Admin APIs
export interface AdminUser extends ApiUser {
  status: 'active' | 'inactive';
  role: 'admin' | 'user' | 'moderator';
  last_login?: string;
  is_active: boolean;
  active: boolean; // Campo adicional do backend
  date_joined: string;
  created_at: string; // Campo adicional do backend
}

export interface AdminOrder {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    cpf?: string;
    location?: string;
    country?: string;
  };
  total_amount: string;
  status: number;
  created_at: string;
  updated_at: string;
  transaction: {
    id: string;
    status: string;
    payment_method: string;
  };
}

export interface AdminDashboardStats {
  total_users: number;
  total_events: number;
  total_orders: number;
  total_revenue: string;
  orders_by_status: Record<string, number>;
  revenue_by_status: Record<string, string>;
}

export interface AdminEventFormData {
  name: string;
  description?: string;
  location?: string;
  date?: string;
  price?: string;
  category?: string;
  image?: string;
  ticket_count?: number;
  status: 'open' | 'closed';
  active: boolean;
}

// APIs Administrativas
export const adminApi = {
  // Dashboard
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const [orderSummary, eventResponse, userResponse] = await Promise.all([
      apiRequestJson<AdminDashboardStats>('/orders/summary/'),
      apiRequestJson<{count: number, results: any[]}>('/events/events/'),
      apiRequestJson<{count: number, results: any[]}>('/users')
    ]);
    
    return {
      ...orderSummary,
      total_events: eventResponse.count,
      total_users: userResponse.count,
    };
  },

  // Settings
  settings: {
    get: async () => {
      return await apiRequest('/settings/');
    },
    update: async (type: string, data: any) => {
      return await apiRequestJson('/settings/', {
        method: 'PUT',
        body: JSON.stringify({ type, data })
      });
    },
    testEmail: async (email?: string) => {
      return await apiRequestJson('/settings/test-email/', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
    },
    backup: async () => {
      return await apiRequest('/settings/backup/');
    }
  },

  // Usuários
  users: {
    getAll: async (params?: Record<string, string>): Promise<{users: AdminUser[], count: number}> => {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiRequestJson<{users: AdminUser[], count: number}>(`/users${queryString}`);
    },

    getById: async (id: string): Promise<AdminUser> => {
      return apiRequestJson<AdminUser>(`/user/${id}`);
    },

    create: async (userData: Partial<AdminUser>): Promise<AdminUser> => {
      return apiRequestJson<AdminUser>('/user', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    },

    update: async (id: string, userData: Partial<AdminUser>): Promise<AdminUser> => {
      return apiRequestJson<AdminUser>(`/user/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
    },

    delete: async (id: string): Promise<void> => {
      await apiRequest(`/user/${id}`, { method: 'DELETE' });
    },
  },

  // Eventos
  events: {
    getAll: async (params?: Record<string, string>): Promise<{events: ApiEvent[], count: number}> => {
      // Adiciona page_size=100 por padrão para buscar mais eventos
      const defaultParams = { page_size: '100', ...params };
      const queryString = '?' + new URLSearchParams(defaultParams).toString();
      const response = await apiRequestJson<{results: ApiEvent[], count: number}>(`/events/events/${queryString}`);
      // Transform the response to match the expected format
      return {
        events: response.results,
        count: response.count
      };
    },

    getById: (id: string): Promise<ApiEvent> => {
      return apiRequestJson<ApiEvent>(`/events/events/${id}/`);
    },

    create: async (eventData: AdminEventFormData): Promise<ApiEvent> => {
      return apiRequestJson<ApiEvent>('/events/events/', {
        method: 'POST',
        body: JSON.stringify(eventData),
      });
    },

    update: async (id: string, eventData: Partial<AdminEventFormData>): Promise<ApiEvent> => {
      return apiRequestJson<ApiEvent>(`/events/events/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(eventData),
      });
    },

    delete: async (id: string): Promise<void> => {
      await apiRequest(`/events/events/${id}/`, { method: 'DELETE' });
    },
  },

  // Pedidos
  orders: {
    getAll: async (params?: Record<string, string>): Promise<{orders: AdminOrder[], count: number}> => {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiRequestJson<{orders: AdminOrder[], count: number}>(`/orders${queryString}`);
    },

    getById: async (id: string): Promise<AdminOrder> => {
      return apiRequestJson<AdminOrder>(`/order?id=${id}`);
    },

    getDetails: async (id: string): Promise<{order: AdminOrder, transaction: any, tickets: any[], total_tickets: number}> => {
      return apiRequestJson<{order: AdminOrder, transaction: any, tickets: any[], total_tickets: number}>(`/orders/${id}/details/`);
    },

    cancel: async (id: string): Promise<{success: boolean, message: string}> => {
      return apiRequestJson<{success: boolean, message: string}>(`/orders/${id}/cancel/`, {
        method: 'POST',
      });
    },

    getSummary: async (): Promise<AdminDashboardStats> => {
      return apiRequestJson<AdminDashboardStats>('/orders/summary/');
    },
  },

  // Transações
  transactions: {
    getAll: async (params?: Record<string, string>): Promise<{Transaction: any[], count?: number}> => {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiRequestJson<{Transaction: any[], count?: number}>(`/transactions${queryString}`);
    },

    getById: async (id: string): Promise<any> => {
      return apiRequestJson<any>(`/transaction?id=${id}`);
    },
  },

  // Tickets
  tickets: {
    getAll: async (params?: Record<string, string>): Promise<{tickets: any[]}> => {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiRequestJson<{tickets: any[]}>(`/tickets${queryString}`);
    },

    getSold: async (): Promise<{tickets: any[]}> => {
      return apiRequestJson<{tickets: any[]}>('/tickets/sold');
    },
  },
};

// Função para transformar dados da API para o formato esperado pelo frontend
export function transformEventForFrontend(apiEvent: ApiEvent): Event {
  return {
    id: apiEvent.id,
    image: apiEvent.image || '',
    title: apiEvent.name || '',
    date: apiEvent.date || '',
    location: apiEvent.location || '',
    price: apiEvent.price || '',
    slug: apiEvent.slug || '',
    category: apiEvent.category || '',
    city: apiEvent.location?.split(',').pop()?.trim() || '',
    ticket_count: apiEvent.ticket_count || 0,
    total_available_tickets: apiEvent.total_available_tickets || 0
  };
}

// Tipos para Mercado Pago
export interface MercadoPagoConfig {
  enabled: boolean;
  public_key: string;
  sandbox_mode: boolean;
}

export interface PaymentRequest {
  amount: number;
  description: string;
  payment_method_id?: string;
  token?: string;
  installments?: number;
  issuer_id?: string;
  payer?: {
    email: string;
    identification?: {
      type: string;
      number: string;
    };
  };
}

export interface PaymentResponse {
  id: string;
  status: string;
  status_detail: string;
  payment_method_id: string;
  payment_type_id: string;
  transaction_amount: number;
  date_created: string;
}

// API do Mercado Pago
export const mercadoPagoApi = {
  // Obter configurações do Mercado Pago
  getConfig: async (): Promise<MercadoPagoConfig> => {
    return apiRequestJson<MercadoPagoConfig>('/payment/mercadopago/config/');
  },
  
  processPayment: async (paymentData: PaymentRequest): Promise<PaymentResponse> => {
    return apiRequestJson<PaymentResponse>('/payment/mercadopago/process/', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },
  
  getPaymentMethods: async (): Promise<any[]> => {
    return apiRequestJson<any[]>('/payment/mercadopago/payment-methods/');
  },
  
  getIssuers: async (paymentMethodId: string): Promise<any[]> => {
    return apiRequestJson<any[]>(`/payment/mercadopago/issuers/?payment_method_id=${paymentMethodId}`);
  },

  getInstallments: async (amount: number, paymentMethodId: string, issuerId?: string): Promise<any[]> => {
    const params = new URLSearchParams({
      amount: amount.toString(),
      payment_method_id: paymentMethodId,
    });
    
    if (issuerId) {
      params.append('issuer_id', issuerId);
    }
    
    return apiRequestJson<any[]>(`/payment/mercadopago/installments/?${params.toString()}`);
  },
};