Write-Host "🚀 Starting Tourism App..." -ForegroundColor Green
Write-Host ""

Write-Host "📡 Starting Node.js Backend..." -ForegroundColor Yellow
Set-Location "tourism_app\node-server"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal
Start-Sleep -Seconds 3

Write-Host "🌐 Starting Next.js Dashboard..." -ForegroundColor Yellow
Set-Location "..\..\tourism-dashboard"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "pnpm dev" -WindowStyle Normal
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "✅ Tourism App is starting up!" -ForegroundColor Green
Write-Host ""
Write-Host "📡 Backend: http://localhost:9000" -ForegroundColor Cyan
Write-Host "🌐 Dashboard: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 Check README-INTEGRATION.md for setup instructions" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to continue..."
