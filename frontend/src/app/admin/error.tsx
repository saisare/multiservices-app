'use client';

import { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error service
    console.error('🔴 ADMIN ERROR:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">⚠️ Erreur Admin</h1>
          <p className="text-gray-700 mb-4">
            Un problème s'est produit dans le portail administrateur.
          </p>
          <p className="text-sm text-gray-500 mb-6 font-mono bg-gray-100 p-3 rounded">
            {error.message}
          </p>
          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition"
            >
              Réessayer
            </button>
            <a
              href="/"
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-center transition"
            >
              Accueil
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
