# WhatsWay Database Configuration Guide

## Overview
WhatsWay supports both standard PostgreSQL servers and Neon cloud databases. The application automatically detects which type to use based on your connection string.

## Database Options

### Option 1: Standard PostgreSQL (Recommended for Self-Hosted)

**Perfect for:** VPS, dedicated servers, Docker, local development

#### Setup PostgreSQL on Ubuntu/Debian:
```bash
# Install PostgreSQL
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
```

```sql
-- In PostgreSQL prompt:
CREATE USER whatsway WITH PASSWORD 'YourSecurePassword';
CREATE DATABASE whatsway_db OWNER whatsway;
GRANT ALL PRIVILEGES ON DATABASE whatsway_db TO whatsway;
\q
```

#### Configure .env:
```env
# Standard PostgreSQL connection
DATABASE_URL="postgresql://whatsway:YourSecurePassword@localhost:5432/whatsway_db"

# Optional: Disable SSL for local database
DB_SSL_MODE="disable"
```

### Option 2: Neon Cloud Database

**Perfect for:** Replit, cloud deployments, serverless

#### Setup:
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

#### Configure .env:
```env
# Neon connection string
DATABASE_URL="postgresql://user:pass@xxx.neon.tech/dbname?sslmode=require"

# Force Neon driver (optional - auto-detected)
USE_NEON="true"
```

### Option 3: Cloud PostgreSQL (AWS RDS, DigitalOcean, etc.)

#### Configure .env:
```env
# Cloud PostgreSQL with SSL
DATABASE_URL="postgresql://user:pass@host.region.rds.amazonaws.com:5432/dbname"

# Enable SSL for cloud databases
DB_SSL_MODE="require"
```

## Connection Settings

### Environment Variables

| Variable | Description | Default | Examples |
|----------|-------------|---------|----------|
| `DATABASE_URL` | Full connection string | Required | `postgresql://user:pass@host/db` |
| `DB_SSL_MODE` | SSL configuration | auto | `disable`, `require` |
| `USE_NEON` | Force Neon driver | auto | `true`, `false` |

### SSL Configuration

The application automatically configures SSL based on your environment:

- **Local databases** (`localhost`, `127.0.0.1`): SSL disabled
- **Production mode**: SSL enabled with self-signed certificates accepted
- **Development mode**: SSL disabled
- **Neon databases**: Always uses secure WebSocket connection

Override with `DB_SSL_MODE`:
- `disable`: No SSL (local databases)
- `require`: SSL required (cloud databases)

## Troubleshooting

### Common Issues

#### 1. SSL Certificate Error
```
Error: ERR_TLS_CERT_ALTNAME_INVALID
```
**Solution:** Set `DB_SSL_MODE="disable"` for local databases

#### 2. Connection Refused
```
Error: ECONNREFUSED 127.0.0.1:5432
```
**Solution:** 
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify port: `sudo netstat -plnt | grep 5432`

#### 3. Authentication Failed
```
Error: password authentication failed for user
```
**Solution:**
- Verify credentials in DATABASE_URL
- Check pg_hba.conf allows connections
- Reset password if needed

#### 4. WebSocket Error (Neon)
```
Error: WebSocket connection failed
```
**Solution:**
- Check if behind proxy/firewall
- Try setting `USE_NEON="false"` to use standard driver

### Testing Connection

Run this command to test your database connection:
```bash
npm run db:push
```

If successful, you'll see:
```
✅ Successfully connected to the database
```

### Database Migration

#### From Neon to Standard PostgreSQL:

1. **Export from Neon:**
```bash
pg_dump DATABASE_URL_NEON > backup.sql
```

2. **Import to PostgreSQL:**
```bash
psql DATABASE_URL_POSTGRES < backup.sql
```

3. **Update .env:**
```env
# Old (Neon)
# DATABASE_URL="postgresql://xxx@xxx.neon.tech/xxx"

# New (Standard)
DATABASE_URL="postgresql://whatsway:password@localhost:5432/whatsway_db"
DB_SSL_MODE="disable"
```

#### From Standard to Neon:

1. **Create Neon project** at neon.tech
2. **Export from PostgreSQL:**
```bash
pg_dump DATABASE_URL > backup.sql
```
3. **Import to Neon:**
```bash
psql NEON_DATABASE_URL < backup.sql
```

## Performance Tips

### Standard PostgreSQL
- Increase `max_connections` in postgresql.conf
- Configure connection pooling (20 connections default)
- Use pgBouncer for high traffic

### Neon Database
- Uses automatic connection pooling
- Scales on demand
- No configuration needed

## Security Best Practices

1. **Use strong passwords** (minimum 16 characters)
2. **Restrict database access** to application server only
3. **Enable SSL** for production databases
4. **Regular backups** (daily recommended)
5. **Keep PostgreSQL updated**

## Database Commands

### Create backup:
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Restore backup:
```bash
psql $DATABASE_URL < backup.sql
```

### Check database size:
```sql
SELECT pg_database_size('whatsway_db') / 1024 / 1024 as size_mb;
```

### View active connections:
```sql
SELECT count(*) FROM pg_stat_activity;
```

## Support Matrix

| Database Type | Supported | Auto-Detection | Notes |
|--------------|-----------|----------------|-------|
| PostgreSQL 12+ | ✅ | ✅ | Recommended |
| Neon Cloud | ✅ | ✅ | Best for serverless |
| AWS RDS PostgreSQL | ✅ | ✅ | Enterprise ready |
| DigitalOcean PostgreSQL | ✅ | ✅ | Good performance |
| Heroku PostgreSQL | ✅ | ✅ | Easy setup |
| Local PostgreSQL | ✅ | ✅ | Development |

---

*Database configuration is automatically detected. Manual configuration only needed for special cases.*