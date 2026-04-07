'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Plane, Hotel, Calendar, FileText, Search, Plus,
  Eye, Edit, Trash2, ArrowLeft, Save, X,
  AlertCircle, CheckCircle, Users, DollarSign,
  Clock, MapPin, Star, CreditCard, Passport,
  Briefcase, Heart, TrendingUp, Filter
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface Vol {
  id: number;
  code_vol: string;
  destination_id: number;
  destination_nom: string;
  compagnie: string;
  date_depart: string;
  date_arrivee: string;
  prix: number;
  places_disponibles: number;
}

interface Hotel {
  id: number;
  nom: string;
  destination_id: number;
  destination_nom: string;
  etoiles: number;
  prix_nuit: number;
  adresse: string;
  telephone: string;
}

interface Reservation {
  id: number;
  code_reservation: string;
  client_nom: string;
  destination_nom: string;
  vol_id: number;
  vol_code: string;
  hotel_id: number;
  hotel_nom: string;
  date_depart: string;
  date_retour: string;
  nombre_personnes: number;
  montant_total: number;
  statut: string;
  date_creation: string;
}

interface DossierVisa {
  id: number;
  numero_dossier: string;
  client_nom: string;
  type_demande: string;
  pays_destination: string;
  date_depot: string;
  statut: string;
}

interface Client {
  id: number;
  nom: string;
  prenom: string;
  email: string;
}

interface Destination {
  id: number;
  ville: string;
  pays: string;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function OffresPage() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'vols';
  const action = searchParams.get('action');
  const itemId = searchParams.get('id');

