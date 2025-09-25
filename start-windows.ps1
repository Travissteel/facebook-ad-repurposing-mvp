# Facebook Ad Repurposing MVP - Windows PowerShell Startup Script

Write-Host "🚀 Starting Facebook Ad Repurposing MVP..." -ForegroundColor Green
Write-Host ""
Write-Host "📍 Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📍 Backend will be available at: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""

# Change to project directory
Set-Location "C:\Users\travi\facebook-ad-repurposing-mvp"

# Start backend server in new window
Write-Host "🔧 Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\travi\facebook-ad-repurposing-mvp'; npm run server-windows"

# Wait for backend to start
Start-Sleep -Seconds 5

# Start frontend client in new window  
Write-Host "🎨 Starting frontend client..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\travi\facebook-ad-repurposing-mvp'; npm run client-windows"

# Wait for frontend to start
Start-Sleep -Seconds 8

# Open browser
Write-Host "🌐 Opening browser..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "✅ Application started successfully!" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Note: Keep both PowerShell windows open to run the application"
Write-Host "Press any key to exit this launcher..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")