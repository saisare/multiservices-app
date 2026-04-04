'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Building2, Package, Users, Truck, Calendar,
  TrendingUp, AlertCircle, CheckCircle, Clock,
  Plus, Search, Filter, Download, MoreVertical,
  Edit, Trash2, Eye
} from 'lucide-react';
import { btpApi, Chantier, Materiau, Ouvrier } from '@/services/api/btp.api';

export default function BTPDashboard() {
  const [chantiers, setChantiers] = useState<Chantier[]>([]);
  const [materiaux, setMateriaux] = useState<Materiau[]>([]);
  const [ouvriers, setOuvriers] = useState<Ouvrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState('');

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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'EN_COURS': return 'bg-orange-100 text-orange-800';
      case 'TERMINE': return 'bg-emerald-100 text-emerald-700';
      case 'SUSPENDU': return 'bg-amber-100 text-amber-800';
      case 'ANNULE': return 'bg-rose-100 text-rose-700';
      default: return 'bg-stone-100 text-stone-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement du tableau de bord BTP...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">BTP & Construction</h1>
          <p className="text-gray-600 mt-2">Gestion des chantiers, matériaux et ouvriers</p>
        </div>
        <Link
          href="/dashboard/btp/chantiers/nouveau"
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau chantier
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-orange-100 p-6">
          <div className="flex items-center justify-between">
            <Building2 className="w-8 h-8 text-orange-500" />
            <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
              {stats?.chantiers || chantiers.length}
            </span>
          </div>
          <p className="text-2xl font-bold mt-2">{chantiers.length}</p>
          <p className="text-sm text-gray-600">Chantiers actifs</p>
        </div>
        <div className="bg-white rounded-xl border border-orange-100 p-6">
          <div className="flex items-center justify-between">
            <Package className="w-8 h-8 text-green-500" />
            <span className="text-xs font-medium px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
              {stats?.valeur_stock || 0}€
            </span>
          </div>
          <p className="text-2xl font-bold mt-2">{materiaux.length}</p>
          <p className="text-sm text-gray-600">Matériaux en stock</p>
        </div>
        <div className="bg-white rounded-xl border border-orange-100 p-6">
          <div className="flex items-center justify-between">
            <Users className="w-8 h-8 text-purple-500" />
            <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
              {stats?.ouvriers || 0} actifs
            </span>
          </div>
          <p className="text-2xl font-bold mt-2">{ouvriers.length}</p>
          <p className="text-sm text-gray-600">Ouvriers</p>
        </div>
        <div className="bg-white rounded-xl border border-orange-100 p-6">
          <div className="flex items-center justify-between">
            <TrendingUp className="w-8 h-8 text-orange-500" />
            <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
              {stats?.chantiers_en_cours || 0} en cours
            </span>
          </div>
          <p className="text-2xl font-bold mt-2">{stats?.budget_total || 0}€</p>
          <p className="text-sm text-gray-600">Budget total</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-orange-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Chantiers récents</h2>
          <Link href="/dashboard/btp/chantiers" className="text-orange-700 hover:text-orange-900 font-medium">
            Voir tous
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Début</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chantiers.slice(0, 5).map((chantier) => (
                <tr key={chantier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {chantier.code_chantier}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/dashboard/btp/chantiers/${chantier.id}`} className="text-orange-700 hover:text-orange-900">
                      {chantier.nom}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(chantier.statut)}`}>
                      {chantier.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(chantier.date_debut).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {chantier.budget?.toLocaleString()} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link href={`/dashboard/btp/chantiers/${chantier.id}`} className="text-orange-700 hover:text-orange-900 p-2 -m-2 rounded-lg hover:bg-orange-50">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link href={`/dashboard/btp/chantiers/${chantier.id}/edit`} className="text-green-600 hover:text-green-900 p-2 -m-2 rounded-lg hover:bg-green-50">
                      <Edit className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/btp/chantiers" className="block p-6 bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <Building2 className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Gestion Chantiers</h3>
          <p className="text-sm text-gray-600 text-center">Voir tous les chantiers</p>
        </Link>
        <Link href="/dashboard/btp/ouvriers" className="block p-6 bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <Users className="w-12 h-12 text-purple-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Gestion Ouvriers</h3>
          <p className="text-sm text-gray-600 text-center">Équipe disponible</p>
        </Link>
        <Link href="/dashboard/btp/materiaux" className="block p-6 bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <Package className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Gestion Matériaux</h3>
          <p className="text-sm text-gray-600 text-center">Stocks et commandes</p>
        </Link>
      </div>
    </div>
  );
}


