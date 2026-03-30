# 🧪 DIAGNOSTIC COMPLET - MULTISERVICES APP
# Ce script teste tous les composants et identifie les problèmes

Write-Host "
╔══════════════════════════════════════════════════════════════════════════════╗
║                    🧪 DIAGNOSTIC COMPLET DU PROJET                           ║
║                                                                              ║
║  Frontend, Backend Services, Base de Données, Authentification               ║
╚══════════════════════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

# ============================================================================
# TEST 1: Vérifier MySQL est running
# ============================================================================
Write-Host "`n[1/8] 🗄️  Test MySQL..." -ForegroundColor Yellow
try {
    $result = mysql -u root -e "SELECT 1;" 2>&1
    if ($result -like "*1*") {
        Write-Host "  ✅ MySQL est running" -ForegroundColor Green
    }
} catch {
    Write-Host "  ❌ MySQL n'est PAS running! Démarrez MySQL!" -ForegroundColor Red
    Write-Host "     Commande: net start MySQL80" -ForegroundColor Yellow
    Exit
}

# ============================================================================
# TEST 2: Vérifier les bases de données
# ============================================================================
Write-Host "`n[2/8] 🗄️  Vérification des bases de données..." -ForegroundColor Yellow
$databases = @(
    "auth_db",
    "btp_db",
    "assurance_db",
    "communication_db",
    "rh_db",
    "immigration_db",
    "logistique_db",
    "voyage_db",
    "voyage_immigration_db"
)

$dbsOK = 0
$dbsFail = 0

foreach ($db in $databases) {
    $query = "SELECT 1 FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='$db';"
    $result = mysql -u root -e $query 2>&1
    
    if ($result -like "*1*") {
        Write-Host "  ✅ $db existe" -ForegroundColor Green
        $dbsOK++
    } else {
        Write-Host "  ❌ $db MANQUE!" -ForegroundColor Red
        $dbsFail++
    }
}

Write-Host "`n  Résumé: $dbsOK/$($databases.Count) BD trouvées" -ForegroundColor Cyan

# ============================================================================
# TEST 3: Vérifier les fichiers de configuration backend
# ============================================================================
Write-Host "`n[3/8] 📋 Vérification des fichiers .env backend..." -ForegroundColor Yellow

$backendRoot = "C:\Users\mon pc\Desktop\office\ani web-entreprise\projet strucutre entreprise\multiservices-app\backend"
$services = @(
    "api-gateway",
    "auth-service",
    "btp",
    "assurances",
    "communication",
    "rh",
    "service-immigration",
    "service-logistique",
    "service-voyage"
)

$issuesFound = @()

