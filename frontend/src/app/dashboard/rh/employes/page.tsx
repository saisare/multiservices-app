'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Users, Search, Plus, Eye, Edit, Trash2,
  ArrowLeft, Save, X, AlertCircle, CheckCircle,
  Mail, Phone, MapPin, Calendar, Briefcase,
  User, Calendar as CalendarIcon, Clock, Filter,
  UserPlus, UserMinus, Award, DollarSign
} from 'lucide-react';
import { rhApi } from '@/services/api/rh.api';

interface Employe {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  poste: string;
  departement: string;
  date_embauche: string;
  salaire_base: number;
  genre: string;
  adresse: string;
  actif: boolean;
}

interface Conge {
  id: number;
  employe_nom?: string;
  employe_prenom?: string;
  type_conge: string;
  date_debut: string;
  date_fin: string;
  nb_jours: number;
  motif: string;
  statut: string;
  date_demande: string;
}

export default function EmployesPage() {
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  const tab = searchParams.get('tab') || 'employes';
  const employeId = searchParams.get('id');

  const [employes, setEmployes] = useState<Employe[]>([]);
  const [employe, setEmploye] = useState<Employe | null>(null);
  const [conges, setConges] = useState<Conge[]>([]);
  const [mode, setMode] = useState<'list' | 'detail' | 'new' | 'edit'>('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [departementFilter, setDepartementFilter] = useState('all');
  const [showCongeForm, setShowCongeForm] = useState(false);

  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    poste: '',
    departement: '',
    date_embauche: '',
    salaire_base: '',
    genre: 'M',
    adresse: '',
    actif: true
  });

  const [congeForm, setCongeForm] = useState({
    type_conge: 'ANNUEL',
    date_debut: '',
    date_fin: '',
    motif: ''
  });

  useEffect(() => {
    if (action === 'new') setMode('new');
    else if (employeId) { setMode('detail'); loadEmploye(parseInt(employeId)); }
    else loadEmployes();
  }, [action, employeId]);

  const loadEmployes = async () => {
    setLoading(true);
    try {
      const [employesData, congesData] = await Promise.all([
        rhApi.getEmployes(),
        rhApi.getConges(),
      ]);
      setEmployes(employesData as unknown as Employe[]);
      setConges(congesData as unknown as Conge[]);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const loadEmploye = async (id: number) => {
    setLoading(true);
    try {
      const [currentEmploye, employeConges] = await Promise.all([
        rhApi.getEmploye(id),
        rhApi.getCongesEmploye(id),
      ]);

      if (!currentEmploye) {
        throw new Error('Employé introuvable');
      }

      setEmploye(currentEmploye as unknown as Employe);
      setFormData({
        matricule: currentEmploye.matricule || '',
        nom: currentEmploye.nom || '',
        prenom: currentEmploye.prenom || '',
        email: currentEmploye.email || '',
        telephone: currentEmploye.telephone || '',
        poste: currentEmploye.poste || '',
        departement: currentEmploye.departement || '',
        date_embauche: currentEmploye.date_embauche ? currentEmploye.date_embauche.slice(0, 10) : '',
        salaire_base: String(currentEmploye.salaire_base || ''),
        genre: currentEmploye.genre || 'M',
        adresse: currentEmploye.adresse || '',
        actif: Boolean(currentEmploye.actif)
      });
      setConges(employeConges as Conge[]);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!formData.nom || !formData.prenom || !formData.poste || !formData.date_embauche) { setError('Nom, prénom, poste et date d\'embauche requis'); return; }
    setLoading(true);
    try {
      if (mode === 'edit' && employe) {
        await rhApi.updateEmploye(employe.id, {
          nom: formData.nom,
          prenom: formData.prenom,
          poste: formData.poste,
          date_embauche: formData.date_embauche,
          salaire_base: Number(formData.salaire_base || 0)
        });
        setSuccess('Employé mis à jour');
        setTimeout(() => { setMode('detail'); loadEmploye(employe.id); }, 1000);
        return;
      }

      await rhApi.createEmploye({
        nom: formData.nom,
        prenom: formData.prenom,
        genre: formData.genre,
        email: formData.email,
        telephone: formData.telephone,
        poste: formData.poste,
        departement: formData.departement,
        date_embauche: formData.date_embauche,
        salaire_base: Number(formData.salaire_base || 0)
      } as any);
      setSuccess('Employé créé');
      setTimeout(() => { setMode('list'); loadEmployes(); }, 1500);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleCreateConge = async () => {
    if (!employe || !congeForm.date_debut || !congeForm.date_fin) { setError('Dates requises'); return; }
    setLoading(true);
    try {
      await rhApi.createConge({
        employe_id: employe.id,
        type_conge: congeForm.type_conge,
        date_debut: congeForm.date_debut,
        date_fin: congeForm.date_fin,
        motif: congeForm.motif
      });
      setSuccess('Demande de congé envoyée');
      setShowCongeForm(false);
      setTimeout(() => { if (employe) loadEmploye(employe.id); }, 1500);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const updateCongeStatut = async (congeId: number, statut: string) => {
    try {
      await rhApi.updateCongeStatut(congeId, statut);
      setConges(conges.map(c => c.id === congeId ? { ...c, statut } : c));
      setSuccess(`Congé ${statut === 'VALIDE' ? 'validé' : 'refusé'}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) { setError(err.message); }
  };

  const filteredEmployes = employes.filter(e =>
    e.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(e => departementFilter === 'all' || e.departement === departementFilter);

  const departements = [...new Set(employes.map(e => e.departement))];

  if (loading && mode !== 'list') return <div className="flex justify-center h-64"><div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-50 p-4 rounded-lg"><AlertCircle className="w-5 h-5 inline mr-2" />{error}</div>}
      {success && <div className="bg-green-50 p-4 rounded-lg"><CheckCircle className="w-5 h-5 inline mr-2 text-green-600" />{success}</div>}

      {mode === 'list' && (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employés</h1>
              <p className="text-gray-600 mt-2">Gestion du personnel et des congés</p>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard/rh/employes?action=new" className="px-4 py-2 bg-blue-600 text-white rounded-lg"><Plus className="w-4 h-4 mr-2" />Embaucher</Link>
            </div>
          </div>

          {/* Onglets */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-8">
              <Link href="/dashboard/rh/employes?tab=employes" className={`py-2 px-1 border-b-2 ${tab === 'employes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}><Users className="w-4 h-4 inline mr-2" />Employés ({employes.length})</Link>
              <Link href="/dashboard/rh/employes?tab=conges" className={`py-2 px-1 border-b-2 ${tab === 'conges' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}><CalendarIcon className="w-4 h-4 inline mr-2" />Congés</Link>
            </div>
          </div>

          {/* Barre de recherche (employés) */}
          {tab === 'employes' && (
            <>
              <div className="bg-white rounded-xl border p-4"><div className="flex gap-4"><div className="flex-1 relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Rechercher un employé..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" /></div><select value={departementFilter} onChange={e => setDepartementFilter(e.target.value)} className="px-4 py-2 border rounded-lg"><option value="all">Tous départements</option>{departements.map(d => <option key={d}>{d}</option>)}</select></div></div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{filteredEmployes.map(e => (<div key={e.id} className="bg-white rounded-xl border p-6 hover:shadow-lg"><div className="flex justify-between"><div className="flex items-center gap-3"><div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">{e.prenom[0]}{e.nom[0]}</div><div><h3 className="font-semibold">{e.prenom} {e.nom}</h3><p className="text-sm text-gray-600">{e.poste}</p></div></div><Link href={`/dashboard/rh/employes?id=${e.id}`}><Eye className="w-4 h-4 text-blue-600" /></Link></div><div className="mt-4 space-y-2 text-sm"><div className="flex items-center"><Mail className="w-4 h-4 mr-2 text-gray-400" />{e.email}</div><div className="flex items-center"><Briefcase className="w-4 h-4 mr-2 text-gray-400" />{e.departement}</div><div className="flex items-center"><CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />Embauché: {new Date(e.date_embauche).toLocaleDateString()}</div></div></div>))}</div>
            </>
          )}

          {/* Liste des congés */}
          {tab === 'conges' && (
            <div className="bg-white rounded-xl border overflow-hidden"><table className="w-full"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left">Employé</th><th>Type</th><th>Dates</th><th>Jours</th><th>Motif</th><th>Statut</th></tr></thead><tbody>{conges.map(c => (<tr key={c.id} className="hover:bg-gray-50"><td className="px-6 py-4">{[c.employe_prenom, c.employe_nom].filter(Boolean).join(' ') || (employe ? `${employe.prenom} ${employe.nom}` : '—')}</td><td>{c.type_conge}</td><td>{new Date(c.date_debut).toLocaleDateString('fr-FR')} → {new Date(c.date_fin).toLocaleDateString('fr-FR')}</td><td>{c.nb_jours}</td><td>{c.motif}</td><td><span className={`px-2 py-1 rounded-full text-xs ${c.statut === 'VALIDE' ? 'bg-green-100 text-green-700' : c.statut === 'EN_ATTENTE' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{c.statut}</span></td></tr>))}</tbody></table></div>
          )}
        </>
      )}

      {(mode === 'detail' || mode === 'edit') && employe && (
        <>
          <div className="flex justify-between"><div className="flex items-center gap-4"><button onClick={() => setMode('list')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft /></button><div><h1 className="text-3xl font-bold">{employe.prenom} {employe.nom}</h1><p className="text-gray-600">{employe.matricule}</p></div></div><div className="flex gap-2">{mode === 'detail' ? (<><button onClick={() => setMode('edit')} className="px-4 py-2 border rounded-lg"><Edit className="w-4 h-4 inline mr-2" />Modifier</button><button onClick={() => setShowCongeForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Demander congé</button></>) : (<><button onClick={() => setMode('detail')}>Annuler</button><button onClick={handleCreate}>Enregistrer</button></>)}</div></div>

          <div className="grid grid-cols-3 gap-6"><div className="col-span-2 bg-white rounded-xl border p-6">{mode === 'detail' ? (<div className="grid grid-cols-2 gap-4"><div><p className="text-sm text-gray-600">Contact</p><p>{employe.email}</p><p>{employe.telephone}</p><p>{employe.adresse}</p></div><div><p className="text-sm text-gray-600">Poste</p><p>{employe.poste}</p><p>{employe.departement}</p></div><div><p className="text-sm text-gray-600">Embauche</p><p>{new Date(employe.date_embauche).toLocaleDateString()}</p></div><div><p className="text-sm text-gray-600">Salaire</p><p>{employe.salaire_base.toLocaleString()} FCFA</p></div></div>) : (<div><input type="text" placeholder="Nom" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="text" placeholder="Prénom" value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="tel" placeholder="Téléphone" value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="text" placeholder="Poste" value={formData.poste} onChange={e => setFormData({...formData, poste: e.target.value})} className="w-full mb-3 p-2 border rounded" /><select value={formData.departement} onChange={e => setFormData({...formData, departement: e.target.value})} className="w-full mb-3 p-2 border rounded"><option>IT</option><option>Finance</option><option>RH</option><option>Marketing</option></select><input type="date" value={formData.date_embauche} onChange={e => setFormData({...formData, date_embauche: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="number" placeholder="Salaire base" value={formData.salaire_base} onChange={e => setFormData({...formData, salaire_base: e.target.value})} className="w-full mb-3 p-2 border rounded" /><textarea placeholder="Adresse" value={formData.adresse} onChange={e => setFormData({...formData, adresse: e.target.value})} rows={3} className="w-full p-2 border rounded" /></div>)}</div>

            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white"><h3 className="text-lg font-semibold mb-4">Statistiques</h3><div><p className="text-blue-100">Congés pris</p><p className="text-2xl font-bold">{conges.filter(c => c.statut === 'VALIDE').length}</p></div><div className="mt-4"><p className="text-blue-100">Jours restants</p><p className="text-2xl font-bold">22</p></div></div></div>

          <div className="bg-white rounded-xl border p-6"><h2 className="text-lg font-semibold mb-4">Historique des congés</h2><table className="w-full"><thead><tr><th>Type</th><th>Dates</th><th>Jours</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{conges.map(c => (<tr key={c.id}><td>{c.type_conge}</td><td>{new Date(c.date_debut).toLocaleDateString('fr-FR')} → {new Date(c.date_fin).toLocaleDateString('fr-FR')}</td><td>{c.nb_jours}</td><td><span className={`px-2 py-1 rounded-full text-xs ${c.statut === 'VALIDE' ? 'bg-green-100 text-green-700' : c.statut === 'EN_ATTENTE' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{c.statut}</span></td><td>{c.statut === 'EN_ATTENTE' && (<><button onClick={() => updateCongeStatut(c.id, 'VALIDE')} className="text-green-600 mr-2">Valider</button><button onClick={() => updateCongeStatut(c.id, 'REFUSE')} className="text-red-600">Refuser</button></>)}</td></tr>))}</tbody></table></div>
        </>
      )}

      {/* Modal demande congé */}
      {showCongeForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white rounded-xl p-6 w-full max-w-md"><h3 className="text-xl font-bold mb-4">Demande de congé</h3><div className="space-y-4"><select value={congeForm.type_conge} onChange={e => setCongeForm({...congeForm, type_conge: e.target.value})} className="w-full p-2 border rounded"><option value="ANNUEL">Congé annuel</option><option value="MALADIE">Maladie</option><option value="SANS_SOLDE">Sans solde</option></select><input type="date" placeholder="Date début" value={congeForm.date_debut} onChange={e => setCongeForm({...congeForm, date_debut: e.target.value})} className="w-full p-2 border rounded" /><input type="date" placeholder="Date fin" value={congeForm.date_fin} onChange={e => setCongeForm({...congeForm, date_fin: e.target.value})} className="w-full p-2 border rounded" /><textarea placeholder="Motif" value={congeForm.motif} onChange={e => setCongeForm({...congeForm, motif: e.target.value})} rows={3} className="w-full p-2 border rounded" /></div><div className="flex justify-end gap-3 mt-6"><button onClick={() => setShowCongeForm(false)} className="px-4 py-2 border rounded">Annuler</button><button onClick={handleCreateConge} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Envoyer</button></div></div></div>
      )}

      {mode === 'new' && (
        <>
          <div className="flex items-center gap-4"><button onClick={() => setMode('list')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft /></button><h1 className="text-3xl font-bold">Nouvel employé</h1></div>
          <div className="bg-white rounded-xl border p-6"><div className="grid grid-cols-2 gap-4"><input type="text" placeholder="Nom *" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} className="p-2 border rounded" /><input type="text" placeholder="Prénom *" value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} className="p-2 border rounded" /><input type="email" placeholder="Email *" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="p-2 border rounded" /><input type="tel" placeholder="Téléphone" value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} className="p-2 border rounded" /><input type="text" placeholder="Poste" value={formData.poste} onChange={e => setFormData({...formData, poste: e.target.value})} className="p-2 border rounded" /><select value={formData.departement} onChange={e => setFormData({...formData, departement: e.target.value})} className="p-2 border rounded"><option>IT</option><option>Finance</option><option>RH</option><option>Marketing</option></select><input type="date" placeholder="Date embauche" value={formData.date_embauche} onChange={e => setFormData({...formData, date_embauche: e.target.value})} className="p-2 border rounded" /><input type="number" placeholder="Salaire base" value={formData.salaire_base} onChange={e => setFormData({...formData, salaire_base: e.target.value})} className="p-2 border rounded" /><textarea placeholder="Adresse" value={formData.adresse} onChange={e => setFormData({...formData, adresse: e.target.value})} rows={3} className="col-span-2 p-2 border rounded" /></div><div className="flex justify-end gap-3 mt-6 pt-6 border-t"><button onClick={() => setMode('list')} className="px-4 py-2 border rounded">Annuler</button><button onClick={handleCreate} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Créer</button></div></div>
        </>
      )}
    </div>
  );
}
