@echo off
REM Stock Screener Pro - Local Development Setup Script for Windows

echo.
echo 🚀 Starting Stock Screener Pro Setup...
echo.

REM Check Node.js
echo 📦 Checking Node.js...
node --version
npm --version

REM Check Docker
if command docker version >nul 2>&1 (
    echo 🐳 Docker is installed
    docker --version
)

echo.
echo Choose setup method:
echo 1) Docker Compose (recommended)
echo 2) Manual setup
echo.

set /p choice="Enter choice (1 or 2): "

if "%choice%"=="1" (
    echo.
    echo 🐳 Starting Docker Compose setup...
    docker-compose up -d
    
    echo.
    echo ✓ Services started!
    echo.
    echo URLs:
    echo   Frontend:  http://localhost:3000
    echo   Backend:   http://localhost:5000
    echo   MongoDB:   mongodb://localhost:27017
    echo.
    
) else if "%choice%"=="2" (
    echo.
    echo 📦 Setting up backend...
    cd backend
    call npm install
    
    if not exist .env (
        echo 📝 Creating .env from template...
        copy .env.example .env
    )
    
    cd ..
    
    echo.
    echo 📦 Setting up frontend...
    call npm install
    
    if not exist .env.local (
        echo 📝 Creating .env.local from template...
        copy .env.example .env.local
    )
    
    echo.
    echo ✓ Setup complete!
    echo.
    echo To start development:
    echo.
    echo Terminal 1 - Backend:
    echo   cd backend
    echo   npm run dev
    echo.
    echo Terminal 2 - Frontend:
    echo   npm run dev
    echo.
    
) else (
    echo Invalid choice
    exit /b 1
)

echo.
echo ✅ Setup complete! Happy coding! 🎉
echo.
pause
