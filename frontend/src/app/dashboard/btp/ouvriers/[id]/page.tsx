'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { buildServiceBase } from '@/lib/runtime-api';
import { Loader, AlertCircle, Edit, ArrowLeft, Trash2 } from 'lucide-react';

const BTP_API_BASE = `${buildServiceBase(3003)}/api`;

export default function OuvrierDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ouvrier, setOuvrier] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    fetchOuvrier();
  }, [id]);

  const fetchOuvrier = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${BTP_API_BASE}/ouvriers/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Ouvrier non trouvé');
      const data = await response.json();
      setOuvrier(data);
    } catch (err) {
      setError((err as any).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet ouvrier?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BTP_API_BASE}/ouvriers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');
      router.push('/dashboard/btp/ouvriers');
    } catch (err) {
      setError((err as any).message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !ouvrier) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6"
          >
            <ArrowLeft size={20} />
            Retour
          </button>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Erreur</h2>
                <p className="text-gray-600 mt-1">{error || 'Ouvrier non trouvé'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6"
        >
          <ArrowLeft size={20} />
          Retour
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
            <h1 className="text-3xl font-bold">
              {ouvrier.prenom} {ouvrier.nom}
            </h1>
            <p className="text-orange-100 mt-1">{ouvrier.metier}</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations Personnelles</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-gray-900">{ouvrier.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Téléphone</p>
                    <p className="text-gray-900">{ouvrier.telephone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations Professionnelles</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Poste</p>
                    <p className="text-gray-900">{ouvrier.metier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Salaire</p>
                    <p className="text-gray-900">{ouvrier.salaire_journalier ? `${ouvrier.salaire_journalier} FCFA/jour` : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200 flex gap-4">
              <button
                onClick={() => router.push(`/dashboard/btp/ouvriers/${id}/edit`)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition"
              >
                <Edit size={18} />
                Modifier
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition"
              >
                <Trash2 size={18} />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
