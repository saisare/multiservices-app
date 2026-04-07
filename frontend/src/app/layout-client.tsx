'use client';

import { ReactNode, useEffect } from 'react';
import { setupErrorMonitoring } from '@/services/errorMonitoring';

export function RootLayoutClient({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Setup error monitoring on client side
    setupErrorMonitoring();

    // Log app initialization
    console.log('🚀 BLG-ENGINEERING v3.0 initialized');
    console.log('📦 Microservices Ready');
    console.log('🔐 Security: JWT + BCRYPT');

    // Check auth status
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      console.log('✅ User authenticated:', JSON.parse(user).email);
    }

    // Setup unload warning
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only warn if there are unsaved changes (optional)
      // e.preventDefault();
      // e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return children;
}
