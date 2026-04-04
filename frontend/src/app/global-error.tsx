'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('❌ ERREUR GLOBALE:', error);
  }, [error]);

  return (
    <html>
      <body className="bg-gray-900">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <h1 className="text-4xl font-bold text-red-400 mb-4">⚠️ Erreur</h1>
            <p className="text-gray-300 mb-6">
              Une erreur critique s'est produite. Veuillez recharger.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium transition"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
