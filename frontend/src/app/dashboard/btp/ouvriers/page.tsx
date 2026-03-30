'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { btpApi, Ouvrier } from "@/services/api/btp.api";
import { Search, Plus, Filter, Edit, Eye, Trash2 } from "lucide-react";

export default function OuvriersPage() {
  const [ouvriers, setOuvriers] = useState<Ouvrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    btpApi.getOuvriers().then(setOuvriers).finally(() => setLoading(false));
  }, []);

  const filteredOuvriers = ouvriers.filter(o => 
    o.nom.toLowerCase().includes(search.toLowerCase()) ||
    o.prenom.toLowerCase().includes(search.toLowerCase()) ||
    o.metier.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Ouvriers</h1>
        <Link href="/dashboard/btp/ouvriers/nouveau" className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Nouvel ouvrier
        </Link>
      </div>

      <div className="bg-white rounded-xl border p-4">
        <Search className="w-4 h-4" />
        <input 
          placeholder="Rechercher ouvrier..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="border p-2 rounded w-full"
        />
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Nom</th>
              <th className="p-4 text-left">Métier</th>
              <th className="p-4 text-left">Matricule</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOuvriers.map((ouvrier) => (
              <tr key={ouvrier.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-medium">{ouvrier.prenom} {ouvrier.nom}</td>
                <td className="p-4">{ouvrier.metier}</td>
                <td className="p-4">{ouvrier.matricule}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${ouvrier.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {ouvrier.actif ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <Link href={`/dashboard/btp/ouvriers/${ouvrier.id}`} className="text-blue-600 hover:underline">
                    <Eye className="w-4 h-4 inline" />
                  </Link>
                  <Link href={`/dashboard/btp/ouvriers/${ouvrier.id}/edit`} className="text-green-600 hover:underline">
                    <Edit className="w-4 h-4 inline" />
                  </Link>
                  <button className="text-red-600 hover:underline">
                    <Trash2 className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
