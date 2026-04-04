'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Building2, Search, Plus, Eye, Edit, Trash2,
  ArrowLeft, Save, X, AlertCircle, CheckCircle,
  Phone, Mail, MapPin, User, Star, Clock,
  Package, Truck, FileText, DollarSign
} from 'lucide-react';

interface Fournisseur {
  id: number;
  code_fournisseur: string;
  nom: string;
  contact: string;
  telephone: string;
  email: string;
  adresse: string;
  ville: string;
  pays: string;
  categorie: string;
  delai_livraison: number;
  note: number;
  actif: boolean;
  date_creation: string;
}

interface ProduitFournisseur {
  id: number;
  produit_id: number;
  produit_nom: string;
  prix: number;
  delai: number;
}

export default function FournisseursPage() {
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  const fournisseurId = searchParams.get('id');

  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [fournisseur, setFournisseur] = useState<Fournisseur | null>(null);
  const [produitsFournisseur, setProduitsFournisseur] = useState<ProduitFournisseur[]>([]);
  const [mode, setMode] = useState<'list' | 'detail' | 'new' | 'edit'>('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categorieFilter, setCategorieFilter] = useState('all');

  const [formData, setFormData] = useState({
    code_fournisseur: '',
    nom: '',
    contact: '',
    telephone: '',
    email: '',
    adresse: '',
    ville: '',
    pays: 'France',
    categorie: '',
    delai_livraison: '7',
    actif: true
  });

  useEffect(() => {
    if (action === 'new') setMode('new');
    else if (fournisseurId) { setMode('detail'); loadFournisseur(parseInt(fournisseurId)); }
    else loadFournisseurs();
  }, [action, fournisseurId]);

  const loadFournisseurs = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setFournisseurs([
        { id: 1, code_fournisseur: 'FOUR-001', nom: 'Papeterie Moderne', contact: 'Jean Martin', telephone: '0123456789', email: 'contact@papeterie.fr', adresse: '15 rue de Paris', ville: 'Paris', pays: 'France', categorie: 'Emballage', delai_livraison: 3, note: 4.5, actif: true, date_creation: '2026-01-10' },
        { id: 2, code_fournisseur: 'FOUR-002', nom: 'Emballages Pro', contact: 'Marie Dubois', telephone: '0234567890', email: 'commercial@emballages-pro.fr', adresse: '45 avenue du Commerce', ville: 'Lyon', pays: 'France', categorie: 'Emballage', delai_livraison: 5, note: 4.2, actif: true, date_creation: '2026-01-15' },
        { id: 3, code_fournisseur: 'FOUR-003', nom: 'Palettes Plus', contact: 'Pierre Durand', telephone: '0345678901', email: 'pierre@palettesplus.fr', adresse: '12 zone industrielle', ville: 'Marseille', pays: 'France', categorie: 'Palette', delai_livraison: 4, note: 4.8, actif: true, date_creation: '2026-02-01' },
      ]);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const loadFournisseur = async (id: number) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const mock: Fournisseur = { id, code_fournisseur: 'FOUR-001', nom: 'Papeterie Moderne', contact: 'Jean Martin', telephone: '0123456789', email: 'contact@papeterie.fr', adresse: '15 rue de Paris', ville: 'Paris', pays: 'France', categorie: 'Emballage', delai_livraison: 3, note: 4.5, actif: true, date_creation: '2026-01-10' };
      setFournisseur(mock);
      setFormData({ code_fournisseur: mock.code_fournisseur, nom: mock.nom, contact: mock.contact, telephone: mock.telephone, email: mock.email, adresse: mock.adresse, ville: mock.ville, pays: mock.pays, categorie: mock.categorie, delai_livraison: mock.delai_livraison.toString(), actif: mock.actif });
      setProduitsFournisseur([
        { id: 1, produit_id: 1, produit_nom: 'Carton 40x30', prix: 2.50, delai: 3 },
        { id: 2, produit_id: 2, produit_nom: 'Ruban adhésif', prix: 1.20, delai: 3 },
      ]);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!formData.nom || !formData.code_fournisseur) { setError('Nom et code requis'); return; }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess('Fournisseur créé');
      setTimeout(() => { setMode('list'); loadFournisseurs(); }, 1500);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess('Fournisseur mis à jour');
      setTimeout(() => { setMode('detail'); if (fournisseur) loadFournisseur(fournisseur.id); }, 1500);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce fournisseur ?')) return;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess('Fournisseur supprimé');
      setTimeout(() => { setMode('list'); loadFournisseurs(); }, 1500);
    } catch (err: any) { setError(err.message); }
  };

  const filteredFournisseurs = fournisseurs.filter(f =>
    f.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.code_fournisseur.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.ville.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(f => categorieFilter === 'all' || f.categorie === categorieFilter);

  const categories = [...new Set(fournisseurs.map(f => f.categorie))];

  if (loading && mode !== 'list') return <div className="flex justify-center h-64"><div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-50 p-4 rounded-lg flex justify-between"><div className="flex items-center"><AlertCircle className="w-5 h-5 text-red-600 mr-2" />{error}</div><button onClick={() => setError('')}><X /></button></div>}
      {success && <div className="bg-green-50 p-4 rounded-lg"><CheckCircle className="w-5 h-5 inline mr-2 text-green-600" />{success}</div>}

      {mode === 'list' && (
        <>
          <div className="flex justify-between"><div><h1 className="text-3xl font-bold">Fournisseurs</h1><p className="text-gray-600">Gestion des fournisseurs</p></div><Link href="/dashboard/logistique/fournisseurs?action=new" className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center"><Plus className="w-4 h-4 mr-2" />Nouveau fournisseur</Link></div>

          <div className="bg-white rounded-xl border p-4"><div className="flex gap-4"><div className="flex-1 relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" /></div><select value={categorieFilter} onChange={e => setCategorieFilter(e.target.value)} className="px-4 py-2 border rounded-lg"><option value="all">Toutes catégories</option>{categories.map(c => <option key={c}>{c}</option>)}</select></div></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{filteredFournisseurs.map(f => (<div key={f.id} className="bg-white rounded-xl border p-6 hover:shadow-lg"><div className="flex justify-between"><div className="flex items-center gap-3"><div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">{f.nom[0]}</div><div><h3 className="font-semibold">{f.nom}</h3><p className="text-sm text-gray-600">{f.code_fournisseur}</p></div></div><Link href={`/dashboard/logistique/fournisseurs?id=${f.id}`}><Eye className="w-4 h-4 text-blue-600" /></Link></div><div className="mt-4 space-y-2 text-sm"><div className="flex items-center"><Phone className="w-4 h-4 mr-2 text-gray-400" />{f.telephone}</div><div className="flex items-center"><Mail className="w-4 h-4 mr-2 text-gray-400" />{f.email}</div><div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-gray-400" />{f.ville}, {f.pays}</div></div><div className="mt-4 pt-4 border-t flex justify-between"><span className="text-sm">📦 Délai: {f.delai_livraison}j</span><span className="text-sm">⭐ {f.note}/5</span></div></div>))}</div>
        </>
      )}

      {(mode === 'detail' || mode === 'edit') && fournisseur && (
        <>
          <div className="flex justify-between"><div className="flex items-center gap-4"><button onClick={() => setMode('list')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft /></button><div><h1 className="text-3xl font-bold">{fournisseur.nom}</h1><p className="text-gray-600">{fournisseur.code_fournisseur}</p></div></div><div className="flex gap-2">{mode === 'detail' ? (<><button onClick={() => setMode('edit')} className="px-4 py-2 border rounded-lg"><Edit className="w-4 h-4 inline mr-2" />Modifier</button><button onClick={() => handleDelete(fournisseur.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg"><Trash2 className="w-4 h-4 inline mr-2" />Supprimer</button></>) : (<><button onClick={() => setMode('detail')}>Annuler</button><button onClick={handleUpdate}>Enregistrer</button></>)}</div></div>

          <div className="grid grid-cols-3 gap-6"><div className="col-span-2 bg-white rounded-xl border p-6">{mode === 'detail' ? (<div className="grid grid-cols-2 gap-4"><div><p className="text-sm text-gray-600">Contact</p><p className="font-medium">{fournisseur.contact}</p><p>{fournisseur.telephone}</p><p>{fournisseur.email}</p></div><div><p className="text-sm text-gray-600">Adresse</p><p>{fournisseur.adresse}</p><p>{fournisseur.ville}, {fournisseur.pays}</p></div><div><p className="text-sm text-gray-600">Catégorie</p><p>{fournisseur.categorie}</p></div><div><p className="text-sm text-gray-600">Délai livraison</p><p>{fournisseur.delai_livraison} jours</p></div><div><p className="text-sm text-gray-600">Note</p><p>⭐ {fournisseur.note}/5</p></div></div>) : (<div><input type="text" placeholder="Nom" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="text" placeholder="Contact" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="tel" placeholder="Téléphone" value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="text" placeholder="Adresse" value={formData.adresse} onChange={e => setFormData({...formData, adresse: e.target.value})} className="w-full mb-3 p-2 border rounded" /><div className="flex gap-3"><input type="text" placeholder="Ville" value={formData.ville} onChange={e => setFormData({...formData, ville: e.target.value})} className="flex-1 p-2 border rounded" /><input type="text" placeholder="Pays" value={formData.pays} onChange={e => setFormData({...formData, pays: e.target.value})} className="flex-1 p-2 border rounded" /></div><select value={formData.categorie} onChange={e => setFormData({...formData, categorie: e.target.value})} className="w-full mt-3 p-2 border rounded"><option>Emballage</option><option>Palette</option><option>Matière première</option></select><input type="number" placeholder="Délai livraison (jours)" value={formData.delai_livraison} onChange={e => setFormData({...formData, delai_livraison: e.target.value})} className="w-full mt-3 p-2 border rounded" /></div>)}</div>

            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white"><h3 className="text-lg font-semibold mb-4">Statistiques</h3><div className="space-y-3"><div><p className="text-blue-100">Produits fournis</p><p className="text-2xl font-bold">{produitsFournisseur.length}</p></div><div><p className="text-blue-100">Note moyenne</p><p className="text-2xl font-bold">{fournisseur.note}/5</p></div><div><p className="text-blue-100">Délai moyen</p><p className="text-2xl font-bold">{fournisseur.delai_livraison} jours</p></div></div></div></div>

          <div className="bg-white rounded-xl border p-6"><h2 className="text-lg font-semibold mb-4">Produits fournis</h2><table className="w-full"><thead><tr><th className="text-left">Produit</th><th className="text-left">Prix</th><th className="text-left">Délai</th></tr></thead><tbody>{produitsFournisseur.map(p => (<tr key={p.id}><td>{p.produit_nom}</td><td>{p.prix} €</td><td>{p.delai} jours</td></tr>))}</tbody></table></div>
        </>
      )}

      {mode === 'new' && (
        <>
          <div className="flex items-center gap-4"><button onClick={() => setMode('list')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft /></button><h1 className="text-3xl font-bold">Nouveau fournisseur</h1></div>
          <div className="bg-white rounded-xl border p-6"><div className="grid grid-cols-2 gap-4"><input type="text" placeholder="Code fournisseur *" value={formData.code_fournisseur} onChange={e => setFormData({...formData, code_fournisseur: e.target.value})} className="p-2 border rounded" /><input type="text" placeholder="Nom *" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} className="p-2 border rounded" /><input type="text" placeholder="Contact" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="p-2 border rounded" /><input type="tel" placeholder="Téléphone" value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} className="p-2 border rounded" /><input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="p-2 border rounded" /><input type="text" placeholder="Adresse" value={formData.adresse} onChange={e => setFormData({...formData, adresse: e.target.value})} className="p-2 border rounded" /><input type="text" placeholder="Ville" value={formData.ville} onChange={e => setFormData({...formData, ville: e.target.value})} className="p-2 border rounded" /><select value={formData.pays} onChange={e => setFormData({...formData, pays: e.target.value})} className="p-2 border rounded"><option>France</option><option>Belgique</option><option>Suisse</option></select><select value={formData.categorie} onChange={e => setFormData({...formData, categorie: e.target.value})} className="p-2 border rounded"><option>Emballage</option><option>Palette</option><option>Matière première</option></select><input type="number" placeholder="Délai livraison (jours)" value={formData.delai_livraison} onChange={e => setFormData({...formData, delai_livraison: e.target.value})} className="p-2 border rounded" /></div><div className="mt-6 flex justify-end gap-3"><button onClick={() => setMode('list')} className="px-4 py-2 border rounded">Annuler</button><button onClick={handleCreate} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Créer</button></div></div>
        </>
      )}
    </div>
  );
}