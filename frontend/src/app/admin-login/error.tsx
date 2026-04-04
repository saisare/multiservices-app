'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('❌ Erreur:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Erreur</h1>
          <p className="text-gray-300 mb-4">
            Une erreur est survenue sur cette page.
          </p>
          <p className="text-sm text-gray-400 mb-6 bg-black/20 p-3 rounded break-words">
            {error.message.substring(0, 100)}...
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => reset()}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium transition"
            >
              Réessayer
            </button>
            <a
              href="/"
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white font-medium transition"
            >
              Accueil
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
