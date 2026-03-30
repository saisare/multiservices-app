@echo off
REM Test Frontend - npm run dev

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║            🧪 TEST FRONTEND - npm run dev                     ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

cd /d "C:\Users\mon pc\Desktop\office\ani web-entreprise\projet strucutre entreprise\multiservices-app\frontend"

echo [1/4] Vérification Node.js
node --version
echo.

echo [2/4] Vérification npm
npm --version
echo.

echo [3/4] Vérification package.json
type package.json | findstr "name"
echo.

echo [4/4] Lancement du frontend...
echo.
echo ⏳ Cela peut prendre 30-60 secondes la première fois...
echo.

REM Set Turbopack disabled for stability
set NEXT_DISABLE_TURBOPACK=1

REM Run dev server
npm run dev

pause
