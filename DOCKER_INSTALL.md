# WhatsWay Docker Installation
*Quick setup guide for Docker deployment*

## 5-Minute Quick Start

### Prerequisites
- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed
- Domain name (optional for local testing)

---

## Method 1: Using Docker Compose (Recommended)

### Step 1: Prepare Environment
```bash
# Clone or extract WhatsWay
cd whatsway

# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

### Step 2: Configure Settings
Edit `.env` with your values:
```env
# Required Settings
DB_PASSWORD=YourSecurePassword123!
SESSION_SECRET=your-32-character-secret-key
ENCRYPTION_KEY=your-encryption-key
DOMAIN=yourdomain.com

# WhatsApp Settings (get from Meta Business)
WEBHOOK_TOKEN=your-webhook-verify-token
```

### Step 3: Start WhatsWay
```bash
# Start all services
docker-compose up -d

# Wait for services to be ready (about 30 seconds)
docker-compose ps

# Initialize database
docker-compose exec whatsway npm run db:push
docker-compose exec whatsway npm run seed
```

### Step 4: Access Application
- Local: http://localhost:5000
- Production: https://yourdomain.com
- Login: `whatsway` / `Admin@123`

---

## Method 2: Single Docker Container

### For Testing/Development
```bash
# Quick run with SQLite (testing only)
docker run -d \
  --name whatsway \
  -p 5000:5000 \
  -e NODE_ENV=development \
  whatsway/whatsway:latest
```

### For Production
```bash
# With external PostgreSQL
docker run -d \
  --name whatsway \
  -p 5000:5000 \
  -e DATABASE_URL="postgresql://user:pass@db-host:5432/whatsway" \
  -e SESSION_SECRET="your-secret-key" \
  -e NODE_ENV=production \
  --restart unless-stopped \
  whatsway/whatsway:latest
```

---

## Production Setup with SSL

### Option 1: Using Traefik (Auto SSL)

1. **Add Traefik** to docker-compose.yml:
```yaml
services:
  traefik:
    image: traefik:v2.10
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.email=admin@yourdomain.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./letsencrypt:/letsencrypt

  whatsway:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.whatsway.rule=Host(`yourdomain.com`)"
      - "traefik.http.routers.whatsway.entrypoints=websecure"
      - "traefik.http.routers.whatsway.tls.certresolver=letsencrypt"
      - "traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https"
      - "traefik.http.routers.whatsway-http.rule=Host(`yourdomain.com`)"
      - "traefik.http.routers.whatsway-http.entrypoints=web"
      - "traefik.http.routers.whatsway-http.middlewares=redirect-to-https"
```

2. **Start with SSL**:
```bash
docker-compose up -d
```

### Option 2: Using Nginx Proxy

1. **Start WhatsWay**:
```bash
docker-compose up -d whatsway postgres
```

2. **Configure Nginx** on host:
```bash
# Install Nginx and Certbot
sudo apt-get install nginx certbot python3-certbot-nginx

