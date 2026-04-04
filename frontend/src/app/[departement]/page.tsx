'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Building2, Briefcase, Globe2, Hammer, ShieldCheck, Truck, Users } from 'lucide-react';

const departmentMeta: Record<
  string,
  {
    title: string;
    subtitle: string;
    color: string;
    icon: typeof Building2;
  }
> = {
  btp: {
    title: 'BTP & Construction',
    subtitle: 'Suivi des chantiers, ouvriers, materiaux et commandes.',
    color: 'from-orange-600 via-amber-600 to-stone-700',
    icon: Hammer,
  },
  voyage: {
    title: 'Voyage et Immigration',
    subtitle: 'Un seul departement, avec deux bases de donnees et un service metier unifie.',
    color: 'from-sky-600 via-cyan-600 to-emerald-600',
    icon: Globe2,
  },
  communication: {
    title: 'Communication Digitale',
    subtitle: 'Campagnes, annonceurs et performance.',
    color: 'from-rose-600 via-orange-500 to-amber-500',
    icon: Briefcase,
  },
  logistique: {
    title: 'Logistique',
    subtitle: 'Stocks, fournisseurs, livraisons et mouvements.',
    color: 'from-slate-700 via-slate-800 to-black',
    icon: Truck,
  },
  assurance: {
    title: 'Assurance',
    subtitle: 'Polices, assures, experts et sinistres.',
    color: 'from-blue-700 via-indigo-700 to-cyan-700',
    icon: ShieldCheck,
  },
  rh: {
    title: 'Ressources Humaines',
    subtitle: 'Employes, contrats et suivi interne.',
    color: 'from-fuchsia-700 via-pink-700 to-rose-700',
    icon: Users,
  },
  secretaire: {
    title: 'Secretariat',
    subtitle: 'Gestion administrative et coordination.',
    color: 'from-violet-700 via-purple-700 to-indigo-700',
    icon: Briefcase,
  },
  pdg: {
    title: 'Direction',
    subtitle: 'Vue globale sur les departements.',
    color: 'from-slate-900 via-slate-800 to-slate-700',
    icon: Building2,
  },
};

export default function PublicDepartmentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [fromRequest, setFromRequest] = useState(false);
  const departement = (params.departement as string) || '';
  const config = departmentMeta[departement] || {
    title: `Departement ${departement}`,
    subtitle: 'Espace public de presentation avant authentification.',
    color: 'from-slate-700 via-slate-800 to-slate-900',
    icon: Building2,
  };

  const Icon = config.icon;
  useEffect(() => {
    const requestedDepartment = window.localStorage.getItem('requested_department');
    setFromRequest(searchParams.get('from') === 'request-account' || requestedDepartment === departement);

    if (requestedDepartment === departement) {
      window.localStorage.removeItem('requested_department');
    }
  }, [departement, searchParams]);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.color} px-6 py-12 text-white`}>
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] border border-white/15 bg-white/10 p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex rounded-full bg-white/15 p-4">
                <Icon className="h-8 w-8" />
              </div>
              <p className="text-sm uppercase tracking-[0.35em] text-white/70">Departement</p>
              <h1 className="mt-3 text-4xl font-bold">{config.title}</h1>
              <p className="mt-4 text-lg text-white/85">{config.subtitle}</p>

              {fromRequest && (
                <div className="mt-6 rounded-2xl border border-emerald-300/30 bg-emerald-500/15 px-5 py-4 text-emerald-50">
                  Votre demande de compte a bien ete enregistree. Vous etes redirige vers le departement choisi sans toucher aux routes protegees.
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/15 bg-black/15 p-5">
              <p className="text-sm text-white/70">Acces recommande</p>
              <p className="mt-2 text-xl font-semibold">Connexion ciblee par departement</p>
              <p className="mt-2 text-sm text-white/75">
                Le login garde maintenant le departement choisi pour eviter les mauvaises redirections.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-sm text-white/70">Etape 1</p>
              <h2 className="mt-2 text-xl font-semibold">Choisir le bon service</h2>
              <p className="mt-2 text-sm text-white/80">
                Chaque departement reste relie a son microservice ou a son regroupement metier.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-sm text-white/70">Etape 2</p>
              <h2 className="mt-2 text-xl font-semibold">Connexion ou demande</h2>
              <p className="mt-2 text-sm text-white/80">
                La creation de compte ne force plus une entree dans un dashboard protege sans token.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-sm text-white/70">Etape 3</p>
              <h2 className="mt-2 text-xl font-semibold">Redirection propre</h2>
              <p className="mt-2 text-sm text-white/80">
                Une fois authentifie, l utilisateur rejoint automatiquement le tableau de bord du departement reel.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/login" className="rounded-xl bg-white px-5 py-3 font-medium text-slate-900 hover:bg-slate-100">
              Retour au login
            </Link>
            <Link href={`/login?department=${departement}`} className="rounded-xl border border-white/20 px-5 py-3 font-medium text-white hover:bg-white/10">
              Se connecter pour {config.title}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
