'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  FileText, Search, Filter, Plus, Eye, Edit, Trash2,
  ArrowLeft, Save, X, AlertCircle, CheckCircle,
  Truck, Calendar, DollarSign, User, Package,
  Printer, Download, Clock, Check, XCircle
} from 'lucide-react';
import { logistiqueApi, type Commande, type LigneCommande, type Produit } from '@/services/api/logistique.api';

export default function CommandesPage() {
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  const commandeId = searchParams.get('id');

  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [commande, setCommande] = useState<Commande | null>(null);
  const [lignes, setLignes] = useState<LigneCommande[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [mode, setMode] = useState<'list' | 'detail' | 'new' | 'edit'>('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    client_nom: '',
    client_adresse: '',
    client_telephone: '',
    date_livraison_souhaitee: '',
    notes: ''
  });

  const [lignesData, setLignesData] = useState<Array<{ produit_id: string; quantite: string; prix_unitaire: string }>>([]);
  const [showAddLigne, setShowAddLigne] = useState(false);
  const [newLigne, setNewLigne] = useState({ produit_id: '', quantite: '', prix_unitaire: '' });

  useEffect(() => {
    loadProduits();
    if (action === 'new') {
      setMode('new');
      setLignesData([]);
    } else if (commandeId) {
      setMode('detail');
      loadCommande(parseInt(commandeId));
    } else {
      loadCommandes();
    }
  }, [action, commandeId]);

  const loadCommandes = async () => {
    setLoading(true);
    try {
      const data = await logistiqueApi.getCommandes();
      setCommandes(data);
    } catch (err: any) { 
      console.error('Error loading commandes:', err);
      setError('Erreur chargement commandes: ' + (err.message || 'Vérifiez le backend logistique'));
    } finally { setLoading(false); }
  };

  const loadCommande = async (id: number) => {
    setLoading(true);
    try {
      const data = await logistiqueApi.getCommande(id);
      if (data) {
        setCommande(data);
        setFormData({ client_nom: data.client_nom || '', client_adresse: data.client_adresse || '', client_telephone: data.client_telephone || '', date_livraison_souhaitee: data.date_livraison_souhaitee || '', notes: data.notes || '' });
        setLignes(data.lignes || []);
      }
    } catch (err: any) { 
      console.error('Error loading commande:', err);
      setError('Erreur chargement commande: ' + (err.message || 'Non trouvée'));
    } finally { setLoading(false); }
  };

  const loadProduits = async () => {
    try {
      const data = await logistiqueApi.getProduits();
      setProduits(data);
    } catch (err: unknown) { 
      console.error('Error loading produits:', err);
    }
  };

  const handleAddLigne = () => {
    const produit = produits.find(p => p.id === parseInt(newLigne.produit_id));
    if (!produit) return;
    setLignesData([...lignesData, { produit_id: newLigne.produit_id, quantite: newLigne.quantite, prix_unitaire: newLigne.prix_unitaire || produit.prix_unitaire.toString() }]);
    setShowAddLigne(false);
    setNewLigne({ produit_id: '', quantite: '', prix_unitaire: '' });
  };

  const removeLigne = (index: number) => setLignesData(lignesData.filter((_, i) => i !== index));

  const totalHT = lignesData.reduce((sum, l) => sum + (parseInt(l.quantite) * parseFloat(l.prix_unitaire)), 0);
  const tva = totalHT * 0.2;
  const totalTTC = totalHT + tva;

  const handleCreate = async () => {
    if (!formData.client_nom) { setError('Nom client requis'); return; }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess('Commande créée avec succès');
      setTimeout(() => { setMode('list'); loadCommandes(); }, 1500);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleUpdateStatut = async (newStatut: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setSuccess(`Statut mis à jour: ${newStatut}`);
      if (commande) setCommande({ ...commande, statut: newStatut as any });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) { setError(err.message); }
  };

  const handleUpdate = async () => {
    if (!commande) return;
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess('Commande mise à jour avec succès');
      setTimeout(() => { setMode('detail'); }, 1500);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const filteredCommandes = commandes.filter(c => c.numero_commande.includes(searchTerm) || c.client_nom.toLowerCase().includes(searchTerm.toLowerCase())).filter(c => statusFilter === 'all' || c.statut === statusFilter);

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'PREPARATION': return 'bg-yellow-100 text-yellow-700';
      case 'LIVRAISON': return 'bg-blue-100 text-blue-700';
      case 'TERMINEE': return 'bg-green-100 text-green-700';
      case 'ANNULEE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading && mode !== 'list') return <div className="flex justify-center h-64"><div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-50 p-4 rounded-lg flex justify-between"><div className="flex items-center"><AlertCircle className="w-5 h-5 text-red-600 mr-2" />{error}</div><button onClick={() => setError('')}><X className="w-5 h-5" /></button></div>}
      {success && <div className="bg-green-50 p-4 rounded-lg"><CheckCircle className="w-5 h-5 inline mr-2 text-green-600" />{success}</div>}

      {mode === 'list' && (
        <>
          <div className="flex justify-between"><div><h1 className="text-3xl font-bold">Commandes</h1><p className="text-gray-600">Gestion des commandes clients</p></div><Link href="/dashboard/logistique/commandes?action=new" className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center"><Plus className="w-4 h-4 mr-2" />Nouvelle commande</Link></div>

          <div className="bg-white rounded-xl border p-4"><div className="flex gap-4"><div className="flex-1 relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" /></div><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2 border rounded-lg"><option value="all">Tous statuts</option><option value="EN_ATTENTE">En attente</option><option value="PREPARATION">Préparation</option><option value="LIVRAISON">Livraison</option><option value="TERMINEE">Terminée</option></select></div></div>

          <div className="bg-white rounded-xl border overflow-hidden"><table className="w-full"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs">N°</th><th className="px-6 py-3 text-left text-xs">Client</th><th className="px-6 py-3 text-left text-xs">Date</th><th className="px-6 py-3 text-left text-xs">Total</th><th className="px-6 py-3 text-left text-xs">Statut</th><th className="px-6 py-3 text-left text-xs">Actions</th></tr></thead><tbody>{filteredCommandes.map(c => (<tr key={c.id} className="hover:bg-gray-50"><td className="px-6 py-4 font-mono">{c.numero_commande}</td><td>{c.client_nom}</td><td>{new Date(c.date_commande).toLocaleDateString()}</td><td>{c.total_ttc.toLocaleString()} €</td><td><span className={`px-2 py-1 rounded-full text-xs ${getStatutColor(c.statut)}`}>{c.statut}</span></td><td><Link href={`/dashboard/logistique/commandes?id=${c.id}`}><Eye className="w-4 h-4 text-blue-600" /></Link></td></tr>))}</tbody></table></div>
        </>
      )}

      {(mode === 'detail' || mode === 'edit') && commande && (
        <>
          <div className="flex justify-between"><div className="flex items-center gap-4"><button onClick={() => setMode('list')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></button><div><h1 className="text-3xl font-bold">{commande.numero_commande}</h1><p className="text-gray-600">{commande.client_nom}</p></div></div><div className="flex gap-2">{mode === 'detail' ? (<><select value={commande.statut} onChange={e => handleUpdateStatut(e.target.value)} className="px-4 py-2 border rounded-lg"><option>EN_ATTENTE</option><option>PREPARATION</option><option>LIVRAISON</option><option>TERMINEE</option><option>ANNULEE</option></select><button onClick={() => setMode('edit')} className="px-4 py-2 border rounded-lg"><Edit className="w-4 h-4 inline mr-2" />Modifier</button></>) : (<><button onClick={() => setMode('detail')}>Annuler</button><button onClick={handleUpdate}>Enregistrer</button></>)}</div></div>

          <div className="grid grid-cols-3 gap-6"><div className="col-span-2 bg-white rounded-xl border p-6">{mode === 'detail' ? (<div className="grid grid-cols-2 gap-4"><div><p className="text-sm text-gray-600">Client</p><p className="font-medium">{commande.client_nom}</p><p className="text-sm">{commande.client_adresse}</p><p>{commande.client_telephone}</p></div><div><p className="text-sm text-gray-600">Dates</p><p>Commande: {new Date(commande.date_commande).toLocaleDateString()}</p><p>Livraison souhaitée: {commande.date_livraison_souhaitee ? new Date(commande.date_livraison_souhaitee).toLocaleDateString() : '-'}</p></div><div className="col-span-2"><p className="text-sm text-gray-600">Notes</p><p>{commande.notes || '-'}</p></div></div>) : (<div><input type="text" placeholder="Client" value={formData.client_nom} onChange={e => setFormData({...formData, client_nom: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="text" placeholder="Adresse" value={formData.client_adresse} onChange={e => setFormData({...formData, client_adresse: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="tel" placeholder="Téléphone" value={formData.client_telephone} onChange={e => setFormData({...formData, client_telephone: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="date" value={formData.date_livraison_souhaitee} onChange={e => setFormData({...formData, date_livraison_souhaitee: e.target.value})} className="w-full mb-3 p-2 border rounded" /><textarea placeholder="Notes" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={3} className="w-full p-2 border rounded" /></div>)}</div>

            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white"><h3 className="text-lg font-semibold mb-4">Récapitulatif</h3><div className="space-y-2"><div className="flex justify-between"><span>Total HT</span><span className="font-bold">{commande.total_ht.toLocaleString()} €</span></div><div className="flex justify-between"><span>TVA (20%)</span><span>{commande.tva.toLocaleString()} €</span></div><div className="flex justify-between text-xl pt-2 border-t border-white/20"><span>Total TTC</span><span className="font-bold">{commande.total_ttc.toLocaleString()} €</span></div></div></div></div>

          <div className="bg-white rounded-xl border p-6"><div className="flex justify-between mb-4"><h2 className="text-lg font-semibold">Articles</h2><button className="text-blue-600"><Printer className="w-4 h-4 inline mr-1" />Bon de livraison</button></div><table className="w-full"><thead><tr><th className="text-left">Produit</th><th className="text-left">Quantité</th><th className="text-left">Prix unitaire</th><th className="text-left">Total</th></tr></thead><tbody>{lignes.map(l => (<tr key={l.id}><td>{l.produit_nom}<br /><span className="text-xs text-gray-500">{l.produit_code}</span></td><td>{l.quantite}</td><td>{l.prix_unitaire} €</td><td>{l.total_ligne} €</td></tr>))}</tbody></table></div>
        </>
      )}

      {mode === 'new' && (
        <>
          <div className="flex items-center gap-4"><button onClick={() => setMode('list')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft /></button><h1 className="text-3xl font-bold">Nouvelle commande</h1></div>
          <div className="bg-white rounded-xl border p-6"><div className="grid grid-cols-2 gap-6"><div><input type="text" placeholder="Client *" value={formData.client_nom} onChange={e => setFormData({...formData, client_nom: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="text" placeholder="Adresse" value={formData.client_adresse} onChange={e => setFormData({...formData, client_adresse: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="tel" placeholder="Téléphone" value={formData.client_telephone} onChange={e => setFormData({...formData, client_telephone: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="date" value={formData.date_livraison_souhaitee} onChange={e => setFormData({...formData, date_livraison_souhaitee: e.target.value})} className="w-full mb-3 p-2 border rounded" /><textarea placeholder="Notes" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={3} className="w-full p-2 border rounded" /></div><div className="bg-gray-50 rounded-lg p-4"><h3 className="font-semibold mb-2">Récapitulatif</h3><div className="space-y-2"><div className="flex justify-between"><span>Total HT</span><span>{totalHT.toLocaleString()} €</span></div><div className="flex justify-between"><span>TVA 20%</span><span>{tva.toLocaleString()} €</span></div><div className="flex justify-between font-bold pt-2 border-t"><span>Total TTC</span><span>{totalTTC.toLocaleString()} €</span></div></div></div></div>

            <div className="mt-6"><div className="flex justify-between mb-4"><h3 className="font-semibold">Articles</h3><button onClick={() => setShowAddLigne(true)} className="text-blue-600"><Plus className="w-4 h-4 inline mr-1" />Ajouter un article</button></div><table className="w-full"><thead><tr><th>Produit</th><th>Qté</th><th>Prix</th><th>Total</th><th></th></tr></thead><tbody>{lignesData.map((l, i) => (<tr key={i}><td>{produits.find(p => p.id === parseInt(l.produit_id))?.nom}</td><td>{l.quantite}</td><td>{l.prix_unitaire} €</td><td>{(parseInt(l.quantite) * parseFloat(l.prix_unitaire)).toLocaleString()} €</td><td><button onClick={() => removeLigne(i)} className="text-red-600"><Trash2 className="w-4 h-4" /></button></td></tr>))}</tbody></table><div className="mt-4 flex justify-end"><button onClick={handleCreate} disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg">{loading ? 'Création...' : 'Créer la commande'}</button></div></div>

            {showAddLigne && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white rounded-xl p-6 w-96"><h3 className="text-xl font-bold mb-4">Ajouter un article</h3><select value={newLigne.produit_id} onChange={e => setNewLigne({...newLigne, produit_id: e.target.value})} className="w-full mb-3 p-2 border rounded"><option value="">Sélectionner</option>{produits.map(p => <option key={p.id} value={p.id}>{p.nom} ({p.code_produit}) - {p.prix_unitaire}€</option>)}</select><input type="number" placeholder="Quantité" value={newLigne.quantite} onChange={e => setNewLigne({...newLigne, quantite: e.target.value})} className="w-full mb-3 p-2 border rounded" /><div className="flex justify-end gap-2"><button onClick={() => setShowAddLigne(false)} className="px-4 py-2 border rounded">Annuler</button><button onClick={handleAddLigne} className="px-4 py-2 bg-blue-600 text-white rounded">Ajouter</button></div></div></div>)}
          </div>
        </>
      )}
    </div>
  );
}