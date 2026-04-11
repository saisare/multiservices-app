'use client';

import { useEffect, useState } from 'react';
import { Bell, Check, Clock, Send, X } from 'lucide-react';
import {
  approvePendingUser,
  getDepartments,
  getNotifications,
  getPendingUsers,
  markNotificationRead,
  rejectPendingUser,
  sendDepartmentNotification,
  type Department,
  type Notification,
  type PendingUser,
} from '@/services/api/admin.api';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    department: 'all',
    title: '',
    message: '',
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [notificationRows, pendingRows, departmentRows] = await Promise.all([
        getNotifications(),
        getPendingUsers(),
        getDepartments(),
      ]);
      setNotifications(notificationRows);
      setPendingUsers(pendingRows);
      setDepartments(departmentRows);
      setError('');
    } catch (loadError) {
      setError((loadError as Error).message || 'Impossible de charger les notifications.');
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: number) => {
    try {
      await approvePendingUser(userId);
      setPendingUsers((current) => current.filter((user) => user.id !== userId));
      setSuccess('Compte approuvé.');
    } catch (approveError) {
      setError((approveError as Error).message);
    }
  };

  const rejectUser = async (userId: number) => {
    try {
      await rejectPendingUser(userId, 'Rejet administratif');
      setPendingUsers((current) => current.filter((user) => user.id !== userId));
      setSuccess('Demande rejetée.');
    } catch (rejectError) {
      setError((rejectError as Error).message);
    }
  };

  const handleMarkRead = async (notificationId: number) => {
    try {
      await markNotificationRead(notificationId);
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId ? { ...notification, is_read: 1 } : notification
        )
      );
    } catch (markError) {
      setError((markError as Error).message);
    }
  };

  const handleSend = async () => {
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      const response = await sendDepartmentNotification(form);
      setForm({ department: 'all', title: '', message: '' });
      setSuccess(`Notification envoyée à ${response.delivered} destinataire(s).`);
      await loadAll();
    } catch (sendError) {
      setError((sendError as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
          <Bell className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications et diffusion</h1>
          <p className="text-gray-600">Gérez les validations et envoyez des messages par département.</p>
        </div>
      </div>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {success ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}

      <section className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">Demandes en attente ({pendingUsers.length})</h2>
          </div>

          {loading ? (
            <p className="py-8 text-center text-gray-500">Chargement des demandes...</p>
          ) : pendingUsers.length === 0 ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center text-emerald-700">
              Aucune demande en attente.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <article key={user.id} className="rounded-3xl border border-gray-200 p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{user.prenom} {user.nom}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="mt-3 grid gap-2 text-sm text-gray-600 md:grid-cols-2">
                        <p><span className="font-medium text-gray-800">Département:</span> {user.departement}</p>
                        <p><span className="font-medium text-gray-800">Poste:</span> {user.poste || 'Non renseigné'}</p>
                        <p><span className="font-medium text-gray-800">Téléphone:</span> {user.telephone || 'Non renseigné'}</p>
                        <p><span className="font-medium text-gray-800">Créé le:</span> {new Date(user.requested_at).toLocaleString('fr-FR')}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveUser(user.id)}
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm text-white transition hover:bg-emerald-700"
                      >
                        <Check className="h-4 w-4" />
                        Approuver
                      </button>
                      <button
                        onClick={() => rejectUser(user.id)}
                        className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm text-white transition hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                        Rejeter
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Envoyer une notification</h2>
            <p className="mt-1 text-sm text-gray-600">Diffusez un message ciblé à un département ou à tout le personnel visible.</p>

            <div className="mt-5 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-gray-700">Département destinataire</span>
                <select
                  value={form.department}
                  onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-gray-400"
                >
                  <option value="all">Tous les départements visibles</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.code}>{department.nom}</option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-gray-700">Titre</span>
                <input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-gray-400"
                  placeholder="Ex: Mise à jour d'exploitation"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-gray-700">Message</span>
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-gray-400"
                  placeholder="Rédigez ici le message à transmettre."
                />
              </label>

              <button
                onClick={handleSend}
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Envoyer la notification
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Fil de notifications ({notifications.length})</h2>
            <div className="mt-5 space-y-3">
              {notifications.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
                  Aucune notification disponible.
                </p>
              ) : (
                notifications.slice(0, 8).map((notification) => (
                  <article key={notification.id} className="rounded-2xl border border-gray-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-gray-900">{notification.title}</p>
                        <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                        <p className="mt-2 text-xs text-gray-400">{new Date(notification.created_at).toLocaleString('fr-FR')}</p>
                      </div>
                      {!notification.is_read ? (
                        <button
                          onClick={() => handleMarkRead(notification.id)}
                          className="rounded-full border border-blue-200 px-3 py-2 text-xs text-blue-700 transition hover:bg-blue-50"
                        >
                          Marquer lu
                        </button>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-3 py-2 text-xs text-gray-500">Lu</span>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
