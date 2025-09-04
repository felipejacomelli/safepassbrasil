// Configuração da API para integração com o backend Django

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// Tipos para os dados da API
export interface Event {
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
  events: Event[];
  count: number;
}

// Funções específicas para eventos
export const eventsApi = {
  // Listar todos os eventos
  getAll: async (): Promise<Event[]> => {
    const response = await apiRequest<EventsResponse>('/event_app/events');
    return response.events;
  },
  
  // Buscar evento por ID
  getById: (id: number): Promise<Event> => {
    return apiRequest<Event>(`/event_app/event/${id}`);
  },
  
  // Buscar eventos filtrados
  getFiltered: (filters: Record<string, string>): Promise<Event[]> => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest<Event[]>(`/event_app/events/by/?${queryParams}`);
  },
};

// Função para transformar dados da API para o formato esperado pelo frontend
export function transformEventForFrontend(apiEvent: Event) {
  return {
    image: apiEvent.image || '',
    title: apiEvent.name,
    date: apiEvent.date || '',
    location: apiEvent.location || '',
    price: apiEvent.price || '',
    slug: apiEvent.slug || '',
    ticketCount: apiEvent.ticket_count || 0,
    description: apiEvent.description || '',
    category: apiEvent.category || '',
  };
}