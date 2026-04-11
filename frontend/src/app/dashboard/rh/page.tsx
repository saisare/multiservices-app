'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users, FileText, Calendar, Star, TrendingUp,
  UserPlus, UserMinus, Briefcase, Clock,
  CheckCircle, AlertCircle, Plus, Download,
  Filter, Search, BarChart3, Award, PieChart
} from 'lucide-react';
import { rhApi } from '@/services/api/rh.api';

interface DashboardStats {
  totalEmployes: number;
  hommes: number;
  femmes: number;
  actifs: number;
  enConges: number;
  nouveauxMois: number;
  contratsCDI: number;
  contratsCDD: number;
  tauxAbsenteisme: number;
  satisfactionMoyenne: number;
}

interface CongeEnCours {
  id: number;
  employe: string;
  type: string;
  date_debut: string;
  date_fin: string;
  statut: string;
}

interface Alerte {
  id: number;
  type: string;
  message: string;
  priorite: 'HAUTE' | 'MOYENNE' | 'BASSE';
}

export default function RHDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployes: 0,
    hommes: 0,
    femmes: 0,
    actifs: 0,
    enConges: 0,
    nouveauxMois: 0,
    contratsCDI: 0,
    contratsCDD: 0,
    tauxAbsenteisme: 0,
    satisfactionMoyenne: 0
  });

  const [congesEnCours, setCongesEnCours] = useState<CongeEnCours[]>([]);

  const [alertes, setAlertes] = useState<Alerte[]>([
    { id: 1, type: 'Contrat', message: 'Contrat CDD de Marie Diallo expire dans 15 jours', priorite: 'HAUTE' },
    { id: 2, type: 'Formation', message: 'Jean Konan doit effectuer sa formation annuelle', priorite: 'MOYENNE' },
    { id: 3, type: 'Évaluation', message: 'Évaluation semestrielle en retard pour 3 employés', priorite: 'BASSE' },
  ]);

  useEffect(() => {
    const loadDashboard = async () => {
      const [statsData, congesData] = await Promise.all([
        rhApi.getStats(),
        rhApi.getConges(),
      ]);

      const totalEmployes = Number(statsData.total_employes || 0);
      const enConges = Number(statsData.en_conges || 0);

      setStats({
        totalEmployes,
        hommes: 0,
        femmes: 0,
        actifs: totalEmployes,
        enConges,
        nouveauxMois: Number(statsData.nouveaux_employes || 0),
        contratsCDI: Number(statsData.contrats_cdi || 0),
        contratsCDD: Number(statsData.contrats_cdd || 0),
        tauxAbsenteisme: totalEmployes ? Number(((enConges / totalEmployes) * 100).toFixed(1)) : 0,
        satisfactionMoyenne: Number(statsData.satisfaction_moyenne || 0)
      });

      const currentLeaves = (congesData || [])
        .filter((conge) => conge.statut === 'VALIDE')
        .slice(0, 5)
        .map((conge) => ({
          id: conge.id,
          employe: [conge.employe_prenom, conge.employe_nom].filter(Boolean).join(' ').trim() || `Employé #${conge.employe_id}`,
          type: conge.type_conge,
          date_debut: conge.date_debut,
          date_fin: conge.date_fin,
          statut: conge.statut
        }));

      setCongesEnCours(currentLeaves);

      setAlertes([
        { id: 1, type: 'Congés', message: `${statsData.conges_attente || 0} demande(s) de congé en attente`, priorite: Number(statsData.conges_attente || 0) > 0 ? 'HAUTE' : 'BASSE' },
        { id: 2, type: 'Contrats', message: `${statsData.total_contrats || 0} contrat(s) enregistrés`, priorite: 'MOYENNE' },
        { id: 3, type: 'Documents', message: `${statsData.total_documents || 0} document(s) RH archivés`, priorite: 'BASSE' },
      ]);
    };

    loadDashboard();
  }, []);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ressources Humaines</h1>
          <p className="text-gray-600 mt-2">Gestion du personnel et des carrières</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/dashboard/rh/employes?action=new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
            <UserPlus className="w-4 h-4 mr-2" />
            Nouvel employé
          </Link>
          <Link href="/dashboard/rh/contrats?action=new" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Nouveau contrat
          </Link>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <Users className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{stats.totalEmployes}</span>
          </div>
          <p className="mt-2 text-sm opacity-90">Employés</p>
          <p className="text-xs mt-1">{stats.hommes} H - {stats.femmes} F</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <Briefcase className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{stats.contratsCDI}</span>
          </div>
          <p className="mt-2 text-sm opacity-90">CDI</p>
          <p className="text-xs mt-1">{stats.contratsCDD} CDD</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <Calendar className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{stats.enConges}</span>
          </div>
          <p className="mt-2 text-sm opacity-90">En congés</p>
          <p className="text-xs mt-1">Taux: {stats.tauxAbsenteisme}%</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <Star className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{stats.satisfactionMoyenne}/5</span>
          </div>
          <p className="mt-2 text-sm opacity-90">Satisfaction</p>
          <p className="text-xs mt-1">+0.3 vs trimestre dernier</p>
        </div>
      </div>

      {/* Deuxième ligne */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Nouveaux ce mois</p>
              <p className="text-2xl font-bold">{stats.nouveauxMois}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <UserMinus className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-600">Départs ce mois</p>
              <p className="text-2xl font-bold">2</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600">Ancienneté moyenne</p>
              <p className="text-2xl font-bold">4.2 ans</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Formations suivies</p>
              <p className="text-2xl font-bold">24</p>
            </div>
          </div>
        </div>
      </div>

      {/* Congés en cours et alertes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Congés en cours */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-500" />
              Congés en cours
            </h2>
            <Link href="/dashboard/rh/employes?tab=conges" className="text-sm text-blue-600 hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="space-y-3">
            {congesEnCours.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{c.employe}</p>
                  <p className="text-sm text-gray-600">{c.type} • {new Date(c.date_debut).toLocaleDateString()} → {new Date(c.date_fin).toLocaleDateString()}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${c.statut === 'VALIDE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {c.statut}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Alertes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
            Alertes
          </h2>
          <div className="space-y-3">
            {alertes.map(a => (
              <div key={a.id} className={`p-3 rounded-lg border-l-4 ${a.priorite === 'HAUTE' ? 'bg-red-50 border-red-500' : a.priorite === 'MOYENNE' ? 'bg-yellow-50 border-yellow-500' : 'bg-blue-50 border-blue-500'}`}>
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
          <Link href="/dashboard/rh/employes?action=new" className="flex flex-col items-center p-4 bg-white/10 hover:bg-white/20 rounded-lg">
            <UserPlus className="w-6 h-6 mb-2" />
            <span className="text-sm text-center">Embaucher</span>
          </Link>
          <Link href="/dashboard/rh/contrats?action=new" className="flex flex-col items-center p-4 bg-white/10 hover:bg-white/20 rounded-lg">
            <FileText className="w-6 h-6 mb-2" />
            <span className="text-sm text-center">Nouveau contrat</span>
          </Link>
          <Link href="/dashboard/rh/employes?tab=conges&action=new" className="flex flex-col items-center p-4 bg-white/10 hover:bg-white/20 rounded-lg">
            <Calendar className="w-6 h-6 mb-2" />
            <span className="text-sm text-center">Demande congé</span>
          </Link>
          <Link href="/dashboard/rh/contrats?tab=evaluations&action=new" className="flex flex-col items-center p-4 bg-white/10 hover:bg-white/20 rounded-lg">
            <Star className="w-6 h-6 mb-2" />
            <span className="text-sm text-center">Évaluation</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