# Configure proxy
sudo nano /etc/nginx/sites-available/whatsway
```

3. **Add configuration**:
```nginx
server {
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

4. **Enable SSL**:
```bash
sudo ln -s /etc/nginx/sites-available/whatsway /etc/nginx/sites-enabled/
sudo certbot --nginx -d yourdomain.com
sudo systemctl reload nginx
```

---

## Docker Commands Reference

### Container Management
```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f whatsway

# Stop services
docker-compose down

# Stop and remove volumes (CAUTION: deletes data)
docker-compose down -v

# Restart service
docker-compose restart whatsway

# Execute commands in container
docker-compose exec whatsway npm run db:push
docker-compose exec whatsway pm2 status
```

### Database Operations
```bash
# Backup database
docker-compose exec postgres pg_dump -U whatsway whatsway_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U whatsway whatsway_db < backup.sql

# Access database shell
docker-compose exec postgres psql -U whatsway -d whatsway_db
```

### Monitoring
```bash
# Check resource usage
docker stats

# View PM2 status inside container
docker-compose exec whatsway pm2 status

# Monitor logs
docker-compose exec whatsway pm2 logs

# Health check
curl http://localhost:5000/api/health
```

---

## Environment Variables

### Required Variables
```env
# Database (if using external)
DATABASE_URL=postgresql://user:pass@host:5432/db

# Security
SESSION_SECRET=minimum-32-characters-random-string
ENCRYPTION_KEY=another-32-character-random-string

# Application
NODE_ENV=production
PORT=5000
```

### Optional Variables
```env
# Domain
DOMAIN=yourdomain.com
BASE_URL=https://yourdomain.com

# WhatsApp
WHATSAPP_API_VERSION=v21.0
WEBHOOK_TOKEN=your-webhook-token

# Performance
PM2_INSTANCES=2
PM2_MAX_MEMORY=1G

# Debug (development only)
DEBUG=true
LOG_LEVEL=debug
```

---

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs whatsway

# Verify environment
docker-compose config

# Check port availability
sudo lsof -i :5000
```

### Database Connection Issues
```bash
# Test database connection
docker-compose exec whatsway npm run db:test

# Check PostgreSQL logs
docker-compose logs postgres

# Verify network
docker network ls
docker network inspect whatsway_whatsway-network
```

### Permission Issues
```bash
# Fix ownership
docker-compose exec whatsway chown -R nodejs:nodejs /app

# Fix permissions
docker-compose exec whatsway chmod -R 755 /app
```

### Memory Issues
```bash
# Increase memory limit
docker-compose down
# Edit docker-compose.yml, add:
# mem_limit: 2g
docker-compose up -d
```

---

## Docker on Different Platforms

### Docker on Plesk

1. **Install Docker Extension** in Plesk
2. **Upload** docker-compose.yml
3. **Configure** through Plesk Docker UI
4. **Set** environment variables in Plesk
5. **Start** container from Plesk panel

### Docker on cPanel

1. **SSH** into server
2. **Install Docker**:
```bash
curl -fsSL https://get.docker.com | sh
```
3. **Run** docker-compose commands
4. **Configure** reverse proxy in cPanel

### Docker on AWS ECS

1. **Push image** to ECR:
```bash
aws ecr get-login-password | docker login --username AWS --password-stdin [ecr-url]
docker tag whatsway:latest [ecr-url]/whatsway:latest
docker push [ecr-url]/whatsway:latest
```

2. **Create** ECS task definition
3. **Configure** ALB for load balancing
4. **Set** environment variables in task
5. **Deploy** service

### Docker on DigitalOcean

1. **Create** Docker Droplet from Marketplace
2. **SSH** and clone repository
3. **Run**:
```bash
cd whatsway
docker-compose up -d
```
4. **Configure** floating IP and firewall

---

## Performance Optimization

### Multi-Instance Setup
```yaml
# docker-compose.yml
services:
  whatsway:
    scale: 3  # Run 3 instances
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 1G
```

### With Redis Cache
```yaml
services:
  redis:
    image: redis:alpine
    restart: unless-stopped
    
  whatsway:
    environment:
      REDIS_URL: redis://redis:6379
```

### Production Best Practices
```bash
# Use specific versions
image: whatsway/whatsway:1.0.0

# Set restart policy
restart: unless-stopped

# Limit resources
mem_limit: 2g
cpus: 1

# Use volumes for persistence
volumes:
  - ./data:/app/data
  - ./logs:/app/logs
```

---

## Backup Strategy

### Automated Backups
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U whatsway whatsway_db > backup_$DATE.sql
tar -czf whatsway_backup_$DATE.tar.gz backup_$DATE.sql uploads/
rm backup_$DATE.sql
echo "Backup completed: whatsway_backup_$DATE.tar.gz"
EOF

# Schedule with cron
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

---

## Security Checklist

- [ ] Changed default admin password
- [ ] Set strong database password
- [ ] Configure firewall rules
- [ ] Enable SSL/TLS
- [ ] Set secure session secret
- [ ] Limit container resources
- [ ] Regular security updates
- [ ] Backup configuration

---

## Quick Tips

1. **Development**: Use `NODE_ENV=development` for auto-reload
2. **Logs**: Always check `docker-compose logs` for issues
3. **Updates**: Pull latest image with `docker-compose pull`
4. **Scale**: Use `docker-compose scale whatsway=3` for multiple instances
5. **Monitor**: Use `docker stats` to watch resource usage

---

## Support

- Check logs: `docker-compose logs -f`
- System info: `docker version && docker-compose version`
- Documentation: See TECHNICAL_DOCUMENTATION.md
- Installation Guide: See INSTALLATION_GUIDE.md

---

*Ready to deploy in 5 minutes with Docker!*