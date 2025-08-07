#!/usr/bin/env node
/**
 * Plesk-specific starter script for WhatsWay
 * This handles the build process and proper module loading for Plesk environments
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Check if we're in the right directory
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('ERROR: package.json not found. Please ensure you are in the WhatsWay root directory.');
  process.exit(1);
}

// Check if dist directory exists (indicates build has been done)
const distPath = path.join(process.cwd(), 'dist');
const clientDistPath = path.join(process.cwd(), 'client', 'dist');

async function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    const proc = spawn(command, args, { 
      stdio: 'inherit',
      shell: true,
      env: { ...process.env }
    });
    
    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with code ${code}`));
      } else {
        resolve();
      }
    });
    
    proc.on('error', (err) => {
      reject(err);
    });
  });
}

async function startApplication() {
  try {
    console.log('WhatsWay Plesk Starter - Initializing...');
    console.log('Node version:', process.version);
    console.log('Current directory:', process.cwd());
    
    // Load environment variables
    require('dotenv').config();
    
    // Check if build is needed
    if (!fs.existsSync(distPath) || !fs.existsSync(clientDistPath)) {
      console.log('Build files not found. Running build process...');
      console.log('This may take a few minutes on first run...');
      
      try {
        // Install dependencies if node_modules doesn't exist
        if (!fs.existsSync('node_modules')) {
          console.log('Installing dependencies...');
          await runCommand('npm', ['install']);
        }
        
        // Run the build
        console.log('Building application...');
        await runCommand('npm', ['run', 'build']);
        console.log('Build completed successfully!');
      } catch (buildError) {
        console.error('Build failed:', buildError);
        console.log('Attempting to start without build (development mode)...');
      }
    }
    
    // Set production environment
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'production';
    }
    
    // Try to start with the built version first
    if (fs.existsSync(path.join(distPath, 'index.js'))) {
      console.log('Starting WhatsWay from built files...');
      require(path.join(distPath, 'index.js'));
    } else {
      // Fallback to direct import
      console.log('Starting WhatsWay in compatibility mode...');
      
      // Use dynamic import for ES modules
      const startServer = async () => {
        try {
          await import('./server/index.js');
          console.log('WhatsWay server started successfully!');
        } catch (importError) {
          console.error('Failed to import server:', importError);
          
          // Last resort - try TSX if available
          console.log('Attempting to start with TSX...');
          const tsx = spawn('npx', ['tsx', 'server/index.ts'], {
            stdio: 'inherit',
            env: { ...process.env, NODE_ENV: 'production' }
          });
          
          tsx.on('error', (err) => {
            console.error('Failed to start with TSX:', err);
            process.exit(1);
          });
        }
      };
      
      await startServer();
    }
    
  } catch (error) {
    console.error('Fatal error starting WhatsWay:', error);
    console.error('Stack trace:', error.stack);
    
    // Provide helpful error messages for common issues
    if (error.message.includes('Cannot find module')) {
      console.error('\nDependencies may be missing. Try running: npm install');
    }
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\nDatabase connection failed. Please check your DATABASE_URL in .env file');
    }
    
    process.exit(1);
  }
}

// Start the application
startApplication();