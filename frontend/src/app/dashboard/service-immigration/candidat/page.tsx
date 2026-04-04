'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { voyageApi } from '@/services/api/voyage.api';
import {
  Users, Search, Plus, Eye, Trash2, ArrowLeft, Save,
  AlertCircle, CheckCircle, Loader, Edit, Calendar, FileText
} from 'lucide-react';

interface Candidate {
  id: number;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  nationalite?: string;
  date_creation?: string;
}

export default function CandidatsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const action = searchParams.get('action');
  const candidateId = searchParams.get('id');

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [mode, setMode] = useState<'list' | 'detail' | 'new' | 'edit'>('list');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    nationalite: '',
    date_naissance: ''
  });

  useEffect(() => {
    if (action === 'new') {
      setMode('new');
    } else if (candidateId) {
      setMode('detail');
      loadCandidate(parseInt(candidateId));
    } else {
      loadCandidates();
    }
  }, [action, candidateId]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const data = await voyageApi.getImmigrationCandidates();
      setCandidates(data || []);
    } catch (err: any) {
      setError(err.message || 'Erreur chargement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCandidate = async (id: number) => {
    try {
      setLoading(true);
      const data = await voyageApi.getImmigrationCandidates();
      const found = data?.find(c => c.id === id);
      if (found) {
        setCandidate(found);
        setFormData({
          nom: found.nom || '',
          prenom: found.prenom || '',
          email: found.email || '',
          telephone: found.telephone || '',
          nationalite: found.nationalite || '',
          date_naissance: ''
        });
      } else {
        setError('Candidat non trouvé');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom || !formData.prenom) {
      setError('Nom et prénom requis');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      setSuccess('Candidat enregistré avec succès!');
      setTimeout(() => {
        router.push('/dashboard/service-immigration/candidat');
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  const filteredCandidates = candidates.filter(c =>
    (c.nom?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (c.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  if (loading && mode !== 'list') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {mode === 'list' && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Candidats Immigration</h1>
            <p className="text-gray-600 mt-1">Gestion des candidats aux demandes de visa</p>
          </div>
          <Link
            href="/dashboard/service-immigration/candidat?action=new"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouveau candidat
          </Link>
        </div>
      )}

      {mode === 'new' && (
        <div className="flex items-center gap-4">
          <Link href="/dashboard/service-immigration/candidat" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Nouveau candidat</h1>
        </div>
      )}

      {mode === 'detail' && candidate && (
        <div className="flex items-center gap-4">
          <Link href="/dashboard/service-immigration/candidat" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{candidate.prenom} {candidate.nom}</h1>
            <p className="text-gray-600 mt-1">{candidate.nationalite || 'Nationalité non renseignée'}</p>
          </div>
        </div>
      )}

      {/* Messages */}
      {success && (
        <div className="flex gap-3 p-4 bg-green-100 border border-green-300 rounded-lg text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{success}</p>
            <p className="text-sm">Redirection en cours...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex gap-3 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* List Mode */}
      {mode === 'list' && (
        <>
          <div className="bg-white rounded-xl border p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un candidat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center h-64">
              <Loader className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : (
            <div className="bg-white rounded-xl border overflow-hidden">
              {filteredCandidates.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucun candidat trouvé</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nom</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nationalité</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredCandidates.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{c.prenom} {c.nom}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{c.email || '-'}</td>
                        <td className="px-6 py-4 text-gray-600">{c.nationalite || '-'}</td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/dashboard/service-immigration/candidat?id=${c.id}`}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      {/* Form Mode */}
      {(mode === 'new' || mode === 'edit') && (
        <div className="max-w-2xl bg-white rounded-xl border p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nationalité</label>
                <input
                  type="text"
                  value={formData.nationalite}
                  onChange={(e) => setFormData({...formData, nationalite: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
                <input
                  type="date"
                  value={formData.date_naissance}
                  onChange={(e) => setFormData({...formData, date_naissance: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <Link href="/dashboard/service-immigration/candidat">
                <button type="button" className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Annuler
                </button>
              </Link>
            </div>
          </form>
        </div>
      )}

      {/* Detail Mode */}
      {mode === 'detail' && candidate && (
        <div className="bg-white rounded-xl border p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Prénom</p>
              <p className="text-lg font-medium mt-1">{candidate.prenom}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Nom</p>
              <p className="text-lg font-medium mt-1">{candidate.nom}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-medium mt-1">{candidate.email || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Téléphone</p>
              <p className="text-lg font-medium mt-1">{candidate.telephone || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Nationalité</p>
              <p className="text-lg font-medium mt-1">{candidate.nationalite || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Créé le</p>
              <p className="text-lg font-medium mt-1">
                {candidate.date_creation ? new Date(candidate.date_creation).toLocaleDateString('fr-FR') : '-'}
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => setMode('edit')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </button>
            <Link href="/dashboard/service-immigration/candidat">
              <button type="button" className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Retour
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
