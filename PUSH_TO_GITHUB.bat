@echo off
REM 🚀 PUSH TO GITHUB - multiservices-app
REM Instructions complètes pour envoyer le dossier sur GitHub

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║           🚀 PUSH VERS GITHUB - multiservices-app              ║
echo ║                                                                ║
echo ║ Utilisateur: blgengineering                                  ║
echo ║ Email: nossijunior23@gmail.com                               ║
echo ║ Description: vs code                                          ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

set PROJECT_ROOT=C:\Users\mon pc\Desktop\office\ani web-entreprise\projet strucutre entreprise\multiservices-app
set GIT_USER=blgengineering
set GIT_EMAIL=nossijunior23@gmail.com

echo.
echo ═══════════════════════════════════════════════════════════════
echo ÉTAPE 1: Configurer Git localement
echo ═══════════════════════════════════════════════════════════════
echo.

cd /d "%PROJECT_ROOT%"

echo Vérification de Git...
git --version

echo.
echo Configuration de Git avec votre email...
git config --global user.name "%GIT_USER%"
git config --global user.email "%GIT_EMAIL%"

echo ✅ Git configuré avec:
echo   Nom: %GIT_USER%
echo   Email: %GIT_EMAIL%

echo.
echo ═══════════════════════════════════════════════════════════════
echo ÉTAPE 2: Initialiser le dépôt local
echo ═══════════════════════════════════════════════════════════════
echo.

if exist ".git" (
    echo ℹ️  Le dépôt git existe déjà
) else (
    echo Initialisation du dépôt git...
    git init
    echo ✅ Dépôt initialisé
)

echo.
echo ═══════════════════════════════════════════════════════════════
echo ÉTAPE 3: Ajouter tous les fichiers
echo ═══════════════════════════════════════════════════════════════
echo.

echo Ajout de tous les fichiers...
git add .

echo Vérification du statut...
git status

echo.
echo ═══════════════════════════════════════════════════════════════
echo ÉTAPE 4: Créer le commit
echo ═══════════════════════════════════════════════════════════════
echo.

echo Création du commit initial...
git commit -m "Initial commit: multiservices-app project with all services"

echo ✅ Commit créé!

echo.
echo ═══════════════════════════════════════════════════════════════
echo ÉTAPE 5: Créer le dépôt sur GitHub
echo ═══════════════════════════════════════════════════════════════
echo.

echo ❌ ACTION MANUELLE REQUISE!
echo.
echo Allez sur GitHub et créez un nouveau dépôt:
echo.
echo 1. Visitez: https://github.com/new
echo 2. Connectez-vous avec votre compte GitHub
echo 3. Remplissez:
echo    - Repository name: multiservices-app
echo    - Description: vs code
echo    - Public ou Private: Votre choix
echo    - NE cochez PAS "Initialize with README"
echo 4. Cliquez: "Create repository"
echo.
echo 5. Vous verrez les instructions. Utilisez CELLE-CI:
echo    (ou voir étape 6 ci-dessous)

echo.
echo ═══════════════════════════════════════════════════════════════
echo ÉTAPE 6: Lier et pousser vers GitHub
echo ═══════════════════════════════════════════════════════════════
echo.

echo Une fois le dépôt créé sur GitHub, exécutez:
echo.
echo ⚠️  REMPLACEZ <TOKEN> par votre Personal Access Token!
echo    (Allez sur: https://github.com/settings/tokens)
echo.
echo Commande:
echo   git remote add origin https://<TOKEN>@github.com/%GIT_USER%/multiservices-app.git
echo.
echo Puis:
echo   git push -u origin main
echo.

echo ═══════════════════════════════════════════════════════════════

echo.
echo 📋 RÉSUMÉ DES COMMANDES:
echo ═══════════════════════════════════════════════════════════════
echo.
echo # 1. Configurer Git
echo git config --global user.name "%GIT_USER%"
echo git config --global user.email "%GIT_EMAIL%"
echo.
echo # 2. Initialiser dépôt
echo git init
echo.
echo # 3. Ajouter tous les fichiers
echo git add .
echo.
echo # 4. Commit
echo git commit -m "Initial commit: multiservices-app project with all services"
echo.
echo # 5. Ajouter remote (après création du dépôt GitHub)
echo git remote add origin https://<TOKEN>@github.com/%GIT_USER%/multiservices-app.git
echo.
echo # 6. Push
echo git push -u origin main
echo.
echo ═══════════════════════════════════════════════════════════════

echo.
echo ✅ ETAPES 1-4 COMPLÉTÉES!
echo.
echo ⚠️  ACTIONS MANUELLES RESTANTES:
echo    1. Créer le dépôt sur GitHub
echo    2. Générer un Personal Access Token
echo    3. Exécuter les commandes push
echo.

pause
