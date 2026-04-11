'use client';

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Bell, Camera, Lock, Palette, Save, ShieldCheck, Trash2, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { buildServiceBase } from '@/lib/runtime-api';

const AUTH_API_BASE = buildServiceBase(3002);

type ProfileTab = 'profile' | 'security' | 'notifications' | 'preferences';

type AuthNotification = {
  id: number;
  type: string;
  title: string;
  message: string;
  created_at: string;
  is_read?: number;
};

type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  hireDate: string;
  language: string;
  profilePhoto: string | null;
};

type UserPreferences = {
  theme: string;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  compactView: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  weeklyReport: boolean;
  monthlyReport: boolean;
};

const defaultPreferences: UserPreferences = {
  theme: 'light',
  language: 'fr',
  timezone: 'Africa/Lagos',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  compactView: false,
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  weeklyReport: true,
  monthlyReport: true,
};

const languages = [
  { code: 'fr', name: 'Francais' },
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
];

const timezones = ['Africa/Lagos', 'Europe/Paris', 'Europe/London', 'America/New_York'];

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [notificationItems, setNotificationItems] = useState<AuthNotification[]>([]);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [user, setUser] = useState<UserProfile>({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    hireDate: '',
    language: 'fr',
    profilePhoto: null,
  });
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

  useEffect(() => {
    const bootstrap = async () => {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (!savedUser || !token) {
        router.push('/login');
        return;
      }

      try {
        const parsedUser = JSON.parse(savedUser);
        const userId = String(parsedUser.id || '');

        const baseUser: UserProfile = {
          id: userId,
          firstName: parsedUser.prenom || '',
          lastName: parsedUser.nom || '',
          email: parsedUser.email || '',
          phone: parsedUser.telephone || '',
          department: parsedUser.departement || '',
          position: parsedUser.poste || parsedUser.role || '',
          hireDate: parsedUser.date_creation || parsedUser.dernier_login || '',
          language: parsedUser.langue || 'fr',
          profilePhoto: parsedUser.photo_profil || null,
        };

        setUser(baseUser);

        const headers = { Authorization: `Bearer ${token}` };
        const [profileRes, preferencesRes, notificationsRes] = await Promise.all([
          fetch(`${AUTH_API_BASE}/api/auth/profile/${userId}`, { headers }),
          fetch(`${AUTH_API_BASE}/api/auth/preferences/${userId}`, { headers }),
          fetch(`${AUTH_API_BASE}/api/auth/notifications`, { headers }),
        ]);

        if (profileRes.ok) {
          const profile = await profileRes.json();
          setUser((current) => ({
            ...current,
            firstName: profile.prenom || current.firstName,
            lastName: profile.nom || current.lastName,
            email: profile.email || current.email,
            phone: profile.telephone || current.phone,
            department: profile.departement || current.department,
            position: profile.poste || current.position,
            hireDate: profile.date_creation || current.hireDate,
            language: profile.langue || current.language,
            profilePhoto: profile.photo_profil || current.profilePhoto,
          }));
        }

        if (preferencesRes.ok) {
          const prefPayload = await preferencesRes.json();
          setPreferences((current) => ({ ...current, ...(prefPayload.preferences || {}) }));
        }

        if (notificationsRes.ok) {
          const notificationsPayload = await notificationsRes.json();
          setNotificationItems(notificationsPayload.notifications || []);
        }
      } catch (bootstrapError) {
        console.error('Profile bootstrap error:', bootstrapError);
        router.push('/login');
        return;
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [router]);

  const profileInitials = useMemo(
    () => `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.trim() || 'U',
    [user.firstName, user.lastName]
  );

  const pushSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  const updateLocalUser = (patch: Record<string, unknown>) => {
    const current = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({ ...current, ...patch }));
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La photo dépasse la taille maximale de 5 Mo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const nextPhoto = String(reader.result || '');
      setUser((current) => ({ ...current, profilePhoto: nextPhoto }));
      setIsEditing(true);
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await fetch(`${AUTH_API_BASE}/api/auth/profile/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prenom: user.firstName,
          nom: user.lastName,
          telephone: user.phone,
          poste: user.position,
          langue: preferences.language || user.language,
          photo_profil: user.profilePhoto,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Impossible de mettre à jour le profil.');
      }

      updateLocalUser({
        prenom: user.firstName,
        nom: user.lastName,
        telephone: user.phone,
        poste: user.position,
        langue: preferences.language || user.language,
        photo_profil: user.profilePhoto,
      });
      setIsEditing(false);
      pushSuccess('Profil mis à jour avec succès.');
    } catch (saveError) {
      setError((saveError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await fetch(`${AUTH_API_BASE}/api/auth/preferences/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(preferences),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Impossible d’enregistrer les préférences.');
      }

      setPreferences((current) => ({ ...current, ...(data.preferences || {}) }));
      setUser((current) => ({ ...current, language: data.preferences?.language || current.language }));
      updateLocalUser({ langue: data.preferences?.language || preferences.language });
      pushSuccess('Préférences enregistrées.');
    } catch (saveError) {
      setError((saveError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      setError('');

      if (passwordData.new !== passwordData.confirm) {
        setError('Les nouveaux mots de passe ne correspondent pas.');
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${AUTH_API_BASE}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.current,
          newPassword: passwordData.new,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Impossible de modifier le mot de passe.');
      }

      setPasswordData({ current: '', new: '', confirm: '' });
      setShowPasswordChange(false);
      pushSuccess('Mot de passe mis à jour.');
    } catch (passwordError) {
      setError((passwordError as Error).message);
    }
  };

  const markNotificationRead = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${AUTH_API_BASE}/api/auth/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotificationItems((current) => current.map((item) => (item.id === id ? { ...item, is_read: 1 } : item)));
    } catch (notificationError) {
      console.error(notificationError);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${AUTH_API_BASE}/api/auth/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotificationItems((current) => current.filter((item) => item.id !== id));
    } catch (notificationError) {
      setError('Impossible de supprimer cette notification.');
      console.error(notificationError);
    }
  };

  const clearNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${AUTH_API_BASE}/api/auth/notifications/clear/${user.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotificationItems([]);
      pushSuccess('Notifications supprimées.');
    } catch (notificationError) {
      setError('Impossible de vider les notifications.');
      console.error(notificationError);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-3xl bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700" />
          <p className="text-slate-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-xl">
        <div className="flex flex-col gap-6 px-6 py-8 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:border-white/30 hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Espace personnel</p>
              <h1 className="mt-2 text-3xl font-semibold">Profil et préférences</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Gérez vos informations, votre photo, vos alertes et vos préférences d’usage depuis un seul espace.
              </p>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-200">
            <p className="font-medium">{user.firstName} {user.lastName}</p>
            <p>{user.position || 'Collaborateur'}</p>
            <p className="mt-1 text-slate-400">{user.department || 'Département non défini'}</p>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}
      {success ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
        <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-6 text-center">
            <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-lg">
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt="Photo de profil" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-3xl font-semibold text-white">
                  {profileInitials}
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white transition hover:bg-slate-700"
            >
              <Camera className="h-4 w-4" />
              Mettre à jour la photo
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>

          <nav className="space-y-2">
            {[
              { id: 'profile', label: 'Identité', icon: User },
              { id: 'security', label: 'Sécurité', icon: ShieldCheck },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'preferences', label: 'Préférences', icon: Palette },
            ].map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as ProfileTab)}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                    active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="inline-flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  {item.id === 'notifications' && notificationItems.length > 0 ? (
                    <span className={`rounded-full px-2 py-0.5 text-xs ${active ? 'bg-white/15' : 'bg-slate-200'}`}>
                      {notificationItems.length}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          {activeTab === 'profile' ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Identité professionnelle</h2>
                  <p className="mt-1 text-sm text-slate-500">Les informations affichées ici sont synchronisées avec `auth_db.users`.</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsEditing((value) => !value)}
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    {isEditing ? 'Annuler' : 'Modifier'}
                  </button>
                  <button
                    onClick={saveProfile}
                    disabled={!isEditing || saving}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    Enregistrer
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { label: 'Prénom', value: user.firstName, key: 'firstName' },
                  { label: 'Nom', value: user.lastName, key: 'lastName' },
                  { label: 'Email', value: user.email, key: 'email', disabled: true },
                  { label: 'Téléphone', value: user.phone, key: 'phone' },
                  { label: 'Département', value: user.department, key: 'department', disabled: true },
                  { label: 'Poste', value: user.position, key: 'position' },
                ].map((field) => (
                  <label key={field.key} className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">{field.label}</span>
                    <input
                      value={field.value}
                      disabled={!isEditing || field.disabled}
                      onChange={(event) => setUser((current) => ({ ...current, [field.key]: event.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 disabled:cursor-not-allowed disabled:text-slate-500"
                    />
                  </label>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <InfoCard label="Compte" value={user.email} />
                <InfoCard label="Création" value={user.hireDate ? new Date(user.hireDate).toLocaleDateString('fr-FR') : 'Non renseignée'} />
                <InfoCard label="Langue active" value={preferences.language.toUpperCase()} />
              </div>
            </div>
          ) : null}

          {activeTab === 'security' ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Sécurité du compte</h2>
                  <p className="mt-1 text-sm text-slate-500">Le mot de passe reste stocké sous forme sécurisée dans la base.</p>
                </div>
                <button
                  onClick={() => setShowPasswordChange((value) => !value)}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white transition hover:bg-slate-700"
                >
                  <Lock className="h-4 w-4" />
                  {showPasswordChange ? 'Fermer' : 'Changer le mot de passe'}
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <InfoCard label="Chiffrement" value="bcrypt" />
                <InfoCard label="Accès restreints" value="Admin / Direction" />
                <InfoCard label="État du compte" value="Actif" />
              </div>

              {showPasswordChange ? (
                <div className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <input
                    type="password"
                    placeholder="Mot de passe actuel"
                    value={passwordData.current}
                    onChange={(event) => setPasswordData((current) => ({ ...current, current: event.target.value }))}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-400"
                  />
                  <input
                    type="password"
                    placeholder="Nouveau mot de passe"
                    value={passwordData.new}
                    onChange={(event) => setPasswordData((current) => ({ ...current, new: event.target.value }))}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-400"
                  />
                  <input
                    type="password"
                    placeholder="Confirmer le nouveau mot de passe"
                    value={passwordData.confirm}
                    onChange={(event) => setPasswordData((current) => ({ ...current, confirm: event.target.value }))}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-400"
                  />
                  <button
                    onClick={handlePasswordChange}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-amber-400"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Valider la mise à jour
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          {activeTab === 'notifications' ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Centre de notifications</h2>
                  <p className="mt-1 text-sm text-slate-500">Les messages ci-dessous proviennent directement de `auth_db.notifications`.</p>
                </div>
                <button
                  onClick={clearNotifications}
                  className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Vider
                </button>
              </div>

              {notificationItems.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-500">
                  Aucune notification à traiter pour le moment.
                </div>
              ) : (
                <div className="space-y-3">
                  {notificationItems.map((item) => (
                    <article key={item.id} className="rounded-3xl border border-slate-200 p-5 transition hover:border-slate-300">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.is_read ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'}`}>
                              {item.is_read ? 'Lu' : 'Nouveau'}
                            </span>
                            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.type}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                          <p className="text-sm text-slate-600">{item.message}</p>
                          <p className="text-xs text-slate-400">{new Date(item.created_at).toLocaleString('fr-FR')}</p>
                        </div>
                        <div className="flex gap-2">
                          {!item.is_read ? (
                            <button
                              onClick={() => markNotificationRead(item.id)}
                              className="rounded-full border border-emerald-200 px-3 py-2 text-sm text-emerald-700 transition hover:bg-emerald-50"
                            >
                              Marquer lu
                            </button>
                          ) : null}
                          <button
                            onClick={() => deleteNotification(item.id)}
                            className="rounded-full border border-red-200 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {activeTab === 'preferences' ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Préférences d’usage</h2>
                  <p className="mt-1 text-sm text-slate-500">Ces réglages sont enregistrés en base et retrouvés à la prochaine connexion.</p>
                </div>
                <button
                  onClick={savePreferences}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white transition hover:bg-slate-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  Enregistrer
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Langue d’utilisation</span>
                  <select
                    value={preferences.language}
                    onChange={(event) => setPreferences((current) => ({ ...current, language: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400"
                  >
                    {languages.map((language) => (
                      <option key={language.code} value={language.code}>{language.name}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Fuseau horaire</span>
                  <select
                    value={preferences.timezone}
                    onChange={(event) => setPreferences((current) => ({ ...current, timezone: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400"
                  >
                    {timezones.map((timezone) => (
                      <option key={timezone} value={timezone}>{timezone}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <ToggleCard
                  label="Notifications par email"
                  value={preferences.emailNotifications}
                  onChange={(value) => setPreferences((current) => ({ ...current, emailNotifications: value }))}
                />
                <ToggleCard
                  label="Notifications instantanées"
                  value={preferences.pushNotifications}
                  onChange={(value) => setPreferences((current) => ({ ...current, pushNotifications: value }))}
                />
                <ToggleCard
                  label="Alertes SMS"
                  value={preferences.smsNotifications}
                  onChange={(value) => setPreferences((current) => ({ ...current, smsNotifications: value }))}
                />
                <ToggleCard
                  label="Vue compacte"
                  value={preferences.compactView}
                  onChange={(value) => setPreferences((current) => ({ ...current, compactView: value }))}
                />
                <ToggleCard
                  label="Rapport hebdomadaire"
                  value={preferences.weeklyReport}
                  onChange={(value) => setPreferences((current) => ({ ...current, weeklyReport: value }))}
                />
                <ToggleCard
                  label="Rapport mensuel"
                  value={preferences.monthlyReport}
                  onChange={(value) => setPreferences((current) => ({ ...current, monthlyReport: value }))}
                />
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function ToggleCard({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-3xl border border-slate-200 p-4">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative h-8 w-14 rounded-full transition ${value ? 'bg-emerald-500' : 'bg-slate-200'}`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${value ? 'left-7' : 'left-1'}`}
        />
      </button>
    </div>
  );
}
