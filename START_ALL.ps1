#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Démarrage automatique des microservices Enterprise
.DESCRIPTION
  Lance tous les services backend + frontend dans des terminals séparés
#>

$projectRoot = "c:\Users\mon pc\Desktop\office\ani web-entreprise\projet strucutre entreprise\multiservices-app"
$backendPath = "$projectRoot\backend"

Write-Host "
╔════════════════════════════════════════════════════════════════╗
║  🚀 DÉMARRAGE MICROSERVICES ENTERPRISE (SERVICE-VOYAGE FUSIONNÉ)║
╚════════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

# Variables
$services = @(
    @{
        name = "API-GATEWAY"
        path = "$backendPath\api-gateway"
        port = 3001
        color = "White"
    },
    @{
        name = "AUTH-SERVICE"
        path = "$backendPath\auth-service"
        port = 3002
        color = "Green"
    },
    @{
        name = "BTP"
        path = "$backendPath\btp"
        port = 3003
        color = "Yellow"
    },
    @{
        name = "ASSURANCES"
        path = "$backendPath\assurances"
        port = 3004
        color = "Magenta"
    },
    @{
        name = "COMMUNICATION"
        path = "$backendPath\communication"
        port = 3005
        color = "Cyan"
    },
    @{
        name = "RH"
        path = "$backendPath\rh"
        port = 3006
        color = "DarkGreen"
    },
    @{
        name = "VOYAGE-IMMIGRATION (FUSIONNÉ)"
        path = "$backendPath\service-voyage"
        port = 3009
        color = "Blue"
    },
    @{
        name = "LOGISTIQUE"
        path = "$backendPath\service-logistique"
        port = 3008
        color = "Red"
    }
)

Write-Host "`n📋 Services à démarrer:`n" -ForegroundColor Cyan

foreach ($service in $services) {
    Write-Host "  ✓ $($service.name) (Port $($service.port))" -ForegroundColor $service.color
}

Write-Host "`n⏳ Démarrage des services backend...(Chaque service dans son terminal)...`n" -ForegroundColor Yellow

# Démarrer chaque service dans un terminal séparé
foreach ($service in $services) {
    $title = "[$($service.name) - PORT $($service.port)]"
    $cmd = "
        cd '$($service.path)'
        Write-Host '🔄 Installation dépendances...' -ForegroundColor $([char]27) + '[34m'
        npm install --silent | Out-Null
        Write-Host '✅ Installation complétée' -ForegroundColor Green
        Write-Host '🚀 Démarrage de $($service.name)...' -ForegroundColor $service.color
        npm start
    "
    
    # Ouvrir un nouveau terminal PowerShell pour ce service
    Start-Process PowerShell -ArgumentList "-NoExit", "-Command", $cmd -WindowStyle Normal
    
    Write-Host "  ✓ Terminal lancé pour $($service.name)" -ForegroundColor Green
    Start-Sleep -Milliseconds 500
}

Write-Host "`n✅ Tous les services backend sont en cours de démarrage!`n" -ForegroundColor Green

# Attendre un peu avant de démarrer le frontend
Write-Host "⏳ Attente de 5 secondes pour que les services backend se stabilisent..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Démarrer le frontend
Write-Host "`n🚀 Démarrage du FRONTEND (Next.js - Port 3000)...`n" -ForegroundColor Cyan

$frontendPath = "$projectRoot\frontend"
$frontendCmd = "
    `$StartTime = Get-Date
    
    cd '$frontendPath'
    
    Write-Host '🔄 Nettoyage du cache Next.js...' -ForegroundColor Yellow
    Remove-Item -Path '.next' -Recurse -Force -ErrorAction SilentlyContinue | Out-Null
    
    Write-Host '🔄 Installation dépendances frontend...' -ForegroundColor Yellow
    npm install --silent | Out-Null
    
    Write-Host '📦 Build du projet...' -ForegroundColor Cyan
    npm run build
    
    `$BuildTime = ((Get-Date) - `$StartTime).TotalSeconds
    Write-Host '✅ Build complétée en '$BuildTime' secondes' -ForegroundColor Green
    
    Write-Host '🚀 Démarrage du serveur de développement...`n' -ForegroundColor Green
    npm run dev
"

Start-Process PowerShell -ArgumentList "-NoExit", "-Command", $frontendCmd -WindowStyle Normal

Write-Host "  ✓ Terminal frontend lancé" -ForegroundColor Green

Write-Host "
╔════════════════════════════════════════════════════════════════╗
║  ✅ TOUS LES SERVICES SONT EN COURS DE DÉMARRAGE!            ║
╟────────────────────────────────────────────────────────────────╢
║  📍 ACCÈS:                                                    ║
║     • Frontend:     http://localhost:3000/login              ║
║     • API Gateway:  http://localhost:3001/health             ║
║     • Voyage (NEW): http://localhost:3009/health             ║
║                                                               ║
║  🎯 POINTS CLÉS:                                             ║
║     • Immigration FUSIONNÉ avec Voyage au login             ║
║     • Service-Voyage gère 2 BD: voyage_db + immigration_db  ║
║     • Chaque service a son JWT_SECRET indépendant           ║
║     • Si 1 service crash, autres continuent!               ║
║                                                               ║
║  📋 Voir: GUIDE_LANCEMENT.md pour tests complets             ║
╚════════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

Write-Host "`n💡 Note: Chaque terminal affichera les logs du service`n" -ForegroundColor Yellow
