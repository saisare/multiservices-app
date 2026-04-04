'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { btpApi, Chantier } from '@/services/api/btp.api';
import { ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function NouveauChantier() {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<Chantier>>({
    code_chantier: '',
    nom: '',
    adresse: '',
    client_nom: '',
    date_debut: '',
    date_fin_prevue: '',
    budget: 0,
    statut: 'EN_COURS'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseFloat(value) : 0) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.code_chantier || !formData.nom || !formData.date_debut || !formData.date_fin_prevue) {
      setError('Veuillez remplir tous les champs obligatoires');
      setLoading(false);
      return;
    }

    try {
      await btpApi.createChantier(formData);
      setSuccess('Chantier créé avec succès!');
      setTimeout(() => {
        router.push('/dashboard/btp/chantiers');
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Erreur création chantier');
      console.error('Erreur création chantier:', err);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/btp/chantiers" className="p-2 hover:bg-orange-100 rounded-lg text-orange-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nouveau chantier</h1>
          <p className="text-gray-600 mt-1">Créer un nouveau projet de construction</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Code chantier *</label>
                <input
                  type="text"
                  name="code_chantier"
                  value={formData.code_chantier || ''}
                  onChange={handleChange}
                  placeholder="ex: CH-2024-001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du chantier *</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom || ''}
                  onChange={handleChange}
                  placeholder="ex: Rénovation bâtiment A"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
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
                placeholder="Adresse complète du chantier"
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
                placeholder="Nom du client ou entreprise"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Section 2: Planification */}
          <div className="pt-4 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Planification</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de début *</label>
                <input
                  type="date"
                  name="date_debut"
                  value={formData.date_debut || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date fin prévue *</label>
                <input
                  type="date"
                  name="date_fin_prevue"
                  value={formData.date_fin_prevue || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
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
                  placeholder="0"
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
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Création en cours...' : 'Créer le chantier'}
            </button>
            <Link href="/dashboard/btp/chantiers">
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
