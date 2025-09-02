@echo off
echo 🚀 Starting Tourism App...
echo.

echo 📡 Starting Node.js Backend...
cd tourism_app\node-server
start "Tourism Backend" cmd /k "npm start"
timeout /t 3 /nobreak >nul

echo 🌐 Starting Next.js Dashboard...
cd ..\..\tourism-dashboard
start "Tourism Dashboard" cmd /k "pnpm dev"
timeout /t 3 /nobreak >nul

echo.
echo ✅ Tourism App is starting up!
echo.
echo 📡 Backend: http://localhost:9000
echo 🌐 Dashboard: http://localhost:3000
echo.
echo 📖 Check README-INTEGRATION.md for setup instructions
echo.
pause
