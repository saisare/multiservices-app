'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { btpApi, Chantier } from '@/services/api/btp.api';
import { ArrowLeft, Save, AlertCircle, Loader, CheckCircle } from 'lucide-react';

export default function EditChantier() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);

  const [formData, setFormData] = useState<Partial<Chantier> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadChantier();
  }, [id]);

  const loadChantier = async () => {
    try {
      setLoading(true);
      const chantier = await btpApi.getChantier(id);
      if (chantier) {
        setFormData(chantier);
      } else {
        setError('Chantier non trouvé');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur chargement chantier');
      console.error('Erreur chargement chantier:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => prev ? {
      ...prev,
      [name]: type === 'number' ? (value ? parseFloat(value) : 0) : value
    } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !id) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await btpApi.updateChantier(id, formData);
      setSuccess('Chantier modifié avec succès!');
      setTimeout(() => {
        router.push(`/dashboard/btp/chantiers/${id}`);
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Erreur modification chantier');
      console.error('Erreur modification chantier:', err);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 animate-spin text-orange-600" />
          <span className="text-gray-600">Chargement du chantier...</span>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/btp/chantiers" className="p-2 hover:bg-orange-100 rounded-lg text-orange-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Éditer chantier</h1>
        </div>
        <div className="bg-red-100 border border-red-300 rounded-lg p-4 text-red-700">
          {error || 'Chantier non trouvé'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/btp/chantiers/${id}`} className="p-2 hover:bg-orange-100 rounded-lg text-orange-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Éditer chantier</h1>
          <p className="text-gray-600 mt-1">{formData.nom}</p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="flex gap-3 p-4 bg-green-100 border border-green-300 rounded-lg text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{success}</p>
            <p className="text-sm">Redirection en cours...</p>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="max-w-4xl bg-white rounded-xl border border-orange-100 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Identité du chantier */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Identité du chantier</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Code chantier</label>
                <input
                  type="text"
                  value={formData.code_chantier || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Non modifiable</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du chantier</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
              <input
                type="text"
                name="adresse"
                value={formData.adresse || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom du client</label>
              <input
                type="text"
                name="client_nom"
                value={formData.client_nom || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Section 2: Planification */}
          <div className="pt-4 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Planification</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
                <input
                  type="date"
                  name="date_debut"
                  value={formData.date_debut || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date fin prévue</label>
                <input
                  type="date"
                  name="date_fin_prevue"
                  value={formData.date_fin_prevue || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date fin réelle</label>
              <input
                type="date"
                name="date_fin_reelle"
                value={formData.date_fin_reelle || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">À remplir seulement si le chantier est terminé</p>
            </div>
          </div>

          {/* Section 3: Budget & Statut */}
          <div className="pt-4 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget & Statut</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget (€)</label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget || 0}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select
                  name="statut"
                  value={formData.statut || 'EN_COURS'}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="EN_COURS">En cours</option>
                  <option value="TERMINE">Terminé</option>
                  <option value="SUSPENDU">Suspendu</option>
                  <option value="ANNULE">Annulé</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex gap-3 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 mt-6">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
            </button>
            <Link href={`/dashboard/btp/chantiers/${id}`}>
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Annuler
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
