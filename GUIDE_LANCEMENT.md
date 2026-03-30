# 🚀 GUIDE DE LANCEMENT - MICROSERVICES ENTERPRISE

## ⚙️ ARCHITECTURE FINALE

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (PORT 3000)                 │
│                  Next.js 16 + TypeScript                │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP API
┌────────────────────▼────────────────────────────────────┐
│              API GATEWAY (PORT 3001)                    │
│  Routes: /api/auth, /api/voyage, /api/btp, ...        │
│  JWT Validation per Service                            │
└──┬──┬──┬──┬──┬──┬──────────────────────────────────────┘
   │  │  │  │  │  │
   ▼  ▼  ▼  ▼  ▼  ▼
┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│AUTH(3002)│BTP(3003) │ASSUR(3004)│COMM(3005)│RH(3006) │VOYAGE(3009)│
│          │          │          │          │         │          │
│auth_db   │btp_db    │insurance │commun_db │rh_db    │voyage_db │
│          │          │_db       │          │         │+ visa_db │
└──────────┴──────────┴──────────┴──────────┴─────────┴─────────┘
```

---

## 📋 SERVICES & PORTS

| Service | Port | BD | JWT Secret |
|---------|------|-----|-----------|
| API Gateway | 3001 | multiservices | gateway_secret_key_2026_microservice |
| Auth Service | 3002 | auth_db | auth_secret_key_2026_microservice |
| BTP | 3003 | btp_db | btp_secret_key_2026_microservice |
| Assurances | 3004 | assurances_db | assurances_secret_key_2026_microservice |
| Communication | 3005 | communication_db | communication_secret_key_2026_microservice |
| RH | 3006 | rh_db | rh_secret_key_2026_microservice |
| **Service-Voyage** | **3009** | **voyage_db + voyage_immigration_db** | **voyage_secret_key_2026_microservice** |
| Logistique | 3008 | logistique_db | logistique_secret_key_2026_microservice |

---

## 🗄️ BASES DE DONNÉES

### Configuration

```
Host: localhost
Port: 3306
User: root
Password: root (pour BD locales)
```

### Bases utilisées

```
√ auth_db                  → Auth Service
√ btp_db                   → BTP Service
√ assurances_db            → Assurances Service
√ communication_db         → Communication Service
√ rh_db                    → RH Service
√ voyage_db                → Voyage (Reservations, Clients, Destinations)
√ voyage_immigration_db    → Immigration (Dossiers, Candidats, RDV)
√ logistique_db            → Logistique Service
```

✅ **NEW**: Service-Voyage gère les DEUX bases (voyage_db + voyage_immigration_db)

---

## 🚀 ÉTAPE 1: DÉMARRER LES BASES DE DONNÉES

### Option A - MySQL local

```powershell
# Vérifier MySQL
mysql --version

# Démarrer MySQL (Windows)
net start MySQL80

# Test connexion
mysql -u root -p
# puis: SHOW DATABASES;
```

### Option B - Via Docker Compose

```powershell
cd c:\Users\mon pc\Desktop\office\ani web-entreprise\projet strucutre entreprise\multiservices-app\docker
docker-compose up -d

# Vérifier
docker ps
```

---

## 🚀 ÉTAPE 2: DÉMARRER LES SERVICES BACKEND

Ouvrir **4-5 terminaux CMD** (ou PowerShell) séparés:

### Terminal 1: API Gateway

```cmd
cd c:\Users\mon pc\Desktop\office\ani web-entreprise\projet strucutre entreprise\multiservices-app\backend\api-gateway
npm install
npm start
```

✅ Attendez: `🚀 API GATEWAY DÉMARRÉ (PORT 3001)`

### Terminal 2: Auth Service

```cmd
cd c:\Users\mon pc\Desktop\office\ani web-entreprise\projet strucutre entreprise\multiservices-app\backend\auth-service
npm install
npm start
```

✅ Attendez: `✅ Service Auth démarré`

### Terminal 3: Service-Voyage (Voyage + Immigration)

```cmd
cd c:\Users\mon pc\Desktop\office\ani web-entreprise\projet strucutre entreprise\multiservices-app\backend\service-voyage
npm install
npm start
```

✅ Attendez: `🚀 [SERVICE-VOYAGE] DÉMARRÉ (PORT 3009)`

### Terminal 4: BTP Service

```cmd
cd c:\Users\mon pc\Desktop\office\ani web-entreprise\projet strucutre entreprise\multiservices-app\backend\btp
npm install
npm start
```

### Terminal 5: Assurances Service

```cmd
cd c:\Users\mon pc\Desktop\office\ani web-entreprise\projet strucutre entreprise\multiservices-app\backend\assurances
npm install
npm start
```

**Lancez aussi:**

```cmd
# Terminal 6: Communication
cd backend\communication
npm install
npm start

# Terminal 7: RH
cd backend\rh
npm install
npm start

# Terminal 8: Logistique
cd backend\service-logistique
npm install
npm start
```

---

## 🚀 ÉTAPE 3: DÉMARRER LE FRONTEND

Nouveau terminal CMD:

```cmd
cd c:\Users\mon pc\Desktop\office\ani web-entreprise\projet strucutre entreprise\multiservices-app\frontend

# Nettoyer cache
del .next
npm run build

