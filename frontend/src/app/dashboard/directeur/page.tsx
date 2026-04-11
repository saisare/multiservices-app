'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { AlertCircle, Bell, Briefcase, EyeOff, LogOut, ShieldCheck, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  getConnectionLogs,
  getMonitoringOverview,
  getNotifications,
  getUsers,
  hideUser,
  type ConnectionLog,
  type Notification,
  type User,
} from '@/services/api/admin.api';

type SessionUser = {
  nom?: string;
  prenom?: string;
};

export default function DirectorDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState<SessionUser | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ConnectionLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [overview, setOverview] = useState<Record<string, number>>({});

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!savedUser || !token) {
      router.push('/login');
      return;
    }

    setUserData(JSON.parse(savedUser));
    loadDashboard();
  }, [router]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [userRows, logRows, notificationRows, overviewRows] = await Promise.all([
        getUsers(),
        getConnectionLogs(30),
        getNotifications(),
        getMonitoringOverview(),
      ]);

      setUsers(userRows);
      setLogs(logRows);
      setNotifications(notificationRows);
      setOverview(overviewRows || {});
      setError('');
    } catch (dashboardError) {
      setError((dashboardError as Error).message || 'Impossible de charger la supervision.');
    } finally {
      setLoading(false);
    }
  };

  const visibleUsers = useMemo(() => users.filter((user) => user.role !== 'admin'), [users]);
  const activeUsers = useMemo(() => visibleUsers.filter((user) => user.actif === 1 && user.hidden === 0), [visibleUsers]);
  const restrictedUsers = useMemo(() => visibleUsers.filter((user) => user.hidden === 1), [visibleUsers]);
  const pendingUsers = useMemo(() => visibleUsers.filter((user) => user.actif === 0), [visibleUsers]);
  const recentActivity = useMemo(() => logs.filter((log) => log.email).slice(0, 8), [logs]);

  const departmentRows = useMemo(() => {
    const labels: Record<string, string> = {
      btp: 'BTP & Construction',
      voyage: 'Voyage & Immigration',
      rh: 'Ressources Humaines',
      logistique: 'Logistique',
      assurance: 'Assurance',
      communication: 'Communication',
      secretaire: 'Secrétariat',
      pdg: 'Direction Générale',
      direction: 'Direction Générale',
    };

    const counts = visibleUsers.reduce<Record<string, number>>((acc, user) => {
      const key = user.departement || 'non-defini';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([key, count]) => ({
        key,
        label: labels[key] || key,
        count,
        active: visibleUsers.filter((user) => user.departement === key && user.hidden === 0 && user.actif === 1).length,
      }))
      .sort((a, b) => b.count - a.count);
  }, [visibleUsers]);

  const handleHideUser = async (id: number) => {
    try {
      await hideUser(id);
      await loadDashboard();
    } catch (hideError) {
      setError((hideError as Error).message || 'Impossible de restreindre ce compte.');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-slate-100" />
          <p>Chargement de la supervision direction...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.16),_transparent_28%),linear-gradient(160deg,#020617_0%,#0f172a_55%,#111827_100%)]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-3 text-amber-300">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Direction</p>
              <h1 className="text-xl font-semibold text-white">Pilotage des comptes et activités</h1>
              <p className="text-sm text-slate-400">{userData?.prenom} {userData?.nom}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin/notifications')}
              className="relative rounded-full border border-white/10 p-3 text-slate-200 transition hover:bg-white/10"
            >
              <Bell className="h-4 w-4" />
              {notifications.filter((item) => !item.is_read).length > 0 ? (
                <span className="absolute -right-1 -top-1 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-semibold text-slate-950">
                  {notifications.filter((item) => !item.is_read).length}
                </span>
              ) : null}
            </button>
            <button
              onClick={handleLogout}
              className="rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm text-red-200 transition hover:bg-red-500/20"
            >
              <LogOut className="mr-2 inline h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        {error ? (
          <div className="rounded-3xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm text-red-100">{error}</div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Comptes actifs" value={String(activeUsers.length)} hint="Collaborateurs visibles et autorisés à se connecter." icon={<Users className="h-5 w-5" />} />
          <StatCard label="Comptes en attente" value={String(pendingUsers.length)} hint="Demandes encore en validation administrative." icon={<AlertCircle className="h-5 w-5" />} />
          <StatCard label="Comptes restreints" value={String(restrictedUsers.length)} hint="Comptes masqués par décision de direction." icon={<EyeOff className="h-5 w-5" />} />
          <StatCard label="Activités récentes" value={String(overview.total_connection_logs || logs.length)} hint="Connexions et partages enregistrés dans les journaux." icon={<ShieldCheck className="h-5 w-5" />} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.3fr,0.9fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/20">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Comptes opérationnels</h2>
                <p className="mt-1 text-sm text-slate-400">Vue réelle des comptes visibles par la direction. Les comptes administrateur sont exclus.</p>
              </div>
              <button
                onClick={loadDashboard}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              >
                Actualiser
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-[0.2em] text-slate-400">
                    <th className="pb-3">Compte</th>
                    <th className="pb-3">Département</th>
                    <th className="pb-3">Rôle</th>
                    <th className="pb-3">Statut</th>
                    <th className="pb-3">Dernière activité</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activeUsers.map((account) => {
                    const lastLog = logs.find((entry) => entry.user_id === account.id || entry.email === account.email);
                    return (
                      <tr key={account.id} className="text-sm text-slate-200">
                        <td className="py-4">
                          <p className="font-medium text-white">{account.prenom} {account.nom}</p>
                          <p className="text-xs text-slate-400">{account.email}</p>
                        </td>
                        <td className="py-4 capitalize">{account.departement}</td>
                        <td className="py-4 capitalize">{account.role}</td>
                        <td className="py-4">
                          <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300">Actif</span>
                        </td>
                        <td className="py-4 text-slate-400">
                          {lastLog?.created_at ? new Date(lastLog.created_at).toLocaleString('fr-FR') : 'Aucune activité récente'}
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleHideUser(account.id)}
                            className="rounded-full border border-amber-400/20 px-3 py-2 text-xs text-amber-200 transition hover:bg-amber-500/10"
                          >
                            Restreindre
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold text-white">Activités récentes</h2>
              <p className="mt-1 text-sm text-slate-400">Journaux de connexion et d’usage les plus récents.</p>
              <div className="mt-5 space-y-3">
                {recentActivity.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-slate-400">
                    Aucun journal récent disponible.
                  </p>
                ) : (
                  recentActivity.map((entry) => (
                    <div key={entry.id} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-white">{entry.email}</p>
                          <p className="mt-1 text-sm text-slate-400">
                            {entry.departement || 'Département non précisé'} · {entry.success ? 'Connexion validée' : 'Échec d’accès'}
                          </p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs ${entry.success ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>
                          {entry.success ? 'OK' : 'Erreur'}
                        </span>
                      </div>
                      <p className="mt-3 text-xs text-slate-500">{new Date(entry.created_at).toLocaleString('fr-FR')}</p>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold text-white">Répartition par service</h2>
              <p className="mt-1 text-sm text-slate-400">Effectifs visibles et comptes effectivement actifs par périmètre.</p>
              <div className="mt-5 space-y-3">
                {departmentRows.map((department) => (
                  <div key={department.key} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{department.label}</p>
                        <p className="text-sm text-slate-400">{department.active} actif(s) sur {department.count} compte(s)</p>
                      </div>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">{department.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>

        {restrictedUsers.length > 0 ? (
          <section className="rounded-[28px] border border-amber-400/20 bg-amber-500/10 p-6">
            <h2 className="text-xl font-semibold text-amber-100">Comptes actuellement restreints</h2>
            <p className="mt-1 text-sm text-amber-100/80">
              Une fois restreint, un compte reçoit un message de blocage à la connexion. Seul l’administrateur peut lever cette restriction.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {restrictedUsers.map((account) => (
                <div key={account.id} className="rounded-2xl border border-amber-300/20 bg-black/10 p-4">
                  <p className="font-medium text-white">{account.prenom} {account.nom}</p>
                  <p className="text-sm text-amber-50/80">{account.email}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-amber-200">{account.departement}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-6" title={hint}>
      <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-slate-950/40 p-3 text-amber-300">{icon}</div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-3 text-xs text-slate-500">{hint}</p>
    </div>
  );
}
