'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Globe, Search, Plus, Eye, Edit, Trash2,
  ArrowLeft, Save, X, AlertCircle, CheckCircle,
  MapPin, Plane, Hotel, Calendar, DollarSign,
  TrendingUp, Sun, Snowflake
} from 'lucide-react';
import { voyageApi } from '@/services/api/voyage.api';

interface Destination {
  id: number;
  code_destination: string;
  pays: string;
  ville: string;
  aeroport_code: string;
  description: string;
  saison_haute: string;
  visa_requis: boolean;
  prix_moyen: number;
  date_creation: string;
}

interface Vol {
  id: number;
  code_vol: string;
  compagnie: string;
  prix: number;
}

interface Hotel {
  id: number;
  nom: string;
  etoiles: number;
  prix_nuit: number;
}

export default function DestinationsPage() {
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  const destId = searchParams.get('id');

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [vols, setVols] = useState<Vol[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [mode, setMode] = useState<'list' | 'detail' | 'new' | 'edit'>('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    code_destination: '',
    pays: '',
    ville: '',
    aeroport_code: '',
    description: '',
    saison_haute: '',
    visa_requis: false,
    prix_moyen: ''
  });

  useEffect(() => {
    if (action === 'new') setMode('new');
    else if (destId) { setMode('detail'); loadDestination(parseInt(destId)); }
    else loadDestinations();
  }, [action, destId]);

  const loadDestinations = async () => {
    setLoading(true);
    try {
      const destinationsData = await voyageApi.getDestinations();
      setDestinations((destinationsData as any[]).map((destination) => ({
        ...destination,
        code_destination: destination.code_destination || `DEST-${String(destination.id).padStart(4, '0')}`,
        description: destination.description || '',
        saison_haute: destination.saison_haute || '',
        visa_requis: Boolean(destination.visa_requis),
        prix_moyen: Number(destination.prix_moyen || 0),
        date_creation: destination.date_creation || new Date().toISOString()
      })));
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const loadDestination = async (id: number) => {
    setLoading(true);
    try {
      const [destinationsData, volsData, hotelsData] = await Promise.all([
        voyageApi.getDestinations(),
        voyageApi.getVols(),
        voyageApi.getHotels()
      ]);
      const selectedDestination = (destinationsData as any[]).find((item) => item.id === id);
      if (!selectedDestination) {
        throw new Error('Destination introuvable');
      }
      const normalized = {
        ...selectedDestination,
        code_destination: selectedDestination.code_destination || `DEST-${String(selectedDestination.id).padStart(4, '0')}`,
        description: selectedDestination.description || '',
        saison_haute: selectedDestination.saison_haute || '',
        visa_requis: Boolean(selectedDestination.visa_requis),
        prix_moyen: Number(selectedDestination.prix_moyen || 0),
        date_creation: selectedDestination.date_creation || new Date().toISOString()
      };
      setDestination(normalized as Destination);
      setFormData({
        code_destination: normalized.code_destination,
        pays: normalized.pays,
        ville: normalized.ville,
        aeroport_code: normalized.aeroport_code || '',
        description: normalized.description,
        saison_haute: normalized.saison_haute,
        visa_requis: normalized.visa_requis,
        prix_moyen: String(normalized.prix_moyen)
      });
      setVols((volsData as Vol[]).filter((item: any) => item.destination_id === id));
      setHotels((hotelsData as Hotel[]).filter((item: any) => item.destination_id === id));
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!formData.pays || !formData.ville) { setError('Pays et ville requis'); return; }
    setLoading(true);
    try {
      await voyageApi.createDestination({
        pays: formData.pays,
        ville: formData.ville,
        aeroport_code: formData.aeroport_code,
        description: formData.description,
        saison_haute: formData.saison_haute,
        visa_requis: formData.visa_requis,
        prix_moyen: Number(formData.prix_moyen || 0)
      });
      setSuccess('Destination créée');
      setTimeout(() => { setMode('list'); loadDestinations(); }, 1500);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleUpdate = async () => {
    if (!formData.pays || !formData.ville) { setError('Pays et ville requis'); return; }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess('Destination mis à jour');
      setMode('detail');
      setTimeout(() => { loadDestinations(); }, 1500);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr?')) return;
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess('Destination supprimée');
      setTimeout(() => { setMode('list'); loadDestinations(); }, 1500);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const filteredDestinations = destinations.filter(d =>
    d.pays.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.ville.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.code_destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-50 p-4 rounded-lg"><AlertCircle className="w-5 h-5 inline mr-2" />{error}</div>}
      {success && <div className="bg-green-50 p-4 rounded-lg"><CheckCircle className="w-5 h-5 inline mr-2 text-green-600" />{success}</div>}

      {mode === 'list' && (
        <>
          <div className="flex justify-between"><div><h1 className="text-3xl font-bold">Destinations</h1><p className="text-gray-600">Gestion des destinations touristiques</p></div><Link href="/dashboard/voyage/destinations?action=new" className="px-4 py-2 bg-blue-600 text-white rounded-lg"><Plus className="w-4 h-4 mr-2" />Nouvelle destination</Link></div>

          <div className="bg-white rounded-xl border p-4"><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" /></div></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{filteredDestinations.map(d => (<div key={d.id} className="bg-white rounded-xl border p-6 hover:shadow-lg"><div className="flex justify-between"><div className="flex items-center gap-3"><div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white"><Globe className="w-6 h-6" /></div><div><h3 className="font-semibold">{d.ville}</h3><p className="text-sm text-gray-600">{d.pays}</p></div></div><Link href={`/dashboard/voyage/destinations?id=${d.id}`}><Eye className="w-4 h-4 text-blue-600" /></Link></div><div className="mt-4 space-y-2 text-sm"><div className="flex items-center"><Plane className="w-4 h-4 mr-2 text-gray-400" />Aéroport: {d.aeroport_code}</div><div className="flex items-center"><DollarSign className="w-4 h-4 mr-2 text-gray-400" />Prix moyen: {d.prix_moyen} €</div><div className="flex items-center">{d.visa_requis ? <AlertCircle className="w-4 h-4 mr-2 text-red-500" /> : <CheckCircle className="w-4 h-4 mr-2 text-green-500" />}{d.visa_requis ? 'Visa requis' : 'Visa non requis'}</div></div></div>))}</div>
        </>
      )}

      {(mode === 'detail' || mode === 'edit') && destination && (
        <>
          <div className="flex justify-between"><div className="flex items-center gap-4"><button onClick={() => setMode('list')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft /></button><div><h1 className="text-3xl font-bold">{destination.ville}</h1><p className="text-gray-600">{destination.pays}</p></div></div><div className="flex gap-2">{mode === 'detail' ? (<><button onClick={() => setMode('edit')} className="px-4 py-2 border rounded-lg"><Edit className="w-4 h-4 inline mr-2" />Modifier</button></>) : (<><button onClick={() => setMode('detail')}>Annuler</button><button onClick={handleUpdate}>Enregistrer</button></>)}</div></div>

          <div className="grid grid-cols-3 gap-6"><div className="col-span-2 bg-white rounded-xl border p-6">{mode === 'detail' ? (<div className="grid grid-cols-2 gap-4"><div><p className="text-sm text-gray-600">Code</p><p>{destination.code_destination}</p></div><div><p className="text-sm text-gray-600">Aéroport</p><p>{destination.aeroport_code}</p></div><div><p className="text-sm text-gray-600">Saison haute</p><p>{destination.saison_haute}</p></div><div><p className="text-sm text-gray-600">Prix moyen</p><p>{destination.prix_moyen} €</p></div><div className="col-span-2"><p className="text-sm text-gray-600">Description</p><p>{destination.description}</p></div></div>) : (<div><input type="text" placeholder="Pays" value={formData.pays} onChange={e => setFormData({...formData, pays: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="text" placeholder="Ville" value={formData.ville} onChange={e => setFormData({...formData, ville: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="text" placeholder="Code aéroport" value={formData.aeroport_code} onChange={e => setFormData({...formData, aeroport_code: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="text" placeholder="Saison haute" value={formData.saison_haute} onChange={e => setFormData({...formData, saison_haute: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="number" placeholder="Prix moyen" value={formData.prix_moyen} onChange={e => setFormData({...formData, prix_moyen: e.target.value})} className="w-full mb-3 p-2 border rounded" /><label className="flex items-center"><input type="checkbox" checked={formData.visa_requis} onChange={e => setFormData({...formData, visa_requis: e.target.checked})} className="mr-2" />Visa requis</label><textarea placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} className="w-full mt-3 p-2 border rounded" /></div>)}</div>

            <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-xl p-6 text-white"><h3 className="text-lg font-semibold mb-4">Informations</h3><div><p className="text-green-100">Vols disponibles</p><p className="text-2xl font-bold">{vols.length}</p></div><div className="mt-4"><p className="text-green-100">Hôtels disponibles</p><p className="text-2xl font-bold">{hotels.length}</p></div></div></div>

          <div className="bg-white rounded-xl border p-6"><h2 className="text-lg font-semibold mb-4">Vols disponibles</h2><table className="w-full"><thead><tr><th>Code</th><th>Compagnie</th><th>Prix</th><th>Actions</th></tr></thead><tbody>{vols.map(v => (<tr key={v.id}><td>{v.code_vol}</td><td>{v.compagnie}</td><td>{v.prix} €</td><td><Link href={`/dashboard/voyage/vols?id=${v.id}`}><Eye className="w-4 h-4 text-blue-600" /></Link></td></tr>))}</tbody></table></div>

          <div className="bg-white rounded-xl border p-6"><h2 className="text-lg font-semibold mb-4">Hôtels disponibles</h2><table className="w-full"><thead><tr><th>Nom</th><th>Étoiles</th><th>Prix nuit</th><th>Actions</th></tr></thead><tbody>{hotels.map(h => (<tr key={h.id}><td>{h.nom}</td><td className="text-center">{"⭐".repeat(h.etoiles)}</td><td>{h.prix_nuit} €</td><td><Link href={`/dashboard/voyage/hotels?id=${h.id}`}><Eye className="w-4 h-4 text-blue-600" /></Link></td></tr>))}</tbody></table></div>
        </>
      )}

      {mode === 'new' && (
        <>
          <div className="flex items-center gap-4"><button onClick={() => setMode('list')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft /></button><h1 className="text-3xl font-bold">Nouvelle destination</h1></div>
          <div className="bg-white rounded-xl border p-6"><div className="grid grid-cols-2 gap-4"><input type="text" placeholder="Pays *" value={formData.pays} onChange={e => setFormData({...formData, pays: e.target.value})} className="p-2 border rounded" /><input type="text" placeholder="Ville *" value={formData.ville} onChange={e => setFormData({...formData, ville: e.target.value})} className="p-2 border rounded" /><input type="text" placeholder="Code aéroport" value={formData.aeroport_code} onChange={e => setFormData({...formData, aeroport_code: e.target.value})} className="p-2 border rounded" /><input type="text" placeholder="Saison haute" value={formData.saison_haute} onChange={e => setFormData({...formData, saison_haute: e.target.value})} className="p-2 border rounded" /><input type="number" placeholder="Prix moyen" value={formData.prix_moyen} onChange={e => setFormData({...formData, prix_moyen: e.target.value})} className="p-2 border rounded" /><label className="flex items-center"><input type="checkbox" checked={formData.visa_requis} onChange={e => setFormData({...formData, visa_requis: e.target.checked})} className="mr-2" />Visa requis</label><textarea placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} className="col-span-2 p-2 border rounded" /></div><div className="flex justify-end gap-3 mt-6 pt-6 border-t"><button onClick={() => setMode('list')} className="px-4 py-2 border rounded">Annuler</button><button onClick={handleCreate} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Créer</button></div></div>
        </>
      )}
    </div>
  );
}
