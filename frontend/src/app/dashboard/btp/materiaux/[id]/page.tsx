'use client';

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Building2, DollarSign, History, MapPin, Package, Trash2 } from 'lucide-react';
import { Materiau, btpApi } from '@/services/api/btp.api';

export default function MateriauDetailPage() {
  const params = useParams();
  const router = useRouter();
  const materiauId = Number(params.id);

  const [materiau, setMateriau] = useState<Materiau | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdjuster, setShowAdjuster] = useState(false);
  const [stockDelta, setStockDelta] = useState('0');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!Number.isNaN(materiauId)) {
      void loadMateriau();
    }
  }, [materiauId]);

  const loadMateriau = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await btpApi.getMateriau(materiauId);
      setMateriau(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger le matériau.');
    } finally {
      setLoading(false);
    }
  };

  const stockStatus = useMemo(() => {
    if (!materiau) return { label: 'Inconnu', badge: 'bg-slate-100 text-slate-700 border border-slate-200' };
    if (materiau.quantite <= 0) return { label: 'Rupture de stock', badge: 'bg-rose-100 text-rose-700 border border-rose-200' };
    if (materiau.quantite <= materiau.seuil_alerte) return { label: 'Stock bas', badge: 'bg-amber-100 text-amber-800 border border-amber-200' };
    return { label: 'Stock normal', badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200' };
  }, [materiau]);

  const updateStock = async (mode: 'add' | 'remove') => {
    if (!materiau) return;

    const delta = Number(stockDelta) || 0;
    if (delta <= 0) {
      setError('Indiquez une quantité supérieure à zéro.');
      return;
    }

    const nextQuantite = mode === 'add' ? materiau.quantite + delta : Math.max(0, materiau.quantite - delta);

    try {
      setSaving(true);
      setError('');
      await btpApi.updateStock(materiau.id, nextQuantite);
      setStockDelta('0');
      setShowAdjuster(false);
      await loadMateriau();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mise à jour du stock impossible.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!materiau) return;

    const confirmed = window.confirm(`Supprimer définitivement le matériau ${materiau.nom} ?`);
    if (!confirmed) return;

    try {
      setSaving(true);
      setError('');
      await btpApi.deleteMateriau(materiau.id);
      router.push('/dashboard/btp/materiaux');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Suppression impossible.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />
      </div>
    );
  }

  if (error || !materiau) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm">
        <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />
        <p className="mt-4 text-lg font-semibold text-slate-900">Matériau indisponible</p>
        <p className="mt-2 text-sm text-slate-600">{error || 'Aucune donnée trouvée pour ce matériau.'}</p>
        <Link href="/dashboard/btp/materiaux" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700">
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <Link href="/dashboard/btp/materiaux" className="rounded-2xl border border-orange-200 bg-white p-3 text-slate-700 transition hover:bg-orange-50">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900">{materiau.nom}</h1>
                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${stockStatus.badge}`}>
                  {stockStatus.label}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">Code: {materiau.code_materiau || 'Non renseigné'}</p>
            </div>
          </div>

          <button type="button" onClick={() => void handleDelete()} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-300 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60">
            <Trash2 className="h-4 w-4" />
            Supprimer
          </button>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-none" />
          <span>{error}</span>
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Informations générales</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <InfoBlock icon={<Package className="h-5 w-5 text-orange-600" />} label="Catégorie" value={materiau.categorie || 'Non renseignée'} />
            <InfoBlock icon={<Building2 className="h-5 w-5 text-orange-600" />} label="Fournisseur" value={materiau.fournisseur || 'Non renseigné'} />
            <InfoBlock icon={<MapPin className="h-5 w-5 text-orange-600" />} label="Localisation" value={materiau.localisation || 'Non renseignée'} />
            <InfoBlock icon={<DollarSign className="h-5 w-5 text-orange-600" />} label="Prix unitaire" value={`${(Number(materiau.prix_unitaire) || 0).toLocaleString('fr-FR')} € / ${materiau.unite || 'unité'}`} />
          </div>
        </div>

        <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-orange-300">Stock</p>
          <div className="mt-5 text-center">
            <p className="text-5xl font-bold">{materiau.quantite}</p>
            <p className="mt-2 text-sm text-slate-300">{materiau.unite || 'unité'}</p>
          </div>

          <div className="mt-6 space-y-3 rounded-2xl bg-white/5 p-4">
            <div className="flex items-center justify-between text-sm text-slate-200">
              <span>Seuil d'alerte</span>
              <span className="font-semibold">{materiau.seuil_alerte} {materiau.unite}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-200">
              <span>Valeur estimée</span>
              <span className="font-semibold">{((Number(materiau.prix_unitaire) || 0) * materiau.quantite).toLocaleString('fr-FR')} €</span>
            </div>
          </div>

          {!showAdjuster ? (
            <button type="button" onClick={() => setShowAdjuster(true)} className="mt-6 w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600">
              Ajuster le stock
            </button>
          ) : (
            <div className="mt-6 space-y-3">
              <input
                type="number"
                min="0"
                value={stockDelta}
                onChange={(e) => setStockDelta(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:outline-none"
                placeholder="Quantité"
              />
              <div className="grid gap-2 sm:grid-cols-3">
                <button type="button" onClick={() => void updateStock('add')} disabled={saving} className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60">
                  Ajouter
                </button>
                <button type="button" onClick={() => void updateStock('remove')} disabled={saving} className="rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60">
                  Retirer
                </button>
                <button type="button" onClick={() => setShowAdjuster(false)} className="rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
          <History className="h-5 w-5 text-orange-600" />
          Suivi
        </h2>
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
          <p>Le détail du matériau est opérationnel: consultation, suppression contrôlée et ajustement de stock.</p>
          <p className="mt-2">L'historique complet des mouvements pourra s'appuyer ensuite sur une table dédiée si vous voulez tracer chaque entrée et sortie.</p>
        </div>
      </section>
    </div>
  );
}

type InfoBlockProps = {
  icon: ReactNode;
  label: string;
  value: string;
};

function InfoBlock({ icon, label, value }: InfoBlockProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-orange-100 p-2">{icon}</div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 font-semibold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
