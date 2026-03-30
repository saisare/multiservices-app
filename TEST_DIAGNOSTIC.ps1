# 🧪 TEST DE PERFORMANCE & DIAGNOSTIC DÉTAILLÉ
# Teste la vitesse, les erreurs et l'état général du système

Write-Host "
╔══════════════════════════════════════════════════════════════════════════════╗
║              🧪 TEST DE PERFORMANCE ET DIAGNOSTIC DÉTAILLÉ                   ║
║                                                                              ║
║  Ce script teste: MySQL, Services, Frontend, Login, Erreurs, Performance    ║
╚══════════════════════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

# ============================================================================
# CONFIGURATION
# ============================================================================
$PROJECT_ROOT = "C:\Users\mon pc\Desktop\office\ani web-entreprise\projet strucutre entreprise\multiservices-app"
$RESULTS = @()
$ERRORS = @()

function Log-Result {
    param([string]$test, [string]$status, [string]$message, [int]$duration = 0)
    
    $result = @{
        Test = $test
        Status = $status
        Message = $message
        Duration = $duration
    }
    $global:RESULTS += $result
    
    if ($status -eq "✅") {
        Write-Host "  ✅ $test" -ForegroundColor Green
    } elseif ($status -eq "❌") {
        Write-Host "  ❌ $test" -ForegroundColor Red
        $global:ERRORS += $test
    } else {
        Write-Host "  ⚠️  $test" -ForegroundColor Yellow
    }
    
    if ($message) {
        Write-Host "     $message" -ForegroundColor Gray
    }
}

# ============================================================================
# TEST 1: MySQL Performance
# ============================================================================
Write-Host "`n[TEST 1/6] 🗄️  MySQL Performance" -ForegroundColor Yellow

$timer = [System.Diagnostics.Stopwatch]::StartNew()
try {
    $result = mysql -u root -e "SELECT 1;" 2>&1
    $timer.Stop()
    
    if ($result -like "*1*") {
        Log-Result "MySQL Connection" "✅" "Réponse en $($timer.ElapsedMilliseconds)ms" $timer.ElapsedMilliseconds
    } else {
        Log-Result "MySQL Connection" "❌" "Pas de réponse"
    }
} catch {
    Log-Result "MySQL Connection" "❌" "Erreur: $_"
}

# Vérifier les BD
$timer = [System.Diagnostics.Stopwatch]::StartNew()
$dbs = @("auth_db", "btp_db", "assurance_db", "communication_db")
$foundDbs = 0

foreach ($db in $dbs) {
    $query = "SELECT COUNT(*) FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='$db';"
    $result = mysql -u root -e $query 2>&1
    if ($result -like "*1*") {
        $foundDbs++
    }
}
$timer.Stop()

if ($foundDbs -eq $dbs.Count) {
    Log-Result "BD Principales" "✅" "Tous les $foundDbs DB trouvées en $($timer.ElapsedMilliseconds)ms" $timer.ElapsedMilliseconds
} else {
    Log-Result "BD Principales" "❌" "Seulement $foundDbs/$($dbs.Count) BD trouvées"
}

# ============================================================================
# TEST 2: Node.js et npm
# ============================================================================
Write-Host "`n[TEST 2/6] 🔧 Node.js et npm" -ForegroundColor Yellow

# Node version
try {
    $version = node --version 2>&1
    Log-Result "Node.js" "✅" "Version: $version"
} catch {
    Log-Result "Node.js" "❌" "Non trouvé"
}

# npm version
try {
    $version = npm --version 2>&1
    Log-Result "npm" "✅" "Version: $version"
} catch {
    Log-Result "npm" "❌" "Non trouvé"
}

# ============================================================================
# TEST 3: Services Backend (Structure)
# ============================================================================
Write-Host "`n[TEST 3/6] 📦 Services Backend" -ForegroundColor Yellow

