'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { buildServiceBase } from '@/lib/runtime-api';
import {
  Lock, Eye, EyeOff, Shield, AlertCircle, CheckCircle, Loader, ArrowRight
} from 'lucide-react';

const AUTH_API_BASE = buildServiceBase(3002);

interface LoginForm {
  email: string;
  password: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Vérifier si déjà connecté
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      const userData = JSON.parse(user);
      if (userData.role === 'admin') {
        router.replace('/admin');
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${AUTH_API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          departement: 'DIRECTION'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de connexion');
      }

      if (data.user.role !== 'admin') {
        throw new Error('❌ Les administrateurs uniquement peuvent accéder ici');
      }

      // Stocker
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      document.cookie = `auth_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;

      setSuccess('✅ Connexion réussie! Redirection...');
      setTimeout(() => {
        router.push('/admin');
      }, 500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-gray-900 to-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-red-900/20 backdrop-blur-xl rounded-2xl p-8 border border-red-600/30 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-red-600/20 rounded-full mb-4">
              <Shield className="w-12 h-12 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              PANNEAU ADMIN
            </h1>
            <p className="text-gray-300 mt-2">Interface Sécurisée Administrateur</p>
            <p className="text-gray-400 text-xs mt-2">BLG-ENGINEERING v3.0</p>
          </div>

          {/* Messages */}
          {success && (
            <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="text-green-300 text-sm">{success}</div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-red-300 text-sm mb-2">Email Administrateur</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-red-600/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                placeholder="admin@blg-engineering.com"
                required
              />
            </div>

            <div>
              <label className="block text-red-300 text-sm mb-2">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-red-600/30 rounded-lg text-white pr-10 focus:outline-none focus:border-red-500"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg text-white font-medium hover:from-red-700 hover:to-orange-700 disabled:opacity-50 flex items-center justify-center gap-2 transition"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Accès Administrateur
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Sécurité */}
          <div className="mt-6 p-4 bg-red-600/10 border border-red-600/20 rounded-lg space-y-2">
            <p className="text-xs text-red-300">🔒 Chiffrement SSL/TLS activé</p>
            <p className="text-xs text-red-300">🔐 Authentification BCRYPT</p>
            <p className="text-xs text-red-300">📛 Tokens JWT signés et vérifiés</p>
            <p className="text-xs text-red-300">✅ Connexions enregistrées</p>
          </div>

          {/* Test info */}
          <div className="mt-4 p-3 bg-yellow-600/10 border border-yellow-600/20 rounded-lg text-xs text-yellow-300">
            <p>📝 Test: admin@blg-engineering.com</p>
            <p>🔑 Password: Blg1app23@</p>
          </div>
        </div>
      </div>
    </div>
  );
}
