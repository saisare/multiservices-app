# 🚀 LANCEMENT RAPIDE - Démarrer tous les services
# Ce script prépare et lance l'application complète

Write-Host "
╔══════════════════════════════════════════════════════════════════════════════╗
║           🚀 LANCEMENT MULTISERVICES APP - DÉMARRAGE AUTOMATIQUE             ║
╚══════════════════════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

$PROJECT_ROOT = "C:\Users\mon pc\Desktop\office\ani web-entreprise\projet strucutre entreprise\multiservices-app"
$BACKEND_ROOT = "$PROJECT_ROOT\backend"
$FRONTEND_ROOT = "$PROJECT_ROOT\frontend"

# Vérifications préalables
Write-Host "`n[PRÉPARATION] Vérifications préalables..." -ForegroundColor Yellow

# 1. MySQL
Write-Host "`n✓ Vérification MySQL..." -NoNewline
try {
    $result = mysql -u root -e "SELECT 1;" 2>&1
    Write-Host " ✅ OK" -ForegroundColor Green
} catch {
    Write-Host " ❌ ERROR" -ForegroundColor Red
    Write-Host "  MySQL n'est pas actif. Démarrez-le et réessayez." -ForegroundColor Red
    Read-Host "Appuyez sur Enter"
    exit 1
}

# 2. Node.js
Write-Host "✓ Vérification Node.js..." -NoNewline
try {
    $version = node --version 2>&1
    Write-Host " ✅ $version" -ForegroundColor Green
} catch {
    Write-Host " ❌ ERROR" -ForegroundColor Red
    Write-Host "  Node.js n'est pas installé." -ForegroundColor Red
    Read-Host "Appuyez sur Enter"
    exit 1
}

# 3. npm
Write-Host "✓ Vérification npm..." -NoNewline
try {
    $version = npm --version 2>&1
    Write-Host " ✅ $version" -ForegroundColor Green
} catch {
    Write-Host " ❌ ERROR" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Toutes les dépendances système OK!" -ForegroundColor Green

# ============================================================================
# INSTALLATION DES DÉPENDANCES
# ============================================================================
Write-Host "`n[INSTALLATION] Installation des dépendances npm..." -ForegroundColor Yellow

function Install-Service {
    param([string]$service, [string]$path)
    
    if (Test-Path "$path\node_modules") {
        Write-Host "  ✓ $service (déjà installé)" -ForegroundColor Gray
        return
    }
    
    Write-Host "  ⏳ $service..." -NoNewline
    Push-Location $path
    $output = npm install --silent 2>&1
    Pop-Location
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅" -ForegroundColor Green
    } else {
        Write-Host " ⚠️  (avec avertissements)" -ForegroundColor Yellow
    }
}

Write-Host "`n▸ Backend Services:" -ForegroundColor Cyan
Install-Service "auth-service" "$BACKEND_ROOT\auth-service"
Install-Service "api-gateway" "$BACKEND_ROOT\api-gateway"
Install-Service "btp" "$BACKEND_ROOT\btp"
Install-Service "assurances" "$BACKEND_ROOT\assurances"
Install-Service "communication" "$BACKEND_ROOT\communication"
Install-Service "rh" "$BACKEND_ROOT\rh"

Write-Host "`n▸ Frontend:" -ForegroundColor Cyan
Install-Service "frontend" "$FRONTEND_ROOT"

# ============================================================================
# INITIALISATION BASE DE DONNÉES
# ============================================================================
Write-Host "`n[BASE DE DONNÉES] Initialisation..." -ForegroundColor Yellow

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
    Write-Host "  ✓ $db" -ForegroundColor Gray
}

# Initialiser les tables
Write-Host "`n▸ Tables d'initialisation:" -ForegroundColor Cyan

try {
    mysql -u root auth_db < "$BACKEND_ROOT\init-auth-db.sql" 2>$null
    Write-Host "  ✓ auth_db" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  auth_db (erreur)" -ForegroundColor Yellow
}

try {
    mysql -u root btp_db < "$BACKEND_ROOT\btp\create_tables.sql" 2>$null
    Write-Host "  ✓ btp_db" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  btp_db (erreur)" -ForegroundColor Yellow
}

try {
    mysql -u root assurance_db < "$BACKEND_ROOT\assurances\create_tables.sql" 2>$null
    Write-Host "  ✓ assurance_db" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  assurance_db (erreur)" -ForegroundColor Yellow
}

# ============================================================================
# PRÊT À DÉMARRER
# ============================================================================
Write-Host "
╔══════════════════════════════════════════════════════════════════════════════╗
║                    ✅ PRÊT À DÉMARRER LES SERVICES!                          ║
╚══════════════════════════════════════════════════════════════════════════════╝
" -ForegroundColor Green

Write-Host "
🔴 ATTENTION: Les services doivent être démarrés dans des TERMINAUX SÉPARÉS!

Ouvrez 4 terminaux (CMD ou PowerShell) et exécutez:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[TERMINAL 1 - Auth Service] 🔐
" -ForegroundColor Yellow

Write-Host "cd ""$BACKEND_ROOT\auth-service""
npm start" -ForegroundColor Cyan

Write-Host "
Attendez: ✅ SERVICE AUTH DÉMARRÉ sur port 3002

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[TERMINAL 2 - API Gateway] 🌐
" -ForegroundColor Yellow

Write-Host "cd ""$BACKEND_ROOT\api-gateway""
npm start" -ForegroundColor Cyan

Write-Host "
Attendez: API Gateway running on port 3001

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[TERMINAL 3 - Frontend] ⚛️
" -ForegroundColor Yellow

Write-Host "cd ""$FRONTEND_ROOT""
npm run dev" -ForegroundColor Cyan

Write-Host "
Attendez: ▲ Next.js ready in ... (http://localhost:3000)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[TERMINAL 4 - (OPTIONNEL) Services supplémentaires] 📦

Vous pouvez démarrer d'autres services (btp, communication, etc.) au besoin:
" -ForegroundColor Yellow

Write-Host "cd ""$BACKEND_ROOT\btp""
npm start" -ForegroundColor Cyan

Write-Host "
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 TESTER L'APPLICATION
" -ForegroundColor Green

Write-Host "
1. Ouvrez votre navigateur:
   http://localhost:3000/login

2. Entrez les identifiants de test:
   Email: admin@blg-engineering.com
   Password: Blg1app23@

3. Vous devez être redirigé vers:
   http://localhost:3000/dashboard/admin

4. Vérifiez l'API Gateway:
   http://localhost:3001/health

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🐛 TROUBLESHOOTING
" -ForegroundColor Yellow

Write-Host "
❌ Port 3002 déjà utilisé?
   taskkill /F /IM node.exe
   OU
   Trouver le process: netstat -ano | findstr :3002
   Tuer: taskkill /PID <PID> /F

❌ MySQL erreur?
   Vérifiez: mysql -u root -e ""SELECT 1;""
   Redémarrez MySQL: net stop MySQL80 && net start MySQL80

❌ npm install échoue?
   cd SERVICE_PATH
   rm -r node_modules package-lock.json
   npm install

❌ Frontend timeout?
   Arrêtez (Ctrl+C) et relancez:
   set NEXT_DISABLE_TURBOPACK=1
   npm run dev

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
" -ForegroundColor Red

Write-Host "
✨ Appuyez sur Enter pour fermer ce script..." -ForegroundColor Green
Read-Host | Out-Null
