'use client';

import { useState, useEffect } from 'react';
import { FileText, Users, Calendar, CheckCircle, Clock, AlertCircle, Plus } from 'lucide-react';
import Link from 'next/link';

export default function ImmigrationPage() {
  const [stats, setStats] = useState({
    totalClients: 0,
    dossiersEnCours: 0,
    rendezVousAujourdhui: 0,
    dossiersApprouves: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulation de chargement des données
    const timer = setTimeout(() => {
      setStats({
        totalClients: 45,
        dossiersEnCours: 12,
        rendezVousAujourdhui: 3,
        dossiersApprouves: 28
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement du tableau de bord Immigration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Immigration Allemande</h1>
          <p className="text-gray-600 mt-2">Gestion des clients, dossiers et rendez-vous</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/service-immigration/candidat/nouveau"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau client
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <Users className="w-8 h-8 text-blue-500" />
            <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
              {stats.totalClients}
            </span>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.totalClients}</p>
          <p className="text-sm text-gray-600">Clients actifs</p>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <FileText className="w-8 h-8 text-orange-500" />
            <span className="text-xs font-medium px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
              {stats.dossiersEnCours}
            </span>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.dossiersEnCours}</p>
          <p className="text-sm text-gray-600">Dossiers en cours</p>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <Calendar className="w-8 h-8 text-green-500" />
            <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
              {stats.rendezVousAujourdhui}
            </span>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.rendezVousAujourdhui}</p>
          <p className="text-sm text-gray-600">RDV aujourd'hui</p>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
              {stats.dossiersApprouves}
            </span>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.dossiersApprouves}</p>
          <p className="text-sm text-gray-600">Dossiers approuvés</p>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/service-immigration/candidat"
          className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <Users className="w-10 h-10 text-blue-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Gestion Clients</h3>
              <p className="text-gray-600">Ajouter et gérer les clients</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/service-immigration/dossiers"
          className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <FileText className="w-10 h-10 text-orange-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Dossiers</h3>
              <p className="text-gray-600">Suivre les demandes d'immigration</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/service-immigration/rendey-vous"
          className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <Calendar className="w-10 h-10 text-green-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Rendez-vous</h3>
              <p className="text-gray-600">Planifier et gérer les RDV</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Alertes importantes */}
      <div className="space-y-4">
        {stats.rendezVousAujourdhui > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">
                  {stats.rendezVousAujourdhui} rendez-vous aujourd'hui
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  N'oubliez pas de préparer les documents nécessaires.
                </p>
              </div>
            </div>
          </div>
        )}

        {stats.dossiersEnCours > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-orange-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-orange-800">
                  {stats.dossiersEnCours} dossiers en attente de traitement
                </h3>
                <p className="text-sm text-orange-700 mt-1">
                  Certains dossiers nécessitent une attention particulière.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
