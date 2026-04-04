'use client';

import { useState, useEffect, useCallback } from 'react';
import { Package, Truck, AlertTriangle, TrendingUp, Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { logistiqueApi, type Stats } from '@/services/api/logistique.api.ts';

interface LocalStats {
  totalProduits: number;
  produitsFaibleStock: number;
  valeurStock: number;
  commandesEnCours: number;
}

export default function LogistiquePage() {
  const [stats, setStats] = useState({
    totalProduits: 0,
    produitsFaibleStock: 0,
    valeurStock: 0,
    commandesEnCours: 0
  });
  const [loading, setLoading] = useState(true);

const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await logistiqueApi.getStats();
      setStats({
        totalProduits: data.total_produits || 0,
        produitsFaibleStock: data.alertes_non_traitees || 0,
        valeurStock: data.valeur_stock || 0,
        commandesEnCours: data.commandes_en_cours || 0
      });
    } catch (err) {
      console.error('Error loading stats:', err);
      // Fallback
      setStats({ totalProduits: 0, produitsFaibleStock: 0, valeurStock: 0, commandesEnCours: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement du tableau de bord Logistique...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Logistique</h1>
          <p className="text-gray-600 mt-2">Gestion des produits, stocks et livraisons</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/logistique/produits/nouveau"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau produit
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <Package className="w-8 h-8 text-blue-500" />
            <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
              {stats.totalProduits}
            </span>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.totalProduits}</p>
          <p className="text-sm text-gray-600">Produits en stock</p>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <span className="text-xs font-medium px-2 py-1 bg-red-100 text-red-700 rounded-full">
              {stats.produitsFaibleStock}
            </span>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.produitsFaibleStock}</p>
          <p className="text-sm text-gray-600">Stock faible</p>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
              €{stats.valeurStock.toLocaleString()}
            </span>
          </div>
          <p className="text-2xl font-bold mt-2">€{stats.valeurStock.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Valeur du stock</p>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <Truck className="w-8 h-8 text-purple-500" />
            <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
              {stats.commandesEnCours}
            </span>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.commandesEnCours}</p>
          <p className="text-sm text-gray-600">Commandes en cours</p>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/logistique/produits"
          className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <Package className="w-10 h-10 text-blue-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Gestion Produits</h3>
              <p className="text-gray-600">Ajouter, modifier, consulter les produits</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/logistique/commandes"
          className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <Truck className="w-10 h-10 text-green-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Commandes</h3>
              <p className="text-gray-600">Gérer les commandes fournisseurs</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/logistique/livraison"
          className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <TrendingUp className="w-10 h-10 text-purple-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Livraisons</h3>
              <p className="text-gray-600">Suivre les livraisons et réceptions</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Section alertes stock */}
      {stats.produitsFaibleStock > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Alerte stock - {stats.produitsFaibleStock} produit(s) en rupture
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Certains produits sont en dessous du seuil de réapprovisionnement.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
