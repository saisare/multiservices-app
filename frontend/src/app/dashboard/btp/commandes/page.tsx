'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Download,
  Edit,
  Eye,
  Package,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';

import { buildServiceBase } from '@/lib/runtime-api';
import type { CommandeBtp, LigneCommande, Materiau } from '@/services/api/btp.api';

type PageMode = 'list' | 'detail' | 'new' | 'edit';
type LigneForm = { materiau_id: string; quantite: string; prix_unitaire: string };

const BTP_API_BASE = `${buildServiceBase(3003)}/api`;
const fallbackMateriaux: Materiau[] = [
  { id: 1, nom: 'Ciment', prix_unitaire: 15, unite: 'sac', fournisseur: 'Local', quantite: 100, seuil_alerte: 10 },
  { id: 2, nom: 'Fer a beton', prix_unitaire: 25, unite: 'barre', fournisseur: 'Local', quantite: 50, seuil_alerte: 5 },
  { id: 3, nom: 'Parpaing', prix_unitaire: 2.5, unite: 'unite', fournisseur: 'Local', quantite: 200, seuil_alerte: 20 },
  { id: 4, nom: 'Peinture', prix_unitaire: 12, unite: 'litre', fournisseur: 'Local', quantite: 80, seuil_alerte: 15 },
];

const getToken = () => localStorage.getItem('token') || '';

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BTP_API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || `Erreur API (${response.status})`);
  }

  return response.json();
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('fr-FR');
}

function formatMoney(value?: number | null) {
  return (value || 0).toLocaleString('fr-FR');
}

