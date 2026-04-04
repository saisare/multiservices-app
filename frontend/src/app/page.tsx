'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Users, Briefcase, ArrowRight, Lock } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Si l'utilisateur est déjà connecté, rediriger
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (token && user.email) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push(`/dashboard/${user.departement || 'voyage'}`);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Briefcase className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">BLG-ENGINEERING</h1>
            <span className="text-gray-400 text-sm">Système Intégré v3.0</span>
          </div>
          <p className="text-gray-400 text-sm">Gestion Multi-Services Professionnelle</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-20">

        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">
            Choisissez votre portail
          </h2>
          <p className="text-gray-400 text-lg">
            Deux interfaces sécurisées et dédiées
          </p>
        </div>

        {/* 2 Portals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">

          {/* Portal 1: Admin */}
          <div className="group relative">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-900/20 rounded-2xl blur-xl group-hover:blur-2xl transition duration-300"></div>

            {/* Card */}
            <div className="relative bg-black/40 backdrop-blur-xl border border-red-600/30 hover:border-red-600/60 rounded-2xl p-10 transition duration-300 cursor-pointer group/card"
              onClick={() => window.location.href = '/admin-login'}
            >
              {/* Badge */}
              <div className="inline-block bg-red-900/30 border border-red-600/50 rounded-lg px-3 py-1 mb-6">
                <span className="text-red-300 text-xs font-semibold flex items-center space-x-1">
                  <Lock className="w-3 h-3" />
                  <span>SÉCURISÉ</span>
                </span>
              </div>

              {/* Icon */}
              <div className="mb-6 inline-block p-4 bg-red-900/20 rounded-xl group-hover/card:scale-110 transition">
                <Shield className="w-10 h-10 text-red-400" />
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl font-bold text-white mb-3">Administrateur</h3>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                Interface dédiée pour les administrateurs système. Gestion des utilisateurs, configurations globales et audit complet.
              </p>

              {/* Features */}
              <div className="space-y-2 mb-8">
                <div className="flex items-center space-x-2 text-gray-300 text-sm">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                  <span>Gestion des utilisateurs</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300 text-sm">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                  <span>Approbation des comptes</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300 text-sm">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                  <span>Logs système complets</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300 text-sm">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                  <span>Configurations globales</span>
                </div>
              </div>

              {/* Button */}
              <div className="flex items-center justify-between pt-6 border-t border-red-600/20">
                <span className="text-red-400 font-semibold text-sm">Accès Administrateur</span>
                <ArrowRight className="w-5 h-5 text-red-400 group-hover/card:translate-x-2 transition" />
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 to-red-600/0 group-hover/card:from-red-600/10 group-hover/card:to-red-600/5 rounded-2xl transition duration-300"></div>
            </div>
          </div>

          {/* Portal 2: Employees */}
          <div className="group relative">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-900/20 rounded-2xl blur-xl group-hover:blur-2xl transition duration-300"></div>

            {/* Card */}
            <div className="relative bg-black/40 backdrop-blur-xl border border-blue-600/30 hover:border-blue-600/60 rounded-2xl p-10 transition duration-300 cursor-pointer group/card"
              onClick={() => window.location.href = '/login'}
            >
              {/* Badge */}
              <div className="inline-block bg-blue-900/30 border border-blue-600/50 rounded-lg px-3 py-1 mb-6">
                <span className="text-blue-300 text-xs font-semibold flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>UTILISATEURS</span>
                </span>
              </div>

              {/* Icon */}
              <div className="mb-6 inline-block p-4 bg-blue-900/20 rounded-xl group-hover/card:scale-110 transition">
                <Users className="w-10 h-10 text-blue-400" />
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl font-bold text-white mb-3">Employés & Directeurs</h3>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                Interface principale pour tous les collaborateurs. Accédez à votre département et gérez vos activités quotidiennes.
              </p>

              {/* Features */}
              <div className="space-y-2 mb-8">
                <div className="flex items-center space-x-2 text-gray-300 text-sm">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <span>Accès par département</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300 text-sm">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <span>Vision globale (Directeurs)</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300 text-sm">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <span>Gestion des projets</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300 text-sm">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <span>Communication en temps réel</span>
                </div>
              </div>

              {/* Button */}
              <div className="flex items-center justify-between pt-6 border-t border-blue-600/20">
                <span className="text-blue-400 font-semibold text-sm">Connexion Principale</span>
                <ArrowRight className="w-5 h-5 text-blue-400 group-hover/card:translate-x-2 transition" />
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-blue-600/0 group-hover/card:from-blue-600/10 group-hover/card:to-blue-600/5 rounded-2xl transition duration-300"></div>
            </div>
          </div>

        </div>

        {/* Info Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-xl p-8">
            <h3 className="text-white font-semibold text-lg mb-6">🔐 Architecture de Sécurité</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-blue-400 font-semibold mb-3">Portail Administrateur</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>✅ Interface dédiée et sécurisée</li>
                  <li>✅ Séparation des concerns</li>
                  <li>✅ Authentification BCRYPT</li>
                  <li>✅ JWT tokens signés</li>
                  <li>✅ Audit trail complet</li>
                  <li>✅ SameSite Cookies Strict</li>
                </ul>
              </div>
              <div>
                <h4 className="text-blue-400 font-semibold mb-3">Portail Principal</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>✅ Login personnalisé par département</li>
                  <li>✅ 4 rôles: Admin, Directeur, Secrétaire, Employé</li>
                  <li>✅ Control d'accès granulaire</li>
                  <li>✅ Authentification sécurisée</li>
                  <li>✅ Multi-langue support</li>
                  <li>✅ Sessions 24h</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>BLG-ENGINEERING © 2026 | Système Intégré Professionnel</p>
          <p className="mt-2">v3.0 | Tous droits réservés</p>
        </div>

      </div>
    </div>
  );
}
