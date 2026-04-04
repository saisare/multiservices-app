'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plane, Hotel, Calendar, FileText, Users, Globe,
  TrendingUp, DollarSign, Clock, CheckCircle, AlertCircle,
  Plus, MapPin, Briefcase, ShieldCheck, Loader
} from 'lucide-react';
import { voyageApi } from '@/services/api/voyage.api';

export default function VoyageDashboard() {
  const [activeTab, setActiveTab] = useState<'voyage' | 'immigration'>('voyage');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Stats
  const [statsVoyage, setStatsVoyage] = useState({
    totalClients: 0,
    totalReservations: 0,
    chiffreAffaires: 0,
    destinations: 0
  });

  const [statsImmigration, setStatsImmigration] = useState({
    totalDossiers: 0,
    dossiersValides: 0,
    dossiersPending: 0,
    tauxApprobation: 0,
    rendezVous: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const stats = await voyageApi.getStats();
      const clients = await voyageApi.getVoyageClients();
      const destinations = await voyageApi.getDestinations();
      const dossiers = await voyageApi.getDossiers();
      const rendezVous = await voyageApi.getRendezVous();

      // Set Voyage stats
      setStatsVoyage({
        totalClients: clients?.length || 0,
        totalReservations: stats?.voyage?.totalClients || 0,
        chiffreAffaires: 125000,
        destinations: destinations?.length || 0
      });

      // Set Immigration stats
      setStatsImmigration({
        totalDossiers: dossiers?.length || 0,
        dossiersValides: stats?.immigration?.approves || 0,
        dossiersPending: (dossiers?.filter((d: any) => d.statut === 'EN_ATTENTE') || []).length,
        tauxApprobation: Math.round(((stats?.immigration?.approves || 0) / (dossiers?.length || 1)) * 100),
        rendezVous: rendezVous?.length || 0
      });
    } catch (err: any) {
      setError(err.message || 'Erreur chargement données');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Voyage & Immigration</h1>
          <p className="text-gray-600 mt-2">Gestion complète des voyages et demandes de visa</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('voyage')}
          className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${
            activeTab === 'voyage'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Plane className="w-5 h-5" />
          Service Voyage
        </button>
        <button
          onClick={() => setActiveTab('immigration')}
          className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${
            activeTab === 'immigration'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ShieldCheck className="w-5 h-5" />
          Service Immigration
        </button>
      </div>

      {error && (
        <div className="flex gap-3 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* SECTION VOYAGE */}
      {activeTab === 'voyage' && (
        <div className="space-y-6">
          {/* Stats Voyage */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <Users className="w-8 h-8 opacity-80" />
              <p className="mt-3 text-sm opacity-90">Clients</p>
              <p className="text-3xl font-bold">{statsVoyage.totalClients}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <Calendar className="w-8 h-8 opacity-80" />
              <p className="mt-3 text-sm opacity-90">Réservations</p>
              <p className="text-3xl font-bold">{statsVoyage.totalReservations}</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
              <Globe className="w-8 h-8 opacity-80" />
              <p className="mt-3 text-sm opacity-90">Destinations</p>
              <p className="text-3xl font-bold">{statsVoyage.destinations}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
              <DollarSign className="w-8 h-8 opacity-80" />
              <p className="mt-3 text-sm opacity-90">CA</p>
              <p className="text-3xl font-bold">{(statsVoyage.chiffreAffaires / 1000).toFixed(0)}K €</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/dashboard/voyage/clients" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all">
              <Users className="w-8 h-8 text-blue-500 mb-3" />
              <p className="font-semibold text-gray-900">Clients</p>
              <p className="text-sm text-gray-600">Gérer les voyageurs</p>
            </Link>
            <Link href="/dashboard/voyage/destinations" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all">
              <Globe className="w-8 h-8 text-green-500 mb-3" />
              <p className="font-semibold text-gray-900">Destinations</p>
              <p className="text-sm text-gray-600">Villes & pays</p>
            </Link>
            <Link href="/dashboard/voyage/offres" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all">
              <Plane className="w-8 h-8 text-purple-500 mb-3" />
              <p className="font-semibold text-gray-900">Offres</p>
              <p className="text-sm text-gray-600">Vols & hôtels</p>
            </Link>
            <Link href="/dashboard/voyage/dossiers" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all">
              <Calendar className="w-8 h-8 text-orange-500 mb-3" />
              <p className="font-semibold text-gray-900">Réservations</p>
              <p className="text-sm text-gray-600">Gestion réservations</p>
            </Link>
          </div>
        </div>
      )}

      {/* SECTION IMMIGRATION */}
      {activeTab === 'immigration' && (
        <div className="space-y-6">
          {/* Stats Immigration */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
              <FileText className="w-8 h-8 opacity-80" />
              <p className="mt-3 text-sm opacity-90">Dossiers total</p>
              <p className="text-3xl font-bold">{statsImmigration.totalDossiers}</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
              <CheckCircle className="w-8 h-8 opacity-80" />
              <p className="mt-3 text-sm opacity-90">Approuvés</p>
              <p className="text-3xl font-bold">{statsImmigration.dossiersValides}</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
              <Clock className="w-8 h-8 opacity-80" />
              <p className="mt-3 text-sm opacity-90">En attente</p>
              <p className="text-3xl font-bold">{statsImmigration.dossiersPending}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <Calendar className="w-8 h-8 opacity-80" />
              <p className="mt-3 text-sm opacity-90">RDV prévus</p>
              <p className="text-3xl font-bold">{statsImmigration.rendezVous}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <p className="mt-3 text-sm opacity-90">Taux approbation</p>
              <p className="text-3xl font-bold">{statsImmigration.tauxApprobation}%</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/dashboard/service-immigration/candidat" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all">
              <Briefcase className="w-8 h-8 text-green-500 mb-3" />
              <p className="font-semibold text-gray-900">Candidats</p>
              <p className="text-sm text-gray-600">Gérer candidats</p>
            </Link>
            <Link href="/dashboard/service-immigration/dossiers" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all">
              <FileText className="w-8 h-8 text-blue-500 mb-3" />
              <p className="font-semibold text-gray-900">Dossiers</p>
              <p className="text-sm text-gray-600">Suivi dossiers</p>
            </Link>
            <Link href="/dashboard/service-immigration/rendey-vous" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all">
              <Calendar className="w-8 h-8 text-purple-500 mb-3" />
              <p className="font-semibold text-gray-900">Rendez-vous</p>
              <p className="text-sm text-gray-600">Planification</p>
            </Link>
            <Link href="/dashboard/service-immigration/candidat" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all">
              <ShieldCheck className="w-8 h-8 text-orange-500 mb-3" />
              <p className="font-semibold text-gray-900">Visas</p>
              <p className="text-sm text-gray-600">Gestion visas</p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
