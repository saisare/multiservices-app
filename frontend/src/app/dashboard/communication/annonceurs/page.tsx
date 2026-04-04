'use client';

import { type ReactNode, FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, Briefcase, Building2, CheckCircle2, Eye, Mail, Phone, Plus, Search, Users } from 'lucide-react';
import { buildServiceBase } from '@/lib/runtime-api';

type Annonceur = {
  id: number;
  code_annonceur: string;
  nom_entreprise: string;
  contact_nom: string;
  contact_email: string;
  contact_telephone: string;
  adresse: string;
  secteur_activite: string;
  date_creation: string;
};

type Campagne = {
  id: number;
  nom_campagne: string;
  statut: string;
  budget: number;
  nom_entreprise?: string;
  annonceur_id?: number;
};

const API_BASE = `${buildServiceBase(3005)}/api`;

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Erreur communication');
  }

  return data as T;
}

export default function AnnonceursPage() {
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  const annonceurId = searchParams.get('id');

  const [mode, setMode] = useState<'list' | 'new' | 'detail'>('list');
  const [annonceurs, setAnnonceurs] = useState<Annonceur[]>([]);
  const [campagnes, setCampagnes] = useState<Campagne[]>([]);
  const [selectedAnnonceur, setSelectedAnnonceur] = useState<Annonceur | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nom_entreprise: '',
    contact_nom: '',
    contact_email: '',
    contact_telephone: '',
    adresse: '',
    secteur_activite: '',
  });

  useEffect(() => {
    if (action === 'new') {
      setMode('new');
      setLoading(false);
      return;
    }

    if (annonceurId) {
      setMode('detail');
      void loadAnnonceur(Number(annonceurId));
      return;
    }

    setMode('list');
    void loadAnnonceurs();
  }, [action, annonceurId]);

  const loadAnnonceurs = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiRequest<Annonceur[]>('/annonceurs');
      setAnnonceurs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les annonceurs.');
    } finally {
      setLoading(false);
    }
  };

  const loadAnnonceur = async (id: number) => {
    try {
      setLoading(true);
      setError('');
      const [annonceurData, campagnesData] = await Promise.all([
        apiRequest<Annonceur>('/annonceurs/' + id),
        apiRequest<Campagne[]>('/campagnes'),
      ]);
      setSelectedAnnonceur(annonceurData);
      setCampagnes(campagnesData.filter((campagne) => campagne.annonceur_id === id || campagne.nom_entreprise === annonceurData.nom_entreprise));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Annonceur introuvable.');
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnonceurs = useMemo(() => {
    return annonceurs.filter((annonceur) =>
      [annonceur.nom_entreprise, annonceur.contact_nom, annonceur.contact_email, annonceur.secteur_activite]
        .some((value) => value?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [annonceurs, searchTerm]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      await apiRequest('/annonceurs', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setSuccess('Annonceur créé avec succès.');
      setFormData({ nom_entreprise: '', contact_nom: '', contact_email: '', contact_telephone: '', adresse: '', secteur_activite: '' });
      setMode('list');
      await loadAnnonceurs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Création impossible.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-sky-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-100 px-3 py-1 text-sm font-medium text-cyan-800">
              <Users className="h-4 w-4" />
              Communication
            </div>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Annonceurs</h1>
            <p className="mt-2 text-sm text-slate-600">Suivi des clients publicitaires reliés au microservice communication.</p>
          </div>
          <Link href="/dashboard/communication/annonceurs?action=new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700">
            <Plus className="h-4 w-4" />
            Nouvel annonceur
          </Link>
        </div>
      </section>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle className="mr-2 inline h-5 w-5" />{error}</div>}
      {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"><CheckCircle2 className="mr-2 inline h-5 w-5" />{success}</div>}

      {mode === 'list' && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Portefeuille annonceurs</h2>
              <p className="mt-1 text-sm text-slate-500">Liste alimentée par le backend communication.</p>
            </div>
            <label className="relative block w-full max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Rechercher par entreprise, contact ou secteur" className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none" />
            </label>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600" /></div>
          ) : filteredAnnonceurs.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600">Aucun annonceur trouvé.</div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredAnnonceurs.map((annonceur) => (
                <article key={annonceur.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">{annonceur.code_annonceur}</p>
                      <h3 className="mt-1 text-lg font-semibold text-slate-900">{annonceur.nom_entreprise}</h3>
                    </div>
                    <Link href={`/dashboard/communication/annonceurs?id=${annonceur.id}`} className="rounded-xl border border-slate-300 p-2 text-slate-700 transition hover:bg-slate-50">
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p><Mail className="mr-2 inline h-4 w-4 text-cyan-600" />{annonceur.contact_email}</p>
                    <p><Phone className="mr-2 inline h-4 w-4 text-cyan-600" />{annonceur.contact_telephone || 'Non renseigné'}</p>
                    <p><Briefcase className="mr-2 inline h-4 w-4 text-cyan-600" />{annonceur.secteur_activite || 'Non renseigné'}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {mode === 'new' && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <button type="button" onClick={() => setMode('list')} className="rounded-xl border border-slate-300 p-3 text-slate-700 transition hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Créer un annonceur</h2>
              <p className="text-sm text-slate-500">Création reliée au backend communication et à sa base de données.</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Nom entreprise
              <input required value={formData.nom_entreprise} onChange={(e) => setFormData({ ...formData, nom_entreprise: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-cyan-500 focus:outline-none" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Contact principal
              <input value={formData.contact_nom} onChange={(e) => setFormData({ ...formData, contact_nom: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-cyan-500 focus:outline-none" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Email
              <input type="email" required value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-cyan-500 focus:outline-none" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Téléphone
              <input value={formData.contact_telephone} onChange={(e) => setFormData({ ...formData, contact_telephone: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-cyan-500 focus:outline-none" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
              Adresse
              <textarea rows={3} value={formData.adresse} onChange={(e) => setFormData({ ...formData, adresse: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-cyan-500 focus:outline-none" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
              Secteur d'activité
              <input value={formData.secteur_activite} onChange={(e) => setFormData({ ...formData, secteur_activite: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-cyan-500 focus:outline-none" />
            </label>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={submitting} className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-60">{submitting ? 'Enregistrement...' : 'Créer l\'annonceur'}</button>
              <button type="button" onClick={() => setMode('list')} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Annuler</button>
            </div>
          </form>
        </section>
      )}

      {mode === 'detail' && selectedAnnonceur && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <button type="button" onClick={() => setMode('list')} className="rounded-xl border border-slate-300 p-3 text-slate-700 transition hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{selectedAnnonceur.nom_entreprise}</h2>
              <p className="text-sm text-slate-500">{selectedAnnonceur.code_annonceur}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <DetailCard label="Contact" value={selectedAnnonceur.contact_nom || 'Non renseigné'} icon={<Users className="h-4 w-4 text-cyan-600" />} />
            <DetailCard label="Email" value={selectedAnnonceur.contact_email || 'Non renseigné'} icon={<Mail className="h-4 w-4 text-cyan-600" />} />
            <DetailCard label="Téléphone" value={selectedAnnonceur.contact_telephone || 'Non renseigné'} icon={<Phone className="h-4 w-4 text-cyan-600" />} />
            <DetailCard label="Secteur" value={selectedAnnonceur.secteur_activite || 'Non renseigné'} icon={<Briefcase className="h-4 w-4 text-cyan-600" />} />
            <DetailCard label="Adresse" value={selectedAnnonceur.adresse || 'Non renseignée'} icon={<Building2 className="h-4 w-4 text-cyan-600" />} />
            <DetailCard label="Campagnes liées" value={String(campagnes.length)} icon={<Eye className="h-4 w-4 text-cyan-600" />} />
          </div>

          <div className="mt-6 rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
            <h3 className="text-sm font-semibold text-cyan-900">Campagnes connues</h3>
            {campagnes.length === 0 ? (
              <p className="mt-2 text-sm text-cyan-800">Aucune campagne reliée à cet annonceur pour le moment.</p>
            ) : (
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {campagnes.map((campagne) => (
                  <div key={campagne.id} className="rounded-xl border border-cyan-200 bg-white p-4">
                    <p className="font-semibold text-slate-900">{campagne.nom_campagne}</p>
                    <p className="mt-1 text-sm text-slate-600">Budget: {Number(campagne.budget || 0).toLocaleString('fr-FR')} €</p>
                    <p className="mt-1 text-sm text-slate-600">Statut: {campagne.statut}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function DetailCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        {icon}
        {label}
      </div>
      <p className="mt-2 font-semibold text-slate-900">{value}</p>
    </div>
  );
}



