'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package, ArrowLeft, Edit, Trash2, AlertCircle,
  Building2, Tag, MapPin, DollarSign, Scale,
  TrendingUp, Clock, History, Plus
} from 'lucide-react';
import { btpApi, Materiau } from '@/services/api/btp.api';

export default function MateriauDetailPage() {
  const params = useParams();
  const router = useRouter();
  const materiauId = parseInt(params.id as string);

  const [materiau, setMateriau] = useState<Materiau | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddStock, setShowAddStock] = useState(false);
  const [stockToAdd, setStockToAdd] = useState(0);

  useEffect(() => {
    loadMateriau();
  }, [materiauId]);

  const loadMateriau = async () => {
    try {
      const data = await btpApi.getMateriau(materiauId);
      setMateriau(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async () => {
    if (!materiau || stockToAdd <= 0) return;

    try {
      const newQuantite = materiau.quantite + stockToAdd;
      await btpApi.updateStock(materiauId, newQuantite);
      setShowAddStock(false);
      setStockToAdd(0);
      loadMateriau();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRemoveStock = async () => {
    if (!materiau || stockToAdd <= 0) return;

    try {
      const newQuantite = Math.max(0, materiau.quantite - stockToAdd);
      await btpApi.updateStock(materiauId, newQuantite);
      setShowAddStock(false);
      setStockToAdd(0);
      loadMateriau();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStockStatus = () => {
    if (!materiau) return { color: 'bg-gray-100 text-gray-700', text: 'Inconnu' };
    if (materiau.quantite <= 0) return { color: 'bg-red-100 text-red-700', text: 'Rupture de stock' };
    if (materiau.quantite <= materiau.seuil_alerte) return { color: 'bg-yellow-100 text-yellow-700', text: 'Stock bas' };
    return { color: 'bg-green-100 text-green-700', text: 'Stock normal' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement du matériau...</p>
        </div>
      </div>
    );
  }

  if (error || !materiau) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error || 'Matériau non trouvé'}</p>
          <Link
            href="/dashboard/btp/materiaux"
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/btp/materiaux"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900">{materiau.nom}</h1>
              <span className={`px-3 py-1 rounded-full text-sm ${stockStatus.color}`}>
                {stockStatus.text}
              </span>
            </div>
            <p className="text-gray-600 mt-1">Code: {materiau.code_materiau}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link
            href={`/dashboard/btp/materiaux/${materiauId}/edit`}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Link>
        </div>
      </div>

      {/* Informations principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte informations */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations générales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Catégorie</p>
                <p className="font-medium">{materiau.categorie || '-'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Fournisseur</p>
                <p className="font-medium">{materiau.fournisseur || '-'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Localisation</p>
                <p className="font-medium">{materiau.localisation || 'Non spécifiée'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Prix unitaire</p>
                <p className="font-medium">{materiau.prix_unitaire} € / {materiau.unite}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Carte stock */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Gestion du stock</h3>
          
          <div className="text-center mb-6">
            <p className="text-4xl font-bold">{materiau.quantite}</p>
            <p className="text-blue-100">{materiau.unite}</p>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Seuil d'alerte</span>
              <span className="font-bold">{materiau.seuil_alerte} {materiau.unite}</span>
            </div>
            <div className="flex justify-between">
              <span>Valeur totale</span>
              <span className="font-bold">{(materiau.quantite * materiau.prix_unitaire).toLocaleString()} €</span>
            </div>
          </div>

          {!showAddStock ? (
            <button
              onClick={() => setShowAddStock(true)}
              className="w-full mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              Ajuster le stock
            </button>
          ) : (
            <div className="mt-4 space-y-3">
              <input
                type="number"
                value={stockToAdd}
                onChange={(e) => setStockToAdd(parseInt(e.target.value) || 0)}
                min="0"
                className="w-full px-3 py-2 text-gray-900 rounded-lg"
                placeholder="Quantité"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleAddStock}
                  className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-sm"
                >
                  + Ajouter
                </button>
                <button
                  onClick={handleRemoveStock}
                  className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm"
                >
                  - Retirer
                </button>
                <button
                  onClick={() => setShowAddStock(false)}
                  className="px-3 py-2 bg-gray-500 hover:bg-gray-600 rounded-lg text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Historique (simulé pour l'instant) */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <History className="w-5 h-5 mr-2" />
          Historique des mouvements
        </h3>
        
        <div className="space-y-3">
          <p className="text-gray-500 text-center py-4">
            Fonctionnalité à venir - Historique des entrées/sorties
          </p>
        </div>
      </div>
    </div>
  );
}