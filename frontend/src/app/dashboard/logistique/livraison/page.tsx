'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Truck, Search, Filter, Plus, Eye, Edit, Trash2,
  ArrowLeft, Save, X, AlertCircle, CheckCircle,
  MapPin, Calendar, Package, User, Clock,
  Check, XCircle, Printer, Download
} from 'lucide-react';

interface Livraison {
  id: number;
  numero_livraison: string;
  commande_id: number;
  commande_numero: string;
  client_nom: string;
  client_adresse: string;
  transporteur: string;
  numero_suivi: string;
  date_expedition: string;
  date_livraison_prevue: string;
  date_livraison_reelle: string | null;
  statut: 'PREPARATION' | 'EXPEDIE' | 'EN_TRANSIT' | 'LIVRE' | 'RETARD';
  adresse_livraison: string;
  frais_port: number;
  notes: string;
}

interface ArticleLivraison {
  id: number;
  produit_nom: string;
  quantite: number;
  unite: string;
}

export default function LivraisonsPage() {
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  const livraisonId = searchParams.get('id');

  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [livraison, setLivraison] = useState<Livraison | null>(null);
  const [articles, setArticles] = useState<ArticleLivraison[]>([]);
  const [commandes, setCommandes] = useState<Array<{ id: number; numero: string; client: string }>>([]);
  const [mode, setMode] = useState<'list' | 'detail' | 'new' | 'edit'>('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    commande_id: '',
    transporteur: '',
    numero_suivi: '',
    date_expedition: new Date().toISOString().split('T')[0],
    date_livraison_prevue: '',
    adresse_livraison: '',
    frais_port: '0',
    notes: ''
  });

  useEffect(() => {
    loadCommandes();
    if (action === 'new') setMode('new');
    else if (livraisonId) { setMode('detail'); loadLivraison(parseInt(livraisonId)); }
    else loadLivraisons();
  }, [action, livraisonId]);

  const loadLivraisons = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setLivraisons([
        { id: 1, numero_livraison: 'LIV-2024-001', commande_id: 1, commande_numero: 'CMD-2024-001', client_nom: 'Tech Solutions', client_adresse: 'Cocody', transporteur: 'DHL', numero_suivi: '1Z999AA10123456784', date_expedition: '2026-03-18', date_livraison_prevue: '2026-03-20', date_livraison_reelle: null, statut: 'EN_TRANSIT', adresse_livraison: 'Cocody, Abidjan', frais_port: 15, notes: '' },
        { id: 2, numero_livraison: 'LIV-2024-002', commande_id: 2, commande_numero: 'CMD-2024-002', client_nom: 'SARL Bâtiment', client_adresse: 'Plateau', transporteur: 'UPS', numero_suivi: '1Z999BB10234567895', date_expedition: '2026-03-19', date_livraison_prevue: '2026-03-22', date_livraison_reelle: null, statut: 'PREPARATION', adresse_livraison: 'Plateau, Abidjan', frais_port: 20, notes: '' },
        { id: 3, numero_livraison: 'LIV-2024-003', commande_id: 3, commande_numero: 'CMD-2024-003', client_nom: 'Express Log', client_adresse: 'Marcory', transporteur: 'Colissimo', numero_suivi: '1Z999CC10345678906', date_expedition: '2026-03-16', date_livraison_prevue: '2026-03-18', date_livraison_reelle: '2026-03-18', statut: 'LIVRE', adresse_livraison: 'Marcory, Abidjan', frais_port: 10, notes: '' },
      ]);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const loadLivraison = async (id: number) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const mock: Livraison = { id, numero_livraison: 'LIV-2024-001', commande_id: 1, commande_numero: 'CMD-2024-001', client_nom: 'Tech Solutions', client_adresse: 'Cocody', transporteur: 'DHL', numero_suivi: '1Z999AA10123456784', date_expedition: '2026-03-18', date_livraison_prevue: '2026-03-20', date_livraison_reelle: null, statut: 'EN_TRANSIT', adresse_livraison: 'Cocody, Abidjan', frais_port: 15, notes: '' };
      setLivraison(mock);
      setFormData({ commande_id: mock.commande_id.toString(), transporteur: mock.transporteur, numero_suivi: mock.numero_suivi, date_expedition: mock.date_expedition, date_livraison_prevue: mock.date_livraison_prevue, adresse_livraison: mock.adresse_livraison, frais_port: mock.frais_port.toString(), notes: mock.notes });
      setArticles([
        { id: 1, produit_nom: 'Carton 40x30', quantite: 200, unite: 'unités' },
        { id: 2, produit_nom: 'Ruban adhésif', quantite: 500, unite: 'rouleaux' },
      ]);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const loadCommandes = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setCommandes([
        { id: 1, numero: 'CMD-2024-001', client: 'Tech Solutions' },
        { id: 2, numero: 'CMD-2024-002', client: 'SARL Bâtiment' },
        { id: 3, numero: 'CMD-2024-003', client: 'Express Log' },
      ]);
    } catch (err: any) { console.error(err); }
  };

  const handleCreate = async () => {
    if (!formData.commande_id || !formData.transporteur) { setError('Commande et transporteur requis'); return; }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess('Livraison créée');
      setTimeout(() => { setMode('list'); loadLivraisons(); }, 1500);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleUpdateStatut = async (newStatut: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setSuccess(`Statut mis à jour: ${newStatut}`);
      if (livraison) setLivraison({ ...livraison, statut: newStatut as any });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) { setError(err.message); }
  };

  const filteredLivraisons = livraisons.filter(l =>
    l.numero_livraison.includes(searchTerm) ||
    l.client_nom.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(l => statusFilter === 'all' || l.statut === statusFilter);

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'PREPARATION': return 'bg-yellow-100 text-yellow-700';
      case 'EXPEDIE': return 'bg-blue-100 text-blue-700';
      case 'EN_TRANSIT': return 'bg-purple-100 text-purple-700';
      case 'LIVRE': return 'bg-green-100 text-green-700';
      case 'RETARD': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading && mode !== 'list') return <div className="flex justify-center h-64"><div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-50 p-4 rounded-lg"><AlertCircle className="w-5 h-5 inline mr-2" />{error}</div>}
      {success && <div className="bg-green-50 p-4 rounded-lg"><CheckCircle className="w-5 h-5 inline mr-2 text-green-600" />{success}</div>}

      {mode === 'list' && (
        <>
          <div className="flex justify-between"><div><h1 className="text-3xl font-bold">Livraisons</h1><p className="text-gray-600">Suivi des livraisons</p></div><Link href="/dashboard/logistique/livraisons?action=new" className="px-4 py-2 bg-blue-600 text-white rounded-lg"><Plus className="w-4 h-4 mr-2" />Nouvelle livraison</Link></div>

          <div className="bg-white rounded-xl border p-4"><div className="flex gap-4"><div className="flex-1 relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" /></div><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2 border rounded-lg"><option value="all">Tous statuts</option><option value="PREPARATION">Préparation</option><option value="EXPEDIE">Expédié</option><option value="EN_TRANSIT">En transit</option><option value="LIVRE">Livré</option></select></div></div>

          <div className="bg-white rounded-xl border overflow-hidden"><table className="w-full"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left">N°</th><th>Client</th><th>Transporteur</th><th>Date expédition</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{filteredLivraisons.map(l => (<tr key={l.id} className="hover:bg-gray-50"><td className="px-6 py-4 font-mono">{l.numero_livraison}</td><td>{l.client_nom}</td><td>{l.transporteur}</td><td>{new Date(l.date_expedition).toLocaleDateString()}</td><td><span className={`px-2 py-1 rounded-full text-xs ${getStatutColor(l.statut)}`}>{l.statut}</span></td><td><Link href={`/dashboard/logistique/livraisons?id=${l.id}`}><Eye className="w-4 h-4 text-blue-600" /></Link></td></tr>))}</tbody></table></div>
        </>
      )}

      {(mode === 'detail' || mode === 'edit') && livraison && (
        <>
          <div className="flex justify-between"><div className="flex items-center gap-4"><button onClick={() => setMode('list')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft /></button><div><h1 className="text-3xl font-bold">{livraison.numero_livraison}</h1><p className="text-gray-600">Commande {livraison.commande_numero}</p></div></div><div className="flex gap-2">{mode === 'detail' ? (<><select value={livraison.statut} onChange={e => handleUpdateStatut(e.target.value)} className="px-4 py-2 border rounded-lg"><option>PREPARATION</option><option>EXPEDIE</option><option>EN_TRANSIT</option><option>LIVRE</option></select><button className="px-4 py-2 border rounded-lg"><Printer className="w-4 h-4 inline mr-2" />Bon de livraison</button></>) : (<><button onClick={() => setMode('detail')}>Annuler</button><button onClick={handleCreate}>Enregistrer</button></>)}</div></div>

          <div className="grid grid-cols-3 gap-6"><div className="col-span-2 bg-white rounded-xl border p-6">{mode === 'detail' ? (<div className="grid grid-cols-2 gap-4"><div><p className="text-sm text-gray-600">Client</p><p className="font-medium">{livraison.client_nom}</p><p>{livraison.client_adresse}</p></div><div><p className="text-sm text-gray-600">Transporteur</p><p>{livraison.transporteur}</p><p className="text-xs text-gray-500">Suivi: {livraison.numero_suivi}</p></div><div><p className="text-sm text-gray-600">Dates</p><p>Expédition: {new Date(livraison.date_expedition).toLocaleDateString()}</p><p>Prévue: {new Date(livraison.date_livraison_prevue).toLocaleDateString()}</p>{livraison.date_livraison_reelle && <p className="text-green-600">Livrée: {new Date(livraison.date_livraison_reelle).toLocaleDateString()}</p>}</div><div><p className="text-sm text-gray-600">Adresse livraison</p><p>{livraison.adresse_livraison}</p></div></div>) : (<div><select value={formData.commande_id} onChange={e => setFormData({...formData, commande_id: e.target.value})} className="w-full mb-3 p-2 border rounded"><option>Choisir une commande</option>{commandes.map(c => <option key={c.id} value={c.id}>{c.numero} - {c.client}</option>)}</select><input type="text" placeholder="Transporteur" value={formData.transporteur} onChange={e => setFormData({...formData, transporteur: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="text" placeholder="N° suivi" value={formData.numero_suivi} onChange={e => setFormData({...formData, numero_suivi: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="date" value={formData.date_expedition} onChange={e => setFormData({...formData, date_expedition: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="date" placeholder="Date livraison prévue" value={formData.date_livraison_prevue} onChange={e => setFormData({...formData, date_livraison_prevue: e.target.value})} className="w-full mb-3 p-2 border rounded" /><textarea placeholder="Notes" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={3} className="w-full p-2 border rounded" /></div>)}</div>

            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white"><h3 className="text-lg font-semibold mb-4">Informations</h3><div className="space-y-3"><div><p className="text-blue-100">Articles</p><p className="text-2xl font-bold">{articles.length}</p></div><div><p className="text-blue-100">Frais de port</p><p className="text-2xl font-bold">{livraison.frais_port} €</p></div><div><a href="#" className="inline-flex items-center text-blue-200 hover:text-white"><Download className="w-4 h-4 mr-1" />Suivi</a></div></div></div></div>

          <div className="bg-white rounded-xl border p-6"><h2 className="text-lg font-semibold mb-4">Articles</h2><table className="w-full"><thead><tr><th>Produit</th><th>Quantité</th> </tr></thead><tbody>{articles.map(a => (<tr key={a.id}><td>{a.produit_nom}</td><td>{a.quantite} {a.unite}</td></tr>))}</tbody> </table></div>
        </>
      )}

      {mode === 'new' && (
        <>
          <div className="flex items-center gap-4"><button onClick={() => setMode('list')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft /></button><h1 className="text-3xl font-bold">Nouvelle livraison</h1></div>
          <div className="bg-white rounded-xl border p-6"><div className="grid grid-cols-2 gap-4"><select value={formData.commande_id} onChange={e => setFormData({...formData, commande_id: e.target.value})} className="p-2 border rounded"><option>Commande *</option>{commandes.map(c => <option key={c.id} value={c.id}>{c.numero} - {c.client}</option>)}</select><input type="text" placeholder="Transporteur *" value={formData.transporteur} onChange={e => setFormData({...formData, transporteur: e.target.value})} className="p-2 border rounded" /><input type="text" placeholder="N° suivi" value={formData.numero_suivi} onChange={e => setFormData({...formData, numero_suivi: e.target.value})} className="p-2 border rounded" /><input type="date" value={formData.date_expedition} onChange={e => setFormData({...formData, date_expedition: e.target.value})} className="p-2 border rounded" /><input type="date" placeholder="Date livraison prévue" value={formData.date_livraison_prevue} onChange={e => setFormData({...formData, date_livraison_prevue: e.target.value})} className="p-2 border rounded" /><input type="number" placeholder="Frais de port" value={formData.frais_port} onChange={e => setFormData({...formData, frais_port: e.target.value})} className="p-2 border rounded" /><textarea placeholder="Adresse livraison" value={formData.adresse_livraison} onChange={e => setFormData({...formData, adresse_livraison: e.target.value})} rows={2} className="col-span-2 p-2 border rounded" /><textarea placeholder="Notes" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={2} className="col-span-2 p-2 border rounded" /></div><div className="mt-6 flex justify-end gap-3"><button onClick={() => setMode('list')} className="px-4 py-2 border rounded">Annuler</button><button onClick={handleCreate} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Créer</button></div></div>
        </>
      )}
    </div>
  );
}