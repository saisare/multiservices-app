import { buildServiceBase } from './runtime-api';

const API_GATEWAY = process.env.NEXT_PUBLIC_API_URL || buildServiceBase(3001);

interface ApiResponse<T> {
  data: T;
  error?: string;
}

const getAuthHeader = (): Record<string, string> | undefined => {
  if (typeof window === 'undefined') return undefined;
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    };

    const authHeaders = getAuthHeader();
    if (authHeaders) Object.assign(headers, authHeaders);

    const response = await fetch(`${API_GATEWAY}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: 'Erreur réseau' }));
      return { data: null as T, error: payload.error || `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { data, error: undefined };
  } catch (error) {
    console.error('API Error:', error);
    return { data: null as T, error: 'Erreur connexion' };
  }
}

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  register: (userData: Record<string, unknown>) =>
    apiFetch('/api/auth/request-account', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
};

export const btpApi = {
  stats: () => apiFetch<Record<string, unknown>>('/api/btp/api/stats'),
  chantiers: () => apiFetch<Record<string, unknown>[]>('/api/btp/api/chantiers'),
  createChantier: (data: Record<string, unknown>) =>
    apiFetch('/api/btp/api/chantiers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const rhApi = {
  stats: () => apiFetch<Record<string, unknown>>('/api/rh/api/stats'),
  employes: () => apiFetch<Record<string, unknown>[]>('/api/rh/api/employes'),
};

export const communicationApi = {
  stats: () => apiFetch<Record<string, unknown>>('/api/communication/api/stats'),
  annonceurs: () => apiFetch<Record<string, unknown>[]>('/api/communication/api/annonceurs'),
};

export type DeptStats = {
  chantiers?: number;
  employes?: number;
  valeur_stock?: number;
  annonceurs?: number;
  campagnes?: number;
  [key: string]: unknown;
};
