'use client';

import { useState, useEffect } from 'react';
import { FileText, Users, Calendar, CheckCircle, Clock, AlertCircle, Plus, Loader } from 'lucide-react';
import Link from 'next/link';
import { voyageApi } from '@/services/api/voyage.api';

export default function ImmigrationPage() {
  const [stats, setStats] = useState({
    totalClients: 0,
    dossiersEnCours: 0,
    rendezVousAujourdhui: 0,
    dossiersApprouves: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const candidates = await voyageApi.getImmigrationCandidates();
      const dossiers = await voyageApi.getDossiers();
      const rendezVous = await voyageApi.getRendezVous();

      setStats({
        totalClients: candidates?.length || 0,
        dossiersEnCours: (dossiers?.filter((d: any) => d.statut === 'EN_ATTENTE') || []).length,
        rendezVousAujourdhui: rendezVous?.filter((r: any) => {
          const today = new Date().toDateString();
          return new Date(r.date_rdv || r.date_rendez_vous).toDateString() === today;
        }).length || 0,
        dossiersApprouves: (dossiers?.filter((d: any) => d.statut === 'APPROUVE') || []).length
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
          <Loader className="w-8 h-8 animate-spin text-green-600" />
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
          <h1 className="text-3xl font-bold text-gray-900">Service Immigration</h1>
          <p className="text-gray-600 mt-2">Gestion des clients, dossiers et rendez-vous</p>
        </div>
        <Link
          href="/dashboard/service-immigration/candidat?action=new"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouveau dossier
        </Link>
      </div>

      {error && (
        <div className="flex gap-3 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <Users className="w-8 h-8 opacity-80 mb-3" />
          <p className="text-sm opacity-90">Clients actifs</p>
          <p className="text-3xl font-bold mt-2">{stats.totalClients}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <FileText className="w-8 h-8 opacity-80 mb-3" />
          <p className="text-sm opacity-90">En cours de traitement</p>
          <p className="text-3xl font-bold mt-2">{stats.dossiersEnCours}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <Calendar className="w-8 h-8 opacity-80 mb-3" />
          <p className="text-sm opacity-90">RDV aujourd'hui</p>
          <p className="text-3xl font-bold mt-2">{stats.rendezVousAujourdhui}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <CheckCircle className="w-8 h-8 opacity-80 mb-3" />
          <p className="text-sm opacity-90">Dossiers approuvés</p>
          <p className="text-3xl font-bold mt-2">{stats.dossiersApprouves}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/service-immigration/candidat"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Gestion Candidats</h3>
              <p className="text-sm text-gray-600">Ajouter et gérer</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/service-immigration/dossiers"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Dossiers</h3>
              <p className="text-sm text-gray-600">Suivre les demandes</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/service-immigration/rendey-vous"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Rendez-vous</h3>
              <p className="text-sm text-gray-600">Planifier les RDV</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Reminders */}
      <div className="space-y-3">
        {stats.rendezVousAujourdhui > 0 && (
          <div className="flex gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">
                {stats.rendezVousAujourdhui} rendez-vous aujourd'hui
              </h3>
              <p className="text-sm text-blue-700">N'oubliez pas de préparer les documents.</p>
            </div>
          </div>
        )}

        {stats.dossiersEnCours > 0 && (
          <div className="flex gap-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <Clock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-orange-900">
                {stats.dossiersEnCours} dossier(s) en attente
              </h3>
              <p className="text-sm text-orange-700">Ces demandes nécessitent une attention particulière.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
