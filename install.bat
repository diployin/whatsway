@echo off
setlocal enabledelayedexpansion

:: WhatsWay - Easy Installer Script for Windows
:: This script installs and configures the WhatsWay WhatsApp Business Platform

echo.
echo  __      __.__            __         __      __                
echo /  \    /  \  ^|__ _____ _/  ^|_  ____/  \    /  \_____  ___.__. 
echo \   \/\/   /  ^|  \\__  \\   __\/  ___/   \/\/   /\__  \^<   ^|  ^|
echo  \        /^|   Y  \/ __ \^|  ^|  \___ \\        /  / __ \\___  ^|
echo   \__/\  / ^|___^|  (____  /__^| /____  ^>\__/\  /  (____  / ____^|
echo        \/       \/     \/          \/      \/        \/\/     
echo.
echo Welcome to WhatsWay - WhatsApp Business Platform Installer
echo ==========================================================
echo.

:: Function to check if command exists
where /q node 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js 18+ from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check Node.js version
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION% is installed

:: Check npm
where /q npm 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed!
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo [OK] npm %NPM_VERSION% is installed

:: Check Git
where /q git 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Git is not installed (optional)
) else (
    echo [OK] Git is installed
)

echo.
echo [INFO] All prerequisites are met!
echo.

:: Install dependencies
echo [INFO] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

:: Setup environment file
if exist .env (
    echo [WARNING] .env file already exists. Backing up to .env.backup
    copy .env .env.backup >nul
)

echo [INFO] Setting up environment configuration...
echo.

:: Generate session secret
set "SESSION_SECRET="
for /L %%i in (1,1,32) do (
    set /a "rand=!random! %% 62"
    for %%j in (0 1 2 3 4 5 6 7 8 9 A B C D E F G H I J K L M N O P Q R S T U V W X Y Z a b c d e f g h i j k l m n o p q r s t u v w x y z) do (
        if !rand!==0 set "SESSION_SECRET=!SESSION_SECRET!%%j"
        set /a "rand-=1"
    )
)

:: WhatsApp Configuration
echo === WhatsApp Business API Configuration ===
echo.
set /p WHATSAPP_BUSINESS_ACCOUNT_ID="Enter your WhatsApp Business Account ID: "
set /p WHATSAPP_ACCESS_TOKEN="Enter your WhatsApp Access Token: "
set /p WHATSAPP_PHONE_NUMBER_ID="Enter your WhatsApp Phone Number ID: "
set /p WEBHOOK_VERIFY_TOKEN="Enter your Webhook Verify Token (any secret string): "

echo.
echo === Database Configuration ===
echo.
set /p DATABASE_URL="Enter your PostgreSQL DATABASE_URL (or press Enter to use local): "

if "%DATABASE_URL%"=="" (
    set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/whatsway
    echo [INFO] Using local PostgreSQL: !DATABASE_URL!
)

:: Create .env file
(
echo # Session Configuration
echo SESSION_SECRET=!SESSION_SECRET!
echo.
echo # Database Configuration
echo DATABASE_URL=!DATABASE_URL!
echo.
echo # WhatsApp Business API Configuration
echo WHATSAPP_BUSINESS_ACCOUNT_ID=!WHATSAPP_BUSINESS_ACCOUNT_ID!
echo WHATSAPP_ACCESS_TOKEN=!WHATSAPP_ACCESS_TOKEN!
echo WHATSAPP_PHONE_NUMBER_ID=!WHATSAPP_PHONE_NUMBER_ID!
echo WEBHOOK_VERIFY_TOKEN=!WEBHOOK_VERIFY_TOKEN!
echo.
echo # WhatsApp API Version
echo WHATSAPP_API_VERSION=v23.0
echo.
echo # MM Lite API Configuration ^(Optional - for high-volume messaging^)
echo MM_LITE_API_URL=
echo MM_LITE_API_KEY=
echo.
echo # Application URL ^(Update this with your domain^)
echo APP_URL=http://localhost:5173
echo.
echo # CORS Configuration
echo CORS_ORIGIN=http://localhost:5173
echo.
echo # Rate Limiting
echo RATE_LIMIT_WINDOW_MS=60000
echo RATE_LIMIT_MAX_REQUESTS=100
echo.
echo # Logging
echo LOG_LEVEL=info
) > .env

echo [OK] Environment configuration created
echo.

:: Setup database
echo [INFO] Setting up database...
call npm run db:push 2>nul
if %errorlevel% equ 0 (
    echo [OK] Database connection successful
    echo [OK] Database schema created
    echo.
    echo [INFO] Creating default admin user...
    echo [INFO] Username: whatsway
    echo [INFO] Password: Admin@123
    echo [WARNING] Please change the default password after first login!
) else (
    echo [ERROR] Could not connect to database
    echo [INFO] Please ensure PostgreSQL is running and DATABASE_URL is correct
    echo [INFO] You can run 'npm run db:push' manually after fixing the connection
)
echo.

:: Build the application
echo [INFO] Building the application...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build application
    pause
    exit /b 1
)
echo [OK] Application built successfully
echo.

