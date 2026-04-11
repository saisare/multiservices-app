'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { buildServiceBase } from '@/lib/runtime-api';
import {
  Lock, Eye, EyeOff, ArrowRight, Building2, Globe, Shield,
  AlertCircle, CheckCircle, Loader, Users, Share2,
  Mail, User, Bell, Clock
} from 'lucide-react';

// Liste des départements
const DEPARTMENTS = [
  { id: 'pdg', name: 'PDG / Direction Générale', icon: '👑' },
  { id: 'secretaire', name: 'Secrétariat', icon: '📋' },
  { id: 'assurance', name: 'Service Assurance', icon: '🛡️' },
  { id: 'btp', name: 'BTP & Construction', icon: '🏗️' },
  { id: 'rh', name: 'Ressources Humaines', icon: '👥' },
  { id: 'voyage', name: 'Service Voyage & Immigration', icon: '✈️' },
  { id: 'logistique', name: 'Service Logistique', icon: '🚚' },
  { id: 'communication', name: 'Communication Digitale', icon: '📱' },
];

// Langues disponibles
const LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

const AUTH_API_BASE = buildServiceBase(3002);

interface LoginResponse {
  success: boolean;
  message: string;
  tempToken?: string;
  needsPasswordChange?: boolean;
  token?: string;
  user?: any;
  isShared?: boolean;
  ownerName?: string;
}

