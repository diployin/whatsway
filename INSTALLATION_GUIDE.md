# WhatsWay Installation Guide
*Complete setup instructions for all server types*

## Table of Contents
1. [Quick Start](#quick-start)
2. [Requirements](#requirements)
3. [Installation Methods](#installation-methods)
   - [Method 1: Web Installer (Easiest)](#method-1-web-installer-easiest)
   - [Method 2: Shell Script](#method-2-shell-script)
   - [Method 3: Docker Installation](#method-3-docker-installation)
   - [Method 4: Manual Installation](#method-4-manual-installation)
4. [Platform-Specific Guides](#platform-specific-guides)
   - [Plesk](#plesk-installation)
   - [cPanel](#cpanel-installation)
   - [AWS EC2](#aws-ec2-installation)
   - [DigitalOcean](#digitalocean-installation)
5. [Post-Installation](#post-installation)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start

The fastest way to install WhatsWay:

```bash
# Download and extract WhatsWay
unzip whatsway.zip
cd whatsway

# Run the installer
bash install/installer.sh
```

**Or use the web installer:**
1. Upload the files to your server
2. Navigate to: `https://yourdomain.com/install/installer.php`
3. Follow the on-screen instructions

---

## Requirements

### Minimum System Requirements
- **OS**: Ubuntu 18.04+, Debian 10+, CentOS 7+, or any Linux distribution
- **RAM**: 2GB minimum (4GB recommended)
- **Storage**: 10GB free space
- **CPU**: 2 cores minimum

### Software Requirements
- **Node.js**: Version 18.0 or higher
- **PostgreSQL**: Version 12 or higher
- **Nginx**: Latest stable version (optional)
- **PM2**: Process manager (installed automatically)

### Network Requirements
- **Ports**: 80 (HTTP), 443 (HTTPS), 5000 (Application)
- **SSL Certificate**: Required for WhatsApp webhooks
- **Domain**: Valid domain name with DNS configured

---

## Installation Methods

### Method 1: Web Installer (Easiest)

**Perfect for: Non-technical users, shared hosting, Plesk/cPanel**

1. **Upload Files**
   - Upload the WhatsWay zip file to your server
   - Extract to your web directory
   
2. **Access Installer**
   - Open browser: `https://yourdomain.com/install/installer.php`
   
3. **Follow Steps**
   - Step 1: System requirements check
   - Step 2: Database configuration
   - Step 3: Application settings
   - Step 4: Automatic installation
   - Step 5: Complete!

4. **Delete Installer**
   ```bash
   rm -rf install/
   ```

---

### Method 2: Shell Script

**Perfect for: VPS, Dedicated servers, Technical users**

1. **Upload and Extract**
   ```bash
   # Upload via SCP or FTP
   scp whatsway.zip user@server:/var/www/
   
   # SSH into server
   ssh user@server
   
   # Extract
   cd /var/www
   unzip whatsway.zip
   cd whatsway
   ```

2. **Run Installer**
   ```bash
   # Make executable
   chmod +x install/installer.sh
   
   # Run installer
   sudo bash install/installer.sh
   ```

3. **Follow Prompts**
   - Database configuration
   - Domain setup
   - SSL certificate
   - Admin settings

---

### Method 3: Docker Installation

**Perfect for: Modern deployments, Easy scaling, Isolation**

#### Option A: Using Docker Compose (Recommended)

1. **Prerequisites**
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com | sh
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Setup Environment**
   ```bash
   # Clone or upload WhatsWay
   cd whatsway
   
   # Copy environment template
   cp .env.example .env
   
   # Edit environment variables
   nano .env
   ```

3. **Configure .env**
   ```env
   # Database
   DB_PASSWORD=YourSecurePassword123!
   
   # Application
   SESSION_SECRET=your-32-character-secret-key
   ENCRYPTION_KEY=your-encryption-key
   
   # Domain
   DOMAIN=yourdomain.com
   
   # WhatsApp
   WEBHOOK_TOKEN=your-webhook-token
   ```

4. **Start Services**
   ```bash
   # Build and start
   docker-compose up -d
   
   # Check status
   docker-compose ps
   
   # View logs
   docker-compose logs -f
   ```

5. **Initialize Database**
   ```bash
   # Run migrations
   docker-compose exec whatsway npm run db:push
   
   # Seed database
   docker-compose exec whatsway npm run seed
   ```

#### Option B: Using Dockerfile Only

1. **Build Image**
   ```bash
   docker build -t whatsway:latest .
   ```

2. **Run Container**
   ```bash
   docker run -d \
     --name whatsway \
     -p 5000:5000 \
     -e DATABASE_URL="postgresql://user:pass@host/db" \
     -e SESSION_SECRET="your-secret" \
     whatsway:latest
   ```

#### Docker with Traefik (Advanced)

```yaml
# Add to docker-compose.yml
services:
  whatsway:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.whatsway.rule=Host(`yourdomain.com`)"
      - "traefik.http.routers.whatsway.tls=true"
      - "traefik.http.routers.whatsway.tls.certresolver=letsencrypt"
```

---

### Method 4: Manual Installation

**Perfect for: Custom setups, Full control**

1. **Install Node.js**
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # CentOS/RHEL
   curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
   sudo yum install -y nodejs
   ```

2. **Install PostgreSQL**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   
   # CentOS/RHEL
   sudo yum install postgresql postgresql-server postgresql-contrib
   sudo postgresql-setup initdb
   ```

3. **Setup Database**
   ```bash
   sudo -u postgres psql
   
   CREATE USER whatsway WITH PASSWORD 'YourPassword';
   CREATE DATABASE whatsway_db OWNER whatsway;
   GRANT ALL PRIVILEGES ON DATABASE whatsway_db TO whatsway;
   \q
   ```

4. **Configure Application**
   ```bash
   cd /var/www/whatsway
   
   # Create .env file
   cat > .env << EOF
   DATABASE_URL="postgresql://whatsway:YourPassword@localhost:5432/whatsway_db"
   NODE_ENV="production"
   PORT="5000"
   SESSION_SECRET="$(openssl rand -hex 32)"
   ENCRYPTION_KEY="$(openssl rand -hex 32)"
   WHATSAPP_API_VERSION="v21.0"
   WHATSAPP_WEBHOOK_VERIFY_TOKEN="$(openssl rand -hex 24)"
   EOF
   ```

5. **Install Dependencies**
   ```bash
   npm install --production
   npm run build
   npm run db:push
   npm run seed
   ```

6. **Setup PM2**
   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

7. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/whatsway
   ```
   
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   sudo ln -s /etc/nginx/sites-available/whatsway /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

8. **Setup SSL**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

---

## Platform-Specific Guides

### Plesk Installation

1. **Upload Files**
   - Login to Plesk
   - Go to File Manager
   - Upload and extract WhatsWay

2. **Create Database**
   - Go to Databases
   - Create new PostgreSQL database
   - Note credentials

3. **Setup Node.js**
   - Go to Node.js
   - Create new application
   - Application Root: `/httpdocs/whatsway`
   - Application Startup File: `app.js`
   - Node.js version: 20.x

4. **Configure Environment**
   - Click "NPM Install"
   - Add environment variables
   - Click "Restart App"

5. **Run Migrations**
   - SSH into server
   - Navigate to app directory
   - Run: `npm run db:push && npm run seed`

### cPanel Installation

1. **Upload Files**
   - Use File Manager or FTP
   - Upload to public_html
   - Extract WhatsWay

2. **Create Database**
   - MySQL Database Wizard
   - Create PostgreSQL database
   - Create user and grant privileges

3. **Setup Node.js**
   - Go to "Setup Node.js App"
   - Create Application
   - Node.js version: 20
   - Application mode: Production
   - Application root: public_html/whatsway
   - Application URL: yourdomain.com
   - Application startup file: server/index.js

4. **Install Dependencies**
   - Click "Run NPM Install"
   - Enter app and run: `npm run build`

5. **Configure .htaccess**
   ```apache
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule ^(.*)$ http://localhost:5000/$1 [P,L]
   ```

### AWS EC2 Installation

1. **Launch Instance**
   - Choose Ubuntu 22.04 LTS
   - Instance type: t3.medium (minimum)
   - Storage: 20GB
   - Security Group: Open ports 22, 80, 443, 5000

2. **Connect and Prepare**
   ```bash
   ssh -i your-key.pem ubuntu@ec2-instance
   sudo apt-get update
   sudo apt-get upgrade -y
   ```

3. **Run Installer**
   ```bash
   # Upload WhatsWay
   scp -i your-key.pem whatsway.zip ubuntu@ec2-instance:~/
   
   # Extract and install
   unzip whatsway.zip
   cd whatsway
   sudo bash install/installer.sh
   ```

4. **Configure Security Group**
   - Add inbound rules for HTTP/HTTPS
   - Configure Elastic IP
   - Setup Route 53 for domain

### DigitalOcean Installation

1. **Create Droplet**
   - Choose Ubuntu 22.04
   - Size: 2GB RAM minimum
   - Region: Choose nearest
   - Add SSH keys

2. **Initial Setup**
   ```bash
   ssh root@droplet-ip
   
   # Create user
   adduser whatsway
   usermod -aG sudo whatsway
   su - whatsway
   ```

3. **Install WhatsWay**
   ```bash
   # Upload and extract
   cd /var/www
   sudo unzip whatsway.zip
   sudo chown -R whatsway:whatsway whatsway
   cd whatsway
   
   # Run installer
   sudo bash install/installer.sh
   ```

4. **Configure Firewall**
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 5000/tcp
   sudo ufw enable
   ```

---

## Post-Installation

### 1. First Login
- URL: `https://yourdomain.com`
- Username: `whatsway`
- Password: `Admin@123`
- **IMPORTANT**: Change password immediately!

### 2. WhatsApp Configuration
1. Go to Settings → Channels
2. Click "Add Channel"
3. Enter:
   - Phone Number ID (from Meta Business)
   - Access Token (from Meta Business)
   - Webhook Verify Token

### 3. Webhook Setup
1. Copy webhook URL: `https://yourdomain.com/api/webhook`
2. Go to Meta Business Developer Console
3. Add webhook URL
4. Enter verify token
5. Subscribe to messages, message_status

### 4. Security Checklist
- [ ] Changed default admin password
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Database password secure
- [ ] Environment variables protected
- [ ] Removed /install directory
- [ ] Regular backups configured

### 5. Performance Optimization
```bash
# Increase PM2 instances
pm2 scale whatsway 2

# Monitor performance
pm2 monit

# Setup log rotation
pm2 install pm2-logrotate
```

---

## Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U whatsway -d whatsway_db

# Check .env file
cat .env | grep DATABASE_URL
```

#### Port 5000 Already in Use
```bash
# Find process using port
sudo lsof -i :5000

# Kill process
sudo kill -9 <PID>

# Or change port in .env
PORT=5001
```

#### SSL Certificate Issues
```bash
# Renew certificate
sudo certbot renew

# Test certificate
openssl s_client -connect yourdomain.com:443
```

#### PM2 Not Starting
```bash
# Check logs
pm2 logs whatsway

# Restart PM2
pm2 restart whatsway

# Reset PM2
pm2 delete all
pm2 start ecosystem.config.js
```

#### Node Modules Issues
```bash
# Clear cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install
```

### Getting Help

1. **Check Logs**
   ```bash
   # Application logs
   pm2 logs whatsway
   
   # Nginx logs
   sudo tail -f /var/log/nginx/error.log
   
   # Installation log
   cat install/install.log
   ```

2. **System Information**
   ```bash
   # Collect system info
   node -v
   npm -v
   psql --version
   nginx -v
   pm2 status
   ```

3. **Support Channels**
   - Documentation: Check TECHNICAL_DOCUMENTATION.md
   - Email Support: Provided with license
   - Community Forum: If available

---

## Backup and Recovery

### Create Backup
```bash
# Database backup
pg_dump -U whatsway whatsway_db > backup.sql

# Files backup
tar -czf whatsway-backup.tar.gz /var/www/whatsway

# Environment backup
cp .env .env.backup
```

### Restore Backup
```bash
# Restore database
psql -U whatsway whatsway_db < backup.sql

# Restore files
tar -xzf whatsway-backup.tar.gz -C /

# Restore environment
cp .env.backup .env
```

---

## Updating WhatsWay

```bash
# Backup first
./scripts/backup.sh

# Download update
wget https://update-url/whatsway-update.zip

# Apply update
unzip -o whatsway-update.zip
npm install
npm run build
npm run db:push

# Restart
pm2 restart whatsway
```

---

## License

WhatsWay is licensed software. Ensure you have a valid license before deploying to production.

---

*Last Updated: January 2025*
*Version: 1.0*