'use client';

import { useEffect, useState } from 'react';
import { Users, ServerCog, Bell } from 'lucide-react';

interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  departement: string;
  role: string;
  actif: number;
  hidden?: number;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non connecté');

      const res = await fetch('http://localhost:3002/api/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Impossible de récupérer les utilisateurs');

      setUsers(data);
    } catch (err: unknown) {
      setError((err as Error).message || 'Erreur inconnue');
    }
  };

  const hideUser = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3002/api/auth/users/${id}/hide`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');

      setSuccess(data.message);
      fetchUsers();
    } catch (err: unknown) {
      setError((err as Error).message || 'Erreur inconnue');
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer définitivement cet utilisateur ?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3002/api/auth/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');

      setSuccess(data.message);
      fetchUsers();
    } catch (err: unknown) {
      setError((err as Error).message || 'Erreur inconnue');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Administration</h1>
      <p className="text-gray-600">Gestion des services, utilisateurs, logs et sauvegardes.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg"> <Users className="w-6 h-6"/> Utilisateurs: {users.length} </div>
        <div className="p-4 border rounded-lg"> <ServerCog className="w-6 h-6"/> Services : actif </div>
        <div className="p-4 border rounded-lg"> <Bell className="w-6 h-6"/> Notifications</div>
      </div>

      {error && <div className="p-3 bg-red-500/20 text-red-700">{error}</div>}
      {success && <div className="p-3 bg-green-500/20 text-green-700">{success}</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Département</th>
              <th className="px-3 py-2">Actif</th>
              <th className="px-3 py-2">Caché</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-t">
                <td className="px-3 py-2">{user.id}</td>
                <td className="px-3 py-2">{user.email}</td>
                <td className="px-3 py-2">{user.nom} {user.prenom}</td>
                <td className="px-3 py-2">{user.role}</td>
                <td className="px-3 py-2">{user.departement}</td>
                <td className="px-3 py-2">{user.actif ? 'Oui' : 'Non'}</td>
                <td className="px-3 py-2">{user.hidden ? 'Oui' : 'Non'}</td>
                <td className="px-3 py-2 space-x-1">
                  <button onClick={() => hideUser(user.id)} className="px-2 py-1 bg-amber-500 text-white rounded">Cacher</button>
                  <button onClick={() => deleteUser(user.id)} className="px-2 py-1 bg-red-600 text-white rounded">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
