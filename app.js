/**
 * WhatsWay Entry Point for Plesk
 * This file is specifically for Plesk Node.js Application support
 * Handles ES modules in a Plesk-compatible way
 */

// Use dynamic import to handle ES modules in CommonJS context
(async function startApp() {
  try {
    // Load environment variables
    const dotenv = require('dotenv');
    dotenv.config();

    // Set production environment for Plesk
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'production';
    }

    // Dynamic import for ES modules
    await import('./server/index.js');
    
    console.log('WhatsWay application started successfully on Plesk');
  } catch (error) {
    console.error('Failed to start WhatsWay application:', error);
    console.error('Stack trace:', error.stack);
    
    // Log specific Plesk-related information
    console.error('Node version:', process.version);
    console.error('Current directory:', process.cwd());
    console.error('Script directory:', __dirname);
    
    process.exit(1);
  }
})();