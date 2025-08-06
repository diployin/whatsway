/**
 * Plesk Node.js Application Entry Point
 * This file is specifically for Plesk Phusion Passenger
 * Must be CommonJS format for Plesk compatibility
 */

// Load the server.cjs file directly
const app = require('./server.cjs');

// Export for Plesk Passenger
module.exports = app;

console.log('WhatsWay app.js loaded for Plesk');