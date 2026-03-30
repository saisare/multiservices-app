@echo off
REM Test complet du backend et frontend

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║            🧪 TEST COMPLET - BACKEND + FRONTEND                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

set PROJECT_ROOT=C:\Users\mon pc\Desktop\office\ani web-entreprise\projet strucutre entreprise\multiservices-app
set BACKEND_ROOT=%PROJECT_ROOT%\backend
set FRONTEND_ROOT=%PROJECT_ROOT%\frontend

echo.
echo ═══════════════════════════════════════════════════════════════
echo [TEST 1] 🗄️  MySQL
echo ═══════════════════════════════════════════════════════════════
echo.

mysql -u root -e "SELECT VERSION();" 2>nul
if %errorlevel% equ 0 (
    echo ✅ MySQL est actif
) else (
    echo ❌ MySQL n'est pas accessible
    echo Démarrez MySQL: net start MySQL80
    goto end
)

echo.
echo ═══════════════════════════════════════════════════════════════
echo [TEST 2] 📦 Node.js et npm
echo ═══════════════════════════════════════════════════════════════
echo.

node --version
npm --version

echo.
echo ═══════════════════════════════════════════════════════════════
echo [TEST 3] 🔌 Vérification des ports
echo ═══════════════════════════════════════════════════════════════
echo.

for %%P in (3000 3001 3002 3003) do (
    netstat -ano | findstr ":%%P " >nul
    if !errorlevel! equ 0 (
        echo ✅ Port %%P - UTILISÉ (service actif?)
    ) else (
        echo ⭕ Port %%P - LIBRE
    )
)

echo.
echo ═══════════════════════════════════════════════════════════════
echo [TEST 4] 📋 Vérification des fichiers
echo ═══════════════════════════════════════════════════════════════
echo.

if exist "%FRONTEND_ROOT%\package.json" (
    echo ✅ Frontend package.json existe
) else (
    echo ❌ Frontend package.json MANQUE
)

if exist "%FRONTEND_ROOT%\node_modules" (
    echo ✅ Frontend node_modules existe
) else (
    echo ⚠️  Frontend node_modules MANQUE - installer avec: npm install
)

if exist "%BACKEND_ROOT%\auth-service\package.json" (
    echo ✅ Auth Service package.json existe
) else (
    echo ❌ Auth Service package.json MANQUE
)

echo.
echo ═══════════════════════════════════════════════════════════════
echo [TEST 5] 🚀 Prêt pour les tests?
echo ═══════════════════════════════════════════════════════════════
echo.

echo Prochaines étapes:
echo.
echo 1. Si Frontend node_modules manque, exécutez:
echo    REINSTALL_FRONTEND.bat
echo.
echo 2. Pour tester le Frontend:
echo    TEST_FRONTEND.bat
echo.
echo 3. Pour démarrer les services backend:
echo    Terminal 1: cd %BACKEND_ROOT%\auth-service && npm start
echo    Terminal 2: cd %BACKEND_ROOT%\api-gateway && npm start
echo.
echo 4. Pour tester le login:
echo    http://localhost:3000/login
echo    Email: admin@blg-engineering.com
echo    Password: Blg1app23@
echo.

:end
echo.
pause
