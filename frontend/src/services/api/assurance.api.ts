import { buildServiceBase } from '@/lib/runtime-api';

const ASSURANCE_API_BASE = `${buildServiceBase(3004)}/api`;

const buildHeaders = (includeJson = false): HeadersInit => {
  const headers: Record<string, string> = {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (includeJson) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  return headers;
};

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${ASSURANCE_API_BASE}${path}`, {
    ...init,
    headers: {
      ...buildHeaders(init.body !== undefined),
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    let message = 'Erreur serveur';

    try {
      const data = await response.json();
      message = data.error || data.message || message;
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
};

export interface Assure {
  id: number;
  code_assure: string;
  type_assure: string;
  nom: string;
  prenom: string;
  entreprise?: string;
  date_naissance: string;
  email: string;
  telephone: string;
  adresse: string;
}

export interface Police {
  id: number;
  numero_police: string;
  assure_id: number;
  assure_nom?: string;
  assure_prenom?: string;
  type_assurance: string;
  date_effet: string;
  date_echeance: string;
  prime_annuelle: number;
  franchise: number;
  plafond_remboursement: number;
  conditions: string;
}

export interface Sinistre {
  id: number;
  numero_sinistre: string;
  police_id: number;
  numero_police?: string;
  assure_nom?: string;
  assure_prenom?: string;
  expert_nom?: string;
  expert_prenom?: string;
  date_sinistre: string;
  lieu_sinistre: string;
  description: string;
  montant_estime: number;
}

export const assuranceApi = {
  getAssures: async (): Promise<Assure[]> => {
    try {
      return await request<Assure[]>('/assures');
    } catch (error) {
      console.error('Error fetching assures:', error);
      return [];
    }
  },

  getAssure: async (id: number): Promise<Assure | null> => {
    try {
      return await request<Assure>(`/assures/${id}`);
    } catch (error) {
      console.error('Error fetching assure:', error);
      return null;
    }
  },

  createAssure: async (data: Omit<Assure, 'id' | 'code_assure'>) => {
    return request<{ id: number; code_assure: string; message: string }>('/assures', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getPolices: async (): Promise<Police[]> => {
    try {
      return await request<Police[]>('/polices');
    } catch (error) {
      console.error('Error fetching polices:', error);
      return [];
    }
  },

  getPolice: async (id: number): Promise<Police | null> => {
    try {
      return await request<Police>(`/polices/${id}`);
    } catch (error) {
      console.error('Error fetching police:', error);
      return null;
    }
  },

  getSinistres: async (): Promise<Sinistre[]> => {
    try {
      return await request<Sinistre[]>('/sinistres');
    } catch (error) {
      console.error('Error fetching sinistres:', error);
      return [];
    }
  },

  getExperts: async (): Promise<Record<string, unknown>[]> => {
    try {
      return await request<Record<string, unknown>[]>('/experts');
    } catch (error) {
      console.error('Error fetching experts:', error);
      return [];
    }
  },
};

