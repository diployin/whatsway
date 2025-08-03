#!/usr/bin/env node

/**
 * WhatsWay Universal Installer
 * Cross-platform installer that detects OS and runs appropriate script
 */

const { spawn } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

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

// Print colored output
const print = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`)
};

// ASCII Art Logo
const logo = `
${colors.green}
 __      __.__            __         __      __                
/  \\    /  \\  |__ _____ _/  |_  ____/  \\    /  \\_____  ___.__. 
\\   \\/\\/   /  |  \\\\__  \\\\   __\\/  ___/   \\/\\/   /\\__  \\<   |  |
 \\        /|   Y  \\/ __ \\|  |  \\___ \\\\        /  / __ \\\\___  |
  \\__/\\  / |___|  (____  /__| /____  >\\__/\\  /  (____  / ____|
       \\/       \\/     \\/          \\/      \\/        \\/\\/     
${colors.reset}`;

// Main installer function
async function main() {
  console.clear();
  console.log(logo);
  console.log('Welcome to WhatsWay - WhatsApp Business Platform Installer');
  console.log('==========================================================');
  console.log('');

  // Detect operating system
  const platform = os.platform();
  print.info(`Detected operating system: ${platform}`);
  console.log('');

  let installerScript;
  let command;
  let args = [];

  switch (platform) {
    case 'win32':
      installerScript = 'install.bat';
      command = 'cmd';
      args = ['/c', installerScript];
      break;
    
    case 'darwin':
    case 'linux':
      installerScript = 'install.sh';
      command = 'bash';
      args = [installerScript];
      
      // Make script executable
      try {
        fs.chmodSync(installerScript, '755');
      } catch (err) {
        print.warning('Could not make script executable');
      }
      break;
    
    default:
      print.error(`Unsupported operating system: ${platform}`);
      print.info('Please install manually following the instructions in INSTALL_README.md');
      process.exit(1);
  }

  // Check if installer script exists
  if (!fs.existsSync(installerScript)) {
    print.error(`Installer script not found: ${installerScript}`);
    print.info('Please ensure all installation files are present');
    process.exit(1);
  }

  // Run the appropriate installer
  print.info(`Running ${installerScript}...`);
  console.log('');

  const installer = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  });

  installer.on('error', (err) => {
    print.error(`Failed to run installer: ${err.message}`);
    process.exit(1);
  });

  installer.on('exit', (code) => {
    if (code !== 0) {
      print.error(`Installer exited with code ${code}`);
      process.exit(code);
    }
  });
}

// Run the installer
main().catch((err) => {
  print.error(`Installation failed: ${err.message}`);
  process.exit(1);
});