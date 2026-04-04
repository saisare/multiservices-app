import { buildServiceBase } from '@/lib/runtime-api';

const IMMIGRATION_API_BASE = `${buildServiceBase(3007)}/api`;

const buildHeaders = (includeJson = false): HeadersInit => {
  const headers: Record<string, string> = {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (includeJson) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  return headers;
};

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${IMMIGRATION_API_BASE}${path}`, {
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

export interface Client {
  id: number;
  code_client: string;
  type_client: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  nationalite: string;
  passport_number: string;
  passport_expiration: string;
  email: string;
  telephone: string;
  adresse: string;
}

export interface Dossier {
  id: number;
  numero_dossier: string;
  client_id: number;
  client_nom?: string;
  client_prenom?: string;
  type_demande: string;
  date_depot: string;
  date_decision?: string;
  statut: string;
  ambassade: string;
  consultant_id?: number;
  notes?: string;
}

export interface DestinationImmigration {
  id: number;
  pays: string;
  ville: string;
}

export const immigrationApi = {
  getClients: async (): Promise<Client[]> => {
    try {
      return await request<Client[]>('/clients');
    } catch (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
  },

  getClient: async (id: number): Promise<Client | null> => {
    try {
      return await request<Client>(`/clients/${id}`);
    } catch (error) {
      console.error('Error fetching client:', error);
      return null;
    }
  },

  createClient: async (data: Omit<Client, 'id' | 'code_client'>) => {
    return request<{ id: number; code_client: string; message: string }>('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateClient: async (id: number, data: Partial<Client>) => {
    return request<{ message: string }>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteClient: async (id: number) => {
    return request<{ message: string }>(`/clients/${id}`, {
      method: 'DELETE',
    });
  },

  getDossiers: async (): Promise<Dossier[]> => {
    try {
      return await request<Dossier[]>('/dossiers');
    } catch (error) {
      console.error('Error fetching dossiers:', error);
      return [];
    }
  },

  getDossier: async (id: number): Promise<Dossier | null> => {
    try {
      return await request<Dossier>(`/dossiers/${id}`);
    } catch (error) {
      console.error('Error fetching dossier:', error);
      return null;
    }
  },

  createDossier: async (data: { client_id: number; type_demande: string; date_depot?: string; ambassade?: string; notes?: string }) => {
    return request<{ id: number; numero_dossier: string; message: string }>('/dossiers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateDossier: async (id: number, data: Partial<Dossier>) => {
    return request<{ message: string }>(`/dossiers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getConsultants: async (): Promise<any[]> => {
    try {
      return await request<any[]>('/consultants');
    } catch (error) {
      console.error('Error fetching consultants:', error);
      return [];
    }
  },

  getDestinations: async (): Promise<DestinationImmigration[]> => {
    try {
      return await request<DestinationImmigration[]>('/destinations');
    } catch (error) {
      console.error('Error fetching destinations:', error);
      return [];
    }
  },
};