$services = @{
    "auth-service" = "3002"
    "api-gateway" = "3001"
    "btp" = "3003"
    "assurances" = "3004"
    "communication" = "3005"
}

foreach ($service in $services.GetEnumerator()) {
    $pkgPath = "$PROJECT_ROOT\backend\$($service.Name)\package.json"
    if (Test-Path $pkgPath) {
        $nodePath = "$PROJECT_ROOT\backend\$($service.Name)\node_modules"
        if (Test-Path $nodePath) {
            Log-Result "$($service.Name)" "✅" "Port: $($service.Value), npm installed"
        } else {
            Log-Result "$($service.Name)" "⚠️" "Port: $($service.Value), npm NOT installed"
        }
    } else {
        Log-Result "$($service.Name)" "❌" "package.json manque"
    }
}

# ============================================================================
# TEST 4: Frontend
# ============================================================================
Write-Host "`n[TEST 4/6] ⚛️  Frontend Next.js" -ForegroundColor Yellow

$frontendPath = "$PROJECT_ROOT\frontend"

# package.json
if (Test-Path "$frontendPath\package.json") {
    Log-Result "Frontend package.json" "✅" "Trouvé"
} else {
    Log-Result "Frontend package.json" "❌" "Manque"
}

# node_modules
if (Test-Path "$frontendPath\node_modules") {
    $size = [math]::Round((Get-ChildItem $frontendPath\node_modules -Recurse -ErrorAction SilentlyContinue | Measure-Object -Sum).Sum / 1MB, 2)
    Log-Result "Frontend node_modules" "✅" "Installé ($size MB)"
} else {
    Log-Result "Frontend node_modules" "⚠️" "NOT installed"
}

# Login page
if (Test-Path "$frontendPath\src\app\login\page.tsx") {
    Log-Result "Login Page" "✅" "Existe"
} else {
    Log-Result "Login Page" "❌" "Manque"
}

# ============================================================================
# TEST 5: Ports Actuels
# ============================================================================
Write-Host "`n[TEST 5/6] 🔌 État des Ports" -ForegroundColor Yellow

$portsToCheck = @{
    3000 = "Frontend"
    3001 = "API Gateway"
    3002 = "Auth Service"
    3003 = "BTP"
    3004 = "Assurances"
    3005 = "Communication"
}

$openPorts = @()

foreach ($port in $portsToCheck.Keys) {
    $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Log-Result "Port $port ($($portsToCheck[$port]))" "✅" "OUVERT"
        $openPorts += $port
    } else {
        Log-Result "Port $port ($($portsToCheck[$port]))" "⭕" "Fermé"
    }
}

Write-Host "`n  📊 Total: $($openPorts.Count) port(s) ouverts sur $($portsToCheck.Count)" -ForegroundColor Cyan

# ============================================================================
# TEST 6: Fichiers de Configuration
# ============================================================================
Write-Host "`n[TEST 6/6] ⚙️  Configuration" -ForegroundColor Yellow

# Vérifier les corrections
$commEnv = "$PROJECT_ROOT\backend\communication\.env"
$content = Get-Content $commEnv -ErrorAction SilentlyContinue
if ($content -like "*communication_db*" -and -not ($content -like "*communication _db*")) {
    Log-Result "Communication .env" "✅" "DB_NAME corrigé (communication_db)"
} else {
    Log-Result "Communication .env" "❌" "DB_NAME INCORRECT (a un espace?)"
}

$btpSql = "$PROJECT_ROOT\backend\btp\create_tables.sql"
$content = Get-Content $btpSql -ErrorAction SilentlyContinue
if ($content -like "*USE btp_db*") {
    Log-Result "BTP create_tables.sql" "✅" "USE statement correct"
} else {
    Log-Result "BTP create_tables.sql" "❌" "USE statement incorrect"
}

