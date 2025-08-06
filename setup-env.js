#!/usr/bin/env node

/**
 * WhatsWay Environment Setup Helper
 * Interactive configuration for .env file
 */

const fs = require('fs');
const readline = require('readline');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const generateSecret = (length = 32) => {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
};

async function setupEnvironment() {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║      WhatsWay Environment Configuration       ║');
  console.log('╚══════════════════════════════════════════════╝\n');
  
  const config = {};
  
  // Server Configuration
  console.log('=== Server Configuration ===');
  config.NODE_ENV = 'production';
  config.PORT = await question('Server Port (5000): ') || '5000';
  config.APP_URL = await question('Application URL (https://your-domain.com): ') || 'http://localhost:5000';
  
  // Database Configuration
  console.log('\n=== Database Configuration ===');
  console.log('1. PostgreSQL (Neon) - Cloud Database');
  console.log('2. PostgreSQL (Local) - Local Database');
  console.log('3. Custom DATABASE_URL');
  
  const dbChoice = await question('Select database option (1-3): ');
  
  switch (dbChoice) {
    case '1':
      config.DATABASE_URL = await question('Enter Neon DATABASE_URL: ');
      break;
    case '2':
      const dbHost = await question('Database Host (localhost): ') || 'localhost';
      const dbPort = await question('Database Port (5432): ') || '5432';
      const dbName = await question('Database Name (whatsway_db): ') || 'whatsway_db';
      const dbUser = await question('Database User (whatsway_user): ') || 'whatsway_user';
      const dbPass = await question('Database Password: ');
      config.DATABASE_URL = `postgresql://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`;
      break;
    case '3':
      config.DATABASE_URL = await question('Enter complete DATABASE_URL: ');
      break;
    default:
      console.log('Invalid choice, using default local database');
      config.DATABASE_URL = 'postgresql://user:password@localhost:5432/whatsway_db';
  }
  
  // Session Configuration
  console.log('\n=== Session Configuration ===');
  const autoGenerateSecret = await question('Auto-generate session secret? (Y/n): ');
  if (autoGenerateSecret.toLowerCase() !== 'n') {
    config.SESSION_SECRET = generateSecret(64);
    console.log('✓ Session secret generated');
  } else {
    config.SESSION_SECRET = await question('Enter session secret (min 32 chars): ');
  }
  
  // WhatsApp Configuration
  console.log('\n=== WhatsApp Business API Configuration ===');
  const hasWhatsApp = await question('Do you have WhatsApp API credentials? (y/N): ');
  
  if (hasWhatsApp.toLowerCase() === 'y') {
    config.WHATSAPP_API_VERSION = await question('API Version (v23.0): ') || 'v23.0';
    config.WHATSAPP_BUSINESS_ACCOUNT_ID = await question('Business Account ID: ');
    config.WHATSAPP_ACCESS_TOKEN = await question('Access Token: ');
    config.WHATSAPP_PHONE_NUMBER_ID = await question('Phone Number ID: ');
    config.WHATSAPP_WEBHOOK_VERIFY_TOKEN = await question('Webhook Verify Token: ') || generateSecret(16);
  } else {
    console.log('⚠ WhatsApp API credentials can be added later to .env file');
    config.WHATSAPP_API_VERSION = 'v23.0';
    config.WHATSAPP_BUSINESS_ACCOUNT_ID = '';
    config.WHATSAPP_ACCESS_TOKEN = '';
    config.WHATSAPP_PHONE_NUMBER_ID = '';
    config.WHATSAPP_WEBHOOK_VERIFY_TOKEN = generateSecret(16);
  }
  
  // Optional Email Configuration
  console.log('\n=== Email Configuration (Optional) ===');
  const hasEmail = await question('Configure email notifications? (y/N): ');
  
  if (hasEmail.toLowerCase() === 'y') {
    config.SMTP_HOST = await question('SMTP Host (smtp.gmail.com): ') || 'smtp.gmail.com';
    config.SMTP_PORT = await question('SMTP Port (587): ') || '587';
    config.SMTP_USER = await question('SMTP User/Email: ');
    config.SMTP_PASS = await question('SMTP Password: ');
  }
  
  // Generate .env file
  let envContent = '# WhatsWay Environment Configuration\n';
  envContent += '# Generated: ' + new Date().toISOString() + '\n\n';
  
  // Server Configuration
  envContent += '# Server Configuration\n';
  envContent += `NODE_ENV=${config.NODE_ENV}\n`;
  envContent += `PORT=${config.PORT}\n`;
  envContent += `APP_URL=${config.APP_URL}\n\n`;
  
  // Database Configuration
  envContent += '# Database Configuration\n';
  envContent += `DATABASE_URL=${config.DATABASE_URL}\n\n`;
  
  // Session Configuration
  envContent += '# Session Configuration\n';
  envContent += `SESSION_SECRET=${config.SESSION_SECRET}\n\n`;
  
  // WhatsApp Configuration
  envContent += '# WhatsApp Business API Configuration\n';
  envContent += `WHATSAPP_API_VERSION=${config.WHATSAPP_API_VERSION}\n`;
  envContent += `WHATSAPP_BUSINESS_ACCOUNT_ID=${config.WHATSAPP_BUSINESS_ACCOUNT_ID}\n`;
  envContent += `WHATSAPP_ACCESS_TOKEN=${config.WHATSAPP_ACCESS_TOKEN}\n`;
  envContent += `WHATSAPP_PHONE_NUMBER_ID=${config.WHATSAPP_PHONE_NUMBER_ID}\n`;
  envContent += `WHATSAPP_WEBHOOK_VERIFY_TOKEN=${config.WHATSAPP_WEBHOOK_VERIFY_TOKEN}\n`;
  
  // Optional Email Configuration
  if (config.SMTP_HOST) {
    envContent += '\n# Email Configuration\n';
    envContent += `SMTP_HOST=${config.SMTP_HOST}\n`;
    envContent += `SMTP_PORT=${config.SMTP_PORT}\n`;
    envContent += `SMTP_USER=${config.SMTP_USER}\n`;
    envContent += `SMTP_PASS=${config.SMTP_PASS}\n`;
  }
  
  // Save .env file
  const saveEnv = await question('\nSave configuration to .env file? (Y/n): ');
  if (saveEnv.toLowerCase() !== 'n') {
    // Backup existing .env if it exists
    if (fs.existsSync('.env')) {
      const backup = `.env.backup.${Date.now()}`;
      fs.renameSync('.env', backup);
      console.log(`✓ Existing .env backed up to ${backup}`);
    }
    
    fs.writeFileSync('.env', envContent);
    console.log('✓ Configuration saved to .env file');
  } else {
    console.log('\n=== Copy this configuration to your .env file ===\n');
    console.log(envContent);
  }
  
  // Display summary
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║         Configuration Complete!                ║');
  console.log('╚══════════════════════════════════════════════╝\n');
  
  console.log('Next Steps:');
  console.log('1. Run: npm install');
  console.log('2. Run: npm run build');
  console.log('3. Run: npm start');
  console.log('\nDefault Admin Credentials:');
  console.log('Username: whatsway');
  console.log('Password: Admin@123');
  
  if (!config.WHATSAPP_ACCESS_TOKEN) {
    console.log('\n⚠ Remember to add WhatsApp API credentials to .env file');
  }
  
  if (config.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    console.log(`\n📌 Webhook URL: ${config.APP_URL}/webhook`);
    console.log(`📌 Webhook Verify Token: ${config.WHATSAPP_WEBHOOK_VERIFY_TOKEN}`);
  }
  
  rl.close();
}

// Run setup
setupEnvironment().catch(console.error);