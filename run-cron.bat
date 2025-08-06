@echo off
REM WhatsWay Cron Job Runner for Windows
REM Run this script to manually execute cron jobs

echo WhatsWay Cron Job Runner
echo ========================
echo.

REM Check if Node.js is available
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    pause
    exit /b 1
)

echo Node.js detected
echo.

REM Run channel health monitor
echo Running Channel Health Monitor...
node -e "const { ChannelHealthMonitor } = require('./dist/server/cron/channel-health-monitor.js'); const monitor = new ChannelHealthMonitor(); monitor.checkAllChannelsHealth().then(() => console.log('Channel health check completed')).catch(err => console.error('Channel health check failed:', err));" 2>nul || echo Channel health monitor not available

echo.

REM Run message status updater
echo Running Message Status Updater...
node -e "const { MessageStatusUpdater } = require('./dist/server/cron/message-status-updater.js'); const updater = new MessageStatusUpdater(); updater.updatePendingMessageStatuses().then(() => console.log('Message status update completed')).catch(err => console.error('Message status update failed:', err));" 2>nul || echo Message status updater not available

echo.
echo Cron jobs execution completed
pause