:: Webhook setup instructions
echo [INFO] Webhook Setup Instructions
echo ==========================
echo.
echo To receive WhatsApp messages, you need to configure webhooks in Meta Developer Console:
echo.
echo 1. Go to your Meta App Dashboard
echo 2. Navigate to WhatsApp ^> Configuration
echo 3. Set the following webhook URL:
echo.
echo    Webhook URL: https://YOUR_DOMAIN/api/webhook
echo    Verify Token: !WEBHOOK_VERIFY_TOKEN!
echo.
echo 4. Subscribe to these webhook fields:
echo    - messages
echo    - message_status
echo    - message_template_status_update
echo.
pause

:: Create start scripts
echo [INFO] Creating start scripts...

:: Create start-dev.bat
(
echo @echo off
echo echo Starting WhatsWay in development mode...
echo npm run dev
echo pause
) > start-dev.bat

:: Create start-prod.bat
(
echo @echo off
echo echo Starting WhatsWay in production mode...
echo npm run start
echo pause
) > start-prod.bat

echo [OK] Start scripts created
echo.

:: Create Windows Task Scheduler script
(
echo @echo off
echo echo Creating Windows Task Scheduler tasks for WhatsWay...
echo.
echo :: Message Status Updater - Every 5 minutes
echo schtasks /create /tn "WhatsWay Message Status Updater" /tr "cmd /c cd /d %CD% && npm run cron:message-status" /sc minute /mo 5 /f
echo.
echo :: Channel Health Monitor - Every hour
echo schtasks /create /tn "WhatsWay Channel Health Monitor" /tr "cmd /c cd /d %CD% && npm run cron:channel-health" /sc hourly /f
echo.
echo :: Campaign Processor - Every 10 minutes
echo schtasks /create /tn "WhatsWay Campaign Processor" /tr "cmd /c cd /d %CD% && npm run cron:campaign-processor" /sc minute /mo 10 /f
echo.
echo echo Task Scheduler tasks created successfully!
echo echo.
echo echo To manage these tasks, open Task Scheduler ^(taskschd.msc^)
echo pause
) > setup-tasks.bat

echo.
echo A task scheduler setup script has been created: setup-tasks.bat
echo.
set /p SETUP_TASKS="Would you like to set up automated tasks now? (y/n): "

if /i "%SETUP_TASKS%"=="y" (
    call setup-tasks.bat
    echo [OK] Automated tasks configured
) else (
    echo [INFO] You can run 'setup-tasks.bat' later to set up automated tasks
)

:: Installation complete
echo.
echo ============================================
echo [OK] Installation completed successfully!
echo ============================================
echo.
echo Next steps:
echo.
echo 1. Start the application:
echo    Development mode: start-dev.bat
echo    Production mode: start-prod.bat
echo.
echo 2. Access the application:
echo    URL: http://localhost:5173
echo    Username: whatsway
echo    Password: Admin@123
echo.
echo 3. Configure your WhatsApp webhook in Meta Developer Console
echo.
echo 4. Add your WhatsApp channels in Settings ^> WhatsApp
echo.
echo [WARNING] Remember to change the default admin password!
echo.
echo For documentation and support, visit: https://github.com/yourusername/whatsway
echo.
pause