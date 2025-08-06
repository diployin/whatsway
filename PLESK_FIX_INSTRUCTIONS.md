# WhatsWay - Plesk Node.js Fix Instructions

## Quick Fix Steps

I've created a simplified setup for Plesk that should resolve your error. Follow these steps:

### Step 1: Upload New Files
Upload these new files to your Plesk directory:
- `app.js` - Simplified Plesk entry point
- `server.cjs` - CommonJS server file that Plesk can understand
- `plesk-install.sh` - Installation helper script

### Step 2: Connect via SSH or Plesk Terminal
```bash
cd /var/www/vhosts/yourdomain.com/httpdocs
```

### Step 3: Run Installation Script
```bash
chmod +x plesk-install.sh
./plesk-install.sh
```

Or manually run these commands:
```bash
# Install dependencies
npm install --production

# Build the client
npx vite build

# Create dist directory structure
mkdir -p dist/client

# Copy client files
cp -r client/dist/* dist/client/
```

### Step 4: Configure in Plesk Panel

1. **Go to Node.js Settings**
   - Domain → Node.js

2. **Set These EXACT Values:**
   - **Application root**: `/httpdocs` (or your directory)
   - **Application startup file**: `app.js` (NOT server/index.ts)
   - **Node.js version**: 20.x or higher (CRITICAL)
   - **Application mode**: `production`

3. **Environment Variables** (Click "Environment variables"):
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://username:password@localhost:5432/whatsway_db
   SESSION_SECRET=your-secret-key-at-least-32-characters-long
   ```

### Step 5: Restart Application
Click **"Restart App"** button

## What Changed

I've created a simpler setup that Plesk can understand:

1. **app.js** - Now uses pure CommonJS (require/module.exports)
2. **server.cjs** - A CommonJS server file with basic functionality
3. No complex ES modules or TypeScript compilation needed

## If Still Getting Errors

### Option A: Test Directly
SSH into your server and test:
```bash
node app.js
```
This will show you any specific errors.

### Option B: Check Logs
In Plesk → Node.js → **Show Logs**
Look for specific error messages.

### Option C: Minimal Test
Create a test file `test.js`:
```javascript
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Test OK'));
module.exports = app;
```

Set this as your startup file in Plesk. If this works, the issue is with dependencies.

## Common Plesk Issues & Solutions

### Error: Cannot find module 'express'
**Solution:**
```bash
npm install express --save
```

### Error: Cannot find module 'dotenv'
**Solution:**
```bash
npm install dotenv --save
```

### Error: EACCES permission denied
**Solution:**
```bash
chmod -R 755 .
chmod 644 package.json
```

### Error: Application could not be started (Generic)
**Solution:**
1. Check Node.js version is 20.x
2. Verify `app.js` exists and is readable
3. Check environment variables are set
4. Test with: `node app.js`

## Alternative: Simplest Possible Setup

If nothing else works, use this minimal `app.js`:

```javascript
const express = require('express');
const path = require('path');
const app = express();

// Basic middleware
app.use(express.json());
app.use(express.static('public'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Catch all
app.get('*', (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>WhatsWay Running on Plesk</h1>
        <p>Server is working. Build the full application to enable all features.</p>
      </body>
    </html>
  `);
});

module.exports = app;
```

This will at least get your app running, then you can add features incrementally.

## Need More Help?

1. **Send me the error logs from:**
   - Plesk → Node.js → Show Logs
   - SSH: `cat /var/www/vhosts/yourdomain.com/logs/error_log`

2. **Tell me your:**
   - Plesk version
   - Node.js version selected
   - Operating system

3. **Try the test.js file first** to confirm Plesk Node.js is working

The key is that Plesk needs a simple CommonJS file that exports an Express app. The new `app.js` and `server.cjs` files provide exactly that.