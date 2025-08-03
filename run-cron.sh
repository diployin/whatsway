#!/bin/bash

# WhatsWay Cron Job Runner
# This script runs the specified cron job

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if tsx is available
if ! command -v tsx &> /dev/null; then
    echo "Error: tsx is not installed. Please run 'npm install' first."
    exit 1
fi

# Run the specified cron job
case "$1" in
    "message-status")
        echo "Running Message Status Updater..."
        tsx server/cron/message-status-updater.ts
        ;;
    "channel-health")
        echo "Running Channel Health Monitor..."
        tsx server/cron/channel-health-monitor.ts
        ;;
    "campaign-processor")
        echo "Running Campaign Processor..."
        tsx server/cron/campaign-processor.ts
        ;;
    *)
        echo "Usage: $0 {message-status|channel-health|campaign-processor}"
        exit 1
        ;;
esac