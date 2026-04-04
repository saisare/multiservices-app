'use client';

import { useEffect, useState } from 'react';
import { buildServiceBase } from '@/lib/runtime-api';
import {
  Users, ServerCog, Bell, CheckCircle, XCircle, Clock,
  AlertCircle, Loader, Eye, Trash2, ToggleLeft, ToggleRight
} from 'lucide-react';

const AUTH_API_BASE = buildServiceBase(3002);

interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  departement: string;
  role: string;
  actif: number;
  hidden?: number;
}

interface PendingUser {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  poste?: string;
  departement: string;
  telephone?: string;
  status: string;
  requested_at: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'pending' | 'users'>('pending');
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rejectReason, setRejectReason] = useState<{ [key: number]: string }>({});

  const getToken = () => localStorage.getItem('token');

  const fetchUsers = async () => {
    try {
      const token = getToken();
      if (!token) throw new Error('Non connecté');

      const res = await fetch(`${AUTH_API_BASE}/api/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Impossible de récupérer les utilisateurs');
      setUsers(data);
    } catch (err: unknown) {
      setError((err as Error).message || 'Erreur inconnue');
    }
  };

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) throw new Error('Non connecté');

      const res = await fetch(`${AUTH_API_BASE}/api/auth/pending-users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Impossible de récupérer les comptes en attente');
      setPendingUsers(data.users || []);
    } catch (err: unknown) {
      setError((err as Error).message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (pendingUserId: number) => {
    try {
      const token = getToken();
      const res = await fetch(`${AUTH_API_BASE}/api/auth/users/${pendingUserId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erreur approbation');

      setSuccess(`✅ Compte approuvé: ${data.user.email}`);
      setError('');
      setTimeout(() => {
        fetchPendingUsers();
        fetchUsers();
        setSuccess('');
      }, 1500);
    } catch (err: unknown) {
      setError((err as Error).message || 'Erreur inconnue');
    }
  };

  const rejectUser = async (pendingUserId: number) => {
    try {
      const token = getToken();
      const reason = rejectReason[pendingUserId] || '';

      const res = await fetch(`${AUTH_API_BASE}/api/auth/users/${pendingUserId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erreur rejet');

      setSuccess(`❌ Compte rejeté: ${data.user.email}`);
      setError('');
      setRejectReason({ ...rejectReason, [pendingUserId]: '' });
      setTimeout(() => {
        fetchPendingUsers();
        setSuccess('');
      }, 1500);
    } catch (err: unknown) {
      setError((err as Error).message || 'Erreur inconnue');
    }
  };

  const hideUser = async (id: number) => {
    try {
      const token = getToken();
      const res = await fetch(`${AUTH_API_BASE}/api/auth/users/${id}/hide`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ hidden: true })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erreur');

      setSuccess(data.message);
      setTimeout(() => {
        fetchUsers();
        setSuccess('');
      }, 1500);
    } catch (err: unknown) {
      setError((err as Error).message || 'Erreur inconnue');
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer définitivement cet utilisateur ?')) return;
    try {
      const token = getToken();
      const res = await fetch(`${AUTH_API_BASE}/api/auth/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erreur');

      setSuccess(data.message);
      setTimeout(() => {
        fetchUsers();
        setSuccess('');
      }, 1500);
    } catch (err: unknown) {
      setError((err as Error).message || 'Erreur inconnue');
    }
  };

  const toggleUserActive = async (id: number, currentStatus: boolean) => {
    try {
      const token = getToken();
      const res = await fetch(`${AUTH_API_BASE}/api/auth/users/${id}/activate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ actif: !currentStatus })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erreur');

      setSuccess(data.message);
      setTimeout(() => {
        fetchUsers();
        setSuccess('');
      }, 1500);
    } catch (err: unknown) {
      setError((err as Error).message || 'Erreur inconnue');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPendingUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
        <p className="text-gray-600 mt-1">Gestion centralisée des utilisateurs et approbations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <Users className="w-6 h-6 opacity-80 mb-2" />
          <p className="text-sm opacity-90">Utilisateurs actifs</p>
          <p className="text-2xl font-bold">{users.filter(u => u.actif).length}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <Clock className="w-6 h-6 opacity-80 mb-2" />
          <p className="text-sm opacity-90">En attente d'approbation</p>
          <p className="text-2xl font-bold">{pendingUsers.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <CheckCircle className="w-6 h-6 opacity-80 mb-2" />
          <p className="text-sm opacity-90">Total approuvés</p>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <ServerCog className="w-6 h-6 opacity-80 mb-2" />
          <p className="text-sm opacity-90">Services</p>
          <p className="text-2xl font-bold">8</p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex gap-3 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex gap-3 p-4 bg-green-100 border border-green-300 rounded-lg text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{success}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${
            activeTab === 'pending'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Clock className="w-5 h-5" />
          Approbations en attente ({pendingUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${
            activeTab === 'users'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="w-5 h-5" />
          Utilisateurs ({users.length})
        </button>
      </div>

      {/* PENDING USERS TAB */}
      {activeTab === 'pending' && (
        <div>
          {loading && (
            <div className="flex justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-orange-600" />
            </div>
          )}

          {!loading && pendingUsers.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border">
              <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun compte en attente d'approbation</p>
            </div>
          )}

          {!loading && pendingUsers.length > 0 && (
            <div className="space-y-4">
              {pendingUsers.map(pending => (
                <div key={pending.id} className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {pending.prenom} {pending.nom}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{pending.email}</p>
                    </div>
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                      En attente
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-600">Département</p>
                      <p className="font-medium text-gray-900">{pending.departement}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Poste</p>
                      <p className="font-medium text-gray-900">{pending.poste || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Téléphone</p>
                      <p className="font-medium text-gray-900">{pending.telephone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Demandé le</p>
                      <p className="font-medium text-gray-900">
                        {new Date(pending.requested_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <textarea
                      placeholder="Motif de rejet (optionnel)..."
                      value={rejectReason[pending.id] || ''}
                      onChange={(e) => setRejectReason({ ...rejectReason, [pending.id]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => approveUser(pending.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approuver
                    </button>
                    <button
                      onClick={() => rejectUser(pending.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Rejeter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">Utilisateur</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">Rôle</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">Département</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">Statut</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{user.email}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.prenom} {user.nom}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.departement}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      {user.actif && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Actif
                        </span>
                      )}
                      {!user.actif && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          Inactif
                        </span>
                      )}
                      {user.hidden && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          Caché
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm space-x-2">
                    <button
                      onClick={() => toggleUserActive(user.id, user.actif === 1)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title={user.actif ? 'Désactiver' : 'Activer'}
                    >
                      {user.actif ? (
                        <ToggleRight className="w-5 h-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => hideUser(user.id)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title="Cacher"
                    >
                      <Eye className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
