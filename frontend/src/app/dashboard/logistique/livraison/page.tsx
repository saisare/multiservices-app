'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, PackageCheck, Plus, Truck } from 'lucide-react';
import Link from 'next/link';
import { logistiqueApi, type Commande, type Livraison } from '@/services/api/logistique.api';

const initialForm = {
  commande_id: '',
  transporteur: '',
  numero_suivi: '',
  date_expedition: '',
  date_livraison_prevue: '',
  adresse_livraison: '',
  frais_port: '0',
};

export default function LivraisonsPage() {
  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState(initialForm);

  const loadData = async () => {
    try {
      setLoading(true);
      const [livraisonRows, commandeRows] = await Promise.all([
        logistiqueApi.getLivraisons(),
        logistiqueApi.getCommandes(),
      ]);
      setLivraisons(livraisonRows);
      setCommandes(commandeRows.filter((commande) => !livraisonRows.some((livraison) => livraison.commande_id === commande.id)));
      setError('');
    } catch (loadError) {
      setError((loadError as Error).message || 'Impossible de charger les livraisons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const inTransit = useMemo(() => livraisons.filter((item) => ['EXPEDIE', 'EN_TRANSIT'].includes(item.statut)).length, [livraisons]);

  const createDelivery = async () => {
    try {
      if (!form.commande_id || !form.transporteur) {
        setError('Commande et transporteur requis.');
        return;
      }

      await logistiqueApi.createLivraison({
        commande_id: Number(form.commande_id),
        transporteur: form.transporteur,
        numero_suivi: form.numero_suivi,
        date_expedition: form.date_expedition,
        date_livraison_prevue: form.date_livraison_prevue,
        adresse_livraison: form.adresse_livraison,
        frais_port: Number(form.frais_port || 0),
        statut: 'PREPARATION',
      });

      setForm(initialForm);
      setSuccess('Livraison enregistrée.');
      await loadData();
    } catch (createError) {
      setError((createError as Error).message || 'Impossible de créer la livraison.');
    }
  };

  const updateStatus = async (livraison: Livraison, statut: Livraison['statut']) => {
    try {
      await logistiqueApi.updateLivraison(livraison.id, {
        ...livraison,
        statut,
        date_livraison_reelle: statut === 'LIVRE' ? new Date().toISOString().split('T')[0] : livraison.date_livraison_reelle,
      });
      await loadData();
    } catch (updateError) {
      setError((updateError as Error).message || 'Impossible de mettre à jour le statut.');
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-800 bg-[linear-gradient(135deg,#04111f_0%,#0b1d36_45%,#0a3144_100%)] px-6 py-8 text-white shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link href="/dashboard/logistique" className="inline-flex items-center gap-2 text-sm text-cyan-200">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
            <h1 className="mt-3 text-3xl font-semibold">Centre de livraisons</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">Préparez les expéditions, suivez le transit et validez les réceptions depuis une seule interface.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Livraisons ouvertes</p>
              <p className="mt-2 text-2xl font-semibold">{inTransit}</p>
            </div>
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Historique total</p>
              <p className="mt-2 text-2xl font-semibold">{livraisons.length}</p>
            </div>
          </div>
        </div>
      </section>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {success ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}

      <section className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-cyan-700" />
            <h2 className="text-xl font-semibold text-slate-900">Nouvelle livraison</h2>
          </div>
          <div className="space-y-3">
            <select value={form.commande_id} onChange={(e) => setForm({ ...form, commande_id: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <option value="">Sélectionner une commande</option>
              {commandes.map((commande) => (
                <option key={commande.id} value={commande.id}>{commande.numero_commande} - {commande.client_nom}</option>
              ))}
            </select>
            <input value={form.transporteur} onChange={(e) => setForm({ ...form, transporteur: e.target.value })} placeholder="Transporteur" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            <input value={form.numero_suivi} onChange={(e) => setForm({ ...form, numero_suivi: e.target.value })} placeholder="Numéro de suivi" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            <input type="date" value={form.date_expedition} onChange={(e) => setForm({ ...form, date_expedition: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            <input type="date" value={form.date_livraison_prevue} onChange={(e) => setForm({ ...form, date_livraison_prevue: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            <input value={form.adresse_livraison} onChange={(e) => setForm({ ...form, adresse_livraison: e.target.value })} placeholder="Adresse de livraison" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            <input type="number" value={form.frais_port} onChange={(e) => setForm({ ...form, frais_port: e.target.value })} placeholder="Frais de port" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            <button onClick={createDelivery} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700">
              <PackageCheck className="h-4 w-4" />
              Enregistrer la livraison
            </button>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Truck className="h-5 w-5 text-cyan-700" />
            <h2 className="text-xl font-semibold text-slate-900">Suivi des expéditions</h2>
          </div>

          {loading ? (
            <p className="py-12 text-center text-slate-500">Chargement des livraisons...</p>
          ) : (
            <div className="space-y-3">
              {livraisons.map((livraison) => (
                <div key={livraison.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{livraison.commande_numero}</p>
                      <p className="text-sm text-slate-600">{livraison.client_nom}</p>
                      <p className="mt-2 text-sm text-slate-500">Transporteur: {livraison.transporteur || 'Non renseigné'}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {(['PREPARATION', 'EXPEDIE', 'EN_TRANSIT', 'LIVRE'] as Livraison['statut'][]).map((status) => (
                        <button
                          key={status}
                          onClick={() => updateStatus(livraison, status)}
                          className={`rounded-full px-3 py-2 text-xs font-medium transition ${
                            livraison.statut === status
                              ? 'bg-slate-900 text-white'
                              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
