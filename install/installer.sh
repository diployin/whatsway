#!/bin/bash

#############################################
# WhatsWay Universal Installer Script
# Supports: Plesk, cPanel, AWS, DigitalOcean
# Version: 1.0
#############################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR=$(dirname "$(dirname "$(readlink -f "$0")")")
LOG_FILE="$APP_DIR/install/install.log"
NODE_VERSION="20"
PM2_NAME="whatsway"

# Functions
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        warning "Not running as root. Some features may require sudo privileges."
        SUDO="sudo"
    else
        SUDO=""
    fi
}

detect_os() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$ID
        OS_VERSION=$VERSION_ID
    else
        error "Cannot detect operating system"
    fi
    log "Detected OS: $OS $OS_VERSION"
}

detect_server_type() {
    if [[ -d /usr/local/psa ]]; then
        SERVER_TYPE="plesk"
        log "Detected Plesk server"
    elif [[ -d /usr/local/cpanel ]]; then
        SERVER_TYPE="cpanel"
        log "Detected cPanel server"
    elif [[ -f /.dockerenv ]]; then
        SERVER_TYPE="docker"
        log "Running in Docker container"
    else
        SERVER_TYPE="standard"
        log "Standard Linux server detected"
    fi
}

install_nodejs() {
    header "Installing Node.js v${NODE_VERSION}"
    
    if command -v node &> /dev/null; then
        CURRENT_NODE=$(node -v | sed 's/v//')
        log "Node.js is already installed (v$CURRENT_NODE)"
        
        if [[ "${CURRENT_NODE%%.*}" -ge 18 ]]; then
            log "Node.js version is sufficient"
            return
        fi
    fi
    
    case $OS in
        ubuntu|debian)
            curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | $SUDO -E bash -
            $SUDO apt-get install -y nodejs
            ;;
        centos|rhel|fedora)
            curl -fsSL https://rpm.nodesource.com/setup_${NODE_VERSION}.x | $SUDO bash -
            $SUDO yum install -y nodejs
            ;;
        *)
            error "Unsupported OS for automatic Node.js installation"
            ;;
    esac
    
    log "Node.js $(node -v) installed successfully"
}

install_postgresql() {
    header "Checking PostgreSQL Installation"
    
    if command -v psql &> /dev/null; then
        log "PostgreSQL is already installed"
        return
    fi
    
    log "Installing PostgreSQL..."
    
    case $OS in
        ubuntu|debian)
            $SUDO apt-get update
            $SUDO apt-get install -y postgresql postgresql-contrib
            ;;
        centos|rhel|fedora)
            $SUDO yum install -y postgresql postgresql-server postgresql-contrib
            $SUDO postgresql-setup initdb
            ;;
        *)
            warning "Please install PostgreSQL manually for your OS"
            ;;
    esac
    
    # Start PostgreSQL
    $SUDO systemctl start postgresql
    $SUDO systemctl enable postgresql
    
    log "PostgreSQL installed and started"
}

