<?php
/**
 * Plesk-specific configuration helper for WhatsWay
 * This file helps configure the application for Plesk environments
 */

// Plesk-specific configuration
$pleskConfig = [
    'node_version' => '20.x',
    'startup_file' => 'plesk-start.js',
    'document_root' => 'httpdocs',
    'application_mode' => 'production'
];

/**
 * Generate Plesk-compatible package.json
 */
function generatePleskPackageJson($basePath) {
    $packagePath = $basePath . '/package.json';
    if (file_exists($packagePath)) {
        $package = json_decode(file_get_contents($packagePath), true);
        
        // Ensure main field points to Plesk starter
        if (!isset($package['main'])) {
            $package['main'] = 'plesk-start.js';
        }
        
        // Add Plesk-specific scripts if not present
        if (!isset($package['scripts']['plesk:start'])) {
            $package['scripts']['plesk:start'] = 'node plesk-start.js';
        }
        if (!isset($package['scripts']['plesk:build'])) {
            $package['scripts']['plesk:build'] = 'npm run build';
        }
        
        // Note: We can't actually modify package.json in Replit environment
        // This is for reference only
        return $package;
    }
    return null;
}

/**
 * Create Plesk .htaccess file
 */
function createPleskHtaccess($basePath) {
    $htaccessContent = '# Plesk Node.js Application Configuration
DirectoryIndex disabled

# Proxy all requests to Node.js application
RewriteEngine On

# Exclude static files
RewriteCond %{REQUEST_URI} !^/install
RewriteCond %{REQUEST_URI} !^/public
RewriteCond %{REQUEST_URI} !^/uploads

# Proxy to Node.js application
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://127.0.0.1:' . ($_ENV['PORT'] ?? '5000') . '/$1 [P,L]

# Security headers
<IfModule mod_headers.c>
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-Content-Type-Options "nosniff"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache control
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType text/css "access plus 1 week"
    ExpiresByType application/javascript "access plus 1 week"
</IfModule>';

    file_put_contents($basePath . '/.htaccess', $htaccessContent);
    return true;
}

/**
 * Create Plesk deployment instructions
 */
function createPleskInstructions($basePath) {
    $instructions = '# WhatsWay Plesk Deployment Instructions

## After Installation Completes:

### 1. Configure Node.js Application in Plesk

1. Go to **Websites & Domains** → **Node.js**
2. Click **Enable Node.js**
3. Configure as follows:
   - **Node.js version**: 20.x (or latest available)
   - **Document Root**: /httpdocs (or your installation path)
   - **Application Mode**: production
   - **Application Startup File**: plesk-start.js

### 2. Set Environment Variables

In the Node.js application settings, add these environment variables:
- `NODE_ENV`: production
- `PORT`: (leave as Plesk default or set to 5000)
- Copy all variables from your .env file

### 3. Install Dependencies & Build

1. Click **NPM Install** button in Plesk
2. In SSH/Terminal, navigate to application directory:
   ```bash
   cd /var/www/vhosts/yourdomain.com/httpdocs
   npm run build
   npm run db:push
   ```

### 4. Start Application

1. Click **Restart App** in Plesk Node.js panel
2. Check application logs for any errors

### 5. Configure Domain

1. Ensure your domain points to the application
2. Enable SSL certificate (Let\'s Encrypt recommended)
3. Test the application at https://yourdomain.com

## Troubleshooting

### If Application Won\'t Start:

1. **Check Logs**: 
   - Plesk Panel → Logs → Node.js Application Logs
   - SSH: `tail -f /var/log/passenger/passenger.log`

2. **Verify Build**:
   ```bash
   ls -la dist/
   ls -la client/dist/
   ```

3. **Test Manually**:
   ```bash
   node plesk-start.js
   ```

4. **Common Issues**:
   - Missing .env file → Copy from .env.example
   - Database connection → Verify DATABASE_URL
   - Port conflicts → Let Plesk assign port automatically
   - Memory limits → Increase in Plesk settings

### Alternative Startup Files:

If `plesk-start.js` doesn\'t work, try these in order:
1. `app.js`
2. `server.js`
3. `server/index.js` (after build)

### Getting Help:

1. Check application logs in Plesk
2. Review TECHNICAL_DOCUMENTATION.md
3. Verify all environment variables are set
4. Ensure PostgreSQL database is accessible
';

    file_put_contents($basePath . '/PLESK_DEPLOYMENT.md', $instructions);
    return true;
}

/**
 * Configure Plesk-specific settings
 */
function configurePleskEnvironment($config) {
    $envPath = dirname(__DIR__) . '/.env';
    
    // Read existing .env or create from example
    if (!file_exists($envPath) && file_exists(dirname(__DIR__) . '/.env.example')) {
        copy(dirname(__DIR__) . '/.env.example', $envPath);
    }
    
    if (file_exists($envPath)) {
        $envContent = file_get_contents($envPath);
        
        // Update with provided config
        $envVars = [
            'NODE_ENV' => 'production',
            'DATABASE_URL' => $config['db_connection'],
            'SESSION_SECRET' => $config['session_secret'],
            'ENCRYPTION_KEY' => $config['encryption_key'],
            'WHATSAPP_API_VERSION' => $config['whatsapp_version'] ?? 'v21.0',
            'WHATSAPP_WEBHOOK_VERIFY_TOKEN' => $config['webhook_token']
        ];
        
        foreach ($envVars as $key => $value) {
            if (!empty($value)) {
                if (strpos($envContent, $key . '=') !== false) {
                    $envContent = preg_replace('/^' . $key . '=.*$/m', $key . '="' . $value . '"', $envContent);
                } else {
                    $envContent .= "\n" . $key . '="' . $value . '"';
                }
            }
        }
        
        file_put_contents($envPath, $envContent);
    }
    
    return true;
}

// Export functions for use in installer
return [
    'config' => $pleskConfig,
    'generatePackageJson' => 'generatePleskPackageJson',
    'createHtaccess' => 'createPleskHtaccess',
    'createInstructions' => 'createPleskInstructions',
    'configureEnvironment' => 'configurePleskEnvironment'
];
?>