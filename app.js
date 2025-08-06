/**
 * WhatsWay Entry Point for Plesk
 * This file is specifically for Plesk Node.js Application support
 * It uses CommonJS format for compatibility
 */

// Load environment variables
require('dotenv').config();

// Start the application
require('./server/index.js');