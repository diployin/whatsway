# WhatsWay Auto-Installer Documentation

## Quick Start

### Universal Installer (Recommended)
Works on all platforms - automatically detects your environment:

```bash
node install.js
```

### Platform-Specific Installers

**Linux/Mac:**
```bash
chmod +x install.sh
./install.sh
```

**Windows:**
```cmd
install.bat
```

## What the Installer Does

The auto-installer handles the complete setup process:

1. **Environment Detection** - Identifies your server type (Plesk, cPanel, DigitalOcean, etc.)
2. **Prerequisites Check** - Verifies Node.js, NPM, and system requirements
3. **Configuration** - Interactive setup for database, domain, and API settings
4. **Dependencies** - Installs all required NPM packages
5. **Build Process** - Compiles TypeScript and builds the application
6. **Database Setup** - Configures database and creates admin user
7. **Process Management** - Sets up PM2 or appropriate service manager
8. **Web Server** - Configures Nginx/Apache/IIS as needed
9. **SSL Certificate** - Optional Let's Encrypt SSL setup

## Prerequisites

### Minimum Requirements
- **OS**: Linux, Windows Server 2016+, macOS
- **Node.js**: Version 18 or higher
- **RAM**: Minimum 1GB (2GB recommended)
- **Disk Space**: 500MB free space
- **Database**: PostgreSQL 12+ (local or cloud)

### Required Software
- Node.js 18+ and NPM
- Git (for downloading updates)
- PostgreSQL or Neon Database account

## Installation Methods

### Method 1: Automated Installation (Recommended)

1. **Download WhatsWay files** to your server
2. **Navigate to the directory**:
   ```bash
   cd /path/to/whatsway
   ```
3. **Run the installer**:
   ```bash
   node install.js
   ```
4. **Follow the prompts** to configure your installation

### Method 2: Manual Installation

If the auto-installer doesn't work for your environment:

1. **Install Node.js 20.x**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Clone or upload WhatsWay files**

3. **Install dependencies**:
   ```bash
   npm install --production
   ```

4. **Configure environment**:
   ```bash
   cp .env.example .env
   nano .env  # Edit with your settings
   ```

5. **Build application**:
   ```bash
   npm run build
   ```

6. **Setup database**:
   ```bash
   npm run db:push
   node scripts/reset-admin.js
   ```

7. **Start application**:
   ```bash
   npm start
   # OR with PM2:
   pm2 start ecosystem.config.js
   ```

## Platform-Specific Instructions

### Plesk

The installer creates an `app.js` file compatible with Plesk's Node.js extension.

**After running installer:**
1. Go to Plesk > Domains > Your Domain > Node.js
2. Set Application Root: `/var/www/vhosts/yourdomain.com/httpdocs`
3. Set Application Startup File: `app.js`
4. Set Node.js version: 20.x
5. Click "NPM Install"
6. Click "Run Script" > Select "build"
7. Click "Restart App"

### cPanel

**After running installer:**
1. Go to cPanel > Software > Setup Node.js App
2. Create new application
3. Node.js version: 20
4. Application root: Your installation directory
5. Application startup file: `dist/server/index.js`
6. Click "Create"
7. Run NPM Install
8. Add environment variables from `.env`

### DigitalOcean/AWS/VPS

The installer automatically:
- Installs and configures PM2
- Sets up Nginx reverse proxy
- Configures systemd service
- Optional SSL with Let's Encrypt

### Windows Server

**For IIS:**
1. Install IIS and iisnode
2. Run `install.bat` as Administrator
3. Configure IIS site to point to installation directory
4. Use the generated `web.config`

**For standalone:**
1. Run `install.bat` as Administrator
2. PM2 will be configured automatically
3. Access at `http://localhost:5000`

## Configuration Options

### Environment Variables

The installer will prompt for these settings:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SESSION_SECRET` | Session encryption key (auto-generated) | Yes |
| `APP_URL` | Your application URL | Yes |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | Meta Business Account ID | No* |
| `WHATSAPP_ACCESS_TOKEN` | Meta API Access Token | No* |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp Phone Number ID | No* |

*Can be added later through the application settings

### Database Options

1. **Neon (Recommended for production)**
   - Cloud PostgreSQL
   - Automatic backups
   - Serverless scaling
   - Get free account at: https://neon.tech

2. **Local PostgreSQL**
   - Install PostgreSQL locally
   - Installer can create database automatically
   - Good for development/testing

3. **Custom DATABASE_URL**
   - Use any PostgreSQL 12+ compatible database
   - Format: `postgresql://user:pass@host:port/database`

