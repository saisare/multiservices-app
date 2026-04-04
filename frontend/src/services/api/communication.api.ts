import { buildServiceBase } from '@/lib/runtime-api';

const COMMUNICATION_API_BASE = `${buildServiceBase(3005)}/api`;

const buildHeaders = (includeJson = false): HeadersInit => {
  const headers: Record<string, string> = {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (includeJson) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  return headers;
};

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${COMMUNICATION_API_BASE}${path}`, {
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

export interface Annonceur {
  id: number;
  code_annonceur: string;
  nom_entreprise: string;
  contact_nom: string;
  contact_email: string;
  contact_telephone: string;
  adresse: string;
  secteur_activite: string;
}

export interface Campagne {
  id: number;
  code_campagne: string;
  annonceur_id: number;
  nom_entreprise?: string;
  nom_campagne: string;
  type_campagne: string;
  objectif: string;
  budget: number;
  date_debut: string;
  date_fin: string;
  statut: string;
}

export const communicationApi = {
  getAnnonceurs: async (): Promise<Annonceur[]> => {
    try {
      return await request<Annonceur[]>('/annonceurs');
    } catch (error) {
      console.error('Error fetching annonceurs:', error);
      return [];
    }
  },

  getAnnonceur: async (id: number): Promise<Annonceur | null> => {
    try {
      return await request<Annonceur>(`/annonceurs/${id}`);
    } catch (error) {
      console.error('Error fetching annonceur:', error);
      return null;
    }
  },

  createAnnonceur: async (data: Omit<Annonceur, 'id' | 'code_annonceur'>) => {
    return request<{ id: number; code_annonceur: string; message: string }>('/annonceurs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getCampagnes: async (): Promise<Campagne[]> => {
    try {
      return await request<Campagne[]>('/campagnes');
    } catch (error) {
      console.error('Error fetching campagnes:', error);
      return [];
    }
  },

  getCampagne: async (id: number): Promise<Campagne | null> => {
    try {
      return await request<Campagne>(`/campagnes/${id}`);
    } catch (error) {
      console.error('Error fetching campagne:', error);
      return null;
    }
  },

  getPerformances: async (campagneId: number): Promise<any[]> => {
    try {
      return await request<any[]>(`/performances/campagne/${campagneId}`);
    } catch (error) {
      console.error('Error fetching performances:', error);
      return [];
    }
  },

  getStats: async (): Promise<Record<string, any>> => {
    try {
      return await request<Record<string, any>>('/stats');
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {};
    }
  },
};

