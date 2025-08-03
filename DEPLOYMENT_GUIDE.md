# WhatsWay Deployment Guide

## Production Deployment Options

### Option 1: VPS/Dedicated Server Deployment

#### Prerequisites
- Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- Root or sudo access
- Domain name with SSL certificate
- Minimum 2GB RAM (4GB recommended)

#### Step 1: Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl git nginx certbot python3-certbot-nginx

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2
sudo npm install -g pm2
```

#### Step 2: SSL Certificate Setup
```bash
# Get SSL certificate using Let's Encrypt
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

#### Step 3: Database Setup
```bash
# Create database
sudo -u postgres psql
CREATE DATABASE whatsway_prod;
CREATE USER whatsway_user WITH ENCRYPTED PASSWORD 'strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE whatsway_prod TO whatsway_user;
\q
```

#### Step 4: Application Deployment
```bash
# Create application directory
sudo mkdir -p /var/www/whatsway
sudo chown -R $USER:$USER /var/www/whatsway

# Clone/Copy application
cd /var/www/whatsway
# Either git clone or upload files

# Install dependencies
npm install --production

# Build application
npm run build

# Setup environment
cp .env.example .env
nano .env  # Edit with production values
```

#### Step 5: PM2 Configuration
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'whatsway',
    script: './server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true
  }]
};
```

Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Step 6: Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

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
        proxy_pass http://localhost:5000/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/whatsway /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option 2: Docker Deployment

#### Prerequisites
- Docker and Docker Compose installed
- Domain with SSL certificate

#### Step 1: Environment Setup
```bash
# Create directory
mkdir whatsway-docker
cd whatsway-docker

# Copy application files
# Create .env file with production values
```

#### Step 2: Docker Compose Configuration
The `docker-compose.yml` is already provided:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: whatsway
      POSTGRES_USER: whatsway_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  whatsway:
    build: .
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://whatsway_user:${DB_PASSWORD}@postgres:5432/whatsway
      NODE_ENV: production
    depends_on:
      - postgres
    volumes:
      - ./logs:/app/logs

volumes:
  postgres_data:
```

#### Step 3: Deploy with Docker
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Run migrations
docker-compose exec whatsway npm run db:push
```

### Option 3: Cloud Platform Deployment

#### AWS EC2
1. Launch EC2 instance (t3.medium recommended)
2. Configure security groups (80, 443, 5000)
3. Follow VPS deployment steps above

#### DigitalOcean
1. Create Droplet (2GB RAM minimum)
2. Configure firewall rules
3. Follow VPS deployment steps

#### Google Cloud Platform
1. Create Compute Engine instance
2. Configure firewall rules
3. Follow VPS deployment steps

#### Heroku
```bash
# Install Heroku CLI
# Create Heroku app
heroku create whatsway-app

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=your_secret

# Deploy
git push heroku main
```

## Post-Deployment Configuration

### 1. Configure WhatsApp Webhook
1. Go to Meta Developer Console
2. Update webhook URL to: `https://your-domain.com/api/webhook`
3. Verify webhook is working

### 2. Setup Monitoring
```bash
# Install monitoring tools
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 3. Setup Backups
Create `backup.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/whatsway"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U whatsway_user whatsway_prod > $BACKUP_DIR/db_$DATE.sql

# Backup files
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/whatsway/attached_assets

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete
```

Add to crontab:
```bash
0 2 * * * /path/to/backup.sh
```

### 4. Security Hardening

#### Firewall Setup
```bash
# UFW firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

#### Fail2ban
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

## Performance Optimization

### 1. Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at);
CREATE INDEX idx_contacts_phone ON contacts(phone_number);
```

### 2. Redis Caching (Optional)
```bash
# Install Redis
sudo apt install redis-server

# Configure in .env
REDIS_URL=redis://localhost:6379
```

### 3. CDN Setup
- Use Cloudflare or AWS CloudFront
- Cache static assets
- Enable compression

## Monitoring & Maintenance

### Health Checks
```bash
# Check application status
pm2 status

# Check logs
pm2 logs whatsway

# Monitor resources
pm2 monit
```

### Log Rotation
```bash
# Configure logrotate
sudo nano /etc/logrotate.d/whatsway
```

Add:
```
/var/www/whatsway/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

## Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check logs
pm2 logs whatsway --lines 100

# Check environment
pm2 env 0
```

#### Database Connection Failed
```bash
# Test connection
psql -U whatsway_user -d whatsway_prod -h localhost

# Check PostgreSQL status
sudo systemctl status postgresql
```

#### Webhook Not Working
- Verify SSL certificate is valid
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Test webhook manually

## Scaling Considerations

### Horizontal Scaling
1. Use load balancer (Nginx, HAProxy)
2. Multiple application servers
3. Shared Redis for sessions
4. Read replicas for database

### Vertical Scaling
1. Increase server resources
2. Optimize database queries
3. Enable query caching
4. Use connection pooling

## Security Checklist

- [ ] Change default passwords
- [ ] Enable firewall
- [ ] Configure SSL/TLS
- [ ] Regular security updates
- [ ] Backup strategy implemented
- [ ] Monitor access logs
- [ ] Rate limiting configured
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] API keys rotated regularly

## Support

For deployment support:
- Documentation: See DOCUMENTATION.md
- Email: support@whatsway.com
- Community: forum.whatsway.com

---

Remember to always test in a staging environment before deploying to production!