import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { registerRoutes } from "./routes/index";
import { setupVite, serveStatic, log } from "./vite";
import { MessageStatusUpdater } from "./services/message-status-updater";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up session management
const PostgresSessionStore = connectPgSimple(session);
app.use(
  session({
    store: new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "whatsway-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Check if running under Plesk Passenger
  const isPassenger = process.env.PASSENGER_APP_ENV || false;
  
  if (isPassenger) {
    // For Plesk Passenger, just export the app
    // Passenger will handle the port binding
    log('Running under Plesk Passenger');
    
    // Start background services
    const messageStatusUpdater = new MessageStatusUpdater();
    messageStatusUpdater.startCronJob(60);
    log('Message status updater cron job started');
    
    const { channelHealthMonitor } = await import('./cron/channel-health-monitor');
    channelHealthMonitor.start();
  } else {
    // Normal server startup for development or standalone production
    const port = parseInt(process.env.PORT || '5000', 10);
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, async () => {
      log(`serving on port ${port}`);
      
      // Start the message status updater cron job
      const messageStatusUpdater = new MessageStatusUpdater();
      messageStatusUpdater.startCronJob(60); // Run every 60 seconds instead of 10
      log('Message status updater cron job started');
      
      // Start channel health monitor
      const { channelHealthMonitor } = await import('./cron/channel-health-monitor');
      channelHealthMonitor.start();
    });
  }
})();

// Export the app for Plesk Passenger
export default app;
