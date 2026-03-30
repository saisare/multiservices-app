# 🧪 TESTS RAPIDES - COPIER/COLLER PRÊT

## ✅ TEST 1: API Gateway Health

```powershell
# PowerShell: Vérifier que API Gateway est up
$response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing
$response.Content | ConvertFrom-Json | Format-Table -AutoSize

# Résultat attendu:
# gateway: OK
# services: auth, btp, assurances, communication, rh, voyage, logistique ✅
```

---

## ✅ TEST 2: Service-Voyage Health

```powershell
# PowerShell: Vérifier que Service-Voyage est running
$response = Invoke-WebRequest -Uri "http://localhost:3009/health" -UseBasicParsing
$response.Content | ConvertFrom-Json | Format-Table -AutoSize

# Résultat attendu:
# service: service-voyage
# status: active
# port: 3009
# databases: voyage_db, voyage_immigration_db ✅
```

---

## ✅ TEST 3: Authentification

```powershell
# PowerShell: Login et récupérer JWT TOKEN

# 1. Login (utilise auth-service, port 3002)
$loginBody = @{
    email = "user@company.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest `
    -Uri "http://localhost:3002/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody `
    -UseBasicParsing

$token = ($loginResponse.Content | ConvertFrom-Json).token
Write-Host "✅ Token obtenu: $token"

# 2. Utiliser le TOKEN
$headers = @{"Authorization" = "Bearer $token"}

# 3. Test appel API Gateway
Invoke-WebRequest `
    -Uri "http://localhost:3001/api/voyage/clients" `
    -Method GET `
    -Headers $headers `
    -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json
```

---

## ✅ TEST 4: Voyage DB

```powershell
# PowerShell: Récupérer data VOYAGE

$token = "YOUR_JWT_TOKEN_HERE"
$headers = @{"Authorization" = "Bearer $token"}

# Clients Voyage
Write-Host "📋 Clients Voyage (voyage_db):" -ForegroundColor Cyan
$response = Invoke-WebRequest `
    -Uri "http://localhost:3001/api/voyage/clients" `
    -Method GET `
    -Headers $headers `
    -UseBasicParsing
$response.Content | ConvertFrom-Json | Format-Table -AutoSize

# Destinations Voyage
Write-Host "📍 Destinations Voyage (voyage_db):" -ForegroundColor Cyan
$response = Invoke-WebRequest `
    -Uri "http://localhost:3001/api/voyage/destinations" `
    -Method GET `
    -Headers $headers `
    -UseBasicParsing
$response.Content | ConvertFrom-Json | Format-Table -AutoSize
```

---

## ✅ TEST 5: Immigration DB

```powershell
# PowerShell: Récupérer data IMMIGRATION

$token = "YOUR_JWT_TOKEN_HERE"
$headers = @{"Authorization" = "Bearer $token"}

# Dossiers Immigration
Write-Host "📄 Dossiers Immigration (voyage_immigration_db):" -ForegroundColor Green
$response = Invoke-WebRequest `
    -Uri "http://localhost:3001/api/voyage/immigration/dossiers" `
    -Method GET `
    -Headers $headers `
    -UseBasicParsing
$response.Content | ConvertFrom-Json | Format-Table -AutoSize

# Candidats Immigration
Write-Host "👤 Candidats Immigration (voyage_immigration_db):" -ForegroundColor Green
$response = Invoke-WebRequest `
    -Uri "http://localhost:3001/api/voyage/immigration/candidates" `
    -Method GET `
    -Headers $headers `
    -UseBasicParsing
$response.Content | ConvertFrom-Json | Format-Table -AutoSize
```

---

## ✅ TEST 6: Vérifier Services Ports

```powershell
# PowerShell: Tous les ports utilisés

$ports = 3001, 3002, 3003, 3004, 3005, 3006, 3008, 3009, 3000

