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
  code_client?: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  nationalite?: string;
}

export interface Destination {
  id: number;
  code_destination?: string;
  pays: string;
  ville: string;
  aeroport_code?: string;
  description?: string;
  saison_haute?: string;
  visa_requis?: boolean;
  prix_moyen?: number;
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
      const data = await request<{ clients?: VoyageClient[] }>('/voyage/clients');
      return data?.clients || [];
    } catch (error) {
      console.error('Error fetching voyage clients:', error);
      return [];
    }
  },

  getDestinations: async (): Promise<Destination[]> => {
    try {
      const data = await request<{ destinations?: Destination[] }>('/voyage/destinations');
      return data?.destinations || [];
    } catch (error) {
      console.error('Error fetching destinations:', error);
      return [];
    }
  },

  getOffres: async (): Promise<Offre[]> => {
    try {
      const data = await request<{ offres?: Offre[] }>('/voyage/offres');
      return data?.offres || [];
    } catch (error) {
      console.error('Error fetching offres:', error);
      return [];
    }
  },

  // Immigration
  getImmigrationCandidates: async (): Promise<ImmigrationCandidate[]> => {
    try {
      const data = await request<{ demandeurs?: ImmigrationCandidate[] }>('/voyage/immigration/demandeurs');
      return data?.demandeurs || [];
    } catch (error) {
      console.error('Error fetching immigration candidates:', error);
      return [];
    }
  },

  getDossiers: async (): Promise<any[]> => {
    try {
      const data = await request<{ dossiers?: any[] }>('/voyage/immigration/dossiers');
      return data?.dossiers || [];
    } catch (error) {
      console.error('Error fetching dossiers:', error);
      return [];
    }
  },

  getRendezVous: async (): Promise<any[]> => {
    try {
      const data = await request<{ rendezVous?: any[] }>('/voyage/immigration/rendez-vous');
      return data?.rendezVous || [];
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

  createVoyageClient: async (data: Record<string, unknown>) => {
    return request<Record<string, unknown>>('/voyage/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  createDestination: async (data: Record<string, unknown>) => {
    return request<Record<string, unknown>>('/voyage/destinations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getReservations: async (): Promise<any[]> => {
    try {
      const data = await request<{ reservations?: any[] }>('/voyage/reservations');
      return data?.reservations || [];
    } catch (error) {
      console.error('Error fetching reservations:', error);
      return [];
    }
  },

  getVols: async (): Promise<any[]> => {
    try {
      const data = await request<{ vols?: any[] }>('/voyage/vols');
      return data?.vols || [];
    } catch (error) {
      console.error('Error fetching vols:', error);
      return [];
    }
  },

  getHotels: async (): Promise<any[]> => {
    try {
      const data = await request<{ hotels?: any[] }>('/voyage/hotels');
      return data?.hotels || [];
    } catch (error) {
      console.error('Error fetching hotels:', error);
      return [];
    }
  },
};

