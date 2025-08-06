#!/bin/bash

# WhatsWay Plesk Installation Script
echo "====================================="
echo "WhatsWay Plesk Installation Script"
echo "====================================="

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
   echo "Please run as root or with sudo"
   exit 1
fi

echo ""
echo "Step 1: Installing dependencies..."
npm install --production

echo ""
echo "Step 2: Building client application..."
npm run build:client || npx vite build

echo ""
echo "Step 3: Creating necessary directories..."
mkdir -p dist/client

echo ""
echo "Step 4: Copying client files..."
if [ -d "client/dist" ]; then
    cp -r client/dist/* dist/client/
    echo "Client files copied successfully"
else
    echo "Warning: Client build not found"
fi

echo ""
echo "Step 5: Setting permissions..."
chmod +x app.js
chmod +x server.cjs
chmod -R 755 dist/

echo ""
echo "====================================="
echo "Installation complete!"
echo ""
echo "Next steps in Plesk:"
echo "1. Set 'app.js' as your Application startup file"
echo "2. Select Node.js version 20.x or higher"
echo "3. Set your environment variables"
echo "4. Click 'Restart App'"
echo "====================================="