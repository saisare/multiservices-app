'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { buildServiceBase } from '@/lib/runtime-api';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader } from 'lucide-react';

const AUTH_API_BASE = buildServiceBase(3002);

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailFromUrl = searchParams.get('email');
    if (emailFromUrl) setEmail(decodeURIComponent(emailFromUrl));
    const notice = searchParams.get('notice');
    if (notice === 'use-admin-portal') setSuccess('✅ Veuillez utiliser le portail admin dédié');
  }, [searchParams]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Email et password requis');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${AUTH_API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, departement: 'DIRECTION' })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur de connexion');
      if (!data.user || (data.user.role !== 'admin' && data.user.role !== 'directeur')) {
        throw new Error('Accès administrateur requis');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('departement', 'DIRECTION');
      document.cookie = `auth_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;

      setSuccess('✅ Connexion réussie!');
      setTimeout(() => {
        router.push(data.user.role === 'admin' ? '/admin' : '/dashboard/directeur');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-red-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-gradient-to-br from-red-900/30 to-red-900/10 backdrop-blur-xl border border-red-400/20 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-red-100 mb-2">🔴 PORTAIL ADMIN</h1>
            <p className="text-red-200/80">BLG-ENGINEERING</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-400/50 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-300" />
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-400/50 rounded-lg flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <p className="text-green-200">{success}</p>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-red-100/80 text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@blg-engineering.com"
                className="w-full px-4 py-3 bg-red-900/20 border border-red-400/30 rounded-lg text-red-50 focus:outline-none focus:border-red-400/60"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-red-100/80 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full px-4 py-3 bg-red-900/20 border border-red-400/30 rounded-lg text-red-50 focus:outline-none focus:border-red-400/60"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-red-300/60 hover:text-red-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Connexion Admin
                </>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-red-500/10 border border-red-400/20 rounded-lg text-sm text-red-200/80">
            <strong>Test credentials:</strong><br/>
            admin@blg-engineering.com<br/>
            BtpAdmin2026@
          </div>

          <div className="mt-6 text-center">
            <button onClick={() => router.push('/login')} className="text-red-300/60 hover:text-red-300 text-sm">
              ← Back to user login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
