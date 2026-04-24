@echo off
echo ========================================
echo    Starting UConnect
echo ========================================
echo.

echo [1/2] Starting Backend Server...
start "UConnect - Backend" cmd /k "cd /d %~dp0backend && npm run start"

echo [2/2] Starting Frontend Dev Server...
start "UConnect - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo    Both servers are launching!
echo    Backend  : http://localhost:5000
echo    Frontend : http://localhost:5173
echo ========================================
echo.
pause
