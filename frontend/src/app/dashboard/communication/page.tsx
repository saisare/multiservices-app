'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BarChart3, Eye, Megaphone, MousePointer, Plus, Users } from 'lucide-react';
import { communicationApi, type Campagne, type PerformanceCommunication } from '@/services/api/communication.api';

type DashboardStats = {
  totalAnnonceurs: number;
  totalCampagnes: number;
  campagnesActives: number;
  budgetTotal: number;
  benefices: number;
  impressionsTotales: number;
  clicsTotaux: number;
  conversionsTotales: number;
  revenuTotal: number;
};

export default function CommunicationDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalAnnonceurs: 0,
    totalCampagnes: 0,
    campagnesActives: 0,
    budgetTotal: 0,
    benefices: 0,
    impressionsTotales: 0,
    clicsTotaux: 0,
    conversionsTotales: 0,
    revenuTotal: 0,
  });
  const [campagnes, setCampagnes] = useState<Campagne[]>([]);
  const [performances, setPerformances] = useState<PerformanceCommunication[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [statsData, campagnesData] = await Promise.all([
          communicationApi.getStats(),
          communicationApi.getCampagnes(),
        ]);

        const performanceRows = (
          await Promise.all(campagnesData.slice(0, 5).map((campagne) => communicationApi.getPerformances(campagne.id)))
        ).flat();

        setCampagnes(campagnesData);
        setPerformances(performanceRows);
        setStats({
          totalAnnonceurs: Number(statsData.annonceurs || 0),
          totalCampagnes: Number(statsData.campagnes || 0),
          campagnesActives: Number(statsData.campagnes_en_cours || 0),
          budgetTotal: Number(statsData.budget_total || 0),
          benefices: Number(statsData.benefices || 0),
          impressionsTotales: performanceRows.reduce((sum, row) => sum + Number(row.impressions || 0), 0),
          clicsTotaux: performanceRows.reduce((sum, row) => sum + Number(row.clics || 0), 0),
          conversionsTotales: performanceRows.reduce((sum, row) => sum + Number(row.conversions || 0), 0),
          revenuTotal: performanceRows.reduce((sum, row) => sum + Number(row.revenu || 0), 0),
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const recentCampaigns = useMemo(() => campagnes.slice(0, 5), [campagnes]);
  const ctr = stats.impressionsTotales ? ((stats.clicsTotaux / stats.impressionsTotales) * 100).toFixed(1) : '0.0';
  const conversionRate = stats.clicsTotaux ? ((stats.conversionsTotales / stats.clicsTotaux) * 100).toFixed(1) : '0.0';

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
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/80">Pilotage communication</p>
            <h1 className="mt-2 text-3xl font-semibold">Tableau de bord</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Vision consolidée des campagnes, des annonceurs et des performances digitales reliées à la base communication.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/communication/annonceurs" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm transition hover:bg-white/10">
              Portefeuille annonceurs
            </Link>
            <Link href="/dashboard/communication/campagnes?action=new" className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-sm transition hover:bg-cyan-400/20">
              Nouvelle campagne
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Annonceurs actifs" value={String(stats.totalAnnonceurs)} icon={<Users className="h-5 w-5" />} />
        <MetricCard label="Campagnes actives" value={String(stats.campagnesActives)} icon={<Megaphone className="h-5 w-5" />} />
        <MetricCard label="CTR moyen" value={`${ctr}%`} icon={<MousePointer className="h-5 w-5" />} />
        <MetricCard label="Revenu suivi" value={`${stats.revenuTotal.toLocaleString('fr-FR')} FCFA`} icon={<Eye className="h-5 w-5" />} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Campagnes récentes</h2>
              <p className="mt-1 text-sm text-slate-500">Campagnes servies par le microservice communication.</p>
            </div>
            <Link href="/dashboard/communication/campagnes" className="text-sm font-medium text-cyan-700">Voir tout</Link>
          </div>
          <div className="space-y-3">
            {recentCampaigns.map((campaign) => (
              <div key={campaign.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{campaign.nom_campagne}</p>
                    <p className="text-sm text-slate-600">{campaign.nom_entreprise}</p>
                  </div>
                  <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-800">{campaign.statut}</span>
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  Budget: {Number(campaign.budget || 0).toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-700" />
            <h2 className="text-xl font-semibold text-slate-900">Lecture performance</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoTile label="Budget total" value={`${stats.budgetTotal.toLocaleString('fr-FR')} FCFA`} />
            <InfoTile label="Bénéfices estimés" value={`${stats.benefices.toLocaleString('fr-FR')} FCFA`} />
            <InfoTile label="Conversions" value={String(stats.conversionsTotales)} />
            <InfoTile label="Taux de conversion" value={`${conversionRate}%`} />
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">{icon}</div>
        <span className="text-2xl font-semibold text-slate-900">{value}</span>
      </div>
      <p className="mt-4 text-sm text-slate-600">{label}</p>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}
