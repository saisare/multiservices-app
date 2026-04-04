'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Package, Plus, Search, Trash2, Eye, Layers3 } from 'lucide-react';
import { Materiau, btpApi } from '@/services/api/btp.api';

type MateriauForm = {
  code_materiau: string;
  nom: string;
  categorie: string;
  fournisseur: string;
  quantite: string;
  unite: string;
  seuil_alerte: string;
  localisation: string;
  prix_unitaire: string;
};

const initialForm: MateriauForm = {
  code_materiau: '',
  nom: '',
  categorie: '',
  fournisseur: '',
  quantite: '0',
  unite: 'unite',
  seuil_alerte: '10',
  localisation: '',
  prix_unitaire: '0',
};

export default function MateriauxPage() {
  const [materiaux, setMateriaux] = useState<Materiau[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState<MateriauForm>(initialForm);

  useEffect(() => {
    void loadMateriaux();
  }, []);

  const loadMateriaux = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await btpApi.getMateriaux();
      setMateriaux(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les matériaux.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMateriaux = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return materiaux;

    return materiaux.filter((materiau) =>
      [
        materiau.nom,
        materiau.code_materiau,
        materiau.categorie,
        materiau.fournisseur,
        materiau.localisation,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [materiaux, searchTerm]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await btpApi.createMateriau({
        code_materiau: form.code_materiau.trim() || undefined,
        nom: form.nom.trim(),
        categorie: form.categorie.trim() || undefined,
        fournisseur: form.fournisseur.trim() || undefined,
        quantite: Number(form.quantite) || 0,
        unite: form.unite.trim() || 'unite',
        seuil_alerte: Number(form.seuil_alerte) || 0,
        localisation: form.localisation.trim() || undefined,
        prix_unitaire: Number(form.prix_unitaire) || 0,
      });

      setForm(initialForm);
      setShowCreateForm(false);
      setSuccess('Matériau enregistré dans le système BTP.');
      await loadMateriaux();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Création impossible.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (materiau: Materiau) => {
    const confirmed = window.confirm(`Supprimer définitivement le matériau ${materiau.nom} ?`);
    if (!confirmed) return;

    try {
      setError('');
      setSuccess('');
      await btpApi.deleteMateriau(materiau.id);
      setSuccess('Matériau supprimé avec succès.');
      await loadMateriaux();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Suppression impossible.');
    }
  };

  const stockBadge = (materiau: Materiau) => {
    if (materiau.quantite <= 0) return 'bg-rose-100 text-rose-700 border border-rose-200';
    if (materiau.quantite <= materiau.seuil_alerte) return 'bg-amber-100 text-amber-800 border border-amber-200';
    return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800">
              <Layers3 className="h-4 w-4" />
              Stock BTP
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Matériaux</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Cette page pilote les matériaux reliés à votre backend BTP et à la base WAMP `btp_db`.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateForm((value) => !value)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
          >
            <Plus className="h-4 w-4" />
            {showCreateForm ? 'Fermer le formulaire' : 'Nouveau matériau'}
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-orange-200 bg-white p-4">
            <p className="text-sm text-slate-500">Articles en stock</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{materiaux.length}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-white p-4">
            <p className="text-sm text-slate-500">Stock bas</p>
            <p className="mt-2 text-3xl font-bold text-amber-700">
              {materiaux.filter((item) => item.quantite > 0 && item.quantite <= item.seuil_alerte).length}
            </p>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-white p-4">
            <p className="text-sm text-slate-500">Ruptures</p>
            <p className="mt-2 text-3xl font-bold text-rose-700">
              {materiaux.filter((item) => item.quantite <= 0).length}
            </p>
          </div>
        </div>
      </section>

      {showCreateForm && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Créer un matériau</h2>
          <p className="mt-1 text-sm text-slate-500">Les données validées ici sont envoyées au backend BTP puis enregistrées dans `btp_db.materiaux`.</p>

          <form onSubmit={handleCreate} className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Nom
              <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none" placeholder="Ex: Ciment 42.5" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Code matériau
              <input value={form.code_materiau} onChange={(e) => setForm({ ...form, code_materiau: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none" placeholder="MAT-BTP-001" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Catégorie
              <input value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none" placeholder="Gros oeuvre" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Fournisseur
              <input value={form.fournisseur} onChange={(e) => setForm({ ...form, fournisseur: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none" placeholder="Nom du fournisseur" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Quantité
              <input type="number" min="0" value={form.quantite} onChange={(e) => setForm({ ...form, quantite: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-orange-500 focus:outline-none" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Unité
              <input value={form.unite} onChange={(e) => setForm({ ...form, unite: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none" placeholder="sac, m3, tonne" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Seuil d'alerte
              <input type="number" min="0" value={form.seuil_alerte} onChange={(e) => setForm({ ...form, seuil_alerte: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-orange-500 focus:outline-none" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Prix unitaire
              <input type="number" min="0" step="0.01" value={form.prix_unitaire} onChange={(e) => setForm({ ...form, prix_unitaire: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-orange-500 focus:outline-none" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
              Localisation
              <input value={form.localisation} onChange={(e) => setForm({ ...form, localisation: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none" placeholder="Magasin central, dépôt A..." />
            </label>

            <div className="md:col-span-2 flex flex-wrap gap-3">
              <button type="submit" disabled={saving} className="rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-orange-300">
                {saving ? 'Enregistrement...' : 'Enregistrer le matériau'}
              </button>
              <button type="button" onClick={() => { setForm(initialForm); setShowCreateForm(false); }} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                Annuler
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Liste des matériaux</h2>
            <p className="mt-1 text-sm text-slate-500">Recherche visible, contrastée, et utilisable sur fond clair.</p>
          </div>

          <label className="relative block w-full max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom, code, catégorie, fournisseur..."
              className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none"
            />
          </label>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-none" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {loading ? (
          <div className="mt-8 flex justify-center py-16">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />
          </div>
        ) : filteredMateriaux.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
            <Package className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-4 text-lg font-semibold text-slate-900">Aucun matériau trouvé</p>
            <p className="mt-2 text-sm text-slate-500">Ajustez la recherche ou ajoutez un nouveau matériau.</p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Matériau</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Prix</th>
                  <th className="px-4 py-3">Localisation</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMateriaux.map((materiau) => (
                  <tr key={materiau.id} className="hover:bg-orange-50/60">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-900">{materiau.nom}</div>
                      <div className="mt-1 text-sm text-slate-500">
                        {materiau.code_materiau || 'Sans code'}
                        {materiau.categorie ? ` • ${materiau.categorie}` : ''}
                        {materiau.fournisseur ? ` • ${materiau.fournisseur}` : ''}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-900">{materiau.quantite} {materiau.unite}</div>
                      <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${stockBadge(materiau)}`}>
                        {materiau.quantite <= 0 ? 'Rupture' : materiau.quantite <= materiau.seuil_alerte ? 'Stock bas' : 'Disponible'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      {(Number(materiau.prix_unitaire) || 0).toLocaleString('fr-FR')} €
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">{materiau.localisation || 'Non renseignée'}</td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/btp/materiaux/${materiau.id}`} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                          <Eye className="h-4 w-4" />
                          Voir
                        </Link>
                        <button type="button" onClick={() => void handleDelete(materiau)} className="inline-flex items-center gap-2 rounded-xl border border-rose-300 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50">
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
