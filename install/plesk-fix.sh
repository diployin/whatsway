#!/bin/bash
#==============================================================================
# WhatsWay Plesk Fix Script
# Fixes common Plesk/Phusion Passenger startup issues
#==============================================================================

set -e

echo "======================================"
echo "  WhatsWay Plesk Fix Tool"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the application directory
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_DIR"

echo -e "${YELLOW}Application directory: $APP_DIR${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Step 1: Check Node.js version
echo -e "${YELLOW}Step 1: Checking Node.js version...${NC}"
if command_exists node; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}Node.js version: $NODE_VERSION${NC}"
    
    # Check if version is 18 or higher
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -lt 18 ]; then
        echo -e "${RED}ERROR: Node.js version 18 or higher is required${NC}"
        echo "Please update Node.js in Plesk panel to version 18.x or 20.x"
        exit 1
    fi
else
    echo -e "${RED}ERROR: Node.js is not installed${NC}"
    exit 1
fi

# Step 2: Check and install dependencies
echo ""
echo -e "${YELLOW}Step 2: Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install --production
else
    echo -e "${GREEN}Dependencies already installed${NC}"
fi

# Step 3: Build the application
echo ""
echo -e "${YELLOW}Step 3: Building application...${NC}"
if [ ! -d "dist" ] || [ ! -d "client/dist" ]; then
    echo "Building application (this may take a few minutes)..."
    npm run build
    echo -e "${GREEN}Build completed${NC}"
else
    echo -e "${GREEN}Application already built${NC}"
    echo "To rebuild, delete 'dist' and 'client/dist' folders and run this script again"
fi

# Step 4: Check database configuration
echo ""
echo -e "${YELLOW}Step 4: Checking database configuration...${NC}"
if [ -f ".env" ]; then
    if grep -q "DATABASE_URL" .env; then
        echo -e "${GREEN}.env file exists with DATABASE_URL${NC}"
        
        # Run database migrations
        echo "Running database migrations..."
        npm run db:push
        echo -e "${GREEN}Database migrations completed${NC}"
    else
        echo -e "${RED}WARNING: DATABASE_URL not found in .env file${NC}"
        echo "Please add your PostgreSQL connection string to .env file"
    fi
else
    echo -e "${RED}ERROR: .env file not found${NC}"
    echo "Creating .env from template..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${YELLOW}Please edit .env file with your configuration${NC}"
    fi
fi

# Step 5: Create Plesk-compatible startup wrapper
echo ""
echo -e "${YELLOW}Step 5: Creating Plesk startup wrapper...${NC}"

# Create a simple CommonJS wrapper that Plesk can use
cat > passenger_wsgi.js << 'EOF'
// Plesk/Passenger startup wrapper for WhatsWay
const path = require('path');

// Set environment
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Load environment variables
require('dotenv').config();

// Check if built files exist
const fs = require('fs');
const distExists = fs.existsSync(path.join(__dirname, 'dist', 'index.js'));

if (distExists) {
    // Use built version
    console.log('Starting WhatsWay from built files...');
    module.exports = require('./dist/index.js');
} else {
    // Use development version with dynamic import
    console.log('Starting WhatsWay in development mode...');
    (async () => {
        try {
            await import('./server/index.js');
        } catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    })();
}
EOF

echo -e "${GREEN}Created passenger_wsgi.js${NC}"

# Step 6: Create Plesk instructions file
echo ""
echo -e "${YELLOW}Step 6: Creating Plesk configuration instructions...${NC}"

cat > PLESK_SETUP.txt << 'EOF'
========================================
WhatsWay Plesk Configuration Instructions
========================================

Your application is now ready for Plesk. Follow these steps in Plesk panel:

1. GO TO NODE.JS SETTINGS
   - Navigate to: Websites & Domains → Node.js
   - Click on your Node.js application

2. CONFIGURE APPLICATION
   Set these values:
   - Node.js version: 20.x (or 18.x minimum)
   - Document root: /httpdocs (or your installation path)
   - Application mode: production
   - Application startup file: Try these in order until one works:
     a) passenger_wsgi.js (recommended)
     b) plesk-start.js
     c) app.js
     d) server.js

3. ENVIRONMENT VARIABLES
   Add these in the "Application Settings" section:
   - NODE_ENV = production
   - PORT = (use Plesk default or 5000)
   - Copy all variables from your .env file

4. APPLY CHANGES
   - Click "Enable Node.js" if not already enabled
   - Click "Restart Application"

5. CHECK APPLICATION
   - Visit your domain
   - Check logs if there are issues:
     * Plesk Panel → Logs → Node.js logs
     * Or check: /var/log/passenger/passenger.log

TROUBLESHOOTING:
- If app won't start, try different startup files listed above
- Ensure PostgreSQL database is accessible
- Check that all environment variables are set
- Verify Node.js version is 18.x or higher
- Try running manually: node passenger_wsgi.js

DEFAULT LOGIN:
Username: whatsway
Password: Admin@123

EOF

echo -e "${GREEN}Created PLESK_SETUP.txt${NC}"

# Step 7: Set permissions
echo ""
echo -e "${YELLOW}Step 7: Setting file permissions...${NC}"
chmod +x *.js
chmod +x server/*.js 2>/dev/null || true
echo -e "${GREEN}Permissions set${NC}"

# Final summary
echo ""
echo "======================================"
echo -e "${GREEN}  Plesk Fix Completed Successfully!${NC}"
echo "======================================"
echo ""
echo -e "${YELLOW}NEXT STEPS:${NC}"
echo "1. Go to Plesk Node.js panel"
echo "2. Set startup file to: passenger_wsgi.js"
echo "3. Click 'Restart Application'"
echo "4. Check PLESK_SETUP.txt for detailed instructions"
echo ""
echo -e "${GREEN}Your application should now work with Plesk!${NC}"
echo ""
echo "If you still have issues, try these startup files in order:"
echo "  - passenger_wsgi.js (recommended)"
echo "  - plesk-start.js"
echo "  - app.js"
echo "  - server.js"
echo ""
echo "Default login: whatsway / Admin@123"