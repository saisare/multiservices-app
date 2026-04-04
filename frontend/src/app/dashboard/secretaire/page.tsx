'use client';

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckSquare, FileText, MessageSquare, Users } from 'lucide-react';
import { getUsers } from '@/services/api/admin.api';

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

const mockTasks = [
  { id: 1, title: 'Appel client Alice', status: 'Ouvert', dept: 'assurance' },
  { id: 2, title: 'RDV direction 14h', status: 'Confirmé', dept: 'direction' },
  { id: 3, title: 'Suivi commande BTP', status: 'En cours', dept: 'btp' },
];

const mockAgenda = [
  { time: '09:00', label: 'Accueil visiteurs' },
  { time: '11:30', label: 'Validation dossiers' },
  { time: '14:00', label: 'Réunion direction' },
  { time: '16:30', label: 'Relance fournisseurs' },
];

export default function SecretaireDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      const crmUsers = data.filter((user: User) => user.role !== 'admin' && user.actif === 1);
      setUsers(crmUsers);
      setError('');
    } catch (err: unknown) {
      setError((err as Error).message || 'Erreur CRM');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

  useEffect(() => {
    setNotifications(`Accès CRM réel activé: ${users.length} comptes visibles pour le filtrage et le suivi administratif.`);
  }, [users.length]);

  const departments = useMemo(() => Array.from(new Set(users.map((user) => user.departement).filter(Boolean))), [users]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-teal-200 bg-gradient-to-br from-teal-50 via-white to-emerald-50 p-6 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-800">
            <Users className="h-4 w-4" />
            Secrétariat
          </div>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Tableau de bord secrétaire</h1>
          <p className="mt-2 text-sm text-slate-600">Workspace de support interne, lecture CRM, agenda et tâches administratives.</p>
        </div>
      </section>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Clients CRM" value={String(users.length)} icon={<Users className="h-5 w-5 text-teal-600" />} />
        <Metric label="Tâches" value={String(mockTasks.length)} icon={<CheckSquare className="h-5 w-5 text-teal-600" />} />
        <Metric label="Agenda du jour" value={String(mockAgenda.length)} icon={<CalendarDays className="h-5 w-5 text-teal-600" />} />
        <Metric label="Départements suivis" value={String(departments.length)} icon={<MessageSquare className="h-5 w-5 text-teal-600" />} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <CalendarDays className="h-5 w-5 text-teal-600" />
            Agenda du jour
          </h2>
          <div className="mt-5 space-y-3">
            {mockAgenda.map((item) => (
              <div key={item.time} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="font-semibold text-slate-900">{item.time}</span>
                <span className="text-sm text-slate-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <CheckSquare className="h-5 w-5 text-teal-600" />
            Tâches internes
          </h2>
          <div className="mt-5 space-y-3">
            {mockTasks.map((task) => (
              <div key={task.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{task.title}</p>
                  <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-700">{task.status}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">Département: {task.dept}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
          <FileText className="h-5 w-5 text-teal-600" />
          Comptes visibles pour suivi CRM
        </h2>
        <p className="mt-1 text-sm text-slate-500">Lecture limitée des comptes pour coordination et progression administrative.</p>

        {loading ? (
          <div className="flex justify-center py-16"><div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" /></div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Utilisateur</th>
                  <th className="px-4 py-3">Département</th>
                  <th className="px-4 py-3">Rôle</th>
                  <th className="px-4 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-900">{user.nom} {user.prenom}</div>
                      <div className="text-sm text-slate-500">{user.email}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">{user.departement}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{user.role}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{user.actif ? 'Actif' : 'Inactif'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
        {notifications}
      </div>
    </div>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-3xl border border-teal-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-teal-50 p-3">{icon}</div>
        <span className="text-3xl font-bold text-slate-900">{value}</span>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-600">{label}</p>
    </div>
  );
}

