@echo off
cls
echo.
echo ========================================
echo  Facebook Ad Repurposing MVP Launcher
echo ========================================
echo.

REM Change to project directory
cd /d "C:\Users\travi\facebook-ad-repurposing-mvp"

echo Installing/updating dependencies...
call npm install >nul 2>&1
cd client
call npm install >nul 2>&1
cd ..

echo.
echo Starting services...
echo.

REM Start backend server in new window
echo [1/3] Starting backend server...
start "MVP Backend" cmd /c "cd /d C:\Users\travi\facebook-ad-repurposing-mvp && npm run server-windows && pause"

REM Wait for backend
timeout /t 5 /nobreak >nul

REM Start frontend in new window
echo [2/3] Starting frontend...
start "MVP Frontend" cmd /c "cd /d C:\Users\travi\facebook-ad-repurposing-mvp\client && npm run dev && pause"

REM Wait for frontend
timeout /t 8 /nobreak >nul

REM Open browser
echo [3/3] Opening browser...
start http://localhost:3000

echo.
echo ========================================
echo  SUCCESS! Your MVP is now running:
echo ========================================
echo  Frontend: http://localhost:3000
echo  Backend:  http://localhost:3001
echo.
echo  Features Available:
echo  - Live Facebook Ad Scraping
echo  - AI-Powered Variation Generation  
echo  - ROAS Optimization Engine
echo  - Client Management Dashboard
echo.
echo  Keep both CMD windows open to run the app.
echo  Press any key to exit this launcher...
echo ========================================
pause >nul