Write-Host "🔍 Vérification des PORTS..." -ForegroundColor Yellow
foreach ($port in $ports) {
    $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Write-Host "  ✅ PORT $port - ACTIVE" -ForegroundColor Green
    } else {
        Write-Host "  ❌ PORT $port - INACTIVE" -ForegroundColor Red
    }
}
```

---

## ✅ TEST 7: Vérifier JWT_SECRET Indépendants

```powershell
# PowerShell: Vérifier que chaque service utilise son secret

$services = @{
    "auth-service" = @{port = 3002; secret = "auth_secret_key_2026_microservice"}
    "btp" = @{port = 3003; secret = "btp_secret_key_2026_microservice"}
    "assurances" = @{port = 3004; secret = "assurances_secret_key_2026_microservice"}
    "communication" = @{port = 3005; secret = "communication_secret_key_2026_microservice"}
    "rh" = @{port = 3006; secret = "rh_secret_key_2026_microservice"}
    "service-voyage" = @{port = 3009; secret = "voyage_secret_key_2026_microservice"}
    "logistique" = @{port = 3008; secret = "logistique_secret_key_2026_microservice"}
}

Write-Host "🔐 Vérification JWT_SECRET..." -ForegroundColor Yellow
foreach ($service in $services.GetEnumerator()) {
    $envFile = "backend\$($service.Key)\.env"
    if (Test-Path $envFile) {
        $content = Get-Content $envFile | Select-String "JWT_SECRET"
        if ($content -match $service.Value.secret) {
            Write-Host "  ✅ $($service.Key): Secret correct" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $($service.Key): Secret MANQUANT!" -ForegroundColor Red
            Write-Host "     Trouvé: $content"
            Write-Host "     Attendu: JWT_SECRET=$($service.Value.secret)"
        }
    }
}
```

---

## ✅ TEST 8: Connexion Bases de Données

```powershell
# PowerShell: Vérifier toutes les BD

# Assurez-vous que MySQL est running
mysql --version

# Test chaque BD
$databases = @(
    "auth_db",
    "btp_db",
    "assurances_db",
    "communication_db",
    "rh_db",
    "voyage_db",
    "voyage_immigration_db",
    "logistique_db"
)

