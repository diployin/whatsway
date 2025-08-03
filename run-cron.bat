@echo off
:: WhatsWay Cron Job Runner for Windows
:: This script runs the specified cron job

cd /d %~dp0

:: Check if tsx is available
where /q tsx 2>nul
if %errorlevel% neq 0 (
    echo Error: tsx is not installed. Please run 'npm install' first.
    exit /b 1
)

:: Run the specified cron job
if "%1"=="message-status" (
    echo Running Message Status Updater...
    tsx server/cron/message-status-updater.ts
) else if "%1"=="channel-health" (
    echo Running Channel Health Monitor...
    tsx server/cron/channel-health-monitor.ts
) else if "%1"=="campaign-processor" (
    echo Running Campaign Processor...
    tsx server/cron/campaign-processor.ts
) else (
    echo Usage: %0 {message-status^|channel-health^|campaign-processor}
    exit /b 1
)