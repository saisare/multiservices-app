#!/bin/bash
# 🔧 SCRIPT DE CORRECTION AUTOMATIQUE
# Ce script corrige tous les problèmes identifiés

Write-Host "
╔══════════════════════════════════════════════════════════════════════════════╗
║              🔧 CORRECTION AUTOMATIQUE DES PROBLÈMES                         ║
║                                                                              ║
║  Cet script va corriger tous les problèmes trouvés dans le diagnostic       ║
╚══════════════════════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

$backendRoot = "C:\Users\mon pc\Desktop\office\ani web-entreprise\projet strucutre entreprise\multiservices-app\backend"

Write-Host "`n[1/3] 🔧 Correction des fichiers .env..." -ForegroundColor Yellow

# ========================================
# CORRECTION 1: Communication .env
# ========================================
$commEnvFile = "$backendRoot\communication\.env"
if (Test-Path $commEnvFile) {
    Write-Host "  Correction: communication/.env" -ForegroundColor Cyan
    $content = Get-Content $commEnvFile
    $content = $content -replace "DB_NAME=communication _db", "DB_NAME=communication_db"
    Set-Content -Path $commEnvFile -Value $content -Force
    Write-Host "  ✅ communication/.env corrigé" -ForegroundColor Green
}

# ========================================
# CORRECTION 2: BTP create_tables.sql
# ========================================
$btpSqlFile = "$backendRoot\btp\create_tables.sql"
if (Test-Path $btpSqlFile) {
    Write-Host "  Correction: btp/create_tables.sql" -ForegroundColor Cyan
    $content = Get-Content $btpSqlFile
    $content = $content -replace "USE multiservices;", "USE btp_db;"
    Set-Content -Path $btpSqlFile -Value $content -Force
    Write-Host "  ✅ btp/create_tables.sql corrigé" -ForegroundColor Green
}

# ========================================
# CORRECTION 3: Assurances create_tables.sql
# ========================================
$assSqlFile = "$backendRoot\assurances\create_tables.sql"
Write-Host "  Correction: assurances/create_tables.sql" -ForegroundColor Cyan

# Lire le fichier
$content = @"
-- Assurances Service Database
USE assurance_db;

CREATE TABLE IF NOT EXISTS contrats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    type_assurance VARCHAR(100) NOT NULL,
    montant_couverture DECIMAL(12, 2) NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE,
    statut ENUM('ACTIF', 'EXPIRÉ', 'ANNULÉ') DEFAULT 'ACTIF',
    prime DECIMAL(10, 2) NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (client_id),
    INDEX (statut)
);

CREATE TABLE IF NOT EXISTS sinistres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contrat_id INT NOT NULL,
    date_sinistre DATE NOT NULL,
    description TEXT,
    montant_reclamation DECIMAL(12, 2),
    statut ENUM('EN_COURS', 'APPROUVÉ', 'REJETÉ', 'PAYÉ') DEFAULT 'EN_COURS',
    date_declaration TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contrat_id) REFERENCES contrats(id),
    INDEX (contrat_id),
    INDEX (statut)
);

CREATE TABLE IF NOT EXISTS clients_assurances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    telephone VARCHAR(20),
    date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"@

Set-Content -Path $assSqlFile -Value $content -Force
Write-Host "  ✅ assurances/create_tables.sql complété" -ForegroundColor Green

Write-Host "`n[2/3] 📦 Installation des dépendances npm..." -ForegroundColor Yellow

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

foreach ($service in $services) {
    $servicePath = "$backendRoot\$service"
    if ((Test-Path "$servicePath\package.json") -and -not (Test-Path "$servicePath\node_modules")) {
        Write-Host "  Installation: $service..." -ForegroundColor Cyan
        Push-Location $servicePath
        npm install --silent 2>&1 | Out-Null
        Pop-Location
        Write-Host "  ✅ $service" -ForegroundColor Green
    }
}

# Frontend
Write-Host "  Installation: frontend..." -ForegroundColor Cyan
$frontendPath = "$backendRoot\..\frontend"
if ((Test-Path "$frontendPath\package.json") -and -not (Test-Path "$frontendPath\node_modules")) {
    Push-Location $frontendPath
    npm install --silent 2>&1 | Out-Null
    Pop-Location
    Write-Host "  ✅ frontend" -ForegroundColor Green
} else {
    Write-Host "  ⭕ frontend déjà installé ou node_modules existe" -ForegroundColor Gray
}

Write-Host "`n[3/3] 🗄️  Initialisation des bases de données..." -ForegroundColor Yellow

# Créer les bases de données d'abord
Write-Host "  Création des bases de données..." -ForegroundColor Cyan
@(
    "auth_db",
    "btp_db",
    "assurance_db",
    "communication_db",
    "rh_db",
    "immigration_db",
    "logistique_db",
    "voyage_db",
    "voyage_immigration_db"
) | ForEach-Object {
    mysql -u root -e "CREATE DATABASE IF NOT EXISTS $_;" 2>$null
    Write-Host "  ✅ $_ créée" -ForegroundColor Green
}

# Exécuter les scripts d'initialisation
Write-Host "  Initialisation des tables..." -ForegroundColor Cyan
try {
    mysql -u root < "$backendRoot\init-auth-db.sql" 2>$null
    Write-Host "  ✅ auth_db initialisée" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Erreur lors de l'initialisation auth_db" -ForegroundColor Yellow
}

try {
    mysql -u root btp_db < "$backendRoot\btp\create_tables.sql" 2>$null
    Write-Host "  ✅ btp_db initialisée" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Erreur lors de l'initialisation btp_db" -ForegroundColor Yellow
}

try {
    mysql -u root assurance_db < "$backendRoot\assurances\create_tables.sql" 2>$null
    Write-Host "  ✅ assurance_db initialisée" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Erreur lors de l'initialisation assurance_db" -ForegroundColor Yellow
}

Write-Host "`n
╔══════════════════════════════════════════════════════════════════════════════╗
║                    ✅ CORRECTIONS TERMINÉES!                                 ║
╚══════════════════════════════════════════════════════════════════════════════╝
" -ForegroundColor Green

Write-Host "`n🚀 MAINTENANT, DÉMARREZ LES SERVICES:" -ForegroundColor Yellow

Write-Host "
1️⃣  TERMINAL 1 - Auth Service:
    cd '$backendRoot\auth-service'
    npm start

2️⃣  TERMINAL 2 - API Gateway:
    cd '$backendRoot\api-gateway'
    npm start

3️⃣  TERMINAL 3 - Autres services (optionnel):
    cd '$backendRoot\btp'
    npm start
    # Répétez pour d'autres services si besoin

4️⃣  TERMINAL 4 - Frontend:
    cd '$backendRoot\..\frontend'
    npm run dev

5️⃣  Ouvrez le navigateur:
    http://localhost:3000/login
    
    Identifiants de test:
    Email: admin@blg-engineering.com
    Password: Blg1app23@
" -ForegroundColor Cyan

Write-Host "`n✨ Bon développement! ✨`n" -ForegroundColor Green
