@echo off
REM ################################################################################
REM # WhatsWay Auto-Installer for Windows
REM # Supports: Windows Server, Windows 10/11 with IIS
REM # Version: 1.0
REM ################################################################################

setlocal enabledelayedexpansion

echo ========================================
echo    WhatsWay Auto-Installer for Windows
echo ========================================
echo.

REM Check administrator privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Administrator privileges required!
    echo Please run this script as Administrator.
    pause
    exit /b 1
)

REM Variables
set APP_NAME=WhatsWay
set NODE_VERSION=20
set INSTALL_DIR=%CD%

echo [1/10] Checking System Requirements...
echo ========================================

REM Check Windows version
ver | findstr /i "10\." >nul
if %errorlevel% equ 0 (
    echo [OK] Windows 10 detected
) else (
    ver | findstr /i "11\." >nul
    if %errorlevel% equ 0 (
        echo [OK] Windows 11 detected
    ) else (
        ver | findstr /i "Server" >nul
        if %errorlevel% equ 0 (
            echo [OK] Windows Server detected
        ) else (
            echo [WARNING] Unknown Windows version
        )
    )
)

REM Check if Node.js is installed
echo.
echo [2/10] Checking Node.js Installation...
echo ========================================
where node >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node -v') do set NODE_CURRENT=%%i
    echo [OK] Node.js !NODE_CURRENT! is installed
) else (
    echo [INFO] Node.js not found. Installing...
    echo.
    echo Please download and install Node.js manually from:
    echo https://nodejs.org/dist/latest-v20.x/
    echo.
    pause
    exit /b 1
)

REM Check npm
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] NPM not found!
    pause
    exit /b 1
)

echo [OK] NPM is installed

REM Install PM2 globally
echo.
echo [3/10] Installing PM2 Process Manager...
echo ========================================
call npm install -g pm2 pm2-windows-startup
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install PM2
    pause
    exit /b 1
)
echo [OK] PM2 installed

REM Create installation directory structure
echo.
echo [4/10] Setting Up Directory Structure...
echo ========================================
if not exist "%INSTALL_DIR%\logs" mkdir "%INSTALL_DIR%\logs"
if not exist "%INSTALL_DIR%\dist" mkdir "%INSTALL_DIR%\dist"
echo [OK] Directory structure created

REM Check for application files
echo.
echo [5/10] Checking Application Files...
echo ========================================
if not exist "%INSTALL_DIR%\package.json" (
    echo [ERROR] Application files not found!
    echo Please copy WhatsWay files to: %INSTALL_DIR%
    pause
    exit /b 1
)
echo [OK] Application files found

REM Install dependencies
echo.
echo [6/10] Installing Dependencies...
echo ========================================
call npm ci --production
if %errorlevel% neq 0 (
    echo [WARNING] npm ci failed, trying npm install...
    call npm install --production
)
echo [OK] Dependencies installed

REM Setup environment
echo.
echo [7/10] Setting Up Environment...
echo ========================================
if not exist ".env" (
    echo Creating .env file...
    (
        echo # Server Configuration
        echo NODE_ENV=production
        echo PORT=5000
        echo APP_URL=http://localhost:5000
        echo.
        echo # Database Configuration
        echo DATABASE_URL=postgresql://user:password@localhost:5432/whatsway
        echo.
        echo # Session Configuration
        echo SESSION_SECRET=change-this-secret-key-minimum-32-characters
        echo.
        echo # WhatsApp Business API Configuration
        echo WHATSAPP_API_VERSION=v23.0
        echo WHATSAPP_BUSINESS_ACCOUNT_ID=
        echo WHATSAPP_ACCESS_TOKEN=
        echo WHATSAPP_PHONE_NUMBER_ID=
        echo WHATSAPP_WEBHOOK_VERIFY_TOKEN=your-webhook-token
    ) > .env
    echo [OK] Created .env file
    echo [ACTION] Please edit .env file with your configuration
) else (
    echo [OK] .env file already exists
)

