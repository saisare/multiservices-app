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
