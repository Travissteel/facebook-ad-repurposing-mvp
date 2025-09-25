@echo off
echo Installing Facebook Ad Repurposing MVP dependencies for Windows...
echo.

echo Installing root dependencies...
call npm install

echo.
echo Installing client dependencies...
cd client
call npm install
cd ..

echo.
echo ✅ Installation complete!
echo.
echo Now you can run:
echo   npm run dev
echo.
echo Or manually:
echo   npm run server  (in one terminal)
echo   npm run client  (in another terminal)
echo.
pause