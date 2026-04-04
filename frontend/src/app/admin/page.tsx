'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { buildServiceBase } from '@/lib/runtime-api';
import {
  LogOut, Users, CheckCircle, BarChart3, Shield, AlertCircle, Clock, Trash2
} from 'lucide-react';

const AUTH_API_BASE = buildServiceBase(3002);

interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  departement: string;
  actif: number;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({ total: 0, actifs: 0, attente: 0 });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      router.push('/admin-login');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== 'admin') {
      router.push('/login');
      return;
    }

    setAdminUser(userData);
    loadUsers();
  }, [router]);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${AUTH_API_BASE}/api/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        calculateStats(data);
      }
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (userList: User[]) => {
    setStats({
      total: userList.length,
      actifs: userList.filter(u => u.actif === 1).length,
      attente: userList.filter(u => u.actif === 0).length
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    router.push('/');
  };

  const handleApprove = async (userId: number) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${AUTH_API_BASE}/api/auth/users/${userId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        loadUsers();
      }
    } catch (err) {
      console.error('Erreur approbation:', err);
    }
  };

  const handleDelete = async (userId: number) => {
    if(!confirm('Êtes-vous sûr?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${AUTH_API_BASE}/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        loadUsers();
      }
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-red-900/20 border-b border-red-600/30 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-400" />
            <div>
              <h1 className="text-2xl font-bold">PANNEAU ADMINISTRATEUR</h1>
              <p className="text-gray-400 text-sm">{adminUser?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-7xl mx-auto p-4">
        {/* Navigation  */}
        <div className="flex gap-4 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 ${activeTab === 'dashboard' ? 'border-b-2 border-red-400 text-red-400' : 'text-gray-400'}`}
          >
            📊 Tableau de bord
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 ${activeTab === 'users' ? 'border-b-2 border-red-400 text-red-400' : 'text-gray-400'}`}
          >
            👥 Utilisateurs
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-4 py-2 ${activeTab === 'approvals' ? 'border-b-2 border-red-400 text-red-400' : 'text-gray-400'}`}
          >
            ✅ Approbations
          </button>
        </div>

        {/* TAB: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Utilisateurs</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <Users className="w-12 h-12 text-blue-400 opacity-50" />
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Utilisateurs Actifs</p>
                  <p className="text-3xl font-bold text-green-400">{stats.actifs}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-400 opacity-50" />
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">En Attente d'Approbation</p>
                  <p className="text-3xl font-bold text-yellow-400">{stats.attente}</p>
                </div>
                <Clock className="w-12 h-12 text-yellow-400 opacity-50" />
              </div>
            </div>
          </div>
        )}

        {/* TAB: Tous les utilisateurs */}
        {activeTab === 'users' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Nom</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Rôle</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Département</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Statut</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="px-6 py-4 text-sm">{user.email}</td>
                      <td className="px-6 py-4 text-sm">{user.prenom} {user.nom}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 bg-blue-600/30 text-blue-300 rounded text-xs">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{user.departement}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={user.actif === 1 ? 'text-green-400' : 'text-yellow-400'}>
                          {user.actif === 1 ? '✅ Actif' : '⏳ En attente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        {user.actif === 0 && (
                          <button
                            onClick={() => handleApprove(user.id)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs transition"
                          >
                            Approuver
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: Approbations */}
        {activeTab === 'approvals' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Nom</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Département</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Date Demande</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => u.actif === 0).map(user => (
                    <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="px-6 py-4 text-sm">{user.email}</td>
                      <td className="px-6 py-4 text-sm">{user.prenom} {user.nom}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{user.departement}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <button
                          onClick={() => handleApprove(user.id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs transition"
                        >
                          ✅ Approuver
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition"
                        >
                          ❌ Refuser
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.filter(u => u.actif === 0).length === 0 && (
              <div className="p-6 text-center text-gray-400">
                ✅ Aucune demande en attente
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
