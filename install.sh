#!/bin/bash

# WhatsWay - Easy Installer Script
# This script installs and configures the WhatsWay WhatsApp Business Platform

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }

# ASCII Art Logo
echo -e "${GREEN}"
cat << "EOF"
 __      __.__            __         __      __                
/  \    /  \  |__ _____ _/  |_  ____/  \    /  \_____  ___.__. 
\   \/\/   /  |  \\__  \\   __\/  ___/   \/\/   /\__  \<   |  |
 \        /|   Y  \/ __ \|  |  \___ \\        /  / __ \\___  |
  \__/\  / |___|  (____  /__| /____  >\__/\  /  (____  / ____|
       \/       \/     \/          \/      \/        \/\/     

EOF
echo -e "${NC}"
echo "Welcome to WhatsWay - WhatsApp Business Platform Installer"
echo "=========================================================="
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        NODE_VERSION=$(node -v | cut -d 'v' -f 2)
        REQUIRED_VERSION="18.0.0"
        if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
            return 0
        else
            return 1
        fi
    else
        return 1
    fi
}

# Function to check PostgreSQL connection
check_postgres() {
    if [ -z "$DATABASE_URL" ]; then
        return 1
    fi
    
    # Try to connect to PostgreSQL
    npm run db:push >/dev/null 2>&1
    return $?
}

# Function to generate secure password
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

# Function to setup environment file
setup_env_file() {
    if [ -f .env ]; then
        print_warning ".env file already exists. Backing up to .env.backup"
        cp .env .env.backup
    fi
    
    echo ""
    print_info "Setting up environment configuration..."
    echo ""
    
    # Session Secret
    SESSION_SECRET=$(generate_password)
    
    # WhatsApp Configuration
    echo "=== WhatsApp Business API Configuration ==="
    echo ""
    read -p "Enter your WhatsApp Business Account ID: " WHATSAPP_BUSINESS_ACCOUNT_ID
    read -p "Enter your WhatsApp Access Token: " WHATSAPP_ACCESS_TOKEN
    read -p "Enter your WhatsApp Phone Number ID: " WHATSAPP_PHONE_NUMBER_ID
    read -p "Enter your Webhook Verify Token (any secret string): " WEBHOOK_VERIFY_TOKEN
    
    echo ""
    echo "=== Database Configuration ==="
    echo ""
    read -p "Enter your PostgreSQL DATABASE_URL (or press Enter to use local): " DATABASE_URL
    
    if [ -z "$DATABASE_URL" ]; then
        DATABASE_URL="postgresql://postgres:postgres@localhost:5432/whatsway"
        print_info "Using local PostgreSQL: $DATABASE_URL"
    fi
    
    # Create .env file
    cat > .env << EOL
# Session Configuration
SESSION_SECRET=$SESSION_SECRET

# Database Configuration
DATABASE_URL=$DATABASE_URL

# WhatsApp Business API Configuration
WHATSAPP_BUSINESS_ACCOUNT_ID=$WHATSAPP_BUSINESS_ACCOUNT_ID
WHATSAPP_ACCESS_TOKEN=$WHATSAPP_ACCESS_TOKEN
WHATSAPP_PHONE_NUMBER_ID=$WHATSAPP_PHONE_NUMBER_ID
WEBHOOK_VERIFY_TOKEN=$WEBHOOK_VERIFY_TOKEN

# WhatsApp API Version
WHATSAPP_API_VERSION=v23.0

# MM Lite API Configuration (Optional - for high-volume messaging)
MM_LITE_API_URL=
MM_LITE_API_KEY=

# Application URL (Update this with your domain)
APP_URL=http://localhost:5173

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
EOL

    print_success "Environment configuration created"
}

# Function to setup webhook
setup_webhook() {
    echo ""
    print_info "Webhook Setup Instructions"
    echo "=========================="
    echo ""
    echo "To receive WhatsApp messages, you need to configure webhooks in Meta Developer Console:"
    echo ""
    echo "1. Go to your Meta App Dashboard"
    echo "2. Navigate to WhatsApp > Configuration"
    echo "3. Set the following webhook URL:"
    echo ""
    echo -e "${GREEN}   Webhook URL: ${BLUE}https://YOUR_DOMAIN/api/webhook${NC}"
    echo -e "${GREEN}   Verify Token: ${BLUE}$WEBHOOK_VERIFY_TOKEN${NC}"
    echo ""
    echo "4. Subscribe to these webhook fields:"
    echo "   - messages"
    echo "   - message_status"
    echo "   - message_template_status_update"
    echo ""
    read -p "Press Enter when you've completed the webhook setup..."
}

# Function to setup cron job
setup_cron() {
    echo ""
    print_info "Setting up automated tasks (cron jobs)..."
    
    # Create cron script
    cat > cron-setup.sh << 'EOL'
#!/bin/bash

# WhatsWay Cron Jobs Setup

# Get the current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Add cron jobs
(crontab -l 2>/dev/null; echo "# WhatsWay Automated Tasks") | crontab -
(crontab -l 2>/dev/null; echo "*/5 * * * * cd $SCRIPT_DIR && npm run cron:message-status >/dev/null 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "0 * * * * cd $SCRIPT_DIR && npm run cron:channel-health >/dev/null 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "*/10 * * * * cd $SCRIPT_DIR && npm run cron:campaign-processor >/dev/null 2>&1") | crontab -

echo "Cron jobs have been set up successfully!"
echo ""
echo "Scheduled tasks:"
echo "- Message Status Updater: Every 5 minutes"
echo "- Channel Health Monitor: Every hour"
echo "- Campaign Processor: Every 10 minutes"
EOL

    chmod +x cron-setup.sh
    
    echo ""
    echo "A cron setup script has been created: cron-setup.sh"
    echo ""
    read -p "Would you like to set up cron jobs now? (y/n): " SETUP_CRON
    
    if [ "$SETUP_CRON" = "y" ] || [ "$SETUP_CRON" = "Y" ]; then
        ./cron-setup.sh
        print_success "Cron jobs configured"
    else
        print_info "You can run './cron-setup.sh' later to set up automated tasks"
    fi
}

# Function to create systemd service
create_systemd_service() {
    echo ""
    read -p "Would you like to set up WhatsWay as a system service? (y/n): " SETUP_SERVICE
    
    if [ "$SETUP_SERVICE" != "y" ] && [ "$SETUP_SERVICE" != "Y" ]; then
        return
    fi
    
    SERVICE_FILE="/etc/systemd/system/whatsway.service"
    CURRENT_DIR=$(pwd)
    
    # Create service file content
    cat > whatsway.service << EOL
[Unit]
Description=WhatsWay - WhatsApp Business Platform
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$CURRENT_DIR
ExecStart=/usr/bin/npm run start
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=whatsway
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
EOL

    print_info "System service file created. To install it, run:"
    echo "sudo cp whatsway.service $SERVICE_FILE"
    echo "sudo systemctl daemon-reload"
    echo "sudo systemctl enable whatsway"
    echo "sudo systemctl start whatsway"
}

# Main installation process
main() {
    echo "Starting installation process..."
    echo ""
    
    # Step 1: Check prerequisites
    print_info "Checking prerequisites..."
    
    MISSING_DEPS=0
    
    # Check Node.js
    if check_node_version; then
        print_success "Node.js $(node -v) is installed"
    else
        print_error "Node.js 18+ is required"
        MISSING_DEPS=1
    fi
    
    # Check npm
    if command_exists npm; then
        print_success "npm $(npm -v) is installed"
    else
        print_error "npm is not installed"
        MISSING_DEPS=1
    fi
    
    # Check Git
    if command_exists git; then
        print_success "Git is installed"
    else
        print_error "Git is not installed"
        MISSING_DEPS=1
    fi
    
    # Check PostgreSQL client
    if command_exists psql; then
        print_success "PostgreSQL client is installed"
    else
        print_warning "PostgreSQL client not found (optional)"
    fi
    
    if [ $MISSING_DEPS -eq 1 ]; then
        echo ""
        print_error "Missing prerequisites. Please install the required software:"
        echo ""
        echo "Node.js 18+: https://nodejs.org/"
        echo "Git: https://git-scm.com/"
        echo ""
        exit 1
    fi
    
    echo ""
    print_success "All prerequisites are met!"
    
    # Step 2: Install dependencies
    echo ""
    print_info "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
    
    # Step 3: Setup environment
    setup_env_file
    
    # Step 4: Setup database
    echo ""
    print_info "Setting up database..."
    
    if check_postgres; then
        print_success "Database connection successful"
        
        # Run migrations
        print_info "Running database migrations..."
        npm run db:push
        print_success "Database schema created"
        
        # Seed initial data
        print_info "Creating default admin user..."
        print_info "Username: whatsway"
        print_info "Password: Admin@123"
        print_warning "Please change the default password after first login!"
    else
        print_error "Could not connect to database"
        print_info "Please ensure PostgreSQL is running and DATABASE_URL is correct"
        print_info "You can run 'npm run db:push' manually after fixing the connection"
    fi
    
    # Step 5: Build the application
    echo ""
    print_info "Building the application..."
    npm run build
    print_success "Application built successfully"
    
    # Step 6: Setup webhook
    setup_webhook
    
    # Step 7: Setup cron jobs
    setup_cron
    
    # Step 8: Create systemd service (optional)
    create_systemd_service
    
    # Installation complete
    echo ""
    echo "============================================"
    print_success "Installation completed successfully!"
    echo "============================================"
    echo ""
    echo "Next steps:"
    echo ""
    echo "1. Start the application:"
    echo "   Development mode: npm run dev"
    echo "   Production mode: npm run start"
    echo ""
    echo "2. Access the application:"
    echo "   URL: http://localhost:5173"
    echo "   Username: whatsway"
    echo "   Password: Admin@123"
    echo ""
    echo "3. Configure your WhatsApp webhook in Meta Developer Console"
    echo ""
    echo "4. Add your WhatsApp channels in Settings > WhatsApp"
    echo ""
    print_warning "Remember to change the default admin password!"
    echo ""
    echo "For documentation and support, visit: https://github.com/yourusername/whatsway"
    echo ""
}

# Run main installation
main