@echo off
REM 🚀 AUTOMATISATION COMPLÈTE GITHUB PUSH

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║        🚀 AUTOMATISATION GITHUB PUSH - ÉTAPES CLÉS            ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

set PROJECT_ROOT=C:\Users\mon pc\Desktop\office\ani web-entreprise\projet strucutre entreprise\multiservices-app
set GIT_USER=blgengineering
set GIT_EMAIL=nossijunior23@gmail.com

cd /d "%PROJECT_ROOT%"

echo.
echo ═══════════════════════════════════════════════════════════════
echo [1/5] Configuration Git
echo ═══════════════════════════════════════════════════════════════
echo.

git config --global user.name "%GIT_USER%"
git config --global user.email "%GIT_EMAIL%"

echo ✅ Git configuré:
git config --global user.name
git config --global user.email

echo.
echo ═══════════════════════════════════════════════════════════════
echo [2/5] Initialiser le dépôt
echo ═══════════════════════════════════════════════════════════════
echo.

if exist ".git" (
    echo ✅ Dépôt déjà existant
) else (
    git init
    echo ✅ Dépôt initialisé
)

echo.
echo ═══════════════════════════════════════════════════════════════
echo [3/5] Ajouter tous les fichiers
echo ═══════════════════════════════════════════════════════════════
echo.

git add .
echo ✅ Tous les fichiers ajoutés

echo.
echo État du dépôt:
git status

echo.
echo ═══════════════════════════════════════════════════════════════
echo [4/5] Créer le commit
echo ═══════════════════════════════════════════════════════════════
echo.

git commit -m "Initial commit: multiservices-app project with full stack services, frontend, and database"

if %errorlevel% equ 0 (
    echo ✅ Commit créé avec succès!
) else (
    echo ⚠️  Commit échoué (peut-être déjà existant)
)

echo.
echo ═══════════════════════════════════════════════════════════════
echo [5/5] Prêt pour le push GitHub
echo ═══════════════════════════════════════════════════════════════
echo.

echo.
echo ℹ️  ACTIONS REQUISES:
echo.
echo 1️⃣  Créer le dépôt sur GitHub:
echo    Allez sur: https://github.com/new
echo    - Repository name: multiservices-app
echo    - Description: vs code
echo    - NE cochez PAS "Initialize with README"
echo    - Cliquez: "Create repository"
echo.
echo 2️⃣  Générer un Personal Access Token:
echo    Allez sur: https://github.com/settings/tokens
echo    - "Generate new token (classic)"
echo    - Cochez: repo, workflow
echo    - Générez et COPIEZ le token
echo.
echo 3️⃣  Pousser le code:
echo    Exécutez ces commandes dans CMD:
echo.
echo    git remote add origin https://^<TOKEN^>@github.com/%GIT_USER%/multiservices-app.git
echo.
echo    git push -u origin main
echo.
echo ═══════════════════════════════════════════════════════════════
echo.

echo.
echo 📊 INFO DÉPÔT:
echo    Utilisateur: %GIT_USER%
echo    Email: %GIT_EMAIL%
echo    Dépôt: multiservices-app
echo    Description: vs code
echo    URL: https://github.com/%GIT_USER%/multiservices-app
echo.

echo.
pause
