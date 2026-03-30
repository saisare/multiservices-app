# 🚀 Guide de Démarrage et Test du Système d'Authentification

## 📋 Sommaire

1. [Installation et Configuration](#installation)
2. [Initialisation de la Base de Données](#base-de-données)
3. [Démarrage des Services](#démarrage)
4. [Comptes de Test](#comptes-de-test)
5. [Scénarios de Test](#scénarios-de-test)
6. [Troubleshooting](#troubleshooting)

---

## 🔧 Installation et Configuration {#installation}

### Prérequis

- Node.js v18+
- npm ou yarn
- MySQL 5.7+ ou MariaDB
- WAMP/XAMPP ou MySQL Server en local

### Commandes d'Installation

```bash
# Frontend
cd multiservices-app/frontend
npm install

# Backend - Auth Service
cd ../backend/auth-service
npm install

# Backend - Communication Service (notifications)
cd ../communication
npm install

# Backend - API Gateway
cd ../api-gateway
npm install
```

---

## 💾 Initialisation de la Base de Données {#base-de-données}

### Méthode 1: Using MySQL Client

1. **Exécutez le script SQL:**

```bash
mysql -h localhost -u root < init-auth-db.sql
```

2. **Vérifiez la création:**

```bash
mysql -h localhost -u root -e "USE auth_db; SHOW TABLES; SELECT email, role FROM users;"
```

### Méthode 2: PHPMyAdmin (si vous utilisez WAMP/XAMPP)

1. Ouvrez PHPMyAdmin: `http://localhost/phpmyadmin`
2. Créez une nouvelle BD: `auth_db`
3. Importez le fichier: `init-auth-db.sql`

---

## 🎯 Démarrage des Services {#démarrage}

### 1. Démarrer MySQL/WAMP

```bash
# Si vous utilisez WAMP
# 1. Cliquez sur le logo WAMP dans la barre système
# 2. "Start All Services"
# OU utilisez le cmd:
cd "C:\wamp64\bin\mysql\mysql8.0.x"
mysqld
```

### 2. Démarrer le Backend

**Terminal 1 - Auth Service:**

```bash
cd multiservices-app/backend/auth-service
npm start
# Devrait afficher: ✅ SERVICE AUTH DÉMARRÉ sur port 3002
```

**Terminal 2 - API Gateway:**

```bash
cd multiservices-app/backend/api-gateway
npm start
# Devrait afficher: API Gateway running on port 3001
```

**Terminal 3 - Communication Service:**

``bash
cd multiservices-app/backend/communication
npm start
# Devrait afficher: Communication service running on port 3003
```

### 3. Démarrer le Frontend

```bash
cd multiservices-app/frontend
npm run dev
# Accédez à: http://localhost:3000
```

---

## 👥 Comptes de Test {#comptes-de-test}

| Rôle | Email | Mot de passe | URL Dashboard |
|------|-------|-------------|---|
| **Admin** | `admin@blg-engineering.com` | `Blg1app23@` | `/dashboard/admin` |
| **Directeur** | `jean.martin@blg-engineering.com` | `Director2@` | `/dashboard/pdg` |
| **Secrétaire** | `marie.durand@blg-engineering.com` | `Secr2@` | `/dashboard/secretaire` |
| **Employé** | `pierre.dupont@blg-engineering.com` | `Emp1@` | N/A (pas d'accès) |

---

## 🧪 Scénarios de Test {#scénarios-de-test}

### ✅ Test 1: Login Admin

1. Allez à: `http://localhost:3000/login`
2. **Email:** `admin@blg-engineering.com`
3. **Password:** `Blg1app23@`
4. Cliquez sur "Se Connecter"
5. ✅ **Attendez:** Redirection vers `/dashboard/admin`
6. ✅ **Vérifiez:** Tableau des utilisateurs visible

**Erreurs possibles:**
- `401 Unauthorized`: BD non initialisée ou mot de passe incorrect
- `Cannot GET /dashboard/admin`: Frontend pages non créées

---

### ✅ Test 2: Login Directeur avec Vérification des Permissions

1. Allez à: `http://localhost:3000/login`
2. **Email:** `jean.martin@blg-engineering.com`
3. **Password:** `Director2@`
4. Cliquez sur "Se Connecter"
5. ✅ **Attendez:** Redirection vers `/dashboard/pdg`
6. ✅ **Vérifiez:** Le Directeur ne voit que les utilisateurs non cachés

---

### ✅ Test 3: Création d'un Nouvel Utilisateur

1. Allez à: `http://localhost:3000/login`
2. Cliquez sur "Pas de compte? Inscrivez-vous"
3. **Formulaire d'inscription:**
   - Email: `nouveau.user@blg-engineering.com`
   - Nom: `Nouveau`
   - Prénom: `User`
   - Département: `BTP`
   - Mot de passe: `Welcome123@` (ou simple `test`)
4. Cliquez sur "Créer un compte"
5. ✅ **Attendez:** Message `"Compte créé avec succès. En attente de validation."`
6. ✅ **Vérifiez:** La BD `pending_users` contient l'entrée

**Si erreur 409:**
- L'email existe déjà
- Essayez avec un email différent

---

### ✅ Test 4: Cacher/Affi cher un Utilisateur (Admin)

1. Connectez-vous en tant qu'Administrator
2. Accédez à `/dashboard/admin`
3. Dans le **tableau des utilisateurs**, trouvez un utilisateur
4. Cliquez sur **"Cacher"**
5. ✅ **Vérifiez:** La colonne "Caché" passe à "Oui"
6. ✅ **Vérifiez:** L'utilisateur disparaît de la liste du Directeur

---

### ✅ Test 5: Vérification de la Force du Mot de Passe

1. Allez à: `http://localhost:3000/login`
2. Cliquez sur "Pas de compte? Inscrivez-vous"
3. Dans le champ **Mot de passe**, commencez à taper:
   - Tapez `a` → barre de force: 🔴 Très faible
   - Tapez `password` → barre: 🟠 Faible
   - Tapez `Password1@` → barre: 🟢 Fort
4. ✅ **Vérifiez:** Les critères s'affichent en temps réel

---

### ✅ Test 6: Vérification des Notifications

1. Créez un nouveau compte (voir Test 3)
2. Connectez-vous en tant qu'Administrator
3. Accédez à `/dashboard/admin`
4. ✅ **Vérifiez:** Une notification apparaît (si implémentée)

---

## 🔍 Troubleshooting {#troubleshooting}

### ❌ Erreur: `401 Unauthorized` au login

**Causes possibles:**
1. **BD non initialisée:** Exécutez `init-auth-db.sql`
2. **Mot de passe incorrect:** Vérifiez les comptes de test
3. **Auth service non démarré:** Démarrez `auth-service`

**Solutions:**
```bash
# Vérifier les utilisateurs en BD
mysql -h localhost -u root
USE auth_db;
SELECT email, role, password_hash FROM users;

# Redémarrer le service
cd multiservices-app/backend/auth-service
npm start
```

---

### ❌ Erreur: `Cannot GET /dashboard/admin`

**Causesossibles:**
1. Frontend pages non créées
2. Erreur TypeScript

**Solutions:**
```bash
# Reconstruire le frontend
cd multiservices-app/frontend
npm run build

# Redémarrer dev server
npm run dev
```

---

### ❌ Erreur: `404 - Notifications endpoint not found`

**Solution:** Les notifications sont traitées comme des logs. Vous pouvez vérifier la console backend pour les logs.

---

### ❌ BD non trouvée: `Access denied for user 'root'@'localhost'`

**Solutions:**
1. Vérifiez les identifiants MySQL dans `.env`:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   ```

2. Si MySQL est protégé par un mot de passe:
   ```bash
   mysql -h localhost -u root -p
   # Entrez le mot de passe quand demandé
   ```

---

## 📊 Vérification Complète du Déploiement

Exécutez cette checklist:

- [ ] MySQL/WAMP démarré et accessible
- [ ] BD `auth_db` créée avec tables et utilisateurs
- [ ] Auth Service démarré sur port 3002
- [ ] API Gateway démarré sur port 3001
- [ ] Frontend démarré sur port 3000
- [ ] Connexion Admin réussie
- [ ] Redirection vers `/dashboard/admin` correcte
- [ ] Tableau des utilisateurs affichable
- [ ] Création de compte fonctionne
- [ ] Cacher utilisateur fonctionne
- [ ] Barre de force de mot de passe visible

---

## 🎓 Architecture du Système

```
┌─────────────────────┐
│   Frontend (3000)   │
│   Next.js + React   │
└──────────┬──────────┘
           │
      API │ REST (3001)
           │
┌──────────▼──────────┐
│  API Gateway (3001) │
│   Express.js        │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    │             │
┌───▼──┐      ┌──▼────┐
│Auth  │      │Comm   │
│(3002)│      │(3003) │
└──┬───┘      └────────┘
   │
   ▼
┌─────────────┐
│  MySQL      │
│  auth_db    │
└─────────────┘
```

---

## ✨ Fonctionnalités Activées

- ✅ **Login/Logout** avec JWT
- ✅ **Création de compte** avec validation
- ✅ **Barre de force** du mot de passe en temps réel
- ✅ **RBAC** (Admin/Directeur/Secrétaire/Employé)  
- ✅ **Cacher utilisateur** (soft delete, visible admin seulement)
- ✅ **Supprimer utilisateur** (hard delete, admin seulement)
- ✅ **Redirection par rôle** (après login)
- ✅ **Middleware Next.js** pour protéger les routes
- ✅ **Notifications** (backend ready)

---

## 🚀 Prochaines Étapes

1. **Implémentation d'autres services:**
   - `RH` Service
   - `BTP` Service
   - `Logistique` Service

2. **Améliorations UI:**
   - Dashboard complet pour chaque rôle
   - Gestion de notifications en temps réel (WebSocket)

3. **Sécurité:**
   - HTTPS en production
   - Rate limiting
   - 2FA si nécessaire

---

**Document créé:** 2026-03-25
**Version:** 1.0.0
**Support:** admin@blg-engineering.com
