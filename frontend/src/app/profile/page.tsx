// frontend/src/app/profile/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Save, Bell, Lock, Palette, Settings as SettingsIcon, User, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { buildServiceBase } from '@/lib/runtime-api';

const AUTH_API_BASE = buildServiceBase(3002);

type AuthNotification = {
  id: number;
  type: string;
  title: string;
  message: string;
  created_at: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences'>('profile');

  const [user, setUser] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    hireDate: '',
    address: '',
    language: 'fr',
    profilePhoto: null as string | null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    lastPasswordChange: '2024-01-15',
    loginAttempts: 0,
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    weeklyReport: true,
    monthlyReport: true,
    upsell: false,
  });

  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'fr',
    timezone: 'Europe/Paris',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    compactView: false,
  });

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [notificationItems, setNotificationItems] = useState<AuthNotification[]>([]);

  // Charger la photo depuis localStorage au demarrage
  useEffect(() => {
    const savedPhoto = localStorage.getItem('profilePhoto');
    if (savedPhoto) {
      setTimeout(() => setPreviewPhoto(savedPhoto), 0);
    }

    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!savedUser || !token) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      const userId = parsedUser.id;

      setUser((current) => ({
        ...current,
        id: String(userId || ''),
        firstName: parsedUser.prenom || '',
        lastName: parsedUser.nom || '',
        email: parsedUser.email || '',
        phone: parsedUser.telephone || '',
        department: parsedUser.departement || '',
        position: parsedUser.poste || parsedUser.role || '',
        hireDate: parsedUser.date_creation || parsedUser.dernier_login || '',
        address: parsedUser.adresse || '',
      }));

      // Charger le profil complet depuis la BD
      fetch(`${AUTH_API_BASE}/api/auth/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setUser((current) => ({
              ...current,
              firstName: data.prenom || current.firstName,
              lastName: data.nom || current.lastName,
              email: data.email || current.email,
              phone: data.telephone || current.phone,
              department: data.departement || current.department,
              position: data.poste || current.position,
              hireDate: data.date_creation || current.hireDate,
              address: data.adresse || current.address,
            }));
          }
        })
        .catch((err) => console.error('Profile fetch error:', err))
        .finally(() => setLoading(false));

      // Charger les notifications
      fetch(`${AUTH_API_BASE}/api/auth/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (response) => {
          if (!response.ok) throw new Error('Impossible de charger les notifications');
          return response.json();
        })
        .then((data) => setNotificationItems(Array.isArray(data) ? data : []))
        .catch((error) => {
          console.error(error);
          setNotificationItems([]);
        });
    } catch {
      router.push('/login');
      return;
    }
  }, [router]);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez selectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image est trop grande (max 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewPhoto(reader.result as string);
      localStorage.setItem('profilePhoto', reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setSuccess('✅ Photo mise a jour avec succes!');
      setTimeout(() => setSuccess(''), 3000);
    }, 1500);
  };

  const removePhoto = () => {
    setPreviewPhoto(null);
    localStorage.removeItem('profilePhoto');
  };

  const handleSave = async () => {
    try {
      setError('');
      setSuccess('');
      const token = localStorage.getItem('token');

      const res = await fetch(`${AUTH_API_BASE}/api/auth/profile/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prenom: user.firstName,
          nom: user.lastName,
          telephone: user.phone,
          adresse: user.address,
          poste: user.position,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur sauvegarde');

      setSuccess('✅ Profil mis a jour avec succes!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError((err as Error).message || 'Erreur inconnue');
    }
  };

  const handlePasswordChange = async () => {
    try {
      setError('');
      setSuccess('');

      if (passwordData.new !== passwordData.confirm) {
        setError('Les mots de passe ne correspondent pas');
        return;
      }
      if (passwordData.new.length < 8) {
        setError('Le mot de passe doit contenir au moins 8 caracteres');
        return;
      }

      const token = localStorage.getItem('token');

      const res = await fetch(`${AUTH_API_BASE}/api/auth/change-password`, {
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

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur changement mot de passe');

      setSuccess('✅ Mot de passe change avec succes!');
      setShowPasswordChange(false);
      setPasswordData({ current: '', new: '', confirm: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError((err as Error).message || 'Erreur inconnue');
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${AUTH_API_BASE}/api/auth/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Erreur suppression notification');
      setNotificationItems(notificationItems.filter((n) => n.id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const clearAllNotifications = async () => {
    if (!confirm('Supprimer toutes les notifications ?')) return;

    try {
      const token = localStorage.getItem('token');
      const userId = user.id;

      const res = await fetch(`${AUTH_API_BASE}/api/auth/notifications/clear/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Erreur suppression');

      setNotificationItems([]);
      setSuccess('✅ Notifications supprimees');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError((err as Error).message || 'Erreur');
    }
  };

  const languages = [
    { code: 'fr', name: 'Francais' },
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
  ];

  const timezones = [
    'Europe/Paris',
    'Europe/London',
    'America/New_York',
    'Asia/Tokyo',
    'Australia/Sydney',
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-gray-600">Chargement du profil...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* En-tete */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-600 mt-2">Gerez vos informations personnelles et parametres</p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex gap-3 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex gap-3 p-4 bg-green-100 border border-green-300 rounded-lg text-green-700">
          <span>{success}</span>
        </div>
      )}

      {/* Onglets de navigation */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-2 border-b-2 font-medium transition-colors ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <User className="w-5 h-5 inline mr-2" />
            Profil
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-4 px-2 border-b-2 font-medium transition-colors ${
              activeTab === 'security'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Lock className="w-5 h-5 inline mr-2" />
            Securite
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-4 px-2 border-b-2 font-medium transition-colors relative ${
              activeTab === 'notifications'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Bell className="w-5 h-5 inline mr-2" />
            Notifications
            {notificationItems.length > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notificationItems.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-4 px-2 border-b-2 font-medium transition-colors ${
              activeTab === 'preferences'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Palette className="w-5 h-5 inline mr-2" />
            Preferences
          </button>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="space-y-6">
        {/* TAB: PROFIL */}
        {activeTab === 'profile' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Informations Personnelles</h2>
              <div className="flex space-x-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      <X className="w-4 h-4 inline mr-2" />
                      Annuler
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Save className="w-4 h-4 inline mr-2" />
                      Enregistrer
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <SettingsIcon className="w-4 h-4 inline mr-2" />
                    Modifier
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Photo de profil */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto mb-4">
                      {previewPhoto ? (
                        <img src={previewPhoto} alt="Photo de profil" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white text-4xl font-bold">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handlePhotoClick}
                      disabled={uploading}
                      className="absolute bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {uploading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>+</span>
                      )}
                    </button>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/jpeg,image/png,image/gif"
                      className="hidden"
                    />
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-gray-600 mb-2">{user.position}</p>

                  <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                    {user.department}
                  </div>

                  {previewPhoto && (
                    <button
                      onClick={removePhoto}
                      className="w-full mt-4 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                    >
                      Supprimer la photo
                    </button>
                  )}
                </div>
              </div>

              {/* Formulaire d'informations */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prenom</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={user.firstName}
                        onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{user.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={user.lastName}
                        onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{user.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <p className="text-gray-900 italic text-sm">{user.email} (non modifiable)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telephone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={user.phone}
                        onChange={(e) => setUser({ ...user, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{user.phone || '-'}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                    {isEditing ? (
                      <textarea
                        value={user.address}
                        onChange={(e) => setUser({ ...user, address: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    ) : (
                      <p className="text-gray-900">{user.address || '-'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SECURITE */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Parametres de Securite</h3>

              {/* Changement de mot de passe */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Mot de passe</h4>
                    <p className="text-sm text-gray-600">Dernier changement: {security.lastPasswordChange}</p>
                  </div>
                  <button
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    Changer
                  </button>
                </div>

                {showPasswordChange && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                    <input
                      type="password"
                      placeholder="Mot de passe actuel"
                      value={passwordData.current}
                      onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="password"
                      placeholder="Nouveau mot de passe"
                      value={passwordData.new}
                      onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="password"
                      placeholder="Confirmer le mot de passe"
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <div className="flex space-x-3">
                      <button
                        onClick={handlePasswordChange}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={() => setShowPasswordChange(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Vos Notifications</h3>
                {notificationItems.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                  >
                    <Trash2 className="w-4 h-4 inline mr-2" />
                    Tout effacer
                  </button>
                )}
              </div>

              {notificationItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune notification</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {notificationItems.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.title || item.type}</p>
                          <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{item.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(item.created_at).toLocaleString('fr-FR')}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteNotification(item.id)}
                          className="p-2 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Preferences de Notifications</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <div>
                    <h4 className="font-medium text-gray-900">Notifications par email</h4>
                    <p className="text-sm text-gray-600">Recevoir les mises a jour par e-mail</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailNotifications}
                    onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                    className="w-5 h-5"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <div>
                    <h4 className="font-medium text-gray-900">Notifications push</h4>
                    <p className="text-sm text-gray-600">Recevoir les notifications en temps reel</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.pushNotifications}
                    onChange={(e) => setNotifications({ ...notifications, pushNotifications: e.target.checked })}
                    className="w-5 h-5"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <div>
                    <h4 className="font-medium text-gray-900">Rapport hebdomadaire</h4>
                    <p className="text-sm text-gray-600">Resume des activites chaque semaine</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.weeklyReport}
                    onChange={(e) => setNotifications({ ...notifications, weeklyReport: e.target.checked })}
                    className="w-5 h-5"
                  />
                </label>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PREFERENCES */}
        {activeTab === 'preferences' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Preferences d'Affichage</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                <div className="flex space-x-4">
                  {['light', 'dark', 'auto'].map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setPreferences({ ...preferences, theme })}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        preferences.theme === theme
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {theme === 'light' ? 'Clair' : theme === 'dark' ? 'Sombre' : 'Auto'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Langue</label>
                <select
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Fuseau horaire</label>
                <select
                  value={preferences.timezone}
                  onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Format de date</label>
                <select
                  value={preferences.dateFormat}
                  onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Vue compacte</h4>
                  <p className="text-sm text-gray-600">Affichage plus condense</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.compactView}
                  onChange={(e) => setPreferences({ ...preferences, compactView: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Enregistrer les preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
