'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { voyageApi } from '@/services/api/voyage.api';
import {
  Calendar, Search, Plus, Eye, ArrowLeft, Save, Clock,
  AlertCircle, CheckCircle, Loader, User, MapPin, Phone
} from 'lucide-react';

interface RendezVous {
  id: number;
  numero_rdv?: string;
  candidat_id?: number;
  candidat_nom?: string;
  date_rdv: string;
  heure_rdv?: string;
  localisation?: string;
  objet?: string;
  statut: string;
}

export default function RendezVousPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const action = searchParams.get('action');
  const rdvId = searchParams.get('id');

  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [selectedRdv, setSelectedRdv] = useState<RendezVous | null>(null);
  const [mode, setMode] = useState<'list' | 'detail' | 'new'>('list');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    candidat_id: '',
    date_rdv: '',
    heure_rdv: '',
    localisation: '',
    objet: '',
    statut: 'PREVU'
  });

  useEffect(() => {
    if (action === 'new') {
      setMode('new');
    } else if (rdvId) {
      setMode('detail');
      loadRendezVous(parseInt(rdvId));
    } else {
      loadAllRendezVous();
    }
  }, [action, rdvId]);

  const loadAllRendezVous = async () => {
    try {
      setLoading(true);
      const data = await voyageApi.getRendezVous();
      setRendezVous(data || []);
    } catch (err: any) {
      setError(err.message || 'Erreur chargement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRendezVous = async (id: number) => {
    try {
      setLoading(true);
      const data = await voyageApi.getRendezVous();
      const found = data?.find(r => r.id === id);
      if (found) {
        setSelectedRdv(found);
        setFormData({
          candidat_id: found.candidat_id?.toString() || '',
          date_rdv: found.date_rdv || '',
          heure_rdv: found.heure_rdv || '',
          localisation: found.localisation || '',
          objet: found.objet || '',
          statut: found.statut || 'PREVU'
        });
      } else {
        setError('RDV non trouvé');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.candidat_id || !formData.date_rdv) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      setSuccess('Rendez-vous créé avec succès!');
      setTimeout(() => {
        router.push('/dashboard/service-immigration/rendey-vous');
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'PREVU':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CONFIRME':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REALISE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'ANNULE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'REPORTE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredRendezVous = rendezVous.filter(r => {
    const matchesSearch = (r.candidat_nom?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                          (r.numero_rdv?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = statusFilter === 'all' || r.statut === statusFilter;
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
            <h1 className="text-3xl font-bold text-gray-900">Rendez-vous</h1>
            <p className="text-gray-600 mt-1">Planification et gestion des rendez-vous</p>
          </div>
          <Link
            href="/dashboard/service-immigration/rendey-vous?action=new"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouveau RDV
          </Link>
        </div>
      )}

      {mode === 'new' && (
        <div className="flex items-center gap-4">
          <Link href="/dashboard/service-immigration/rendey-vous" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Planifier un rendez-vous</h1>
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
                  placeholder="Rechercher par candidat..."
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
                <option value="PREVU">Prévu</option>
                <option value="CONFIRME">Confirmé</option>
                <option value="REALISE">Réalisé</option>
                <option value="REPORTE">Reporté</option>
                <option value="ANNULE">Annulé</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center h-64">
              <Loader className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRendezVous.length === 0 ? (
                <div className="col-span-2 text-center py-12 bg-white rounded-xl border">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucun rendez-vous trouvé</p>
                </div>
              ) : (
                filteredRendezVous.map(rdv => (
                  <div key={rdv.id} className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{rdv.candidat_nom || 'Non spécifié'}</h3>
                        <p className="text-sm text-gray-600">{rdv.numero_rdv || '-'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(rdv.statut)}`}>
                        {rdv.statut}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          {new Date(rdv.date_rdv).toLocaleDateString('fr-FR')}
                        </span>
                        {rdv.heure_rdv && (
                          <>
                            <span className="text-gray-400">à</span>
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{rdv.heure_rdv}</span>
                          </>
                        )}
                      </div>

                      {rdv.localisation && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{rdv.localisation}</span>
                        </div>
                      )}

                      {rdv.objet && (
                        <p className="text-sm text-gray-600 line-clamp-2">{rdv.objet}</p>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <Link
                        href={`/dashboard/service-immigration/rendey-vous?id=${rdv.id}`}
                        className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Voir détails
                      </Link>
                    </div>
                  </div>
                ))
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Sélectionner un candidat</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                <input
                  type="date"
                  value={formData.date_rdv}
                  onChange={(e) => setFormData({...formData, date_rdv: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heure</label>
                <input
                  type="time"
                  value={formData.heure_rdv}
                  onChange={(e) => setFormData({...formData, heure_rdv: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lieu</label>
              <input
                type="text"
                placeholder="ex: Bureau de l'immigration"
                value={formData.localisation}
                onChange={(e) => setFormData({...formData, localisation: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Objet</label>
              <textarea
                placeholder="Description du rendez-vous"
                value={formData.objet}
                onChange={(e) => setFormData({...formData, objet: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select
                value={formData.statut}
                onChange={(e) => setFormData({...formData, statut: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="PREVU">Prévu</option>
                <option value="CONFIRME">Confirmé</option>
                <option value="REALISE">Réalisé</option>
                <option value="REPORTE">Reporté</option>
                <option value="ANNULE">Annulé</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Création...' : 'Créer le RDV'}
              </button>
              <Link href="/dashboard/service-immigration/rendey-vous">
                <button type="button" className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Annuler
                </button>
              </Link>
            </div>
          </form>
        </div>
      )}

      {/* Detail Mode */}
      {mode === 'detail' && selectedRdv && (
        <div className="bg-white rounded-xl border p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">{selectedRdv.candidat_nom}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">N° RDV</p>
                <p className="text-lg font-medium mt-1 font-mono">{selectedRdv.numero_rdv || '-'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Statut</p>
                <p className="mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedRdv.statut)}`}>
                    {selectedRdv.statut}
                  </span>
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Date et Heure</p>
                <p className="text-lg font-medium mt-1">
                  {new Date(selectedRdv.date_rdv).toLocaleDateString('fr-FR')}
                  {selectedRdv.heure_rdv && ` à ${selectedRdv.heure_rdv}`}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Lieu</p>
                <p className="text-lg font-medium mt-1">{selectedRdv.localisation || '-'}</p>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Objet</p>
                <p className="text-lg font-medium mt-1">{selectedRdv.objet || '-'}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Link href="/dashboard/service-immigration/rendey-vous">
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
