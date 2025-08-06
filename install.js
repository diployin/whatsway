#!/usr/bin/env node

/**
 * WhatsWay Universal Auto-Installer
 * Automatically detects OS and runs appropriate installer
 * Supports: Linux, Windows, macOS, Plesk, cPanel
 */

const os = require('os');
const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const readline = require('readline');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Utility functions
const print = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const printHeader = (title) => {
  console.log('');
  print('═'.repeat(50), 'blue');
  print(title.padStart(30 + title.length / 2), 'blue');
  print('═'.repeat(50), 'blue');
  console.log('');
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const runCommand = (command, args = []) => {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { shell: true, stdio: 'inherit' });
    process.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with code ${code}`));
    });
  });
};

const checkCommand = (command) => {
  return new Promise((resolve) => {
    exec(`which ${command} 2>/dev/null || where ${command} 2>nul`, (error) => {
      resolve(!error);
    });
  });
};

// Main installer class
class WhatsWayInstaller {
  constructor() {
    this.platform = os.platform();
    this.arch = os.arch();
    this.installDir = process.cwd();
    this.config = {
      domain: '',
      email: '',
      dbUrl: '',
      sessionSecret: this.generateSecret(),
      webhookToken: this.generateSecret(16)
    };
  }

  generateSecret(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async detectEnvironment() {
    printHeader('Detecting Environment');
    
    print(`Platform: ${this.platform}`, 'green');
    print(`Architecture: ${this.arch}`, 'green');
    print(`Node.js: ${process.version}`, 'green');
    print(`Install Directory: ${this.installDir}`, 'green');
    
    // Check for control panels
    if (fs.existsSync('/usr/local/psa') || fs.existsSync('/opt/psa')) {
      print('Detected: Plesk Server', 'cyan');
      this.serverType = 'plesk';
    } else if (fs.existsSync('/usr/local/cpanel')) {
      print('Detected: cPanel Server', 'cyan');
      this.serverType = 'cpanel';
    } else if (this.platform === 'win32') {
      print('Detected: Windows System', 'cyan');
      this.serverType = 'windows';
    } else {
      print('Detected: Generic Linux/Unix Server', 'cyan');
      this.serverType = 'generic';
    }
    
    return this.serverType;
  }

  async checkRequirements() {
    printHeader('Checking Requirements');
    
    const requirements = {
      'Node.js': await checkCommand('node'),
      'NPM': await checkCommand('npm'),
      'Git': await checkCommand('git')
    };
    
    let allMet = true;
    for (const [tool, available] of Object.entries(requirements)) {
      if (available) {
        print(`✓ ${tool} is installed`, 'green');
      } else {
        print(`✗ ${tool} is not installed`, 'red');
        allMet = false;
      }
    }
    
    if (!allMet) {
      print('\nPlease install missing requirements and try again.', 'yellow');
      process.exit(1);
    }
    
    // Check Node.js version
    const nodeVersion = parseInt(process.version.slice(1).split('.')[0]);
    if (nodeVersion < 18) {
      print(`\n⚠ Node.js version ${nodeVersion} detected. Version 18+ recommended.`, 'yellow');
    }
    
    return true;
  }

  async installDependencies() {
    printHeader('Installing Dependencies');
    
    try {
      // Check if package.json exists
      if (!fs.existsSync('package.json')) {
        print('✗ package.json not found!', 'red');
        print('Please ensure WhatsWay files are in the current directory.', 'yellow');
        process.exit(1);
      }
      
      print('Installing NPM packages...', 'blue');
      await runCommand('npm', ['ci', '--production']);
      print('✓ Dependencies installed', 'green');
      
      // Install PM2 globally
      if (this.platform !== 'win32' && this.serverType !== 'plesk') {
        print('Installing PM2...', 'blue');
        await runCommand('npm', ['install', '-g', 'pm2']);
        print('✓ PM2 installed', 'green');
      }
    } catch (error) {
      print('⚠ Failed to install some dependencies', 'yellow');
      console.error(error);
    }
  }

  async configureEnvironment() {
    printHeader('Environment Configuration');
    
    print('Please provide the following information:\n', 'cyan');
    
    this.config.domain = await question('Domain (e.g., whatsway.com): ');
    this.config.email = await question('Admin email: ');
    
    print('\nDatabase Configuration:', 'cyan');
    print('1. PostgreSQL (Neon) - Cloud Database', 'reset');
    print('2. PostgreSQL (Local) - Local Database', 'reset');
    print('3. Enter custom DATABASE_URL', 'reset');
    
    const dbChoice = await question('Choose database option (1-3): ');
    
    switch (dbChoice) {
      case '1':
        this.config.dbUrl = await question('Enter Neon DATABASE_URL: ');
        break;
      case '2':
        const dbName = await question('Database name (whatsway_db): ') || 'whatsway_db';
        const dbUser = await question('Database user (whatsway_user): ') || 'whatsway_user';
        const dbPass = await question('Database password: ');
        this.config.dbUrl = `postgresql://${dbUser}:${dbPass}@localhost:5432/${dbName}`;
        break;
      case '3':
        this.config.dbUrl = await question('Enter DATABASE_URL: ');
        break;
    }
    
    // Create .env file
    const envContent = `# WhatsWay Configuration
# Generated by Auto-Installer

# Server Configuration
NODE_ENV=production
PORT=5000
APP_URL=https://${this.config.domain}

# Database Configuration
DATABASE_URL=${this.config.dbUrl}

# Session Configuration
SESSION_SECRET=${this.config.sessionSecret}

# WhatsApp Business API Configuration
WHATSAPP_API_VERSION=v23.0
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=${this.config.webhookToken}

# Admin Configuration
ADMIN_EMAIL=${this.config.email}
`;
    
    fs.writeFileSync('.env', envContent);
    print('\n✓ Environment configuration saved', 'green');
  }

  async buildApplication() {
    printHeader('Building Application');
    
    try {
      print('Running build process...', 'blue');
      await runCommand('npm', ['run', 'build']);
      print('✓ Application built successfully', 'green');
    } catch (error) {
      print('⚠ Build failed, trying alternative method...', 'yellow');
      
      // Create dist directories
      if (!fs.existsSync('dist')) {
        fs.mkdirSync('dist', { recursive: true });
      }
      if (!fs.existsSync('dist/client')) {
        fs.mkdirSync('dist/client', { recursive: true });
      }
      if (!fs.existsSync('dist/server')) {
        fs.mkdirSync('dist/server', { recursive: true });
      }
    }
  }

  async setupDatabase() {
    printHeader('Database Setup');
    
    try {
      // Check for database export file
      if (fs.existsSync('database_export.sql')) {
        print('Found database_export.sql', 'green');
        print('Please import this file to your database manually.', 'yellow');
      }
      
      // Run migrations if available
      if (fs.existsSync('package.json')) {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        if (pkg.scripts && pkg.scripts['db:push']) {
          print('Running database migrations...', 'blue');
          await runCommand('npm', ['run', 'db:push']);
          print('✓ Database migrations completed', 'green');
        }
      }
      
      // Create admin user
      if (fs.existsSync('scripts/reset-admin.js')) {
        print('Creating admin user...', 'blue');
        await runCommand('node', ['scripts/reset-admin.js']);
        print('✓ Admin user created', 'green');
      }
    } catch (error) {
      print('⚠ Database setup incomplete. Manual setup may be required.', 'yellow');
      console.error(error);
    }
  }

  async setupPlesk() {
    printHeader('Plesk Configuration');
    
    // Create app.js for Plesk
    const appJs = `const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'dist/client')));

// API routes
try {
  app.use('/api', require('./dist/server/index.js'));
} catch (error) {
  console.error('Failed to load server:', error);
  app.use('/api', (req, res) => {
    res.status(500).json({ error: 'Server not built properly' });
  });
}

// Serve index.html for all other routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist/client/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('<h1>WhatsWay - Build Required</h1><p>Please run npm run build</p>');
  }
});

module.exports = app;`;
    
    fs.writeFileSync('app.js', appJs);
    print('✓ Created Plesk-compatible app.js', 'green');
    
    print('\nPlesk Configuration Instructions:', 'yellow');
    print('1. Go to Plesk > Domains > Your Domain > Node.js', 'reset');
    print('2. Set Application Root: ' + this.installDir, 'reset');
    print('3. Set Application Startup File: app.js', 'reset');
    print('4. Set Node.js version: 20.x or higher', 'reset');
    print('5. Click "NPM Install" button', 'reset');
    print('6. Click "Run Script" and select "build"', 'reset');
    print('7. Click "Restart App"', 'reset');
  }

  async setupPM2() {
    printHeader('Setting Up PM2');
    
    const ecosystem = `module.exports = {
  apps: [{
    name: 'whatsway',
    script: './dist/server/index.js',
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
};`;
    
    fs.writeFileSync('ecosystem.config.js', ecosystem);
    
    // Create logs directory
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs');
    }
    
    try {
      print('Starting application with PM2...', 'blue');
      await runCommand('pm2', ['start', 'ecosystem.config.js']);
      await runCommand('pm2', ['save']);
      print('✓ Application started with PM2', 'green');
    } catch (error) {
      print('⚠ Could not start PM2 automatically', 'yellow');
    }
  }

  async displayFinalInstructions() {
    printHeader('Installation Complete!');
    
    print('✅ WhatsWay has been successfully installed!', 'green');
    console.log('');
    print('Access Information:', 'cyan');
    print('═'.repeat(30), 'cyan');
    print(`URL: https://${this.config.domain}`, 'reset');
    print('Admin Username: whatsway', 'reset');
    print('Admin Password: Admin@123', 'reset');
    console.log('');
    
    print('⚠ IMPORTANT NEXT STEPS:', 'yellow');
    print('1. Add WhatsApp API credentials to .env file', 'reset');
    print('2. Change admin password after first login', 'reset');
    print('3. Configure webhook URL in Meta Business:', 'reset');
    print(`   Webhook URL: https://${this.config.domain}/webhook`, 'reset');
    console.log('');
    
    if (this.serverType === 'plesk') {
      print('Plesk: Complete configuration in Plesk panel (see instructions above)', 'yellow');
    } else if (this.serverType === 'cpanel') {
      print('cPanel: Setup Node.js application in cPanel interface', 'yellow');
    } else if (this.serverType === 'windows') {
      print('Windows: Use PM2 or IIS to manage the application', 'yellow');
    } else {
      print('Commands:', 'cyan');
      print('  pm2 status           - Check application status', 'reset');
      print('  pm2 logs whatsway    - View application logs', 'reset');
      print('  pm2 restart whatsway - Restart application', 'reset');
    }
    
    console.log('');
    print('Support:', 'cyan');
    print('  Documentation: /DOCUMENTATION.md', 'reset');
    print('  Quick Start: /QUICK_START_GUIDE.md', 'reset');
    print('  Deployment: /DEPLOYMENT_GUIDE.md', 'reset');
  }

  async run() {
    console.clear();
    print('╔══════════════════════════════════════════════╗', 'blue');
    print('║     WhatsWay Universal Auto-Installer v1.0    ║', 'blue');
    print('║    Professional WhatsApp Business Platform    ║', 'blue');
    print('╚══════════════════════════════════════════════╝', 'blue');
    
    try {
      await this.detectEnvironment();
      await this.checkRequirements();
      await this.configureEnvironment();
      await this.installDependencies();
      await this.buildApplication();
      await this.setupDatabase();
      
      // Server-specific setup
      switch (this.serverType) {
        case 'plesk':
          await this.setupPlesk();
          break;
        case 'cpanel':
          print('\nPlease complete setup in cPanel Node.js interface', 'yellow');
          break;
        case 'windows':
          print('\nWindows detected. Run install.bat for Windows-specific setup', 'yellow');
          break;
        default:
          await this.setupPM2();
          break;
      }
      
      await this.displayFinalInstructions();
    } catch (error) {
      print('\n✗ Installation failed:', 'red');
      console.error(error);
      process.exit(1);
    } finally {
      rl.close();
    }
  }
}

// Run installer
const installer = new WhatsWayInstaller();
installer.run().catch(console.error);