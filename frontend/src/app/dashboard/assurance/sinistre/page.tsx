'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle, Search, Plus, Eye, Trash2, Calendar, DollarSign
} from 'lucide-react';
import { BackButton } from '@/components/BackButton';
import { AlertContainer } from '@/components/Alert';
import { usePageState } from '@/hooks/usePageState';

interface Sinistre {
  id: number;
  numero_sinistre: string;
  assure_nom: string;
  date_sinistre: string;
  lieu_sinistre: string;
  montant_estime: number;
  statut: 'ENREGISTRE' | 'EN_COURS' | 'RESOLU' | 'REJETE';
  description: string;
}

export default function SinistresPageV2() {
  const router = useRouter();
  const { action, itemId, isList, isDetail, isNew } = usePageState();

  const [sinistres, setSinistres] = useState<Sinistre[]>([]);
  const [selectedSinistre, setSelectedSinistre] = useState<Sinistre | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    date_sinistre: new Date().toISOString().split('T')[0],
    lieu_sinistre: '',
    description: '',
    montant_estime: ''
  });

  useEffect(() => {
    loadSinistres();
  }, []);

  useEffect(() => {
    if (isDetail && itemId) {
      loadSinistreById(parseInt(itemId));
    }
  }, [itemId, isDetail]);

  const loadSinistres = async () => {
    try {
      setLoading(true);
      // Mock data
      setSinistres([
        { id: 1, numero_sinistre: 'SIN-001', assure_nom: 'Konan Jean', date_sinistre: '2026-03-15', lieu_sinistre: 'Cocody', montant_estime: 5000, statut: 'ENREGISTRE', description: 'Accident automobile' },
        { id: 2, numero_sinistre: 'SIN-002', assure_nom: 'Diallo Aminata', date_sinistre: '2026-03-10', lieu_sinistre: 'Plateau', montant_estime: 2000, statut: 'EN_COURS', description: 'Dégât habitatio' },
      ]);
    } catch (err: any) {
      setError(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadSinistreById = async (id: number) => {
    try {
      setLoading(true);
      const sinistre = sinistres.find(s => s.id === id);
      if (!sinistre) {
        setError('Sinistre non trouvé');
        return;
      }
      setSelectedSinistre(sinistre);
      setFormData({
        date_sinistre: sinistre.date_sinistre,
        lieu_sinistre: sinistre.lieu_sinistre,
        description: sinistre.description,
        montant_estime: sinistre.montant_estime.toString()
      });
    } catch (err: any) {
      setError(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.lieu_sinistre || !formData.description) {
      setError('Tous les champs sont obligatoires');
      return;
    }
    try {
      setLoading(true);
      await new Promise(r => setTimeout(r, 500));
      setSuccess('Sinistre créé');
      setTimeout(() => router.push('/dashboard/assurance/sinistres'), 1500);
    } catch (err: any) {
      setError(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr?')) return;
    try {
      setLoading(true);
      await new Promise(r => setTimeout(r, 500));
      setSuccess('Sinistre supprimé');
      setTimeout(() => router.push('/dashboard/assurance/sinistres'), 1500);
    } catch (err: any) {
      setError(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'ENREGISTRE': 'bg-blue-100 text-blue-800',
      'EN_COURS': 'bg-yellow-100 text-yellow-800',
      'RESOLU': 'bg-green-100 text-green-800',
      'REJETE': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredSinistres = sinistres.filter(s =>
    (s.numero_sinistre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.assure_nom.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'all' || s.statut === statusFilter)
  );

  if (loading && !isList) {
    return <div className="flex justify-center h-64"><div className="animate-spin border-4 border-blue-500 border-t-transparent rounded-full w-12 h-12" /></div>;
  }

  // PAGE LISTE
  if (isList) {
    return (
      <div className="space-y-6">
        <AlertContainer error={error} success={success} onErrorClose={() => setError('')} onSuccessClose={() => setSuccess('')} />

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Sinistres</h1>
            <p className="text-gray-600">Gestion des déclarations de sinistre</p>
          </div>
          <button onClick={() => router.push('/dashboard/assurance/sinistres?action=new')} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">
            <Plus size={20} />
            Nouveau sinistre
          </button>
        </div>

        <div className="bg-white rounded-lg border p-4 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="all">Tous statuts</option>
            <option value="ENREGISTRE">Enregistré</option>
            <option value="EN_COURS">En cours</option>
            <option value="RESOLU">Résolu</option>
            <option value="REJETE">Rejeté</option>
          </select>
        </div>

        <div className="space-y-3">
          {filteredSinistres.map(s => (
            <div key={s.id} className="bg-white rounded-lg border p-4 hover:shadow-lg transition flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <div className="flex-1">
                  <h3 className="font-semibold">{s.numero_sinistre}</h3>
                  <p className="text-sm text-gray-600">{s.assure_nom}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{new Date(s.date_sinistre).toLocaleDateString()}</p>
                  <p className="font-semibold">{s.montant_estime.toLocaleString()} €</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(s.statut)}`}>{s.statut}</span>
                <button onClick={() => router.push(`/dashboard/assurance/sinistres?action=detail&id=${s.id}`)} className="p-1 hover:bg-gray-100 rounded"><Eye size={18} className="text-blue-600" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // PAGE NOUVEAU
  if (isNew) {
    return (
      <div className="space-y-6">
        <AlertContainer error={error} success={success} onErrorClose={() => setError('')} onSuccessClose={() => setSuccess('')} />

        <div className="flex items-center gap-4">
          <BackButton href="/dashboard/assurance/sinistres" />
          <h1 className="text-3xl font-bold">Nouveau sinistre</h1>
        </div>

        <div className="bg-white rounded-lg border p-8 max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date du sinistre *</label>
              <input type="date" value={formData.date_sinistre} onChange={e => setFormData({...formData, date_sinistre: e.target.value})} className="w-full p-2 border rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Lieu du sinistre *</label>
              <input type="text" value={formData.lieu_sinistre} onChange={e => setFormData({...formData, lieu_sinistre: e.target.value})} className="w-full p-2 border rounded-lg" placeholder="Lieu du sinistre" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 border rounded-lg" rows={4} placeholder="Description détaillée" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Montant estimé (€)</label>
              <input type="number" value={formData.montant_estime} onChange={e => setFormData({...formData, montant_estime: e.target.value})} className="w-full p-2 border rounded-lg" placeholder="0" />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <button onClick={() => router.push('/dashboard/assurance/sinistres')} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Annuler</button>
              <button onClick={handleCreate} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">{loading ? 'Création...' : 'Créer'}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PAGE DÉTAIL
  if (isDetail && selectedSinistre) {
    return (
      <div className="space-y-6">
        <AlertContainer error={error} success={success} onErrorClose={() => setError('')} onSuccessClose={() => setSuccess('')} />

        <div className="flex items-center gap-4">
          <BackButton href="/dashboard/assurance/sinistres" />
          <h1 className="text-3xl font-bold flex-1">{selectedSinistre.numero_sinistre}</h1>
          <button onClick={() => handleDelete(selectedSinistre.id)} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"><Trash2 size={18} />Supprimer</button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border p-8">
            <h2 className="text-xl font-semibold mb-6">Informations</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Assuré</p>
                <p className="font-medium">{selectedSinistre.assure_nom}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">{new Date(selectedSinistre.date_sinistre).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Lieu</p>
                <p className="font-medium">{selectedSinistre.lieu_sinistre}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Montant estimé</p>
                <p className="font-medium text-lg text-red-600">{selectedSinistre.montant_estime.toLocaleString()} €</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-8">
            <h2 className="text-xl font-semibold mb-6">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{selectedSinistre.description}</p>

            <div className="mt-8 pt-8 border-t">
              <p className="text-sm text-gray-600 mb-2">Statut</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(selectedSinistre.statut)}`}>{selectedSinistre.statut}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
