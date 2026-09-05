@echo off
echo ========================================
echo    CoFlow - Lancement en LOCAL
echo ========================================

echo.
echo [1/2] Demarrage du Backend (port 5000)...
start "CoFlow Backend" cmd /k "cd /d %~dp0backend && npm run dev"

echo.
echo [2/2] Demarrage du Frontend (port 5173)...
timeout /t 2 /nobreak >nul
start "CoFlow Frontend" cmd /k "cd /d %~dp0frontend && yarn dev"

echo.
echo ========================================
echo  Backend  : http://localhost:5000
echo  Frontend : http://localhost:5173
echo ========================================
echo.
echo Fermez les fenetres "CoFlow Backend" et
echo "CoFlow Frontend" pour arreter le projet.
pause