  // États
  const [vols, setVols] = useState<Vol[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [dossiers, setDossiers] = useState<DossierVisa[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [mode, setMode] = useState<'list' | 'detail' | 'new' | 'edit'>('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Formulaires
  const [volForm, setVolForm] = useState({
    code_vol: '', destination_id: '', compagnie: '', date_depart: '', date_arrivee: '', prix: '', places_disponibles: ''
  });
  const [hotelForm, setHotelForm] = useState({
    nom: '', destination_id: '', etoiles: '3', prix_nuit: '', adresse: '', telephone: ''
  });
  const [reservationForm, setReservationForm] = useState({
    client_id: '', destination_id: '', vol_id: '', hotel_id: '', date_depart: '', date_retour: '', nombre_personnes: '1'
  });
  const [dossierForm, setDossierForm] = useState({
    client_id: '', type_demande: 'VISA_TOURISTIQUE', pays_destination: '', date_depot: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      setVols([
        { id: 1, code_vol: 'AF1234', destination_id: 1, destination_nom: 'Paris', compagnie: 'Air France', date_depart: '2026-06-15T10:30:00', date_arrivee: '2026-06-15T18:30:00', prix: 450, places_disponibles: 120 },
        { id: 2, code_vol: 'LH5678', destination_id: 2, destination_nom: 'Berlin', compagnie: 'Lufthansa', date_depart: '2026-06-20T14:00:00', date_arrivee: '2026-06-20T22:00:00', prix: 380, places_disponibles: 85 },
      ]);
      setHotels([
        { id: 1, nom: 'Hilton Paris', destination_id: 1, destination_nom: 'Paris', etoiles: 5, prix_nuit: 250, adresse: 'Paris centre', telephone: '0123456789' },
        { id: 2, nom: 'Ibis Berlin', destination_id: 2, destination_nom: 'Berlin', etoiles: 3, prix_nuit: 80, adresse: 'Berlin centre', telephone: '0234567890' },
      ]);
      setReservations([
        { id: 1, code_reservation: 'RES-001', client_nom: 'Jean Konan', destination_nom: 'Paris', vol_id: 1, vol_code: 'AF1234', hotel_id: 1, hotel_nom: 'Hilton Paris', date_depart: '2026-06-15', date_retour: '2026-06-22', nombre_personnes: 2, montant_total: 2100, statut: 'CONFIRMEE', date_creation: '2026-03-20' },
      ]);
      setDossiers([
        { id: 1, numero_dossier: 'DOS-2024-001', client_nom: 'Jean Konan', type_demande: 'VISA_TOURISTIQUE', pays_destination: 'France', date_depot: '2026-03-01', statut: 'EN_INSTRUCTION' },
      ]);
      setClients([
        { id: 1, nom: 'Konan', prenom: 'Jean', email: 'jean@email.com' },
        { id: 2, nom: 'Diallo', prenom: 'Aminata', email: 'amina@email.com' },
      ]);
      setDestinations([
        { id: 1, ville: 'Paris', pays: 'France' },
        { id: 2, ville: 'Berlin', pays: 'Allemagne' },
      ]);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleCreateVol = async () => {
    if (!volForm.code_vol || !volForm.destination_id) { setError('Code vol et destination requis'); return; }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess('Vol créé');
      setTimeout(() => { setMode('list'); loadAllData(); }, 1500);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleCreateHotel = async () => {
    if (!hotelForm.nom || !hotelForm.destination_id) { setError('Nom et destination requis'); return; }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess('Hôtel créé');
      setTimeout(() => { setMode('list'); loadAllData(); }, 1500);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleCreateReservation = async () => {
    if (!reservationForm.client_id || !reservationForm.destination_id) { setError('Client et destination requis'); return; }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess('Réservation créée');
      setTimeout(() => { setMode('list'); loadAllData(); }, 1500);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleCreateDossier = async () => {
    if (!dossierForm.client_id || !dossierForm.type_demande) { setError('Client et type requis'); return; }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess('Dossier visa créé');
      setTimeout(() => { setMode('list'); loadAllData(); }, 1500);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const updateReservationStatut = async (id: number, statut: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setReservations(reservations.map(r => r.id === id ? { ...r, statut } : r));
      setSuccess(`Statut mis à jour: ${statut}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) { setError(err.message); }
  };

  const updateDossierStatut = async (id: number, statut: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setDossiers(dossiers.map(d => d.id === id ? { ...d, statut } : d));
      setSuccess(`Statut mis à jour: ${statut}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) { setError(err.message); }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'CONFIRMEE': return 'bg-green-100 text-green-700';
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-700';
      case 'ANNULEE': return 'bg-red-100 text-red-700';
      case 'ACCEPTE': return 'bg-green-100 text-green-700';
      case 'EN_INSTRUCTION': return 'bg-blue-100 text-blue-700';
      case 'REFUSE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredVols = (Array.isArray(vols) ? vols : []).filter(v => v.code_vol.includes(searchTerm) || v.compagnie.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredHotels = (Array.isArray(hotels) ? hotels : []).filter(h => h.nom.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredReservations = (Array.isArray(reservations) ? reservations : []).filter(r => r.code_reservation.includes(searchTerm) || r.client_nom.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredDossiers = (Array.isArray(dossiers) ? dossiers : []).filter(d => d.numero_dossier.includes(searchTerm) || d.client_nom.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading && mode !== 'list') return <div className="flex justify-center h-64"><div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-50 p-4 rounded-lg"><AlertCircle className="w-5 h-5 inline mr-2" />{error}</div>}
      {success && <div className="bg-green-50 p-4 rounded-lg"><CheckCircle className="w-5 h-5 inline mr-2 text-green-600" />{success}</div>}

      {mode === 'list' && (
        <>
          <div className="flex justify-between items-center">
            <div><h1 className="text-3xl font-bold">Offres et réservations</h1><p className="text-gray-600">Gestion des vols, hôtels, réservations et visas</p></div>
            <div className="flex gap-2">
              <Link href="/dashboard/voyage/offres?tab=vols&action=new" className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"><Plus className="w-4 h-4 inline mr-1" />Vol</Link>
              <Link href="/dashboard/voyage/offres?tab=hotels&action=new" className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm"><Plus className="w-4 h-4 inline mr-1" />Hôtel</Link>
              <Link href="/dashboard/voyage/offres?tab=reservations&action=new" className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm"><Plus className="w-4 h-4 inline mr-1" />Réservation</Link>
              <Link href="/dashboard/voyage/offres?tab=dossiers&action=new" className="px-3 py-2 bg-orange-600 text-white rounded-lg text-sm"><Plus className="w-4 h-4 inline mr-1" />Visa</Link>
            </div>
          </div>

          {/* Onglets */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-8">
              <Link href="/dashboard/voyage/offres?tab=vols" className={`py-2 px-1 border-b-2 ${activeTab === 'vols' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}><Plane className="w-4 h-4 inline mr-2" />Vols ({vols.length})</Link>
              <Link href="/dashboard/voyage/offres?tab=hotels" className={`py-2 px-1 border-b-2 ${activeTab === 'hotels' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}><Hotel className="w-4 h-4 inline mr-2" />Hôtels ({hotels.length})</Link>
              <Link href="/dashboard/voyage/offres?tab=reservations" className={`py-2 px-1 border-b-2 ${activeTab === 'reservations' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}><Calendar className="w-4 h-4 inline mr-2" />Réservations ({reservations.length})</Link>
              <Link href="/dashboard/voyage/offres?tab=dossiers" className={`py-2 px-1 border-b-2 ${activeTab === 'dossiers' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}><FileText className="w-4 h-4 inline mr-2" />Visas ({dossiers.length})</Link>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="bg-white rounded-xl border p-4"><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" /></div></div>

          {/* Contenu selon onglet */}
          {activeTab === 'vols' && (
            <div className="bg-white rounded-xl border overflow-hidden"><table className="w-full"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left">Code</th><th>Destination</th><th>Compagnie</th><th>Départ</th><th>Prix</th><th>Places</th><th>Actions</th></tr></thead><tbody>{filteredVols.map(v => (<tr key={v.id} className="hover:bg-gray-50"><td className="px-6 py-4 font-mono">{v.code_vol}</td><td>{v.destination_nom}</td><td>{v.compagnie}</td><td>{new Date(v.date_depart).toLocaleString()}</td><td>{v.prix} €</td><td>{v.places_disponibles}</td><td><button className="text-blue-600"><Eye className="w-4 h-4" /></button></td></tr>))}</tbody></table></div>
          )}

          {activeTab === 'hotels' && (
            <div className="bg-white rounded-xl border overflow-hidden"><table className="w-full"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left">Nom</th><th>Destination</th><th>Étoiles</th><th>Prix nuit</th><th>Actions</th></tr></thead><tbody>{filteredHotels.map(h => (<tr key={h.id} className="hover:bg-gray-50"><td>{h.nom}</td><td>{h.destination_nom}</td><td>{"⭐".repeat(h.etoiles)}</td><td>{h.prix_nuit} €</td><td><button className="text-blue-600"><Eye className="w-4 h-4" /></button></td></tr>))}</tbody></table></div>
          )}

          {activeTab === 'reservations' && (
            <div className="bg-white rounded-xl border overflow-hidden"><table className="w-full"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left">Code</th><th>Client</th><th>Destination</th><th>Dates</th><th>Montant</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{filteredReservations.map(r => (<tr key={r.id} className="hover:bg-gray-50"><td className="font-mono">{r.code_reservation}</td><td>{r.client_nom}</td><td>{r.destination_nom}</td><td>{new Date(r.date_depart).toLocaleDateString()} → {new Date(r.date_retour).toLocaleDateString()}</td><td>{r.montant_total} €</td><td><select value={r.statut} onChange={e => updateReservationStatut(r.id, e.target.value)} className={`px-2 py-1 rounded-full text-xs border-0 ${getStatutColor(r.statut)}`}><option>CONFIRMEE</option><option>EN_ATTENTE</option><option>ANNULEE</option></select></td><td><button className="text-blue-600"><Eye className="w-4 h-4" /></button></td></tr>))}</tbody></table></div>
          )}

          {activeTab === 'dossiers' && (
            <div className="bg-white rounded-xl border overflow-hidden"><table className="w-full"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left">N° Dossier</th><th>Client</th><th>Type</th><th>Pays</th><th>Date dépôt</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{filteredDossiers.map(d => (<tr key={d.id} className="hover:bg-gray-50"><td className="font-mono">{d.numero_dossier}</td><td>{d.client_nom}</td><td>{d.type_demande}</td><td>{d.pays_destination}</td><td>{new Date(d.date_depot).toLocaleDateString()}</td><td><select value={d.statut} onChange={e => updateDossierStatut(d.id, e.target.value)} className={`px-2 py-1 rounded-full text-xs border-0 ${getStatutColor(d.statut)}`}><option>EN_COURS</option><option>COMPLET</option><option>EN_INSTRUCTION</option><option>ACCEPTE</option><option>REFUSE</option></select></td><td><button className="text-blue-600"><Eye className="w-4 h-4" /></button></td></tr>))}</tbody></table></div>
          )}
        </>
      )}

      {/* FORMULAIRES DE CRÉATION */}
      {mode === 'new' && (
        <>
          <div className="flex items-center gap-4"><button onClick={() => setMode('list')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft /></button><h1 className="text-3xl font-bold">Nouveau {activeTab === 'vols' ? 'vol' : activeTab === 'hotels' ? 'hôtel' : activeTab === 'reservations' ? 'réservation' : 'dossier visa'}</h1></div>

          <div className="bg-white rounded-xl border p-6">
            {activeTab === 'vols' && (
              <div className="grid grid-cols-2 gap-4"><input type="text" placeholder="Code vol *" value={volForm.code_vol} onChange={e => setVolForm({...volForm, code_vol: e.target.value})} className="p-2 border rounded" /><select value={volForm.destination_id} onChange={e => setVolForm({...volForm, destination_id: e.target.value})} className="p-2 border rounded"><option value="">Destination *</option>{destinations.map(d => <option key={d.id} value={d.id}>{d.ville} ({d.pays})</option>)}</select><input type="text" placeholder="Compagnie" value={volForm.compagnie} onChange={e => setVolForm({...volForm, compagnie: e.target.value})} className="p-2 border rounded" /><input type="datetime-local" value={volForm.date_depart} onChange={e => setVolForm({...volForm, date_depart: e.target.value})} className="p-2 border rounded" /><input type="datetime-local" value={volForm.date_arrivee} onChange={e => setVolForm({...volForm, date_arrivee: e.target.value})} className="p-2 border rounded" /><input type="number" placeholder="Prix" value={volForm.prix} onChange={e => setVolForm({...volForm, prix: e.target.value})} className="p-2 border rounded" /><input type="number" placeholder="Places disponibles" value={volForm.places_disponibles} onChange={e => setVolForm({...volForm, places_disponibles: e.target.value})} className="p-2 border rounded" /><div className="col-span-2 flex justify-end gap-3 pt-4"><button onClick={() => setMode('list')} className="px-4 py-2 border rounded">Annuler</button><button onClick={handleCreateVol} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Créer</button></div></div>
            )}

            {activeTab === 'hotels' && (
              <div className="grid grid-cols-2 gap-4"><input type="text" placeholder="Nom hôtel *" value={hotelForm.nom} onChange={e => setHotelForm({...hotelForm, nom: e.target.value})} className="p-2 border rounded" /><select value={hotelForm.destination_id} onChange={e => setHotelForm({...hotelForm, destination_id: e.target.value})} className="p-2 border rounded"><option value="">Destination *</option>{destinations.map(d => <option key={d.id} value={d.id}>{d.ville} ({d.pays})</option>)}</select><select value={hotelForm.etoiles} onChange={e => setHotelForm({...hotelForm, etoiles: e.target.value})} className="p-2 border rounded"><option value="1">1 étoile</option><option value="2">2 étoiles</option><option value="3">3 étoiles</option><option value="4">4 étoiles</option><option value="5">5 étoiles</option></select><input type="number" placeholder="Prix par nuit" value={hotelForm.prix_nuit} onChange={e => setHotelForm({...hotelForm, prix_nuit: e.target.value})} className="p-2 border rounded" /><input type="text" placeholder="Adresse" value={hotelForm.adresse} onChange={e => setHotelForm({...hotelForm, adresse: e.target.value})} className="p-2 border rounded" /><input type="text" placeholder="Téléphone" value={hotelForm.telephone} onChange={e => setHotelForm({...hotelForm, telephone: e.target.value})} className="p-2 border rounded" /><div className="col-span-2 flex justify-end gap-3 pt-4"><button onClick={() => setMode('list')} className="px-4 py-2 border rounded">Annuler</button><button onClick={handleCreateHotel} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Créer</button></div></div>
            )}

            {activeTab === 'reservations' && (
              <div className="grid grid-cols-2 gap-4"><select value={reservationForm.client_id} onChange={e => setReservationForm({...reservationForm, client_id: e.target.value})} className="p-2 border rounded"><option value="">Client *</option>{clients.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}</select><select value={reservationForm.destination_id} onChange={e => setReservationForm({...reservationForm, destination_id: e.target.value})} className="p-2 border rounded"><option value="">Destination *</option>{destinations.map(d => <option key={d.id} value={d.id}>{d.ville} ({d.pays})</option>)}</select><select value={reservationForm.vol_id} onChange={e => setReservationForm({...reservationForm, vol_id: e.target.value})} className="p-2 border rounded"><option value="">Vol (optionnel)</option>{vols.map(v => <option key={v.id} value={v.id}>{v.code_vol} - {v.compagnie} ({v.prix}€)</option>)}</select><select value={reservationForm.hotel_id} onChange={e => setReservationForm({...reservationForm, hotel_id: e.target.value})} className="p-2 border rounded"><option value="">Hôtel (optionnel)</option>{hotels.map(h => <option key={h.id} value={h.id}>{h.nom} - {h.prix_nuit}€/nuit</option>)}</select><input type="date" value={reservationForm.date_depart} onChange={e => setReservationForm({...reservationForm, date_depart: e.target.value})} className="p-2 border rounded" /><input type="date" value={reservationForm.date_retour} onChange={e => setReservationForm({...reservationForm, date_retour: e.target.value})} className="p-2 border rounded" /><input type="number" placeholder="Nombre de personnes" value={reservationForm.nombre_personnes} onChange={e => setReservationForm({...reservationForm, nombre_personnes: e.target.value})} className="p-2 border rounded" /><div className="col-span-2 flex justify-end gap-3 pt-4"><button onClick={() => setMode('list')} className="px-4 py-2 border rounded">Annuler</button><button onClick={handleCreateReservation} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Créer</button></div></div>
            )}

            {activeTab === 'dossiers' && (
              <div className="grid grid-cols-2 gap-4"><select value={dossierForm.client_id} onChange={e => setDossierForm({...dossierForm, client_id: e.target.value})} className="p-2 border rounded"><option value="">Client *</option>{clients.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}</select><select value={dossierForm.type_demande} onChange={e => setDossierForm({...dossierForm, type_demande: e.target.value})} className="p-2 border rounded"><option value="VISA_TOURISTIQUE">Visa touristique</option><option value="VISA_ETUDIANT">Visa étudiant</option><option value="VISA_TRAVAIL">Visa travail</option></select><input type="text" placeholder="Pays de destination" value={dossierForm.pays_destination} onChange={e => setDossierForm({...dossierForm, pays_destination: e.target.value})} className="p-2 border rounded" /><input type="date" value={dossierForm.date_depot} onChange={e => setDossierForm({...dossierForm, date_depot: e.target.value})} className="p-2 border rounded" /><div className="col-span-2 flex justify-end gap-3 pt-4"><button onClick={() => setMode('list')} className="px-4 py-2 border rounded">Annuler</button><button onClick={handleCreateDossier} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Créer</button></div></div>
            )}
          </div>
        </>
      )}
    </div>
  );
}