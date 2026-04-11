import { buildServiceBase } from '@/lib/runtime-api';

const RH_API_BASE = `${buildServiceBase(3006)}/api`;

const buildHeaders = (includeJson = false): HeadersInit => {
  const headers: Record<string, string> = {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (includeJson) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  return headers;
};

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${RH_API_BASE}${path}`, {
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

export interface Employe {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  genre: string;
  email: string;
  telephone: string;
  poste: string;
  departement: string;
  date_embauche: string;
  salaire_base: number;
  adresse?: string;
  actif?: number;
}

export interface Conge {
  id: number;
  employe_id: number;
  employe_nom?: string;
  employe_prenom?: string;
  type_conge: string;
  date_debut: string;
  date_fin: string;
  motif: string;
  statut: string;
  nb_jours?: number;
  date_demande?: string;
}

export interface ContratRh {
  id: number;
  employe_id: number;
  numero_contrat: string;
  type_contrat: string;
  date_debut: string;
  date_fin?: string;
  poste?: string;
  salaire?: number;
  statut: string;
  employe_nom?: string;
  employe_prenom?: string;
}

export interface EvaluationRh {
  id: number;
  employe_id: number;
  date_evaluation: string;
  periode?: string;
  note_technique?: number;
  note_comportement?: number;
  note_global?: number;
  commentaires?: string;
  employe_nom?: string;
  employe_prenom?: string;
}

export interface FormationRh {
  id: number;
  employe_id: number;
  titre: string;
  organisme?: string;
  date_debut?: string;
  date_fin?: string;
  duree_heures?: number;
  cout?: number;
  employe_nom?: string;
  employe_prenom?: string;
}

export interface DocumentRh {
  id: number;
  employe_id: number;
  type_document: string;
  nom_fichier?: string;
  chemin_fichier?: string;
  confidentiel?: number;
  employe_nom?: string;
  employe_prenom?: string;
}

export interface PaieRh {
  id: number;
  employe_id: number;
  mois: number;
  annee: number;
  salaire_base?: number;
  primes?: number;
  indemnites?: number;
  cotisations?: number;
  net_a_payer?: number;
  date_paie?: string;
  statut: string;
  employe_nom?: string;
  employe_prenom?: string;
}

export const rhApi = {
  getEmployes: async (): Promise<Employe[]> => {
    try {
      return await request<Employe[]>('/employes');
    } catch (error) {
      console.error('Error fetching employes:', error);
      return [];
    }
  },

  getEmploye: async (id: number): Promise<Employe | null> => {
    try {
      return await request<Employe>(`/employes/${id}`);
    } catch (error) {
      console.error('Error fetching employe:', error);
      return null;
    }
  },

  createEmploye: async (data: Omit<Employe, 'id' | 'matricule'>) => {
    return request<{ id: number; matricule: string; message: string }>('/employes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateEmploye: async (id: number, data: Partial<Employe>) => {
    return request<{ message: string }>(`/employes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getConges: async (): Promise<Conge[]> => {
    try {
      return await request<Conge[]>('/conges');
    } catch (error) {
      console.error('Error fetching conges:', error);
      return [];
    }
  },

  getCongesEmploye: async (id: number): Promise<Conge[]> => {
    try {
      return await request<Conge[]>(`/conges/employe/${id}`);
    } catch (error) {
      console.error('Error fetching conges employe:', error);
      return [];
    }
  },

  createConge: async (data: { employe_id: number; type_conge: string; date_debut: string; date_fin: string; motif: string }) => {
    return request<{ id: number; message: string }>('/conges', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCongeStatut: async (id: number, statut: string) => {
    return request<{ success: boolean; message: string }>(`/conges/${id}/statut`, {
      method: 'PUT',
      body: JSON.stringify({ statut }),
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

  getContrats: async (): Promise<ContratRh[]> => {
    try {
      return await request<ContratRh[]>('/contrats');
    } catch (error) {
      console.error('Error fetching contrats:', error);
      return [];
    }
  },

  createContrat: async (data: Record<string, unknown>) => {
    return request<{ id: number; numero_contrat: string; message: string }>('/contrats', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getEvaluations: async (): Promise<EvaluationRh[]> => {
    try {
      return await request<EvaluationRh[]>('/evaluations');
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      return [];
    }
  },

  createEvaluation: async (data: Record<string, unknown>) => {
    return request<{ id: number; message: string }>('/evaluations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getFormations: async (): Promise<FormationRh[]> => {
    try {
      return await request<FormationRh[]>('/formations');
    } catch (error) {
      console.error('Error fetching formations:', error);
      return [];
    }
  },

  createFormation: async (data: Record<string, unknown>) => {
    return request<{ id: number; message: string }>('/formations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getDocuments: async (): Promise<DocumentRh[]> => {
    try {
      return await request<DocumentRh[]>('/documents');
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  },

  createDocument: async (data: Record<string, unknown>) => {
    return request<{ id: number; message: string }>('/documents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getPaie: async (): Promise<PaieRh[]> => {
    try {
      return await request<PaieRh[]>('/paie');
    } catch (error) {
      console.error('Error fetching paie:', error);
      return [];
    }
  },

  createPaie: async (data: Record<string, unknown>) => {
    return request<{ id: number; message: string }>('/paie', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

