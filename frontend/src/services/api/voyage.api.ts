import { buildServiceBase } from '@/lib/runtime-api';

const VOYAGE_API_BASE = `${buildServiceBase(3009)}/api`;

const buildHeaders = (includeJson = false): HeadersInit => {
  const headers: Record<string, string> = {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (includeJson) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  return headers;
};

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${VOYAGE_API_BASE}${path}`, {
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

export interface VoyageClient {
  id: number;
  nom: string;
  prenom: string;
}

export interface Destination {
  id: number;
  pays: string;
  ville: string;
}

export interface Offre {
  id: number;
  nom: string;
  prix: number;
  destination_pays: string;
}

export interface ImmigrationCandidate {
  id: number;
  nom: string;
  prenom: string;
}

export const voyageApi = {
  // Voyage
  getVoyageClients: async (): Promise<VoyageClient[]> => {
    try {
      return await request<VoyageClient[]>('/voyage/clients');
    } catch (error) {
      console.error('Error fetching voyage clients:', error);
      return [];
    }
  },

  getDestinations: async (): Promise<Destination[]> => {
    try {
      return await request<Destination[]>('/voyage/destinations');
    } catch (error) {
      console.error('Error fetching destinations:', error);
      return [];
    }
  },

  getOffres: async (): Promise<Offre[]> => {
    try {
      return await request<Offre[]>('/voyage/offres');
    } catch (error) {
      console.error('Error fetching offres:', error);
      return [];
    }
  },

  // Immigration
  getImmigrationCandidates: async (): Promise<ImmigrationCandidate[]> => {
    try {
      return await request<ImmigrationCandidate[]>('/voyage/immigration/candidates');
    } catch (error) {
      console.error('Error fetching immigration candidates:', error);
      return [];
    }
  },

  getDossiers: async (): Promise<any[]> => {
    try {
      return await request<any[]>('/voyage/immigration/dossiers');
    } catch (error) {
      console.error('Error fetching dossiers:', error);
      return [];
    }
  },

  getRendezVous: async (): Promise<any[]> => {
    try {
      return await request<any[]>('/voyage/immigration/rendez-vous');
    } catch (error) {
      console.error('Error fetching rendez-vous:', error);
      return [];
    }
  },

  getStats: async (): Promise<Record<string, any>> => {
    try {
      return await request<Record<string, any>>('/voyage/stats');
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {};
    }
  },
};

