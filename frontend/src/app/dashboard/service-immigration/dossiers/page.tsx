'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { voyageApi } from '@/services/api/voyage.api';
import {
  FileText, Search, Plus, Eye, ArrowLeft, Save, Filter,
  AlertCircle, CheckCircle, Loader, Calendar, User
} from 'lucide-react';

interface Dossier {
  id: number;
  numero_dossier?: string;
  candidat_id?: number;
  candidat_nom?: string;
  type_visa?: string;
  statut: string;
  date_depot?: string;
  date_decision?: string;
}

export default function DossiersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const action = searchParams.get('action');
  const dossierId = searchParams.get('id');

  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [mode, setMode] = useState<'list' | 'detail' | 'new'>('list');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    candidat_id: '',
    type_visa: 'COURT_SEJOUR',
    statut: 'EN_ATTENTE'
  });

  useEffect(() => {
    if (action === 'new') {
      setMode('new');
    } else if (dossierId) {
      setMode('detail');
      loadDossier(parseInt(dossierId));
    } else {
      loadDossiers();
    }
  }, [action, dossierId]);

  const loadDossiers = async () => {
    try {
      setLoading(true);
      const data = await voyageApi.getDossiers();
      setDossiers(data || []);
    } catch (err: any) {
      setError(err.message || 'Erreur chargement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDossier = async (id: number) => {
    try {
      setLoading(true);
      const data = await voyageApi.getDossiers();
      const found = data?.find(d => d.id === id);
      if (found) {
        setDossier(found);
        setFormData({
          candidat_id: found.candidat_id?.toString() || '',
          type_visa: found.type_visa || 'COURT_SEJOUR',
          statut: found.statut || 'EN_ATTENTE'
        });
      } else {
        setError('Dossier non trouvé');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.candidat_id || !formData.type_visa) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      setSuccess('Dossier enregistré avec succès!');
      setTimeout(() => {
        router.push('/dashboard/service-immigration/dossiers');
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'EN_INSTRUCTION':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'APPROUVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJETE':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredDossiers = (Array.isArray(dossiers) ? dossiers : []).filter(d => {
    const matchesSearch = (d.numero_dossier?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                          (d.candidat_nom?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = statusFilter === 'all' || d.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading && mode !== 'list') {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {mode === 'list' && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dossiers d'Immigration</h1>
            <p className="text-gray-600 mt-1">Suivi des demandes et statuts</p>
          </div>
          <Link
            href="/dashboard/service-immigration/dossiers?action=new"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouveau dossier
          </Link>
        </div>
      )}

      {mode === 'new' && (
        <div className="flex items-center gap-4">
          <Link href="/dashboard/service-immigration/dossiers" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Créer un dossier</h1>
        </div>
      )}

      {/* Messages */}
      {success && (
        <div className="flex gap-3 p-4 bg-green-100 border border-green-300 rounded-lg text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{success}</p>
        </div>
      )}

      {error && (
        <div className="flex gap-3 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* List Mode */}
      {mode === 'list' && (
        <>
          <div className="bg-white rounded-xl border p-4 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par numéro ou candidat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="EN_ATTENTE">En attente</option>
                <option value="EN_INSTRUCTION">En instruction</option>
                <option value="APPROUVE">Approuvé</option>
                <option value="REJETE">Rejeté</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center h-64">
              <Loader className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : (
            <div className="bg-white rounded-xl border overflow-hidden">
              {filteredDossiers.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucun dossier trouvé</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">N° Dossier</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Candidat</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type Visa</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date Dépôt</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Statut</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredDossiers.map(d => (
                        <tr key={d.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-mono font-medium text-gray-900">{d.numero_dossier || '-'}</td>
                          <td className="px-6 py-4">{d.candidat_nom || '-'}</td>
                          <td className="px-6 py-4 text-gray-600">{d.type_visa || '-'}</td>
                          <td className="px-6 py-4 text-gray-600">
                            {d.date_depot ? new Date(d.date_depot).toLocaleDateString('fr-FR') : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(d.statut)}`}>
                              {d.statut}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Link
                              href={`/dashboard/service-immigration/dossiers?id=${d.id}`}
                              className="text-green-600 hover:text-green-800"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* New Form */}
      {mode === 'new' && (
        <div className="max-w-2xl bg-white rounded-xl border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Candidat *</label>
              <select
                value={formData.candidat_id}
                onChange={(e) => setFormData({...formData, candidat_id: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Sélectionner un candidat</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de Visa *</label>
                <select
                  value={formData.type_visa}
                  onChange={(e) => setFormData({...formData, type_visa: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="COURT_SEJOUR">Court séjour</option>
                  <option value="LONG_SEJOUR">Long séjour</option>
                  <option value="ETUDIANT">Étudiant</option>
                  <option value="PROFESSIONNEL">Professionnel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select
                  value={formData.statut}
                  onChange={(e) => setFormData({...formData, statut: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="EN_ATTENTE">En attente</option>
                  <option value="EN_INSTRUCTION">En instruction</option>
                  <option value="APPROUVE">Approuvé</option>
                  <option value="REJETE">Rejeté</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Création...' : 'Créer le dossier'}
              </button>
              <Link href="/dashboard/service-immigration/dossiers">
                <button type="button" className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Annuler
                </button>
              </Link>
            </div>
          </form>
        </div>
      )}

      {/* Detail Mode */}
      {mode === 'detail' && dossier && (
        <div className="bg-white rounded-xl border p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">N° Dossier</p>
              <p className="text-lg font-medium mt-1 font-mono">{dossier.numero_dossier || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Candidat</p>
              <p className="text-lg font-medium mt-1">{dossier.candidat_nom || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Type de Visa</p>
              <p className="text-lg font-medium mt-1">{dossier.type_visa || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Statut</p>
              <p className="mt-1">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(dossier.statut)}`}>
                  {dossier.statut}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date de Dépôt</p>
              <p className="text-lg font-medium mt-1">
                {dossier.date_depot ? new Date(dossier.date_depot).toLocaleDateString('fr-FR') : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date de Décision</p>
              <p className="text-lg font-medium mt-1">
                {dossier.date_decision ? new Date(dossier.date_decision).toLocaleDateString('fr-FR') : '-'}
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Link href="/dashboard/service-immigration/dossiers">
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
