# WhatsWay - Installation & Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Pre-Installation Checklist](#pre-installation-checklist)
3. [Installation Steps](#installation-steps)
4. [Database Setup](#database-setup)
5. [Configuration](#configuration)
6. [First Time Setup](#first-time-setup)
7. [Hosting Options](#hosting-options)
8. [Troubleshooting](#troubleshooting)
9. [Support](#support)

---

## Prerequisites

### Hosting Requirements

#### Minimum Server Requirements
- **Hosting Type**: VPS, Dedicated Server, or Cloud Hosting (Shared hosting with Node.js support)
- **CPU**: 2 vCPUs or equivalent
- **RAM**: 2 GB minimum (4 GB recommended)
- **Storage**: 10 GB available space
- **Operating System**: Linux (Ubuntu/CentOS/Debian) or Windows Server
- **Control Panel**: cPanel, Plesk, or SSH access

#### Software Requirements
Your server must have:
- **Node.js**: Version 20.x or higher
- **npm**: Version 10.x or higher  
- **PostgreSQL**: Version 15.x or higher (or MySQL 8.0+ with modifications)
- **PM2**: Process manager (for production)
- **Nginx/Apache**: Web server for reverse proxy

### Required Accounts & API Access
1. **Meta Business Account**
   - Register at: https://business.facebook.com
   - Complete business verification
   - Apply for WhatsApp Business API access

2. **WhatsApp Business API Credentials**
   You will need:
   - WhatsApp Business Account ID
   - Permanent Access Token
   - Phone Number ID
   - Webhook Verify Token

---

## Pre-Installation Checklist

Before starting installation, ensure you have:

- [ ] **Purchased WhatsWay license** with valid purchase code
- [ ] **Server/hosting** meeting minimum requirements
- [ ] **Domain name** pointed to your server
- [ ] **SSL certificate** (free with Let's Encrypt or paid)
- [ ] **Database access** (create database privilege)
- [ ] **FTP/SFTP or File Manager** access
- [ ] **Meta Business Account** verified
- [ ] **WhatsApp API access** approved
- [ ] **SMTP details** for email notifications (optional)

---

## Installation Steps

### Step 1: Upload Application Files

#### Option A: Using cPanel File Manager
1. **Login to cPanel**
   - Access your cPanel at: `https://yourdomain.com:2083`
   - Enter username and password

2. **Navigate to File Manager**
   - Click "File Manager" in Files section
   - Navigate to `public_html` or your domain folder

3. **Upload Application**
   - Click "Upload" button
   - Upload the `whatsway.zip` file
   - Return to File Manager
   - Right-click on `whatsway.zip` and select "Extract"
   - Delete the zip file after extraction

#### Option B: Using FTP/SFTP
1. **Connect via FTP Client** (FileZilla, WinSCP, etc.)
   ```
   Host: ftp.yourdomain.com
   Username: your_ftp_username
   Password: your_ftp_password
   Port: 21 (FTP) or 22 (SFTP)
   ```

2. **Upload Files**
   - Navigate to `public_html` or `www` folder
   - Upload all WhatsWay files
   - Ensure all files are uploaded (check file count)

#### Option C: Using SSH (Advanced)
```bash
# Connect to server
ssh username@yourdomain.com

# Navigate to web directory
cd ~/public_html

# Upload using wget or git
wget https://download-link/whatsway.zip
unzip whatsway.zip

# OR using git
git clone https://github.com/your-purchase/whatsway.git .
```

### Step 2: Create Database

#### Using cPanel

1. **Access MySQL Databases**
   - In cPanel, click "MySQL Databases"

2. **Create Database**
   - Database name: `whatsway_db`
   - Click "Create Database"

3. **Create Database User**
   - Username: `whatsway_user`
   - Password: Generate strong password (save it!)
   - Click "Create User"

4. **Assign User to Database**
   - Select user and database
   - Check "ALL PRIVILEGES"
   - Click "Add"

5. **Note Database Details**
   ```
   Database Name: youraccount_whatsway_db
   Username: youraccount_whatsway_user
   Password: [your_password]
   Host: localhost (or specific host provided)
   ```

#### Using phpMyAdmin

1. **Access phpMyAdmin**
   - From cPanel or direct URL
   - Login with credentials

2. **Create Database**
   - Click "Databases" tab
   - Enter name: `whatsway_db`
   - Select utf8mb4_unicode_ci collation
   - Click "Create"

3. **Import Database Structure**
   - Select the database
   - Click "Import" tab
   - Choose file: `database/schema.sql`
   - Click "Go"

### Step 3: Install Node.js Dependencies

#### For cPanel with Terminal Access

1. **Access Terminal**
   - In cPanel, click "Terminal"

2. **Navigate to Application**
   ```bash
   cd ~/public_html
   ```

3. **Install Dependencies**
   ```bash
   npm install --production
   ```

4. **Build Application**
   ```bash
   npm run build
   ```

#### For Shared Hosting without Terminal

1. **Run Installation Script**
   - Access: `https://yourdomain.com/install.php`
   - Follow installation wizard
   - Enter database credentials
   - Complete setup

### Step 4: Configure Environment

1. **Edit .env File**
   - Locate `.env.example` in root directory
   - Rename to `.env`
   - Open in text editor (cPanel File Manager Editor)

2. **Configure Database Connection**
   ```env
   # Database Configuration (PostgreSQL)
   DATABASE_URL=postgresql://youraccount_whatsway_user:your_password@localhost:5432/youraccount_whatsway_db
   
   # For MySQL (if using MySQL instead)
   # DATABASE_URL=mysql://youraccount_whatsway_user:your_password@localhost:3306/youraccount_whatsway_db
   ```

3. **Configure WhatsApp API**
   ```env
   # Session Secret (generate random 32+ character string)
   SESSION_SECRET=change_this_to_random_string_min_32_chars_long
   
   # WhatsApp Business API Configuration
   WHATSAPP_API_VERSION=v23.0
   WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
   WHATSAPP_ACCESS_TOKEN=your_permanent_access_token_here
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
   WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token_here
   ```

4. **Configure Application Settings**
   ```env
   # Your Domain Configuration
   APP_URL=https://yourdomain.com
   PORT=5000
   NODE_ENV=production
   
   # Optional Email Settings (for notifications)
   SMTP_HOST=mail.yourdomain.com
   SMTP_PORT=587
   SMTP_USER=noreply@yourdomain.com
   SMTP_PASS=email_password
   ```

### Step 5: Initialize Database

#### Option A: Using Web Installer
1. **Access Installer**
   - Navigate to: `https://yourdomain.com/install`
   - Installation wizard will open

2. **Enter Database Details**
   - Database host: localhost
   - Database name: Your database name
   - Username: Your database user
   - Password: Your database password

3. **Complete Installation**
   - Click "Test Connection"
   - Click "Install Database"
   - Wait for completion

#### Option B: Using phpMyAdmin
1. **Import Database**
   - Open phpMyAdmin
   - Select your database
   - Click "Import" tab
   - Select file: `database/whatsway_complete.sql`
   - Click "Go"

#### Option C: Using SSH
```bash
# Navigate to application directory
cd ~/public_html

# Run database setup
npm run db:push

# OR import SQL file
mysql -u youraccount_whatsway_user -p youraccount_whatsway_db < database/whatsway_complete.sql
```

### Step 6: Set Up Node.js Application

#### For cPanel with Node.js Selector

1. **Access Node.js Selector**
   - In cPanel, click "Setup Node.js App"

2. **Create Application**
   - Node.js version: 20.x
   - Application mode: Production
   - Application root: public_html
   - Application URL: yourdomain.com
   - Application startup file: dist/server/index.js

3. **Install Dependencies**
   - Click "Run NPM Install"
   - Wait for completion

4. **Build Application**
   - Click "Run Script"
   - Select "build"
   - Execute

5. **Start Application**
   - Click "Start" button
   - Application should show "Running" status

#### For VPS/Dedicated Server

1. **Install PM2 Process Manager**
   ```bash
   npm install -g pm2
   ```

2. **Build Application**
   ```bash
   cd ~/public_html
   npm run build
   ```

3. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js --name whatsway
   pm2 save
   pm2 startup
   ```

4. **Configure Nginx Reverse Proxy**
   Create `/etc/nginx/sites-available/whatsway`:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
       
       location /ws {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
       }
   }
   ```

5. **Enable Site and Restart**
   ```bash
   ln -s /etc/nginx/sites-available/whatsway /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

---

## Database Setup

### PostgreSQL Database

#### Create Database Structure
The application comes with a complete database export file. Import it using one of these methods:

1. **Using phpMyAdmin**
   - Select your database
   - Click "Import" tab
   - Choose file: `database/whatsway_complete.sql`
   - Click "Go"

2. **Using Command Line**
   ```bash
   psql -U username -d database_name < database/whatsway_complete.sql
   ```

3. **Using cPanel PostgreSQL**
   - Access PostgreSQL Databases
   - Select your database
   - Use phpPgAdmin to import

#### Default Admin Account
After database import, you can login with:
- **Username**: whatsway
- **Password**: Admin@123
- **Important**: Change this password immediately after first login

---

## Configuration

### Getting WhatsApp API Credentials

#### 1. Create Meta App
1. Go to: https://developers.facebook.com
2. Click "My Apps" → "Create App"
3. Select "Business" type
4. Enter app name and details
5. Add WhatsApp product to your app

#### 2. Get Business Account ID
1. Go to: https://business.facebook.com
2. Navigate: Business Settings → Accounts → WhatsApp Business Accounts
3. Copy your Account ID

#### 3. Generate Access Token
1. In Meta App Dashboard
2. Go to: WhatsApp → API Setup
3. Generate permanent access token
4. Copy and save securely

#### 4. Get Phone Number ID
1. In WhatsApp API Setup
2. Add phone number or use test number
3. Copy Phone Number ID

#### 5. Set Webhook Verify Token
1. Create a random string (e.g., "whatsway_webhook_2025")
2. Save for webhook configuration

---

## Configuration

### Webhook Configuration

1. **Get your webhook URL**:
   ```
   https://your-domain.com/api/webhook
   ```

2. **Configure in Meta**:
   - Go to: https://developers.facebook.com
   - Select your app
   - Navigate to: WhatsApp → Configuration → Webhooks
   - Add webhook URL
   - Enter verify token (from .env)
   - Subscribe to: messages, message_status, message_template_status_update

3. **Test webhook**:
   ```bash
   curl -X GET "https://your-domain.com/api/webhook?hub.mode=subscribe&hub.verify_token=your_token&hub.challenge=test"
   ```

### SSL Configuration (Production)

#### Using Let's Encrypt
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

#### Using Cloudflare
1. Add domain to Cloudflare
2. Update nameservers
3. Enable "Full (strict)" SSL mode
4. Configure page rules

### Performance Tuning

#### PostgreSQL Optimization
```sql
-- Edit postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
```

#### Node.js Optimization
```javascript
// ecosystem.config.js for PM2
module.exports = {
  apps: [{
    name: 'whatsway',
    script: './dist/server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

---

## First Time Setup

### Step 1: Access Application
1. Open browser and navigate to: `https://yourdomain.com`
2. You should see the login page
3. If you see an error, check troubleshooting section

### Step 2: Login with Default Credentials
- **Username**: `whatsway`
- **Password**: `Admin@123`
- **Important**: Change password immediately after login

### Step 3: Configure WhatsApp Channel
1. Navigate to **Settings** → **Channels**
2. Click **"Add Channel"**
3. Enter your WhatsApp details:
   - **Channel Name**: Your business name
   - **Phone Number**: WhatsApp number (with country code)
   - **Access Token**: From Meta App
   - **Phone Number ID**: From Meta App
4. Click **"Test Connection"**
5. Save if successful

### Step 4: Sync Message Templates
1. Go to **Templates** page
2. Click **"Sync Templates"** button
3. Wait for synchronization
4. Your approved templates will appear
5. Review and organize templates

### Step 5: Import Contacts
1. Navigate to **Contacts**
2. Click **"Import CSV"**
3. Download sample CSV template
4. Fill your contacts data
5. Upload and map columns
6. Complete import

### Step 6: Configure Webhook
1. **Get Webhook URL**:
   ```
   https://yourdomain.com/api/webhook
   ```

2. **Configure in Meta App**:
   - Go to Meta App Dashboard
   - Navigate: WhatsApp → Configuration → Webhooks
   - Click "Edit" webhook
   - Enter webhook URL
   - Enter verify token (from .env)
   - Click "Verify and Save"

3. **Subscribe to Events**:
   - messages
   - message_status
   - message_template_status_update

### Step 7: Send Test Message
1. Go to **Campaigns**
2. Click **"New Campaign"**
3. Select a template
4. Add test recipient (your number)
5. Send immediately
6. Verify message received

### Step 8: Set Up Your Team
1. Go to **Team** page
2. Click **"Add Member"**
3. Create accounts for team members
4. Assign appropriate roles:
   - **Admin**: Full system access
   - **Manager**: Campaign and template management
   - **Agent**: Conversation handling only

---

## Hosting Options

### Option 1: Shared Hosting with Node.js Support

**Recommended Providers**:
- Hostinger (Node.js hosting plans)
- A2 Hosting (Node.js support)
- InMotion Hosting (VPS with Node.js)

**Requirements**:
- Node.js 20.x support
- PostgreSQL or MySQL database
- SSH access (preferred)
- Min 2GB RAM

### Option 2: VPS Hosting

**Recommended Providers**:
- DigitalOcean ($12/month starter)
- Linode ($10/month starter)
- Vultr ($10/month starter)
- AWS Lightsail ($10/month)

**Setup Steps**:
1. Choose Ubuntu 22.04 LTS
2. Install Node.js and PostgreSQL
3. Configure Nginx
4. Set up PM2 for process management

### Option 3: Cloud Hosting

**Platforms**:
- AWS EC2
- Google Cloud Platform
- Microsoft Azure
- Heroku

**Benefits**:
- Auto-scaling
- Managed databases
- Built-in monitoring
- Global CDN

### Option 4: Managed Node.js Hosting

**Providers**:
- Railway.app
- Render.com
- Fly.io
- Northflank

**Features**:
- One-click deployment
- Automatic SSL
- Built-in databases
- GitHub integration

---

## Troubleshooting

### Common Installation Issues

#### 1. "Cannot find module" Error
**Problem**: Missing dependencies
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### 2. Database Connection Failed
**Problem**: Wrong credentials or host
**Solution**:
- Verify database name includes account prefix
- Check if using correct port (5432 for PostgreSQL, 3306 for MySQL)
- Ensure database user has all privileges

#### 3. Application Not Starting
**Problem**: Port already in use or missing environment variables
**Solution**:
```bash
# Check if port 5000 is in use
netstat -tuln | grep 5000

# Change port in .env file
PORT=5001

# Verify all required env variables are set
cat .env
```

#### 4. WhatsApp API Connection Error
**Problem**: Invalid credentials or expired token
**Solution**:
1. Regenerate access token in Meta App Dashboard
2. Verify phone number is active
3. Check API version compatibility
4. Ensure webhook is verified

#### 5. Build Failed
**Problem**: Node.js version mismatch
**Solution**:
```bash
# Check Node.js version
node --version

# Must be 20.x or higher
# If lower, update Node.js
```

#### 6. Webhook Not Working
**Problem**: SSL certificate or firewall issues
**Solution**:
1. Ensure SSL certificate is valid
2. Check if port 443 is open
3. Verify webhook URL is accessible
4. Test with: `curl https://yourdomain.com/api/webhook`

### Error Messages Reference

| Error | Cause | Solution |
|-------|-------|----------|
| `ECONNREFUSED` | Database not running | Check database service status |
| `401 Unauthorized` | Invalid WhatsApp token | Regenerate access token |
| `429 Too Many Requests` | API rate limit | Wait or upgrade tier |
| `EADDRINUSE` | Port already used | Change PORT in .env |
| `MODULE_NOT_FOUND` | Missing packages | Run npm install |
| `PERMISSION_DENIED` | File permissions | Check folder permissions |
| `SSL_ERROR` | Invalid certificate | Install valid SSL cert |

---

## Support

### Included Documentation
Your purchase includes comprehensive documentation:
- **Technical Documentation**: Complete system architecture and features
- **Setup Guide**: This installation guide
- **API Documentation**: REST API endpoints and integration
- **User Manual**: End-user guide for daily operations
- **Database Export**: Complete database with sample data

### Getting Help

#### Pre-Sales Questions
- Verify system requirements
- Check feature compatibility
- Review documentation

#### Installation Support
**Included with Purchase**:
- Installation documentation
- Database setup files
- Configuration templates
- Sample data

**Premium Support** (Additional):
- Remote installation assistance
- Custom configuration
- Training sessions
- Priority support

#### Contact Support
- **Email**: support@whatsway.com
- **Response Time**: 24-48 hours (business days)
- **Include in Support Request**:
  - Purchase code
  - Error messages/screenshots
  - Server environment details
  - Steps to reproduce issue

### Maintenance & Updates

#### Regular Maintenance Tasks
1. **Daily**: Monitor error logs
2. **Weekly**: Check API health, Review message delivery rates
3. **Monthly**: Update dependencies, Clean old logs
4. **Quarterly**: Rotate API tokens, Security audit

#### Backup Procedures
```bash
# Database backup (run daily via cron)
pg_dump $DATABASE_URL > backups/whatsway_$(date +%Y%m%d).sql

# Application backup
tar -czf backups/whatsway_files_$(date +%Y%m%d).tar.gz public_html/
```

#### Update Process
1. Backup current installation
2. Download update package
3. Extract to staging directory
4. Test in staging
5. Deploy to production
6. Run database migrations if needed

---

## Important Notes

### System Requirements Reminder
- **Server**: VPS or dedicated server recommended
- **Node.js**: Version 20.x required
- **Database**: PostgreSQL 15.x or MySQL 8.0+
- **RAM**: Minimum 2GB, 4GB recommended
- **SSL**: Required for webhooks

### Security Checklist
- ✅ Change default admin password immediately
- ✅ Use strong database passwords
- ✅ Install SSL certificate
- ✅ Keep WhatsApp API tokens secure
- ✅ Regular security updates
- ✅ Enable firewall rules
- ✅ Monitor access logs

### Compliance
- Follow WhatsApp Business API policies
- Respect message templates guidelines
- Maintain 24-hour messaging window
- Handle opt-outs properly
- Protect user data (GDPR compliance)

### Performance Tips
1. Use PM2 for process management
2. Enable caching where possible
3. Optimize database queries
4. Use CDN for static assets
5. Monitor resource usage

---

## Quick Reference

### Essential Commands
```bash
# Build application
npm run build

# Start production server
npm start

# Start with PM2
pm2 start ecosystem.config.js

# View logs
pm2 logs whatsway

# Database migration
npm run db:push

# Check application status
pm2 status
```

### Default Credentials
- **Admin Username**: whatsway
- **Admin Password**: Admin@123
- **Database Name**: whatsway_db
- **Application Port**: 5000

### File Structure
```
whatsway/
├── client/          # Frontend React application
├── server/          # Backend Node.js application
├── shared/          # Shared types and schemas
├── database/        # Database exports and migrations
├── public/          # Static assets
├── dist/            # Built production files
├── .env.example     # Environment template
└── package.json     # Dependencies
```

### API Endpoints
- Login: `POST /api/auth/login`
- Campaigns: `GET/POST /api/campaigns`
- Contacts: `GET/POST /api/contacts`
- Templates: `GET/POST /api/templates`
- Messages: `GET/POST /api/messages`
- Webhook: `GET/POST /api/webhook`

---

## License Agreement

This software is licensed, not sold. By installing WhatsWay, you agree to:

1. **Single Domain License**: One license per domain
2. **No Redistribution**: Cannot resell or distribute the code
3. **Modifications Allowed**: Can modify for your own use
4. **Support Period**: 6 months included support
5. **Updates**: 1 year of free updates

**Copyright © 2025 WhatsWay. All rights reserved.**

---

*Installation Guide Version: 2.0*
*Last Updated: January 2025*
*WhatsWay - Professional WhatsApp Business Platform*