@echo off
REM 🚀 LANCER TOUS LES SERVICES - Script de démarrage complet

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║              🚀 LANCEMENT DE TOUS LES SERVICES                ║
echo ║                                                                ║
echo ║  1. MySQL (Base de données)                                  ║
echo ║  2. Auth Service (Port 3002)                                 ║
echo ║  3. API Gateway (Port 3001)                                  ║
echo ║  4. Frontend (Port 3000)                                     ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

set PROJECT_ROOT=C:\Users\mon pc\Desktop\office\ani web-entreprise\projet strucutre entreprise\multiservices-app
set BACKEND_ROOT=%PROJECT_ROOT%\backend
set FRONTEND_ROOT=%PROJECT_ROOT%\frontend

echo.
echo ═══════════════════════════════════════════════════════════════
echo [VÉRIFICATION] 🔍 Avant de démarrer
echo ═══════════════════════════════════════════════════════════════
echo.

echo 1. Vérification de MySQL...
mysql -u root -e "SELECT 1;" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MySQL est actif
) else (
    echo ❌ MySQL n'est pas actif!
    echo Démarrez MySQL: net start MySQL80
    echo.
    pause
    exit /b 1
)

echo 2. Vérification de Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js trouvé: !
    node --version
) else (
    echo ❌ Node.js non trouvé!
    pause
    exit /b 1
)

echo 3. Vérification npm...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ npm trouvé:
    npm --version
) else (
    echo ❌ npm non trouvé!
    pause
    exit /b 1
)

echo.
echo ✅ Tous les prérequis OK!

echo.
echo ═══════════════════════════════════════════════════════════════
echo [LANCEMENT] 🚀 Ouverture des terminaux
echo ═══════════════════════════════════════════════════════════════
echo.

echo ⏳ Démarrage des services...
echo.

REM Terminal 1: Auth Service
echo Lancement Terminal 1: Auth Service (Port 3002)...
start "Auth Service - Port 3002" cmd /k "cd /d "%BACKEND_ROOT%\auth-service" && npm start"
timeout /t 2 >nul

REM Terminal 2: API Gateway
echo Lancement Terminal 2: API Gateway (Port 3001)...
start "API Gateway - Port 3001" cmd /k "cd /d "%BACKEND_ROOT%\api-gateway" && npm start"
timeout /t 2 >nul

REM Terminal 3: Frontend
echo Lancement Terminal 3: Frontend (Port 3000)...
start "Frontend - Port 3000" cmd /k "cd /d "%FRONTEND_ROOT%" && set NEXT_DISABLE_TURBOPACK=1 && npm run dev"
timeout /t 2 >nul

echo.
echo ═══════════════════════════════════════════════════════════════
echo [STATUS] 📊 Services en cours de démarrage
echo ═══════════════════════════════════════════════════════════════
echo.

echo ⏳ Attente de 5 secondes pour le démarrage des services...
timeout /t 5 >nul

echo.
echo 🔍 Vérification des ports...
echo.

REM Vérifier les ports
for %%P in (3000 3001 3002) do (
    netstat -ano 2>nul | findstr ":%%P " >nul
    if !errorlevel! equ 0 (
        echo ✅ Port %%P - ACTIF
    ) else (
        echo ⭕ Port %%P - Attente du démarrage...
    )
)

echo.
echo ═══════════════════════════════════════════════════════════════
echo [ACCÈS] 🌐 Adresses disponibles
echo ═══════════════════════════════════════════════════════════════
echo.

echo 🌐 Frontend:
echo    http://localhost:3000
echo    http://localhost:3000/login
echo.

echo 🌐 API Gateway:
echo    http://localhost:3001/health
echo.

echo 🌐 Auth Service:
echo    http://localhost:3002
echo.

echo ═══════════════════════════════════════════════════════════════
echo [IDENTIFIANTS] 🔐 Tester le login
echo ═══════════════════════════════════════════════════════════════
echo.

echo Email: admin@blg-engineering.com
echo Password: Blg1app23@
echo.

echo ═══════════════════════════════════════════════════════════════
echo [TERMINAUX] 📟 Vérification
echo ═══════════════════════════════════════════════════════════════
echo.

echo Vous devriez voir 3 terminaux ouverts:
echo   1️⃣  Auth Service (Port 3002)
echo   2️⃣  API Gateway (Port 3001)
echo   3️⃣  Frontend (Port 3000)
echo.

echo Si les services affichent des erreurs, vérifiez:
echo   • MySQL est actif
echo   • Les ports ne sont pas utilisés: netstat -ano
echo   • Les node_modules sont installés: npm install
echo.

echo ═══════════════════════════════════════════════════════════════
echo ✅ SERVICES LANCÉS!
echo ═══════════════════════════════════════════════════════════════
echo.

echo 📝 Prochaines étapes:
echo   1. Ouvrir: http://localhost:3000/login
echo   2. Entrer les identifiants
echo   3. Vérifier le dashboard
echo.

echo ⏳ Appuyez sur une touche pour continuer...
pause >nul

echo.
echo Les services restent actifs dans les terminaux ouverts.
echo Fermez les terminaux pour arrêter les services.
echo.

echo ✨ Bon développement! ✨
echo.
