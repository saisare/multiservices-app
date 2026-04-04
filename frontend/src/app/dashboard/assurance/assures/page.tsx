'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Users, Search, Filter, Plus, Eye, Edit, Trash2,
  ArrowLeft, Save, X, AlertCircle, CheckCircle,
  Mail, Phone, MapPin, Calendar, FileText, Shield,
  Building2, User, Briefcase, Home
} from 'lucide-react';

interface Assure {
  id: number;
  code_assure: string;
  type_assure: 'PARTICULIER' | 'ENTREPRISE';
  nom: string;
  prenom: string;
  entreprise: string;
  date_naissance: string;
  email: string;
  telephone: string;
  adresse: string;
  date_creation: string;
}

interface Police {
  id: number;
  numero_police: string;
  type_assurance: string;
  date_effet: string;
  date_echeance: string;
  prime_annuelle: number;
  statut: string;
}

export default function AssuresPage() {
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  const assureId = searchParams.get('id');

  const [assures, setAssures] = useState<Assure[]>([]);
  const [assure, setAssure] = useState<Assure | null>(null);
  const [polices, setPolices] = useState<Police[]>([]);
  const [mode, setMode] = useState<'list' | 'detail' | 'new' | 'edit'>('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const [formData, setFormData] = useState({
    code_assure: '',
    type_assure: 'PARTICULIER',
    nom: '',
    prenom: '',
    entreprise: '',
    date_naissance: '',
    email: '',
    telephone: '',
    adresse: ''
  });

  useEffect(() => {
    if (action === 'new') setMode('new');
    else if (assureId) { setMode('detail'); loadAssure(parseInt(assureId)); }
    else loadAssures();
  }, [action, assureId]);

  const loadAssures = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setAssures([
        { id: 1, code_assure: 'ASS-001', type_assure: 'PARTICULIER', nom: 'Konan', prenom: 'Jean', entreprise: '', date_naissance: '1985-05-15', email: 'jean.konan@email.com', telephone: '0123456789', adresse: 'Cocody, Abidjan', date_creation: '2026-01-10' },
        { id: 2, code_assure: 'ASS-002', type_assure: 'PARTICULIER', nom: 'Diallo', prenom: 'Aminata', entreprise: '', date_naissance: '1990-08-22', email: 'aminata.diallo@email.com', telephone: '0234567890', adresse: 'Plateau, Abidjan', date_creation: '2026-01-15' },
        { id: 3, code_assure: 'ASS-003', type_assure: 'ENTREPRISE', nom: 'Tech Solutions', prenom: '', entreprise: 'Tech Solutions SARL', date_naissance: '', email: 'contact@techsolutions.ci', telephone: '0345678901', adresse: 'Marcory, Abidjan', date_creation: '2026-02-01' },
      ]);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const loadAssure = async (id: number) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockAssure: Assure = { id, code_assure: 'ASS-001', type_assure: 'PARTICULIER', nom: 'Konan', prenom: 'Jean', entreprise: '', date_naissance: '1985-05-15', email: 'jean.konan@email.com', telephone: '0123456789', adresse: 'Cocody, Abidjan', date_creation: '2026-01-10' };
      setAssure(mockAssure);
      setFormData({
        code_assure: mockAssure.code_assure,
        type_assure: mockAssure.type_assure,
        nom: mockAssure.nom,
        prenom: mockAssure.prenom,
        entreprise: mockAssure.entreprise,
        date_naissance: mockAssure.date_naissance,
        email: mockAssure.email,
        telephone: mockAssure.telephone,
        adresse: mockAssure.adresse
      });
      setPolices([
        { id: 1, numero_police: 'POL-2024-001', type_assurance: 'AUTO', date_effet: '2024-01-01', date_echeance: '2024-12-31', prime_annuelle: 500, statut: 'ACTIVE' },
        { id: 2, numero_police: 'POL-2024-002', type_assurance: 'HABITATION', date_effet: '2024-02-01', date_echeance: '2025-01-31', prime_annuelle: 300, statut: 'ACTIVE' },
      ]);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!formData.nom || (formData.type_assure === 'PARTICULIER' && !formData.prenom)) {
      setError('Nom requis');
      return;
    }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess('Assuré créé avec succès');
      setTimeout(() => { setMode('list'); loadAssures(); }, 1500);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess('Assuré mis à jour');
      setTimeout(() => { setMode('detail'); if (assure) loadAssure(assure.id); }, 1500);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cet assuré ?')) return;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess('Assuré supprimé');
      setTimeout(() => { setMode('list'); loadAssures(); }, 1500);
    } catch (err: any) { setError(err.message); }
  };

  const filteredAssures = assures.filter(a =>
    a.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.prenom && a.prenom.toLowerCase().includes(searchTerm.toLowerCase())) ||
    a.code_assure.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(a => typeFilter === 'all' || a.type_assure === typeFilter);

  if (loading && mode !== 'list') return <div className="flex justify-center h-64"><div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-50 p-4 rounded-lg"><AlertCircle className="w-5 h-5 inline mr-2" />{error}</div>}
      {success && <div className="bg-green-50 p-4 rounded-lg"><CheckCircle className="w-5 h-5 inline mr-2 text-green-600" />{success}</div>}

      {mode === 'list' && (
        <>
          <div className="flex justify-between"><div><h1 className="text-3xl font-bold">Assurés</h1><p className="text-gray-600">Gestion des clients d'assurance</p></div><Link href="/dashboard/assurance/assures?action=new" className="px-4 py-2 bg-blue-600 text-white rounded-lg"><Plus className="w-4 h-4 mr-2" />Nouvel assuré</Link></div>

          <div className="bg-white rounded-xl border p-4"><div className="flex gap-4"><div className="flex-1 relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" /></div><select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-4 py-2 border rounded-lg"><option value="all">Tous</option><option value="PARTICULIER">Particuliers</option><option value="ENTREPRISE">Entreprises</option></select></div></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{filteredAssures.map(a => (<div key={a.id} className="bg-white rounded-xl border p-6 hover:shadow-lg"><div className="flex justify-between"><div className="flex items-center gap-3"><div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">{a.type_assure === 'PARTICULIER' ? a.prenom[0] : a.nom[0]}</div><div><h3 className="font-semibold">{a.type_assure === 'PARTICULIER' ? `${a.prenom} ${a.nom}` : a.nom}</h3><p className="text-sm text-gray-600">{a.code_assure}</p></div></div><Link href={`/dashboard/assurance/assures?id=${a.id}`}><Eye className="w-4 h-4 text-blue-600" /></Link></div><div className="mt-4 space-y-2 text-sm"><div className="flex items-center"><Mail className="w-4 h-4 mr-2 text-gray-400" />{a.email}</div><div className="flex items-center"><Phone className="w-4 h-4 mr-2 text-gray-400" />{a.telephone}</div><div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-gray-400" />{a.adresse}</div></div></div>))}</div>
        </>
      )}

      {(mode === 'detail' || mode === 'edit') && assure && (
        <>
          <div className="flex justify-between"><div className="flex items-center gap-4"><button onClick={() => setMode('list')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft /></button><div><h1 className="text-3xl font-bold">{assure.type_assure === 'PARTICULIER' ? `${assure.prenom} ${assure.nom}` : assure.nom}</h1><p className="text-gray-600">{assure.code_assure}</p></div></div><div className="flex gap-2">{mode === 'detail' ? (<><button onClick={() => setMode('edit')} className="px-4 py-2 border rounded-lg"><Edit className="w-4 h-4 inline mr-2" />Modifier</button><button onClick={() => handleDelete(assure.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg"><Trash2 className="w-4 h-4 inline mr-2" />Supprimer</button></>) : (<><button onClick={() => setMode('detail')}>Annuler</button><button onClick={handleUpdate}>Enregistrer</button></>)}</div></div>

          <div className="grid grid-cols-3 gap-6"><div className="col-span-2 bg-white rounded-xl border p-6">{mode === 'detail' ? (<div className="grid grid-cols-2 gap-4"><div><p className="text-sm text-gray-600">Type</p><p className="font-medium">{assure.type_assure === 'PARTICULIER' ? 'Particulier' : 'Entreprise'}</p></div><div><p className="text-sm text-gray-600">Email</p><p>{assure.email}</p></div><div><p className="text-sm text-gray-600">Téléphone</p><p>{assure.telephone}</p></div><div><p className="text-sm text-gray-600">Adresse</p><p>{assure.adresse}</p></div>{assure.date_naissance && <div><p className="text-sm text-gray-600">Date naissance</p><p>{new Date(assure.date_naissance).toLocaleDateString()}</p></div>}</div>) : (<div><select value={formData.type_assure} onChange={e => setFormData({...formData, type_assure: e.target.value as any})} className="w-full mb-3 p-2 border rounded"><option value="PARTICULIER">Particulier</option><option value="ENTREPRISE">Entreprise</option></select><input type="text" placeholder="Nom" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="text" placeholder="Prénom" value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="tel" placeholder="Téléphone" value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="date" value={formData.date_naissance} onChange={e => setFormData({...formData, date_naissance: e.target.value})} className="w-full mb-3 p-2 border rounded" /><textarea placeholder="Adresse" value={formData.adresse} onChange={e => setFormData({...formData, adresse: e.target.value})} rows={3} className="w-full p-2 border rounded" /></div>)}</div>

            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white"><h3 className="text-lg font-semibold mb-4">Statistiques</h3><div><p className="text-blue-100">Polices actives</p><p className="text-2xl font-bold">{polices.filter(p => p.statut === 'ACTIVE').length}</p></div><div className="mt-4"><p className="text-blue-100">Primes annuelles</p><p className="text-2xl font-bold">{polices.reduce((sum, p) => sum + p.prime_annuelle, 0).toLocaleString()} €</p></div></div></div>

          <div className="bg-white rounded-xl border p-6"><h2 className="text-lg font-semibold mb-4">Polices d'assurance</h2><table className="w-full"><thead><tr><th className="text-left">Police</th><th>Type</th><th>Prime</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{polices.map(p => (<tr key={p.id}><td>{p.numero_police}</td><td>{p.type_assurance}</td><td>{p.prime_annuelle} €</td><td><span className={`px-2 py-1 rounded-full text-xs ${p.statut === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{p.statut}</span></td><td><Link href={`/dashboard/assurance/polices?id=${p.id}`}><Eye className="w-4 h-4 text-blue-600" /></Link></td></tr>))}</tbody></table></div>
        </>
      )}

      {mode === 'new' && (
        <>
          <div className="flex items-center gap-4"><button onClick={() => setMode('list')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft /></button><h1 className="text-3xl font-bold">Nouvel assuré</h1></div>
          <div className="bg-white rounded-xl border p-6"><div className="grid grid-cols-2 gap-4"><select value={formData.type_assure} onChange={e => setFormData({...formData, type_assure: e.target.value as any})} className="p-2 border rounded"><option value="PARTICULIER">Particulier</option><option value="ENTREPRISE">Entreprise</option></select><input type="text" placeholder="Nom *" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} className="p-2 border rounded" /><input type="text" placeholder="Prénom" value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} className="p-2 border rounded" /><input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="p-2 border rounded" /><input type="tel" placeholder="Téléphone" value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} className="p-2 border rounded" /><input type="date" value={formData.date_naissance} onChange={e => setFormData({...formData, date_naissance: e.target.value})} className="p-2 border rounded" /><textarea placeholder="Adresse" value={formData.adresse} onChange={e => setFormData({...formData, adresse: e.target.value})} rows={3} className="col-span-2 p-2 border rounded" /></div><div className="flex justify-end gap-3 mt-6 pt-6 border-t"><button onClick={() => setMode('list')} className="px-4 py-2 border rounded">Annuler</button><button onClick={handleCreate} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Créer</button></div></div>
        </>
      )}
    </div>
  );
}