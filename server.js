#!/usr/bin/env node
/**
 * WhatsWay Production Server Entry Point
 * Compatible with Plesk, cPanel, and other hosting environments
 */

// Use dynamic import to handle ES modules
(async () => {
  try {
    // Load environment variables
    const dotenv = await import('dotenv');
    dotenv.config();

    // Set production environment if not set
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'production';
    }

    // Import and start the server
    await import('./server/index.js');
    
    console.log('WhatsWay server started successfully');
  } catch (error) {
    console.error('Failed to start WhatsWay server:', error);
    process.exit(1);
  }
})();