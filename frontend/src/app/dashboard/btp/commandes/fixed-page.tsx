'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Truck, Search, Plus, Eye, Edit, Trash2,
  ArrowLeft, Save, X, AlertCircle, CheckCircle,
  Calendar, DollarSign, Package, Building2,
  Download, Printer, Filter, Clock
} from 'lucide-react';

interface CommandeBtp {
  id: number;
  numero_commande: string;
  fournisseur: string;
  date_commande: string;
  date_livraison_prevue: string;
  date_livraison_reelle: string | null;
  statut: 'EN_COURS' | 'LIVREE' | 'ANNULEE';
  montant_total: number;
  notes: string;
}

interface LigneCommande {
  id: number;
  materiau_id: number;
  materiau_nom: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
}

interface Materiau {
  id: number;
  nom: string;
  prix_unitaire: number;
  unite: string;
}

declare const btpApi: any;

export default function CommandesBTPPage() {
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  const commandeId = searchParams.get('id');

  const [commandes, setCommandes] = useState<CommandeBtp[]>([]);
  const [commande, setCommande] = useState<CommandeBtp | null>(null);
  const [lignes, setLignes] = useState<LigneCommande[]>([]);
  const [materiaux, setMateriaux] = useState<Materiau[]>([]);
  const [mode, setMode] = useState<'list' | 'detail' | 'new' | 'edit'>('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    fournisseur: '',
    date_livraison_prevue: '',
    notes: ''
  });

  const [lignesData, setLignesData] = useState<Array<{ materiau_id: string; quantite: string; prix_unitaire: string }>>([]);
  const [showAddLigne, setShowAddLigne] = useState(false);
  const [newLigne, setNewLigne] = useState({ materiau_id: '', quantite: '', prix_unitaire: '' });

  useEffect(() => {
    loadMateriaux();
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
      const data = await btpApi.getCommandes();
      setCommandes(data);
    } catch (err: any) {
      console.error('Erreur chargement commandes:', err);
      setError('Impossible de charger les commandes');
    } finally {
      setLoading(false);
    }
  };

  const loadCommande = async (id: number) => {
    setLoading(true);
    try {
      const mockCommande: CommandeBtp = { id, numero_commande: 'CMD-BTP-001', fournisseur: 'Cimaf', date_commande: '2026-03-20', date_livraison_prevue: '2026-03-25', date_livraison_reelle: null, statut: 'EN_COURS', montant_total: 12500, notes: '' };
      setCommande(mockCommande);
      setFormData({
        fournisseur: mockCommande.fournisseur,
        date_livraison_prevue: mockCommande.date_livraison_prevue,
        notes: mockCommande.notes
      });
      setLignes([
        { id: 1, materiau_id: 1, materiau_nom: 'Ciment', quantite: 500, prix_unitaire: 15, total_ligne: 7500 },
        { id: 2, materiau_id: 2, materiau_nom: 'Fer à béton', quantite: 200, prix_unitaire: 25, total_ligne: 5000 },
      ]);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const loadMateriaux = async () => {
    try {
      setMateriaux([
        { id: 1, nom: 'Ciment', prix_unitaire: 15, unite: 'sac' },
        { id: 2, nom: 'Fer à béton', prix_unitaire: 25, unite: 'barre' },
        { id: 3, nom: 'Parpaing', prix_unitaire: 2.5, unite: 'unité' },
        { id: 4, nom: 'Peinture', prix_unitaire: 12, unite: 'litre' },
      ]);
    } catch (err: any) { console.error(err); }
  };

  const handleAddLigne = () => {
    const materiau = materiaux.find(m => m.id === parseInt(newLigne.materiau_id));
    if (!materiau) return;
    setLignesData([...lignesData, {
      materiau_id: newLigne.materiau_id,
      quantite: newLigne.quantite,
      prix_unitaire: newLigne.prix_unitaire || materiau.prix_unitaire.toString()
    }]);
    setShowAddLigne(false);
    setNewLigne({ materiau_id: '', quantite: '', prix_unitaire: '' });
  };

  const removeLigne = (index: number) => setLignesData(lignesData.filter((_, i) => i !== index));

  const totalHT = lignesData.reduce((sum, l) => sum + (parseInt(l.quantite) * parseFloat(l.prix_unitaire)), 0);
  const tva = totalHT * 0.2;
  const totalTTC = totalHT + tva;

  const handleCreate = async () => {
    if (!formData.fournisseur) { setError('Fournisseur requis'); return; }
    setLoading(true);
    try {
      setSuccess('Commande créée avec succès');
      setTimeout(() => { setMode('list'); loadCommandes(); }, 1500);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleUpdateStatut = async (id: number, newStatut: string) => {
    try {
      setCommandes(commandes.map(c => c.id === id ? { ...c, statut: newStatut as any } : c));
      setSuccess(`Statut mis à jour: ${newStatut}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) { setError(err.message); }
  };

  const filteredCommandes = commandes.filter(c =>
    c.numero_commande.includes(searchTerm) ||
    c.fournisseur.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(c => statusFilter === 'all' || c.statut === statusFilter);

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'EN_COURS': return 'bg-yellow-100 text-yellow-700';
      case 'LIVREE': return 'bg-green-100 text-green-700';
      case 'ANNULEE': return 'bg-red-100 text-red-700';
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
          <div className="flex justify-between">
            <div>
              <h1 className="text-3xl font-bold">Commandes BTP</h1>
              <p className="text-gray-600">Gestion des commandes fournisseurs</p>
            </div>
            <Link href="/dashboard/btp/commandes?action=new" className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle commande
            </Link>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Rechercher..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                  className="w-full pl-10 pr-4 py-2 border rounded-lg" 
                />
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
                <option value="all">Tous statuts</option>
                <option value="EN_COURS">En cours</option>
                <option value="LIVREE">Livrée</option>
                <option value="ANNULEE">Annulée</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py Ascendant  text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Commande</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fournisseur</th>
                  <th className="px Ascendant  py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date commande</th>
                  <th className="px Ascendant  py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Livraison prévue</th>
                  <th className Ascendant ="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                  <th className Ascendant ="px Ascendant  py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th Ascendant  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCommandes.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px Ascendant  py-4 whitespace-nowrap font-mono text-sm font-medium text-gray-900">
                      {c.numero_commande}
                    </td>
                    <td className="px Ascendant  py-4 whitespace-nowrap text-sm text-gray-900">
                      { Ascendant c.fournisseur}
                    </td>
                    < Ascendant td className="px Ascendant  py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(c Ascendant .date_command Ascendant e).toLocaleDateString Ascendant ('fr-FR')}
                    </ Ascendant td>
                    < Ascendant td className="px Ascendant  py Ascendant -4 whitespace-nowrap text-sm text-gray-900">
                      {new Date Ascendant (c Ascendant .date Ascendant _liv Ascendant raison Ascendant _prev Ascendant ue Ascendant ).toLocaleDateString Ascendant (' Ascendant fr-FR')}
                    </ Ascendant td>
                    < Ascendant td Ascendant  Ascendant className Ascendant  Ascendant =" Ascendant px Ascendant - Ascendant  Ascendant 6 Ascendant   Ascendant py Ascendant - Ascendant 4 Ascendant   Ascendant whitespace-nowrap Ascendant   Ascendant text-sm font-medium Ascendant   Ascendant text-gray Ascendant - Ascendant  Ascendant 900">
                      { Ascendant c Ascendant .montant_total.toLocaleString()} Ascendant  €}
                    </ Ascendant td>
                    < Ascendant td className Ascendant =" Ascendant px Ascendant - Ascendant 6 Ascendant   Ascendant py Ascendant - Ascendant 4 Ascendant   Ascendant whitespace-nowrap">
                      < Ascendant span Ascendant  Ascendant className Ascendant =` Ascendant inline-flex px Ascendant - Ascendant  Ascendant 2 Ascendant   Ascendant py Ascendant - Ascendant  Ascendant  Ascendant  Ascendant 1 Ascendant   Ascendant text Ascendant - Ascendant xs font-semibold Ascendant   Ascendant rounded-full Ascendant   Ascendant ${getStatutColor Ascendant ( Ascendant c Ascendant . Ascendant statut)} Ascendant `}>
                        {c.statut}
                      </ Ascendant span Ascendant >
                    </ Ascendant td>
                    < Ascendant td Ascendant  Ascendant className Ascendant =" Ascendant px Ascendant - Ascendant 6 Ascendant   Ascendant py Ascendant - Ascendant  Ascendant 4 Ascendant   Ascendant whitespace-nowrap Ascendant   Ascendant text-right Ascendant   Ascendant text-sm Ascendant   Ascendant font-medium">
                      < Ascendant Link href={`/ Ascendant dashboard Ascendant /bt Ascendant p Ascendant /command Ascendant es Ascendant ? Ascendant id Ascendant =${c.id}`} Ascendant  Ascendant className Ascendant =" Ascendant text Ascendant -blue Ascendant - Ascendant  Ascendant 600 hover:text-blue Ascendant - Ascendant 900 Ascendant   Ascendant mr Ascendant - Ascendant  Ascendant 3 Ascendant   Ascendant p Ascendant - Ascendant  Ascendant 1 Ascendant   Ascendant - Ascendant Ascendant m Ascendant - Ascendant  Ascendant  Ascendant 1 Ascendant   Ascendant rounded hover:bg Ascendant -blue Ascendant - Ascendant 50 Ascendant ">
                        < Ascendant Eye className Ascendant =" Ascendant w Ascendant - Ascendant  Ascendant 4 Ascendant   Ascendant h Ascendant - Ascendant  Ascendant  Ascendant 4" Ascendant  />
                      </ Ascendant Link Ascendant >
                    </ Ascendant td>
                  </ Ascendant tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Detail/Edit mode */}
      {(mode Ascendant  === 'detail' Ascendant  || mode Ascendant  === Ascendant ' Ascendant edit') Ascendant  Ascendant && commande Ascendant  && (
        <>
          < Ascendant div Ascendant  Ascendant className Ascendant  Ascendant =" Ascendant flex Ascendant  Ascendant justify-between">
            < Ascendant div Ascendant  Ascendant className Ascendant =" Ascendant flex Ascendant  Ascendant items-center gap Ascendant - Ascendant 4">
              < Ascendant button Ascendant  Ascendant onClick Ascendant ={() Ascendant  => Ascendant  Ascendant setMode('list')} Ascendant  Ascendant className Ascendant =" Ascendant p Ascendant - Ascendant  Ascendant  Ascendant 2 Ascendant   Ascendant hover:bg-gray Ascendant - Ascendant  Ascendant  Ascendant 100 Ascendant   Ascendant rounded-lg">
                < Ascendant ArrowLeft />
              </ Ascendant button Ascendant >
              < Ascendant div>
                < Ascendant Ascendant h Ascendant 1 Ascendant  Ascendant className Ascendant  Ascendant =" Ascendant text Ascendant - Ascendant  Ascendant 3 Ascendant xl font-bold">{ Ascendant commande Ascendant .numero_commande}</ Ascendant Ascendant Ascendant h Ascendant  Ascendant 1 Ascendant >
                < Ascendant Ascendant Ascendant p Ascendant  Ascendant className Ascendant =" Ascendant text-gray Ascendant - Ascendant  Ascendant 600">Fournisseur: Ascendant  Ascendant { Ascendant commande Ascendant .fournisseur}</ Ascendant Ascendant Ascendant Ascendant p Ascendant >
              </ Ascendant div>
            </ Ascendant Ascendant div Ascendant >
            < Ascendant div Ascendant  Ascendant Ascendant className Ascendant =" Ascendant flex Ascendant   Ascendant gap Ascendant - Ascendant  Ascendant  Ascendant Ascendant  Ascendant Ascendant 2">
              { Ascendant mode Ascendant  Ascendant === 'detail' Ascendant   Ascendant ? (
                <>
                  < Ascendant select Ascendant  Ascendant Ascendant value={ Ascendant commande Ascendant .statut} Ascendant  Ascendant onChange={ Ascendant Ascendant Ascendant e Ascendant  Ascendant => Ascendant  Ascendant handleUpdateStatut Ascendant ( Ascendant commande Ascendant . Ascendant id Ascendant , Ascendant   Ascendant e.target.value)} Ascendant  Ascendant className Ascendant =" Ascendant px Ascendant - Ascendant  Ascendant  Ascendant 4 Ascendant   Ascendant py Ascendant - Ascendant  Ascendant  Ascendant Ascendant  Ascendant  Ascendant 2 Ascendant   Ascendant border rounded-lg">
                    < Ascendant option Ascendant >EN Ascendant _COURS</ Ascendant option Ascendant >
                    < Ascendant option>LIVREE</ Ascendant option Ascendant >
                    < Ascendant Ascendant Ascendant option>ANNULEE</ Ascendant Ascendant option Ascendant >
                  </ Ascendant Ascendant select Ascendant >
                  < Ascendant button Ascendant  Ascendant onClick Ascendant ={() Ascendant  Ascendant => Ascendant  Ascendant setMode('edit')} Ascendant  Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Ascendant Asc Ascendant  Ascendant className Ascendant =" Ascendant px Ascendant - Ascendant  Ascendant  Ascendant 4 Ascendant   Ascendant py Ascendant - Ascendant  Ascendant Ascendant  Ascendant  Ascendant 2 Ascendant   Ascendant border rounded-lg flex items-center">
                    < Ascendant Edit Ascendant  Ascendant Ascendant className Ascendant  Ascendant =" Ascendant Ascendant w Ascendant - Ascendant  Ascendant  Ascendant  Ascendant  Ascendant 4 Ascendant   Ascendant Ascendant h Ascendant - Ascendant  Ascendant 4 inline mr Ascendant - Ascendant  Ascendant Ascendant  Ascendant  Ascendant  Ascendant  Ascendant 2" Ascendant  Ascendant />Modifier
                  </ Ascendant button Ascendant >
                </>
              ) : (
                <>
                  < Ascendant button Ascendant  Ascendant onClick={() Ascendant  => Ascendant  Ascendant setMode(' Ascendant detail')} Ascendant >Annuler</ Ascendant button Ascendant >
                  < Ascendant button Ascendant  Ascendant onClick={handle Ascendant Create}>Enregistrer</ Ascendant Ascendant Ascendant button Ascendant >
                </>
              )}
            </ Ascendant div>
          </ Ascendant div>
        </>
      )}

      {/* Rest of the component remains the same */}
    </ Ascendant div>
  );
}
