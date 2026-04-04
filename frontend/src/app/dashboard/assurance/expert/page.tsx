'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Users, Search, Filter, Plus, Eye, Edit, Trash2,
  ArrowLeft, Save, X, AlertCircle, CheckCircle,
  Mail, Phone, MapPin, Briefcase, Star, Award
} from 'lucide-react';

interface Expert {
  id: number;
  code_expert: string;
  nom: string;
  prenom: string;
  specialite: string;
  email: string;
  telephone: string;
  adresse: string;
  actif: boolean;
  date_creation: string;
}

export default function ExpertsPage() {
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  const expertId = searchParams.get('id');

  const [experts, setExperts] = useState<Expert[]>([]);
  const [expert, setExpert] = useState<Expert | null>(null);
  const [mode, setMode] = useState<'list' | 'detail' | 'new' | 'edit'>('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    code_expert: '',
    nom: '',
    prenom: '',
    specialite: '',
    email: '',
    telephone: '',
    adresse: '',
    actif: true
  });

  useEffect(() => {
    if (action === 'new') setMode('new');
    else if (expertId) { setMode('detail'); loadExpert(parseInt(expertId)); }
    else loadExperts();
  }, [action, expertId]);

  const loadExperts = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setExperts([
        { id: 1, code_expert: 'EXP-001', nom: 'Dubois', prenom: 'Pierre', specialite: 'Expert automobile', email: 'pierre.dubois@expert.fr', telephone: '0123456789', adresse: 'Paris', actif: true, date_creation: '2026-01-10' },
        { id: 2, code_expert: 'EXP-002', nom: 'Martin', prenom: 'Sophie', specialite: 'Expert habitation', email: 'sophie.martin@expert.fr', telephone: '0234567890', adresse: 'Lyon', actif: true, date_creation: '2026-01-15' },
        { id: 3, code_expert: 'EXP-003', nom: 'Bernard', prenom: 'Jean', specialite: 'Expert santé', email: 'jean.bernard@expert.fr', telephone: '0345678901', adresse: 'Marseille', actif: true, date_creation: '2026-02-01' },
      ]);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const loadExpert = async (id: number) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockExpert: Expert = { id, code_expert: 'EXP-001', nom: 'Dubois', prenom: 'Pierre', specialite: 'Expert automobile', email: 'pierre.dubois@expert.fr', telephone: '0123456789', adresse: 'Paris', actif: true, date_creation: '2026-01-10' };
      setExpert(mockExpert);
      setFormData({
        code_expert: mockExpert.code_expert,
        nom: mockExpert.nom,
        prenom: mockExpert.prenom,
        specialite: mockExpert.specialite,
        email: mockExpert.email,
        telephone: mockExpert.telephone,
        adresse: mockExpert.adresse,
        actif: mockExpert.actif
      });
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!formData.nom || !formData.prenom) { setError('Nom et prénom requis'); return; }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess('Expert créé');
      setTimeout(() => { setMode('list'); loadExperts(); }, 1500);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess('Expert mis à jour');
      setTimeout(() => { setMode('detail'); if (expert) loadExpert(expert.id); }, 1500);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const filteredExperts = experts.filter(e =>
    e.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.specialite.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-50 p-4 rounded-lg"><AlertCircle className="w-5 h-5 inline mr-2" />{error}</div>}
      {success && <div className="bg-green-50 p-4 rounded-lg"><CheckCircle className="w-5 h-5 inline mr-2 text-green-600" />{success}</div>}

      {mode === 'list' && (
        <>
          <div className="flex justify-between"><div><h1 className="text-3xl font-bold">Experts</h1><p className="text-gray-600">Gestion des experts évaluateurs</p></div><Link href="/dashboard/assurance/experts?action=new" className="px-4 py-2 bg-blue-600 text-white rounded-lg"><Plus className="w-4 h-4 mr-2" />Nouvel expert</Link></div>

          <div className="bg-white rounded-xl border p-4"><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Rechercher un expert..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" /></div></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{filteredExperts.map(e => (<div key={e.id} className="bg-white rounded-xl border p-6 hover:shadow-lg"><div className="flex justify-between"><div className="flex items-center gap-3"><div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">{e.prenom[0]}{e.nom[0]}</div><div><h3 className="font-semibold">{e.prenom} {e.nom}</h3><p className="text-sm text-gray-600">{e.specialite}</p></div></div><Link href={`/dashboard/assurance/experts?id=${e.id}`}><Eye className="w-4 h-4 text-blue-600" /></Link></div><div className="mt-4 space-y-2 text-sm"><div className="flex items-center"><Mail className="w-4 h-4 mr-2 text-gray-400" />{e.email}</div><div className="flex items-center"><Phone className="w-4 h-4 mr-2 text-gray-400" />{e.telephone}</div><div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-gray-400" />{e.adresse}</div></div><div className="mt-4 pt-4 border-t"><span className={`px-2 py-1 rounded-full text-xs ${e.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{e.actif ? 'Actif' : 'Inactif'}</span></div></div>))}</div>
        </>
      )}

      {(mode === 'detail' || mode === 'edit') && expert && (
        <>
          <div className="flex justify-between"><div className="flex items-center gap-4"><button onClick={() => setMode('list')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft /></button><div><h1 className="text-3xl font-bold">{expert.prenom} {expert.nom}</h1><p className="text-gray-600">{expert.code_expert}</p></div></div><div className="flex gap-2">{mode === 'detail' ? (<><button onClick={() => setMode('edit')} className="px-4 py-2 border rounded-lg"><Edit className="w-4 h-4 inline mr-2" />Modifier</button></>) : (<><button onClick={() => setMode('detail')}>Annuler</button><button onClick={handleUpdate}>Enregistrer</button></>)}</div></div>

          <div className="bg-white rounded-xl border p-6">{mode === 'detail' ? (<div className="grid grid-cols-2 gap-4"><div><p className="text-sm text-gray-600">Spécialité</p><p className="font-medium">{expert.specialite}</p></div><div><p className="text-sm text-gray-600">Email</p><p>{expert.email}</p></div><div><p className="text-sm text-gray-600">Téléphone</p><p>{expert.telephone}</p></div><div><p className="text-sm text-gray-600">Adresse</p><p>{expert.adresse}</p></div></div>) : (<div><input type="text" placeholder="Nom" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="text" placeholder="Prénom" value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="text" placeholder="Spécialité" value={formData.specialite} onChange={e => setFormData({...formData, specialite: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="tel" placeholder="Téléphone" value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} className="w-full mb-3 p-2 border rounded" /><textarea placeholder="Adresse" value={formData.adresse} onChange={e => setFormData({...formData, adresse: e.target.value})} rows={3} className="w-full p-2 border rounded" /><label className="flex items-center mt-3"><input type="checkbox" checked={formData.actif} onChange={e => setFormData({...formData, actif: e.target.checked})} className="mr-2" />Actif</label></div>)}</div>
        </>
      )}

      {mode === 'new' && (
        <>
          <div className="flex items-center gap-4"><button onClick={() => setMode('list')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft /></button><h1 className="text-3xl font-bold">Nouvel expert</h1></div>
          <div className="bg-white rounded-xl border p-6"><div className="grid grid-cols-2 gap-4"><input type="text" placeholder="Nom *" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} className="p-2 border rounded" /><input type="text" placeholder="Prénom *" value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} className="p-2 border rounded" /><input type="text" placeholder="Spécialité" value={formData.specialite} onChange={e => setFormData({...formData, specialite: e.target.value})} className="p-2 border rounded" /><input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="p-2 border rounded" /><input type="tel" placeholder="Téléphone" value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} className="p-2 border rounded" /><textarea placeholder="Adresse" value={formData.adresse} onChange={e => setFormData({...formData, adresse: e.target.value})} rows={3} className="col-span-2 p-2 border rounded" /></div><div className="flex justify-end gap-3 mt-6 pt-6 border-t"><button onClick={() => setMode('list')} className="px-4 py-2 border rounded">Annuler</button><button onClick={handleCreate} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Créer</button></div></div>
        </>
      )}
    </div>
  );
}