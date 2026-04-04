'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { btpApi, Ouvrier } from "@/services/api/btp.api";
import { Search, Plus, Filter, Edit, Eye, Trash2, Loader, AlertCircle } from "lucide-react";

export default function OuvriersPage() {
  const [ouvriers, setOuvriers] = useState<Ouvrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState("");
  const [filterMetier, setFilterMetier] = useState('');
  const [metiers, setMetiers] = useState<string[]>([] );

  useEffect(() => {
    loadOuvriers();
  }, []);

  const loadOuvriers = async () => {
    try {
      setLoading(true);
      const data = await btpApi.getOuvriers();
      setOuvriers(data);
      const uniqueMetiers = [...new Set(data.map(o => o.metier))];
      setMetiers(uniqueMetiers as string[]);
    } catch (err: any) {
      setError(err.message || 'Erreur chargement ouvriers');
    } finally {
      setLoading(false);
    }
  };

  const filteredOuvriers = ouvriers.filter(o => {
    const matchSearch =
      o.nom.toLowerCase().includes(search.toLowerCase()) ||
      o.prenom.toLowerCase().includes(search.toLowerCase()) ||
      o.metier.toLowerCase().includes(search.toLowerCase());
    const matchMetier = filterMetier === '' || o.metier === filterMetier;
    return matchSearch && matchMetier;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <span>Chargement des ouvriers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ouvriers</h1>
          <p className="text-gray-600 mt-2">Gestion des effectifs et compétences</p>
        </div>
        <Link
          href="/dashboard/btp/ouvriers/nouveau"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          Nouvel ouvrier
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="flex gap-3 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-600">Total ouvriers</p>
          <p className="text-2xl font-bold text-blue-600">{ouvriers.length}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-600">Actifs</p>
          <p className="text-2xl font-bold text-green-600">{ouvriers.filter(o => o.actif).length}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-600">Métiers</p>
          <p className="text-2xl font-bold text-purple-600">{metiers.length}</p>
        </div>
      </div>

      {/* Filtrage */}
      <div className="bg-white rounded-lg border p-4 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 border rounded-lg px-3">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                placeholder="Rechercher par nom, prénom ou métier..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 py-2 outline-none"
              />
            </div>
          </div>
          <select
            value={filterMetier}
            onChange={(e) => setFilterMetier(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">Tous les métiers</option>
            {metiers.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Nom</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Métier</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Matricule</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Téléphone</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Statut</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOuvriers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Aucun ouvrier trouvé
                  </td>
                </tr>
              ) : (
                filteredOuvriers.map((ouvrier) => (
                  <tr key={ouvrier.id} className="border-t hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium">{ouvrier.prenom} {ouvrier.nom}</td>
                    <td className="px-6 py-4">{ouvrier.metier}</td>
                    <td className="px-6 py-4 text-gray-600">{ouvrier.matricule}</td>
                    <td className="px-6 py-4 text-gray-600">{ouvrier.telephone || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        ouvrier.actif
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {ouvrier.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/dashboard/btp/ouvriers/${ouvrier.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/dashboard/btp/ouvriers/${ouvrier.id}/edit`}
                          className="p-2 text-green-600 hover:bg-green-50 rounded transition"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Résumé */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          Affichage de {filteredOuvriers.length} ouvrier{filteredOuvriers.length > 1 ? 's' : ''} sur {ouvriers.length}
        </p>
      </div>
    </div>
  );
}
