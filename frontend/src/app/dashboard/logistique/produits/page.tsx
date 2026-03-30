'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package, Truck, AlertTriangle, TrendingUp,
  Plus, Search, Edit, Trash2, Eye, Filter
} from 'lucide-react';

interface Produit {
  id: number;
  code_produit: string;
  nom: string;
  categorie: string;
  fournisseur: string;
  quantite: number;
  seuil_alerte: number;
  prix_unitaire: number;
  localisation: string;
}

export default function ProduitsPage() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('tous');

  useEffect(() => {
    // Simulation de chargement des données
    const timer = setTimeout(() => {
      setProduits([
        {
          id: 1,
          code_produit: 'PROD001',
          nom: 'Ciment Portland',
          categorie: 'Matériaux de construction',
          fournisseur: 'Ciments Français',
          quantite: 150,
          seuil_alerte: 50,
          prix_unitaire: 25.50,
          localisation: 'Entrepôt A'
        },
        {
          id: 2,
          code_produit: 'PROD002',
          nom: 'Acier profilé',
          categorie: 'Métaux',
          fournisseur: 'Métaux Industries',
          quantite: 25,
          seuil_alerte: 30,
          prix_unitaire: 85.00,
          localisation: 'Entrepôt B'
        },
        {
          id: 3,
          code_produit: 'PROD003',
          nom: 'Peinture acrylique',
          categorie: 'Peintures',
          fournisseur: 'Peintures & Co',
          quantite: 75,
          seuil_alerte: 20,
          prix_unitaire: 45.90,
          localisation: 'Entrepôt A'
        }
      ]);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const filteredProduits = produits.filter(produit => {
    const matchesSearch = produit.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produit.code_produit.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'tous' || produit.categorie === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['tous', ...new Set(produits.map(p => p.categorie))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Produits</h1>
          <p className="text-gray-600 mt-2">Liste et gestion de tous les produits en stock</p>
        </div>
        <Link
          href="/dashboard/logistique/produits/nouveau"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau produit
        </Link>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'tous' ? 'Toutes les catégories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Liste des produits */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localisation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProduits.map((produit) => (
                <tr key={produit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{produit.nom}</div>
                      <div className="text-sm text-gray-500">{produit.code_produit}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{produit.categorie}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${
                        produit.quantite <= produit.seuil_alerte ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {produit.quantite}
                      </span>
                      {produit.quantite <= produit.seuil_alerte && (
                        <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {produit.prix_unitaire.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {produit.localisation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-yellow-600 hover:text-yellow-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProduits.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
            <p className="text-gray-500">Essayez de modifier vos critères de recherche.</p>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <Package className="w-8 h-8 text-blue-500" />
            <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
              {produits.length}
            </span>
          </div>
          <p className="text-2xl font-bold mt-2">{produits.length}</p>
          <p className="text-sm text-gray-600">Produits totaux</p>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <span className="text-xs font-medium px-2 py-1 bg-red-100 text-red-700 rounded-full">
              {produits.filter(p => p.quantite <= p.seuil_alerte).length}
            </span>
          </div>
          <p className="text-2xl font-bold mt-2">{produits.filter(p => p.quantite <= p.seuil_alerte).length}</p>
          <p className="text-sm text-gray-600">Stock faible</p>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
              €{produits.reduce((sum, p) => sum + (p.quantite * p.prix_unitaire), 0).toLocaleString()}
            </span>
          </div>
          <p className="text-2xl font-bold mt-2">
            €{produits.reduce((sum, p) => sum + (p.quantite * p.prix_unitaire), 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Valeur du stock</p>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <Truck className="w-8 h-8 text-purple-500" />
            <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
              {produits.filter(p => p.quantite > p.seuil_alerte).length}
            </span>
          </div>
          <p className="text-2xl font-bold mt-2">{produits.filter(p => p.quantite > p.seuil_alerte).length}</p>
          <p className="text-sm text-gray-600">Stock normal</p>
        </div>
      </div>
    </div>
  );
}

  const [sinistresRecents, setSinistresRecents] = useState<SinistreRecent[]>([
    { id: 1, numero_sinistre: 'SIN-2024-001', assure_nom: 'Jean Konan', type_assurance: 'AUTO', date_sinistre: '2026-03-15', montant_estime: 2500, statut: 'EN_INSTRUCTION' },
    { id: 2, numero_sinistre: 'SIN-2024-002', assure_nom: 'Marie Diallo', type_assurance: 'HABITATION', date_sinistre: '2026-03-14', montant_estime: 800, statut: 'DECLARE' },
    { id: 3, numero_sinistre: 'SIN-2024-003', assure_nom: 'Amadou Touré', type_assurance: 'SANTE', date_sinistre: '2026-03-10', montant_estime: 450, statut: 'ACCEPTE' },
  ]);

  const [alertes, setAlertes] = useState<Alerte[]>([
    { id: 1, type: 'Echéance', message: 'Police AUTO-2024-001 expire dans 15 jours', priorite: 'HAUTE' },
    { id: 2, type: 'Sinistre', message: 'SIN-2024-001 en attente de validation expert', priorite: 'MOYENNE' },
    { id: 3, type: 'Document', message: 'Attestation pour SIN-2024-002 manquante', priorite: 'BASSE' },
  ]);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assurance</h1>
          <p className="text-gray-600 mt-2">Gestion des polices et sinistres</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/dashboard/assurance/assures?action=new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Nouvel assuré
          </Link>
          <Link href="/dashboard/assurance/polices?action=new" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Nouvelle police
          </Link>
          <Link href="/dashboard/assurance/sinistres?action=new" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Déclarer sinistre
          </Link>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <Users className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{stats.totalAssures}</span>
          </div>
          <p className="mt-2 text-sm opacity-90">Assurés</p>
          <p className="text-xs mt-1">{stats.policesActives} polices actives</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <DollarSign className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{stats.primeTotale.toLocaleString()} €</span>
          </div>
          <p className="mt-2 text-sm opacity-90">Primes annuelles</p>
          <p className="text-xs mt-1">+12% vs année dernière</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <AlertTriangle className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{stats.sinistresEnCours}</span>
          </div>
          <p className="mt-2 text-sm opacity-90">Sinistres en cours</p>
          <p className="text-xs mt-1">{stats.sinistresMois} ce mois</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{stats.tauxSinistralite}%</span>
          </div>
          <p className="mt-2 text-sm opacity-90">Taux de sinistralité</p>
          <p className="text-xs mt-1">-5% vs année dernière</p>
        </div>
      </div>

      {/* Sinistres récents et alertes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sinistres récents */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
              Sinistres récents
            </h2>
            <Link href="/dashboard/assurance/sinistres" className="text-sm text-blue-600 hover:underline">Voir tout</Link>
          </div>
          <div className="space-y-3">
            {sinistresRecents.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{s.numero_sinistre}</p>
                  <p className="text-sm text-gray-600">{s.assure_nom} - {s.type_assurance}</p>
                  <p className="text-xs text-gray-500">{new Date(s.date_sinistre).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{s.montant_estime} €</p>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    s.statut === 'ACCEPTE' ? 'bg-green-100 text-green-700' :
                    s.statut === 'EN_INSTRUCTION' ? 'bg-blue-100 text-blue-700' :
                    s.statut === 'DECLARE' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>{s.statut}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-red-500" />
            Alertes
          </h2>
          <div className="space-y-3">
            {alertes.map(a => (
              <div key={a.id} className={`p-3 rounded-lg border-l-4 ${
                a.priorite === 'HAUTE' ? 'bg-red-50 border-red-500' :
                a.priorite === 'MOYENNE' ? 'bg-yellow-50 border-yellow-500' :
                'bg-blue-50 border-blue-500'
              }`}>
                <p className="text-sm font-medium">{a.message}</p>
                <p className="text-xs text-gray-500 mt-1">{a.type}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-xl font-semibold mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/dashboard/assurance/assures?action=new" className="flex flex-col items-center p-4 bg-white/10 hover:bg-white/20 rounded-lg">
            <Users className="w-6 h-6 mb-2" />
            <span>Nouvel assuré</span>
          </Link>
          <Link href="/dashboard/assurance/polices?action=new" className="flex flex-col items-center p-4 bg-white/10 hover:bg-white/20 rounded-lg">
            <FileText className="w-6 h-6 mb-2" />
            <span>Nouvelle police</span>
          </Link>
          <Link href="/dashboard/assurance/sinistres?action=new" className="flex flex-col items-center p-4 bg-white/10 hover:bg-white/20 rounded-lg">
            <AlertTriangle className="w-6 h-6 mb-2" />
            <span>Déclarer sinistre</span>
          </Link>
          <Link href="/dashboard/assurance/experts" className="flex flex-col items-center p-4 bg-white/10 hover:bg-white/20 rounded-lg">
            <Users className="w-6 h-6 mb-2" />
            <span>Experts</span>
          </Link>
        </div>
      </div>
    </div>
  );
}