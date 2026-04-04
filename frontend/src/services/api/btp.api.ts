import { buildServiceBase } from '@/lib/runtime-api';

const BTP_API_BASE = `${buildServiceBase(3003)}/api`;

const buildHeaders = (includeJson = false): HeadersInit => {
  const headers: Record<string, string> = {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (includeJson) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  return headers;
};

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${BTP_API_BASE}${path}`, {
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

export interface CommandeBtp {
  id: number;
  numero_commande: string;
  fournisseur: string;
  date_commande: string;
  date_livraison_prevue: string;
  date_livraison_reelle: string | null;
  statut: 'EN_COURS' | 'LIVREE' | 'ANNULEE';
  montant_total: number;
  notes: string;
}

export interface LigneCommande {
  id: number;
  materiau_id: number;
  materiau_nom: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
}

export interface Chantier {
  id: number;
  code_chantier: string;
  nom: string;
  adresse?: string;
  client_nom?: string;
  date_debut: string;
  date_fin_prevue: string;
  date_fin_reelle?: string;
  budget?: number;
  statut: 'EN_COURS' | 'TERMINE' | 'SUSPENDU' | 'ANNULE';
  date_creation?: string;
  created_by?: string;
}

export interface TacheChantier {
  id: number;
  description: string;
  ouvrier_nom?: string;
  ouvrier_prenom?: string;
  date_debut: string;
  date_fin?: string;
  statut: 'EN_COURS' | 'TERMINE' | 'A_FAIRE';
  priorite: 'HAUTE' | 'NORMALE' | 'BASSE';
  ouvrier_id?: number;
  chantier_id?: number;
}

export interface Materiau {
  id: number;
  nom: string;
  fournisseur: string;
  quantite: number;
  unite: string;
  seuil_alerte: number;
  code_materiau?: string;
  categorie?: string;
  localisation?: string;
  prix_unitaire?: number;
}

export interface Ouvrier {
  id: number;
  prenom: string;
  nom: string;
  metier: string;
  matricule: string;
  telephone?: string;
  email?: string;
  date_embauche?: string;
  salaire_journalier?: number;
  adresse?: string;
  actif: boolean;
}

export const btpApi = {
  getCommandes: async (): Promise<CommandeBtp[]> => {
    try {
      return await request<CommandeBtp[]>('/commandes-btp');
    } catch (error) {
      console.error('Error fetching commandes:', error);
      return [];
    }
  },

  getCommande: async (id: number): Promise<(CommandeBtp & { lignes?: LigneCommande[] }) | null> => {
    try {
      return await request<CommandeBtp & { lignes?: LigneCommande[] }>(`/commandes-btp/${id}`);
    } catch (error) {
      console.error('Error fetching commande:', error);
      return null;
    }
  },

  createCommande: async (commande: {
    fournisseur: string;
    date_livraison_prevue?: string | null;
    notes?: string;
    lignes: Array<{ materiau_id: number; quantite: number; prix_unitaire: number }>;
  }) => {
    return request<{ id: number; numero_commande: string; message: string }>('/commandes-btp', {
      method: 'POST',
      body: JSON.stringify(commande),
    });
  },

  updateCommande: async (id: number, updates: { statut: CommandeBtp['statut'] }) => {
    return request<CommandeBtp>(`/commandes-btp/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  getChantiers: async (): Promise<Chantier[]> => {
    try {
      return await request<Chantier[]>('/chantiers');
    } catch (error) {
      console.error('Error fetching chantiers:', error);
      return [];
    }
  },

  getChantier: async (id: number): Promise<Chantier | null> => {
    try {
      return await request<Chantier>(`/chantiers/${id}`);
    } catch (error) {
      console.error('Error fetching chantier:', error);
      return null;
    }
  },

  createChantier: async (chantier: Partial<Chantier>): Promise<Chantier | null> => {
    try {
      return await request<Chantier>('/chantiers', {
        method: 'POST',
        body: JSON.stringify(chantier),
      });
    } catch (error) {
      console.error('Error creating chantier:', error);
      return null;
    }
  },

  updateChantier: async (id: number, updates: Partial<Chantier>): Promise<Chantier | null> => {
    try {
      return await request<Chantier>(`/chantiers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Error updating chantier:', error);
      return null;
    }
  },

  getTaches: async (chantierId: number): Promise<TacheChantier[]> => {
    try {
      return await request<TacheChantier[]>(`/chantiers/${chantierId}/taches`);
    } catch (error) {
      console.error('Error fetching taches:', error);
      return [];
    }
  },

  createTache: async (data: {
    chantier_id: number;
    ouvrier_id?: number | null;
    description: string;
    date_debut: string;
    date_fin?: string | null;
    priorite?: TacheChantier['priorite'];
  }) => {
    return request<{ id: number; message: string }>('/taches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateTacheStatut: async (id: number, statut: TacheChantier['statut']) => {
    return request<{ success: boolean; message: string }>(`/taches/${id}/statut`, {
      method: 'PUT',
      body: JSON.stringify({ statut }),
    });
  },

  getMateriaux: async (): Promise<Materiau[]> => {
    try {
      return await request<Materiau[]>('/materiaux-btp');
    } catch (error) {
      console.error('Error fetching materiaux:', error);
      return [];
    }
  },

  getMateriau: async (id: number): Promise<Materiau> => {
    return request<Materiau>(`/materiaux/${id}`);
  },

  createMateriau: async (data: Omit<Materiau, 'id'>) => {
    return request<{ id: number; code_materiau?: string; message: string }>('/materiaux', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateStock: async (id: number, quantite: number) => {
    return request<{ success: boolean; message: string }>(`/materiaux/${id}/stock`, {
      method: 'PUT',
      body: JSON.stringify({ quantite }),
    });
  },

  deleteMateriau: async (id: number) => {
    return request<{ success: boolean; message: string; id: number }>(`/materiaux/${id}`, {
      method: 'DELETE',
    });
  },

  getOuvriers: async (): Promise<Ouvrier[]> => {
    try {
      return await request<Ouvrier[]>('/ouvriers');
    } catch (error) {
      console.error('Error fetching ouvriers:', error);
      return [];
    }
  },

  getOuvrier: async (id: number): Promise<Ouvrier | null> => {
    try {
      return await request<Ouvrier>(`/ouvriers/${id}`);
    } catch (error) {
      console.error('Error fetching ouvrier:', error);
      return null;
    }
  },

  createOuvrier: async (data: Omit<Ouvrier, 'id'>) => {
    return request<{ id: number; matricule: string; nom: string; prenom: string; metier: string; message: string }>(
      '/ouvriers',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  updateOuvrier: async (id: number, data: Partial<Ouvrier>) => {
    return request<{ message: string }>(`/ouvriers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteOuvrier: async (id: number): Promise<void> => {
    await request<void>(`/ouvriers/${id}`, {
      method: 'DELETE',
    });
  },

  getStats: async (): Promise<Record<string, number>> => {
    try {
      return await request<Record<string, number>>('/stats');
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {};
    }
  },
};
