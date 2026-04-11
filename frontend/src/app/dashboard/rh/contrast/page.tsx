'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  FileText, Search, Plus, Eye, Edit, Trash2,
  ArrowLeft, Save, X, AlertCircle, CheckCircle,
  Calendar, DollarSign, Briefcase, Star,
  TrendingUp, Award, Clock, Users
} from 'lucide-react';
import { rhApi } from '@/services/api/rh.api';

interface Contrat {
  id: number;
  numero_contrat: string;
  employe_id: number;
  employe_nom: string;
  type_contrat: string;
  date_debut: string;
  date_fin: string;
  salaire: number;
  statut: string;
  fichier_contrat: string;
}

interface Evaluation {
  id: number;
  employe_id: number;
  employe_nom: string;
  date_evaluation: string;
  periode: string;
  note_technique: number;
  note_comportement: number;
  note_global: number;
  commentaires: string;
}

export default function ContratsPage() {
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  const tab = searchParams.get('tab') || 'contrats';
  const contratId = searchParams.get('id');

  const [contrats, setContrats] = useState<Contrat[]>([]);
  const [contrat, setContrat] = useState<Contrat | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [employes, setEmployes] = useState<{ id: number; nom: string; prenom: string }[]>([]);
  const [mode, setMode] = useState<'list' | 'detail' | 'new' | 'edit'>('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEvalForm, setShowEvalForm] = useState(false);

  const [formData, setFormData] = useState({
    employe_id: '',
    type_contrat: 'CDI',
    date_debut: new Date().toISOString().split('T')[0],
    date_fin: '',
    salaire: '',
    fichier_contrat: ''
  });

  const [evalForm, setEvalForm] = useState({
    employe_id: '',
    periode: '',
    note_technique: '3',
    note_comportement: '3',
    commentaires: ''
  });

  useEffect(() => {
    loadEmployes();
    if (action === 'new') setMode('new');
    else if (contratId) { setMode('detail'); loadContrat(parseInt(contratId)); }
    else loadContrats();
  }, [action, contratId]);

  const loadContrats = async () => {
    setLoading(true);
    try {
      const [contratsData, evaluationsData] = await Promise.all([
        rhApi.getContrats(),
        rhApi.getEvaluations()
      ]);
      setContrats((contratsData as any[]).map((contrat) => ({
        ...contrat,
        employe_nom: [contrat.employe_prenom, contrat.employe_nom].filter(Boolean).join(' ').trim() || contrat.employe_display_name || `Employé #${contrat.employe_id}`
      })));
      setEvaluations((evaluationsData as any[]).map((evaluation) => ({
        ...evaluation,
        employe_nom: [evaluation.employe_prenom, evaluation.employe_nom].filter(Boolean).join(' ').trim() || evaluation.employe_display_name || `Employé #${evaluation.employe_id}`
      })));
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const loadContrat = async (id: number) => {
    setLoading(true);
    try {
      const [contratsData, evaluationsData] = await Promise.all([
        rhApi.getContrats(),
        rhApi.getEvaluations()
      ]);
      const current = (contratsData as any[]).find((item) => item.id === id);
      if (!current) {
        throw new Error('Contrat introuvable');
      }
      const normalized = {
        ...current,
        employe_nom: [current.employe_prenom, current.employe_nom].filter(Boolean).join(' ').trim() || current.employe_display_name || `Employé #${current.employe_id}`
      };
      setContrat(normalized);
      setFormData({
        employe_id: String(current.employe_id),
        type_contrat: current.type_contrat,
        date_debut: current.date_debut ? current.date_debut.slice(0, 10) : '',
        date_fin: current.date_fin ? current.date_fin.slice(0, 10) : '',
        salaire: String(current.salaire || ''),
        fichier_contrat: current.fichier_contrat || ''
      });
      setEvaluations((evaluationsData as any[])
        .filter((item) => item.employe_id === current.employe_id)
        .map((item) => ({
          ...item,
          employe_nom: [item.employe_prenom, item.employe_nom].filter(Boolean).join(' ').trim() || item.employe_display_name || `Employé #${item.employe_id}`
        })));
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const loadEmployes = async () => {
    try {
      const employesData = await rhApi.getEmployes();
      setEmployes((employesData || []).map((item) => ({ id: item.id, nom: item.nom, prenom: item.prenom })));
    } catch (err: any) { console.error(err); }
  };

  const handleCreate = async () => {
    if (!formData.employe_id || !formData.salaire) { setError('Employé et salaire requis'); return; }
    setLoading(true);
    try {
      await rhApi.createContrat({
        employe_id: Number(formData.employe_id),
        type_contrat: formData.type_contrat,
        date_debut: formData.date_debut,
        date_fin: formData.date_fin || null,
        salaire: Number(formData.salaire),
        fichier_contrat: formData.fichier_contrat || null,
        statut: 'ACTIF'
      });
      setSuccess('Contrat créé');
      setTimeout(() => { setMode('list'); loadContrats(); }, 1500);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleCreateEval = async () => {
    if (!evalForm.employe_id || !evalForm.periode) { setError('Employé et période requis'); return; }
    setLoading(true);
    try {
      await rhApi.createEvaluation({
        employe_id: Number(evalForm.employe_id),
        date_evaluation: new Date().toISOString().slice(0, 10),
        periode: evalForm.periode,
        note_technique: Number(evalForm.note_technique),
        note_comportement: Number(evalForm.note_comportement),
        commentaires: evalForm.commentaires
      });
      setSuccess('Évaluation enregistrée');
      setShowEvalForm(false);
      setTimeout(() => { if (contrat) loadContrat(contrat.id); else loadContrats(); }, 1500);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const filteredContrats = contrats.filter(c =>
    c.employe_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.numero_contrat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-50 p-4 rounded-lg"><AlertCircle className="w-5 h-5 inline mr-2" />{error}</div>}
      {success && <div className="bg-green-50 p-4 rounded-lg"><CheckCircle className="w-5 h-5 inline mr-2 text-green-600" />{success}</div>}

      {mode === 'list' && (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contrats & Évaluations</h1>
              <p className="text-gray-600 mt-2">Gestion des contrats et évaluations</p>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard/rh/contrats?action=new" className="px-4 py-2 bg-blue-600 text-white rounded-lg"><Plus className="w-4 h-4 mr-2" />Nouveau contrat</Link>
              <button onClick={() => setShowEvalForm(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg"><Star className="w-4 h-4 mr-2" />Nouvelle évaluation</button>
            </div>
          </div>

          {/* Onglets */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-8">
              <Link href="/dashboard/rh/contrats?tab=contrats" className={`py-2 px-1 border-b-2 ${tab === 'contrats' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}><FileText className="w-4 h-4 inline mr-2" />Contrats ({contrats.length})</Link>
              <Link href="/dashboard/rh/contrats?tab=evaluations" className={`py-2 px-1 border-b-2 ${tab === 'evaluations' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}><Star className="w-4 h-4 inline mr-2" />Évaluations ({evaluations.length})</Link>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="bg-white rounded-xl border p-4"><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" /></div></div>

          {tab === 'contrats' && (
            <div className="bg-white rounded-xl border overflow-hidden"><table className="w-full"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left">N° Contrat</th><th>Employé</th><th>Type</th><th>Début</th><th>Fin</th><th>Salaire</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{filteredContrats.map(c => (<tr key={c.id} className="hover:bg-gray-50"><td className="px-6 py-4 font-mono">{c.numero_contrat}</td><td>{c.employe_nom}</td><td>{c.type_contrat}</td><td>{new Date(c.date_debut).toLocaleDateString()}</td><td>{c.date_fin ? new Date(c.date_fin).toLocaleDateString() : '-'}</td><td>{c.salaire.toLocaleString()} €</td><td><span className={`px-2 py-1 rounded-full text-xs ${c.statut === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.statut}</span></td><td><Link href={`/dashboard/rh/contrats?id=${c.id}`}><Eye className="w-4 h-4 text-blue-600" /></Link></td></tr>))}</tbody></table></div>
          )}

          {tab === 'evaluations' && (
            <div className="bg-white rounded-xl border overflow-hidden"><table className="w-full"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left">Employé</th><th>Date</th><th>Période</th><th>Technique</th><th>Comportement</th><th>Note</th><th>Actions</th></tr></thead><tbody>{evaluations.map(e => (<tr key={e.id} className="hover:bg-gray-50"><td>{e.employe_nom}</td><td>{new Date(e.date_evaluation).toLocaleDateString()}</td><td>{e.periode}</td><td>{e.note_technique}/5</td><td>{e.note_comportement}/5</td><td className="font-bold">{e.note_global}/5</td><td><Link href={`/dashboard/rh/contrats?id=${e.employe_id}`}><Eye className="w-4 h-4 text-blue-600" /></Link></td></tr>))}</tbody></table></div>
          )}
        </>
      )}

      {(mode === 'detail' || mode === 'edit') && contrat && (
        <>
          <div className="flex justify-between"><div className="flex items-center gap-4"><button onClick={() => setMode('list')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft /></button><div><h1 className="text-3xl font-bold">{contrat.numero_contrat}</h1><p className="text-gray-600">Employé: {contrat.employe_nom}</p></div></div><div className="flex gap-2">{mode === 'detail' ? (<><button onClick={() => setMode('edit')} className="px-4 py-2 border rounded-lg"><Edit className="w-4 h-4 inline mr-2" />Modifier</button><button onClick={() => setShowEvalForm(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg">+ Évaluation</button></>) : (<><button onClick={() => setMode('detail')}>Annuler</button><button onClick={handleCreate}>Enregistrer</button></>)}</div></div>

          <div className="grid grid-cols-3 gap-6"><div className="col-span-2 bg-white rounded-xl border p-6">{mode === 'detail' ? (<div className="grid grid-cols-2 gap-4"><div><p className="text-sm text-gray-600">Type</p><p className="font-medium">{contrat.type_contrat}</p></div><div><p className="text-sm text-gray-600">Dates</p><p>Début: {new Date(contrat.date_debut).toLocaleDateString()}</p><p>Fin: {contrat.date_fin ? new Date(contrat.date_fin).toLocaleDateString() : 'CDI'}</p></div><div><p className="text-sm text-gray-600">Salaire</p><p className="font-bold">{contrat.salaire.toLocaleString()} €</p></div></div>) : (<div><select value={formData.type_contrat} onChange={e => setFormData({...formData, type_contrat: e.target.value})} className="w-full mb-3 p-2 border rounded"><option value="CDI">CDI</option><option value="CDD">CDD</option><option value="STAGE">Stage</option></select><input type="date" value={formData.date_debut} onChange={e => setFormData({...formData, date_debut: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="date" value={formData.date_fin} onChange={e => setFormData({...formData, date_fin: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="number" placeholder="Salaire" value={formData.salaire} onChange={e => setFormData({...formData, salaire: e.target.value})} className="w-full mb-3 p-2 border rounded" /></div>)}</div>

            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white"><h3 className="text-lg font-semibold mb-4">Statistiques</h3><div><p className="text-blue-100">Évaluations</p><p className="text-2xl font-bold">{evaluations.length}</p></div><div className="mt-4"><p className="text-blue-100">Note moyenne</p><p className="text-2xl font-bold">{evaluations.reduce((s, e) => s + e.note_global, 0) / evaluations.length || 0}/5</p></div></div></div>

          <div className="bg-white rounded-xl border p-6"><h2 className="text-lg font-semibold mb-4">Historique des évaluations</h2><table className="w-full"><thead><tr><th>Date</th><th>Période</th><th>Technique</th><th>Comportement</th><th>Note</th><th>Commentaires</th></tr></thead><tbody>{evaluations.map(e => (<tr key={e.id}><td>{new Date(e.date_evaluation).toLocaleDateString('fr-FR')}</td><td>{e.periode}</td><td>{e.note_technique}/5</td><td>{e.note_comportement}/5</td><td className="font-bold">{e.note_global}/5</td><td className="max-w-xs truncate">{e.commentaires}</td></tr>))}</tbody></table></div>
        </>
      )}

      {/* Modal nouvelle évaluation */}
      {showEvalForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white rounded-xl p-6 w-full max-w-md"><h3 className="text-xl font-bold mb-4">Nouvelle évaluation</h3><div className="space-y-4"><select value={evalForm.employe_id} onChange={e => setEvalForm({...evalForm, employe_id: e.target.value})} className="w-full p-2 border rounded"><option value="">Employé *</option>{employes.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}</select><input type="text" placeholder="Période (ex: 2024-S1)" value={evalForm.periode} onChange={e => setEvalForm({...evalForm, periode: e.target.value})} className="w-full p-2 border rounded" /><div className="grid grid-cols-2 gap-3"><div><label className="text-sm">Note technique</label><select value={evalForm.note_technique} onChange={e => setEvalForm({...evalForm, note_technique: e.target.value})} className="w-full p-2 border rounded"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></div><div><label className="text-sm">Note comportement</label><select value={evalForm.note_comportement} onChange={e => setEvalForm({...evalForm, note_comportement: e.target.value})} className="w-full p-2 border rounded"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></div></div><textarea placeholder="Commentaires" value={evalForm.commentaires} onChange={e => setEvalForm({...evalForm, commentaires: e.target.value})} rows={3} className="w-full p-2 border rounded" /></div><div className="flex justify-end gap-3 mt-6"><button onClick={() => setShowEvalForm(false)} className="px-4 py-2 border rounded">Annuler</button><button onClick={handleCreateEval} className="px-4 py-2 bg-green-600 text-white rounded-lg">Enregistrer</button></div></div></div>
      )}

      {mode === 'new' && (
        <>
          <div className="flex items-center gap-4"><button onClick={() => setMode('list')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft /></button><h1 className="text-3xl font-bold">Nouveau contrat</h1></div>
          <div className="bg-white rounded-xl border p-6"><div className="grid grid-cols-2 gap-4"><select value={formData.employe_id} onChange={e => setFormData({...formData, employe_id: e.target.value})} className="p-2 border rounded"><option value="">Employé *</option>{employes.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}</select><select value={formData.type_contrat} onChange={e => setFormData({...formData, type_contrat: e.target.value})} className="p-2 border rounded"><option value="CDI">CDI</option><option value="CDD">CDD</option></select><input type="date" placeholder="Date début" value={formData.date_debut} onChange={e => setFormData({...formData, date_debut: e.target.value})} className="p-2 border rounded" /><input type="date" placeholder="Date fin (CDD)" value={formData.date_fin} onChange={e => setFormData({...formData, date_fin: e.target.value})} className="p-2 border rounded" /><input type="number" placeholder="Salaire *" value={formData.salaire} onChange={e => setFormData({...formData, salaire: e.target.value})} className="p-2 border rounded" /></div><div className="flex justify-end gap-3 mt-6 pt-6 border-t"><button onClick={() => setMode('list')} className="px-4 py-2 border rounded">Annuler</button><button onClick={handleCreate} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Créer</button></div></div>
        </>
      )}
    </div>
  );
}
