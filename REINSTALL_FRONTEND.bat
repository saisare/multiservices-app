@echo off
REM Réinstaller les dépendances du frontend

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║    🔧 RÉINSTALLATION FRONTEND - npm install                   ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

cd /d "C:\Users\mon pc\Desktop\office\ani web-entreprise\projet strucutre entreprise\multiservices-app\frontend"

echo [1/3] Suppression de node_modules existant...
if exist node_modules (
    echo Suppression...
    rmdir /s /q node_modules
    echo ✅ node_modules supprimé
) else (
    echo ⭕ node_modules n'existe pas
)
echo.

echo [2/3] Suppression de package-lock.json...
if exist package-lock.json (
    del package-lock.json
    echo ✅ package-lock.json supprimé
) else (
    echo ⭕ package-lock.json n'existe pas
)
echo.

echo [3/3] Installation des dépendances...
echo ⏳ Cela peut prendre 2-5 minutes...
echo.

npm install

if %errorlevel% equ 0 (
    echo.
    echo ✅ Installation réussie!
    echo.
    echo Vous pouvez maintenant lancer:
    echo   npm run dev
) else (
    echo.
    echo ❌ L'installation a échoué
    echo Vérifiez les erreurs ci-dessus
)

echo.
pause
