// BTP API Client - Real backend

const BTP_API_BASE = '/btp/api';

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
  date_debut: string;
  date_fin?: string;
  statut: 'EN_COURS' | 'TERMINE' | 'A_FAIRE';
  priorite: 'HAUTE' | 'NORMALE' | 'BASSE';
  ouvrier_id?: number;
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
  getChantiers: async (): Promise<Chantier[]> => {
    try {
      const response = await fetch(`${BTP_API_BASE}/chantiers`);
      if (!response.ok) throw new Error('Failed to fetch chantiers');
      return response.json();
    } catch (error) {
      console.error('Error fetching chantiers:', error);
      return [];
    }
  },
  getChantier: async (id: number): Promise<Chantier | null> => {
    try {
      const response = await fetch(`${BTP_API_BASE}/chantiers/${id}`);
      if (!response.ok) throw new Error('Failed to fetch chantier');
      return response.json();
    } catch (error) {
      console.error('Error fetching chantier:', error);
      return null;
    }
  },
  createChantier: async (chantier: Partial<Chantier>): Promise<Chantier | null> => {
    try {
      const response = await fetch(`${BTP_API_BASE}/chantiers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chantier),
      });
      if (!response.ok) throw new Error('Failed to create chantier');
      return response.json();
    } catch (error) {
      console.error('Error creating chantier:', error);
      return null;
    }
  },
  updateChantier: async (id: number, updates: Partial<Chantier>): Promise<Chantier | null> => {
    try {
      const response = await fetch(`${BTP_API_BASE}/chantiers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update chantier');
      return response.json();
    } catch (error) {
      console.error('Error updating chantier:', error);
      return null;
    }
  },
  getMateriaux: async (): Promise<Materiau[]> => {
    try {
      const response = await fetch(`${BTP_API_BASE}/materiaux`);
      if (!response.ok) throw new Error('Failed to fetch materiaux');
      return response.json();
    } catch (error) {
      console.error('Error fetching materiaux:', error);
      return [];
    }
  },
  getOuvriers: async (): Promise<Ouvrier[]> => {
    try {
      const response = await fetch(`${BTP_API_BASE}/ouvriers`);
      if (!response.ok) throw new Error('Failed to fetch ouvriers');
      return response.json();
    } catch (error) {
      console.error('Error fetching ouvriers:', error);
      return [];
    }
  },
  getStats: async (): Promise<any> => {
    try {
      const response = await fetch(`${BTP_API_BASE}/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {};
    }
  }
};

