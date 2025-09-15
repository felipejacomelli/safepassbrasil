// Configuração da API para integração com o backend Django

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

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
    return apiRequest<{ success: boolean; message: string; remaining_tickets?: number }>(`/event_app/events/${eventId}/purchase/`, {
      method: 'POST',
      body: JSON.stringify({ quantity }),
    });
  },

  sellTickets: async (eventId: string | number, ticketData: {
    quantity: number;
    price: number;
    ticket_type?: string;
    description?: string;
  }): Promise<{ success: boolean; message: string; total_tickets?: number }> => {
    return apiRequest<{ success: boolean; message: string; total_tickets?: number }>(`/event_app/events/${eventId}/sell/`, {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  }
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