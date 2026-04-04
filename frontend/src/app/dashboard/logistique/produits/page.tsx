'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, Package, Plus, Search, Trash2, Truck } from 'lucide-react';
import { buildServiceBase } from '@/lib/runtime-api';

type Produit = {
  id: number;
  code_produit: string;
  nom: string;
  categorie: string;
  fournisseur: string;
  quantite: number;
  seuil_alerte: number;
  prix_unitaire: number;
  localisation: string;
};

const API_BASE = `${buildServiceBase(3008)}/api`;

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Erreur logistique');
  }

  return data as T;
}

export default function ProduitsPage() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('tous');
  const [selectedProduit, setSelectedProduit] = useState<Produit | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    code_produit: '',
    nom: '',
    categorie: '',
    fournisseur: '',
    quantite: '0',
    seuil_alerte: '10',
    prix_unitaire: '0',
    localisation: '',
  });

  useEffect(() => {
    void loadProduits();
  }, []);

  const loadProduits = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiRequest<Produit[]>('/produits');
      setProduits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les produits.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProduits = useMemo(() => {
    return produits.filter((produit) => {
      const matchesSearch = [produit.nom, produit.code_produit, produit.fournisseur]
        .some((value) => value?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'tous' || produit.categorie === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [produits, searchTerm, selectedCategory]);

  const categories = useMemo(() => ['tous', ...Array.from(new Set(produits.map((produit) => produit.categorie).filter(Boolean)))], [produits]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      await apiRequest('/produits', {
        method: 'POST',
        body: JSON.stringify({
          code_produit: formData.code_produit,
          nom: formData.nom,
          categorie: formData.categorie,
          fournisseur: formData.fournisseur,
          quantite: Number(formData.quantite) || 0,
          seuil_alerte: Number(formData.seuil_alerte) || 0,
          prix_unitaire: Number(formData.prix_unitaire) || 0,
          localisation: formData.localisation,
        }),
      });
      setSuccess('Produit créé avec succès.');
      setFormData({ code_produit: '', nom: '', categorie: '', fournisseur: '', quantite: '0', seuil_alerte: '10', prix_unitaire: '0', localisation: '' });
      setShowCreateForm(false);
      await loadProduits();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Création impossible.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (produit: Produit) => {
    const confirmed = window.confirm(`Supprimer le produit ${produit.nom} ?`);
    if (!confirmed) return;

    try {
      setError('');
      setSuccess('');
      await apiRequest(`/produits/${produit.id}`, { method: 'DELETE' });
      setSuccess('Produit supprimé avec succès.');
      if (selectedProduit?.id === produit.id) {
        setSelectedProduit(null);
      }
      await loadProduits();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Suppression impossible.');
    }
  };

  const stockLabel = (produit: Produit) => {
    if (produit.quantite <= 0) return 'bg-rose-100 text-rose-700 border border-rose-200';
    if (produit.quantite <= produit.seuil_alerte) return 'bg-amber-100 text-amber-800 border border-amber-200';
    return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-lime-200 bg-gradient-to-br from-lime-50 via-white to-emerald-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-lime-100 px-3 py-1 text-sm font-medium text-lime-800">
              <Truck className="h-4 w-4" />
              Logistique
            </div>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Produits</h1>
            <p className="mt-2 text-sm text-slate-600">Stock et catalogue produits reliés au microservice logistique.</p>
          </div>
          <button type="button" onClick={() => setShowCreateForm((value) => !value)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-lime-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-lime-700">
            <Plus className="h-4 w-4" />
            {showCreateForm ? 'Fermer le formulaire' : 'Nouveau produit'}
          </button>
        </div>
      </section>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle className="mr-2 inline h-5 w-5" />{error}</div>}
      {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"><CheckCircle2 className="mr-2 inline h-5 w-5" />{success}</div>}

      {showCreateForm && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Créer un produit</h2>
          <p className="mt-1 text-sm text-slate-500">Les données sont envoyées au backend logistique puis enregistrées dans la base.</p>
          <form onSubmit={handleCreate} className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">Code produit<input required value={formData.code_produit} onChange={(e) => setFormData({ ...formData, code_produit: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-lime-500 focus:outline-none" /></label>
            <label className="space-y-2 text-sm font-medium text-slate-700">Nom<input required value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-lime-500 focus:outline-none" /></label>
            <label className="space-y-2 text-sm font-medium text-slate-700">Catégorie<input value={formData.categorie} onChange={(e) => setFormData({ ...formData, categorie: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-lime-500 focus:outline-none" /></label>
            <label className="space-y-2 text-sm font-medium text-slate-700">Fournisseur<input value={formData.fournisseur} onChange={(e) => setFormData({ ...formData, fournisseur: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-lime-500 focus:outline-none" /></label>
            <label className="space-y-2 text-sm font-medium text-slate-700">Quantité<input type="number" min="0" value={formData.quantite} onChange={(e) => setFormData({ ...formData, quantite: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-lime-500 focus:outline-none" /></label>
            <label className="space-y-2 text-sm font-medium text-slate-700">Seuil d'alerte<input type="number" min="0" value={formData.seuil_alerte} onChange={(e) => setFormData({ ...formData, seuil_alerte: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-lime-500 focus:outline-none" /></label>
            <label className="space-y-2 text-sm font-medium text-slate-700">Prix unitaire<input type="number" min="0" step="0.01" value={formData.prix_unitaire} onChange={(e) => setFormData({ ...formData, prix_unitaire: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-lime-500 focus:outline-none" /></label>
            <label className="space-y-2 text-sm font-medium text-slate-700">Localisation<input value={formData.localisation} onChange={(e) => setFormData({ ...formData, localisation: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-lime-500 focus:outline-none" /></label>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={submitting} className="rounded-xl bg-lime-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-lime-700 disabled:opacity-60">{submitting ? 'Enregistrement...' : 'Créer le produit'}</button>
              <button type="button" onClick={() => setShowCreateForm(false)} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Annuler</button>
            </div>
          </form>
        </section>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Stock produits</h2>
            <p className="mt-1 text-sm text-slate-500">Catalogue vivant du stock logistique.</p>
          </div>
          <div className="flex w-full flex-col gap-3 md:flex-row lg:w-auto">
            <label className="relative block min-w-[280px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Rechercher produit, code ou fournisseur" className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:outline-none" />
            </label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-lime-500 focus:outline-none">
              {categories.map((category) => (
                <option key={category} value={category}>{category === 'tous' ? 'Toutes les catégories' : category}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="h-12 w-12 animate-spin rounded-full border-4 border-lime-200 border-t-lime-600" /></div>
        ) : filteredProduits.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600">Aucun produit trouvé.</div>
        ) : (
          <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 bg-white">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">Produit</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Prix</th>
                    <th className="px-4 py-3">Localisation</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProduits.map((produit) => (
                    <tr key={produit.id} className="hover:bg-lime-50/60">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-900">{produit.nom}</div>
                        <div className="mt-1 text-sm text-slate-500">{produit.code_produit} • {produit.categorie || 'Sans catégorie'} • {produit.fournisseur || 'Sans fournisseur'}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-900">{produit.quantite}</div>
                        <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${stockLabel(produit)}`}>
                          {produit.quantite <= 0 ? 'Rupture' : produit.quantite <= produit.seuil_alerte ? 'Stock bas' : 'Disponible'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">{Number(produit.prix_unitaire || 0).toLocaleString('fr-FR')} €</td>
                      <td className="px-4 py-4 text-sm text-slate-700">{produit.localisation || 'Non renseignée'}</td>
                      <td className="px-4 py-4 text-right">
                        <div className="inline-flex gap-2">
                          <button type="button" onClick={() => setSelectedProduit(produit)} className="rounded-xl border border-slate-300 p-2 text-slate-700 transition hover:bg-slate-50">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => void handleDelete(produit)} className="rounded-xl border border-rose-300 p-2 text-rose-700 transition hover:bg-rose-50">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-lg font-semibold text-slate-900">Vue rapide</h3>
              {!selectedProduit ? (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                  <Package className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-3">Sélectionnez un produit pour afficher son détail.</p>
                </div>
              ) : (
                <div className="mt-4 space-y-3 rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-lime-700">{selectedProduit.code_produit}</p>
                  <p className="text-lg font-semibold text-slate-900">{selectedProduit.nom}</p>
                  <Info label="Catégorie" value={selectedProduit.categorie || 'Non renseignée'} />
                  <Info label="Fournisseur" value={selectedProduit.fournisseur || 'Non renseigné'} />
                  <Info label="Quantité" value={String(selectedProduit.quantite)} />
                  <Info label="Seuil alerte" value={String(selectedProduit.seuil_alerte)} />
                  <Info label="Prix unitaire" value={`${Number(selectedProduit.prix_unitaire || 0).toLocaleString('fr-FR')} €`} />
                  <Info label="Localisation" value={selectedProduit.localisation || 'Non renseignée'} />
                </div>
              )}
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}


