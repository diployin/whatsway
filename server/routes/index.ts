import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";

// Import all route modules
import { registerChannelRoutes } from "./channels.routes";
import { registerDashboardRoutes } from "./dashboard.routes";
import { registerAnalyticsRoutes } from "./analytics.routes";
import { registerContactRoutes } from "./contacts.routes";
import { registerCampaignRoutes } from "./campaigns.routes";
import { registerTemplateRoutes } from "./templates.routes";
import { registerMediaRoutes } from "./media.routes";
import { registerConversationRoutes } from "./conversations.routes";
import { registerAutomationRoutes } from "./automations.routes";
import { registerWhatsAppRoutes } from "./whatsapp.routes";
import { registerWebhookRoutes } from "./webhooks.routes";
import { registerMessageRoutes } from "./messages.routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register all route modules
  registerChannelRoutes(app);
  registerDashboardRoutes(app);
  registerAnalyticsRoutes(app);
  registerContactRoutes(app);
  registerCampaignRoutes(app);
  registerTemplateRoutes(app);
  registerMediaRoutes(app);
  registerConversationRoutes(app);
  registerAutomationRoutes(app);
  registerWhatsAppRoutes(app);
  registerWebhookRoutes(app);
  registerMessageRoutes(app);

  // Create HTTP server
  const httpServer = createServer(app);

  // Add WebSocket server for real-time features
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      console.log('Received:', message.toString());
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}