'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3, TrendingUp, Download, Filter,
  Calendar, DollarSign, Eye, MousePointer,
  Share2, ArrowUp, ArrowDown, AlertCircle
} from 'lucide-react';

interface PerformanceGlobale {
  period: string;
  totalImpressions: number;
  totalClics: number;
  totalConversions: number;
  totalRevenu: number;
  totalCout: number;
  ctr: number;
  conversionRate: number;
  roi: number;
}

interface PerformanceParCampagne {
  id: number;
  nom: string;
  impressions: number;
  clics: number;
  conversions: number;
  revenu: number;
  cout: number;
}

export default function PerformancesPage() {
  const searchParams = useSearchParams();
  const period = searchParams.get('period') || 'month';

  const [globalStats, setGlobalStats] = useState<PerformanceGlobale>({
    period: 'Mars 2026',
    totalImpressions: 1250000,
    totalClics: 45000,
    totalConversions: 3200,
    totalRevenu: 156000,
    totalCout: 42000,
    ctr: 3.6,
    conversionRate: 7.1,
    roi: 271
  });

  const [campagnesPerformance, setCampagnesPerformance] = useState<PerformanceParCampagne[]>([
    { id: 1, nom: 'Lancement App', impressions: 450000, clics: 18000, conversions: 1200, revenu: 62000, cout: 15000 },
    { id: 2, nom: 'Soldes Été', impressions: 380000, clics: 15000, conversions: 980, revenu: 48000, cout: 12000 },
    { id: 3, nom: 'Promo Rentrée', impressions: 320000, clics: 9000, conversions: 720, revenu: 36000, cout: 10000 },
  ]);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performances</h1>
          <p className="text-gray-600 mt-2">Analyse des campagnes marketing</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-white border rounded-lg overflow-hidden">
            <Link href="?period=week" className={`px-4 py-2 ${period === 'week' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>Semaine</Link>
            <Link href="?period=month" className={`px-4 py-2 ${period === 'month' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>Mois</Link>
            <Link href="?period=year" className={`px-4 py-2 ${period === 'year' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>Année</Link>
          </div>
          <button className="px-4 py-2 border rounded-lg flex items-center"><Download className="w-4 h-4 mr-2" />Exporter</button>
        </div>
      </div>

      {/* KPIs globaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4"><div className="flex items-center gap-3"><Eye className="w-8 h-8 text-blue-500" /><div><p className="text-sm text-gray-600">Impressions</p><p className="text-2xl font-bold">{(globalStats.totalImpressions / 1000).toFixed(0)}K</p><p className="text-xs text-green-600">+12% vs période précédente</p></div></div></div>
        <div className="bg-white rounded-xl border p-4"><div className="flex items-center gap-3"><MousePointer className="w-8 h-8 text-green-500" /><div><p className="text-sm text-gray-600">Clics</p><p className="text-2xl font-bold">{(globalStats.totalClics / 1000).toFixed(0)}K</p><p className="text-xs text-green-600">CTR: {globalStats.ctr}%</p></div></div></div>
        <div className="bg-white rounded-xl border p-4"><div className="flex items-center gap-3"><Share2 className="w-8 h-8 text-purple-500" /><div><p className="text-sm text-gray-600">Conversions</p><p className="text-2xl font-bold">{globalStats.totalConversions}</p><p className="text-xs text-green-600">Taux: {globalStats.conversionRate}%</p></div></div></div>
        <div className="bg-white rounded-xl border p-4"><div className="flex items-center gap-3"><DollarSign className="w-8 h-8 text-orange-500" /><div><p className="text-sm text-gray-600">ROI</p><p className="text-2xl font-bold">{globalStats.roi}%</p><p className="text-xs text-green-600">+15% vs période précédente</p></div></div></div>
      </div>

      {/* Graphique (placeholder) */}
      <div className="bg-white rounded-xl border p-6"><h2 className="text-lg font-semibold mb-4">Évolution des performances</h2><div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">Graphique d'évolution (à venir)</div></div>

      {/* Performances par campagne */}
      <div className="bg-white rounded-xl border p-6"><h2 className="text-lg font-semibold mb-4">Performances par campagne</h2><div className="overflow-x-auto"><table className="w-full"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left">Campagne</th><th>Impressions</th><th>Clics</th><th>CTR</th><th>Conversions</th><th>Coût</th><th>Revenu</th><th>ROI</th></tr></thead><tbody>{campagnesPerformance.map(c => (<tr key={c.id} className="hover:bg-gray-50"><td className="px-6 py-4 font-medium">{c.nom}</td><td>{c.impressions.toLocaleString()}</td><td>{c.clics.toLocaleString()}</td><td>{((c.clics / c.impressions) * 100).toFixed(1)}%</td><td>{c.conversions}</td><td>{c.cout.toLocaleString()} €</td><td>{c.revenu.toLocaleString()} €</td><td className="text-green-600">+{((c.revenu - c.cout) / c.cout * 100).toFixed(0)}%</td></tr>))}</tbody></table></div></div>
    </div>
  );
}