@echo off
echo ========================================
echo    CoFlow - Demarrage Local (Enterprise)
echo ========================================

echo.
echo [1/2] Demarrage du Backend TypeScript (port 5000)...
start "CoFlow Backend TS" cmd /k "cd /d %~dp0backend && npm run dev"

echo.
echo [2/2] Demarrage du Frontend Next.js (port 3000)...
timeout /t 2 /nobreak >nul
start "CoFlow Frontend Next" cmd /k "cd /d %~dp0frontend-next && npm run dev"

echo.
echo ========================================
echo  Backend TS : http://localhost:5000
echo  Frontend   : http://localhost:3000
echo ========================================
echo.
echo Fermez les deux fenetres pour arreter les serveurs.
pause
