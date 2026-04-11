import { buildServiceBase } from '@/lib/runtime-api';

const LOGISTIQUE_API_BASE = `${buildServiceBase(3008)}/api`;

const buildHeaders = (includeJson = false): HeadersInit => {
  const headers: Record<string, string> = {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (includeJson) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  return headers;
};

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${LOGISTIQUE_API_BASE}${path}`, {
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

export interface Produit {
  id: number;
  code_produit: string;
  nom: string;
  categorie?: string;
  fournisseur?: string;
  quantite: number;
  seuil_alerte: number;
  prix_unitaire: number;
  localisation?: string;
}

export interface Commande {
  id: number;
  numero_commande: string;
  client_nom: string;
  client_adresse?: string;
  client_telephone?: string;
  date_commande: string;
  date_livraison_souhaitee?: string;
  date_livraison_reelle?: string | null;
  statut: 'EN_ATTENTE' | 'PREPARATION' | 'LIVRAISON' | 'TERMINEE' | 'ANNULEE';
  total_ht: number;
  tva: number;
  total_ttc: number;
  notes?: string;
}

export interface LigneCommande {
  id: number;
  commande_id: number;
  produit_id: number;
  produit_nom: string;
  produit_code: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
}

export interface Stats {
  total_produits: number;
  alertes_non_traitees: number;
  commandes_en_cours: number;
  valeur_stock: number;
}

export interface Livraison {
  id: number;
  commande_id: number;
  commande_numero: string;
  client_nom: string;
  client_adresse?: string;
  numero_suivi?: string;
  transporteur: string;
  date_expedition?: string;
  date_livraison_prevue?: string;
  date_livraison_reelle?: string | null;
  statut: 'PREPARATION' | 'EXPEDIE' | 'EN_TRANSIT' | 'LIVRE' | 'RETARD';
  adresse_livraison?: string;
  frais_port: number;
  created_at?: string;
}

export const logistiqueApi = {
  getProduits: async (): Promise<Produit[]> => {
    try {
      return await request<Produit[]>('/produits');
    } catch (error) {
      console.error('Error fetching produits:', error);
      return [];
    }
  },

  getProduit: async (id: number): Promise<Produit | null> => {
    try {
      return await request<Produit>(`/produits/${id}`);
    } catch (error) {
      console.error('Error fetching produit:', error);
      return null;
    }
  },

  createProduit: async (data: Omit<Produit, 'id'>) => {
    return request<{ id: number; message: string }>('/produits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateProduit: async (id: number, data: Partial<Produit>) => {
    return request<{ message: string }>(`/produits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteProduit: async (id: number) => {
    return request<{ message: string; id: number }>(`/produits/${id}`, {
      method: 'DELETE',
    });
  },

  getCommandes: async (): Promise<Commande[]> => {
    try {
      return await request<Commande[]>('/commandes');
    } catch (error) {
      console.error('Error fetching commandes:', error);
      return [];
    }
  },

  getCommande: async (id: number): Promise<(Commande & { lignes: LigneCommande[] }) | null> => {
    try {
      return await request<Commande & { lignes: LigneCommande[] }>(`/commandes/${id}`);
    } catch (error) {
      console.error('Error fetching commande:', error);
      return null;
    }
  },

  createCommande: async (data: {
    client_nom: string;
    client_adresse?: string;
    client_telephone?: string;
    date_livraison_souhaitee?: string;
    lignes: Array<{ produit_id: number; quantite: number; prix_unitaire: number }>;
  }) => {
    return request<{ numero_commande: string; message: string }>('/commandes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCommande: async (id: number, data: Partial<Commande>) => {
    return request<{ message: string }>(`/commandes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getLivraisons: async (): Promise<Livraison[]> => {
    try {
      return await request<Livraison[]>('/livraisons');
    } catch (error) {
      console.error('Error fetching livraisons:', error);
      return [];
    }
  },

  getLivraison: async (id: number): Promise<Livraison | null> => {
    try {
      return await request<Livraison>(`/livraisons/${id}`);
    } catch (error) {
      console.error('Error fetching livraison:', error);
      return null;
    }
  },

  createLivraison: async (data: {
    commande_id: number;
    transporteur: string;
    numero_suivi?: string;
    date_expedition?: string;
    date_livraison_prevue?: string;
    adresse_livraison?: string;
    frais_port?: number;
    statut?: string;
  }) => {
    return request<{ id: number; message: string }>('/livraisons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateLivraison: async (id: number, data: Partial<Livraison>) => {
    return request<{ message: string }>(`/livraisons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getStats: async (): Promise<Stats> => {
    try {
      return await request<Stats>('/stats');
    } catch (error) {
      console.error('Error fetching stats:', error);
      return { total_produits: 0, alertes_non_traitees: 0, commandes_en_cours: 0, valeur_stock: 0 };
    }
  },
};

