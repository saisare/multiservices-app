'use client';

import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, Package, Truck, Warehouse } from 'lucide-react';
import Link from 'next/link';
import { logistiqueApi, type Commande, type Livraison, type Stats } from '@/services/api/logistique.api';

export default function LogistiquePage() {
  const [stats, setStats] = useState<Stats>({ total_produits: 0, alertes_non_traitees: 0, commandes_en_cours: 0, valeur_stock: 0 });
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, commandesData, livraisonsData] = await Promise.all([
        logistiqueApi.getStats(),
        logistiqueApi.getCommandes(),
        logistiqueApi.getLivraisons(),
      ]);
      setStats(statsData);
      setCommandes(commandesData);
      setLivraisons(livraisonsData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const recentOrders = useMemo(() => commandes.slice(0, 5), [commandes]);
  const recentDeliveries = useMemo(() => livraisons.slice(0, 5), [livraisons]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-cyan-200 border-t-slate-900" />
          <p className="text-slate-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-800 bg-[linear-gradient(135deg,#04111f_0%,#0b1d36_45%,#0a3144_100%)] px-6 py-8 text-white shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/80">Pilotage logistique</p>
            <h1 className="mt-2 text-3xl font-semibold">Tableau de bord</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Suivez les stocks, les flux de commandes et l’avancement des livraisons depuis un cockpit unifié.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/dashboard/logistique/produits" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm transition hover:bg-white/10">
              Catalogue et stock
            </Link>
            <Link href="/dashboard/logistique/livraisons" className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-sm transition hover:bg-cyan-400/20">
              Centre de livraisons
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Produits référencés" value={String(stats.total_produits)} icon={<Package className="h-5 w-5" />} tone="cyan" />
        <MetricCard label="Alertes de stock" value={String(stats.alertes_non_traitees)} icon={<AlertTriangle className="h-5 w-5" />} tone="amber" />
        <MetricCard label="Valeur du stock" value={`${Number(stats.valeur_stock || 0).toLocaleString('fr-FR')} FCFA`} icon={<Warehouse className="h-5 w-5" />} tone="sky" />
        <MetricCard label="Commandes en cours" value={String(stats.commandes_en_cours)} icon={<Truck className="h-5 w-5" />} tone="slate" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Commandes récentes</h2>
              <p className="mt-1 text-sm text-slate-500">Dernières demandes clients en traitement.</p>
            </div>
            <Link href="/dashboard/logistique/commandes" className="inline-flex items-center gap-2 text-sm font-medium text-cyan-700">
              Ouvrir la gestion
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((commande) => (
              <div key={commande.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{commande.numero_commande}</p>
                    <p className="text-sm text-slate-600">{commande.client_nom}</p>
                  </div>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">{commande.statut}</span>
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  Total TTC: {Number(commande.total_ttc || 0).toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Livraisons prioritaires</h2>
              <p className="mt-1 text-sm text-slate-500">Suivi opérationnel des envois récents.</p>
            </div>
            <Link href="/dashboard/logistique/livraisons" className="inline-flex items-center gap-2 text-sm font-medium text-cyan-700">
              Voir tout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentDeliveries.map((livraison) => (
              <div key={livraison.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{livraison.commande_numero}</p>
                    <p className="text-sm text-slate-600">{livraison.client_nom}</p>
                  </div>
                  <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-800">{livraison.statut}</span>
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  Transporteur: {livraison.transporteur || 'Non renseigné'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {stats.alertes_non_traitees > 0 ? (
        <section className="rounded-[28px] border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />
            <div>
              <h2 className="font-semibold text-amber-900">Réapprovisionnement à surveiller</h2>
              <p className="mt-1 text-sm text-amber-800">
                {stats.alertes_non_traitees} alerte(s) de stock nécessitent une action sur les produits ou les entrées.
              </p>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  tone: 'cyan' | 'amber' | 'sky' | 'slate';
}) {
  const tones = {
    cyan: 'border-cyan-200 bg-cyan-50 text-cyan-800',
    amber: 'border-amber-200 bg-amber-50 text-amber-800',
    sky: 'border-sky-200 bg-sky-50 text-sky-800',
    slate: 'border-slate-200 bg-slate-50 text-slate-800',
  };

  return (
    <div className={`rounded-[28px] border p-5 shadow-sm ${tones[tone]}`}>
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-white/70 p-3">{icon}</div>
        <span className="text-2xl font-semibold">{value}</span>
      </div>
      <p className="mt-4 text-sm font-medium">{label}</p>
    </div>
  );
}
