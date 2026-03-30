'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const redirectByRole = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const [, payloadEncoded] = token.split('.');
        const payload = JSON.parse(atob(payloadEncoded));
        const role = payload.role;

        // Rediriger selon le rôle
        switch (role) {
          case 'admin':
            router.push('/dashboard/admin');
            break;
          case 'directeur':
            router.push('/dashboard/pdg');
            break;
          case 'secretaire':
            router.push('/dashboard/secretaire');
            break;
          default:
            router.push('/login');
        }
      } catch (error) {
        console.error('Token error:', error);
        router.push('/login');
      }
    };

    const timer = setTimeout(redirectByRole, 100);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirection en cours...</p>
      </div>
    </div>
  );
}
