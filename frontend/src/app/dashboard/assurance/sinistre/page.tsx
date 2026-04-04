'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle, Search, Filter, Plus, Eye, Edit, Trash2,
  ArrowLeft, Save, X, AlertCircle, CheckCircle,
  Calendar, DollarSign, MapPin, FileText, User,
  Car, Home, Heart, Briefcase, Clock, Check
} from 'lucide-react';

interface Sinistre {
  id: number;
  numero_sinistre: string;
  police_id: number;
  police_numero: string;
  assure_nom: string;
  date_sinistre: string;
  lieu_sinistre: string;
  description: string;
  montant_estime: number;
  montant_rembourse: number;
  statut: string;
  expert_id: number;
  expert_nom: string;
  date_decision: string;
}

interface Police {
  id: number;
  numero_police: string;
  assure_nom: string;
  type_assurance: string;
}

interface Expert {
  id: number;
  nom: string;
  prenom: string;
  specialite: string;
}

export default function SinistresPage() {
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  const sinistreId = searchParams.get('id');

  const [sinistres, setSinistres] = useState<Sinistre[]>([]);
  const [sinistre, setSinistre] = useState<Sinistre | null>(null);
  const [polices, setPolices] = useState<Police[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [mode, setMode] = useState<'list' | 'detail' | 'new' | 'edit'>('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    police_id: '',
    date_sinistre: new Date().toISOString().split('T')[0],
    lieu_sinistre: '',
    description: '',
    montant_estime: '',
    expert_id: '',
    notes: ''
  });

  useEffect(() => {
    loadPolices();
    loadExperts();
    if (action === 'new') setMode('new');
    else if (sinistreId) { setMode('detail'); loadSinistre(parseInt(sinistreId)); }
    else loadSinistres();
  }, [action, sinistreId]);

  const loadSinistres = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSinistres([
        { id: 1, numero_sinistre: 'SIN-2024-001', police_id: 1, police_numero: 'POL-2024-001', assure_nom: 'Jean Konan', date_sinistre: '2024-03-10', lieu_sinistre: 'Cocody', description: 'Accident de voiture', montant_estime: 2500, montant_rembourse: 0, statut: 'EN_INSTRUCTION', expert_id: 1, expert_nom: 'Pierre Dubois', date_decision: '' },
        { id: 2, numero_sinistre: 'SIN-2024-002', police_id: 2, police_numero: 'POL-2024-002', assure_nom: 'Aminata Diallo', date_sinistre: '2024-03-15', lieu_sinistre: 'Plateau', description: 'Dégât des eaux', montant_estime: 800, montant_rembourse: 0, statut: 'DECLARE', expert_id: 2, expert_nom: 'Sophie Martin', date_decision: '' },
      ]);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const loadSinistre = async (id: number) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockSinistre: Sinistre = { id, numero_sinistre: 'SIN-2024-001', police_id: 1, police_numero: 'POL-2024-001', assure_nom: 'Jean Konan', date_sinistre: '2024-03-10', lieu_sinistre: 'Cocody', description: 'Accident de voiture', montant_estime: 2500, montant_rembourse: 0, statut: 'EN_INSTRUCTION', expert_id: 1, expert_nom: 'Pierre Dubois', date_decision: '' };
      setSinistre(mockSinistre);
      setFormData({
        police_id: mockSinistre.police_id.toString(),
        date_sinistre: mockSinistre.date_sinistre,
        lieu_sinistre: mockSinistre.lieu_sinistre,
        description: mockSinistre.description,
        montant_estime: mockSinistre.montant_estime.toString(),
        expert_id: mockSinistre.expert_id.toString(),
        notes: ''
      });
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const loadPolices = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setPolices([
        { id: 1, numero_police: 'POL-2024-001', assure_nom: 'Jean Konan', type_assurance: 'AUTO' },
        { id: 2, numero_police: 'POL-2024-002', assure_nom: 'Aminata Diallo', type_assurance: 'HABITATION' },
      ]);
    } catch (err: any) { console.error(err); }
  };

  const loadExperts = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setExperts([
        { id: 1, nom: 'Dubois', prenom: 'Pierre', specialite: 'Expert automobile' },
        { id: 2, nom: 'Martin', prenom: 'Sophie', specialite: 'Expert habitation' },
      ]);
    } catch (err: any) { console.error(err); }
  };

  const handleCreate = async () => {
    if (!formData.police_id || !formData.date_sinistre) { setError('Champs requis'); return; }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess('Sinistre déclaré');
      setTimeout(() => { setMode('list'); loadSinistres(); }, 1500);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleUpdateStatut = async (newStatut: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setSuccess(`Statut mis à jour: ${newStatut}`);
      if (sinistre) setSinistre({ ...sinistre, statut: newStatut });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) { setError(err.message); }
  };

  const filteredSinistres = sinistres.filter(s =>
    s.numero_sinistre.includes(searchTerm) ||
    s.assure_nom.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(s => statusFilter === 'all' || s.statut === statusFilter);

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'DECLARE': return 'bg-yellow-100 text-yellow-700';
      case 'EN_INSTRUCTION': return 'bg-blue-100 text-blue-700';
      case 'ACCEPTE': return 'bg-green-100 text-green-700';
      case 'REFUSE': return 'bg-red-100 text-red-700';
      case 'INDEMNISE': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-50 p-4 rounded-lg"><AlertCircle className="w-5 h-5 inline mr-2" />{error}</div>}
      {success && <div className="bg-green-50 p-4 rounded-lg"><CheckCircle className="w-5 h-5 inline mr-2 text-green-600" />{success}</div>}

      {mode === 'list' && (
        <>
          <div className="flex justify-between"><div><h1 className="text-3xl font-bold">Sinistres</h1><p className="text-gray-600">Gestion des déclarations</p></div><Link href="/dashboard/assurance/sinistres?action=new" className="px-4 py-2 bg-red-600 text-white rounded-lg"><Plus className="w-4 h-4 mr-2" />Déclarer sinistre</Link></div>

          <div className="bg-white rounded-xl border p-4"><div className="flex gap-4"><div className="flex-1 relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" /></div><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2 border rounded-lg"><option value="all">Tous statuts</option><option value="DECLARE">Déclaré</option><option value="EN_INSTRUCTION">En instruction</option><option value="ACCEPTE">Accepté</option><option value="REFUSE">Refusé</option></select></div></div>

          <div className="bg-white rounded-xl border overflow-hidden"><table className="w-full"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left">N°</th><th>Assuré</th><th>Date</th><th>Montant</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{filteredSinistres.map(s => (<tr key={s.id} className="hover:bg-gray-50"><td className="px-6 py-4 font-mono">{s.numero_sinistre}</td><td>{s.assure_nom}</td><td>{new Date(s.date_sinistre).toLocaleDateString()}</td><td>{s.montant_estime} €</td><td><span className={`px-2 py-1 rounded-full text-xs ${getStatutColor(s.statut)}`}>{s.statut}</span></td><td><Link href={`/dashboard/assurance/sinistres?id=${s.id}`}><Eye className="w-4 h-4 text-blue-600" /></Link></td></tr>))}</tbody></table></div>
        </>
      )}

      {(mode === 'detail' || mode === 'edit') && sinistre && (
        <>
          <div className="flex justify-between"><div className="flex items-center gap-4"><button onClick={() => setMode('list')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft /></button><div><h1 className="text-3xl font-bold">{sinistre.numero_sinistre}</h1><p className="text-gray-600">Assuré: {sinistre.assure_nom}</p></div></div><div className="flex gap-2">{mode === 'detail' ? (<select value={sinistre.statut} onChange={e => handleUpdateStatut(e.target.value)} className="px-4 py-2 border rounded-lg"><option>DECLARE</option><option>EN_INSTRUCTION</option><option>ACCEPTE</option><option>REFUSE</option></select>) : (<><button onClick={() => setMode('detail')}>Annuler</button><button onClick={handleCreate}>Enregistrer</button></>)}</div></div>

          <div className="grid grid-cols-3 gap-6"><div className="col-span-2 bg-white rounded-xl border p-6">{mode === 'detail' ? (<div className="grid grid-cols-2 gap-4"><div><p className="text-sm text-gray-600">Police</p><p>{sinistre.police_numero}</p></div><div><p className="text-sm text-gray-600">Date sinistre</p><p>{new Date(sinistre.date_sinistre).toLocaleDateString()}</p></div><div><p className="text-sm text-gray-600">Lieu</p><p>{sinistre.lieu_sinistre}</p></div><div><p className="text-sm text-gray-600">Expert</p><p>{sinistre.expert_nom}</p></div><div className="col-span-2"><p className="text-sm text-gray-600">Description</p><p>{sinistre.description}</p></div></div>) : (<div><select value={formData.police_id} onChange={e => setFormData({...formData, police_id: e.target.value})} className="w-full mb-3 p-2 border rounded"><option>Police *</option>{polices.map(p => <option key={p.id} value={p.id}>{p.numero_police} - {p.assure_nom}</option>)}</select><input type="date" value={formData.date_sinistre} onChange={e => setFormData({...formData, date_sinistre: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="text" placeholder="Lieu" value={formData.lieu_sinistre} onChange={e => setFormData({...formData, lieu_sinistre: e.target.value})} className="w-full mb-3 p-2 border rounded" /><textarea placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full mb-3 p-2 border rounded" /><input type="number" placeholder="Montant estimé" value={formData.montant_estime} onChange={e => setFormData({...formData, montant_estime: e.target.value})} className="w-full mb-3 p-2 border rounded" /><select value={formData.expert_id} onChange={e => setFormData({...formData, expert_id: e.target.value})} className="w-full p-2 border rounded"><option>Expert</option>{experts.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom} - {e.specialite}</option>)}</select></div>)}</div>

            <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-xl p-6 text-white"><h3 className="text-lg font-semibold mb-4">Récapitulatif</h3><div><p className="text-red-100">Montant estimé</p><p className="text-2xl font-bold">{sinistre.montant_estime} €</p></div><div className="mt-4"><p className="text-red-100">Montant remboursé</p><p className="text-2xl font-bold">{sinistre.montant_rembourse} €</p></div></div></div>
        </>
      )}

      {mode === 'new' && (
        <>
          <div className="flex items-center gap-4"><button onClick={() => setMode('list')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft /></button><h1 className="text-3xl font-bold">Déclarer un sinistre</h1></div>
          <div className="bg-white rounded-xl border p-6"><div className="grid grid-cols-2 gap-4"><select value={formData.police_id} onChange={e => setFormData({...formData, police_id: e.target.value})} className="p-2 border rounded"><option>Police *</option>{polices.map(p => <option key={p.id} value={p.id}>{p.numero_police} - {p.assure_nom}</option>)}</select><input type="date" value={formData.date_sinistre} onChange={e => setFormData({...formData, date_sinistre: e.target.value})} className="p-2 border rounded" /><input type="text" placeholder="Lieu" value={formData.lieu_sinistre} onChange={e => setFormData({...formData, lieu_sinistre: e.target.value})} className="p-2 border rounded" /><textarea placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="col-span-2 p-2 border rounded" /><input type="number" placeholder="Montant estimé" value={formData.montant_estime} onChange={e => setFormData({...formData, montant_estime: e.target.value})} className="p-2 border rounded" /><select value={formData.expert_id} onChange={e => setFormData({...formData, expert_id: e.target.value})} className="p-2 border rounded"><option>Expert</option>{experts.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom} - {e.specialite}</option>)}</select><textarea placeholder="Notes" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={2} className="col-span-2 p-2 border rounded" /></div><div className="flex justify-end gap-3 mt-6 pt-6 border-t"><button onClick={() => setMode('list')} className="px-4 py-2 border rounded">Annuler</button><button onClick={handleCreate} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-lg">Déclarer</button></div></div>
        </>
      )}
    </div>
  );
}