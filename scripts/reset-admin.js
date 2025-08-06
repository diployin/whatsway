#!/usr/bin/env node

/**
 * Reset Admin User Script for WhatsWay
 * Run this script to create or reset the admin user
 */

const bcrypt = require('bcryptjs');
const { Pool } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const { sql } = require('drizzle-orm');

// Load environment variables
require('dotenv').config();

async function resetAdmin() {
  console.log('WhatsWay Admin User Reset Script');
  console.log('=================================');
  
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable not set');
    process.exit(1);
  }

  try {
    // Connect to database
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle({ client: pool });
    
    // Hash the default password
    const defaultPassword = 'Admin@123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    // Check if admin user exists
    const existingUsers = await db.execute(
      sql`SELECT id, username FROM users WHERE username = 'whatsway'`
    );
    
    if (existingUsers.rows.length > 0) {
      // Update existing admin user
      console.log('Updating existing admin user...');
      await db.execute(
        sql`UPDATE users 
            SET password = ${hashedPassword},
                status = 'active',
                role = 'admin',
                updated_at = NOW()
            WHERE username = 'whatsway'`
      );
      console.log('✓ Admin user password reset successfully');
    } else {
      // Create new admin user
      console.log('Creating new admin user...');
      await db.execute(
        sql`INSERT INTO users (
              username, 
              password, 
              email, 
              first_name, 
              last_name, 
              role, 
              status,
              permissions,
              created_at,
              updated_at
            ) VALUES (
              'whatsway',
              ${hashedPassword},
              'admin@whatsway.com',
              'Admin',
              'User',
              'admin',
              'active',
              '{"dashboard":{"view":true,"edit":true},"contacts":{"view":true,"create":true,"edit":true,"delete":true,"import":true,"export":true},"campaigns":{"view":true,"create":true,"edit":true,"delete":true,"send":true},"templates":{"view":true,"create":true,"edit":true,"delete":true,"sync":true},"inbox":{"view":true,"send":true,"assign":true},"automation":{"view":true,"create":true,"edit":true,"delete":true,"activate":true},"channels":{"view":true,"create":true,"edit":true,"delete":true},"team":{"view":true,"create":true,"edit":true,"delete":true},"settings":{"view":true,"edit":true},"api":{"view":true,"create":true}}',
              NOW(),
              NOW()
            )`
      );
      console.log('✓ Admin user created successfully');
    }
    
    console.log('\n=================================');
    console.log('Admin Login Credentials:');
    console.log('Username: whatsway');
    console.log('Password: Admin@123');
    console.log('=================================');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    
    // Close connection
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('ERROR:', error);
    process.exit(1);
  }
}

// Run the script
resetAdmin();