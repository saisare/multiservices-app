'use client';

import { BarChart3, PieChart } from 'lucide-react';

const demoKpi = {
  totalUsers: 312,
  activeServices: 8,
  incidents: 2,
  retentionRate: 95,
  satisfaction: 4.5
};

export default function PDGDashboard() {
  const message = 'Bienvenue PDG ! Vue globale activée, accès en lecture seule.';

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tableau de bord PDG / Directeur</h1>
      <p className="text-gray-600">Rapports globaux, KPI et surveillance des microservices (lecture seule).</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border rounded-lg">Total utilisateurs: {demoKpi.totalUsers}</div>
        <div className="p-4 bg-white border rounded-lg">Services actifs: {demoKpi.activeServices}</div>
        <div className="p-4 bg-white border rounded-lg">Incidents en cours: {demoKpi.incidents}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white border rounded-lg">Rétention: {demoKpi.retentionRate}%</div>
        <div className="p-4 bg-white border rounded-lg">Satisfaction utilisateur: {demoKpi.satisfaction}/5</div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-blue-700">📌 {message}</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="shadow rounded-lg p-4 border"> <BarChart3 className="mb-2" /> Rapports journaliers </div>
        <div className="shadow rounded-lg p-4 border"> <PieChart className="mb-2" /> KPI services </div>
      </div>

      <div className="p-4 border rounded-lg bg-slate-50 text-sm text-gray-700">
        <p><strong>Contrainte</strong>: lecture seule. Le PDG peut cacher des comptes mais ne peut pas supprimer définitivement.</p>
      </div>
    </div>
  );
}
