'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Shield, Users, FileText, AlertTriangle, TrendingUp,
  Plus, Search, Calendar, DollarSign, Clock,
  CheckCircle, XCircle, Eye, FileCheck
} from 'lucide-react';

interface DashboardStats {
  totalAssures: number;
  policesActives: number;
  sinistresEnCours: number;
  sinistresClotures: number;
  primeTotale: number;
  indemnitesVersees: number;
  sinistresMois: number;
  tauxSinistralite: number;
}

interface SinistreRecent {
  id: number;
  numero_sinistre: string;
  assure_nom: string;
  type_assurance: string;
  date_sinistre: string;
  montant_estime: number;
  statut: string;
}

interface Alerte {
  id: number;
  type: string;
  message: string;
  priorite: 'HAUTE' | 'MOYENNE' | 'BASSE';
}

export default function AssuranceDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAssures: 128,
    policesActives: 156,
    sinistresEnCours: 8,
    sinistresClotures: 24,
    primeTotale: 45600,
    indemnitesVersees: 18750,
    sinistresMois: 5,
    tauxSinistralite: 32
  });

  const [sinistresRecents, setSinistresRecents] = useState<SinistreRecent[]>([
    { id: 1, numero_sinistre: 'SIN-2024-001', assure_nom: 'Jean Konan', type_assurance: 'AUTO', date_sinistre: '2026-03-15', montant_estime: 2500, statut: 'EN_INSTRUCTION' },
    { id: 2, numero_sinistre: 'SIN-2024-002', assure_nom: 'Marie Diallo', type_assurance: 'HABITATION', date_sinistre: '2026-03-14', montant_estime: 800, statut: 'DECLARE' },
    { id: 3, numero_sinistre: 'SIN-2024-003', assure_nom: 'Amadou Touré', type_assurance: 'SANTE', date_sinistre: '2026-03-10', montant_estime: 450, statut: 'ACCEPTE' },
  ]);

  const [alertes, setAlertes] = useState<Alerte[]>([
    { id: 1, type: 'Echéance', message: 'Police AUTO-2024-001 expire dans 15 jours', priorite: 'HAUTE' },
    { id: 2, type: 'Sinistre', message: 'SIN-2024-001 en attente de validation expert', priorite: 'MOYENNE' },
    { id: 3, type: 'Document', message: 'Attestation pour SIN-2024-002 manquante', priorite: 'BASSE' },
  ]);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assurance</h1>
          <p className="text-gray-600 mt-2">Gestion des polices et sinistres</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/dashboard/assurance/assures?action=new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Nouvel assuré
          </Link>
          <Link href="/dashboard/assurance/polices?action=new" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Nouvelle police
          </Link>
          <Link href="/dashboard/assurance/sinistres?action=new" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Déclarer sinistre
          </Link>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <Users className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{stats.totalAssures}</span>
          </div>
          <p className="mt-2 text-sm opacity-90">Assurés</p>
          <p className="text-xs mt-1">{stats.policesActives} polices actives</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <DollarSign className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{stats.primeTotale.toLocaleString()} €</span>
          </div>
          <p className="mt-2 text-sm opacity-90">Primes annuelles</p>
          <p className="text-xs mt-1">+12% vs année dernière</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <AlertTriangle className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{stats.sinistresEnCours}</span>
          </div>
          <p className="mt-2 text-sm opacity-90">Sinistres en cours</p>
          <p className="text-xs mt-1">{stats.sinistresMois} ce mois</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{stats.tauxSinistralite}%</span>
          </div>
          <p className="mt-2 text-sm opacity-90">Taux de sinistralité</p>
          <p className="text-xs mt-1">-5% vs année dernière</p>
        </div>
      </div>

      {/* Sinistres récents et alertes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sinistres récents */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
              Sinistres récents
            </h2>
            <Link href="/dashboard/assurance/sinistres" className="text-sm text-blue-600 hover:underline">Voir tout</Link>
          </div>
          <div className="space-y-3">
            {sinistresRecents.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{s.numero_sinistre}</p>
                  <p className="text-sm text-gray-600">{s.assure_nom} - {s.type_assurance}</p>
                  <p className="text-xs text-gray-500">{new Date(s.date_sinistre).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{s.montant_estime} €</p>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    s.statut === 'ACCEPTE' ? 'bg-green-100 text-green-700' :
                    s.statut === 'EN_INSTRUCTION' ? 'bg-blue-100 text-blue-700' :
                    s.statut === 'DECLARE' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>{s.statut}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-red-500" />
            Alertes
          </h2>
          <div className="space-y-3">
            {alertes.map(a => (
              <div key={a.id} className={`p-3 rounded-lg border-l-4 ${
                a.priorite === 'HAUTE' ? 'bg-red-50 border-red-500' :
                a.priorite === 'MOYENNE' ? 'bg-yellow-50 border-yellow-500' :
                'bg-blue-50 border-blue-500'
              }`}>
                <p className="text-sm font-medium">{a.message}</p>
                <p className="text-xs text-gray-500 mt-1">{a.type}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-xl font-semibold mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/dashboard/assurance/assures?action=new" className="flex flex-col items-center p-4 bg-white/10 hover:bg-white/20 rounded-lg">
            <Users className="w-6 h-6 mb-2" />
            <span>Nouvel assuré</span>
          </Link>
          <Link href="/dashboard/assurance/polices?action=new" className="flex flex-col items-center p-4 bg-white/10 hover:bg-white/20 rounded-lg">
            <FileText className="w-6 h-6 mb-2" />
            <span>Nouvelle police</span>
          </Link>
          <Link href="/dashboard/assurance/sinistres?action=new" className="flex flex-col items-center p-4 bg-white/10 hover:bg-white/20 rounded-lg">
            <AlertTriangle className="w-6 h-6 mb-2" />
            <span>Déclarer sinistre</span>
          </Link>
          <Link href="/dashboard/assurance/experts" className="flex flex-col items-center p-4 bg-white/10 hover:bg-white/20 rounded-lg">
            <Users className="w-6 h-6 mb-2" />
            <span>Experts</span>
          </Link>
        </div>
      </div>
    </div>
  );
}