setup_database() {
    header "Setting up Database"
    
    echo "Choose database type:"
    echo "1) Standard PostgreSQL (local or cloud)"
    echo "2) Neon cloud database"
    read -p "Enter choice (1-2): " DB_TYPE
    
    if [[ $DB_TYPE == "2" ]]; then
        # Neon database setup
        echo ""
        echo "To use Neon database:"
        echo "1. Sign up at https://neon.tech"
        echo "2. Create a new project"
        echo "3. Copy the connection string"
        echo ""
        read -p "Enter Neon connection string: " DB_CONNECTION
        USE_NEON="true"
    else
        # Standard PostgreSQL setup
        read -p "Enter PostgreSQL host [localhost]: " DB_HOST
        DB_HOST=${DB_HOST:-localhost}
        
        read -p "Enter PostgreSQL port [5432]: " DB_PORT
        DB_PORT=${DB_PORT:-5432}
        
        read -p "Enter database name [whatsway_db]: " DB_NAME
        DB_NAME=${DB_NAME:-whatsway_db}
        
        read -p "Enter database user [whatsway]: " DB_USER
        DB_USER=${DB_USER:-whatsway}
        
        read -sp "Enter database password: " DB_PASS
        echo
        
        DB_CONNECTION="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
        
        # Set SSL mode based on host
        if [[ "$DB_HOST" == "localhost" || "$DB_HOST" == "127.0.0.1" ]]; then
            DB_SSL_MODE="disable"
        else
            DB_SSL_MODE="require"
        fi
        
        # Create database and user if local
        if [[ "$DB_HOST" == "localhost" || "$DB_HOST" == "127.0.0.1" ]]; then
            $SUDO -u postgres psql <<EOF
CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';
CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
EOF
        fi
    fi
    
    # Create .env file
    cat > "$APP_DIR/.env" <<EOF
# Database Configuration
DATABASE_URL="${DB_CONNECTION}"
${DB_HOST:+PGHOST="${DB_HOST}"}
${DB_PORT:+PGPORT="${DB_PORT}"}
${DB_NAME:+PGDATABASE="${DB_NAME}"}
${DB_USER:+PGUSER="${DB_USER}"}
${DB_PASS:+PGPASSWORD="${DB_PASS}"}

# Database Driver Settings
${USE_NEON:+USE_NEON="${USE_NEON}"}
${DB_SSL_MODE:+DB_SSL_MODE="${DB_SSL_MODE}"}

# Application Configuration
NODE_ENV="production"
PORT="5000"
SESSION_SECRET="$(openssl rand -hex 32)"
ENCRYPTION_KEY="$(openssl rand -hex 32)"

# WhatsApp API Configuration
WHATSAPP_API_VERSION="v21.0"
WHATSAPP_WEBHOOK_VERIFY_TOKEN="$(openssl rand -hex 24)"

# Server Configuration
REPLIT_DOMAINS="$(hostname -f)"
BASE_URL="https://$(hostname -f)"
EOF
    
    log "Database configuration saved to .env"
}

install_dependencies() {
    header "Installing Application Dependencies"
    
    cd "$APP_DIR"
    
    log "Installing npm packages..."
    npm install --production
    
    log "Building application..."
    npm run build
    
    log "Setting up database schema..."
    npm run db:push
    
    log "Seeding database..."
    npm run seed
    
    log "Dependencies installed successfully"
}

setup_pm2() {
    header "Setting up PM2 Process Manager"
    
    # Install PM2 globally
    npm install -g pm2
    
    # Create ecosystem file
    cat > "$APP_DIR/ecosystem.config.js" <<'EOF'
module.exports = {
  apps: [{
    name: 'whatsway',
    script: './server/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF
    
    # Start application with PM2
    pm2 start ecosystem.config.js
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup script
    pm2 startup systemd -u $USER --hp $HOME
    
    log "PM2 configured and application started"
}

setup_nginx() {
    header "Setting up Nginx Web Server"
    
    # Install Nginx if not present
    if ! command -v nginx &> /dev/null; then
        log "Installing Nginx..."
        case $OS in
            ubuntu|debian)
                $SUDO apt-get install -y nginx
                ;;
            centos|rhel|fedora)
                $SUDO yum install -y nginx
                ;;
        esac
    fi
    
    read -p "Enter your domain name: " DOMAIN
    
    # Create Nginx configuration
    $SUDO tee /etc/nginx/sites-available/whatsway > /dev/null <<EOF
server {
    listen 80;
    server_name ${DOMAIN};
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    client_max_body_size 10M;
}
EOF
    
    # Enable the site
    $SUDO ln -sf /etc/nginx/sites-available/whatsway /etc/nginx/sites-enabled/
    
    # Test and reload Nginx
    $SUDO nginx -t
    $SUDO systemctl reload nginx
    
    log "Nginx configured for domain: $DOMAIN"
}

setup_ssl() {
    header "Setting up SSL Certificate"
    
    read -p "Do you want to setup Let's Encrypt SSL? (y/n): " SETUP_SSL
    
    if [[ $SETUP_SSL == "y" || $SETUP_SSL == "Y" ]]; then
        # Install Certbot
        if ! command -v certbot &> /dev/null; then
            log "Installing Certbot..."
            case $OS in
                ubuntu|debian)
                    $SUDO apt-get install -y certbot python3-certbot-nginx
                    ;;
                centos|rhel|fedora)
                    $SUDO yum install -y certbot python3-certbot-nginx
                    ;;
            esac
        fi
        
        read -p "Enter your email for SSL certificate: " EMAIL
        
        # Obtain SSL certificate
        $SUDO certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL
        
        # Setup auto-renewal
        (crontab -l 2>/dev/null; echo "0 0 * * * /usr/bin/certbot renew --quiet") | crontab -
        
        log "SSL certificate installed and auto-renewal configured"
    else
        warning "Skipping SSL setup. You can set it up later manually."
    fi
}

