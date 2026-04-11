'use client';

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Clock3, ShieldCheck } from 'lucide-react';
import { buildServiceBase } from '@/lib/runtime-api';

const departmentLabels: Record<string, string> = {
  btp: 'BTP',
  voyage: 'Voyage et immigration',
  communication: 'Communication',
  logistique: 'Logistique',
  assurance: 'Assurance',
  rh: 'Ressources humaines',
  direction: 'Direction',
  pdg: 'Direction générale',
  secretaire: 'Secrétariat',
};

export default function CompteEnAttentePage() {
  const searchParams = useSearchParams();
  const department = searchParams.get('department') || '';
  const email = searchParams.get('email') || '';
  const label = departmentLabels[department] || department || 'département sélectionné';
  const [status, setStatus] = useState<'pending' | 'approved'>('pending');

  useEffect(() => {
    if (!email) return;

    let cancelled = false;

    const checkStatus = async () => {
      try {
        const response = await fetch(`${buildServiceBase(3002)}/api/auth/account-status?email=${encodeURIComponent(email)}`);
        if (!response.ok) return;

        const data = await response.json();
        if (!cancelled && data?.status === 'approved') {
          setStatus('approved');
        }
      } catch {
        // Silencieux côté utilisateur: la page reste stable même si le service auth répond lentement.
      }
    };

    void checkStatus();
    const interval = window.setInterval(checkStatus, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [email]);

  const nextStep = useMemo(
    () => status === 'approved' ? 'Validation confirmée' : 'Connexion après approbation',
    [status]
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.18),_transparent_35%),linear-gradient(180deg,#fff7ed_0%,#ffffff_42%,#f8fafc_100%)] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[2rem] border border-orange-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-800">
            <CheckCircle2 className="h-4 w-4" />
            Demande enregistrée
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Compte créé et rattaché à {label}
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-600">
            {status === 'approved'
              ? 'Votre demande a été approuvée. Vous pouvez maintenant revenir à la connexion.'
              : 'Votre demande a bien été enregistrée. Cette page se mettra à jour automatiquement dès validation.'}
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Card
              icon={<ShieldCheck className="h-5 w-5 text-orange-600" />}
              title="Département lié"
              text={label}
            />
            <Card
              icon={<Clock3 className="h-5 w-5 text-orange-600" />}
              title="Statut actuel"
              text={status === 'approved' ? 'Approuvé' : 'En attente de validation'}
            />
            <Card
              icon={<CheckCircle2 className="h-5 w-5 text-orange-600" />}
              title="Étape suivante"
              text={nextStep}
            />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/login?department=${encodeURIComponent(department)}${email ? `&email=${encodeURIComponent(email)}` : ''}`}
              className={`inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white transition ${status === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-600 hover:bg-orange-700'}`}
            >
              {status === 'approved' ? 'Se connecter maintenant' : 'Revenir à la connexion'}
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Choisir un autre accès
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function Card({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-orange-100 p-2">{icon}</div>
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="font-semibold text-slate-900">{text}</p>
        </div>
      </div>
    </div>
  );
}
