'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, FileText, Plus, Search, Shield } from 'lucide-react';
import { buildServiceBase } from '@/lib/runtime-api';

type Police = {
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
  statut?: string;
};

type Assure = {
  id: number;
  nom: string;
  prenom: string;
  type_assure: string;
};

const API_BASE = `${buildServiceBase(3004)}/api`;

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
    throw new Error(data.error || 'Erreur assurance');
  }

  return data as T;
}

export default function PolicesPage() {
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  const policeId = searchParams.get('id');

  const [mode, setMode] = useState<'list' | 'new' | 'detail'>('list');
  const [polices, setPolices] = useState<Police[]>([]);
  const [assures, setAssures] = useState<Assure[]>([]);
  const [selectedPolice, setSelectedPolice] = useState<Police | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [formData, setFormData] = useState({
    assure_id: '',
    type_assurance: 'AUTO',
    date_effet: new Date().toISOString().split('T')[0],
    date_echeance: '',
    prime_annuelle: '',
    franchise: '',
    plafond_remboursement: '',
    conditions: '',
  });

  useEffect(() => {
    void loadAssures();
  }, []);

  useEffect(() => {
    if (action === 'new') {
      setMode('new');
      setLoading(false);
      return;
    }

    if (policeId) {
      setMode('detail');
      void loadPolice(Number(policeId));
      return;
    }

    setMode('list');
    void loadPolices();
  }, [action, policeId]);

  const loadPolices = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiRequest<Police[]>('/polices');
      setPolices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les polices.');
    } finally {
      setLoading(false);
    }
  };

  const loadAssures = async () => {
    try {
      const data = await apiRequest<Assure[]>('/assures');
      setAssures(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadPolice = async (id: number) => {
    try {
      setLoading(true);
      setError('');
      const data = await apiRequest<Police>('/polices/' + id);
      setSelectedPolice(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Police introuvable.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPolices = useMemo(() => {
    return polices.filter((police) => {
      const assureNom = `${police.assure_prenom || ''} ${police.assure_nom || ''}`.toLowerCase();
      const matchesSearch =
        police.numero_police.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assureNom.includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || police.type_assurance === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [polices, searchTerm, typeFilter]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      await apiRequest('/polices', {
        method: 'POST',
        body: JSON.stringify({
          assure_id: Number(formData.assure_id),
          type_assurance: formData.type_assurance,
          date_effet: formData.date_effet,
          date_echeance: formData.date_echeance,
          prime_annuelle: Number(formData.prime_annuelle),
          franchise: Number(formData.franchise) || 0,
          plafond_remboursement: Number(formData.plafond_remboursement) || 0,
          conditions: formData.conditions,
        }),
      });

      setSuccess('Police créée avec succès.');
      setFormData({
        assure_id: '',
        type_assurance: 'AUTO',
        date_effet: new Date().toISOString().split('T')[0],
        date_echeance: '',
        prime_annuelle: '',
        franchise: '',
        plafond_remboursement: '',
        conditions: '',
      });
      setMode('list');
      await loadPolices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Création impossible.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-sm font-medium text-sky-800">
              <Shield className="h-4 w-4" />
              Assurance
            </div>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Polices</h1>
            <p className="mt-2 text-sm text-slate-600">Gestion professionnelle des contrats liés au microservice assurance.</p>
          </div>
          <Link href="/dashboard/assurance/polices?action=new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700">
            <Plus className="h-4 w-4" />
            Nouvelle police
          </Link>
        </div>
      </section>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle className="mr-2 inline h-5 w-5" />{error}</div>}
      {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"><CheckCircle2 className="mr-2 inline h-5 w-5" />{success}</div>}

      {mode === 'list' && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Contrats enregistrés</h2>
              <p className="mt-1 text-sm text-slate-500">Liste tirée du backend assurance.</p>
            </div>
            <div className="flex w-full flex-col gap-3 md:flex-row lg:w-auto">
              <label className="relative block min-w-[280px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Rechercher une police ou un assuré" className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none" />
              </label>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none">
                <option value="all">Tous les types</option>
                <option value="AUTO">Auto</option>
                <option value="HABITATION">Habitation</option>
                <option value="SANTE">Santé</option>
                <option value="PROFESSIONNELLE">Professionnelle</option>
                <option value="VOYAGE">Voyage</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" /></div>
          ) : filteredPolices.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600">Aucune police trouvée.</div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">Police</th>
                    <th className="px-4 py-3">Assuré</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Prime</th>
                    <th className="px-4 py-3">Échéance</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPolices.map((police) => (
                    <tr key={police.id} className="hover:bg-sky-50/60">
                      <td className="px-4 py-4 font-semibold text-slate-900">{police.numero_police}</td>
                      <td className="px-4 py-4 text-sm text-slate-700">{`${police.assure_prenom || ''} ${police.assure_nom || ''}`.trim() || 'Non renseigné'}</td>
                      <td className="px-4 py-4 text-sm text-slate-700">{police.type_assurance}</td>
                      <td className="px-4 py-4 text-sm text-slate-700">{Number(police.prime_annuelle || 0).toLocaleString('fr-FR')} €</td>
                      <td className="px-4 py-4 text-sm text-slate-700">{new Date(police.date_echeance).toLocaleDateString('fr-FR')}</td>
                      <td className="px-4 py-4 text-right">
                        <Link href={`/dashboard/assurance/polices?id=${police.id}`} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                          <Eye className="h-4 w-4" />
                          Voir
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              <h2 className="text-xl font-semibold text-slate-900">Créer une police</h2>
              <p className="text-sm text-slate-500">Les données sont envoyées au backend assurance puis stockées en base.</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Assuré
              <select required value={formData.assure_id} onChange={(e) => setFormData({ ...formData, assure_id: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none">
                <option value="">Choisir un assuré</option>
                {assures.map((assure) => (
                  <option key={assure.id} value={assure.id}>{assure.type_assure === 'PARTICULIER' ? `${assure.prenom} ${assure.nom}` : assure.nom}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Type d'assurance
              <select value={formData.type_assurance} onChange={(e) => setFormData({ ...formData, type_assurance: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none">
                <option value="AUTO">Auto</option>
                <option value="HABITATION">Habitation</option>
                <option value="SANTE">Santé</option>
                <option value="PROFESSIONNELLE">Professionnelle</option>
                <option value="VOYAGE">Voyage</option>
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Date d'effet
              <input type="date" required value={formData.date_effet} onChange={(e) => setFormData({ ...formData, date_effet: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Date d'échéance
              <input type="date" required value={formData.date_echeance} onChange={(e) => setFormData({ ...formData, date_echeance: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Prime annuelle
              <input type="number" min="0" step="0.01" required value={formData.prime_annuelle} onChange={(e) => setFormData({ ...formData, prime_annuelle: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Franchise
              <input type="number" min="0" step="0.01" value={formData.franchise} onChange={(e) => setFormData({ ...formData, franchise: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
              Plafond de remboursement
              <input type="number" min="0" step="0.01" value={formData.plafond_remboursement} onChange={(e) => setFormData({ ...formData, plafond_remboursement: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
              Conditions
              <textarea rows={4} value={formData.conditions} onChange={(e) => setFormData({ ...formData, conditions: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none" />
            </label>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={submitting} className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60">{submitting ? 'Enregistrement...' : 'Créer la police'}</button>
              <button type="button" onClick={() => setMode('list')} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Annuler</button>
            </div>
          </form>
        </section>
      )}

      {mode === 'detail' && selectedPolice && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <button type="button" onClick={() => setMode('list')} className="rounded-xl border border-slate-300 p-3 text-slate-700 transition hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{selectedPolice.numero_police}</h2>
              <p className="text-sm text-slate-500">Détail de la police</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <DetailCard label="Assuré" value={`${selectedPolice.assure_prenom || ''} ${selectedPolice.assure_nom || ''}`.trim() || 'Non renseigné'} />
            <DetailCard label="Type" value={selectedPolice.type_assurance} />
            <DetailCard label="Prime annuelle" value={`${Number(selectedPolice.prime_annuelle || 0).toLocaleString('fr-FR')} €`} />
            <DetailCard label="Franchise" value={`${Number(selectedPolice.franchise || 0).toLocaleString('fr-FR')} €`} />
            <DetailCard label="Plafond" value={`${Number(selectedPolice.plafond_remboursement || 0).toLocaleString('fr-FR')} €`} />
            <DetailCard label="Période" value={`${new Date(selectedPolice.date_effet).toLocaleDateString('fr-FR')} -> ${new Date(selectedPolice.date_echeance).toLocaleDateString('fr-FR')}`} />
          </div>
          <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800">
            <FileText className="mr-2 inline h-4 w-4" />
            Cette page est désormais stable et alignée avec le backend assurance réel. L'édition pourra être ajoutée ensuite si vous souhaitez ouvrir un endpoint `PUT /api/polices/:id`.
          </div>
        </section>
      )}
    </div>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}