## Post-Installation

### 1. Access the Application

After successful installation:
- URL: `https://your-domain.com`
- Username: `whatsway`
- Password: `Admin@123`

### 2. Complete WhatsApp Setup

1. Login to admin panel
2. Go to Settings > Channels
3. Add WhatsApp Business Account credentials
4. Configure webhook URL in Meta Business

### 3. Configure Webhook

In Meta Business Platform:
- Webhook URL: `https://your-domain.com/webhook`
- Verify Token: (check your .env file)
- Subscribe to: messages, message_status

### 4. Security Steps

**Important - Do these immediately:**
1. Change default admin password
2. Update SESSION_SECRET if needed
3. Configure firewall rules
4. Enable automatic backups
5. Set up monitoring

## Troubleshooting

### Installation Fails

**Node.js version issues:**
```bash
node --version  # Should be 18+
npm --version   # Should be 8+
```

**Permission issues:**
```bash
# Linux/Mac
sudo chown -R $USER:$USER /path/to/whatsway

# Windows
# Run as Administrator
```

**Database connection fails:**
```bash
# Test connection
psql "your-database-url"

# Check if PostgreSQL is running
systemctl status postgresql
```

### Application Won't Start

**Check logs:**
```bash
# PM2
pm2 logs whatsway

# Direct logs
tail -f logs/error.log

# System logs
journalctl -xe
```

**Port already in use:**
```bash
# Find process using port 5000
lsof -i :5000
# OR
netstat -tulpn | grep 5000

# Kill process
kill -9 <PID>
```

**Build errors:**
```bash
# Clear and rebuild
rm -rf node_modules dist
npm ci
npm run build
```

### Database Issues

**Reset admin password:**
```bash
node scripts/reset-admin.js
```

**Run migrations:**
```bash
npm run db:push
```

**Import database:**
```bash
psql $DATABASE_URL < database_export.sql
```

## Helper Scripts

### Environment Setup
```bash
node setup-env.js
```
Interactive configuration helper for .env file

### Reset Admin
```bash
node scripts/reset-admin.js
```
Creates or resets admin user credentials

### Health Check
```bash
curl http://localhost:5000/api/health
```
Verify application is running

## Support Files

- `install.js` - Universal auto-installer
- `install.sh` - Linux/Mac installer
- `install.bat` - Windows installer
- `setup-env.js` - Environment configuration helper
- `ecosystem.config.js` - PM2 configuration
- `app.js` - Plesk compatibility layer
- `web.config` - IIS configuration

## Getting Help

1. **Check Documentation:**
   - `/DOCUMENTATION.md` - Complete user guide
   - `/QUICK_START_GUIDE.md` - 15-minute setup
   - `/DEPLOYMENT_GUIDE.md` - Production deployment

2. **Review Logs:**
   - Application logs: `logs/`
   - PM2 logs: `pm2 logs`
   - System logs: `/var/log/`

3. **Common Issues:**
   - [Plesk Setup Guide](/PLESK_SETUP_GUIDE.md)
   - [DigitalOcean Setup](/DIGITALOCEAN_SETUP.md)
   - [Database Export Guide](/DATABASE_EXPORT_README.md)

## Advanced Configuration

### Custom Port
Edit `.env`:
```
PORT=3000
```

### Multiple Instances
Edit `ecosystem.config.js`:
```javascript
instances: 'max'  // Use all CPU cores
```

### Custom Domain
1. Point domain DNS to server IP
2. Update `.env` APP_URL
3. Configure SSL certificate
4. Update webhook URL in Meta Business

### Backup Strategy
```bash
# Database backup
pg_dump $DATABASE_URL > backup.sql

# File backup
tar -czf whatsway-backup.tar.gz .
```

## Success Checklist

After installation, verify:

- [ ] Application accessible via browser
- [ ] Can login with admin credentials
- [ ] Database connection working
- [ ] WhatsApp API credentials added
- [ ] Webhook configured in Meta Business
- [ ] SSL certificate active (https://)
- [ ] PM2/service running
- [ ] Logs being generated
- [ ] Cron jobs scheduled
- [ ] Firewall configured

---

**Installation typically takes 5-10 minutes.** The auto-installer handles most configuration automatically. For manual setup or troubleshooting, refer to the platform-specific guides.