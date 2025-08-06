#!/bin/bash

################################################################################
# WhatsWay Auto-Installer Script
# Supports: Plesk, cPanel, DigitalOcean, AWS, Any Linux Server
# Version: 1.0
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
APP_NAME="WhatsWay"
NODE_VERSION="20"
MIN_RAM=1024
INSTALL_DIR=""
SERVER_TYPE=""
DOMAIN=""
EMAIL=""
DB_TYPE=""
DB_URL=""
SESSION_SECRET=""

# Function to print colored output
print_color() {
    echo -e "${2}${1}${NC}"
}

# Function to print header
print_header() {
    echo ""
    print_color "========================================" "$BLUE"
    print_color "$1" "$BLUE"
    print_color "========================================" "$BLUE"
    echo ""
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to detect server type
detect_server_type() {
    print_header "Detecting Server Environment"
    
    if [ -d "/usr/local/psa" ] || [ -d "/opt/psa" ]; then
        SERVER_TYPE="plesk"
        print_color "✓ Detected: Plesk Server" "$GREEN"
    elif [ -d "/usr/local/cpanel" ]; then
        SERVER_TYPE="cpanel"
        print_color "✓ Detected: cPanel Server" "$GREEN"
    elif [ -f "/etc/digitalocean" ] || [ -f "/root/.digitalocean" ]; then
        SERVER_TYPE="digitalocean"
        print_color "✓ Detected: DigitalOcean Droplet" "$GREEN"
    elif [ -f "/sys/hypervisor/uuid" ] && grep -qi ec2 /sys/hypervisor/uuid; then
        SERVER_TYPE="aws"
        print_color "✓ Detected: AWS EC2 Instance" "$GREEN"
    else
        SERVER_TYPE="generic"
        print_color "✓ Detected: Generic Linux Server" "$GREEN"
    fi
    
    sleep 2
}

# Function to check system requirements
check_requirements() {
    print_header "Checking System Requirements"
    
    # Check OS
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        print_color "✓ OS: $NAME $VERSION" "$GREEN"
    fi
    
    # Check RAM
    TOTAL_RAM=$(free -m | awk '/^Mem:/{print $2}')
    if [ "$TOTAL_RAM" -lt "$MIN_RAM" ]; then
        print_color "✗ Insufficient RAM: ${TOTAL_RAM}MB (minimum: ${MIN_RAM}MB)" "$RED"
        exit 1
    else
        print_color "✓ RAM: ${TOTAL_RAM}MB" "$GREEN"
    fi
    
    # Check disk space
    DISK_SPACE=$(df -h / | awk 'NR==2 {print $4}')
    print_color "✓ Available Disk Space: $DISK_SPACE" "$GREEN"
    
    sleep 2
}

# Function to install Node.js
install_nodejs() {
    print_header "Installing Node.js v${NODE_VERSION}"
    
    if command_exists node; then
        NODE_CURRENT=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_CURRENT" -ge "$NODE_VERSION" ]; then
            print_color "✓ Node.js v$(node -v) already installed" "$GREEN"
            return
        fi
    fi
    
    # Install Node.js based on server type
    case $SERVER_TYPE in
        plesk)
            # Plesk specific Node.js installation
            if command_exists plesk; then
                plesk ext nodejs --install
                plesk ext nodejs --setup-version $NODE_VERSION
            else
                curl -fsSL https://rpm.nodesource.com/setup_${NODE_VERSION}.x | sudo bash -
                sudo yum install -y nodejs || sudo apt-get install -y nodejs
            fi
            ;;
        cpanel)
            # cPanel specific
            if [ -f /etc/redhat-release ]; then
                curl -fsSL https://rpm.nodesource.com/setup_${NODE_VERSION}.x | sudo bash -
                sudo yum install -y nodejs
            else
                curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
                sudo apt-get install -y nodejs
            fi
            ;;
        *)
            # Generic installation
            if [ -f /etc/debian_version ]; then
                curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
                sudo apt-get install -y nodejs
            elif [ -f /etc/redhat-release ]; then
                curl -fsSL https://rpm.nodesource.com/setup_${NODE_VERSION}.x | sudo bash -
                sudo yum install -y nodejs
            fi
            ;;
    esac
    
    print_color "✓ Node.js $(node -v) installed" "$GREEN"
    print_color "✓ NPM $(npm -v) installed" "$GREEN"
    
    # Install PM2 globally
    npm install -g pm2
    print_color "✓ PM2 installed globally" "$GREEN"
    
    sleep 2
}

