'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, Package, Users, Truck, Calendar,
  TrendingUp, AlertCircle, CheckCircle, Clock,
  Plus, Search, Filter, Download, MoreVertical,
  Edit, Trash2, Eye, BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { btpApi, Chantier, Materiau, Ouvrier } from '@/services/api/btp.api';

interface BTPInterfaceProps {
  userId: number;
  userRole: string;
}

export default function BTPInterface({ userId, userRole }: BTPInterfaceProps) {
  const [chantiers, setChantiers] = useState<Chantier[]>([]);
  const [materiaux, setMateriaux] = useState<Materiau[]>([]);
  const [ouvriers, setOuvriers] = useState<Ouvrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'chantiers' | 'materiaux' | 'ouvriers'>('chantiers');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [chantiersData, materiauxData, ouvriersData, statsData] = await Promise.all([
        btpApi.getChantiers(),
        btpApi.getMateriaux(),
        btpApi.getOuvriers(),
        btpApi.getStats()
      ]);

      setChantiers(chantiersData);
      setMateriaux(materiauxData);
      setOuvriers(ouvriersData);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur chargement données BTP:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'EN_COURS': return 'bg-blue-100 text-blue-700';
      case 'TERMINE': return 'bg-green-100 text-green-700';
      case 'SUSPENDU': return 'bg-yellow-100 text-yellow-700';
      case 'ANNULE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <Building2 className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold">{stats?.chantiers || chantiers.length}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">Chantiers</p>
          <p className="text-xs text-gray-400">{stats?.chantiers_en_cours || 0} en cours</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <Package className="w-8 h-8 text-green-500" />
            <span className="text-2xl font-bold">{materiaux.length}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">Matériaux</p>
          <p className="text-xs text-gray-400">Valeur: {stats?.valeur_stock || 0}€</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <Users className="w-8 h-8 text-purple-500" />
            <span className="text-2xl font-bold">{ouvriers.length}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">Ouvriers</p>
          <p className="text-xs text-gray-400">{ouvriers.filter(o => o.actif).length} actifs</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <TrendingUp className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold">{stats?.budget_total || 0}€</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">Budget total</p>
        </div>
      </div>

      {/* Onglets de navigation */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setSelectedView('chantiers')}
            className={`py-2 px-1 border-b-2 font-medium transition-colors ${
              selectedView === 'chantiers'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Building2 className="w-4 h-4 inline mr-2" />
            Chantiers
          </button>
          <button
            onClick={() => setSelectedView('materiaux')}
            className={`py-2 px-1 border-b-2 font-medium transition-colors ${
              selectedView === 'materiaux'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            Matériaux
          </button>
          <button
            onClick={() => setSelectedView('ouvriers')}
            className={`py-2 px-1 border-b-2 font-medium transition-colors ${
              selectedView === 'ouvriers'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Ouvriers
          </button>
        </div>
      </div>

      {/* Contenu selon l'onglet */}
      {selectedView === 'chantiers' && (
        <div className="space-y-4">
          {chantiers.map(chantier => (
            <div key={chantier.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{chantier.nom}</h3>
                  <p className="text-sm text-gray-600 mt-1">{chantier.adresse}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs text-gray-500">
                      Début: {new Date(chantier.date_debut).toLocaleDateString('fr-FR')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatutColor(chantier.statut)}`}>
                      {chantier.statut}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                                    <p className="font-bold text-gray-900">{(chantier.budget || 0).toLocaleString()} €</p>
                  <Link
                    href={`/dashboard/btp/chantiers/${chantier.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Voir détails →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedView === 'materiaux' && (
        <div className="space-y-4">
          {materiaux.map(materiau => (
            <div key={materiau.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{materiau.nom}</h3>
                  <p className="text-sm text-gray-600">{materiau.categorie} • {materiau.fournisseur}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{materiau.quantite} {materiau.unite}</p>
                  <p className="text-sm text-gray-600">{materiau.prix_unitaire} €/unité</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedView === 'ouvriers' && (
        <div className="space-y-4">
          {ouvriers.map(ouvrier => (
            <div key={ouvrier.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {ouvrier.prenom} {ouvrier.nom}
                  </h3>
                  <p className="text-sm text-gray-600">{ouvrier.metier}</p>
                  <p className="text-xs text-gray-500 mt-1">{ouvrier.telephone}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    ouvrier.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {ouvrier.actif ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}