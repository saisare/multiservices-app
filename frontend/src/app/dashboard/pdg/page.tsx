'use client';

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { AlertCircle, BarChart3, Building2, CheckCircle2, EyeOff, PieChart, Users } from 'lucide-react';
import { getUsers, hideUser } from '@/services/api/admin.api';

type User = {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  departement: string;
  role: string;
  actif: number;
  hidden?: number;
};

export default function PDGDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
      setError('');
    } catch (err: unknown) {
      setError((err as Error).message || 'Erreur fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

  const onHideUser = async (id: number) => {
    try {
      await hideUser(id);
      setSuccess('Compte caché avec succès');
      setTimeout(() => setSuccess(''), 3000);
      await fetchUsers();
    } catch (err: unknown) {
      setError((err as Error).message || 'Erreur hide');
    }
  };

  const stats = useMemo(() => {
    const departments = Array.from(new Set(users.map((user) => user.departement).filter(Boolean)));
    return {
      totalUsers: users.length,
      activeUsers: users.filter((user) => user.actif === 1).length,
      activeServices: departments.length,
      hiddenUsers: users.filter((user) => user.hidden === 1).length,
      departments,
    };
  }, [users]);

  const departmentRows = useMemo(() => {
    return stats.departments.map((department) => {
      const members = users.filter((user) => user.departement === department);
      return {
        department,
        total: members.length,
        active: members.filter((user) => user.actif === 1).length,
      };
    });
  }, [stats.departments, users]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800">
              <Building2 className="h-4 w-4" />
              Direction générale
            </div>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Tableau de bord PDG</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">Vue globale du système, des utilisateurs et des départements. Le PDG reste en lecture avec droit de masquage des comptes.</p>
          </div>
        </div>
      </section>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle className="mr-2 inline h-5 w-5" />{error}</div>}
      {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"><CheckCircle2 className="mr-2 inline h-5 w-5" />{success}</div>}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5 text-indigo-600" />} label="Utilisateurs" value={String(stats.totalUsers)} accent="indigo" />
        <StatCard icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />} label="Actifs" value={String(stats.activeUsers)} accent="emerald" />
        <StatCard icon={<Building2 className="h-5 w-5 text-sky-600" />} label="Départements" value={String(stats.activeServices)} accent="sky" />
        <StatCard icon={<EyeOff className="h-5 w-5 text-amber-600" />} label="Comptes masqués" value={String(stats.hiddenUsers)} accent="amber" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            Répartition par département
          </h2>
          <div className="mt-5 space-y-4">
            {departmentRows.length === 0 ? (
              <p className="text-sm text-slate-500">Aucune donnée disponible.</p>
            ) : (
              departmentRows.map((row) => {
                const width = stats.totalUsers ? Math.max(12, Math.round((row.total / stats.totalUsers) * 100)) : 12;
                return (
                  <div key={row.department} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-900">{row.department}</span>
                      <span className="text-slate-500">{row.total} membres</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500" style={{ width: `${width}%` }} />
                    </div>
                    <p className="text-xs text-slate-500">{row.active} actifs</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <PieChart className="h-5 w-5 text-indigo-600" />
            Lecture direction
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <InfoTile label="Taux d'activité" value={`${stats.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%`} />
            <InfoTile label="Taux de masquage" value={`${stats.totalUsers ? Math.round((stats.hiddenUsers / stats.totalUsers) * 100) : 0}%`} />
            <InfoTile label="Population visible" value={String(stats.totalUsers - stats.hiddenUsers)} />
            <InfoTile label="Population active" value={String(stats.activeUsers)} />
          </div>
          <div className="mt-5 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-800">
            Le PDG dispose d'une vue consolidée. Les opérations sensibles restent restreintes pour garder une gouvernance propre du logiciel.
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Utilisateurs</h2>
        <p className="mt-1 text-sm text-slate-500">Lecture consolidée du service auth. Le masquage reste possible côté direction.</p>

        {loading ? (
          <div className="flex justify-center py-16"><div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" /></div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Utilisateur</th>
                  <th className="px-4 py-3">Rôle</th>
                  <th className="px-4 py-3">Département</th>
                  <th className="px-4 py-3">Actif</th>
                  <th className="px-4 py-3">Masqué</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-900">{user.nom} {user.prenom}</div>
                      <div className="text-sm text-slate-500">{user.email}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">{user.role}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{user.departement}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{user.actif ? 'Oui' : 'Non'}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{user.hidden ? 'Oui' : 'Non'}</td>
                    <td className="px-4 py-4 text-right">
                      <button onClick={() => void onHideUser(user.id)} className="rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-600">
                        Masquer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, accent }: { icon: ReactNode; label: string; value: string; accent: 'indigo' | 'emerald' | 'sky' | 'amber' }) {
  const palette = {
    indigo: 'border-indigo-200 bg-indigo-50',
    emerald: 'border-emerald-200 bg-emerald-50',
    sky: 'border-sky-200 bg-sky-50',
    amber: 'border-amber-200 bg-amber-50',
  };

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${palette[accent]}`}>
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-white p-3 shadow-sm">{icon}</div>
        <span className="text-3xl font-bold text-slate-900">{value}</span>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-600">{label}</p>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