Write-Host "🗄️  Vérification BASES DE DONNÉES..." -ForegroundColor Yellow
foreach ($db in $databases) {
    try {
        $query = "SELECT COUNT(*) as tables_count FROM information_schema.TABLES WHERE TABLE_SCHEMA = '$db';"
        $result = mysql -u root -e $query 2>$null | Select-Object -Last 1
        if ($result) {
            Write-Host "  ✅ $db - Existe" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ❌ $db - ERREUR" -ForegroundColor Red
    }
}
```

---

## ✅ TEST 9: Frontend Login Page

```html
<!-- Ouvrir dans navigateur -->
http://localhost:3000/login

<!-- Vérifier:
✓ Département "Service Voyage & Immigration" présent
✓ Département "Immigration" (seul) ABSENT
✓ Autres services présents: BTP, Assurance, RH, Logistique, Communication
-->
```

---

## ✅ TEST 10: Dashboard Voyage (2 Tabs)

```html
<!-- Après login avec "Service Voyage & Immigration" -->
http://localhost:3000/dashboard/voyage

<!-- Vérifier:
✓ TAB 1: "Service Voyage" - Stats, Clients, Destinations, Offres, Réservations
✓ TAB 2: "Service Immigration" - Stats, Dossiers, Candidats, Rendez-vous
✓ Chaque tab affiche ses propres boutons d'action
-->
```

---

## ✅ TEST 11: Microservices ISOLATION

```powershell
# PowerShell: Test isolation des services

Write-Host "🧪 TEST ISOLATION MICROSERVICES" -ForegroundColor Yellow

# 1. Noter les processus
$processes = Get-Process node -ErrorAction SilentlyContinue
Write-Host "`n✓ Processes Node actuels: $($processes.Count)"

# 2. Arrêter BTP service manuellement
Write-Host "`n⏹️  Arrêtez le service BTP (Ctrl+C dans son terminal)"
Read-Host "✓ Appuyez sur Enter quand c'est fait"

# 3. Tester Voyage
$token = "YOUR_JWT_TOKEN_HERE"
$headers = @{"Authorization" = "Bearer $token"}

try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:3001/api/voyage/clients" `
        -Method GET `
        -Headers $headers `
        -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ VOYAGE TOUJOURS ACTIF (BTP ne l'affecte pas!) - ISOLATION OK!" -ForegroundColor Green
} catch {
    Write-Host "❌ VOYAGE DOWN après BTP - ISOLATION FAILED!" -ForegroundColor Red
}

# 4. Relancer BTP
Write-Host "`n🚀 Relancer BTP service"
```

---

## ✅ TEST 12: Load Test Simple

```powershell
# PowerShell: Faire 10 requêtes rapides

$token = "YOUR_JWT_TOKEN_HERE"
$headers = @{"Authorization" = "Bearer $token"}

Write-Host "⚡ Load Test: 10 requêtes rapides..." -ForegroundColor Yellow

$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

for ($i = 1; $i -le 10; $i++) {
    try {
        $response = Invoke-WebRequest `
            -Uri "http://localhost:3001/api/voyage/clients" `
            -Method GET `
            -Headers $headers `
            -UseBasicParsing
        Write-Host "  ✓ Requête $i: OK" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Requête $i: ERREUR" -ForegroundColor Red
    }
}

$stopwatch.Stop()
Write-Host "`n✅ 10 requêtes complétées en $($stopwatch.ElapsedMilliseconds)ms" -ForegroundColor Cyan
```

---

## 📋 CHECKLIST COMPLÈTE

```
☐ TEST 1: API Gateway Health (PORT 3001)
☐ TEST 2: Service-Voyage Health (PORT 3009)
☐ TEST 3: Authentification JWT
☐ TEST 4: Voyage DB data (voyage_db)
☐ TEST 5: Immigration DB data (voyage_immigration_db)
☐ TEST 6: Tous les ports running
☐ TEST 7: JWT_SECRET indépendants
☐ TEST 8: Bases de données connectées
☐ TEST 9: Frontend Login page
☐ TEST 10: Dashboard Voyage (2 tabs)
☐ TEST 11: Microservices isolation
☐ TEST 12: Load test basique

✅ TOI TOUS LES TESTS PASSENT? BRAVO! 🎉
```

---

## 🚨 TROUBLESHOOTING RAPIDE

### Port déjà utilisé

```powershell
# Trouver quel process utilise le port
netstat -ano | findstr :3001

# Tuer le process
taskkill /PID 12345 /F
```

### MySQL pas running

```cmd
# Démarrer MySQL
net start MySQL80

# Vérifier
mysql -u root -e "SELECT 1;"
```

### JWT Token invalide

```powershell
# Générer nouveau token
# Depuis la fonction AUTH-SERVICE
# Copy le token
# Paste dans tests avec: "Bearer $token"
```

### Service crash

```powershell
# Consulter les logs du terminal du service
# Le message d'erreur vous dire quoi

# À faire:
1. Vérifier .env file
2. Vérifier BD connection
3. Vérifier npm dependencies
4. Relancer le service
```

---

## 📞 QUICK SUPPORT

```
Question: JWT secrets?
Réponse: Tous uniques par service. Vérifier .env dans chaque backend/*/

Question: Ports?
Réponse: 3001-3009. Vérifier avec: netstat -ano

Question: BD?
Réponse: 8 BD MySQL. Vérifier avec: mysql -u root -e "SHOW DATABASES;"

Question: Frontend pas charge?
Réponse: Vérifier que nextbuild = ok. Voir logs du frontend terminal.

Question: API Gateway erreur?
Réponse: Vérifier que TOUS les services backend running (8).

Question: Immigration vs Voyage?
Réponse: FUSIONNÉ! Une page, 2 tabs, 2 BD séparées.
```

---

🎯 **Prêt? Lance les tests!**
