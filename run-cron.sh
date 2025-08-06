#!/bin/bash

# WhatsWay Cron Job Runner
# Run this script to manually execute cron jobs

cd "$(dirname "$0")"

echo "WhatsWay Cron Job Runner"
echo "========================"
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✓ Environment variables loaded"
else
    echo "✗ .env file not found"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "✗ Node.js is not installed"
    exit 1
fi

echo "✓ Node.js $(node -v) detected"
echo ""

# Run channel health monitor
echo "Running Channel Health Monitor..."
node -e "
const { ChannelHealthMonitor } = require('./dist/server/cron/channel-health-monitor.js');
const monitor = new ChannelHealthMonitor();
monitor.checkAllChannelsHealth().then(() => {
    console.log('✓ Channel health check completed');
}).catch(err => {
    console.error('✗ Channel health check failed:', err);
});
" 2>/dev/null || echo "⚠ Channel health monitor not available"

echo ""

# Run message status updater
echo "Running Message Status Updater..."
node -e "
const { MessageStatusUpdater } = require('./dist/server/cron/message-status-updater.js');
const updater = new MessageStatusUpdater();
updater.updatePendingMessageStatuses().then(() => {
    console.log('✓ Message status update completed');
}).catch(err => {
    console.error('✗ Message status update failed:', err);
});
" 2>/dev/null || echo "⚠ Message status updater not available"

echo ""
echo "Cron jobs execution completed"