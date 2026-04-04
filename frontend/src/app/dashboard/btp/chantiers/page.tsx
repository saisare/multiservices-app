'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2, Search, Filter, Plus, Edit, Trash2,
  AlertCircle, MapPin, Calendar, DollarSign, Eye,
  ChevronDown, Download, MoreVertical, Users, Package,
  ClipboardList, FileText, Truck, Clock, CheckCircle,
  XCircle, User, Flag, HardHat
} from 'lucide-react';
import { btpApi, Chantier, TacheChantier, Materiau, Ouvrier } from '@/services/api/btp.api';

export default function ChantiersPage() {
  const [chantiers, setChantiers] = useState<Chantier[]>([]);
  const [taches, setTaches] = useState<{ [key: number]: TacheChantier[] }>({});
  const [materiaux, setMateriaux] = useState<Materiau[]>([]);
  const [ouvriers, setOuvriers] = useState<Ouvrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'nom' | 'budget'>('date');
  const [expandedChantier, setExpandedChantier] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'infos' | 'taches' | 'ouvriers' | 'materiaux'>('infos');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [chantiersData, materiauxData, ouvriersData] = await Promise.all([
        btpApi.getChantiers(),
        btpApi.getMateriaux(),
        btpApi.getOuvriers()
      ]);

      setChantiers(chantiersData);
      setMateriaux(materiauxData);
      setOuvriers(ouvriersData);

      // Charger les tâches pour chaque chantier
      const tachesPromises = chantiersData.map(c => btpApi.getTaches(c.id));
      const tachesResults = await Promise.all(tachesPromises);
      
      const tachesMap: { [key: number]: TacheChantier[] } = {};
      chantiersData.forEach((c, index) => {
        tachesMap[c.id] = tachesResults[index];
      });
      setTaches(tachesMap);

  } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'EN_COURS': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'TERMINE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'SUSPENDU': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ANNULE': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case 'HAUTE': return 'bg-red-100 text-red-700';
      case 'NORMALE': return 'bg-blue-100 text-blue-700';
      case 'BASSE': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStockStatus = (quantite: number, seuil: number) => {
    if (quantite <= 0) return { color: 'bg-red-100 text-red-700', text: 'Rupture' };
    if (quantite <= seuil) return { color: 'bg-yellow-100 text-yellow-700', text: 'Stock bas' };
    return { color: 'bg-green-100 text-green-700', text: 'Normal' };
  };

  const filteredChantiers = chantiers
    .filter(c => 
      c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code_chantier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.adresse?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(c => statusFilter === 'all' || c.statut === statusFilter)
    .sort((a, b) => {
      if (sortBy === 'nom') return a.nom.localeCompare(b.nom);
      if (sortBy === 'budget') return b.budget - a.budget;
      return new Date(b.date_debut).getTime() - new Date(a.date_debut).getTime();
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement des chantiers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chantiers</h1>
          <p className="text-gray-600 mt-2">Gestion complète des chantiers</p>
        </div>
        <Link
          href="/dashboard/btp/chantiers/nouveau"
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau chantier
        </Link>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-orange-100 p-4">
          <p className="text-sm text-gray-600">Total chantiers</p>
          <p className="text-2xl font-bold">{chantiers.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-orange-100 p-4">
          <p className="text-sm text-gray-600">En cours</p>
          <p className="text-2xl font-bold text-blue-600">
            {chantiers.filter(c => c.statut === 'EN_COURS').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-orange-100 p-4">
          <p className="text-sm text-gray-600">Terminés</p>
          <p className="text-2xl font-bold text-green-600">
            {chantiers.filter(c => c.statut === 'TERMINE').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-orange-100 p-4">
          <p className="text-sm text-gray-600">Tâches en cours</p>
          <p className="text-2xl font-bold text-purple-600">
            {Object.values(taches).flat().filter(t => t.statut === 'EN_COURS').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-orange-100 p-4">
          <p className="text-sm text-gray-600">Budget total</p>
          <p className="text-2xl font-bold">
            {chantiers.reduce((sum, c) => sum + (c.budget || 0), 0).toLocaleString()} €
          </p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl border border-orange-100 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un chantier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="EN_COURS">En cours</option>
            <option value="TERMINE">Terminé</option>
            <option value="SUSPENDU">Suspendu</option>
            <option value="ANNULE">Annulé</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="date">Trier par date</option>
            <option value="nom">Trier par nom</option>
            <option value="budget">Trier par budget</option>
          </select>
        </div>
      </div>

      {/* Liste des chantiers avec détails intégrés */}
      <div className="space-y-4">
        {filteredChantiers.map((chantier) => {
          const chantierTaches = taches[chantier.id] || [];
          const tachesEnCours = chantierTaches.filter(t => t.statut === 'EN_COURS').length;
          const tachesTerminees = chantierTaches.filter(t => t.statut === 'TERMINE').length;
          const progression = chantierTaches.length > 0 
            ? Math.round((tachesTerminees / chantierTaches.length) * 100) 
            : 0;

          return (
            <div key={chantier.id} className="bg-white rounded-xl border border-orange-100 overflow-hidden">
              {/* En-tête du chantier (toujours visible) */}
              <div 
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setExpandedChantier(expandedChantier === chantier.id ? null : chantier.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">{chantier.nom}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getStatutColor(chantier.statut)}`}>
                        {chantier.statut}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        {chantier.adresse}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(chantier.date_debut).toLocaleDateString()} → {new Date(chantier.date_fin_prevue).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {chantier.budget?.toLocaleString()} €
                      </div>
                      <div className="flex items-center text-gray-600">
                        <ClipboardList className="w-4 h-4 mr-1" />
                        {tachesEnCours} tâches en cours
                      </div>
                    </div>
                    
                    {/* Barre de progression */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progression</span>
                        <span>{progression}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-600 h-2 rounded-full transition-all"
                          style={{ width: `${progression}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      href={`/dashboard/btp/chantiers/${chantier.id}`}
                      className="p-2 hover:bg-blue-100 rounded-lg text-blue-600"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                    <Link
                      href={`/dashboard/btp/chantiers/${chantier.id}/edit`}
                      className="p-2 hover:bg-green-100 rounded-lg text-green-600"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button className="p-2 hover:bg-gray-200 rounded-lg">
                      <ChevronDown className={`w-5 h-5 transition-transform ${expandedChantier === chantier.id ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Détails étendus (visibles seulement si expand) */}
              {expandedChantier === chantier.id && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  {/* Onglets */}
                  <div className="flex space-x-4 border-b border-gray-200 mb-4">
                    <button
                      onClick={() => setActiveTab('infos')}
                      className={`pb-2 px-1 ${activeTab === 'infos' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                    >
                      <Building2 className="w-4 h-4 inline mr-2" />
                      Infos
                    </button>
                    <button
                      onClick={() => setActiveTab('taches')}
                      className={`pb-2 px-1 ${activeTab === 'taches' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                    >
                      <ClipboardList className="w-4 h-4 inline mr-2" />
                      Tâches ({chantierTaches.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('ouvriers')}
                      className={`pb-2 px-1 ${activeTab === 'ouvriers' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                    >
                      <HardHat className="w-4 h-4 inline mr-2" />
                      Ouvriers
                    </button>
                    <button
                      onClick={() => setActiveTab('materiaux')}
                      className={`pb-2 px-1 ${activeTab === 'materiaux' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                    >
                      <Package className="w-4 h-4 inline mr-2" />
                      Matériaux
                    </button>
                  </div>

                  {/* Contenu des onglets */}
                  <div className="space-y-4">
                    {/* Onglet Infos */}
                    {activeTab === 'infos' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Code chantier</p>
                          <p className="font-mono">{chantier.code_chantier}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Client</p>
                          <p>{chantier.client_nom || 'Non spécifié'}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Date de début</p>
                          <p>{new Date(chantier.date_debut).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Date de fin prévue</p>
                          <p>{new Date(chantier.date_fin_prevue).toLocaleDateString('fr-FR')}</p>
                        </div>
                        {chantier.date_fin_reelle && (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">Date de fin réelle</p>
                            <p className="text-green-600">{new Date(chantier.date_fin_reelle).toLocaleDateString('fr-FR')}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Onglet Tâches */}
                    {activeTab === 'taches' && (
                      <div className="space-y-3">
                        {chantierTaches.slice(0, 5).map(tache => (
                          <div key={tache.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                            <div>
                              <p className="font-medium">{tache.description}</p>
                              <div className="flex items-center space-x-3 mt-1 text-xs">
                                <span className="flex items-center">
                                  <User className="w-3 h-3 mr-1" />
                                  {tache.ouvrier_nom || 'Non assigné'}
                                </span>
                                <span className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {new Date(tache.date_debut).toLocaleDateString()}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${getPrioriteColor(tache.priorite)}`}>
                                  {tache.priorite}
                                </span>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              tache.statut === 'TERMINE' ? 'bg-green-100 text-green-700' :
                              tache.statut === 'EN_COURS' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {tache.statut}
                            </span>
                          </div>
                        ))}
                        {chantierTaches.length > 5 && (
                          <Link
                            href={`/dashboard/btp/chantiers/${chantier.id}/taches`}
                            className="block text-center text-sm text-blue-600 hover:underline py-2"
                          >
                            Voir toutes les tâches ({chantierTaches.length})
                          </Link>
                        )}
                      </div>
                    )}

                    {/* Onglet Ouvriers */}
                    {activeTab === 'ouvriers' && (
                      <div className="space-y-3">
                        {ouvriers.filter(o => o.actif).slice(0, 5).map(ouvrier => (
                          <div key={ouvrier.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                            <div>
                              <p className="font-medium">{ouvrier.prenom} {ouvrier.nom}</p>
                              <p className="text-sm text-gray-600">{ouvrier.metier}</p>
                            </div>
                            <Link
                              href={`/dashboard/btp/ouvriers/${ouvrier.id}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Voir
                            </Link>
                          </div>
                        ))}
                        <Link
                          href="/dashboard/btp/ouvriers"
                          className="block text-center text-sm text-blue-600 hover:underline py-2"
                        >
                          Gérer tous les ouvriers
                        </Link>
                      </div>
                    )}

                    {/* Onglet Matériaux */}
                    {activeTab === 'materiaux' && (
                      <div className="space-y-3">
                        {materiaux.slice(0, 5).map(materiau => {
                          const stockStatus = getStockStatus(materiau.quantite, materiau.seuil_alerte);
                          return (
                            <div key={materiau.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                              <div>
                                <p className="font-medium">{materiau.nom}</p>
                                <p className="text-sm text-gray-600">{materiau.fournisseur}</p>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className={`px-2 py-1 rounded-full text-xs ${stockStatus.color}`}>
                                  {materiau.quantite} {materiau.unite}
                                </span>
                                <Link
                                  href={`/dashboard/btp/materiaux/${materiau.id}`}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  Voir
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                        <Link
                          href="/dashboard/btp/materiaux"
                          className="block text-center text-sm text-blue-600 hover:underline py-2"
                        >
                          Gérer tous les matériaux
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredChantiers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun chantier trouvé</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Essayez de modifier votre recherche' : 'Commencez par créer un chantier'}
          </p>
        </div>
      )}
    </div>
  );
}