export default function CommandesBTPPage() {
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  const commandeId = searchParams.get('id');

  const [commandes, setCommandes] = useState<CommandeBtp[]>([]);
  const [commande, setCommande] = useState<CommandeBtp | null>(null);
  const [lignes, setLignes] = useState<LigneCommande[]>([]);
  const [materiaux, setMateriaux] = useState<Materiau[]>([]);
  const [mode, setMode] = useState<PageMode>('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddLigne, setShowAddLigne] = useState(false);
  const [newLigne, setNewLigne] = useState<LigneForm>({ materiau_id: '', quantite: '', prix_unitaire: '' });
  const [lignesData, setLignesData] = useState<LigneForm[]>([]);
  const [formData, setFormData] = useState({
    fournisseur: '',
    date_livraison_prevue: '',
    notes: '',
  });

  useEffect(() => {
    const initialize = async () => {
      setError('');
      await loadMateriaux();

      if (action === 'new') {
        setMode('new');
        setCommande(null);
        setLignes([]);
        setLignesData([]);
        setLoading(false);
        return;
      }

      if (commandeId) {
        setMode('detail');
        await loadCommande(Number(commandeId));
        return;
      }

      setMode('list');
      await loadCommandes();
    };

    initialize();
  }, [action, commandeId]);

  const loadCommandes = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<CommandeBtp[]>('/commandes-btp');
      setCommandes(data);
    } catch (err: any) {
      console.error('Erreur chargement commandes:', err);
      setError(err.message || 'Impossible de charger les commandes BTP');
      setCommandes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCommande = async (id: number) => {
    setLoading(true);
    try {
      const data = await apiFetch<CommandeBtp & { lignes?: LigneCommande[] }>(`/commandes-btp/${id}`);
      setCommande(data);
      setLignes(data.lignes || []);
      setFormData({
        fournisseur: data.fournisseur || '',
        date_livraison_prevue: data.date_livraison_prevue || '',
        notes: data.notes || '',
      });
    } catch (err: any) {
      console.error('Erreur chargement commande:', err);
      setError(err.message || 'Impossible de charger cette commande');
      setMode('list');
    } finally {
      setLoading(false);
    }
  };

  const loadMateriaux = async () => {
    try {
      const data = await apiFetch<Materiau[]>('/materiaux-btp');
      setMateriaux(data.length ? data : fallbackMateriaux);
    } catch (err) {
      console.error('Erreur chargement materiaux, fallback local utilise:', err);
      setMateriaux(fallbackMateriaux);
    }
  };

  const totalHT = useMemo(
    () => lignesData.reduce((sum, ligne) => sum + Number(ligne.quantite || 0) * Number(ligne.prix_unitaire || 0), 0),
    [lignesData]
  );
  const tva = totalHT * 0.2;
  const totalTTC = totalHT + tva;

  const filteredCommandes = useMemo(
    () =>
      commandes
        .filter((item) => {
          const term = searchTerm.trim().toLowerCase();
          if (!term) return true;
          return (
            item.numero_commande.toLowerCase().includes(term) ||
            item.fournisseur.toLowerCase().includes(term)
          );
        })
        .filter((item) => statusFilter === 'all' || item.statut === statusFilter),
    [commandes, searchTerm, statusFilter]
  );

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'EN_COURS':
        return 'bg-amber-100 text-amber-800';
      case 'LIVREE':
        return 'bg-emerald-100 text-emerald-800';
      case 'ANNULEE':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const handleAddLigne = () => {
    if (!newLigne.materiau_id || !newLigne.quantite) {
      setError('Veuillez selectionner un materiau et une quantite');
      return;
    }

    const materiau = materiaux.find((item) => item.id === Number(newLigne.materiau_id));
    if (!materiau) {
      setError('Materiau introuvable');
      return;
    }

    setError('');
    setLignesData((current) => [
      ...current,
      {
        materiau_id: newLigne.materiau_id,
        quantite: newLigne.quantite,
        prix_unitaire: newLigne.prix_unitaire || String(materiau.prix_unitaire || 0),
      },
    ]);
    setNewLigne({ materiau_id: '', quantite: '', prix_unitaire: '' });
    setShowAddLigne(false);
  };

  const handleRemoveLigne = (index: number) => {
    setLignesData((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleCreate = async () => {
    if (!formData.fournisseur.trim()) {
      setError('Le fournisseur est obligatoire');
      return;
    }

    if (lignesData.length === 0) {
      setError('Veuillez ajouter au moins une ligne');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await apiFetch('/commandes-btp', {
        method: 'POST',
        body: JSON.stringify({
          fournisseur: formData.fournisseur,
          date_livraison_prevue: formData.date_livraison_prevue || null,
          notes: formData.notes,
          lignes: lignesData.map((ligne) => ({
            materiau_id: Number(ligne.materiau_id),
            quantite: Number(ligne.quantite),
            prix_unitaire: Number(ligne.prix_unitaire),
          })),
        }),
      });

      setSuccess('Commande BTP creee avec succes');
      setLignesData([]);
      setFormData({ fournisseur: '', date_livraison_prevue: '', notes: '' });
      setMode('list');
      await loadCommandes();
    } catch (err: any) {
      setError(err.message || 'Creation impossible');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatut = async (id: number, statut: string) => {
    try {
      const updated = await apiFetch<CommandeBtp>(`/commandes-btp/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ statut }),
      });

      setCommandes((current) => current.map((item) => (item.id === id ? { ...item, statut: updated.statut } : item)));
      setCommande((current) => (current && current.id === id ? { ...current, statut: updated.statut } : current));
      setSuccess(`Statut mis a jour: ${statut}`);
    } catch (err: any) {
      setError(err.message || 'Mise a jour impossible');
    }
  };

  if (loading && mode !== 'list') {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(error || success) && (
        <div className="space-y-3">
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
              <AlertCircle className="mr-2 inline h-5 w-5" />
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
              <CheckCircle className="mr-2 inline h-5 w-5" />
              {success}
            </div>
          )}
        </div>
      )}

      {mode === 'list' && (
        <>
          <section className="rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-stone-700 px-6 py-7 text-white shadow-lg">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-orange-100">BTP</p>
                <h1 className="mt-2 text-3xl font-bold">Commandes fournisseurs</h1>
                <p className="mt-2 max-w-2xl text-sm text-orange-50/90">
                  Cette page reste isolee au microservice BTP. Une panne ici ne doit pas bloquer les autres departements.
                </p>
              </div>
              <Link
                href="/dashboard/btp/commandes?action=new"
                className="inline-flex items-center rounded-xl bg-white px-4 py-3 font-medium text-stone-900 shadow transition hover:bg-orange-50"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle commande
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher une commande ou un fournisseur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none transition focus:border-orange-400"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-400"
              >
                <option value="all">Tous les statuts</option>
                <option value="EN_COURS">En cours</option>
                <option value="LIVREE">Livree</option>
                <option value="ANNULEE">Annulee</option>
              </select>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-orange-100">
                <thead className="bg-stone-50">
                  <tr>
                    {['Commande', 'Fournisseur', 'Date commande', 'Livraison prevue', 'Montant', 'Statut', 'Actions'].map((label) => (
                      <th
                        key={label}
                        className={`px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 ${
                          label === 'Actions' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-50">
                  {filteredCommandes.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-500">
                        Aucune commande BTP a afficher.
                      </td>
                    </tr>
                  )}
                  {filteredCommandes.map((item) => (
                    <tr key={item.id} className="transition hover:bg-orange-50/40">
                      <td className="px-6 py-4 font-mono text-sm font-semibold text-stone-900">{item.numero_commande}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{item.fournisseur}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{formatDate(item.date_commande)}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{formatDate(item.date_livraison_prevue)}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-stone-900">{formatMoney(item.montant_total)} EUR</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatutColor(item.statut)}`}>
                          {item.statut}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/dashboard/btp/commandes?id=${item.id}`}
                          className="inline-flex rounded-lg p-2 text-orange-700 transition hover:bg-orange-100"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {(mode === 'detail' || mode === 'edit') && commande && (
        <>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setMode('list')} className="rounded-xl border border-orange-200 p-2 text-orange-700 hover:bg-orange-50">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-stone-900">{commande.numero_commande}</h1>
                <p className="text-slate-600">Fournisseur: {commande.fournisseur}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={commande.statut}
                onChange={(e) => handleUpdateStatut(commande.id, e.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-2"
              >
                <option value="EN_COURS">EN_COURS</option>
                <option value="LIVREE">LIVREE</option>
                <option value="ANNULEE">ANNULEE</option>
              </select>
              <button
                onClick={() => setMode(mode === 'detail' ? 'edit' : 'detail')}
                className="inline-flex items-center rounded-xl border border-orange-200 px-4 py-2 text-orange-700 hover:bg-orange-50"
              >
                <Edit className="mr-2 h-4 w-4" />
                {mode === 'detail' ? 'Modifier' : 'Retour detail'}
              </button>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
              {mode === 'detail' ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-slate-500">Date commande</p>
                    <p className="mt-1 font-medium text-stone-900">{formatDate(commande.date_commande)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Livraison prevue</p>
                    <p className="mt-1 font-medium text-stone-900">{formatDate(commande.date_livraison_prevue)}</p>
                  </div>
                  {commande.date_livraison_reelle && (
                    <div>
                      <p className="text-sm text-slate-500">Livraison reelle</p>
                      <p className="mt-1 font-medium text-stone-900">{formatDate(commande.date_livraison_reelle)}</p>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <p className="text-sm text-slate-500">Notes</p>
                    <p className="mt-1 text-stone-900">{commande.notes || '-'}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Fournisseur"
                    value={formData.fournisseur}
                    onChange={(e) => setFormData((current) => ({ ...current, fournisseur: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 p-3"
                  />
                  <input
                    type="date"
                    value={formData.date_livraison_prevue}
                    onChange={(e) => setFormData((current) => ({ ...current, date_livraison_prevue: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 p-3"
                  />
                  <textarea
                    rows={4}
                    placeholder="Notes"
                    value={formData.notes}
                    onChange={(e) => setFormData((current) => ({ ...current, notes: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 p-3"
                  />
                </div>
              )}
            </section>

            <aside className="rounded-2xl bg-gradient-to-br from-orange-600 via-amber-600 to-stone-800 p-6 text-white shadow-lg">
              <h2 className="text-lg font-semibold">Recapitulatif</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Total HT</span>
                  <span>{formatMoney((commande.montant_total || 0) / 1.2)} EUR</span>
                </div>
                <div className="flex justify-between">
                  <span>TVA (20%)</span>
                  <span>{formatMoney((commande.montant_total || 0) / 6)} EUR</span>
                </div>
                <div className="flex justify-between border-t border-white/20 pt-3 text-lg font-semibold">
                  <span>Total TTC</span>
                  <span>{formatMoney(commande.montant_total)} EUR</span>
                </div>
              </div>
            </aside>
          </div>

          <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-700" />
              <h2 className="text-lg font-semibold text-stone-900">Articles</h2>
              <button className="ml-auto rounded-lg p-2 text-orange-700 hover:bg-orange-50" title="Exporter">
                <Download className="h-4 w-4" />
              </button>
            </div>

            {lignes.length === 0 ? (
              <p className="text-sm text-slate-500">Aucune ligne enregistree pour cette commande.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-stone-50">
                    <tr>
                      {['Article', 'Quantite', 'Prix unitaire', 'Total'].map((label) => (
                        <th key={label} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-50">
                    {lignes.map((ligne) => (
                      <tr key={ligne.id}>
                        <td className="px-4 py-3">{ligne.materiau_nom}</td>
                        <td className="px-4 py-3">{ligne.quantite}</td>
                        <td className="px-4 py-3">{formatMoney(ligne.prix_unitaire)} EUR</td>
                        <td className="px-4 py-3 font-medium">{formatMoney(ligne.total_ligne)} EUR</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {mode === 'new' && (
        <>
          <div className="flex items-center gap-4">
            <button onClick={() => setMode('list')} className="rounded-xl border border-orange-200 p-2 text-orange-700 hover:bg-orange-50">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-orange-600">BTP</p>
              <h1 className="text-3xl font-bold text-stone-900">Nouvelle commande</h1>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
              <div className="grid gap-4">
                <input
                  type="text"
                  placeholder="Fournisseur *"
                  value={formData.fournisseur}
                  onChange={(e) => setFormData((current) => ({ ...current, fournisseur: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 p-3"
                />
                <input
                  type="date"
                  value={formData.date_livraison_prevue}
                  onChange={(e) => setFormData((current) => ({ ...current, date_livraison_prevue: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 p-3"
                />
                <textarea
                  rows={4}
                  placeholder="Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData((current) => ({ ...current, notes: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 p-3"
                />
              </div>
            </section>

            <aside className="rounded-2xl bg-gradient-to-br from-stone-900 via-stone-800 to-orange-700 p-6 text-white shadow-lg">
              <h2 className="text-lg font-semibold">Resume financier</h2>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Total HT</span>
                  <span>{formatMoney(totalHT)} EUR</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>TVA 20%</span>
                  <span>{formatMoney(tva)} EUR</span>
                </div>
                <div className="flex justify-between border-t border-white/20 pt-3 text-lg font-semibold">
                  <span>Total TTC</span>
                  <span>{formatMoney(totalTTC)} EUR</span>
                </div>
              </div>
            </aside>
          </div>

          <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-900">Articles de commande</h2>
              <button onClick={() => setShowAddLigne(true)} className="inline-flex items-center rounded-xl bg-orange-600 px-4 py-2 text-white hover:bg-orange-700">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un article
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-stone-50">
                  <tr>
                    {['Materiau', 'Quantite', 'Prix', 'Total', ''].map((label) => (
                      <th key={label} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-50">
                  {lignesData.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                        Aucune ligne ajoutee pour le moment.
                      </td>
                    </tr>
                  )}
                  {lignesData.map((ligne, index) => {
                    const materiau = materiaux.find((item) => item.id === Number(ligne.materiau_id));
                    const total = Number(ligne.quantite) * Number(ligne.prix_unitaire);
                    return (
                      <tr key={`${ligne.materiau_id}-${index}`}>
                        <td className="px-4 py-3">{materiau?.nom || 'Materiau inconnu'}</td>
                        <td className="px-4 py-3">{ligne.quantite}</td>
                        <td className="px-4 py-3">{formatMoney(Number(ligne.prix_unitaire))} EUR</td>
                        <td className="px-4 py-3 font-medium">{formatMoney(total)} EUR</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleRemoveLigne(index)} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCreate}
                disabled={loading}
                className="rounded-xl bg-stone-900 px-6 py-3 text-white transition hover:bg-stone-800 disabled:opacity-60"
              >
                {loading ? 'Creation...' : 'Creer la commande'}
              </button>
            </div>
          </section>

          {showAddLigne && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 px-4">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-stone-900">Ajouter un article</h3>
                <div className="mt-4 space-y-3">
                  <select
                    value={newLigne.materiau_id}
                    onChange={(e) => {
                      const materiau = materiaux.find((item) => item.id === Number(e.target.value));
                      setNewLigne({
                        materiau_id: e.target.value,
                        quantite: newLigne.quantite,
                        prix_unitaire: materiau?.prix_unitaire ? String(materiau.prix_unitaire) : '',
                      });
                    }}
                    className="w-full rounded-xl border border-slate-200 p-3"
                  >
                    <option value="">Selectionner un materiau</option>
                    {materiaux.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nom} ({formatMoney(item.prix_unitaire || 0)} EUR/{item.unite})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    placeholder="Quantite"
                    value={newLigne.quantite}
                    onChange={(e) => setNewLigne((current) => ({ ...current, quantite: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 p-3"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Prix unitaire"
                    value={newLigne.prix_unitaire}
                    onChange={(e) => setNewLigne((current) => ({ ...current, prix_unitaire: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 p-3"
                  />
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button onClick={() => setShowAddLigne(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-slate-700">
                    Annuler
                  </button>
                  <button onClick={handleAddLigne} className="rounded-xl bg-orange-600 px-4 py-2 text-white hover:bg-orange-700">
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}


