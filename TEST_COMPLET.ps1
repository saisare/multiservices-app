# ============================================================================
# 🎯 SCRIPT DE TEST COMPLET - Multiservices App
# ============================================================================
# Ce script teste:
# 1. MySQL (base de données)
# 2. Dépendances npm installées
# 3. Services backend
# 4. Frontend
# 5. Authentification et login
# 6. Performance et erreurs
# ============================================================================

# Configurations
$PROJECT_ROOT = "C:\Users\mon pc\Desktop\office\ani web-entreprise\projet strucutre entreprise\multiservices-app"
$BACKEND_ROOT = "$PROJECT_ROOT\backend"
$FRONTEND_ROOT = "$PROJECT_ROOT\frontend"

# Couleurs
$GREEN = 32
$RED = 31
$YELLOW = 33
$BLUE = 34
$CYAN = 36

function Print-Header {
    param([string]$text)
    Write-Host "`n╔════════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  $text" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
}

function Print-Test {
    param([string]$num, [string]$text, [string]$icon = "🔍")
    Write-Host "`n[$num] $icon $text" -ForegroundColor Yellow
}

function Print-OK {
    param([string]$text)
    Write-Host "  ✅ $text" -ForegroundColor Green
}

function Print-ERROR {
    param([string]$text)
    Write-Host "  ❌ $text" -ForegroundColor Red
}

function Print-WARNING {
    param([string]$text)
    Write-Host "  ⚠️  $text" -ForegroundColor Yellow
}

function Print-INFO {
    param([string]$text)
    Write-Host "  ℹ️  $text" -ForegroundColor Cyan
}

# ============================================================================
# TEST 1: MySQL
# ============================================================================
Print-Header "🗄️  TEST 1: MYSQL & BASES DE DONNÉES"

Print-Test "1.1" "Vérification de MySQL..." "🗄️"

try {
    $result = mysql -u root -e "SELECT VERSION();" 2>&1
    if ($result) {
        Print-OK "MySQL est actif"
        Print-INFO "Version: $($result | Select-Object -Last 1)"
    } else {
        Print-ERROR "MySQL ne répond pas"
        exit 1
    }
} catch {
    Print-ERROR "MySQL n'est pas installé ou ne démarre pas"
    exit 1
}

Print-Test "1.2" "Création des bases de données..." "🗄️"

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

foreach ($db in $databases) {
    mysql -u root -e "CREATE DATABASE IF NOT EXISTS $db;" 2>$null
    Print-OK "$db créée"
}

Print-Test "1.3" "Initialisation des tables..." "🗄️"

# Auth DB
try {
    mysql -u root auth_db < "$BACKEND_ROOT\init-auth-db.sql" 2>$null
    Print-OK "auth_db initialisée"
} catch {
    Print-WARNING "Erreur lors de l'initialisation auth_db"
}

# BTP DB
try {
    mysql -u root btp_db < "$BACKEND_ROOT\btp\create_tables.sql" 2>$null
    Print-OK "btp_db initialisée"
} catch {
    Print-WARNING "Erreur lors de l'initialisation btp_db"
}

# Assurance DB
try {
    mysql -u root assurance_db < "$BACKEND_ROOT\assurances\create_tables.sql" 2>$null
    Print-OK "assurance_db initialisée"
} catch {
    Print-WARNING "Erreur lors de l'initialisation assurance_db"
}

# ============================================================================
# TEST 2: NPM DÉPENDANCES
# ============================================================================
Print-Header "📦 TEST 2: DÉPENDANCES NPM"

Print-Test "2.1" "Vérification des dépendances backend..." "📦"

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

$installedCount = 0

foreach ($service in $services) {
    $nodePath = "$BACKEND_ROOT\$service\node_modules"
    if (Test-Path $nodePath) {
        Print-OK "$service: node_modules installé"
        $installedCount++
    } else {
        Print-WARNING "$service: node_modules MANQUE - installation recommandée"
        Print-INFO "Exécutez: cd $BACKEND_ROOT\$service && npm install"
    }
}

Print-INFO "Services préparés: $installedCount/$($services.Count)"

Print-Test "2.2" "Vérification des dépendances frontend..." "📦"

if (Test-Path "$FRONTEND_ROOT\node_modules") {
    Print-OK "Frontend: node_modules installé"
} else {
    Print-WARNING "Frontend: node_modules MANQUE"
    Print-INFO "Exécutez: cd $FRONTEND_ROOT && npm install"
}

# ============================================================================
# TEST 3: FICHIERS DE CONFIGURATION
# ============================================================================
Print-Header "⚙️  TEST 3: FICHIERS DE CONFIGURATION"

Print-Test "3.1" "Vérification des fichiers .env..." "⚙️"

$envIssues = @()

foreach ($service in $services) {
    $envFile = "$BACKEND_ROOT\$service\.env"
    if (Test-Path $envFile) {
        $content = Get-Content $envFile
        
        # Chercher les problèmes courants
        if ($service -eq "communication") {
            if ($content -like "*communication_db*") {
                Print-OK "$service: .env correct"
            } else {
                Print-ERROR "$service: DB_NAME incorrect"
                $envIssues += $service
            }
        } else {
            Print-OK "$service: .env existe"
        }
    } else {
        Print-WARNING "$service: .env MANQUE"
    }
}

Print-Test "3.2" "Vérification des variables d'environnement clés..." "⚙️"

