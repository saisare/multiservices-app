'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3, TrendingUp, Users, AlertCircle, CheckCircle,
  Eye, Download, Filter, Clock, DollarSign, Briefcase,
  Settings, LogOut, Bell, Search
} from 'lucide-react';
import { buildServiceBase } from '@/lib/runtime-api';

const API_BASE = buildServiceBase(3002);

interface DashboardStats {
  total_users: number;
  active_users: number;
  pending_approvals: number;
  services_active: number;
  total_revenue?: number;
  active_projects?: number;
}

interface Alert {
  id: number;
  type: 'warning' | 'critical' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

export default function DirectorDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setUserData(user);

      // Charger stats
      const statsRes = await fetch(`${API_BASE}/api/auth/stats/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Charger alertes
      const alertsRes = await fetch(`${API_BASE}/api/alerts/critical`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(alertsData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const handleGenerateReport = (type: string) => {
    console.log('Générer rapport:', type);
    // API call pour générer rapport PDF/Excel
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
          <p>Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Briefcase className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-white font-bold text-lg">Tableau de Bord Directeur</h1>
              <p className="text-gray-400 text-sm">{userData?.nom} {userData?.prenom}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-white/10 rounded-lg transition">
              <Bell className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition"
            >
              <LogOut className="w-4 h-4 inline mr-2" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ALERTES CRITIQUES */}
        {alerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-white font-bold text-lg mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-red-400" />
              Alertes Critiques ({alerts.length})
            </h2>
            <div className="space-y-3">
              {alerts.map(alert => (
                <div key={alert.id} className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start space-x-4">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-red-300 font-semibold">{alert.title}</p>
                    <p className="text-red-400/70 text-sm mt-1">{alert.message}</p>
                    <p className="text-red-400/50 text-xs mt-2">{new Date(alert.timestamp).toLocaleString('fr-FR')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STATS PRINCIPALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Utilisateurs Actifs */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-400" />
              <span className="text-blue-300 text-xs font-semibold bg-blue-500/20 px-2 py-1 rounded">PERSONNEL</span>
            </div>
            <p className="text-gray-400 text-sm mb-1">Utilisateurs Actifs</p>
            <p className="text-white text-3xl font-bold">{stats?.active_users || 0}</p>
            <p className="text-gray-500 text-xs mt-3">sur {stats?.total_users || 0} total</p>
          </div>

          {/* Approbations en Attente */}
          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-yellow-400" />
              <span className="text-yellow-300 text-xs font-semibold bg-yellow-500/20 px-2 py-1 rounded">ATTENTE</span>
            </div>
            <p className="text-gray-400 text-sm mb-1">Comptes à Approuver</p>
            <p className="text-white text-3xl font-bold">{stats?.pending_approvals || 0}</p>
            <button className="mt-3 text-blue-400 hover:text-blue-300 text-xs font-semibold">
              → Voir détails
            </button>
          </div>

          {/* Services Actifs */}
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-green-400" />
              <span className="text-green-300 text-xs font-semibold bg-green-500/20 px-2 py-1 rounded">SYSTÈMES</span>
            </div>
            <p className="text-gray-400 text-sm mb-1">Services Actifs</p>
            <p className="text-white text-3xl font-bold">{stats?.services_active || 8}</p>
            <p className="text-gray-500 text-xs mt-3">BTP, Voyage, Immigration, RH, etc.</p>
          </div>

          {/* Status Global */}
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-purple-400" />
              <span className="text-purple-300 text-xs font-semibold bg-purple-500/20 px-2 py-1 rounded">STATUS</span>
            </div>
            <p className="text-gray-400 text-sm mb-1">Statut Global</p>
            <p className="text-white text-3xl font-bold">✅</p>
            <p className="text-green-400 text-xs font-semibold mt-3">Tous les services opérationnels</p>
          </div>
        </div>

        {/* ACTIONS DIRECTEUR */}
        <div className="mb-8">
          <h2 className="text-white font-bold text-lg mb-4">Actions Directeur</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Approuver Comptes */}
            <button
              onClick={() => router.push('/admin/approvals')}
              className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg p-6 transition group"
            >
              <CheckCircle className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition" />
              <h3 className="text-white font-semibold">Approuver Comptes</h3>
              <p className="text-gray-400 text-sm mt-2">Gérer les demandes de compte en attente</p>
            </button>

            {/* Générer Rapports */}
            <button
              onClick={() => router.push('/reports/generate')}
              className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-lg p-6 transition group"
            >
              <Download className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition" />
              <h3 className="text-white font-semibold">Générer Rapports</h3>
              <p className="text-gray-400 text-sm mt-2">Rapports mensuels, annuels, analyses</p>
            </button>

            {/* Superviseur Global */}
            <button
              onClick={() => router.push('/director/super-vision')}
              className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg p-6 transition group"
            >
              <Eye className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition" />
              <h3 className="text-white font-semibold">Vue Globale</h3>
              <p className="text-gray-400 text-sm mt-2">Supervision complète de tous les services</p>
            </button>
          </div>
        </div>

        {/* SUPERVISION DES SERVICES */}
        <div className="mb-8">
          <h2 className="text-white font-bold text-lg mb-4">Supervision des Services</h2>
          <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-gray-400 font-semibold text-sm">Service</th>
                    <th className="px-6 py-3 text-left text-gray-400 font-semibold text-sm">Statut</th>
                    <th className="px-6 py-3 text-left text-gray-400 font-semibold text-sm">Utilisateurs</th>
                    <th className="px-6 py-3 text-left text-gray-400 font-semibold text-sm">Actions Clés</th>
                    <th className="px-6 py-3 text-left text-gray-400 font-semibold text-sm">Accès</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { name: 'BTP & Construction', status: '🟢', users: 12, key: 'Chantiers: 8, Ouvriers: 45', route: '/director/btp' },
                    { name: 'Service Voyage & Immigration', status: '🟢', users: 8, key: 'Clients: 15, Dossiers: 23', route: '/director/voyage' },
                    { name: 'Ressources Humaines', status: '🟢', users: 6, key: 'Employés: 34, Congés: 2', route: '/director/rh' },
                    { name: 'Service Logistique', status: '🟢', users: 5, key: 'Stock: OK, Commandes: 7', route: '/director/logistique' },
                    { name: 'Assurances', status: '🟢', users: 4, key: 'Sinistres: 1, Polices: 28', route: '/director/assurances' },
                    { name: 'Communication Digitale', status: '🟢', users: 3, key: 'Campagnes: 5, Stats: Real-time', route: '/director/communication' },
                  ].map((service, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition">
                      <td className="px-6 py-4 text-white font-medium">{service.name}</td>
                      <td className="px-6 py-4 text-green-400 font-semibold">{service.status} Actif</td>
                      <td className="px-6 py-4 text-gray-400">{service.users} utilisateurs</td>
                      <td className="px-6 py-4 text-gray-400 text-sm">{service.key}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => router.push(service.route)}
                          className="text-blue-400 hover:text-blue-300 font-semibold text-sm"
                        >
                          Consulter →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RACCOURCIS RAPIDES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logs & Audit */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-white/20 transition cursor-pointer">
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-blue-400" />
              Logs & Audit
            </h3>
            <p className="text-gray-400 text-sm mb-4">Voir tous les accès, modifications, actions des utilisateurs</p>
            <button className="text-blue-400 hover:text-blue-300 text-sm font-semibold">Consulter logs →</button>
          </div>

          {/* Configuration */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-white/20 transition cursor-pointer">
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-purple-400" />
              Configuration
            </h3>
            <p className="text-gray-400 text-sm mb-4">Gérer seuils de budget, permissions, paramètres globaux</p>
            <button className="text-purple-400 hover:text-purple-300 text-sm font-semibold">Configurer →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
