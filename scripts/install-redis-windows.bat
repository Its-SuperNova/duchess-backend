@echo off
echo 🪟 Redis Installation for Windows - Duchess Pastries
echo ==================================================

echo.
echo Checking for existing Redis installation...
redis-cli --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Redis is already installed!
    echo Testing Redis server...
    redis-cli ping >nul 2>&1
    if %errorlevel% == 0 (
        echo ✅ Redis server is running!
        echo.
        echo 🎉 Redis is ready to use!
        pause
        exit /b 0
    ) else (
        echo ❌ Redis server is not running
        echo Starting Redis server...
        start redis-server.exe
        timeout /t 3 >nul
        redis-cli ping >nul 2>&1
        if %errorlevel% == 0 (
            echo ✅ Redis server started successfully!
        ) else (
            echo ❌ Failed to start Redis server
        )
    )
    pause
    exit /b 0
)

echo.
echo Redis not found. Installing Redis...
echo.

echo 📦 Option 1: Install via Chocolatey (Recommended)
echo ================================================
choco --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Chocolatey found! Installing Redis...
    choco install redis-64 -y
    if %errorlevel% == 0 (
        echo ✅ Redis installed successfully via Chocolatey!
        echo Starting Redis server...
        start redis-server.exe
        timeout /t 3 >nul
        redis-cli ping >nul 2>&1
        if %errorlevel% == 0 (
            echo ✅ Redis server started successfully!
            echo.
            echo 🎉 Redis is ready to use!
            pause
            exit /b 0
        )
    )
) else (
    echo ❌ Chocolatey not found
)

echo.
echo 📦 Option 2: Install via Docker
echo ==============================
docker --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Docker found! Starting Redis container...
    docker run -d -p 6379:6379 --name redis redis:latest
    if %errorlevel% == 0 (
        echo ✅ Redis container started successfully!
        echo.
        echo 🎉 Redis is ready to use!
        pause
        exit /b 0
    )
) else (
    echo ❌ Docker not found
)

echo.
echo 📦 Option 3: Manual Installation
echo ================================
echo.
echo Please follow these steps to install Redis manually:
echo.
echo 1. Download Redis for Windows:
echo    https://github.com/microsoftarchive/redis/releases
echo.
echo 2. Extract the downloaded zip file
echo.
echo 3. Copy the extracted files to C:\Redis\
echo.
echo 4. Add C:\Redis\ to your PATH environment variable:
echo    - Open System Properties ^> Environment Variables
echo    - Add C:\Redis\ to the PATH variable
echo.
echo 5. Run: redis-server.exe
echo.
echo 6. Test: redis-cli ping
echo.
echo After installation, run this script again to verify.
echo.
pause





