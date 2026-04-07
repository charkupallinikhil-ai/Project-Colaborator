@echo off
echo ========================================
echo Student Project Collaboration Platform
echo ========================================
echo.

REM Check if MongoDB is running
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if %errorlevel% neq 0 (
    echo 🗄️  Starting MongoDB...
    if not exist "C:\data\db" mkdir "C:\data\db"
    start "MongoDB" mongod --dbpath "C:\data\db"
    timeout /t 3 /nobreak >nul
) else (
    echo ✅ MongoDB is already running
)

echo.
echo 🔧 Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak

echo.
echo 🌐 Starting Frontend Server...
start "Frontend Server" cmd /k "cd vite-project && npm run dev"

echo.
echo ========================================
echo ✅ All services started successfully!
echo ========================================
echo.
echo 📱 Frontend: http://localhost:5173
echo 🔗 Backend API: http://localhost:5000/api
echo.
echo Demo Accounts:
echo   Student: alice@example.com / password123
echo   Leader:  bob@example.com / password123
echo   Teacher: charlie@example.com / password123
echo.
echo Press any key to close this window...
pause >nul
