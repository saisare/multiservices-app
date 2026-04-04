'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Megaphone, Users, TrendingUp, DollarSign, Eye,
  MousePointer, Share2, BarChart3, Plus, Calendar,
  Clock, CheckCircle, AlertCircle, Download,
  Facebook, Instagram, Linkedin, Twitter, Youtube
} from 'lucide-react';

interface DashboardStats {
  totalAnnonceurs: number;
  totalCampagnes: number;
  campagnesActives: number;
  impressionsTotales: number;
  clicsTotaux: number;
  conversionsTotales: number;
  revenuTotal: number;
  roiMoyen: number;
}

interface CampagneRecente {
  id: number;
  nom: string;
  annonceur: string;
  type: string;
  date_debut: string;
  budget: number;
  statut: string;
  performance: number;
}

interface PerformanceParPlateforme {
  plateforme: string;
  impressions: number;
  clics: number;
  conversions: number;
  revenu: number;
}

export default function CommunicationDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAnnonceurs: 24,
    totalCampagnes: 48,
    campagnesActives: 12,
    impressionsTotales: 1250000,
    clicsTotaux: 45000,
    conversionsTotales: 3200,
    revenuTotal: 156000,
    roiMoyen: 285
  });

  const [campagnesRecentes, setCampagnesRecentes] = useState<CampagneRecente[]>([
    { id: 1, nom: 'Lancement App', annonceur: 'Tech Solutions', type: 'Facebook Ads', date_debut: '2026-03-01', budget: 5000, statut: 'ACTIVE', performance: 78 },
    { id: 2, nom: 'Soldes Été', annonceur: 'Mode Express', type: 'Google Ads', date_debut: '2026-03-10', budget: 3000, statut: 'ACTIVE', performance: 92 },
    { id: 3, nom: 'Promo Rentrée', annonceur: 'Auto Plus', type: 'Emailing', date_debut: '2026-02-15', budget: 1500, statut: 'TERMINEE', performance: 65 },
  ]);

  const [performancesParPlateforme, setPerformancesParPlateforme] = useState<PerformanceParPlateforme[]>([
    { plateforme: 'Facebook', impressions: 450000, clics: 18000, conversions: 1200, revenu: 62000 },
    { plateforme: 'Instagram', impressions: 380000, clics: 15000, conversions: 980, revenu: 48000 },
    { plateforme: 'Google', impressions: 320000, clics: 9000, conversions: 720, revenu: 36000 },
    { plateforme: 'LinkedIn', impressions: 100000, clics: 3000, conversions: 300, revenu: 10000 },
  ]);

  const getPlateformeIcon = (plateforme: string) => {
    switch (plateforme.toLowerCase()) {
      case 'facebook': return <Facebook className="w-5 h-5 text-blue-600" />;
      case 'instagram': return <Instagram className="w-5 h-5 text-pink-600" />;
      case 'linkedin': return <Linkedin className="w-5 h-5 text-blue-800" />;
      case 'twitter': return <Twitter className="w-5 h-5 text-blue-400" />;
      case 'youtube': return <Youtube className="w-5 h-5 text-red-600" />;
      default: return <Megaphone className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communication Digitale</h1>
          <p className="text-gray-600 mt-2">Gestion des campagnes et performances marketing</p>
        </div>
        <Link href="/dashboard/communication/campagnes?action=new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle campagne
        </Link>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <Megaphone className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{stats.totalCampagnes}</span>
          </div>
          <p className="mt-2 text-sm opacity-90">Campagnes totales</p>
          <p className="text-xs mt-1">{stats.campagnesActives} actives</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <Eye className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{(stats.impressionsTotales / 1000).toFixed(0)}K</span>
          </div>
          <p className="mt-2 text-sm opacity-90">Impressions</p>
          <p className="text-xs mt-1">+18% vs mois dernier</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <MousePointer className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{(stats.clicsTotaux / 1000).toFixed(0)}K</span>
          </div>
          <p className="mt-2 text-sm opacity-90">Clics</p>
          <p className="text-xs mt-1">CTR: {(stats.clicsTotaux / stats.impressionsTotales * 100).toFixed(1)}%</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <DollarSign className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{stats.revenuTotal.toLocaleString()} €</span>
          </div>
          <p className="mt-2 text-sm opacity-90">Revenu total</p>
          <p className="text-xs mt-1">ROI: {stats.roiMoyen}%</p>
        </div>
      </div>

      {/* Deuxième ligne */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Taux de conversion</p>
              <p className="text-2xl font-bold">{(stats.conversionsTotales / stats.clicsTotaux * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Share2 className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Engagement</p>
              <p className="text-2xl font-bold">{(stats.clicsTotaux / stats.impressionsTotales * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Annonceurs</p>
              <p className="text-2xl font-bold">{stats.totalAnnonceurs}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600">Coût par clic</p>
              <p className="text-2xl font-bold">{(stats.revenuTotal / stats.clicsTotaux).toFixed(2)} €</p>
            </div>
          </div>
        </div>
      </div>

      {/* Campagnes récentes */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-500" />
            Campagnes récentes
          </h2>
          <Link href="/dashboard/communication/campagnes" className="text-sm text-blue-600 hover:underline">
            Voir tout
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Annonceur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {campagnesRecentes.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{c.nom}</td>
                  <td className="px-6 py-4">{c.annonceur}</td>
                  <td className="px-6 py-4">{c.type}</td>
                  <td className="px-6 py-4">{c.budget.toLocaleString()} €</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${c.performance}%` }} />
                      </div>
                      <span className="text-sm">{c.performance}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${c.statut === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {c.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/communication/campagnes?id=${c.id}`} className="text-blue-600 hover:text-blue-800">
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performances par plateforme */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
          Performances par plateforme
        </h2>
        <div className="space-y-4">
          {performancesParPlateforme.map(p => (
            <div key={p.plateforme} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getPlateformeIcon(p.plateforme)}
                <div>
                  <p className="font-medium">{p.plateforme}</p>
                  <p className="text-sm text-gray-500">{(p.impressions / 1000).toFixed(0)}K impressions</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Clics</p>
                  <p className="font-medium">{p.clics.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Conversions</p>
                  <p className="font-medium">{p.conversions}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Revenu</p>
                  <p className="font-medium">{p.revenu.toLocaleString()} €</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-xl font-semibold mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/dashboard/communication/annonceurs?action=new" className="flex flex-col items-center p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-all">
            <Users className="w-6 h-6 mb-2" />
            <span className="text-sm text-center">Nouvel annonceur</span>
          </Link>
          <Link href="/dashboard/communication/campagnes?action=new" className="flex flex-col items-center p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-all">
            <Megaphone className="w-6 h-6 mb-2" />
            <span className="text-sm text-center">Nouvelle campagne</span>
          </Link>
          <Link href="/dashboard/communication/performances" className="flex flex-col items-center p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-all">
            <BarChart3 className="w-6 h-6 mb-2" />
            <span className="text-sm text-center">Rapports</span>
          </Link>
          <Link href="#" className="flex flex-col items-center p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-all">
            <Download className="w-6 h-6 mb-2" />
            <span className="text-sm text-center">Exporter données</span>
          </Link>
        </div>
      </div>
    </div>
  );
}