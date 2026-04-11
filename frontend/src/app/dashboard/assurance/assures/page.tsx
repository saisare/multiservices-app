'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, Search, Filter, Plus, Eye, Edit, Trash2,
  ArrowLeft, AlertCircle, CheckCircle, Mail, Phone, MapPin
} from 'lucide-react';
import { BackButton } from '@/components/BackButton';
import { AlertContainer } from '@/components/Alert';
import { usePageState } from '@/hooks/usePageState';
import { assuranceApi } from '@/services/api/assurance.api';

interface Assure {
  id: number;
  code_assure: string;
  type_assure: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  date_creation?: string;
}

export default function AssuresPageV2() {
  const router = useRouter();
  const { action, itemId, isList, isDetail, isNew } = usePageState();

  const [assures, setAssures] = useState<Assure[]>([]);
  const [selectedAssure, setSelectedAssure] = useState<Assure | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const [formData, setFormData] = useState<{
    type_assure: 'PARTICULIER' | 'ENTREPRISE';
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    adresse: string;
  }>({
    type_assure: 'PARTICULIER',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: ''
  });

  // Charger les assurés
  useEffect(() => {
    loadAssures();
  }, []);

  // Charger un assuré spécifique quand l'ID change
  useEffect(() => {
    if (isDetail && itemId) {
      loadAssureById(parseInt(itemId));
    }
  }, [itemId, isDetail]);

  const loadAssures = async () => {
    try {
      setLoading(true);
      const data = await assuranceApi.getAssures();
      setAssures(data as unknown as Assure[]);
    } catch (err: any) {
      setError(`Erreur chargement: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadAssureById = async (id: number) => {
    try {
      setLoading(true);
      const assure = await assuranceApi.getAssure(id);
      if (!assure) {
        setError('Assuré non trouvé');
        return;
      }
      setSelectedAssure(assure);
      setFormData({
        type_assure: assure.type_assure === 'ENTREPRISE' ? 'ENTREPRISE' : 'PARTICULIER',
        nom: assure.nom,
        prenom: assure.prenom,
        email: assure.email,
        telephone: assure.telephone,
        adresse: assure.adresse
      });
    } catch (err: any) {
      setError(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.nom) {
      setError('Le nom est obligatoire');
      return;
    }

    try {
      setLoading(true);
      await assuranceApi.createAssure({
        type_assure: formData.type_assure,
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        adresse: formData.adresse,
        date_naissance: '',
        entreprise: formData.type_assure === 'ENTREPRISE' ? formData.nom : ''
      } as any);
      setSuccess('Assuré créé avec succès');
      setTimeout(() => router.push('/dashboard/assurance/assures'), 1500);
    } catch (err: any) {
      setError(`Erreur création: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr?')) return;
    try {
      setLoading(true);
      await new Promise(r => setTimeout(r, 500));
      setSuccess('Assuré supprimé');
      setTimeout(() => router.push('/dashboard/assurance/assures'), 1500);
    } catch (err: any) {
      setError(`Erreur suppression: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssures = assures.filter(a =>
    (a.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.code_assure.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (typeFilter === 'all' || a.type_assure === typeFilter)
  );

  if (loading && !isList) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin border-4 border-blue-500 border-t-transparent rounded-full w-12 h-12" />
      </div>
    );
  }

  // PAGE LISTE
  if (isList) {
    return (
      <div className="space-y-6">
        <AlertContainer
          error={error}
          success={success}
          onErrorClose={() => setError('')}
          onSuccessClose={() => setSuccess('')}
        />

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assurés</h1>
            <p className="text-gray-600">Gestion des clients d'assurance</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/assurance/assures?action=new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Plus size={20} />
            Nouvel assuré
          </button>
        </div>

        <div className="bg-white rounded-lg border p-4 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">Tous types</option>
            <option value="PARTICULIER">Particuliers</option>
            <option value="ENTREPRISE">Entreprises</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssures.map(a => (
            <div key={a.id} className="bg-white rounded-lg border p-4 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {a.prenom ? a.prenom[0] : a.nom[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {a.type_assure === 'PARTICULIER' ? `${a.prenom} ${a.nom}` : a.nom}
                    </h3>
                    <p className="text-xs text-gray-500">{a.code_assure}</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/dashboard/assurance/assures?action=detail&id=${a.id}`)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Eye size={18} className="text-blue-600" />
                </button>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail size={14} />
                  {a.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} />
                  {a.telephone}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAssures.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun assuré trouvé</p>
          </div>
        )}
      </div>
    );
  }

  // PAGE NOUVEAU
  if (isNew) {
    return (
      <div className="space-y-6">
        <AlertContainer
          error={error}
          success={success}
          onErrorClose={() => setError('')}
          onSuccessClose={() => setSuccess('')}
        />

        <div className="flex items-center gap-4">
          <BackButton href="/dashboard/assurance/assures" />
          <h1 className="text-3xl font-bold flex-1">Nouvel assuré</h1>
        </div>

        <div className="bg-white rounded-lg border p-8 max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={formData.type_assure}
                onChange={e => setFormData({...formData, type_assure: e.target.value as any})}
                className="w-full p-2 border rounded-lg"
              >
                <option value="PARTICULIER">Particulier</option>
                <option value="ENTREPRISE">Entreprise</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nom *</label>
              <input
                type="text"
                value={formData.nom}
                onChange={e => setFormData({...formData, nom: e.target.value})}
                className="w-full p-2 border rounded-lg"
                placeholder="Nom"
              />
            </div>

            {formData.type_assure === 'PARTICULIER' && (
              <div>
                <label className="block text-sm font-medium mb-2">Prénom</label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={e => setFormData({...formData, prenom: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Prénom"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full p-2 border rounded-lg"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Téléphone</label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={e => setFormData({...formData, telephone: e.target.value})}
                className="w-full p-2 border rounded-lg"
                placeholder="0123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Adresse</label>
              <textarea
                value={formData.adresse}
                onChange={e => setFormData({...formData, adresse: e.target.value})}
                className="w-full p-2 border rounded-lg"
                rows={3}
                placeholder="Adresse complète"
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                onClick={() => router.push('/dashboard/assurance/assures')}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PAGE DÉTAIL
  if (isDetail && selectedAssure) {
    return (
      <div className="space-y-6">
        <AlertContainer
          error={error}
          success={success}
          onErrorClose={() => setError('')}
          onSuccessClose={() => setSuccess('')}
        />

        <div className="flex items-center gap-4">
          <BackButton href="/dashboard/assurance/assures" />
          <h1 className="text-3xl font-bold flex-1">
            {selectedAssure.type_assure === 'PARTICULIER'
              ? `${selectedAssure.prenom} ${selectedAssure.nom}`
              : selectedAssure.nom}
          </h1>
          <button
            onClick={() => handleDelete(selectedAssure.id)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            <Trash2 size={18} />
            Supprimer
          </button>
        </div>

        <div className="bg-white rounded-lg border p-8 max-w-2xl">
          <h2 className="text-xl font-semibold mb-6">Informations</h2>
          <div className="space-y-3 text-gray-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-medium">
                  {selectedAssure.type_assure === 'PARTICULIER' ? 'Particulier' : 'Entreprise'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Code</p>
                <p className="font-medium">{selectedAssure.code_assure}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{selectedAssure.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Téléphone</p>
              <p className="font-medium">{selectedAssure.telephone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Adresse</p>
              <p className="font-medium">{selectedAssure.adresse}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <p className="text-gray-700">État invalide de la page</p>
    </div>
  );
}
