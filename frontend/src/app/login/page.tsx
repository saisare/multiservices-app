'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  { code: 'fr', name: 'Français'},
  { code: 'en', name: 'English'},
  { code: 'de', name: 'Deutsch' },
];

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

export default function LoginPage() {
  const router = useRouter();
  
  // États
  const [loginMode, setLoginMode] = useState<'normal' | 'create' | 'share'>('normal');
  const [step, setStep] = useState(1);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState('fr');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

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
      createSuccess: 'Compte créé avec succès. En attente de validation par l\'administration.'
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
      createSuccess: 'Account created successfully. Pending admin approval.'
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
      createSuccess: 'Konto erstellt. Warten auf Admin-Genehmigung.'
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
    if (!email || !password) {
      setError(t.errorEmailRequired || 'Email et mot de passe requis');
      return;
    }
    if (password.length < 8) {
      setError('Mot de passe trop court (min 8 caractères)');
      return;
    }

    if (!selectedDepartment) {
      setError('Veuillez sélectionner votre département');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3002/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, departement: selectedDepartment })
      });



      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de connexion');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Journaliser la connexion
      await logConnection(data.user.id, 'normal');

      const role = data.user.role || '';
      if (role === 'admin') {
        router.push('/dashboard/admin');
      } else if (role === 'directeur' || role === 'pdg') {
        router.push('/dashboard/pdg');
      } else if (role === 'secretaire') {
        router.push('/dashboard/secretaire');
      } else {
        router.push(`/dashboard/${data.user.departement}`);
      }
    } catch (err: any) {
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

    if (newUser.password !== newUser.confirmPassword) {
      setError(t.errorPasswordMatch);
      return;
    }

    // Validation du mot de passe - plus permissif
    const passwordStrength = getPasswordStrength(newUser.password);
    if (passwordStrength.score < 40) {
      setError('Mot de passe trop faible. Au moins 2 critères sur 5 doivent être remplis.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Créer la demande de compte
      const response = await fetch('http://localhost:3002/api/auth/request-account', {
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
        throw new Error(data.error || 'Erreur lors de la création');
      }

      // Afficher le message de succès SEULEMENT si la création a réussi
      setSuccess(data.message || t.createSuccess);
      
      // Envoyer notifications
      if (data.user) {
        await notifyNewAccountRequest(data.user);
      }

      setTimeout(() => {
        setLoginMode('normal');
        setSuccess('');
        // Réinitialiser le formulaire
        setNewUser({
          nom: '',
          prenom: '',
          email: '',
          telephone: '',
          poste: '',
          departement: '',
          password: '',
          confirmPassword: ''
        });
      }, 3000);
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
      const response = await fetch('http://localhost:3002/api/auth/share-login', {
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
      localStorage.setItem('isShared', 'true');
      localStorage.setItem('sharedUntil', data.expiresAt);

      setTimeout(() => {
        router.push(`/dashboard/${data.user.departement}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Journaliser une connexion
  const logConnection = async (userId: number, type: string) => {
    try {
      await fetch('http://localhost:3002/api/logs/connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type,
          timestamp: new Date().toISOString(),
          ip: '127.0.0.1', // À remplacer par l'IP réelle
          userAgent: navigator.userAgent
        })
      });
    } catch (err) {
      console.error('Erreur journalisation:', err);
    }
  };

  // Notifier une demande de partage
  const notifyShareRequest = async (data: any) => {
    try {
      await fetch('http://localhost:3002/api/notifications/share-request', {
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
      await fetch('http://localhost:3002/api/notifications/new-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userData,
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
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-green-300 text-sm">{success}</p>
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
            <div className="space-y-4">
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
                onClick={handleNormalLogin}
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
            </div>
          )}

          {/* Mode CRÉATION DE COMPTE */}
          {loginMode === 'create' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/80 text-sm mb-2">{t.firstName}</label>
                  <input
                    type="text"
                    value={newUser.prenom}
                    onChange={(e) => setNewUser({...newUser, prenom: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm mb-2">{t.lastName}</label>
                  <input
                    type="text"
                    value={newUser.nom}
                    onChange={(e) => setNewUser({...newUser, nom: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">{t.email}</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">{t.phone}</label>
                <input
                  type="tel"
                  value={newUser.telephone}
                  onChange={(e) => setNewUser({...newUser, telephone: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">{t.position}</label>
                <input
                  type="text"
                  value={newUser.poste}
                  onChange={(e) => setNewUser({...newUser, poste: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">{t.selectDepartment}</label>
                <select
                  value={newUser.departement}
                  onChange={(e) => setNewUser({...newUser, departement: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                >
                  <option value="">Sélectionnez...</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.icon} {dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">{t.password}</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  placeholder="Ex: MonMot123!"
                />

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
                    {passwordStrength.level === 'moyen' && (
                      <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                        <p className="text-xs text-yellow-300">
                          ⚠️ Mot de passe moyen. Ajoutez plus de critères pour plus de sécurité.
                        </p>
                      </div>
                    )}

                    {passwordStrength.level === 'faible' && (
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
                <label className="block text-white/80 text-sm mb-2">{t.confirmPassword}</label>
                <input
                  type="password"
                  value={newUser.confirmPassword}
                  onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  placeholder="Répétez votre mot de passe"
                />

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
                onClick={handleCreateAccount}
                disabled={loading || (newUser.password && getPasswordStrength(newUser.password).score < 40) || newUser.password !== newUser.confirmPassword}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-white font-medium hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : t.create}
              </button>
            </div>
          )}

          {/* Mode PARTAGE DE COMPTE */}
          {loginMode === 'share' && (
            <div className="space-y-4">
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
                    <input
                      type="password"
                      value={sharePassword}
                      onChange={(e) => setSharePassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                    />
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
                onClick={handleShareAccount}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
              >
                {loading ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : t.share}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}