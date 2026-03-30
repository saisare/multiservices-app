'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Users, Search, Filter, Plus, Eye, Edit, Trash2,
  ArrowLeft, Save, X, AlertCircle, CheckCircle,
  Mail, Phone, MapPin, Calendar, Globe, Passport,
  Building2, User, Briefcase, Plane
} from 'lucide-react';

interface Client {
  id: number;
  code_client: string;
  type_client: 'PARTICULIER' | 'GROUPE' | 'ENTREPRISE';
  nom: string;
  prenom: string;
  entreprise: string;
  date_naissance: string;
  nationalite: string;
  passport_number: string;
  passport_expiration: string;
  email: string;
  telephone: string;
  adresse: string;
  date_creation: string;
}

interface Reservation {
  id: number;
  code_reservation: string;
  destination: string;
  date_depart: string;
  statut: string;
}

interface Dossier {
  id: number;
  numero_dossier: string;
  type_demande: string;
  statut: string;
}

export default function ClientsVoyagePage() {
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  const clientId = searchParams.get('id');

  const [clients, setClients] = useState<Client[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [mode, setMode] = useState<'list' | 'detail' | 'new' | 'edit'>('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const [formData, setFormData] = useState({
    code_client: '',
    type_client: 'PARTICULIER',
    nom: '',
    prenom: '',
    entreprise: '',
    date_naissance: '',
    nationalite: '',
    passport_number: '',
    passport_expiration: '',
    email: '',
    telephone: '',
    adresse: ''
  });

  useEffect(() => {
    if (action === 'new') setMode('new');
    else if (clientId) { setMode('detail'); loadClient(parseInt(clientId)); }
    else loadClients();
  }, [action, clientId]);

  const loadClients = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setClients([
        { id: 1, code_client: 'CLT-001', type_client: 'PARTICULIER', nom: 'Konan', prenom: 'Jean', entreprise: '', date_naissance: '1990-05-15', nationalite: 'Ivoirienne', passport_number: 'PA123456', passport_expiration: '2028-12-31', email: 'jean.konan@email.com', telephone: '0123456789', adresse: 'Cocody, Abidjan', date_creation: '2026-01-10' },
        { id: 2, code_client: 'CLT-002', type_client: 'PARTICULIER', nom: 'Diallo', prenom: 'Aminata', entreprise: '', date_naissance: '1985-08-22', nationalite: 'Sénégalaise', passport_number: 'PA789012', passport_expiration: '2027-06-30', email: 'aminata.diallo@email.com', telephone: '0234567890', adresse: 'Plateau, Abidjan', date_creation: '2026-01-15' },
        { id: 3, code_client: 'CLT-003', type_client: 'ENTREPRISE', nom: 'Tech Solutions', prenom: '', entreprise: 'Tech Solutions SARL', date_naissance: '', nationalite: '', passport_number: '', passport_expiration: '', email: 'contact@techsolutions.ci', telephone: '0345678901', adresse: 'Marcory, Abidjan', date_creation: '2026-02-01' },
      ]);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const loadClient = async (id: number) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockClient: Client = { id, code_client: 'CLT-001', type_client: 'PARTICULIER', nom: 'Konan', prenom: 'Jean', entreprise: '', date_naissance: '1990-05-15', nationalite: 'Ivoirienne', passport_number: 'PA123456', passport_expiration: '2028-12-31', email: 'jean.konan@email.com', telephone: '0123456789', adresse: 'Cocody, Abidjan', date_creation: '2026-01-10' };
      setClient(mockClient);
      setFormData({
        code_client: mockClient.code_client,
        type_client: mockClient.type_client,
        nom: mockClient.nom,
        prenom: mockClient.prenom,
        entreprise: mockClient.entreprise,
        date_naissance: mockClient.date_naissance,
        nationalite: mockClient.nationalite,
        passport_number: mockClient.passport_number,
        passport_expiration: mockClient.passport_expiration,
        email: mockClient.email,
        telephone: mockClient.telephone,
        adresse: mockClient.adresse
      });
      setReservations([
        { id: 1, code_reservation: 'RES-2024-001', destination: 'Paris', date_depart: '2024-06-15', statut: 'CONFIRMEE' },
        { id: 2, code_reservation: 'RES-2024-002', destination: 'Berlin', date_depart: '2024-07-10', statut: 'EN_ATTENTE' },
      ]);
      setDossiers([
        { id: 1, numero_dossier: 'DOS-2024-001', type_demande: 'VISA_ETUDIANT', statut: 'EN_INSTRUCTION' },
      ]);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!formData.nom || (formData.type_client === 'PARTICULIER' && !formData.prenom)) {
      setError('Nom requis');
      return;
    }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess('Client créé avec succès');
      setTimeout(() => { setMode('list'); loadClients(); }, 1500);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess('Client mis à jour');
      setTimeout(() => { setMode('detail'); if (client) loadClient(client.id); }, 1500);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce client ?')) return;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess('Client supprimé');
      setTimeout(() => { setMode('list'); loadClients(); }, 1500);
    } catch (err: any) { setError(err.message); }
  };

  const filteredClients = clients.filter(c =>
    c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.prenom && c.prenom.toLowerCase().includes(searchTerm.toLowerCase())) ||
    c.code_client.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(c => typeFilter === 'all' || c.type_client === typeFilter);

  if (loading && mode !== 'list') return <div className="flex justify-center h-64"><div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-50 p-4 rounded-lg"><AlertCircle className="w-5 h-5 inline mr-2" />{error}</div>}
      {success && <div className="bg-green-50 p-4 rounded-lg"><CheckCircle className="w-5 h-5 inline mr-2 text-green-600" />{success}</div>}

      {mode === 'list' && (
        <>
          <div className="flex justify-between"><div><h1 className="text-3xl font-bold">Clients</h1><p className="text-gray-600">Gestion des clients voyageurs</p></div><Link href="/dashboard/voyage/clients?action=new" className="px-4 py-2 bg-blue-600 text-white rounded-lg"><Plus className="w-4 h-4 mr-2" />Nouveau client</Link></div>

          <div className="bg-white rounded-xl border p-4"><div className="flex gap-4"><div className="flex-1 relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" /></div><select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-4 py-2 border rounded-lg"><option value="all">Tous</option><option value="PARTICULIER">Particuliers</option><option value="ENTREPRISE">Entreprises</option></select></div></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{filteredClients.map(c => (<div key={c.id} className="bg-white rounded-xl border p-6 hover:shadow-lg"><div className="flex justify-between"><div className="flex items-center gap-3"><div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">{c.type_client === 'PARTICULIER' ? (c.prenom?.[0] || c.nom[0]) : c.nom[0]}</div><div><h3 className="font-semibold">{c.type_client === 'PARTICULIER' ? `${c.prenom} ${c.nom}` : c.nom}</h3><p className="text-sm text-gray-600">{c.code_client}</p></div></div><Link href={`/dashboard/voyage/clients?id=${c.id}`}><Eye className="w-4 h-4 text-blue-600" /></Link></div><div className="mt-4 space-y-2 text-sm"><div className="flex items-center"><Mail className="w-4 h-4 mr-2 text-gray-400" />{c.email}</div><div className="flex items-center"><Phone className="w-4 h-4 mr-2 text-gray-400" />{c.telephone}</div><div className="flex items-center"><Globe className="w-4 h-4 mr-2 text-gray-400" />{c.nationalite || 'Non renseignée'}</div></div></div>))}</div>
        </>
      )}

      {(mode === 'detail' || mode === 'edit') && client && (
        <>
          <div className="flex justify-between"><div className="flex items-center gap-4"><button onClick={() => setMode('list')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft /></button><div><h1 className="text-3xl font-bold">{client.type_client === 'PARTICULIER' ? `${client.prenom} ${client.nom}` : client.nom}</h1><p className="text-gray-600">{client.code_client}</p></div></div><div className="flex gap-2">{mode === 'detail' ? (<><button onClick={() => setMode('edit')} className="px-4 py-2 border rounded-lg"><Edit className="w-4 h-4 inline mr-2" />Modifier</button><button onClick={() => handleDelete(client.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg"><Trash2 className="w-4 h-4 inline mr-2" />Supprimer</button></>) : (<><button onClick={() => setMode('detail')}>Annuler</button><button onClick={handleUpdate}>Enregistrer</button></>)}</div></div>

          <div className="grid grid-cols-3 gap-6"><div className="col-span-2 bg-white rounded-xl border p-6">{mode === 'detail' ? (<div className="grid grid-cols-2 gap-4"><div><p className="text-sm text-gray-600">Type</p><p className="font-medium">{client.type_client === 'PARTICULIER' ? 'Particulier' : 'Entreprise'}</p></div><div><p className="text-sm text-gray-600">Email</p><p>{client.email}</p></div><div><p className="text-sm text-gray-600">Téléphone</p><p>{client.telephone}</p></div><div><p className="text-sm text-gray-600">Adresse</p><p>{client.adresse}</p></div><div><p className="text-sm text-gray-600">Nationalité</p><p>{client.nationalite}</p></div><div><p className="text-sm text-gray-600">Passeport</p><p>{client.passport_number} - Exp: {client.passport_expiration ? new Date(client.passport_expiration).toLocaleDateString() : 'Non renseigné'}</p></div></div>) : (<div><select value={formData.type_client} onChange={e => setFormData({...formData, type_client: e.target.value as any})} className="w-full mb-3 p-2 border rounded"><option value="PARTICULIER">Particulier</option><option value="ENTREPRISE">Entreprise</option></select><input type="text" placeholder="Nom" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="text" placeholder="Prénom" value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="tel" placeholder="Téléphone" value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="text" placeholder="Nationalité" value={formData.nationalite} onChange={e => setFormData({...formData, nationalite: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="text" placeholder="N° Passeport" value={formData.passport_number} onChange={e => setFormData({...formData, passport_number: e.target.value})} className="w-full mb-3 p-2 border rounded" /><input type="date" placeholder="Expiration passeport" value={formData.passport_expiration} onChange={e => setFormData({...formData, passport_expiration: e.target.value})} className="w-full mb-3 p-2 border rounded" /><textarea placeholder="Adresse" value={formData.adresse} onChange={e => setFormData({...formData, adresse: e.target.value})} rows={3} className="w-full p-2 border rounded" /></div>)}</div>

            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white"><h3 className="text-lg font-semibold mb-4">Statistiques</h3><div><p className="text-blue-100">Réservations</p><p className="text-2xl font-bold">{reservations.length}</p></div><div className="mt-4"><p className="text-blue-100">Dossiers visa</p><p className="text-2xl font-bold">{dossiers.length}</p></div></div></div>

          <div className="bg-white rounded-xl border p-6"><h2 className="text-lg font-semibold mb-4">Réservations</h2><table className="w-full"><thead><tr><th className="text-left">Code</th><th>Destination</th><th>Date départ</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{reservations.map(r => (<tr key={r.id}><td>{r.code_reservation}</td><td>{r.destination}</td><td>{new Date(r.date_depart).toLocaleDateString()}</td><td><span className={`px-2 py-1 rounded-full text-xs ${r.statut === 'CONFIRMEE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.statut}</span></td><td><Link href={`/dashboard/voyage/reservations?id=${r.id}`}><Eye className="w-4 h-4 text-blue-600" /></Link></td></tr>))}</tbody></table></div>

          <div className="bg-white rounded-xl border p-6"><h2 className="text-lg font-semibold mb-4">Dossiers d'immigration</h2><table className="w-full"><thead><tr><th>N° dossier</th><th>Type</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{dossiers.map(d => (<tr key={d.id}><td>{d.numero_dossier}</td><td>{d.type_demande}</td><td><span className={`px-2 py-1 rounded-full text-xs ${d.statut === 'ACCEPTE' ? 'bg-green-100 text-green-700' : d.statut === 'EN_INSTRUCTION' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{d.statut}</span></td><td><Link href={`/dashboard/voyage/dossiers?id=${d.id}`}><Eye className="w-4 h-4 text-blue-600" /></Link></td></tr>))}</tbody></table></div>
        </>
      )}

      {mode === 'new' && (
        <>
          <div className="flex items-center gap-4"><button onClick={() => setMode('list')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft /></button><h1 className="text-3xl font-bold">Nouveau client</h1></div>
          <div className="bg-white rounded-xl border p-6"><div className="grid grid-cols-2 gap-4"><select value={formData.type_client} onChange={e => setFormData({...formData, type_client: e.target.value as any})} className="p-2 border rounded"><option value="PARTICULIER">Particulier</option><option value="ENTREPRISE">Entreprise</option></select><input type="text" placeholder="Nom *" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} className="p-2 border rounded" /><input type="text" placeholder="Prénom" value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} className="p-2 border rounded" /><input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="p-2 border rounded" /><input type="tel" placeholder="Téléphone" value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} className="p-2 border rounded" /><input type="text" placeholder="Nationalité" value={formData.nationalite} onChange={e => setFormData({...formData, nationalite: e.target.value})} className="p-2 border rounded" /><input type="text" placeholder="N° Passeport" value={formData.passport_number} onChange={e => setFormData({...formData, passport_number: e.target.value})} className="p-2 border rounded" /><input type="date" placeholder="Expiration passeport" value={formData.passport_expiration} onChange={e => setFormData({...formData, passport_expiration: e.target.value})} className="p-2 border rounded" /><textarea placeholder="Adresse" value={formData.adresse} onChange={e => setFormData({...formData, adresse: e.target.value})} rows={3} className="col-span-2 p-2 border rounded" /></div><div className="flex justify-end gap-3 mt-6 pt-6 border-t"><button onClick={() => setMode('list')} className="px-4 py-2 border rounded">Annuler</button><button onClick={handleCreate} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Créer</button></div></div>
        </>
      )}
    </div>
  );
}