'use client';

import { useEffect } from 'react';

export default function DashboardBtpError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('🟠 BTP MODULE ERROR:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-orange-600 mb-4">⚠️ Erreur BTP</h1>
          <p className="text-gray-700 mb-4">
            Un problème s'est produit dans le module BTP.
          </p>
          <p className="text-sm text-gray-500 mb-6 font-mono bg-gray-100 p-3 rounded">
            {error.message}
          </p>
          <p className="text-xs text-gray-400 mb-4">
            ℹ️ Les autres modules continuent de fonctionner normalement.
          </p>
          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded transition"
            >
              Réessayer
            </button>
            <a
              href="/dashboard"
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-center transition"
            >
              Retour
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
