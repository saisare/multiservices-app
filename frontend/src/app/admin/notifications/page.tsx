'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, X, Clock } from 'lucide-react';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data?: any;
  created_at: string;
  is_read: number;
}

interface PendingUser {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  poste?: string;
  departement: string;
  requested_at: string;
  notification_id?: number;
  has_notification: boolean;
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    // Get token from localStorage
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      loadNotifications(savedToken);
      loadPendingUsers(savedToken);
    }
  }, []);

  const loadNotifications = async (authToken: string) => {
    try {
      const res = await fetch('http://localhost:3002/api/auth/notifications', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err: any) {
      console.error('Error loading notifications:', err);
    }
  };

  const loadPendingUsers = async (authToken: string) => {
    try {
      const res = await fetch('http://localhost:3002/api/auth/pending-users-with-notifications', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (res.ok) {
        const data = await res.json();
        setPendingUsers(data.users || []);
      }
    } catch (err: any) {
      console.error('Error loading pending users:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notifId: number) => {
    try {
      await fetch(`http://localhost:3002/api/auth/notifications/${notifId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setNotifications(notifications.map(n =>
        n.id === notifId ? { ...n, is_read: 1 } : n
      ));
    } catch (err: any) {
      console.error('Error marking as read:', err);
    }
  };

  const approveUser = async (userId: number) => {
    try {
      const res = await fetch(`http://localhost:3002/api/auth/users/${userId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (res.ok) {
        setPendingUsers(pendingUsers.filter(u => u.id !== userId));
        setError('');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to approve user');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const rejectUser = async (userId: number) => {
    try {
      const res = await fetch(`http://localhost:3002/api/auth/users/${userId}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: 'Rejected by admin' })
      });

      if (res.ok) {
        setPendingUsers(pendingUsers.filter(u => u.id !== userId));
        setError('');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to reject user');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Bell className="w-6 h-6 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Demandes de création de comptes en attente</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 border border-red-300 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Pending Users */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-600" />
          <h2 className="text-xl font-bold text-gray-900">
            Demandes en attente ({pendingUsers.length})
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-600">Chargement...</div>
          </div>
        ) : pendingUsers.length === 0 ? (
          <div className="bg-green-50 border border-green-300 rounded-lg p-6 text-center">
            <p className="text-green-700">✅ Aucune demande en attente</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm hover:shadow-md transition"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {user.prenom} {user.nom}
                    </h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  {user.has_notification && (
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      📨 Notifié
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-y">
                  <div>
                    <p className="text-xs text-gray-600">Département</p>
                    <p className="text-sm font-medium text-gray-900">{user.departement}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Poste</p>
                    <p className="text-sm font-medium text-gray-900">{user.poste || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Téléphone</p>
                    <p className="text-sm font-medium text-gray-900">{user.telephone || 'Non fourni'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Demandé le</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(user.requested_at)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => approveUser(user.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    <Check className="w-4 h-4" />
                    Approuver
                  </button>
                  <button
                    onClick={() => rejectUser(user.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    <X className="w-4 h-4" />
                    Rejeter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-600 font-semibold">NOTIFI_CATIONS NOUVELLES</p>
            <p className="text-2xl font-bold text-blue-700">
              {notifications.filter(n => !n.is_read).length}
            </p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-xs text-orange-600 font-semibold">EN ATTENTE</p>
            <p className="text-2xl font-bold text-orange-700">{pendingUsers.length}</p>
          </div>
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
            <p className="text-xs text-gray-600 font-semibold">TOTAL NOTIF</p>
            <p className="text-2xl font-bold text-gray-700">{notifications.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}