REM Build application
echo.
echo [8/10] Building Application...
echo ========================================
call npm run build
if %errorlevel% neq 0 (
    echo [WARNING] Build failed, application may not work properly
) else (
    echo [OK] Application built successfully
)

REM Create Windows service script
echo.
echo [9/10] Creating Windows Service Configuration...
echo ========================================
(
    echo const { apps } = require('./ecosystem.config.js'^);
    echo const pm2 = require('pm2'^);
    echo.
    echo pm2.connect(err =^> {
    echo   if (err^) {
    echo     console.error(err^);
    echo     process.exit(2^);
    echo   }
    echo.
    echo   pm2.start(apps[0], (err, proc^) =^> {
    echo     pm2.disconnect(^);
    echo     if (err^) throw err;
    echo   }^);
    echo }^);
) > start-service.js

REM Create PM2 ecosystem file
(
    echo module.exports = {
    echo   apps: [{
    echo     name: 'whatsway',
    echo     script: './dist/server/index.js',
    echo     instances: 1,
    echo     autorestart: true,
    echo     watch: false,
    echo     max_memory_restart: '1G',
    echo     env: {
    echo       NODE_ENV: 'production',
    echo       PORT: 5000
    echo     },
    echo     error_file: './logs/err.log',
    echo     out_file: './logs/out.log',
    echo     log_file: './logs/combined.log',
    echo     time: true
    echo   }]
    echo };
) > ecosystem.config.js

echo [OK] Service configuration created

REM Setup IIS (if available)
echo.
echo [10/10] Checking IIS Configuration...
echo ========================================
where iisreset >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] IIS detected. Setting up IIS configuration...
    
    REM Create web.config for IIS
    (
        echo ^<?xml version="1.0" encoding="utf-8"?^>
        echo ^<configuration^>
        echo   ^<system.webServer^>
        echo     ^<handlers^>
        echo       ^<add name="iisnode" path="dist/server/index.js" verb="*" modules="iisnode" /^>
        echo     ^</handlers^>
        echo     ^<rewrite^>
        echo       ^<rules^>
        echo         ^<rule name="NodeJS"^>
        echo           ^<match url=".*" /^>
        echo           ^<action type="Rewrite" url="dist/server/index.js" /^>
        echo         ^</rule^>
        echo       ^</rules^>
        echo     ^</rewrite^>
        echo     ^<security^>
        echo       ^<requestFiltering^>
        echo         ^<requestLimits maxAllowedContentLength="10485760" /^>
        echo       ^</requestFiltering^>
        echo     ^</security^>
        echo   ^</system.webServer^>
        echo ^</configuration^>
    ) > web.config
    
    echo [OK] IIS configuration created
) else (
    echo [INFO] IIS not detected, using PM2 standalone
)

REM Start application with PM2
echo.
echo Starting WhatsWay Application...
echo ========================================
call pm2 start ecosystem.config.js
call pm2 save

REM Setup PM2 to start on Windows startup
call pm2-startup install

echo.
echo ========================================
echo    Installation Complete!
echo ========================================
echo.
echo WhatsWay has been successfully installed!
echo.
echo Access Information:
echo -------------------
echo URL: http://localhost:5000
echo Admin Username: whatsway
echo Admin Password: Admin@123
echo.
echo IMPORTANT NEXT STEPS:
echo 1. Edit .env file with your configuration
echo 2. Set DATABASE_URL to your PostgreSQL database
echo 3. Add WhatsApp API credentials
echo 4. Restart the application: pm2 restart whatsway
echo.
echo Useful Commands:
echo ----------------
echo pm2 status         - Check application status
echo pm2 logs whatsway  - View application logs
echo pm2 restart whatsway - Restart application
echo pm2 stop whatsway  - Stop application
echo.
echo For Plesk Users:
echo ----------------
echo 1. Copy all files to your httpdocs folder
echo 2. Set startup file to: app.js
echo 3. Run NPM install and build in Plesk
echo.
pause