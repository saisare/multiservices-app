'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Anti-boucle: éviter les redirections multiples
    if (isRedirecting) {
      console.log('⏳ Already redirecting, skip');
      return;
    }

    const redirectByRole = () => {
      console.log(`📍 Dashboard page loaded at: ${pathname}`);
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ No token in localStorage, redirect to login');
        setIsRedirecting(true);
        router.push('/login');
        return;
      }

      try {
        const [, payloadEncoded] = token.split('.');
        if (!payloadEncoded) {
          throw new Error('Invalid token format');
        }
        
        const payload = JSON.parse(atob(payloadEncoded));
        const role = payload.role;
        const departement = payload.departement;
        
        console.log(`👤 Decoded role: "${role}", departement: "${departement}"`);

        let targetPath = '/login';
        
        if (role === 'admin') {
          console.log('👤 Admin → /dashboard/admin');
          targetPath = '/dashboard/admin';
        } else if (role === 'directeur' || role === 'pdg') {
          console.log('👤 Directeur/PDG → /dashboard/pdg');
          targetPath = '/dashboard/pdg';
        } else if (role === 'secretaire') {
          console.log('👤 Secrétaire → /dashboard/secretaire');
          targetPath = '/dashboard/secretaire';
        } else if (role === 'employee' && departement) {
          console.log(`👤 Employee → /dashboard/${departement}`);
          targetPath = `/dashboard/${departement}`;
        } else {
          console.log(`⚠️ Unknown role: "${role}", fallback to login`);
          targetPath = '/login';
        }

        console.log(`Current: ${pathname}, Target: ${targetPath}`);
        
        // Vérifier que nous ne sommes pas déjà au bon endroit
        if (pathname === targetPath) {
          console.log('✅ Already at correct path');
          setLoading(false);
          return;
        }

        // Rediriger
        console.log(`➡️ Redirecting ${pathname} → ${targetPath}`);
        setIsRedirecting(true);
        router.push(targetPath);
        
      } catch (error) {
        console.error('❌ Token decode error:', error);
        console.log('🔄 Invalid token, clearing and redirect to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
        setIsRedirecting(true);
        router.push('/login');
      }
    };

    // Délai court avant redirection
    const timer = setTimeout(redirectByRole, 50);
    return () => clearTimeout(timer);
  }, [router, pathname, isRedirecting]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirection en cours...</p>
        <p className="text-gray-500 text-sm mt-2">{pathname}</p>
      </div>
    </div>
  );
}

