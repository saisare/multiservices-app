'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Megaphone, Search, Plus, Eye, Edit, Trash2,
  ArrowLeft, Save, X, AlertCircle, CheckCircle,
  Calendar, DollarSign, TrendingUp, MousePointer,
  Facebook, Instagram, Linkedin, Twitter, Youtube,
  Globe, Mail, Clock
} from 'lucide-react';

interface Campagne {
  id: number;
  code_campagne: string;
  nom_campagne: string;
  annonceur_id: number;
  annonceur_nom: string;
  type_campagne: string;
  objectif: string;
  budget: number;
  date_debut: string;
  date_fin: string;
  statut: string;
  date_creation: string;
}

interface Performance {
  id: number;
  date_mesure: string;
  impressions: number;
  clics: number;
  conversions: number;
  cout: number;
  revenu: number;
}

export default function CampagnesPage() {
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  const campagneId = searchParams.get('id');

  const [campagnes, setCampagnes] = useState<Campagne[]>([]);
  const [campagne, setCampagne] = useState<Campagne | null>(null);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [annonceurs, setAnnonceurs] = useState<{ id: number; nom_entreprise: string }[]>([]);
  const [mode, setMode] = useState<'list' | 'detail' | 'new' | 'edit'>('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const [formData, setFormData] = useState({
    code_campagne: '',
    nom_campagne: '',
    annonceur_id: '',
    type_campagne: 'RESEAUX_SOCIAUX',
    objectif: '',
    budget: '',
    date_debut: new Date().toISOString().split('T')[0],
    date_fin: ''
  });

  useEffect(() => {
    loadAnnonceurs();
    if (action === 'new') setMode('new');
    else if (campagneId) { setMode('detail'); loadCampagne(parseInt(campagneId)); }
    else loadCampagnes();
  }, [action, campagneId]);

  const loadCampagnes = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setCampagnes([
        { id: 1, code_campagne: 'CAMP-001', nom_campagne: 'Lancement App', annonceur_id: 1, annonceur_nom: 'Tech Solutions', type_campagne: 'RESEAUX_SOCIAUX', objectif: 'Acquisition', budget: 5000, date_debut: '2026-03-01', date_fin: '2026-03-31', statut: 'ACTIVE', date_creation: '2026-02-20' },
        { id: 2, code_campagne: 'CAMP-002', nom_campagne: 'Soldes Été', annonceur_id: 2, annonceur_nom: 'Mode Express', type_campagne: 'GOOGLE_ADS', objectif: 'Ventes', budget: 3000, date_debut: '2026-03-10', date_fin: '2026-04-10', statut: 'ACTIVE', date_creation: '2026-03-01' },
        { id: 3, code_campagne: 'CAMP-003', nom_campagne: 'Promo Rentrée', annonceur_id: 3, annonceur_nom: 'Auto Plus', type_campagne: 'EMAILING', objectif: 'Fidélisation', budget: 1500, date_debut: '2026-02-15', date_fin: '2026-03-15', statut: 'TERMINEE', date_creation: '2026-02-05' },
      ]);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const loadCampagne = async (id: number) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const mock: Campagne = { id, code_campagne: 'CAMP-001', nom_campagne: 'Lancement App', annonceur_id: 1, annonceur_nom: 'Tech Solutions', type_campagne: 'RESEAUX_SOCIAUX', objectif: 'Acquisition', budget: 5000, date_debut: '2026-03-01', date_fin: '2026-03-31', statut: 'ACTIVE', date_creation: '2026-02-20' };
      setCampagne(mock);
      setFormData({
        code_campagne: mock.code_campagne,
        nom_campagne: mock.nom_campagne,
        annonceur_id: mock.annonceur_id.toString(),
        type_campagne: mock.type_campagne,
        objectif: mock.objectif,
        budget: mock.budget.toString(),
        date_debut: mock.date_debut,
        date_fin: mock.date_fin
      });
      setPerformances([
        { id: 1, date_mesure: '2026-03-15', impressions: 10000, clics: 500, conversions: 50, cout: 1000, revenu: 2500 },
        { id: 2, date_mesure: '2026-03-20', impressions: 15000, clics: 750, conversions: 75, cout: 1500, revenu: 3750 },
      ]);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const loadAnnonceurs = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setAnnonceurs([
        { id: 1, nom_entreprise: 'Tech Solutions' },
        { id: 2, nom_entreprise: 'Mode Express' },
        { id: 3, nom_entreprise: 'Auto Plus' },
      ]);
    } catch (err: any) { console.error(err); }
  };

  const handleCreate = async () => {
    if (!formData.nom_campagne || !formData.annonceur_id) { setError('Nom et annonceur requis'); return; }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess('Campagne créée');
      setTimeout(() => { setMode('list'); loadCampagnes(); }, 1500);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const updateStatut = async (id: number, statut: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setCampagnes(campagnes.map(c => c.id === id ? { ...c, statut } : c));
      setSuccess(`Statut mis à jour: ${statut}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) { setError(err.message); }
  };

  const filteredCampagnes = campagnes.filter(c =>
    c.nom_campagne.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.annonceur_nom.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(c => typeFilter === 'all' || c.type_campagne === typeFilter);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'RESEAUX_SOCIAUX': return <Facebook className="w-4 h-4 text-blue-600" />;
      case 'GOOGLE_ADS': return <Globe className="w-4 h-4 text-green-600" />;
      case 'EMAILING': return <Mail className="w-4 h-4 text-orange-600" />;
      default: return <Megaphone className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-50 p-4 rounded-lg"><AlertCircle className="w-5 h-5 inline mr-2" />{error}</div>}
      {success && <div className="bg-green-50 p-4 rounded-lg"><CheckCircle className="w-5 h-5 inline mr-2 text-green-600" />{success}</div>}

      {mode === 'list' && (
        <>
          <div className="flex justify-between"><div><h1 className="text-3xl font-bold">Campagnes</h1><p className="text-gray-600">Gestion des campagnes marketing</p></div><Link href="/dashboard/communication/campagnes?action=new" className="px-4 py-2 bg-blue-600 text-white rounded-lg"><Plus className="w-4 h-4 mr-2" />Nouvelle campagne</Link></div>

          <div className="bg-white rounded-xl border p-4"><div className="flex gap-4"><div className="flex-1 relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" /></div><select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-4 py-2 border rounded-lg"><option value="all">Tous types</option><option value="RESEAUX_SOCIAUX">Réseaux sociaux</option><option value="GOOGLE_ADS">Google Ads</option><option value="EMAILING">Emailing</option></select></div></div>

          <div className="bg-white rounded-xl border overflow-hidden"><table className="w-full"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left">Nom</th><th>Annonceur</th><th>Type</th><th>Budget</th><th>Dates</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{filteredCampagnes.map(c => (<tr key={c.id} className="hover:bg-gray-50"><td className="px-6 py-4 font-medium">{c.nom_campagne}</td><td>{c.annonceur_nom}</td><td className="flex items-center gap-1">{getTypeIcon(c.type_campagne)} {c.type_campagne}</td><td>{c.budget.toLocaleString()} €</td><td>{new Date(c.date_debut).toLocaleDateString('fr-FR')} → {new Date(c.date_fin).toLocaleDateString('fr-FR')}</td><td><select value={c.statut} onChange={e => updateStatut(c.id, e.target.value)} className={`px-2 py-1 rounded-full text-xs border-0 ${c.statut === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}><option>ACTIVE</option><option>TERMINEE</option><option>ANNULEE</option></select></td><td><Link href={`/dashboard/communication/campagnes?id=${c.id}`}><Eye className="w-4 h-4 text-blue-600" /></Link></td></tr>))}</tbody></table></div>
        </>
      )}

      {(mode === 'detail' || mode === 'edit') && campagne && (
        <>
          <div className="flex justify-between"><div className="flex items-center gap-4"><button onClick={() => setMode('list')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft /></button><div><h1 className="text-3xl font-bold">{campagne.nom_campagne}</h1><p className="text-gray-600">{campagne.code_campagne}</p></div></div><div className="flex gap-2">{mode === 'detail' ? (<><button onClick={() => setMode('edit')} className="px-4 py-2 border rounded-lg"><Edit className="w-4 h-4 inline mr-2" />Modifier</button></>) : (<><button onClick={() => setMode('detail')}>Annuler</button><button onClick={handleCreate}>Enregistrer</button></>)}</div></div>

          <div className="grid grid-cols-3 gap-6"><div className="col-span-2 bg-white rounded-xl border p-6">{mode === 'detail' ? (<div className="grid grid-cols-2 gap-4"><div><p className="text-sm text-gray-600">Annonceur</p><p>{campagne.annonceur_nom}</p></div><div><p className="text-sm text-gray-600">Type</p><p>{campagne.type_campagne}</p></div><div><p className="text-sm text-gray-600">Objectif</p><p>{campagne.objectif}</p></div><div><p className="text-sm text-gray-600">Budget</p><p className="font-bold">{campagne.budget.toLocaleString()} €</p></div><div><p className="text-sm text-gray-600">Dates</p><p>Du {new Date(campagne.date_debut).toLocaleDateString()} au {new Date(campagne.date_fin).toLocaleDateString()}</p></div></div>) : (<div><select value={formData.annonceur_id} onChange={e => setFormData({...formData, annonceur_id: e.target.value})} className="w-full mb-3 p-2 border rounded"><option>Annonceur *</option>{annonceurs.map(a => <option key={a.id} value={a.id}>{a.nom_entreprise}</option>)}</select><input type="text" placeholder="Nom campagne" value={formData.nom_campagne} onChange={e => setFormData({...formData, nom_campagne: e.target.value})} className="w-full mb-3 p-2 border rounded" /><select value={formData.type_campagne} onChange={e => setFormData({...formData, type_campagne: e.target.value})} className="w-full mb-3 p-2 border rounded"><option value="RESEAUX_SOCIAUX">Réseaux sociaux</option><option value="GOOGLE_ADS">Google Ads</option><option value="EMAILING">Emailing</option></select><input type="text" placeholder="Objectif" value={formData.objectif} onChange={e => setFormData({...formData, objectif: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="number" placeholder="Budget" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="date" value={formData.date_debut} onChange={e => setFormData({...formData, date_debut: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="date" value={formData.date_fin} onChange={e => setFormData({...formData, date_fin: e.target.value})} className="w-full p-2 border rounded" /></div>)}</div>

            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white"><h3 className="text-lg font-semibold mb-4">Performances</h3><div><p className="text-blue-100">Impressions</p><p className="text-2xl font-bold">{performances.reduce((s, p) => s + p.impressions, 0).toLocaleString()}</p></div><div className="mt-3"><p className="text-blue-100">Clics</p><p className="text-2xl font-bold">{performances.reduce((s, p) => s + p.clics, 0).toLocaleString()}</p></div><div className="mt-3"><p className="text-blue-100">ROI</p><p className="text-2xl font-bold">{((performances.reduce((s, p) => s + p.revenu, 0) / performances.reduce((s, p) => s + p.cout, 1)) * 100).toFixed(0)}%</p></div></div></div>

          <div className="bg-white rounded-xl border p-6"><h2 className="text-lg font-semibold mb-4">Performances détaillées</h2><table className="w-full"><thead><tr><th>Date</th><th>Impressions</th><th>Clics</th><th>Conversions</th><th>Coût</th><th>Revenu</th></tr></thead><tbody>{performances.map(p => (<tr key={p.id}><td>{new Date(p.date_mesure).toLocaleDateString('fr-FR')}</td><td>{p.impressions.toLocaleString()}</td><td>{p.clics.toLocaleString()}</td><td>{p.conversions}</td><td>{p.cout} €</td><td>{p.revenu} €</td></tr>))}</tbody></table></div>
        </>
      )}

      {mode === 'new' && (
        <>
          <div className="flex items-center gap-4"><button onClick={() => setMode('list')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft /></button><h1 className="text-3xl font-bold">Nouvelle campagne</h1></div>
          <div className="bg-white rounded-xl border p-6"><div className="grid grid-cols-2 gap-4"><select value={formData.annonceur_id} onChange={e => setFormData({...formData, annonceur_id: e.target.value})} className="p-2 border rounded"><option>Annonceur *</option>{annonceurs.map(a => <option key={a.id} value={a.id}>{a.nom_entreprise}</option>)}</select><input type="text" placeholder="Nom campagne *" value={formData.nom_campagne} onChange={e => setFormData({...formData, nom_campagne: e.target.value})} className="p-2 border rounded" /><select value={formData.type_campagne} onChange={e => setFormData({...formData, type_campagne: e.target.value})} className="p-2 border rounded"><option value="RESEAUX_SOCIAUX">Réseaux sociaux</option><option value="GOOGLE_ADS">Google Ads</option><option value="EMAILING">Emailing</option></select><input type="text" placeholder="Objectif" value={formData.objectif} onChange={e => setFormData({...formData, objectif: e.target.value})} className="p-2 border rounded" /><input type="number" placeholder="Budget *" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} className="p-2 border rounded" /><input type="date" value={formData.date_debut} onChange={e => setFormData({...formData, date_debut: e.target.value})} className="p-2 border rounded" /><input type="date" value={formData.date_fin} onChange={e => setFormData({...formData, date_fin: e.target.value})} className="p-2 border rounded" /></div><div className="flex justify-end gap-3 mt-6 pt-6 border-t"><button onClick={() => setMode('list')} className="px-4 py-2 border rounded">Annuler</button><button onClick={handleCreate} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Créer</button></div></div>
        </>
      )}
    </div>
  );
}