# WhatsWay - DigitalOcean Deployment Guide

## Quick Fix for SSL/Database Connection Error

The error you're seeing is related to SSL certificate mismatches. Here's how to fix it:

### Immediate Fix

1. **Set Environment Variables on your DigitalOcean Droplet:**
```bash
export NODE_ENV=production
export DATABASE_URL="your-neon-database-url"
export SESSION_SECRET="your-secret-key-at-least-32-characters"
```

2. **Update Database URL Format:**
Make sure your DATABASE_URL includes `?sslmode=require`:
```
postgresql://user:password@host.neon.tech/database?sslmode=require
```

3. **Rebuild and Restart:**
```bash
npm run build
npm start
```

## Complete DigitalOcean Setup Guide

### Step 1: Initial Server Setup

1. **Create Droplet:**
   - Ubuntu 22.04 LTS
   - Minimum 2GB RAM
   - Choose datacenter close to your users

2. **SSH into Droplet:**
```bash
ssh root@your-droplet-ip
```

3. **Update System:**
```bash
apt update && apt upgrade -y
```

### Step 2: Install Required Software

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs

# Install PostgreSQL client (for database connections)
apt-get install -y postgresql-client

# Install nginx (for reverse proxy)
apt-get install -y nginx

# Install PM2 (process manager)
npm install -g pm2

# Install build tools
apt-get install -y build-essential
```

### Step 3: Setup Application

1. **Clone or Upload Application:**
```bash
cd /var/www
git clone your-repo-url whatsway
# OR upload files via SFTP
cd whatsway
```

2. **Install Dependencies:**
```bash
npm install --production
```

3. **Create Environment File:**
```bash
nano .env
```

Add:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require
SESSION_SECRET=your-secret-key-at-least-32-characters
WHATSAPP_API_VERSION=v23.0
WHATSAPP_BUSINESS_ACCOUNT_ID=your-account-id
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your-webhook-token
APP_URL=https://whatsway.diploy.in
```

4. **Build Application:**
```bash
npm run build
```

### Step 4: Setup PM2 Process Manager

1. **Create PM2 Config:**
```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'whatsway',
    script: './dist/index.js',
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
```

2. **Start with PM2:**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 5: Configure Nginx Reverse Proxy

1. **Create Nginx Config:**
```bash
nano /etc/nginx/sites-available/whatsway
```

```nginx
server {
    listen 80;
    server_name whatsway.diploy.in;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name whatsway.diploy.in;
    
    # SSL Configuration (update paths)
    ssl_certificate /etc/letsencrypt/live/whatsway.diploy.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/whatsway.diploy.in/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Proxy settings
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket support
    location /ws {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Increase upload size for file uploads
    client_max_body_size 10M;
}
```

2. **Enable Site:**
```bash
ln -s /etc/nginx/sites-available/whatsway /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 6: Setup SSL with Let's Encrypt

```bash
# Install Certbot
apt-get install -y certbot python3-certbot-nginx

# Get SSL Certificate
certbot --nginx -d whatsway.diploy.in

# Auto-renewal
certbot renew --dry-run
```

### Step 7: Setup Firewall

```bash
# Install UFW
apt-get install -y ufw

# Configure firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80
ufw allow 443
ufw --force enable
```

### Step 8: Database Setup

1. **If using external PostgreSQL (Neon):**
   - Already configured in .env
   - Make sure to use `?sslmode=require` in connection string

2. **If using local PostgreSQL:**
```bash
apt-get install -y postgresql
sudo -u postgres createdb whatsway_db
sudo -u postgres createuser whatsway_user
# Import database
psql -U whatsway_user -d whatsway_db < database_export.sql
```

### Step 9: Login Credentials

Default admin credentials:
- **Username:** whatsway
- **Password:** Admin@123

**Important:** Change these after first login!

## Troubleshooting

### SSL Certificate Issues

If you see SSL errors:
1. Check certificate is valid: `certbot certificates`
2. Ensure DATABASE_URL has `?sslmode=require`
3. Set NODE_ENV=production

### Database Connection Issues

1. **For Neon Database:**
```bash
# Test connection
psql "your-database-url"
```

2. **Check logs:**
```bash
pm2 logs whatsway
```

### Login Issues

1. **Check session secret is set:**
```bash
echo $SESSION_SECRET
```

2. **Verify database has users table:**
```sql
SELECT * FROM users WHERE username = 'whatsway';
```

3. **Reset admin password if needed:**
```sql
UPDATE users SET password = '$2a$10$YourHashedPassword' WHERE username = 'whatsway';
```

### Port Issues

If port 5000 is blocked:
```bash
# Check what's using port
lsof -i :5000

# Kill process if needed
kill -9 <PID>
```

## Monitoring

### View Logs
```bash
# PM2 logs
pm2 logs whatsway

# Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Monitor Resources
```bash
# PM2 monitoring
pm2 monit

# System resources
htop
```

### Health Check
```bash
curl http://localhost:5000/api/health
```

## Backup Strategy

1. **Database Backup:**
```bash
# Create backup script
nano /home/backup_db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > /home/backups/whatsway_$DATE.sql
# Keep only last 7 days
find /home/backups -name "*.sql" -mtime +7 -delete
```

2. **Schedule with Cron:**
```bash
crontab -e
# Add: 0 2 * * * /home/backup_db.sh
```

## Security Recommendations

1. **Change default passwords immediately**
2. **Enable fail2ban for SSH protection**
3. **Use SSH keys instead of passwords**
4. **Regular security updates:** `unattended-upgrades`
5. **Monitor logs regularly**

## Support

If issues persist:
1. Check PM2 logs: `pm2 logs whatsway --lines 100`
2. Check system logs: `journalctl -xe`
3. Verify environment variables are loaded
4. Ensure database is accessible
5. Confirm SSL certificates are valid

---

**Your current issue** is specifically the SSL/WebSocket error. The fix in `server/db.ts` should resolve it by using HTTP fetch instead of WebSocket for database connections in production.