const normalizeDepartmentRoute = (value: string) => {
  const normalized = (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  const aliases: Record<string, string> = {
    pdg: 'pdg',
    direction: 'pdg',
    'direction generale': 'pdg',
    'pdg direction generale': 'pdg',
    secretaire: 'secretaire',
    secretariat: 'secretaire',
    assurance: 'assurance',
    'service assurance': 'assurance',
    btp: 'btp',
    construction: 'btp',
    'btp construction': 'btp',
    rh: 'rh',
    'ressources humaines': 'rh',
    voyage: 'voyage',
    immigration: 'voyage',
    'service voyage immigration': 'voyage',
    'service voyage et immigration': 'voyage',
    'service voyage': 'voyage',
    logistique: 'logistique',
    communication: 'communication',
    'communication digitale': 'communication'
  };

  return aliases[normalized] || normalized || 'dashboard';
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // États
  const [loginMode, setLoginMode] = useState<'normal' | 'create' | 'share'>('normal');
  const [step, setStep] = useState(1);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [language, setLanguage] = useState('fr');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const departmentFromUrl = searchParams.get('department');
    if (departmentFromUrl && DEPARTMENTS.some((dept) => dept.id === departmentFromUrl)) {
      setSelectedDepartment(departmentFromUrl);
    }
  }, [searchParams]);

  // États pour création de compte
  const [newUser, setNewUser] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    poste: '',
    departement: '',
    password: '',
    confirmPassword: ''
  });

  // États pour partage de compte
  const [shareEmail, setShareEmail] = useState('');
  const [sharePassword, setSharePassword] = useState('');
  const [showSharePassword, setShowSharePassword] = useState(false);
  const [shareReason, setShareReason] = useState('');
  const [shareDuration, setShareDuration] = useState('15'); // minutes

  // Traductions
  const translations = {
    fr: {
      welcome: 'Bienvenue chez',
      companyName: 'BLG-ENGINEERING',
      normalLogin: 'Connexion normale',
      createAccount: 'Créer un compte',
      shareAccount: 'Partager un compte',
      selectDepartment: 'Sélectionnez votre département',
      email: 'Adresse email',
      password: 'Mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      firstName: 'Prénom',
      lastName: 'Nom',
      phone: 'Téléphone',
      position: 'Poste',
      shareWith: 'Partager avec',
      shareReason: 'Motif du partage',
      shareDuration: 'Durée du partage (minutes)',
      continue: 'Continuer',
      login: 'Se connecter',
      create: 'Créer mon compte',
      share: 'Partager le compte',
      requestSent: 'Demande envoyée',
      pendingApproval: 'En attente d\'approbation',
      notifications: 'Notifications',
      errorEmailRequired: 'Email requis',
      errorPasswordRequired: 'Mot de passe requis',
      errorPasswordMatch: 'Les mots de passe ne correspondent pas',
      errorDepartmentRequired: 'Veuillez sélectionner un département',
      shareSuccess: 'Demande de partage envoyée. Vous serez notifié quand elle sera approuvée.',
      createSuccess: 'Compte créé avec succès! ✅\n\nVotre demande a été enregistrée et est en attente de validation par l\'administration.\n\nVous recevrez un email de confirmation dès approbation. Vous pourrez alors vous connecter avec vos identifiants.'
    },
    en: {
      welcome: 'Welcome to',
      companyName: 'BLG-ENGINEERING',
      normalLogin: 'Normal login',
      createAccount: 'Create account',
      shareAccount: 'Share account',
      selectDepartment: 'Select your department',
      email: 'Email address',
      password: 'Password',
      confirmPassword: 'Confirm password',
      firstName: 'First name',
      lastName: 'Last name',
      phone: 'Phone',
      position: 'Position',
      shareWith: 'Share with',
      shareReason: 'Reason for sharing',
      shareDuration: 'Share duration (minutes)',
      continue: 'Continue',
      login: 'Login',
      create: 'Create account',
      share: 'Share account',
      requestSent: 'Request sent',
      pendingApproval: 'Pending approval',
      notifications: 'Notifications',
      errorEmailRequired: 'Email required',
      errorPasswordRequired: 'Password required',
      errorPasswordMatch: 'Passwords do not match',
      errorDepartmentRequired: 'Please select a department',
      shareSuccess: 'Share request sent. You will be notified when approved.',
      createSuccess: 'Account created successfully! ✅\n\nYour request has been recorded and is pending administration approval.\n\nYou will receive a confirmation email as soon as it is approved. You will then be able to log in with your credentials.'
    },
    de: {
      welcome: 'Willkommen bei',
      companyName: 'BLG-ENGINEERING',
      normalLogin: 'Normale Anmeldung',
      createAccount: 'Konto erstellen',
      shareAccount: 'Konto teilen',
      selectDepartment: 'Wählen Sie Ihre Abteilung',
      email: 'E-Mail-Adresse',
      password: 'Passwort',
      confirmPassword: 'Passwort bestätigen',
      firstName: 'Vorname',
      lastName: 'Nachname',
      phone: 'Telefon',
      position: 'Position',
      shareWith: 'Teilen mit',
      shareReason: 'Grund für die Freigabe',
      shareDuration: 'Freigabedauer (Minuten)',
      continue: 'Weiter',
      login: 'Anmelden',
      create: 'Konto erstellen',
      share: 'Konto teilen',
      requestSent: 'Anfrage gesendet',
      pendingApproval: 'Warten auf Genehmigung',
      notifications: 'Benachrichtigungen',
      errorEmailRequired: 'E-Mail erforderlich',
      errorPasswordRequired: 'Passwort erforderlich',
      errorPasswordMatch: 'Passwörter stimmen nicht überein',
      errorDepartmentRequired: 'Bitte wählen Sie eine Abteilung',
      shareSuccess: 'Freigabeanfrage gesendet. Sie werden benachrichtigt.',
      createSuccess: 'Konto erstellt! ✅\n\nIhre Anfrage wurde registriert und wartet auf Verwaltungsgenehmigung.\n\nSie erhalten eine Bestätigungs-E-Mail sobald genehmigt. Dann können Sie sich mit Ihren Anmeldedaten anmelden.'
    }
  };

  const t = translations[language as keyof typeof translations];

  // Fonction de validation mot de passe fort
  const isStrongPassword = (pwd: string): boolean => {
    const minLength = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  };

  // Fonction pour calculer la force du mot de passe
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    const checks = {
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    };

    // Calculer le score
    if (checks.length) score += 20;
    if (checks.upper) score += 20;
    if (checks.lower) score += 20;
    if (checks.number) score += 20;
    if (checks.special) score += 20;

    // Déterminer le niveau
    let level = 'faible';
    let color = 'bg-red-500';
    if (score >= 80) {
      level = 'très fort';
      color = 'bg-green-500';
    } else if (score >= 60) {
      level = 'fort';
      color = 'bg-blue-500';
    } else if (score >= 40) {
      level = 'moyen';
      color = 'bg-yellow-500';
    }

    return { score, level, color, checks };
  };

  // Connexion normale
  const handleNormalLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError(t.errorEmailRequired || 'Email et mot de passe requis');
      return;
    }

    if (!selectedDepartment) {
      setError('Veuillez sélectionner votre département');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${AUTH_API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, departement: selectedDepartment })
      });

      const data = await response.json();
      console.log('📔 Login response:', data);

      if (!response.ok) {
        console.error('❌ Login failed:', data);
        throw new Error(data.error || 'Erreur de connexion');
      }

      console.log('✅ Login successful, user:', data.user);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      const userDepartmentRoute = normalizeDepartmentRoute(data.user.departement || selectedDepartment);
      localStorage.setItem('departement', userDepartmentRoute);

      // Store token in cookie for middleware
      document.cookie = `auth_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;

      // Journaliser la connexion (non-bloquant - pas d'await)
      logConnection(data.user.id, email, selectedDepartment).catch(() => {
        // Ignorer les erreurs de logging - ne pas bloquer le login
      });

      const role = data.user.role || '';
      console.log('🎯 User role:', role, 'Department:', data.user.departement);

      if (role === 'admin') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('departement');
        document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
        console.log('➡️ Redirecting admin to dedicated entry /admin');
        router.push(`/admin-login?notice=use-admin-portal&email=${encodeURIComponent(email)}`);
      } else if (role === 'directeur') {
        console.log('Redirecting directeur to /dashboard/directeur');
        router.push('/dashboard/directeur');
      } else if (role === 'pdg') {
        console.log('➡️ Redirecting to /dashboard/pdg');
        router.push('/dashboard/pdg');
      } else if (role === 'secretaire') {
        console.log('➡️ Redirecting to /dashboard/secretaire');
        router.push('/dashboard/secretaire');
      } else {
        console.log('➡️ Redirecting to /dashboard/' + userDepartmentRoute);
        router.push(`/dashboard/${userDepartmentRoute}`);
      }
    } catch (err: any) {
      console.error('❌ Login error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Création de compte
  const handleCreateAccount = async () => {
    // Validation
    if (!newUser.nom || !newUser.prenom || !newUser.email || !newUser.password || !selectedDepartment) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!newUser.telephone) {
      setError('Le numéro de téléphone est obligatoire');
      return;
    }

    if (!newUser.poste) {
      setError('Le poste est obligatoire');
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      setError(t.errorPasswordMatch);
      return;
    }

    // Validation du mot de passe - alignée avec le backend
    if (!isStrongPassword(newUser.password)) {
      setError('Mot de passe trop faible. Il faut au moins 8 caractères, avec une majuscule, une minuscule, un chiffre et un caractère spécial.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Créer la demande de compte
      const response = await fetch(`${AUTH_API_BASE}/api/auth/request-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newUser,
          departement: selectedDepartment,
          status: 'pending'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Améliorer le message d'erreur 409
        if (response.status === 409) {
          if (data.error.includes('déjà utilisé')) {
            throw new Error('❌ Cet email est déjà utilisé par un compte existant.\n\nSi vous avez oublié votre mot de passe, cliquez sur "Connexion normale" et utilisez les outils de récupération.');
          } else if (data.error.includes('demande en attente')) {
            throw new Error('❌ Un compte avec cet email a déjà une demande en attente d\'approbation.\n\nVeuillez attendre la validation par l\'administration ou contacter le support.');
          }
        }
        throw new Error(data.error || 'Erreur lors de la création');
      }

      // Afficher le message de succès SEULEMENT si la création a réussi
      setSuccess(data.message || t.createSuccess);
      localStorage.setItem('requested_department', selectedDepartment);

      // Envoyer notifications
      if (data.user) {
        await notifyNewAccountRequest(data.user);
      }

      setTimeout(() => {
        router.push(`/compte/en-attente?department=${encodeURIComponent(selectedDepartment)}&email=${encodeURIComponent(newUser.email)}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Partage de compte
  const handleShareAccount = async () => {
    if (!shareEmail || !sharePassword || !shareReason) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Vérifier les identifiants et créer la session partagée
      const response = await fetch(`${AUTH_API_BASE}/api/auth/share-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: shareEmail,
          password: sharePassword,
          reason: shareReason,
          duration: parseInt(shareDuration),
          sharedBy: {
            email,
            department: selectedDepartment
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Identifiants incorrects');
      }

      // Envoyer les notifications
      await notifyShareRequest({
        ownerEmail: shareEmail,
        sharedByEmail: email,
        sharedByName: `${newUser.prenom} ${newUser.nom}`,
        department: selectedDepartment,
        reason: shareReason,
        duration: shareDuration
      });

      setSuccess(t.shareSuccess);

      // Stocker le token et rediriger
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('departement', normalizeDepartmentRoute(data.user.departement || selectedDepartment));
      localStorage.setItem('isShared', 'true');
      localStorage.setItem('sharedUntil', data.expiresAt);

      setTimeout(() => {
        router.push(`/dashboard/${normalizeDepartmentRoute(data.user.departement)}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Journaliser une connexion
  const logConnection = async (userId: number, email: string, departement: string) => {
    try {
      await fetch(`${AUTH_API_BASE}/api/logs/connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          email,
          departement,
          success: true
        })
      });
    } catch (err) {
      console.error('Erreur journalisation:', err);
    }
  };

  // Notifier une demande de partage
  const notifyShareRequest = async (data: any) => {
    try {
      await fetch(`${AUTH_API_BASE}/api/notifications/share-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString()
        })
      });

    } catch (err) {
      console.error('Erreur notification:', err);
    }
  };

  // Notifier une demande de nouveau compte
  const notifyNewAccountRequest = async (userData: any) => {
    try {
      await fetch(`${AUTH_API_BASE}/api/notifications/new-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          nom: userData.nom,
          prenom: userData.prenom,
          telephone: userData.telephone,
          poste: userData.poste,
          departement: userData.departement,
          requestedBy: email,
          timestamp: new Date().toISOString()
        })
      });
    } catch (err) {
      console.error('Erreur notification:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center p-4">

      {/* Sélecteur de langue */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-1 flex space-x-1">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`px-3 py-2 rounded-md transition-all ${
                language === lang.code
                  ? 'bg-white text-gray-900'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <span className="mr-2">{lang.flag}</span>
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white/10 backdrop-blur-md rounded-2xl mb-4">
            <Building2 className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {t.welcome}{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {t.companyName}
            </span>
          </h1>
          <p className="text-gray-300">Système de gestion intégré v3.0</p>
        </div>

        {/* Messages de succès */}
        {success && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="text-green-300 text-sm whitespace-pre-line">{success}</div>
          </div>
        )}

        {/* Messages d'erreur */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Carte de connexion */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">

          {/* Sélecteur de mode */}
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setLoginMode('normal')}
              className={`flex-1 py-3 rounded-lg transition-all ${
                loginMode === 'normal'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Lock className="w-4 h-4 inline mr-2" />
              {t.normalLogin}
            </button>
            <button
              onClick={() => setLoginMode('create')}
              className={`flex-1 py-3 rounded-lg transition-all ${
                loginMode === 'create'
                  ? 'bg-green-600 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              {t.createAccount}
            </button>
            <button
              onClick={() => setLoginMode('share')}
              className={`flex-1 py-3 rounded-lg transition-all ${
                loginMode === 'share'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Share2 className="w-4 h-4 inline mr-2" />
              {t.shareAccount}
            </button>
          </div>

          {/* Mode CONNEXION NORMALE */}
          {loginMode === 'normal' && (
            <form onSubmit={(e) => { e.preventDefault(); handleNormalLogin(); }} className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">
                  {t.selectDepartment}
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                >
                  <option value="">Sélectionnez...</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.icon} {dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">{t.email}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  placeholder="exemple@blg-engineering.com"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">{t.password}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {t.login}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Mode CRÉATION DE COMPTE */}
          {loginMode === 'create' && (
            <form onSubmit={(e) => { e.preventDefault(); handleCreateAccount(); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="block text-white/80 text-sm mb-2">{t.firstName}</label>
                  <input
                    id="firstName"
                    type="text"
                    value={newUser.prenom}
                    onChange={(e) => setNewUser({...newUser, prenom: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                    placeholder="Jean"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-white/80 text-sm mb-2">{t.lastName}</label>
                  <input
                    id="lastName"
                    type="text"
                    value={newUser.nom}
                    onChange={(e) => setNewUser({...newUser, nom: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                    placeholder="Dupont"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-white/80 text-sm mb-2">{t.email}</label>
                <input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  placeholder="jean@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-white/80 text-sm mb-2">{t.phone}</label>
                <input
                  id="phone"
                  type="tel"
                  value={newUser.telephone}
                  onChange={(e) => setNewUser({...newUser, telephone: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>

              <div>
                <label htmlFor="position" className="block text-white/80 text-sm mb-2">{t.position}</label>
                <input
                  id="position"
                  type="text"
                  value={newUser.poste}
                  onChange={(e) => setNewUser({...newUser, poste: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  placeholder="Ingénieur"
                />
              </div>

              <div>
                <label htmlFor="department" className="block text-white/80 text-sm mb-2">{t.selectDepartment}</label>
                <select
                  id="department"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                >
                  <option value="">Sélectionnez...</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.icon} {dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="password" className="block text-white/80 text-sm mb-2">{t.password}</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showNewPassword ? "text" : "password"}
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                    placeholder="Ex: MonMot123!"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-white/60 hover:text-white transition"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Barre de force du mot de passe */}
                {newUser.password && (
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/80">Force du mot de passe:</span>
                      <span className={`text-sm font-medium ${
                        getPasswordStrength(newUser.password).level === 'très fort' ? 'text-green-400' :
                        getPasswordStrength(newUser.password).level === 'fort' ? 'text-blue-400' :
                        getPasswordStrength(newUser.password).level === 'moyen' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {getPasswordStrength(newUser.password).level}
                      </span>
                    </div>

                    {/* Barre de progression */}
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrength(newUser.password).color}`}
                        style={{ width: `${getPasswordStrength(newUser.password).score}%` }}
                      ></div>
                    </div>

                    {/* Indicateurs détaillés */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getPasswordStrength(newUser.password).checks.length ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span className={getPasswordStrength(newUser.password).checks.length ? 'text-green-300' : 'text-red-300'}>
                          Au moins 8 caractères
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getPasswordStrength(newUser.password).checks.upper ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span className={getPasswordStrength(newUser.password).checks.upper ? 'text-green-300' : 'text-red-300'}>
                          Lettre majuscule (A-Z)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getPasswordStrength(newUser.password).checks.lower ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span className={getPasswordStrength(newUser.password).checks.lower ? 'text-green-300' : 'text-red-300'}>
                          Lettre minuscule (a-z)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getPasswordStrength(newUser.password).checks.number ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span className={getPasswordStrength(newUser.password).checks.number ? 'text-green-300' : 'text-red-300'}>
                          Chiffre (0-9)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 col-span-2">
                        <div className={`w-3 h-3 rounded-full ${getPasswordStrength(newUser.password).checks.special ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span className={getPasswordStrength(newUser.password).checks.special ? 'text-green-300' : 'text-red-300'}>
                          Caractère spécial (!@#$%^&*)
                        </span>
                      </div>
                    </div>

                    {/* Message d'aide */}
                    {getPasswordStrength(newUser.password).level === 'moyen' && (
                      <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                        <p className="text-xs text-yellow-300">
                          ⚠️ Mot de passe moyen. Ajoutez plus de critères pour plus de sécurité.
                        </p>
                      </div>
                    )}

                    {getPasswordStrength(newUser.password).level === 'faible' && (
                      <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg">
                        <p className="text-xs text-red-300">
                          💡 Conseil: Utilisez un mot de passe comme "MonMot123!" pour plus de sécurité
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-white/80 text-sm mb-2">{t.confirmPassword}</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={newUser.confirmPassword}
                    onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                    placeholder="Répétez votre mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-white/60 hover:text-white transition"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Vérification de correspondance */}
                {newUser.confirmPassword && (
                  <div className="mt-2 flex items-center space-x-2 text-sm">
                    <div className={`w-4 h-4 rounded-full ${newUser.password === newUser.confirmPassword ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className={newUser.password === newUser.confirmPassword ? 'text-green-300' : 'text-red-300'}>
                      {newUser.password === newUser.confirmPassword ? '✅ Mots de passe identiques' : '❌ Mots de passe différents'}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || (newUser.password && getPasswordStrength(newUser.password).score < 40) || newUser.password !== newUser.confirmPassword}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-white font-medium hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : t.create}
              </button>

              {/* Checklist de complétion */}
              <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg">
                <p className="text-white/80 text-sm font-medium mb-3">Statut du formulaire:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${newUser.prenom ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className={newUser.prenom ? 'text-green-300' : 'text-red-300'}>Prénom: {newUser.prenom ? '✅' : '❌'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${newUser.nom ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className={newUser.nom ? 'text-green-300' : 'text-red-300'}>Nom: {newUser.nom ? '✅' : '❌'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${newUser.email ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className={newUser.email ? 'text-green-300' : 'text-red-300'}>Email: {newUser.email ? '✅' : '❌'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${newUser.telephone ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className={newUser.telephone ? 'text-green-300' : 'text-red-300'}>Téléphone: {newUser.telephone ? '✅' : '❌'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${newUser.poste ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className={newUser.poste ? 'text-green-300' : 'text-red-300'}>Poste: {newUser.poste ? '✅' : '❌'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${selectedDepartment ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className={selectedDepartment ? 'text-green-300' : 'text-red-300'}>Département: {selectedDepartment ? '✅' : '❌'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${newUser.password && newUser.confirmPassword ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className={newUser.password && newUser.confirmPassword ? 'text-green-300' : 'text-red-300'}>Mot de passe confirmé: {newUser.password && newUser.confirmPassword ? '✅' : '❌'}</span>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Mode PARTAGE DE COMPTE */}
          {loginMode === 'share' && (
            <form onSubmit={(e) => { e.preventDefault(); handleShareAccount(); }} className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">{t.selectDepartment}</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                >
                  <option value="">Sélectionnez...</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.icon} {dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">Votre email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  placeholder="votre@email.com"
                />
              </div>

              <div className="border-t border-white/10 my-4 pt-4">
                <h3 className="text-white font-medium mb-3 flex items-center">
                  <Share2 className="w-4 h-4 mr-2" />
                  Informations du compte à partager
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Email du compte</label>
                    <input
                      type="email"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm mb-2">Mot de passe</label>
                    <div className="relative">
                      <input
                        type={showSharePassword ? "text" : "password"}
                        value={sharePassword}
                        onChange={(e) => setSharePassword(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSharePassword(!showSharePassword)}
                        className="absolute right-3 top-3 text-white/60 hover:text-white transition"
                      >
                        {showSharePassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm mb-2">Motif du partage</label>
                    <textarea
                      value={shareReason}
                      onChange={(e) => setShareReason(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                      rows={3}
                      placeholder="Ex: Remplacement temporaire, congés, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm mb-2">Durée (minutes)</label>
                    <select
                      value={shareDuration}
                      onChange={(e) => setShareDuration(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 heure</option>
                      <option value="120">2 heures</option>
                      <option value="240">4 heures</option>
                      <option value="480">8 heures</option>
                      <option value="1440">24 heures</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-500/20 rounded-lg">
                <p className="text-sm text-purple-300">
                  <Bell className="w-4 h-4 inline mr-2" />
                  Une notification sera envoyée au propriétaire du compte, au directeur et à l'administrateur.
                  Cette action sera conservée pendant 6 mois.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
              >
                {loading ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : t.share}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