foreach ($service in $services) {
    $envFile = "$backendRoot\$service\.env"
    
    if (Test-Path $envFile) {
        $content = Get-Content $envFile
        
        # Vérifier DB_NAME
        $dbNameLine = $content | Select-String "DB_NAME"
        if ($dbNameLine) {
            $dbName = ($dbNameLine[0] -split "=")[1].Trim()
            
            # Déterminer le nom attendu
            $expectedDbName = switch ($service) {
                "auth-service" { "auth_db" }
                "btp" { "btp_db" }
                "assurances" { "assurance_db" }
                "communication" { "communication_db" }
                "rh" { "rh_db" }
                "service-immigration" { "immigration_db" }
                "service-logistique" { "logistique_db" }
                "service-voyage" { "voyage_db" }
                default { $null }
            }
            
            # Vérifier si le nom a des espaces
            if ($dbName -like "* *") {
                Write-Host "  ❌ $service: DB_NAME a un ESPACE! '$dbName'" -ForegroundColor Red
                $issuesFound += @{service = $service; issue = "DB_NAME avec espaces"; file = $envFile; value = $dbName}
            } elseif ($dbName -ne $expectedDbName -and $expectedDbName -ne $null) {
                Write-Host "  ⚠️  $service: DB_NAME='$dbName' (attendu: $expectedDbName)" -ForegroundColor Yellow
                $issuesFound += @{service = $service; issue = "DB_NAME mismatch"; file = $envFile; value = "$dbName vs $expectedDbName"}
            } else {
                Write-Host "  ✅ $service: DB_NAME OK" -ForegroundColor Green
            }
        } else {
            if ($service -ne "api-gateway") {
                Write-Host "  ⚠️  $service: Pas de DB_NAME défini" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "  ❌ $service: .env MANQUE!" -ForegroundColor Red
        $issuesFound += @{service = $service; issue = ".env file missing"; file = $envFile}
    }
}

# ============================================================================
# TEST 4: Vérifier les dépendances npm (package.json)
# ============================================================================
Write-Host "`n[4/8] 📦 Vérification des dépendances npm..." -ForegroundColor Yellow

$frontendPkg = "$backendRoot\..\..\frontend\package.json"
if (Test-Path $frontendPkg) {
    Write-Host "  ✅ Frontend package.json existe" -ForegroundColor Green
} else {
    Write-Host "  ❌ Frontend package.json MANQUE!" -ForegroundColor Red
}

$backendServicesWithNodeModules = 0
foreach ($service in $services) {
    $nodeModules = "$backendRoot\$service\node_modules"
    if (Test-Path $nodeModules) {
        $backendServicesWithNodeModules++
    }
}
Write-Host "  Backend: $backendServicesWithNodeModules/$($services.Count) services ont node_modules installé" -ForegroundColor Cyan

# ============================================================================
# TEST 5: Vérifier les scripts SQL
# ============================================================================
Write-Host "`n[5/8] 📄 Vérification des scripts d'initialisation SQL..." -ForegroundColor Yellow

$sqlScripts = @{
    "init-auth-db.sql" = "$backendRoot\init-auth-db.sql"
    "btp/create_tables.sql" = "$backendRoot\btp\create_tables.sql"
    "assurances/create_tables.sql" = "$backendRoot\assurances\create_tables.sql"
}

foreach ($scriptName in $sqlScripts.Keys) {
    $scriptPath = $sqlScripts[$scriptName]
    if (Test-Path $scriptPath) {
        $lines = (Get-Content $scriptPath | Measure-Object -Line).Lines
        Write-Host "  ✅ $scriptName existe ($lines lignes)" -ForegroundColor Green
        
        # Vérifier si le fichier est trop petit (potentiellement corrompu)
        if ($lines -lt 20 -and $scriptName -ne "init-auth-db.sql") {
            Write-Host "     ⚠️  ATTENTION: Fichier très court, possiblement incomplet/corrompu!" -ForegroundColor Yellow
            $issuesFound += @{service = $scriptName; issue = "File potentially corrupted or incomplete"; file = $scriptPath; value = "$lines lines only"}
        }
    } else {
        Write-Host "  ❌ $scriptName MANQUE!" -ForegroundColor Red
        $issuesFound += @{service = $scriptName; issue = "SQL script missing"; file = $scriptPath}
    }
}

# Scripts manquants
$missingScripts = @("rh", "communication", "service-immigration", "service-logistique", "service-voyage")
foreach ($svc in $missingScripts) {
    Write-Host "  ❌ $svc/create_tables.sql MANQUE!" -ForegroundColor Red
    $issuesFound += @{service = $svc; issue = "SQL initialization script missing"; file = "$backendRoot\$svc\create_tables.sql"}
}

# ============================================================================
# TEST 6: Vérifier la configuration frontend
# ============================================================================
Write-Host "`n[6/8] ⚙️  Vérification configuration frontend..." -ForegroundColor Yellow

$frontendSrc = "$backendRoot\..\frontend\src"
$loginPagePath = "$frontendSrc\app\login\page.tsx"
if (Test-Path $loginPagePath) {
    $content = Get-Content $loginPagePath
    Write-Host "  ✅ Login page existe" -ForegroundColor Green
    
    # Chercher les URLs hardcodées
    if ($content -like "*localhost:3002*") {
        Write-Host "  ⚠️  URLs localhost hardcodées détectées" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ❌ Login page MANQUE!" -ForegroundColor Red
}

# ============================================================================
# TEST 7: Vérifier les processus Node.js actifs
# ============================================================================
Write-Host "`n[7/8] 🔍 Vérification des services Node.js..." -ForegroundColor Yellow

$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "  ✅ $($nodeProcesses.Count) processus Node.js en cours" -ForegroundColor Green
    foreach ($proc in $nodeProcesses) {
        Write-Host "     - PID: $($proc.Id), Mémoire: $([math]::Round($proc.WorkingSet / 1MB, 2)) MB"
    }
} else {
    Write-Host "  ⚠️  Aucun processus Node.js en cours (services non démarrés)" -ForegroundColor Yellow
}

# ============================================================================
# TEST 8: Vérifier les ports
# ============================================================================
Write-Host "`n[8/8] 🔌 Vérification des PORTS..." -ForegroundColor Yellow

$ports = @{
    3000 = "Frontend"
    3001 = "API Gateway"
    3002 = "Auth Service"
    3003 = "BTP Service"
    3004 = "Assurances"
    3005 = "Communication"
    3006 = "RH"
    3007 = "Immigration"
    3008 = "Logistique"
    3009 = "Voyage"
}

$portsActive = 0
foreach ($port in $ports.Keys) {
    $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Write-Host "  ✅ PORT $port ($($ports[$port])) - ACTIVE" -ForegroundColor Green
        $portsActive++
    } else {
        Write-Host "  ⭕ PORT $port ($($ports[$port])) - Inactif" -ForegroundColor Gray
    }
}
Write-Host "  Résumé: $portsActive/$($ports.Count) ports actifs"

# ============================================================================
# RÉSUMÉ FINAL
# ============================================================================
Write-Host "`n
╔══════════════════════════════════════════════════════════════════════════════╗
║                         📊 RÉSUMÉ DU DIAGNOSTIC                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

if ($issuesFound.Count -gt 0) {
    Write-Host "`n🔴 PROBLÈMES TROUVÉS: $($issuesFound.Count)" -ForegroundColor Red
    Write-Host "`nDétails:" -ForegroundColor Yellow
    foreach ($issue in $issuesFound) {
        Write-Host "  - $($issue.service): $($issue.issue)" -ForegroundColor Red
        if ($issue.value) { Write-Host "    Valeur: $($issue.value)" }
    }
} else {
    Write-Host "`n✅ Aucun problème critique détecté!" -ForegroundColor Green
}

Write-Host "`n📋 Services prêts: $portsActive/10" -ForegroundColor Cyan
Write-Host "💾 Bases de données: $dbsOK/$($databases.Count)" -ForegroundColor Cyan

Write-Host "`n
PROCHAINES ÉTAPES:
1. Corriger les problèmes listés ci-dessus
2. Installer les dépendances: npm install dans chaque service backend
3. Initialiser les bases de données avec les scripts SQL
4. Démarrer les services: Frontend, Auth, Gateway, puis autres
5. Tester le login avec les identifiants fournis
" -ForegroundColor Yellow

Write-Host "`n🔍 Appuyez sur Enter pour continuer..."
Read-Host
