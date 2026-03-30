// frontend/src/app/dashboard/[department]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DepartmentDashboard() {
  const params = useParams();
  const department = params.department as string;
  const [stats, setStats] = useState<any>(null);

  // Données fictives selon le département
  const getDepartmentData = () => {
    const baseStats = {
      revenue: 125000,
      clients: 45,
      activeServices: 23,
      pendingTasks: 8,
      completionRate: 85,
      satisfaction: 4.2
    };

    switch (department) {
      case 'pdg':
        return {
          ...baseStats,
          title: 'Tableau de Bord Direction',
          subtitle: 'Vue globale de toutes les activités',
          metrics: [
            { label: 'Chiffre d\'affaires', value: '125,000 €', change: '+12%' },
            { label: 'Clients totaux', value: '342', change: '+8%' },
            { label: 'Services actifs', value: '156', change: '+5%' },
            { label: 'Croissance', value: '18.5%', change: '+3%' },
          ]
        };
      
      case 'secretaire':
        return {
          ...baseStats,
          title: 'Secrétariat',
          subtitle: 'Gestion administrative et clients',
          metrics: [
            { label: 'Nouveaux clients', value: '12', change: '+3' },
            { label: 'RDV aujourd\'hui', value: '7', change: 'Maintenant' },
            { label: 'Tâches terminées', value: '18/24', change: '75%' },
            { label: 'À traiter', value: '6', change: 'Urgent' },
          ]
        };
      
      case 'voyage':
        return {
          ...baseStats,
          title: 'Service Voyage',
          subtitle: 'Réservations et voyages',
          metrics: [
            { label: 'Destinations', value: '24', change: '+3' },
            { label: 'Voyageurs', value: '89', change: '+12' },
            { label: 'Réservations', value: '45,000 €', change: '+15%' },
            { label: 'Vols confirmés', value: '32', change: '100%' },
          ]
        };

      default:
        return {
          ...baseStats,
          title: `Département ${department}`,
          subtitle: 'Tableau de bord',
          metrics: [
            { label: 'Clients', value: baseStats.clients, change: '+5%' },
            { label: 'CA du mois', value: `${baseStats.revenue.toLocaleString()} €`, change: '+8%' },
            { label: 'Taux de réussite', value: `${baseStats.completionRate}%`, change: '+2%' },
            { label: 'Satisfaction', value: `${baseStats.satisfaction}/5`, change: '+0.3' },
          ]
        };
    }
  };

  useEffect(() => {
    // Simuler chargement des données
    setTimeout(() => {
      setStats(getDepartmentData());
    }, 500);
  }, [department]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{stats.title}</h1>
        <p className="text-gray-600 mt-2">{stats.subtitle}</p>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.metrics.map((metric: any, index: number) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium px-3 py-1 bg-green-50 text-green-700 rounded-full">
                {metric.change}
              </span>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {metric.value}
            </h3>
            <p className="text-sm text-gray-600">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* Section activité récente */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Activité récente</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Voir tout →
          </button>
        </div>

        <div className="space-y-4">
          {[
            { action: 'Nouveau client ajouté', user: 'Marie Dubois', time: 'Il y a 10 min', department: 'secretaire' },
            { action: 'Réservation confirmée', user: 'Jean Martin', time: 'Il y a 25 min', department: 'voyage' },
            { action: 'Visa approuvé', user: 'Ahmed Khan', time: 'Il y a 1 heure', department: 'immigration' },
            { action: 'Contrat signé', user: 'SARL Tech', time: 'Il y a 2 heures', department: 'assurance' },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {activity.user.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.user} • {activity.time}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm capitalize">
                {activity.department}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-semibold mb-4">Actions rapides</h3>
          <div className="space-y-3">
            <button className="w-full bg-white/20 hover:bg-white/30 p-3 rounded-lg text-left transition-colors">
              Ajouter un nouveau client
            </button>
            <button className="w-full bg-white/20 hover:bg-white/30 p-3 rounded-lg text-left transition-colors">
              Créer un nouveau dossier
            </button>
            <button className="w-full bg-white/20 hover:bg-white/30 p-3 rounded-lg text-left transition-colors">
              Planifier un rendez-vous
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-semibold mb-4">Statistiques du mois</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span>Nouveaux clients</span>
                <span>78%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-white h-2 rounded-full" style={{ width: '78%' }} />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>Dossiers traités</span>
                <span>92%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-white h-2 rounded-full" style={{ width: '92%' }} />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>Rendez-vous confirmés</span>
                <span>85%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-white h-2 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
