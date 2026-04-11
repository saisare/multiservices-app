'use client';

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, CheckSquare, FileText, MessageSquare, Users } from 'lucide-react';
import {
  createAnnouncement,
  createDocumentTransfer,
  createInternalMessage,
  getAnnouncements,
  getDocumentTransfers,
  getInternalMessages,
  getMonitoringOverview,
  getNotifications,
  getPendingUsers,
  getUsers,
  type Announcement,
  type DocumentTransfer,
  type InternalMessage,
} from '@/services/api/admin.api';

type User = {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  departement: string;
  role: string;
  actif: number;
  hidden?: number;
};

export default function SecretaireDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [overview, setOverview] = useState<Record<string, number>>({});
  const [pendingCount, setPendingCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [messages, setMessages] = useState<InternalMessage[]>([]);
  const [documentTransfers, setDocumentTransfers] = useState<DocumentTransfer[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '', targetDepartment: 'all' });
  const [messageForm, setMessageForm] = useState({ subject: '', message: '', targetDepartment: 'pdg' });
  const [transferForm, setTransferForm] = useState({ recipientDepartment: 'pdg', title: '', documentType: 'Compte-rendu', referenceCode: '', notes: '' });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [data, monitoring, pendingUsers, notifications] = await Promise.all([
        getUsers(),
        getMonitoringOverview(),
        getPendingUsers(),
        getNotifications()
      ]);
      const [announcementRows, messageRows, documentRows] = await Promise.all([
        getAnnouncements('secretaire'),
        getInternalMessages(),
        getDocumentTransfers()
      ]);
      const crmUsers = data.filter((user: User) => user.role !== 'admin' && user.actif === 1);
      setUsers(crmUsers);
      setOverview(monitoring);
      setPendingCount(pendingUsers.length);
      setNotificationCount(notifications.length);
      setAnnouncements(announcementRows);
      setMessages(messageRows);
      setDocumentTransfers(documentRows);
      setError('');
    } catch (err: unknown) {
      setError((err as Error).message || 'Erreur CRM');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);
  const departments = useMemo(() => Array.from(new Set(users.map((user) => user.departement).filter(Boolean))), [users]);
  const agenda = useMemo(() => ([
    { time: '08:30', label: `${pendingCount} demande(s) d'accès à suivre` },
    { time: '10:00', label: `${notificationCount} notification(s) à traiter` },
    { time: '14:00', label: `${overview.total_sessions || 0} session(s) actives surveillées` },
    { time: '16:00', label: `${departments.length} département(s) en coordination` },
  ]), [departments.length, notificationCount, overview.total_sessions, pendingCount]);
  const tasks = useMemo(() => ([
    { id: 1, title: 'Contrôler les demandes en attente', status: pendingCount > 0 ? 'Prioritaire' : 'À jour', dept: 'auth' },
    { id: 2, title: 'Vérifier les notifications administratives', status: notificationCount > 0 ? 'En cours' : 'À jour', dept: 'admin' },
    { id: 3, title: 'Coordonner les services actifs', status: `${departments.length} service(s)`, dept: 'coordination' },
  ]), [departments.length, notificationCount, pendingCount]);
  const coordinationRows = useMemo(() => departments.map((department) => {
    const members = users.filter((user) => user.departement === department);
    return {
      department,
      active: members.length,
      contacts: members.slice(0, 2).map((member) => `${member.prenom} ${member.nom}`).join(', ') || 'Aucun contact'
    };
  }), [departments, users]);

  const handlePublishAnnouncement = async () => {
    try {
      await createAnnouncement(announcementForm);
      setAnnouncementForm({ title: '', message: '', targetDepartment: 'all' });
      setSuccess('Annonce enregistrée et diffusée.');
      await fetchUsers();
    } catch (err: unknown) {
      setError((err as Error).message || 'Impossible de publier l’annonce');
    }
  };

  const handleSendMessage = async () => {
    try {
      await createInternalMessage(messageForm);
      setMessageForm({ subject: '', message: '', targetDepartment: 'pdg' });
      setSuccess('Message transmis.');
      await fetchUsers();
    } catch (err: unknown) {
      setError((err as Error).message || 'Impossible d’envoyer le message');
    }
  };

  const handleTransferDocument = async () => {
    try {
      await createDocumentTransfer(transferForm);
      setTransferForm({ recipientDepartment: 'pdg', title: '', documentType: 'Compte-rendu', referenceCode: '', notes: '' });
      setSuccess('Document transmis.');
      await fetchUsers();
    } catch (err: unknown) {
      setError((err as Error).message || 'Impossible de transmettre le document');
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-teal-200 bg-gradient-to-br from-teal-50 via-white to-emerald-50 p-6 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-800">
            <Users className="h-4 w-4" />
            Secrétariat
          </div>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Coordination administrative</h1>
          <p className="mt-2 text-sm text-slate-600">Suivi des demandes, coordination opérationnelle et visibilité sur les comptes actifs.</p>
        </div>
      </section>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}
      {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{success}</div>}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Comptes suivis" value={String(users.length)} icon={<Users className="h-5 w-5 text-teal-600" />} />
        <Metric label="Demandes en attente" value={String(pendingCount)} icon={<CheckSquare className="h-5 w-5 text-teal-600" />} />
        <Metric label="Notifications" value={String(notificationCount)} icon={<CalendarDays className="h-5 w-5 text-teal-600" />} />
        <Metric label="Départements suivis" value={String(departments.length)} icon={<MessageSquare className="h-5 w-5 text-teal-600" />} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <CalendarDays className="h-5 w-5 text-teal-600" />
            Agenda du jour
          </h2>
          <div className="mt-5 space-y-3">
            {agenda.map((item) => (
              <div key={item.time} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="font-semibold text-slate-900">{item.time}</span>
                <span className="text-sm text-slate-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <CheckSquare className="h-5 w-5 text-teal-600" />
            Tâches internes
          </h2>
          <div className="mt-5 space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{task.title}</p>
                  <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-700">{task.status}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">Département: {task.dept}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <button
          onClick={() => router.push('/admin/notifications')}
          className="rounded-3xl border border-teal-200 bg-white p-5 text-left shadow-sm transition hover:border-teal-300 hover:bg-teal-50"
        >
          <p className="text-sm font-semibold text-slate-900">Traiter les validations</p>
          <p className="mt-2 text-sm text-slate-600">Accéder aux demandes en attente et aux notifications de diffusion.</p>
        </button>
        <button
          onClick={() => router.push('/profile')}
          className="rounded-3xl border border-teal-200 bg-white p-5 text-left shadow-sm transition hover:border-teal-300 hover:bg-teal-50"
        >
          <p className="text-sm font-semibold text-slate-900">Mettre à jour son profil</p>
          <p className="mt-2 text-sm text-slate-600">Actualiser la photo, les coordonnées et les préférences d’usage.</p>
        </button>
        <button
          onClick={() => router.push('/dashboard/directeur')}
          className="rounded-3xl border border-teal-200 bg-white p-5 text-left shadow-sm transition hover:border-teal-300 hover:bg-teal-50"
        >
          <p className="text-sm font-semibold text-slate-900">Transmettre à la direction</p>
          <p className="mt-2 text-sm text-slate-600">Remonter un blocage ou un compte nécessitant une restriction.</p>
        </button>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
          <FileText className="h-5 w-5 text-teal-600" />
          Comptes visibles pour suivi CRM
        </h2>
        <p className="mt-1 text-sm text-slate-500">Lecture limitée des comptes pour coordination et progression administrative.</p>

        {loading ? (
          <div className="flex justify-center py-16"><div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" /></div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Utilisateur</th>
                  <th className="px-4 py-3">Département</th>
                  <th className="px-4 py-3">Rôle</th>
                  <th className="px-4 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-900">{user.nom} {user.prenom}</div>
                      <div className="text-sm text-slate-500">{user.email}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">{user.departement}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{user.role}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{user.actif ? 'Actif' : 'Inactif'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Coordination interservices</h2>
        <p className="mt-1 text-sm text-slate-500">Lecture rapide des services à relancer et des interlocuteurs déjà actifs.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {coordinationRows.map((row) => (
            <div key={row.department} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold capitalize text-slate-900">{row.department}</p>
              <p className="mt-2 text-sm text-slate-600">{row.active} compte(s) actif(s)</p>
              <p className="mt-2 text-xs text-slate-500">Contacts visibles: {row.contacts}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Annonce de direction</h2>
          <p className="mt-1 text-sm text-slate-500">Diffuser une communication officielle vers un service ou l’ensemble des équipes.</p>
          <div className="mt-4 space-y-3">
            <input value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} placeholder="Titre de l'annonce" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            <select value={announcementForm.targetDepartment} onChange={(e) => setAnnouncementForm({ ...announcementForm, targetDepartment: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <option value="all">Tous les départements</option>
              {departments.map((department) => <option key={department} value={department}>{department}</option>)}
            </select>
            <textarea value={announcementForm.message} onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })} rows={4} placeholder="Message à diffuser" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            <button onClick={handlePublishAnnouncement} className="w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700">
              Publier l&apos;annonce
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Message interne</h2>
          <p className="mt-1 text-sm text-slate-500">Transmettre une note opérationnelle au PDG ou à un département.</p>
          <div className="mt-4 space-y-3">
            <input value={messageForm.subject} onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })} placeholder="Objet du message" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            <select value={messageForm.targetDepartment} onChange={(e) => setMessageForm({ ...messageForm, targetDepartment: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <option value="pdg">PDG</option>
              <option value="direction">Direction</option>
              {departments.map((department) => <option key={department} value={department}>{department}</option>)}
            </select>
            <textarea value={messageForm.message} onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })} rows={4} placeholder="Contenu du message" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            <button onClick={handleSendMessage} className="w-full rounded-full bg-teal-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-teal-700">
              Envoyer le message
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Transmission de document</h2>
          <p className="mt-1 text-sm text-slate-500">Tracer l’envoi d’un dossier ou compte-rendu vers un autre pôle.</p>
          <div className="mt-4 space-y-3">
            <select value={transferForm.recipientDepartment} onChange={(e) => setTransferForm({ ...transferForm, recipientDepartment: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <option value="pdg">PDG</option>
              {departments.map((department) => <option key={department} value={department}>{department}</option>)}
            </select>
            <input value={transferForm.title} onChange={(e) => setTransferForm({ ...transferForm, title: e.target.value })} placeholder="Intitulé du document" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            <input value={transferForm.referenceCode} onChange={(e) => setTransferForm({ ...transferForm, referenceCode: e.target.value })} placeholder="Référence interne" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            <textarea value={transferForm.notes} onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })} rows={3} placeholder="Commentaire ou consigne" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            <button onClick={handleTransferDocument} className="w-full rounded-full bg-cyan-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-cyan-700">
              Transmettre
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <FeedCard title="Annonces récentes" items={announcements.map((item) => ({ id: item.id, title: item.title, subtitle: item.target_department, body: item.message }))} />
        <FeedCard title="Messages internes" items={messages.map((item) => ({ id: item.id, title: item.subject, subtitle: item.target_department || 'Direct', body: item.message }))} />
        <FeedCard title="Documents transmis" items={documentTransfers.map((item) => ({ id: item.id, title: item.title, subtitle: item.recipient_department, body: item.notes || item.document_type }))} />
      </section>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
        Synthèse opérationnelle: {pendingCount} demande(s) en attente, {notificationCount} notification(s) et {users.length} compte(s) actifs visibles.
      </div>
    </div>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-3xl border border-teal-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-teal-50 p-3">{icon}</div>
        <span className="text-3xl font-bold text-slate-900">{value}</span>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-600">{label}</p>
    </div>
  );
}

function FeedCard({
  title,
  items,
}: {
  title: string;
  items: Array<{ id: number; title: string; subtitle: string; body: string }>;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">Aucune donnée pour le moment.</p>
        ) : (
          items.slice(0, 5).map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{item.subtitle}</p>
              <p className="mt-2 text-sm text-slate-600">{item.body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

