'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Building2, Eye, Edit, Plus, Trash2, Download, ChevronLeft,
  MapPin, Calendar, DollarSign, User, FileText, ClipboardList,
  Package, Users, HardHat, AlertCircle, CheckCircle, Clock, BarChart3,
  ArrowUp, ArrowDown
} from 'lucide-react';
import { btpApi, Chantier, TacheChantier, Materiau, Ouvrier } from '@/services/api/btp.api';

export default function ChantierDetail() {
  const params = useParams();
  const id = parseInt(params.id as string);
  const [chantier, setChantier] = useState<Chantier | null>(null);
  const [taches, setTaches] = useState<TacheChantier[]>([]);
  const [ouvriers, setOuvriers] = useState<Ouvrier[]>([]);
  const [materiaux, setMateriaux] = useState<Materiau[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'infos' | 'taches' | 'ouvriers' | 'materiaux'>('infos');

  useEffect(() => {
    if (!id) return;
    loadChantierData();
  }, [id]);

const loadChantierData = async (): Promise<void> => {
    try {
      setLoading(true);
      const [chantierData, tachesData, ouvriersData, materiauxData] = await Promise.all([
        btpApi.getChantier(id),
        btpApi.getTaches(id),
        btpApi.getOuvriers(),
        btpApi.getMateriaux()
      ]);
      setChantier(chantierData);
      setTaches(tachesData);
      setOuvriers(ouvriersData);
      setMateriaux(materiauxData);
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'EN_COURS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'TERMINE': return 'bg-green-100 text-green-800 border-green-200';
      case 'SUSPENDU': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ANNULE': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const progression = taches.length > 0 ? Math.round(
    taches.filter(t => t.statut === 'TERMINE').length / taches.length * 100
  ) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement du chantier...</p>
        </div>
      </div>
    );
  }

  if (error || !chantier) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-800 mb-2">Chantier non trouvé</h2>
        <Link href="/dashboard/btp/chantiers" className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Retour aux chantiers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/dashboard/btp/chantiers" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-2">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Tous les chantiers
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{chantier.nom}</h1>
          <p className="text-gray-600 mt-1">Code: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{chantier.code_chantier}</span></p>
        </div>
        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatutColor(chantier.statut)}`}>
          {chantier.statut}
        </span>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <DollarSign className="w-8 h-8 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-green-600">{(chantier.budget || 0).toLocaleString()} €</p>
          <p className="text-sm text-gray-600">Budget total</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <ClipboardList className="w-8 h-8 text-blue-500 mb-2" />
          <p className="text-2xl font-bold">{taches.length}</p>
          <p className="text-sm text-gray-600">Tâches totales</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <Users className="w-8 h-8 text-purple-500 mb-2" />
          <p className="text-2xl font-bold">{ouvriers.filter(o => o.actif).length}</p>
          <p className="text-sm text-gray-600">Ouvriers disponibles</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <BarChart3 className="w-8 h-8 text-orange-500 mb-2" />
          <p className="text-2xl font-bold text-blue-600">{progression}%</p>
          <p className="text-sm text-gray-600">Progression</p>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3">
          <Link href={`/dashboard/btp/chantiers/${id}/edit`} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Link>
          <Link href={`/dashboard/btp/chantiers/${id}/taches`} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <ClipboardList className="w-4 h-4 mr-2" />
            Gérer les tâches
          </Link>
          <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter tâche
          </button>
          <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            <Download className="w-4 h-4 mr-2" />
            Exporter PDF
          </button>
          <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 ml-auto">
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-4">Informations principales</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">Client</label>
              <p className="text-lg">{chantier.client_nom || 'Non spécifié'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Date début</label>
                <p>{new Date(chantier.date_debut).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Date fin prévue</label>
                <p>{new Date(chantier.date_fin_prevue).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">Adresse</label>
              <p className="flex items-start">
                <MapPin className="w-5 h-5 mt-0.5 mr-2 text-gray-400 flex-shrink-0" />
                {chantier.adresse}
              </p>
            </div>
          </div>
        </div>

        {/* Progression */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-4">Progression du chantier</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Tâches terminées</span>
                <span>{progression}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all" style={{width: `${progression}%`}} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="font-bold">{taches.filter(t => t.statut === 'TERMINE').length}</p>
                <p className="text-sm text-gray-600">Terminées</p>
              </div>
              <div>
                <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="font-bold">{taches.filter(t => t.statut === 'EN_COURS').length}</p>
                <p className="text-sm text-gray-600">En cours</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button onClick={() => setActiveTab('infos')} className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'infos' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              Infos détaillées
            </button>
            <button onClick={() => setActiveTab('taches')} className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'taches' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              Tâches ({taches.length})
            </button>
            <button onClick={() => setActiveTab('ouvriers')} className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'ouvriers' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              Ouvriers assignés
            </button>
            <button onClick={() => setActiveTab('materiaux')} className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'materiaux' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              Matériaux utilisés
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'infos' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Contact client</h4>
                  <div className="space-y-2 text-sm">
                    <p><User className="w-4 h-4 inline mr-2" /> {chantier.client_nom}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Dates importantes</h4>
                  <div className="space-y-2 text-sm">
                    <p><Calendar className="w-4 h-4 inline mr-2" /> Début: {new Date(chantier.date_debut).toLocaleDateString('fr-FR')}</p>
                    {chantier.date_fin_reelle && <p><CheckCircle className="w-4 h-4 inline mr-2 text-green-500" /> Fin réelle: {new Date(chantier.date_fin_reelle).toLocaleDateString('fr-FR')}</p>}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Notes</h4>
                <p className="text-gray-600 italic">Notes du chantier à ajouter.</p>
              </div>
            </div>
          )}

          {activeTab === 'taches' && (
            <div className="space-y-3">
              {taches.map((tache) => (
                <div key={tache.id} className="flex items-center p-4 bg-gray-50 rounded-lg border">
                  <div className="flex-1">
                    <p className="font-medium">{tache.description}</p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span>{tache.ouvrier_nom || 'Non assigné'}</span>
                      <span>{new Date(tache.date_debut).toLocaleDateString()}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatutColor(tache.statut).replace('border', 'bg').replace('text-', 'text-')}`}>
                        {tache.statut}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Edit className="w-4 h-4 text-green-600 cursor-pointer hover:scale-110" />
                    <Trash2 className="w-4 h-4 text-red-600 cursor-pointer hover:scale-110" />
                  </div>
                </div>
              ))}
              {taches.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune tâche pour ce chantier</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ouvriers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ouvriers.filter(o => o.actif).map((ouvrier) => (
                <div key={ouvrier.id} className="flex items-center p-4 bg-gray-50 rounded-lg border hover:bg-white">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="font-semibold text-blue-800">{ouvrier.prenom.charAt(0)}{ouvrier.nom.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{ouvrier.prenom} {ouvrier.nom}</p>
                    <p className="text-sm text-gray-600">{ouvrier.metier}</p>
                  </div>
                  <Link href={`/dashboard/btp/ouvriers/${ouvrier.id}`} className="text-blue-600 hover:underline text-sm">
                    Voir profil
                  </Link>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'materiaux' && (
            <div className="space-y-3">
              {materiaux.slice(0, 10).map((materiau) => {
                const status = materiau.quantite <= materiau.seuil_alerte ? 'Stock bas' : 'OK';
                const color = materiau.quantite <= materiau.seuil_alerte ? 'text-orange-600' : 'text-green-600';
                return (
                  <div key={materiau.id} className="p-4 bg-gray-50 rounded-lg border flex justify-between items-center">
                    <div>
                      <p className="font-medium">{materiau.nom}</p>
                      <p className="text-sm text-gray-600">{materiau.fournisseur}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${color}`}>
                        {materiau.quantite} {materiau.unite}
                      </p>
                      <p className="text-xs text-gray-500">Seuil: {materiau.seuil_alerte}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