# Démarrer en dev
npm run dev
```

✅ Allez à: **http://localhost:3000/login**

---

## ✅ TEST 1: PAGE DE LOGIN

1. Ouvrir **http://localhost:3000/login**
2. Vérifier que les départements affichés:
   - ✅ PDG / Direction
   - ✅ Secrétariat
   - ✅ Assurance
   - ✅ BTP
   - ✅ RH
   - ✅ **Service Voyage & Immigration** (NOUVEAU - fusionné!)
   - ✅ Communication
   - ✅ Logistique
3. ❌ **Immigration** ne doit PAS apparaître séparément

---

## ✅ TEST 2: AUTHENTIFICATION MICROSERVICES

### Test Auth Service (Port 3002)

```powershell
# Login
$response = Invoke-WebRequest -Uri "http://localhost:3002/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"user@company.com","password":"password123"}'

$token = $response.Content | ConvertFrom-Json | Select-Object -ExpandProperty token
Write-Host "✅ Token généré: $token"
```

---

## ✅ TEST 3: APIGATEWAY → SERVICE-VOYAGE

### Requête Voyage (BD: voyage_db)

```powershell
$headers = @{"Authorization" = "Bearer YOUR_TOKEN_HERE"}

# Récupérer clients voyage
Invoke-WebRequest -Uri "http://localhost:3001/api/voyage/clients" `
  -Method GET `
  -Headers $headers
```

### Requête Immigration (BD: voyage_immigration_db)

```powershell
# Récupérer dossiers immigration
Invoke-WebRequest -Uri "http://localhost:3001/api/voyage/immigration/dossiers" `
  -Method GET `
  -Headers $headers
```

**Résultat attendu**: Les deux requêtes retournent les données de leurs BD respectives! ✅

---

## ✅ TEST 4: DASHBOARD VOYAGE

1. Login → Sélectionner "Service Voyage & Immigration"
2. Vérifier le dashboard principal
3. Cliquer sur Tab **"Service Voyage"**:
   - Stats: Clients, Réservations, Ch. d'affaires, Destinations
   - Boutons: Clients, Destinations, Offres, Réservations
4. Cliquer sur Tab **"Service Immigration"**:
   - Stats: Dossiers, Approuvés, En attente, RDV, Taux approbation
   - Boutons: Candidats, Dossiers, Rendez-vous, Visas

---

## ✅ TEST 5: ISOLATION SERVICES (MICROSERVICES)

### Si BTP service crash:

```powershell
# Arrêter BTP
Ctrl+C (dans terminal BTP)

# Essayer d'accéder Voyage
# ✅ DOIT FONCTIONNER (pas affecté par BTP!)
```

### Chaque service: JWT Secret INDÉPENDANT

```
- auth-service: auth_secret_key_2026_microservice
- btp: btp_secret_key_2026_microservice
- service-voyage: voyage_secret_key_2026_microservice
- ...

Token généré par Auth ne fonctionne QUE sur les services autorisés
```

---

## 🔒 TEST 6: SÉCURITÉ

### 1. Vérifier JWT per service

```powershell
# Token Auth pour Voyage (via Gateway)
$token = "eyJhbGc..." # Token d'Auth

# Requête à: API Gateway → Service-Voyage
Invoke-WebRequest -Uri "http://localhost:3001/api/voyage/clients" `
  -Headers @{"Authorization" = "Bearer $token"} `
  -ErrorAction SilentlyContinue

# ✅ Gateway valide le token
# ✅ Service-Voyage valide avec son JWT_SECRET
```

### 2. Vérifier CORS

```powershell
# Frontend (port 3000) vers Gateway (port 3001)
# DOIT avoir CORS enabled

# Test
Invoke-WebRequest -Uri "http://localhost:3001/health"
```

### 3. Vérifier BD isolation

Service-Voyage accède à:
- ✅ voyage_db (own BD)
- ✅ voyage_immigration_db (own BD)
- ❌ btp_db (NOT accessible!)
- ❌ Other services BD (NOT accessible!)

---

## 📊 CHECKLIST FINALE

- [ ] **Base de données**: `SELECT DATABASE(); SHOW TABLES;` pour chaque BD
- [ ] **API Gateway**: `http://localhost:3001/health`
- [ ] **Service-Voyage**: `http://localhost:3009/health` (affiche les 2 BD)
- [ ] **Frontend Login**: Voir "Service Voyage & Immigration" (PAS "Immigration" seul)
- [ ] **Dashboard**: Tabs "Voyage" et "Immigration" fonctionnels
- [ ] **API calls**: `GET /api/voyage/clients` et `/api/voyage/immigration/dossiers` retournent données
- [ ] **JWT Isolation**: Token d'un service ≠ token d'un autre
- [ ] **Microservices**: Si 1 service crash, autres continuent! 🎯

---

## ⚠️ TROUBLESHOOTING

### Port déjà utilisé
```cmd
netstat -ano | findstr :3001
taskkill /PID 1234 /F
```

### BD connection error
```cmd
# Vérifier MySQL
mysql -u root -p -e "SELECT USER();"

# Créer BD si manquante
mysql -u root -p < docker/init-sql/voyage_db.sql
```

### CORS error
```
→ Vérifier api-gateway/.env JWT_SECRET
→ Vérifier frontend .env NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Token invalide
```
→ Chaque service a son JWT_SECRET unique
→ Token doit être du service correct
→ Vérifier .env files dans chaque service/
```

---

## 📞 SUPPORT

En cas de problème:
1. Vérifier les logs du terminal
2. Vérifier les ports: `netstat -ano`
3. Vérifier les BD: `mysql -u root -p`
4. Vérifier les secrets JWT dans les .env files

**Service-voyage est FUSIONNÉ** ✅
Immigration n'apparaît PLUS au login ✅
Deux BD séparées pour la sécurité ✅
Vrai microservices architecture ✅

---

🎉 **C'est bon? Lance-toi!**
