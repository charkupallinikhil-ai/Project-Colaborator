# Student Project Collaboration Platform - Startup Script
# Run with: powershell -ExecutionPolicy Bypass -File start.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Student Project Collaboration Platform" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check MongoDB
Write-Host "🔍 Checking MongoDB..." -ForegroundColor Yellow
$mongoRunning = Get-Process mongod -ErrorAction SilentlyContinue
if (-not $mongoRunning) {
    Write-Host "⚠️  MongoDB is NOT running!" -ForegroundColor Red
    Write-Host "   Start MongoDB with: mongod" -ForegroundColor Yellow
    Write-Host ""
}
else {
    Write-Host "✅ MongoDB is running" -ForegroundColor Green
    Write-Host ""
}

# Check if packages are installed
Write-Host "📦 Checking dependencies..." -ForegroundColor Yellow

$backendModules = Test-Path "backend/node_modules"
$frontendModules = Test-Path "vite-project/node_modules"

if (-not $backendModules) {
    Write-Host "   Installing backend dependencies..." -ForegroundColor Yellow
    Push-Location backend
    npm install
    Pop-Location
}

if (-not $frontendModules) {
    Write-Host "   Installing frontend dependencies..." -ForegroundColor Yellow
    Push-Location vite-project
    npm install
    Pop-Location
}

Write-Host "✅ Dependencies ready" -ForegroundColor Green
Write-Host ""

# Start Backend
Write-Host "🚀 Starting Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command cd backend; npm run dev"
Start-Sleep -Seconds 2

# Start Frontend
Write-Host "🚀 Starting Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command cd vite-project; npm run dev"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Services Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📌 URLs:" -ForegroundColor Yellow
Write-Host "   🌐 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "   🔧 Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔐 Demo Credentials:" -ForegroundColor Yellow
Write-Host "   👤 Student: alice@example.com / password123" -ForegroundColor White
Write-Host "   👤 Leader:  bob@example.com / password123" -ForegroundColor White
Write-Host "   👤 Teacher: charlie@example.com / password123" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: If login fails, run 'npm run seed' in backend terminal" -ForegroundColor Green
Write-Host ""
