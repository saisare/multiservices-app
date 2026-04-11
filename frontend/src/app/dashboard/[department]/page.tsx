'use client';

import { ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { Building2, ShieldCheck, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getMonitoringOverview, getUsers } from '@/services/api/admin.api';

type BasicUser = {
  id: number;
  departement: string;
  actif: number;
  hidden: number;
};

export default function DepartmentDashboard() {
  const params = useParams();
  const department = String(params.department || '');
  const [users, setUsers] = useState<BasicUser[]>([]);
  const [overview, setOverview] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [userRows, monitoring] = await Promise.all([getUsers(), getMonitoringOverview()]);
        setUsers(userRows as BasicUser[]);
        setOverview(monitoring);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const scopedUsers = useMemo(() => users.filter((user) => user.departement === department), [department, users]);
  const activeUsers = useMemo(() => scopedUsers.filter((user) => user.actif === 1 && user.hidden === 0).length, [scopedUsers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-800 bg-[linear-gradient(135deg,#04111f_0%,#0b1d36_45%,#0a3144_100%)] px-6 py-8 text-white shadow-xl">
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/80">Supervision métier</p>
        <h1 className="mt-2 text-3xl font-semibold">Tableau de bord</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Vue synthétique du département {department} avec les indicateurs consolidés disponibles.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Comptes du département" value={String(scopedUsers.length)} icon={<Users className="h-5 w-5" />} />
        <MetricCard label="Comptes actifs" value={String(activeUsers)} icon={<ShieldCheck className="h-5 w-5" />} />
        <MetricCard label="Sessions suivies" value={String(overview.total_sessions || 0)} icon={<Building2 className="h-5 w-5" />} />
      </section>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">{icon}</div>
        <span className="text-3xl font-semibold text-slate-900">{value}</span>
      </div>
      <p className="mt-4 text-sm text-slate-600">{label}</p>
    </div>
  );
}
