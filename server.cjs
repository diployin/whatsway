/**
 * Production Server Entry Point for Plesk
 * CommonJS format for compatibility
 */

const express = require('express');
const session = require('express-session');
const connectPgSimple = require('connect-pg-simple');
const { Pool } = require('@neondatabase/serverless');
const path = require('path');
const fs = require('fs');

// Load environment variables
if (fs.existsSync('.env')) {
  require('dotenv').config();
}

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Session setup
const PostgresSessionStore = connectPgSimple(session);
app.use(
  session({
    store: new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'whatsway-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

// API Routes - Basic implementation
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'WhatsWay server is running' });
});

app.get('/api/auth/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.session.user);
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Basic authentication check
  if (username === 'whatsway' && password === 'Admin@123') {
    req.session.user = {
      id: 'admin-user',
      username: 'whatsway',
      role: 'admin'
    };
    return res.json(req.session.user);
  }
  
  res.status(401).json({ error: 'Invalid credentials' });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out successfully' });
});

// Serve static files from client build
const clientPath = path.join(__dirname, 'dist', 'client');
if (fs.existsSync(clientPath)) {
  app.use(express.static(clientPath));
  
  // Serve React app for all non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientPath, 'index.html'));
    }
  });
} else {
  console.warn('Client build not found at:', clientPath);
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.status(503).send(`
        <html>
          <body>
            <h1>WhatsWay - Build Required</h1>
            <p>Please run the following commands:</p>
            <pre>
npm install
npm run build
            </pre>
            <p>Then restart the application in Plesk.</p>
          </body>
        </html>
      `);
    }
  });
}

// Export for Plesk
module.exports = app;

// If running directly (not through Plesk)
if (require.main === module) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`WhatsWay server running on port ${port}`);
  });
}