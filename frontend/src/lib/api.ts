import { buildServiceBase } from './runtime-api';
// src/lib/api.ts - Client API unifié Gateway (3001)
const API_GATEWAY = process.env.NEXT_PUBLIC_API_URL || buildServiceBase(3001);

// Offline mode flag - set to false for real backend
const OFFLINE_MODE = false;

interface ApiResponse<T> {
  data: T;
  error?: string;
}

// Récup token localStorage
const getAuthHeader = (): Record<string, string> | undefined => {
  if (typeof window === 'undefined') return undefined;
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

// Mock API responses for offline mode
function mockApiResponse<T>(endpoint: string): Promise<ApiResponse<T>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (endpoint.includes('/btp/api/stats')) {
        resolve({
          data: {
            totalChantiers: 2,
            chantiersEnCours: 1,
            totalMateriaux: 2,
            materiauxFaibleStock: 0,
            totalOuvriers: 2,
            ouvriersActifs: 2
          } as T,
          error: undefined
        });
      } else if (endpoint.includes('/btp/api/chantiers')) {
        resolve({
          data: [
            {
              id: 1,
              code_chantier: 'CH001',
              nom: 'Construction Immeuble A',
              adresse: '123 Rue de la Construction',
              client_nom: 'Client A',
              date_debut: '2024-01-01',
              date_fin_prevue: '2024-12-31',
              budget: 500000,
              statut: 'EN_COURS',
              date_creation: '2024-01-01',
              created_by: 'Admin'
            }
          ] as T,
          error: undefined
        });
      } else if (endpoint.includes('/auth/login')) {
        resolve({
          data: { token: 'mock-jwt-token', user: { id: 1, name: 'Admin' } } as T,
          error: undefined
        });
      } else {
        resolve({
          data: [] as T,
          error: undefined
        });
      }
    }, 500); // Simulate network delay
  });
}

// Fetch utilitaire avec error handling
interface ApiError {
  error: string;
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  // Offline mode - return mock data
  if (OFFLINE_MODE) {
    return mockApiResponse<T>(endpoint);
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    const authHeaders = getAuthHeader();
    if (authHeaders) Object.assign(headers, authHeaders);

    const response = await fetch(`${API_GATEWAY}${endpoint}`, {
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erreur réseau' }));
      return { data: null as T, error: error.error || `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { data, error: undefined };
  } catch (error) {
    console.error('API Error:', error);
    return { data: null as T, error: 'Erreur connexion' };
  }
}

// Services spécifiques
export const authApi = {
  login: (credentials: { email: string; password: string }) => {
    if (OFFLINE_MODE) {
      return mockApiResponse({ token: 'mock-jwt-token', user: { id: 1, name: 'Admin', role: 'admin' } });
    }
    return apiFetch('/auth/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  register: (userData: any) => apiFetch('/auth/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
};

export const btpApi = {
  stats: () => apiFetch<any>('/btp/api/stats'),
  chantiers: () => apiFetch<any[]>('/btp/api/chantiers'),
  createChantier: (data: any) => apiFetch('/btp/api/chantiers', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

export const rhApi = {
  stats: () => apiFetch<any>('/rh/api/stats'),
  employes: () => apiFetch<any[]>('/rh/api/employes'),
};

export const communicationApi = {
  stats: () => apiFetch<any>('/communication/api/stats'),
  annonceurs: () => apiFetch<any[]>('/communication/api/annonceurs'),
};

// Types génériques
export type DeptStats = {
  chantiers?: number;
  employes?: number;
  valeur_stock?: number;
  annonceurs?: number;
  campagnes?: number;
  [key: string]: any;
};


