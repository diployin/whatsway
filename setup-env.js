#!/usr/bin/env node

/**
 * WhatsWay Environment Setup Helper
 * Interactive setup for .env configuration
 */

const fs = require('fs');
const readline = require('readline');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask questions
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Generate secure random string
const generateSecret = () => crypto.randomBytes(32).toString('hex');

// Main setup function
async function setupEnvironment() {
  console.log('\n🔧 WhatsWay Environment Configuration\n');

  // Check if .env exists
  if (fs.existsSync('.env')) {
    const overwrite = await question('.env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      process.exit(0);
    }
    // Backup existing .env
    fs.copyFileSync('.env', '.env.backup');
    console.log('✓ Backed up existing .env to .env.backup\n');
  }

  console.log('Please provide the following configuration:\n');

  // Collect configuration
  const config = {
    // Session
    SESSION_SECRET: generateSecret(),

    // Database
    DATABASE_URL: await question('PostgreSQL DATABASE_URL (press Enter for local default): ') || 
                  'postgresql://postgres:postgres@localhost:5432/whatsway',

    // WhatsApp API
    WHATSAPP_BUSINESS_ACCOUNT_ID: await question('WhatsApp Business Account ID: '),
    WHATSAPP_ACCESS_TOKEN: await question('WhatsApp Access Token: '),
    WHATSAPP_PHONE_NUMBER_ID: await question('WhatsApp Phone Number ID: '),
    WEBHOOK_VERIFY_TOKEN: await question('Webhook Verify Token (any secret string): '),
    WHATSAPP_API_VERSION: 'v23.0',

    // MM Lite (Optional)
    MM_LITE_API_URL: await question('MM Lite API URL (optional, press Enter to skip): ') || '',
    MM_LITE_API_KEY: await question('MM Lite API Key (optional, press Enter to skip): ') || '',

    // Application
    APP_URL: await question('Application URL (press Enter for default): ') || 'http://localhost:5173',
    CORS_ORIGIN: await question('CORS Origin (press Enter for default): ') || 'http://localhost:5173',

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: '60000',
    RATE_LIMIT_MAX_REQUESTS: '100',

    // Logging
    LOG_LEVEL: 'info'
  };

  // Generate .env content
  const envContent = `# WhatsWay Environment Configuration
# Generated on ${new Date().toISOString()}

# Session Configuration
SESSION_SECRET=${config.SESSION_SECRET}

# Database Configuration
DATABASE_URL=${config.DATABASE_URL}

# WhatsApp Business API Configuration
WHATSAPP_BUSINESS_ACCOUNT_ID=${config.WHATSAPP_BUSINESS_ACCOUNT_ID}
WHATSAPP_ACCESS_TOKEN=${config.WHATSAPP_ACCESS_TOKEN}
WHATSAPP_PHONE_NUMBER_ID=${config.WHATSAPP_PHONE_NUMBER_ID}
WEBHOOK_VERIFY_TOKEN=${config.WEBHOOK_VERIFY_TOKEN}
WHATSAPP_API_VERSION=${config.WHATSAPP_API_VERSION}

# MM Lite API Configuration (Optional - for high-volume messaging)
MM_LITE_API_URL=${config.MM_LITE_API_URL}
MM_LITE_API_KEY=${config.MM_LITE_API_KEY}

# Application Configuration
APP_URL=${config.APP_URL}
CORS_ORIGIN=${config.CORS_ORIGIN}

# Rate Limiting
RATE_LIMIT_WINDOW_MS=${config.RATE_LIMIT_WINDOW_MS}
RATE_LIMIT_MAX_REQUESTS=${config.RATE_LIMIT_MAX_REQUESTS}

# Logging
LOG_LEVEL=${config.LOG_LEVEL}

# Object Storage (Set by Replit)
# These will be automatically configured when you set up object storage
# PUBLIC_OBJECT_SEARCH_PATHS=
# PRIVATE_OBJECT_DIR=
# DEFAULT_OBJECT_STORAGE_BUCKET_ID=
`;

  // Write .env file
  fs.writeFileSync('.env', envContent);
  console.log('\n✓ Environment configuration saved to .env\n');

  // Display webhook information
  console.log('📌 Webhook Configuration Instructions:\n');
  console.log('1. Go to your Meta App Dashboard');
  console.log('2. Navigate to WhatsApp > Configuration');
  console.log('3. Set the following:\n');
  console.log(`   Webhook URL: ${config.APP_URL}/api/webhook`);
  console.log(`   Verify Token: ${config.WEBHOOK_VERIFY_TOKEN}\n`);
  console.log('4. Subscribe to these webhook fields:');
  console.log('   - messages');
  console.log('   - message_status');
  console.log('   - message_template_status_update\n');

  rl.close();
}

// Run setup
setupEnvironment().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});