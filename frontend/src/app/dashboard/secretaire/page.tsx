'use client';

import { useEffect, useState } from 'react';
import { Calendar, CheckSquare, FileText } from 'lucide-react';

const CRM = [
  { id: 1, name: 'Alice', status: 'En attente' },
  { id: 2, name: 'Bob', status: 'Confirmé' }
];

export default function SecretaireDashboard() {
  const [notifications, setNotifications] = useState('');

  useEffect(() => {
    setNotifications('Accès CRM, tickets et support interne activé. Fonctions de création et mise à jour uniquement.');
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tableau de bord Sécrétaire</h1>
      <p className="text-gray-600">Workspace de support interne, gestion CRM simplifiée.</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border rounded-lg">Tickets ouverts: 12</div>
        <div className="p-4 bg-white border rounded-lg">Rendez-vous: 6</div>
        <div className="p-4 bg-white border rounded-lg">Demandes en cours: 4</div>
        <div className="p-4 bg-white border rounded-lg">Messages non lus: 23</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <article className="shadow rounded-lg p-4 border"><Calendar className="mb-2" /> Calendrier</article>
        <article className="shadow rounded-lg p-4 border"><CheckSquare className="mb-2" /> Tâches</article>
      </div>

      <div className="rounded-lg border p-4 bg-emerald-50 text-emerald-700">📌 {notifications}</div>

      <div className="p-4 border rounded-lg bg-slate-50 text-sm text-gray-700">
        <p><strong>Contrainte</strong>: pas de gestion des utilisateurs, accès limité à la lecture des comptes pour filtrage et progression.</p>
      </div>
    </div>
  );
}
