// frontend/src/app/admin/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Home, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Administration</h1>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card: User Management */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 hover:border-blue-400/50 transition-all cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Gestion des utilisateurs</h2>
            <p className="text-gray-200 text-sm">Gérer les utilisateurs et leurs permissions</p>
          </div>

          {/* Card: System Settings */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 hover:border-blue-400/50 transition-all cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Paramètres système</h2>
            <p className="text-gray-200 text-sm">Configurer les paramètres de l'application</p>
          </div>

          {/* Card: Logs */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 hover:border-blue-400/50 transition-all cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Journaux d'activité</h2>
            <p className="text-gray-200 text-sm">Consulter les journaux du système</p>
          </div>

          {/* Card: Database */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 hover:border-blue-400/50 transition-all cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Base de données</h2>
            <p className="text-gray-200 text-sm">Gérer et maintenir la base de données</p>
          </div>

          {/* Card: Security */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 hover:border-blue-400/50 transition-all cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Sécurité</h2>
            <p className="text-gray-200 text-sm">Paramètres de sécurité et authentification</p>
          </div>

          {/* Card: Backup */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 hover:border-blue-400/50 transition-all cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Sauvegardes</h2>
            <p className="text-gray-200 text-sm">Gérer les sauvegardes du système</p>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-12">
          <Link
            href="/login"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Retour au login</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