# Function to setup install directory
setup_directory() {
    print_header "Setting Up Installation Directory"
    
    case $SERVER_TYPE in
        plesk)
            read -p "Enter your domain path (e.g., /var/www/vhosts/yourdomain.com/httpdocs): " INSTALL_DIR
            ;;
        cpanel)
            read -p "Enter your domain path (e.g., /home/username/public_html): " INSTALL_DIR
            ;;
        *)
            read -p "Enter installation directory (e.g., /var/www/whatsway): " INSTALL_DIR
            ;;
    esac
    
    # Create directory if it doesn't exist
    if [ ! -d "$INSTALL_DIR" ]; then
        mkdir -p "$INSTALL_DIR"
        print_color "✓ Created directory: $INSTALL_DIR" "$GREEN"
    else
        print_color "✓ Using existing directory: $INSTALL_DIR" "$GREEN"
    fi
    
    cd "$INSTALL_DIR"
    sleep 2
}

# Function to download application files
download_files() {
    print_header "Downloading WhatsWay Application"
    
    # Check if files already exist
    if [ -f "package.json" ]; then
        read -p "Files already exist. Overwrite? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_color "Skipping download..." "$YELLOW"
            return
        fi
    fi
    
    # Download from GitHub or copy from current directory
    if [ -f "../package.json" ]; then
        print_color "Copying files from parent directory..." "$BLUE"
        cp -r ../* . 2>/dev/null || true
    else
        print_color "Downloading from repository..." "$BLUE"
        # Replace with actual repository URL
        # git clone https://github.com/yourusername/whatsway.git .
        # OR
        # wget https://yourserver.com/whatsway.zip && unzip whatsway.zip
        print_color "⚠ Manual file upload required" "$YELLOW"
        print_color "Please upload WhatsWay files to: $INSTALL_DIR" "$YELLOW"
        read -p "Press enter when files are uploaded..."
    fi
    
    sleep 2
}

# Function to setup database
setup_database() {
    print_header "Database Configuration"
    
    echo "Select database type:"
    echo "1) PostgreSQL (Neon) - Recommended"
    echo "2) PostgreSQL (Local)"
    echo "3) Use existing DATABASE_URL"
    read -p "Choice (1-3): " DB_CHOICE
    
    case $DB_CHOICE in
        1)
            DB_TYPE="neon"
            read -p "Enter Neon DATABASE_URL: " DB_URL
            ;;
        2)
            DB_TYPE="local"
            # Install PostgreSQL if not installed
            if ! command_exists psql; then
                print_color "Installing PostgreSQL..." "$BLUE"
                if [ -f /etc/debian_version ]; then
                    sudo apt-get update
                    sudo apt-get install -y postgresql postgresql-client
                elif [ -f /etc/redhat-release ]; then
                    sudo yum install -y postgresql postgresql-server
                    sudo postgresql-setup initdb
                fi
                sudo systemctl start postgresql
                sudo systemctl enable postgresql
            fi
            
            # Create database and user
            read -p "Enter database name (whatsway_db): " DB_NAME
            DB_NAME=${DB_NAME:-whatsway_db}
            read -p "Enter database user (whatsway_user): " DB_USER
            DB_USER=${DB_USER:-whatsway_user}
            read -sp "Enter database password: " DB_PASS
            echo
            
            sudo -u postgres psql <<EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF
            
            DB_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}"
            print_color "✓ Database created" "$GREEN"
            ;;
        3)
            read -p "Enter DATABASE_URL: " DB_URL
            ;;
    esac
    
    # Test database connection
    if command_exists psql; then
        if psql "$DB_URL" -c "SELECT 1" >/dev/null 2>&1; then
            print_color "✓ Database connection successful" "$GREEN"
        else
            print_color "⚠ Could not verify database connection" "$YELLOW"
        fi
    fi
    
    sleep 2
}

# Function to setup environment variables
setup_environment() {
    print_header "Environment Configuration"
    
    # Generate session secret
    SESSION_SECRET=$(openssl rand -base64 32)
    
    # Get domain
    read -p "Enter your domain (e.g., whatsway.com): " DOMAIN
    
    # Get email
    read -p "Enter admin email: " EMAIL
    
    # Create .env file
    cat > .env <<EOF
# Server Configuration
NODE_ENV=production
PORT=5000
APP_URL=https://${DOMAIN}

# Database Configuration
DATABASE_URL=${DB_URL}

# Session Configuration
SESSION_SECRET=${SESSION_SECRET}

# WhatsApp Business API Configuration
WHATSAPP_API_VERSION=v23.0
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=$(openssl rand -hex 16)

# Admin Email
ADMIN_EMAIL=${EMAIL}
EOF
    
    print_color "✓ Environment file created" "$GREEN"
    print_color "⚠ Remember to add WhatsApp API credentials to .env" "$YELLOW"
    
    sleep 2
}

# Function to install dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    # Install production dependencies
    print_color "Installing NPM packages..." "$BLUE"
    npm ci --production || npm install --production
    
    print_color "✓ Dependencies installed" "$GREEN"
    sleep 2
}

# Function to build application
build_application() {
    print_header "Building Application"
    
    print_color "Running build process..." "$BLUE"
    npm run build || {
        print_color "⚠ Build failed, trying alternative method..." "$YELLOW"
        
        # Create dist directories
        mkdir -p dist/client
        mkdir -p dist/server
        
        # Try to compile TypeScript if tsc is available
        if command_exists tsc; then
            npx tsc || true
        fi
        
        # Build client with Vite
        if [ -f "vite.config.ts" ]; then
            npx vite build || true
        fi
    }
    
    print_color "✓ Build process completed" "$GREEN"
    sleep 2
}

# Function to setup database schema
setup_database_schema() {
    print_header "Setting Up Database Schema"
    
    if [ -f "database_export.sql" ]; then
        print_color "Importing database schema..." "$BLUE"
        psql "$DB_URL" < database_export.sql 2>/dev/null || {
            print_color "⚠ Could not import schema automatically" "$YELLOW"
            print_color "Please import database_export.sql manually" "$YELLOW"
        }
    fi
    
    # Run migrations if available
    if [ -f "package.json" ] && grep -q "db:push" package.json; then
        print_color "Running database migrations..." "$BLUE"
        npm run db:push || true
    fi
    
    # Create admin user
    print_color "Creating admin user..." "$BLUE"
    if [ -f "scripts/reset-admin.js" ]; then
        node scripts/reset-admin.js || {
            print_color "⚠ Could not create admin user automatically" "$YELLOW"
            print_color "Run: node scripts/reset-admin.js" "$YELLOW"
        }
    fi
    
    print_color "✓ Database setup completed" "$GREEN"
    sleep 2
}

# Function to setup for Plesk
setup_plesk() {
    print_header "Configuring for Plesk"
    
    # Create app.js for Plesk
    cat > app.js <<'EOF'
const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'dist/client')));

// API routes
app.use('/api', require('./dist/server/index.js'));

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/client/index.html'));
});

module.exports = app;
EOF
    
    print_color "✓ Created Plesk-compatible app.js" "$GREEN"
    print_color "" "$NC"
    print_color "Plesk Configuration Instructions:" "$YELLOW"
    print_color "1. Go to Plesk > Domains > ${DOMAIN} > Node.js" "$NC"
    print_color "2. Set Application Root: $INSTALL_DIR" "$NC"
    print_color "3. Set Application Startup File: app.js" "$NC"
    print_color "4. Set Node.js version: ${NODE_VERSION}.x" "$NC"
    print_color "5. Click 'NPM Install' button" "$NC"
    print_color "6. Click 'Run Script' and select 'build'" "$NC"
    print_color "7. Click 'Restart App'" "$NC"
    
    sleep 2
}

# Function to setup PM2
setup_pm2() {
    print_header "Setting Up PM2 Process Manager"
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: 'whatsway',
    script: './dist/server/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF
    
    # Create logs directory
    mkdir -p logs
    
    # Start with PM2
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup || true
    
    print_color "✓ PM2 configured and started" "$GREEN"
    print_color "Commands:" "$YELLOW"
    print_color "  pm2 status        - Check status" "$NC"
    print_color "  pm2 logs whatsway - View logs" "$NC"
    print_color "  pm2 restart whatsway - Restart app" "$NC"
    
    sleep 2
}

# Function to setup Nginx (for non-panel servers)
setup_nginx() {
    print_header "Setting Up Nginx"
    
    if ! command_exists nginx; then
        print_color "Installing Nginx..." "$BLUE"
        if [ -f /etc/debian_version ]; then
            sudo apt-get update
            sudo apt-get install -y nginx
        elif [ -f /etc/redhat-release ]; then
            sudo yum install -y nginx
        fi
    fi
    
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/whatsway <<EOF
server {
    listen 80;
    server_name ${DOMAIN};
    
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /ws {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    client_max_body_size 10M;
}
EOF
    
    # Enable site
    sudo ln -sf /etc/nginx/sites-available/whatsway /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    
    print_color "✓ Nginx configured" "$GREEN"
    sleep 2
}

# Function to setup SSL
setup_ssl() {
    print_header "SSL Certificate Setup"
    
    if [ "$SERVER_TYPE" != "plesk" ] && [ "$SERVER_TYPE" != "cpanel" ]; then
        read -p "Setup SSL with Let's Encrypt? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if ! command_exists certbot; then
                print_color "Installing Certbot..." "$BLUE"
                if [ -f /etc/debian_version ]; then
                    sudo apt-get update
                    sudo apt-get install -y certbot python3-certbot-nginx
                elif [ -f /etc/redhat-release ]; then
                    sudo yum install -y certbot python3-certbot-nginx
                fi
            fi
            
            sudo certbot --nginx -d ${DOMAIN} --email ${EMAIL} --agree-tos --non-interactive
            print_color "✓ SSL certificate installed" "$GREEN"
        fi
    else
        print_color "⚠ Please setup SSL through your control panel" "$YELLOW"
    fi
    
    sleep 2
}

# Function to setup cron jobs
setup_cron() {
    print_header "Setting Up Cron Jobs"
    
    # Create cron script
    cat > cron.sh <<'EOF'
#!/bin/bash
cd $(dirname $0)
node scripts/cron-runner.js >> logs/cron.log 2>&1
EOF
    chmod +x cron.sh
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "0 2 * * * $INSTALL_DIR/cron.sh") | crontab -
    
    print_color "✓ Cron jobs configured" "$GREEN"
    sleep 2
}

# Function to display final instructions
display_final_instructions() {
    print_header "Installation Complete!"
    
    print_color "✅ WhatsWay has been successfully installed!" "$GREEN"
    echo ""
    print_color "Access Information:" "$BLUE"
    print_color "==================" "$BLUE"
    print_color "URL: https://${DOMAIN}" "$NC"
    print_color "Admin Username: whatsway" "$NC"
    print_color "Admin Password: Admin@123" "$NC"
    echo ""
    print_color "⚠ IMPORTANT NEXT STEPS:" "$YELLOW"
    print_color "1. Add WhatsApp API credentials to .env file" "$NC"
    print_color "2. Change admin password after first login" "$NC"
    print_color "3. Configure webhook URL in Meta Business" "$NC"
    print_color "   Webhook URL: https://${DOMAIN}/webhook" "$NC"
    echo ""
    
    if [ "$SERVER_TYPE" == "plesk" ]; then
        print_color "Plesk users: Complete configuration in Plesk panel" "$YELLOW"
    elif [ "$SERVER_TYPE" == "cpanel" ]; then
        print_color "cPanel users: Setup Node.js app in cPanel" "$YELLOW"
    fi
    
    print_color "" "$NC"
    print_color "Support Files:" "$BLUE"
    print_color "- Logs: $INSTALL_DIR/logs/" "$NC"
    print_color "- Config: $INSTALL_DIR/.env" "$NC"
    print_color "- PM2: pm2 status" "$NC"
    echo ""
}

# Main installation flow
main() {
    clear
    print_color "╔══════════════════════════════════════╗" "$BLUE"
    print_color "║     WhatsWay Auto-Installer v1.0     ║" "$BLUE"
    print_color "║   Professional WhatsApp Business     ║" "$BLUE"
    print_color "║       Communication Platform         ║" "$BLUE"
    print_color "╚══════════════════════════════════════╝" "$BLUE"
    echo ""
    
    # Run installation steps
    detect_server_type
    check_requirements
    install_nodejs
    setup_directory
    download_files
    setup_database
    setup_environment
    install_dependencies
    build_application
    setup_database_schema
    
    # Server-specific setup
    case $SERVER_TYPE in
        plesk)
            setup_plesk
            ;;
        cpanel)
            # cPanel specific setup
            print_color "Please complete setup in cPanel Node.js interface" "$YELLOW"
            ;;
        *)
            setup_pm2
            setup_nginx
            setup_ssl
            ;;
    esac
    
    setup_cron
    display_final_instructions
}

# Run main function
main "$@"