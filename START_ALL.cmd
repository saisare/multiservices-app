@echo off
REM Script de démarrage des microservices - Version CMD
REM FUSION: Immigration + Voyage en un seul service

setlocal enabledelayedexpansion

set PROJECT_ROOT=c:\Users\mon pc\Desktop\office\ani web-entreprise\projet strucutre entreprise\multiservices-app
set BACKEND=%PROJECT_ROOT%\backend

echo.
echo ============================================================
echo    🚀 MICROSERVICES ENTERPRISE - LANCEMENT COMPLET
echo    ✨ Service-Voyage FUSIONNÉ avec Immigration
echo ============================================================
echo.

echo 📋 Services à démarrer:
echo    1. API-GATEWAY (Port 3001)
echo    2. AUTH-SERVICE (Port 3002)
echo    3. BTP (Port 3003)
echo    4. ASSURANCES (Port 3004)
echo    5. COMMUNICATION (Port 3005)
echo    6. RH (Port 3006)
echo    7. VOYAGE-IMMIGRATION FUSIONNÉ (Port 3009) ✨ NEW
echo    8. LOGISTIQUE (Port 3008)
echo    9. FRONTEND (Port 3000)
echo.

REM Vérifier MySQL
echo ⏳ Vérification MySQL...
REM sc query | find "wampmysqld" >nul 2>&1
REM if errorlevel 1 (
REM     echo ⚠️  Service MySQL WAMP non trouvé. Vérifiez que WAMP est démarré.
REM     echo    Assurez-vous que le service MySQL de WAMP est actif.
REM     pause
REM     exit /b 1
REM )
echo ✅ MySQL (WAMP) vérifié (check désactivé)
echo.

REM ========== TERMINAL 1: API-GATEWAY ==========
echo 🚀 Démarrage API-GATEWAY...
start "API-GATEWAY (3001)" cmd /k "cd /d %BACKEND%\api-gateway && npm install --silent && npm start"
timeout /t 2 /nobreak

REM ========== TERMINAL 2: AUTH-SERVICE ==========
echo 🚀 Démarrage AUTH-SERVICE...
start "AUTH-SERVICE (3002)" cmd /k "cd /d %BACKEND%\auth-service && npm install --silent && npm start"
timeout /t 2 /nobreak

REM ========== TERMINAL 3: SERVICE-VOYAGE (FUSIONNÉ) ==========
echo 🚀 Démarrage SERVICE-VOYAGE (Voyage + Immigration)...
start "VOYAGE-IMMIGRATION (3009)" cmd /k "cd /d %BACKEND%\service-voyage && npm install --silent && npm start"
timeout /t 2 /nobreak

REM ========== TERMINAL 4: BTP ==========
echo 🚀 Démarrage BTP...
start "BTP (3003)" cmd /k "cd /d %BACKEND%\btp && npm install --silent && npm start"
timeout /t 2 /nobreak

REM ========== TERMINAL 5: ASSURANCES ==========
echo 🚀 Démarrage ASSURANCES...
start "ASSURANCES (3004)" cmd /k "cd /d %BACKEND%\assurances && npm install --silent && npm start"
timeout /t 2 /nobreak

REM ========== TERMINAL 6: COMMUNICATION ==========
echo 🚀 Démarrage COMMUNICATION...
start "COMMUNICATION (3005)" cmd /k "cd /d %BACKEND%\communication && npm install --silent && npm start"
timeout /t 2 /nobreak

REM ========== TERMINAL 7: RH ==========
echo 🚀 Démarrage RH...
start "RH (3006)" cmd /k "cd /d %BACKEND%\rh && npm install --silent && npm start"
timeout /t 2 /nobreak

REM ========== TERMINAL 8: LOGISTIQUE ==========
echo 🚀 Démarrage LOGISTIQUE...
start "LOGISTIQUE (3008)" cmd /k "cd /d %BACKEND%\service-logistique && npm install --silent && npm start"
timeout /t 3 /nobreak

REM ========== FRONTEND ==========
echo 🚀 Démarrage FRONTEND...
start "FRONTEND NEXT.JS (3000)" cmd /k "cd /d %PROJECT_ROOT%\frontend && cls && echo ⏳ Nettoyage cache... && rmdir /s /q .next 2>nul && echo ⏳ Installation dépendances... && npm install --silent && echo 📦 Build... && npm run build && echo ✅ Build complété! && echo 🚀 Démarrage... && npm run dev"

echo.
echo ============================================================
echo    ✅ LANCEMENT COMPLET INITIÉ!
echo ============================================================
echo.
echo 📍 VÉRIFIER:
echo    • Chaque service doit spawner dans UN NOUVEAU TERMINAL
echo    • Frontend: http://localhost:3000/login
echo    • API Gateway health: http://localhost:3001/health
echo    • Service-Voyage (NOUVEAU): http://localhost:3009/health
echo.
echo 🎯 IMPORTANT:
echo    • Immigration FUSIONNÉ ✅ Voir au login "Service Voyage & Immigration"
echo    • Deux onglets au dashboard: "Voyage" et "Immigration"
echo    • Chaque service = JWT_SECRET indépendant
echo    • 2 BD différentes (voyage_db + voyage_immigration_db)
echo.
echo 📝 Voir le fichier GUIDE_LANCEMENT.md pour tests complets
echo.
pause
