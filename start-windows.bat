@echo off
echo Starting Facebook Ad Repurposing MVP...
echo.
echo Frontend will be available at: http://localhost:3000
echo Backend will be available at: http://localhost:3001
echo.
echo Opening frontend in browser in 10 seconds...
echo.

REM Start backend server
start "Backend Server" cmd /k "cd /d C:\Users\travi\facebook-ad-repurposing-mvp && npm run server"

REM Wait 5 seconds for backend to start
timeout /t 5 /nobreak > nul

REM Start frontend client
start "Frontend Client" cmd /k "cd /d C:\Users\travi\facebook-ad-repurposing-mvp && npm run client"

REM Wait 5 seconds for frontend to start
timeout /t 5 /nobreak > nul

REM Open browser
start http://localhost:3000

echo.
echo Both services started!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:3001
echo.
echo Press any key to exit...
pause > nul