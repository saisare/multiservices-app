# Script de démarrage complet - Multiservices App

Write-Host "🚀 DÉMARRAGE COMPLET - MULTISERVICES APP" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Yellow

# Fonction de test d'endpoint
function Test-Endpoint {
    param([string]$url, [string]$description)
    Write-Host "`n🧪 Test: $description" -ForegroundColor Cyan
    Write-Host "📡 URL: $url" -ForegroundColor Gray

    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 10
        $data = $response.Content | ConvertFrom-Json

        if ($response.StatusCode -eq 200) {
            Write-Host "✅ SUCCESS: $($response.StatusCode)" -ForegroundColor Green
            Write-Host "📊 Data reçue" -ForegroundColor Green
        } else {
            Write-Host "❌ ERROR: $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "💥 NETWORK ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 1. Vérifier Node.js
Write-Host "`n📦 VÉRIFICATION ENVIRONNEMENT" -ForegroundColor Magenta
node --version
npm --version

# 2. Démarrer les services backend (dans l'ordre)
Write-Host "`n🔧 DÉMARRAGE SERVICES BACKEND" -ForegroundColor Magenta

# API Gateway
Write-Host "`n🚪 Démarrage API Gateway (Port 3001)" -ForegroundColor Yellow
Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory "C:\Users\mon pc\Desktop\office\ani web-entreprise\projet strucutre entreprise\multiservices-app\backend\api-gateway" -NoNewWindow

Start-Sleep -Seconds 2

# Service BTP
Write-Host "`n🏗️ Démarrage Service BTP (Port 3003)" -ForegroundColor Yellow
Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory "C:\Users\mon pc\Desktop\office\ani web-entreprise\projet strucutre entreprise\multiservices-app\backend\btp" -NoNewWindow

# Service Logistique
Write-Host "`n📦 Démarrage Service Logistique (Port 3008)" -ForegroundColor Yellow
Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory "C:\Users\mon pc\Desktop\office\ani web-entreprise\projet strucutre entreprise\multiservices-app\backend\service-logistique" -NoNewWindow

# Service Immigration
Write-Host "`n🇩🇪 Démarrage Service Immigration (Port 3007)" -ForegroundColor Yellow
Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory "C:\Users\mon pc\Desktop\office\ani web-entreprise\projet strucutre entreprise\multiservices-app\backend\service-immigration" -NoNewWindow

Write-Host "`n⏳ Attente démarrage services (10s)..." -ForegroundColor Gray
Start-Sleep -Seconds 10

# 3. Tests des endpoints
Write-Host "`n🧪 TESTS ENDPOINTS BACKEND" -ForegroundColor Magenta

Test-Endpoint "http://localhost:3001/health" "API Gateway Health"
Test-Endpoint "http://localhost:3003/health" "BTP Service Health"
Test-Endpoint "http://localhost:3008/health" "Logistique Service Health"
Test-Endpoint "http://localhost:3007/health" "Immigration Service Health"

Test-Endpoint "http://localhost:3001/api/btp/stats" "BTP Stats API"
Test-Endpoint "http://localhost:3001/api/logistique/produits" "Logistique Produits API"
Test-Endpoint "http://localhost:3001/api/immigration/clients" "Immigration Clients API"

# 4. Démarrage frontend
Write-Host "`n🌐 DÉMARRAGE FRONTEND" -ForegroundColor Magenta
Write-Host "📱 Next.js App (Port 3000)" -ForegroundColor Yellow

# Ouvrir terminal pour frontend
Write-Host "`n💻 Ouvrez un nouveau terminal PowerShell et exécutez:" -ForegroundColor Cyan
Write-Host "cd 'C:\Users\mon pc\Desktop\office\ani web-entreprise\projet strucutre entreprise\multiservices-app\frontend'" -ForegroundColor White
Write-Host "npm run dev" -ForegroundColor White

Write-Host "`n🎯 ACCÈS APPLICATION" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "API Gateway: http://localhost:3001/health" -ForegroundColor White

Write-Host "`n✅ CONFIGURATION TERMINÉE" -ForegroundColor Green
Write-Host "Appuyez sur une touche pour quitter..." -ForegroundColor Gray
Read-Host