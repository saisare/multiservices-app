# 🧪 GUIDE DE TEST COMPLET - Multiservices App

## 📋 PRÉREQUIS
- ✅ WAMP Server démarré (MySQL + Apache)
- ✅ Bases de données créées: `btp_db`, `logistique_db`, `immigration_db`
- ✅ Tables créées via `backend/docker/init-sql/*.sql`
- ✅ Services backend démarrés (ports 3001, 3003, 3007, 3008)
- ✅ Frontend Next.js démarré (port 3000)

---

## 🔄 FLUX DE TEST COMPLET

### 1. 🌐 ACCÈS INITIAL
- **URL**: http://localhost:3000
- **Attendu**: Page de splash avec animation (5 secondes) puis redirection vers `/login`

### 2. 🔐 LOGIN
- **Page**: `/login`
- **Test**: Sélectionner département "BTP & Construction"
- **Email**: admin@sgt.com
- **Password**: admin123
- **Attendu**: Redirection vers `/dashboard/btp`

### 3. 📊 DASHBOARD BTP
- **URL**: `/dashboard/btp`
- **Vérifications**:
  - ✅ Titre "BTP & Construction"
  - ✅ Stats affichées (chantiers, matériaux, ouvriers)
  - ✅ Boutons "Nouveau chantier", "Voir chantiers"
  - ✅ Pas d'erreur JSX ou de chargement

### 4. 🏗️ GESTION CHANTIERS
- **Navigation**: Bouton "Voir chantiers" ou menu latéral
- **URL**: `/dashboard/btp/chantiers`
- **Actions à tester**:
  - ✅ Liste des chantiers affichée
  - ✅ Bouton "Nouveau chantier"
  - ✅ Clic sur un chantier existant

### 5. 📝 CRÉATION CHANTIER
- **URL**: `/dashboard/btp/chantiers/nouveau`
- **Formulaire**:
  - ✅ Code chantier (auto-généré)
  - ✅ Nom, adresse, dates
  - ✅ Statut, budget
  - ✅ Bouton "Créer"
- **Attendu**: Redirection vers liste + message succès

### 6. 👷 GESTION OUVRIERS
- **URL**: `/dashboard/btp/ouvriers`
- **Vérifications**:
  - ✅ Liste ouvriers affichée
  - ✅ Colonnes: matricule, nom, métier, téléphone
  - ✅ Statut actif/inactif

### 7. 📦 GESTION MATÉRIAUX
- **URL**: `/dashboard/btp/materiaux`
- **Vérifications**:
  - ✅ Liste matériaux
  - ✅ Stock, seuil alerte
  - ✅ Boutons ajout/modification

### 8. 📈 STATISTIQUES
- **Via API**: `/api/btp/stats`
- **Affichage**: Dashboard principal
- **Métriques**:
  - ✅ Nombre chantiers
  - ✅ Matériaux en stock
  - ✅ Ouvriers actifs

---

## 🔧 TESTS API DIRECTS

### Gateway Health
```bash
curl http://localhost:3001/health
# Expected: {"gateway":"OK","services":{...},"timestamp":"..."}
```

### BTP APIs
```bash
# Stats
curl http://localhost:3001/api/btp/stats

# Chantiers
curl http://localhost:3001/api/btp/chantiers

# Matériaux
curl http://localhost:3001/api/btp/materiaux

# Ouvriers
curl http://localhost:3001/api/btp/ouvriers
```

### Logistique APIs
```bash
# Produits
curl http://localhost:3001/api/logistique/produits

# Health service
curl http://localhost:3008/health
```

### Immigration APIs
```bash
# Clients
curl http://localhost:3001/api/immigration/clients

# Dossiers
curl http://localhost:3001/api/immigration/dossiers

# Health service
curl http://localhost:3007/health
```

---

## 🚨 ERREURS COURANTES & SOLUTIONS

### ❌ "Accès refusé" (Turbopack)
```bash
# Solution: Désactiver Turbopack
set NEXT_DISABLE_TURBOPACK=1
npm run dev
```

### ❌ "ECONNREFUSED" (Backend)
- Vérifier services démarrés
- Vérifier ports (3001, 3003, 3007, 3008)
- Vérifier WAMP MySQL actif

### ❌ "Table doesn't exist"
- Exécuter scripts SQL dans `backend/docker/init-sql/`
- Vérifier noms DB: `btp_db`, `logistique_db`, `immigration_db`

### ❌ "Token invalide"
- Vérifier JWT_SECRET dans `.env` des services
- Correspondance entre frontend (`mon_super_secret_2026`) et backend

---

## ✅ CHECKLIST VALIDATION

### Frontend
- [ ] Build sans erreur: `npm run build`
- [ ] Dev server: `npm run dev`
- [ ] Pas d'erreur console
- [ ] Routing fonctionnel
- [ ] Composants se chargent

### Backend Services
- [ ] API Gateway (3001): `/health` OK
- [ ] BTP (3003): `/health` + APIs OK
- [ ] Logistique (3008): `/health` + APIs OK
- [ ] Immigration (3007): `/health` + APIs OK

### Base de données
- [ ] WAMP MySQL connecté
- [ ] Tables créées dans chaque DB
- [ ] Données de test présentes

### Intégration
- [ ] Login → Dashboard
- [ ] APIs appellent correctement backend
- [ ] Données affichées depuis DB
- [ ] CRUD opérations fonctionnelles

---

## 🎯 TESTS FONCTIONNELS PAR SERVICE

### BTP ✅
- Créer chantier
- Lister chantiers
- Voir détails chantier
- Gérer matériaux
- Gérer ouvriers
- Voir statistiques

### Logistique ✅
- Gérer produits
- Entrées/sorties stock
- Alertes seuil
- Commandes fournisseurs

### Immigration ✅
- Gérer clients
- Créer dossiers
- Suivi demandes
- Rendez-vous
- Documents

---

## 📞 SUPPORT DEBUG

Si problème:
1. Vérifier logs backend: `tail -f backend/*/server.js`
2. Vérifier console navigateur (F12)
3. Tester APIs directement avec curl/Postman
4. Vérifier variables d'environnement `.env`
5. Redémarrer services dans l'ordre: Gateway → Services → Frontend