$assSql = "$PROJECT_ROOT\backend\assurances\create_tables.sql"
$content = Get-Content $assSql -ErrorAction SilentlyContinue
$lines = $content.Count
if ($content -like "*USE assurance_db*" -and $lines -gt 30) {
    Log-Result "Assurances create_tables.sql" "✅" "Fichier complet ($lines lignes)"
} else {
    Log-Result "Assurances create_tables.sql" "❌" "Fichier incomplet ou incorrect ($lines lignes)"
}

# ============================================================================
# RAPPORT FINAL
# ============================================================================
Write-Host "
╔══════════════════════════════════════════════════════════════════════════════╗
║                       📊 RAPPORT FINAL DU TEST                               ║
╚══════════════════════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

$totalTests = $RESULTS.Count
$passedTests = ($RESULTS | Where-Object {$_.Status -eq "✅"}).Count
$failedTests = ($RESULTS | Where-Object {$_.Status -eq "❌"}).Count
$warningTests = ($RESULTS | Where-Object {$_.Status -eq "⚠️"}).Count

Write-Host "`n📈 Résultats:" -ForegroundColor Yellow
Write-Host "  ✅ Réussis: $passedTests/$totalTests" -ForegroundColor Green
Write-Host "  ❌ Échoués: $failedTests/$totalTests" -ForegroundColor Red
Write-Host "  ⚠️  Avertissements: $warningTests/$totalTests" -ForegroundColor Yellow

Write-Host "`n🔌 Services Actifs: $($openPorts.Count) sur $($portsToCheck.Count)" -ForegroundColor Cyan
if ($openPorts.Count -eq 0) {
    Write-Host "   ⭕ Aucun service actif - Démarrez-les!" -ForegroundColor Yellow
} elseif ($openPorts.Count -lt 3) {
    Write-Host "   ⚠️  Certains services manquent" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ La plupart des services sont actifs" -ForegroundColor Green
}

if ($failedTests -gt 0) {
    Write-Host "`n❌ Tests échoués:" -ForegroundColor Red
    foreach ($test in ($RESULTS | Where-Object {$_.Status -eq "❌"})) {
        Write-Host "   - $($test.Test): $($test.Message)" -ForegroundColor Red
    }
}

# ============================================================================
# RECOMMANDATIONS
# ============================================================================
Write-Host "
╔══════════════════════════════════════════════════════════════════════════════╗
║                        💡 RECOMMANDATIONS                                    ║
╚══════════════════════════════════════════════════════════════════════════════╝
" -ForegroundColor Yellow

if ($openPorts.Count -eq 0) {
    Write-Host "
1️⃣  AUCUN SERVICE DÉMARRÉ!

   Démarrez dans des terminaux séparés:
   
   Terminal 1: Auth Service
   cd backend\auth-service
   npm install (si nécessaire)
   npm start
   
   Terminal 2: API Gateway
   cd backend\api-gateway
   npm install (si nécessaire)
   npm start
   
   Terminal 3: Frontend
   cd frontend
   npm install (si nécessaire)
   npm run dev
" -ForegroundColor Yellow
}

if ($failedTests -gt 0) {
    Write-Host "
2️⃣  RÉSOUDRE LES TESTS ÉCHOUÉS:" -ForegroundColor Red
    Write-Host "
   $(($RESULTS | Where-Object {$_.Status -eq '❌'} | ForEach-Object {$_.Test}) -join "`n   ")" -ForegroundColor Red
}

Write-Host "
3️⃣  TESTER APRÈS CORRECTIONS:

   1. Ouvrir navigateur: http://localhost:3000/login
   2. Email: admin@blg-engineering.com
   3. Password: Blg1app23@
   4. Vérifier la redirection vers /dashboard/admin
" -ForegroundColor Green

Write-Host "
════════════════════════════════════════════════════════════════════════════════
" -ForegroundColor Cyan

Write-Host "`n✨ Appuyez sur Enter pour fermer..." -ForegroundColor Green
Read-Host | Out-Null