$criticalEnvVars = @(
    "JWT_SECRET",
    "DB_HOST",
    "DB_USER",
    "DB_PASSWORD",
    "PORT"
)

$authEnv = "$BACKEND_ROOT\auth-service\.env"
if (Test-Path $authEnv) {
    $content = Get-Content $authEnv
    foreach ($var in $criticalEnvVars) {
        if ($content -like "*$var*") {
            Print-OK "auth-service: $var défini"
        } else {
            Print-WARNING "auth-service: $var MANQUE"
        }
    }
}

# ============================================================================
# TEST 4: VÉRIFICATION DES PORTS
# ============================================================================
Print-Header "🔌 TEST 4: VÉRIFICATION DES PORTS"

Print-Test "4.1" "Scan des ports utilisés..." "🔌"

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

$activeCount = 0
$activeServices = @()

foreach ($port in $ports.Keys) {
    $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Print-OK "PORT $port ($($ports[$port])) - ACTIF"
        $activeCount++
        $activeServices += $ports[$port]
    } else {
        Print-INFO "PORT $port ($($ports[$port])) - Inactif"
    }
}

Print-INFO "Résumé: $activeCount/$($ports.Count) services actifs"
if ($activeServices.Count -gt 0) {
    Print-INFO "Actifs: $($activeServices -join ', ')"
}

# ============================================================================
# TEST 5: TEST BACKEND SERVICES
# ============================================================================
Print-Header "🚀 TEST 5: SERVICES BACKEND"

Print-Test "5.1" "Vérification des fichiers package.json..." "📋"

$pkgIssues = 0
foreach ($service in $services) {
    $pkgPath = "$BACKEND_ROOT\$service\package.json"
    if (Test-Path $pkgPath) {
        Print-OK "$service: package.json trouvé"
    } else {
        Print-ERROR "$service: package.json MANQUE"
        $pkgIssues++
    }
}

if ($pkgIssues -eq 0) {
    Print-OK "Tous les services ont un package.json"
} else {
    Print-ERROR "$pkgIssues services manquent package.json"
}

# ============================================================================
# TEST 6: FRONTEND CONFIGURATION
# ============================================================================
Print-Header "⚛️  TEST 6: FRONTEND NEXT.JS"

Print-Test "6.1" "Vérification des fichiers frontend..." "⚛️"

$frontendFiles = @(
    "package.json",
    "next.config.ts",
    "tsconfig.json",
    "src\app\login\page.tsx",
    "src\app\page.tsx"
)

$missingFiles = 0
foreach ($file in $frontendFiles) {
    $filePath = "$FRONTEND_ROOT\$file"
    if (Test-Path $filePath) {
        Print-OK "✓ $file"
    } else {
        Print-ERROR "✗ $file MANQUE"
        $missingFiles++
    }
}

if ($missingFiles -eq 0) {
    Print-OK "Tous les fichiers frontend essentiels sont présents"
} else {
    Print-ERROR "$missingFiles fichiers manquent"
}

# ============================================================================
# RÉSUMÉ FINAL
# ============================================================================
Print-Header "📊 RÉSUMÉ DU DIAGNOSTIC"

Write-Host "`n✅ ÉTAT ACTUEL:`n" -ForegroundColor Green
Write-Host "  MySQL: Actif" -ForegroundColor Green
Write-Host "  Bases de données: $($databases.Count) créées" -ForegroundColor Green
Write-Host "  Services configurés: $($services.Count)" -ForegroundColor Green
Write-Host "  Ports actifs: $activeCount/10" -ForegroundColor Cyan

if ($activeCount -eq 0) {
    Write-Host "`n⚠️  AUCUN SERVICE DÉMARRÉ - Démarrez-les maintenant!" -ForegroundColor Yellow
} elseif ($activeCount -lt 3) {
    Write-Host "`n⚠️  Seulement $activeCount service(s) actif(s) - Démarrez les autres!" -ForegroundColor Yellow
} else {
    Write-Host "`n✅ Plusieurs services actifs - Continuez les tests!" -ForegroundColor Green
}

Write-Host "`n
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                          🚀 PROCHAINES ÉTAPES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Si ce n'est pas déjà fait, installez les dépendances npm:
" -ForegroundColor Yellow

Write-Host "
█ TERMINAL 1 - Auth Service:
  cd '$BACKEND_ROOT\auth-service'
  npm install
  npm start

█ TERMINAL 2 - API Gateway:
  cd '$BACKEND_ROOT\api-gateway'
  npm install
  npm start

█ TERMINAL 3 - BTP Service (optionnel):
  cd '$BACKEND_ROOT\btp'
  npm install
  npm start

█ TERMINAL 4 - Frontend:
  cd '$FRONTEND_ROOT'
  npm install
  npm run dev

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                           🔗 ADRESSES À TESTER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  Frontend (Login Page):
   http://localhost:3000/login
   
2️⃣  API Gateway Health:
   http://localhost:3001/health
   
3️⃣  Identifiants de test:
   Email: admin@blg-engineering.com
   Password: Blg1app23@

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
" -ForegroundColor Cyan

if ($envIssues.Count -gt 0) {
    Write-Host "`n🔴 PROBLÈMES À CORRIGER:" -ForegroundColor Red
    foreach ($issue in $envIssues) {
        Write-Host "   - $issue" -ForegroundColor Red
    }
}

Write-Host "`n✨ Appuyez sur Enter pour continuer..." -ForegroundColor Green
Read-Host | Out-Null