setup_firewall() {
    header "Configuring Firewall"
    
    case $OS in
        ubuntu|debian)
            if command -v ufw &> /dev/null; then
                $SUDO ufw allow 22/tcp
                $SUDO ufw allow 80/tcp
                $SUDO ufw allow 443/tcp
                $SUDO ufw allow 5000/tcp
                $SUDO ufw --force enable
                log "UFW firewall configured"
            fi
            ;;
        centos|rhel|fedora)
            if command -v firewall-cmd &> /dev/null; then
                $SUDO firewall-cmd --permanent --add-service=http
                $SUDO firewall-cmd --permanent --add-service=https
                $SUDO firewall-cmd --permanent --add-port=5000/tcp
                $SUDO firewall-cmd --reload
                log "Firewalld configured"
            fi
            ;;
    esac
}

plesk_specific_setup() {
    header "Plesk-Specific Configuration"
    
    # Create app.js for Plesk Node.js support
    cat > "$APP_DIR/app.js" <<'EOF'
// Plesk Node.js entry point
require('./server/index.js');
EOF
    
    log "Created app.js for Plesk compatibility"
    
    # Update .env with Plesk-specific paths
    echo "PLESK_MODE=true" >> "$APP_DIR/.env"
    
    warning "Please configure Node.js application in Plesk panel:"
    echo "1. Go to Plesk > Domains > Your Domain > Node.js"
    echo "2. Set Application Root: $APP_DIR"
    echo "3. Set Application Startup File: app.js"
    echo "4. Set Node.js version: ${NODE_VERSION}.x"
    echo "5. Click 'Enable Node.js'"
}

cpanel_specific_setup() {
    header "cPanel-Specific Configuration"
    
    # Create .htaccess for cPanel
    cat > "$APP_DIR/public_html/.htaccess" <<'EOF'
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:5000/$1 [P,L]
EOF
    
    log "Created .htaccess for cPanel"
    
    warning "Please configure Node.js application in cPanel:"
    echo "1. Go to cPanel > Setup Node.js App"
    echo "2. Create Application with Node.js ${NODE_VERSION}"
    echo "3. Set Application Root: $APP_DIR"
    echo "4. Set Application URL: your-domain.com"
    echo "5. Set Application Startup File: server/index.js"
}

cleanup() {
    header "Cleaning Up"
    
    # Set proper permissions
    chmod -R 755 "$APP_DIR"
    chmod 600 "$APP_DIR/.env"
    
    # Create logs directory
    mkdir -p "$APP_DIR/logs"
    
    log "Cleanup completed"
}

print_summary() {
    header "Installation Complete!"
    
    echo -e "${GREEN}WhatsWay has been successfully installed!${NC}\n"
    echo "========================================="
    echo "Admin Login Credentials:"
    echo "========================================="
    echo "URL: https://${DOMAIN:-localhost:5000}"
    echo "Username: whatsway"
    echo "Password: Admin@123"
    echo "========================================="
    echo ""
    echo "Next Steps:"
    echo "1. Login with the admin credentials"
    echo "2. Change the default password"
    echo "3. Configure WhatsApp Business API"
    echo "4. Set up webhook URL in Meta Business"
    echo "5. Start using WhatsWay!"
    echo ""
    echo "Logs: $LOG_FILE"
    echo ""
    warning "For security, delete the /install directory after setup"
}

# Main Installation Flow
main() {
    clear
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║     WhatsWay Installation Script       ║${NC}"
    echo -e "${BLUE}║    Professional WhatsApp Platform      ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""
    
    # Initialize
    check_root
    detect_os
    detect_server_type
    
    # Core Installation
    install_nodejs
    install_postgresql
    setup_database
    install_dependencies
    
    # Server Configuration
    case $SERVER_TYPE in
        plesk)
            plesk_specific_setup
            ;;
        cpanel)
            cpanel_specific_setup
            ;;
        *)
            setup_pm2
            setup_nginx
            setup_ssl
            ;;
    esac
    
    # Final Steps
    setup_firewall
    cleanup
    print_summary
}

# Run main function
main "$@"