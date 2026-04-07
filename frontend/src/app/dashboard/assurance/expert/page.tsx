'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Search, Plus, Eye, Trash2, Mail, Phone, Briefcase } from 'lucide-react';
import { BackButton } from '@/components/BackButton';
import { AlertContainer } from '@/components/Alert';
import { usePageState } from '@/hooks/usePageState';

interface Expert {
  id: number;
  code_expert: string;
  nom: string;
  prenom: string;
  specialite: string;
  email: string;
  telephone: string;
  agrement: string;
  date_agrement: string;
}

export default function ExpertsPage() {
  const router = useRouter();
  const { action, itemId, isList, isDetail, isNew } = usePageState();

  const [experts, setExperts] = useState<Expert[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    specialite: 'AUTO',
    email: '',
    telephone: '',
    agrement: '',
    date_agrement: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadExperts();
  }, []);

  useEffect(() => {
    if (isDetail && itemId) {
      loadExpertById(parseInt(itemId));
    }
  }, [itemId, isDetail]);

  const loadExperts = async () => {
    try {
      setLoading(true);
      setExperts([
        { id: 1, code_expert: 'EXP-001', nom: 'Kouamé', prenom: 'Marc', specialite: 'AUTO', email: 'marc.kouame@experts.ci', telephone: '0512345678', agrement: 'AGR-2024-001', date_agrement: '2024-01-15' },
        { id: 2, code_expert: 'EXP-002', nom: 'Yao', prenom: 'Marie', specialite: 'HABITATION', email: 'marie.yao@experts.ci', telephone: '0612345679', agrement: 'AGR-2024-002', date_agrement: '2024-02-20' },
      ]);
    } catch (err: any) {
      setError(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadExpertById = async (id: number) => {
    try {
      setLoading(true);
      const expert = experts.find(e => e.id === id);
      if (!expert) {
        setError('Expert non trouvé');
        return;
      }
      setSelectedExpert(expert);
      setFormData({
        nom: expert.nom,
        prenom: expert.prenom,
        specialite: expert.specialite,
        email: expert.email,
        telephone: expert.telephone,
        agrement: expert.agrement,
        date_agrement: expert.date_agrement
      });
    } catch (err: any) {
      setError(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.nom || !formData.prenom) {
      setError('Nom et prénom obligatoires');
      return;
    }
    try {
      setLoading(true);
      await new Promise(r => setTimeout(r, 500));
      setSuccess('Expert créé');
      setTimeout(() => router.push('/dashboard/assurance/expert'), 1500);
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
      setSuccess('Expert supprimé');
      setTimeout(() => router.push('/dashboard/assurance/expert'), 1500);
    } catch (err: any) {
      setError(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredExperts = experts.filter(e =>
    e.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.code_expert.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !isList) {
    return <div className="flex justify-center h-64"><div className="animate-spin border-4 border-blue-500 border-t-transparent rounded-full w-12 h-12" /></div>;
  }

  if (isList) {
    return (
      <div className="space-y-6">
        <AlertContainer error={error} success={success} onErrorClose={() => setError('')} onSuccessClose={() => setSuccess('')} />

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Experts Sinistre</h1>
            <p className="text-gray-600">Gestion des experts assermentés</p>
          </div>
          <button onClick={() => router.push('/dashboard/assurance/expert?action=new')} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
            <Plus size={20} />
            Nouvel expert
          </button>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredExperts.map(e => (
            <div key={e.id} className="bg-white rounded-lg border p-6 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                    {e.prenom[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold">{e.prenom} {e.nom}</h3>
                    <p className="text-xs text-gray-500">{e.code_expert}</p>
                  </div>
                </div>
                <button onClick={() => router.push(`/dashboard/assurance/expert?action=detail&id=${e.id}`)} className="p-1 hover:bg-gray-100 rounded"><Eye size={18} className="text-blue-600" /></button>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2"><Briefcase size={14} />{e.specialite}</div>
                <div className="flex items-center gap-2"><Mail size={14} />{e.email}</div>
                <div className="flex items-center gap-2"><Phone size={14} />{e.telephone}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isNew) {
    return (
      <div className="space-y-6">
        <AlertContainer error={error} success={success} onErrorClose={() => setError('')} onSuccessClose={() => setSuccess('')} />

        <div className="flex items-center gap-4">
          <BackButton href="/dashboard/assurance/expert" />
          <h1 className="text-3xl font-bold">Nouvel expert</h1>
        </div>

        <div className="bg-white rounded-lg border p-8 max-w-2xl">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Prénom *</label>
                <input type="text" value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} className="w-full p-2 border rounded-lg" placeholder="Prénom" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nom *</label>
                <input type="text" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} className="w-full p-2 border rounded-lg" placeholder="Nom" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Spécialité</label>
              <select value={formData.specialite} onChange={e => setFormData({...formData, specialite: e.target.value})} className="w-full p-2 border rounded-lg">
                <option value="AUTO">Automobile</option>
                <option value="HABITATION">Habitation</option>
                <option value="SANTE">Santé</option>
                <option value="GENERAL">Généraliste</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border rounded-lg" placeholder="email@example.com" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Téléphone</label>
              <input type="tel" value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} className="w-full p-2 border rounded-lg" placeholder="0123456789" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Agrément</label>
                <input type="text" value={formData.agrement} onChange={e => setFormData({...formData, agrement: e.target.value})} className="w-full p-2 border rounded-lg" placeholder="Numéro agrément" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date agrément</label>
                <input type="date" value={formData.date_agrement} onChange={e => setFormData({...formData, date_agrement: e.target.value})} className="w-full p-2 border rounded-lg" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <button onClick={() => router.push('/dashboard/assurance/expert')} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Annuler</button>
              <button onClick={handleCreate} disabled={loading} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">{loading ? 'Création...' : 'Créer'}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isDetail && selectedExpert) {
    return (
      <div className="space-y-6">
        <AlertContainer error={error} success={success} onErrorClose={() => setError('')} onSuccessClose={() => setSuccess('')} />

        <div className="flex items-center gap-4">
          <BackButton href="/dashboard/assurance/expert" />
          <h1 className="text-3xl font-bold flex-1">{selectedExpert.prenom} {selectedExpert.nom}</h1>
          <button onClick={() => handleDelete(selectedExpert.id)} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"><Trash2 size={18} />Supprimer</button>
        </div>

        <div className="bg-white rounded-lg border p-8 max-w-2xl">
          <h2 className="text-xl font-semibold mb-6">Informations</h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Code</p>
                <p className="font-medium">{selectedExpert.code_expert}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Spécialité</p>
                <p className="font-medium">{selectedExpert.specialite}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{selectedExpert.email}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Téléphone</p>
                <p className="font-medium">{selectedExpert.telephone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Agrément</p>
                <p className="font-medium">{selectedExpert.agrement}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date d'agrément</p>
                <p className="font-medium">{new Date(selectedExpert.date_agrement).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
