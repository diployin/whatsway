import { drizzle } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { Pool as PgPool } from 'pg';
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Check if we're using Neon cloud database
const isNeonDatabase = process.env.DATABASE_URL?.includes('neon.tech') || 
                       process.env.DATABASE_URL?.includes('neon.build');

let pool: any;
let db: any;

if (isNeonDatabase) {
  // For Neon cloud database
  console.log('Using Neon cloud database driver');
  
  // Configure WebSocket for Neon cloud environment
  neonConfig.webSocketConstructor = ws;
  
  // Use fetch for queries in production to avoid SSL issues
  if (process.env.NODE_ENV === 'production') {
    neonConfig.poolQueryViaFetch = true;
  }
  
  pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
  db = drizzleNeon({ client: pool, schema });
} else {
  // For local/Docker PostgreSQL
  console.log('Using standard PostgreSQL driver for local database');
  
  pool = new PgPool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
}

export { pool, db };