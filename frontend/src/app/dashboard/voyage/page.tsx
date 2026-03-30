'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plane, Hotel, Calendar, FileText, Users, Globe,
  TrendingUp, DollarSign, Clock, CheckCircle, AlertCircle,
  Plus, MapPin, Briefcase, Passport, MapPinned
} from 'lucide-react';

export default function VoyageDashboard() {
  const [activeTab, setActiveTab] = useState<'voyage' | 'immigration'>('voyage');
  
  // Stats Voyage
  const [statsVoyage, setStatsVoyage] = useState({
    totalClients: 128,
    totalReservations: 156,
    chiffreAffaires: 125000,
    tauxOccupation: 78,
    destinations: 24
  });

  // Stats Immigration
  const [statsImmigration, setStatsImmigration] = useState({
    totalDossiers: 32,
    dossiersValides: 24,
    dossiersPending: 6,
    tauxApprobation: 85,
    rendezVous: 8
  });

  return (
    <div className="space-y-6">
      {/* Header unifié */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Voyage & Immigration</h1>
          <p className="text-gray-600 mt-2">Gestion des voyages et dossiers de visa</p>
        </div>
        <div className="flex space-x-3">
          {activeTab === 'voyage' && (
            <Link href="/dashboard/voyage/offres?action=new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle réservation
            </Link>
          )}
          {activeTab === 'immigration' && (
            <Link href="/dashboard/voyage/rendey-vous?action=new" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau dossier
            </Link>
          )}
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
          <Passport className="w-5 h-5" />
          Service Immigration
        </button>
      </div>

      {/* SECTION VOYAGE */}
      {activeTab === 'voyage' && (
        <div className="space-y-6">
          {/* Stats Voyage */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <Users className="w-8 h-8 opacity-80" />
                <span className="text-2xl font-bold">{statsVoyage.totalClients}</span>
              </div>
              <p className="mt-2 text-sm opacity-90">Clients</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <Calendar className="w-8 h-8 opacity-80" />
                <span className="text-2xl font-bold">{statsVoyage.totalReservations}</span>
              </div>
              <p className="mt-2 text-sm opacity-90">Réservations</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <DollarSign className="w-8 h-8 opacity-80" />
                <span className="text-2xl font-bold">{statsVoyage.chiffreAffaires / 1000}K €</span>
              </div>
              <p className="mt-2 text-sm opacity-90">Chiffre d'affaires</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <Globe className="w-8 h-8 opacity-80" />
                <span className="text-2xl font-bold">{statsVoyage.destinations}</span>
              </div>
              <p className="mt-2 text-sm opacity-90">Destinations</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <TrendingUp className="w-8 h-8 opacity-80" />
                <span className="text-2xl font-bold">{statsVoyage.tauxOccupation}%</span>
              </div>
              <p className="mt-2 text-sm opacity-90">Occupation</p>
            </div>
          </div>

          {/* Actions Voyage */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/dashboard/voyage/clients" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all">
              <Users className="w-8 h-8 text-blue-500 mb-2" />
              <p className="font-semibold">Clients</p>
              <p className="text-sm text-gray-600">Gérer les voyageurs</p>
            </Link>
            <Link href="/dashboard/voyage/destinations" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all">
              <Globe className="w-8 h-8 text-green-500 mb-2" />
              <p className="font-semibold">Destinations</p>
              <p className="text-sm text-gray-600">Villes & pays</p>
            </Link>
            <Link href="/dashboard/voyage/offres" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all">
              <Plane className="w-8 h-8 text-purple-500 mb-2" />
              <p className="font-semibold">Offres</p>
              <p className="text-sm text-gray-600">Vols & hôtels</p>
            </Link>
            <Link href="/dashboard/voyage/offres" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all">
              <Calendar className="w-8 h-8 text-orange-500 mb-2" />
              <p className="font-semibold">Réservations</p>
              <p className="text-sm text-gray-600">Gestion des réservations</p>
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
              <div className="flex items-center justify-between">
                <FileText className="w-8 h-8 opacity-80" />
                <span className="text-2xl font-bold">{statsImmigration.totalDossiers}</span>
              </div>
              <p className="mt-2 text-sm opacity-90">Dossiers total</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <CheckCircle className="w-8 h-8 opacity-80" />
                <span className="text-2xl font-bold">{statsImmigration.dossiersValides}</span>
              </div>
              <p className="mt-2 text-sm opacity-90">Approuvés</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <Clock className="w-8 h-8 opacity-80" />
                <span className="text-2xl font-bold">{statsImmigration.dossiersPending}</span>
              </div>
              <p className="mt-2 text-sm opacity-90">En attente</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <Calendar className="w-8 h-8 opacity-80" />
                <span className="text-2xl font-bold">{statsImmigration.rendezVous}</span>
              </div>
              <p className="mt-2 text-sm opacity-90">RDV prévus</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <TrendingUp className="w-8 h-8 opacity-80" />
                <span className="text-2xl font-bold">{statsImmigration.tauxApprobation}%</span>
              </div>
              <p className="mt-2 text-sm opacity-90">Taux approbation</p>
            </div>
          </div>

          {/* Actions Immigration */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/dashboard/voyage/candidat" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all">
              <Briefcase className="w-8 h-8 text-green-500 mb-2" />
              <p className="font-semibold">Candidats</p>
              <p className="text-sm text-gray-600">Gérer les candidats</p>
            </Link>
            <Link href="/dashboard/voyage/dossiers" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all">
              <FileText className="w-8 h-8 text-blue-500 mb-2" />
              <p className="font-semibold">Dossiers</p>
              <p className="text-sm text-gray-600">Suivi des dossiers</p>
            </Link>
            <Link href="/dashboard/voyage/rendey-vous" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all">
              <Calendar className="w-8 h-8 text-purple-500 mb-2" />
              <p className="font-semibold">Rendez-vous</p>
              <p className="text-sm text-gray-600">Planification</p>
            </Link>
            <Link href="/dashboard/voyage/candidat" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all">
              <Passport className="w-8 h-8 text-orange-500 mb-2" />
              <p className="font-semibold">Visas</p>
              <p className="text-sm text-gray-600">Gestion des visas</p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}