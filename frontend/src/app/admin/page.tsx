'use client';

import { Fragment, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { buildServiceBase } from '@/lib/runtime-api';
import {
  LogOut, Users, CheckCircle, BarChart3, Shield, AlertCircle, Clock, Trash2, Key, Loader2
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
  has_password_vault?: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({ total: 0, actifs: 0, attente: 0 });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [resetPasswordId, setResetPasswordId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resettingUserId, setResettingUserId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [approvingUserId, setApprovingUserId] = useState<number | null>(null);
  const [approvalChecks, setApprovalChecks] = useState<{ [key: number]: { identity: boolean; department: boolean } }>({});
  const [gatePassword, setGatePassword] = useState('root');
  const [currentGatePassword, setCurrentGatePassword] = useState('root');
  const [nextGatePassword, setNextGatePassword] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<number, string>>({});
  const [loadingVisiblePasswordId, setLoadingVisiblePasswordId] = useState<number | null>(null);

  const generateStrongPassword = () => {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const specials = '!@#$%^&*';
    const all = upper + lower + numbers + specials;
    const pick = (charset: string) => charset[Math.floor(Math.random() * charset.length)];

    const password = [
      pick(upper),
      pick(lower),
      pick(numbers),
      pick(specials),
      ...Array.from({ length: 8 }, () => pick(all)),
    ]
      .sort(() => Math.random() - 0.5)
      .join('');

    setNewPassword(password);
    setSuccess(`Mot de passe fort généré: ${password}`);
    setTimeout(() => setSuccess(null), 5000);
  };

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

  const toggleApprovalCheck = (userId: number, checkType: 'identity' | 'department') => {
    setApprovalChecks(prev => ({
      ...prev,
      [userId]: {
        identity: prev[userId]?.identity ?? false,
        department: prev[userId]?.department ?? false,
        [checkType]: !(prev[userId]?.[checkType] ?? false)
      }
    }));
  };

  const handleApprove = async (userId: number) => {
    const checks = approvalChecks[userId];
    const approvedUser = users.find((user) => user.id === userId);

    // Vérifier que les deux checkboxes sont cochées
    if (!checks?.identity || !checks?.department) {
      setError('Vous devez cocher les deux cases de confirmation');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      setApprovingUserId(userId);
      setError(null);

      const response = await fetch(`${AUTH_API_BASE}/api/auth/users/${userId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSuccess('Compte approuvé avec succès');
        if (approvedUser?.email) {
          localStorage.setItem('lastApprovedAccount', JSON.stringify({
            email: approvedUser.email,
            department: approvedUser.departement,
            approvedAt: new Date().toISOString()
          }));
        }
        setApprovalChecks(prev => {
          const newChecks = { ...prev };
          delete newChecks[userId];
          return newChecks;
        });
        setTimeout(() => {
          setSuccess(null);
          loadUsers();
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de l\'approbation');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur approbation');
      console.error('Erreur approbation:', err);
    } finally {
      setApprovingUserId(null);
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

  const handleResetPassword = async (userId: number) => {
    if (!newPassword || newPassword.length < 8) {
      setError('Le mot de passe doit avoir au moins 8 caractères');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      setResettingUserId(userId);
      setError(null);
      const response = await fetch(`${AUTH_API_BASE}/api/auth/users/${userId}/reset-password`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword })
      });

      if (response.ok) {
        setSuccess('Mot de passe réinitialisé avec succès');
        setVisiblePasswords((prev) => ({ ...prev, [userId]: newPassword }));
        setResetPasswordId(null);
        setNewPassword('');
        loadUsers();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Erreur lors de la réinitialisation du mot de passe');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la réinitialisation');
    } finally {
      setResettingUserId(null);
    }
  };

  const handleRevealPassword = async (userId: number) => {
    if (!gatePassword) {
      setError('Mot de passe d\'accès requis pour afficher un mot de passe utilisateur');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      setLoadingVisiblePasswordId(userId);
      setError(null);

      const response = await fetch(`${AUTH_API_BASE}/api/auth/users/${userId}/password/reveal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gatePassword })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Impossible d\'afficher ce mot de passe');
      }

      setVisiblePasswords((prev) => ({ ...prev, [userId]: data.password }));
      setNewPassword(data.password);
      setSuccess(`Mot de passe affiché pour ${data.email}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur affichage mot de passe');
    } finally {
      setLoadingVisiblePasswordId(null);
    }
  };

  const handleHidePassword = (userId: number) => {
    setVisiblePasswords((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  };

  const handleChangeGatePassword = async () => {
    if (!currentGatePassword || !nextGatePassword) {
      setError('Les deux mots de passe d\'accès sont requis');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      setError(null);
      const response = await fetch(`${AUTH_API_BASE}/api/auth/password-gate/change`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentPassword: currentGatePassword, newPassword: nextGatePassword })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Impossible de changer le mot de passe d\'accès');
      }

      setGatePassword(nextGatePassword);
      setCurrentGatePassword(nextGatePassword);
      setNextGatePassword('');
      setSuccess('Mot de passe d\'accès changé avec succès');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur changement mot de passe d\'accès');
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
        {/* Alerts */}
        {error && (
          <div className="mb-4 flex items-start gap-3 p-4 bg-red-900/30 border border-red-600 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-300">Erreur</p>
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-start gap-3 p-4 bg-green-900/30 border border-green-600 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-300">Succès</p>
              <p className="text-green-200 text-sm">{success}</p>
            </div>
          </div>
        )}

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

        <div className="mb-6 bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Accès protégé aux mots de passe affichables</h2>
            <p className="text-sm text-gray-400 mt-1">
              Les mots de passe visibles ici sont ceux enregistrés après création, réinitialisation ou changement récent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="password"
              value={gatePassword}
              onChange={(e) => setGatePassword(e.target.value)}
              placeholder="Mot de passe d'accès actuel"
              className="px-3 py-2 bg-gray-900 border border-gray-600 rounded text-sm"
            />
            <input
              type="password"
              value={currentGatePassword}
              onChange={(e) => setCurrentGatePassword(e.target.value)}
              placeholder="Ancien mot de passe d'accès"
              className="px-3 py-2 bg-gray-900 border border-gray-600 rounded text-sm"
            />
            <div className="flex gap-2">
              <input
                type="password"
                value={nextGatePassword}
                onChange={(e) => setNextGatePassword(e.target.value)}
                placeholder="Nouveau mot de passe d'accès"
                className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 rounded text-sm"
              />
              <button
                onClick={handleChangeGatePassword}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm transition"
              >
                Changer
              </button>
            </div>
          </div>
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
                    <Fragment key={user.id}>
                      <tr className="border-b border-gray-700 hover:bg-gray-700/50">
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
                        {user.actif === 1 && (
                          <button
                            onClick={() => setResetPasswordId(resetPasswordId === user.id ? null : user.id)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition flex items-center gap-1"
                          >
                            <Key size={14} />
                            MDP
                          </button>
                        )}
                        {user.actif === 1 && (
                          visiblePasswords[user.id] ? (
                            <button
                              onClick={() => handleHidePassword(user.id)}
                              className="px-3 py-1 bg-slate-600 hover:bg-slate-700 rounded text-xs transition"
                            >
                              Masquer
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRevealPassword(user.id)}
                              disabled={loadingVisiblePasswordId === user.id || !user.has_password_vault}
                              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 rounded text-xs transition"
                            >
                              {loadingVisiblePasswordId === user.id ? '...' : 'Afficher'}
                            </button>
                          )
                        )}
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                    {resetPasswordId === user.id && (
                      <tr className="border-b border-gray-700 bg-gray-800">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="space-y-3">
                            <p className="text-sm text-gray-300">Définir un nouveau mot de passe pour <strong>{user.email}</strong></p>
                            <p className="text-xs text-gray-500">
                              Mot de passe visible: {visiblePasswords[user.id] ? visiblePasswords[user.id] : (user.has_password_vault ? '••••••••••••' : 'indisponible jusqu\'à une réinitialisation')}
                            </p>
                            <div className="flex gap-2">
                              <input
                                type="password"
                                placeholder="Minimum 8 caractères"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm placeholder-gray-400"
                              />
                              <button
                                onClick={generateStrongPassword}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition"
                              >
                                Générer
                              </button>
                              <button
                                onClick={() => handleResetPassword(user.id)}
                                disabled={resettingUserId === user.id}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded text-sm transition flex items-center gap-2"
                              >
                                {resettingUserId === user.id ? (
                                  <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Réinitialisation...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle size={16} />
                                    Réinitialiser
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setResetPasswordId(null);
                                  setNewPassword('');
                                }}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm transition"
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    </Fragment>
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
                    <Fragment key={user.id}>
                      <tr className="border-b border-gray-700 hover:bg-gray-700/50">
                        <td className="px-6 py-4 text-sm">{user.email}</td>
                        <td className="px-6 py-4 text-sm">{user.prenom} {user.nom}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{user.departement}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {new Date(user.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => setApprovingUserId(approvingUserId === user.id ? null : user.id)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition"
                          >
                            {approvingUserId === user.id ? '✓ Masquer' : 'Confirmer'}
                          </button>
                        </td>
                      </tr>

                      {approvingUserId === user.id && (
                        <tr className="border-b border-gray-700 bg-gray-800/50">
                          <td colSpan={5} className="px-6 py-4">
                            <div className="space-y-4">
                              <h4 className="font-semibold text-white">Confirmer l'approbation de {user.email}</h4>

                              <div className="space-y-3 bg-gray-900 p-4 rounded">
                                <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-800 p-2 rounded transition">
                                  <input
                                    type="checkbox"
                                    checked={approvalChecks[user.id]?.identity ?? false}
                                    onChange={() => toggleApprovalCheck(user.id, 'identity')}
                                    className="w-5 h-5 accent-green-600"
                                  />
                                  <span className="text-sm text-gray-300">
                                    J'ai vérifié l'identité de <strong>{user.prenom} {user.nom}</strong>
                                  </span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-800 p-2 rounded transition">
                                  <input
                                    type="checkbox"
                                    checked={approvalChecks[user.id]?.department ?? false}
                                    onChange={() => toggleApprovalCheck(user.id, 'department')}
                                    className="w-5 h-5 accent-green-600"
                                  />
                                  <span className="text-sm text-gray-300">
                                    Le département <strong>{user.departement}</strong> est correct
                                  </span>
                                </label>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApprove(user.id)}
                                  disabled={!(approvalChecks[user.id]?.identity && approvalChecks[user.id]?.department)}
                                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-sm transition flex items-center gap-2"
                                >
                                  <CheckCircle size={16} />
                                  Approuver
                                </button>
                                <button
                                  onClick={() => handleDelete(user.id)}
                                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm transition"
                                >
                                  Refuser
                                </button>
                                <button
                                  onClick={() => setApprovingUserId(null)}
                                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm transition"
                                >
                                  Annuler
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
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
