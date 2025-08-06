# WhatsWay - Plesk Node.js Setup Guide

## Overview
This guide specifically addresses setting up WhatsWay on Plesk with Node.js support. Follow these steps carefully to resolve Phusion Passenger errors.

---

## Prerequisites for Plesk

1. **Plesk Version**: Obsidian 18.0 or higher
2. **Node.js Extension**: Installed and activated
3. **Database**: PostgreSQL or MySQL available
4. **Domain**: Configured in Plesk

---

## Step-by-Step Plesk Installation

### Step 1: Upload Application Files

1. **Access Plesk File Manager**
   - Login to Plesk
   - Go to **Files** → **httpdocs** (or your domain folder)

2. **Upload WhatsWay Files**
   - Upload all files to the domain directory
   - Ensure `app.js` is in the root directory
   - Verify `package.json` is present

### Step 2: Set Up Database

1. **Create Database in Plesk**
   - Go to **Databases** → **Add Database**
   - Database name: `whatsway_db`
   - Create database user with full permissions

2. **Import Database Structure**
   - Click on **phpMyAdmin** or **pgAdmin**
   - Select your database
   - Import `database/whatsway_complete.sql`

### Step 3: Configure Environment Variables

1. **In Plesk Node.js Settings**
   - Go to your domain → **Node.js**
   - Click **Environment variables**
   
2. **Add Required Variables**
   ```
   NODE_ENV = production
   DATABASE_URL = postgresql://user:password@localhost:5432/whatsway_db
   SESSION_SECRET = your-secret-key-min-32-chars
   WHATSAPP_API_VERSION = v23.0
   WHATSAPP_BUSINESS_ACCOUNT_ID = your-account-id
   WHATSAPP_ACCESS_TOKEN = your-access-token
   WHATSAPP_PHONE_NUMBER_ID = your-phone-id
   WHATSAPP_WEBHOOK_VERIFY_TOKEN = your-webhook-token
   APP_URL = https://yourdomain.com
   ```

### Step 4: Install Dependencies via Plesk

1. **Access Node.js Application Settings**
   - Go to domain → **Node.js**
   - Application root: `/httpdocs` (or your folder)
   - Application startup file: `app.js`
   - Node.js version: **20.x** (IMPORTANT: Must be 20 or higher)

2. **Install NPM Packages**
   - Click **NPM Install** button
   - Wait for installation to complete
   - Check logs for any errors

### Step 5: Build the Application

**IMPORTANT**: This is the most critical step for Plesk!

1. **Access SSH or Plesk Terminal**
   ```bash
   cd /var/www/vhosts/yourdomain.com/httpdocs
   ```

2. **Run Build Command**
   ```bash
   npm run build
   ```
   
   This creates the `dist` folder required by Plesk.

3. **Verify Build Success**
   - Check that `dist/index.js` exists
   - Check that `dist/client` folder exists

### Step 6: Configure Node.js Application in Plesk

1. **Application Settings**
   - **Document root**: `/httpdocs` (or your app folder)
   - **Application mode**: `production`
   - **Application URL**: Leave empty or set to `/`
   - **Application startup file**: `app.js`
   - **Node.js version**: 20.x or higher

2. **Additional nginx directives** (if needed):
   ```nginx
   location /api {
       proxy_pass http://127.0.0.1:$nodejs_port;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
   }
   
   location /ws {
       proxy_pass http://127.0.0.1:$nodejs_port;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "upgrade";
   }
   ```

3. **Click "Enable Node.js"**

### Step 7: Start the Application

1. **In Plesk Node.js Section**
   - Click **Restart App** button
   - Check **Application Status** - should show "Running"

2. **Check Logs**
   - Click **Show Logs** to view application logs
   - Look for "WhatsWay started under Plesk Passenger"

---

## Troubleshooting Plesk-Specific Issues

### Error: "Web application could not be started"

**Solution 1: Build Not Complete**
```bash
# SSH into server
cd /var/www/vhosts/yourdomain.com/httpdocs
npm run build
# Restart app in Plesk
```

**Solution 2: Wrong Node Version**
- Ensure Node.js 20.x is selected
- Not 18.x or lower

**Solution 3: Missing app.js**
- Verify `app.js` exists in root directory
- File must be exactly as provided

### Error: "Cannot find module"

**Solution**:
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm run build
```

### Error: Database Connection Failed

**Solution**:
1. Verify DATABASE_URL format:
   - PostgreSQL: `postgresql://user:pass@localhost:5432/db`
   - MySQL: `mysql://user:pass@localhost:3306/db`
2. Check database user has full permissions
3. Ensure database service is running

### Application Starts but Shows Blank Page

**Solution**:
1. Check if `dist/client` folder exists
2. Rebuild: `npm run build`
3. Check browser console for errors
4. Verify all environment variables are set

---

## Plesk-Specific Configuration Files

### app.js (Entry Point for Plesk)
This file is crucial for Plesk Passenger. It must:
1. Be in the root directory
2. Import from `dist/index.js`
3. Export the Express app

### Package.json Scripts
Ensure these scripts exist:
```json
{
  "scripts": {
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js"
  }
}
```

---

## Alternative: Using Plesk Git Extension

1. **Set Up Git Repository**
   - Install Plesk Git extension
   - Add repository URL
   - Configure deployment

2. **Auto-Deploy Script**
   Create `.plesk.yml`:
   ```yaml
   deployment:
     actions:
       - npm install
       - npm run build
   ```

3. **Deploy**
   - Push to repository
   - Plesk auto-deploys and builds

---

## Performance Optimization for Plesk

1. **Process Management**
   - Plesk Passenger handles process management
   - No need for PM2

2. **Resource Limits**
   - Set in Plesk → Service Plans
   - Minimum 2GB RAM recommended

3. **Monitoring**
   - Use Plesk monitoring tools
   - Check Node.js logs regularly

---

## Quick Checklist

Before starting the app in Plesk:

- [ ] Node.js 20.x selected
- [ ] `app.js` exists in root
- [ ] `npm install` completed
- [ ] `npm run build` completed successfully
- [ ] `dist` folder exists with `index.js`
- [ ] All environment variables set
- [ ] Database created and imported
- [ ] Application startup file set to `app.js`

---

## Support

If you continue to have issues:

1. **Check Logs**
   - Plesk → Node.js → Show Logs
   - Look for specific error messages

2. **Verify Build**
   ```bash
   ls -la dist/
   # Should show index.js and client folder
   ```

3. **Test Locally First**
   ```bash
   NODE_ENV=production node dist/index.js
   ```

4. **Contact Support**
   - Include Plesk version
   - Node.js version
   - Error messages from logs
   - Screenshot of Node.js settings

---

**Important**: The key to running WhatsWay on Plesk is ensuring the build process completes successfully and `app.js` properly exports the Express application for Phusion Passenger.

---

*Last Updated: January 2025*
*WhatsWay Version: 1.3.0*