<<<<<<< HEAD
import * as schema from "@shared/schema";
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres';
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { Pool as PgPool } from 'pg';
import ws from "ws";
=======
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

<<<<<<< HEAD
// Detect if using Neon database (contains 'neon' in the URL)
const isNeonDatabase = process.env.DATABASE_URL.includes('neon.tech') || 
                       process.env.DATABASE_URL.includes('neon.') ||
                       process.env.USE_NEON === 'true';

let pool: NeonPool | PgPool;
let db: ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzleNode>;

if (isNeonDatabase) {
  console.log('Using Neon database connection');
  
  // Configure WebSocket for Neon
  neonConfig.webSocketConstructor = ws;
  
  // Disable WebSocket pooling in production to avoid SSL issues
  if (process.env.NODE_ENV === 'production') {
    neonConfig.poolQueryViaFetch = true;
  }
  
  pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
  db = drizzleNeon({ client: pool as NeonPool, schema });
} else {
  console.log('Using standard PostgreSQL connection');
  
  // Parse DATABASE_URL to handle SSL configuration
  const connectionConfig: any = {
    connectionString: process.env.DATABASE_URL,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
  
  // For local databases or servers with self-signed certificates
  if (process.env.DATABASE_URL.includes('localhost') || 
      process.env.DATABASE_URL.includes('127.0.0.1') ||
      process.env.DB_SSL_MODE === 'disable') {
    connectionConfig.ssl = false;
  } else if (process.env.DB_SSL_MODE === 'require') {
    connectionConfig.ssl = {
      rejectUnauthorized: false // Accept self-signed certificates
    };
  } else {
    // Auto-detect SSL requirement
    connectionConfig.ssl = process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false;
  }
  
  pool = new PgPool(connectionConfig);
  db = drizzleNode(pool as PgPool, { schema });
}

// Test database connection
pool.connect()
  .then(client => {
    console.log('✅ Successfully connected to the database');
    client.release();
  })
  .catch(err => {
    console.error('❌ Failed to connect to the database:', err);
    console.error('Connection string pattern:', process.env.DATABASE_URL?.replace(/\/\/[^@]+@/, '//***:***@'));
  });

export { pool, db };
=======
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
