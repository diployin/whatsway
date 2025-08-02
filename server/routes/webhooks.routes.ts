import type { Express } from "express";
import { storage } from "../storage";
import { WebhookService } from "../services/webhook-service";
import crypto from "crypto";

export function registerWebhookRoutes(app: Express) {
  // Get webhook configurations
  app.get("/api/whatsapp/webhooks", async (req, res) => {
    try {
      const webhooks = await storage.getWebhookConfigs();
      res.json(webhooks);
    } catch (error) {
      console.error("Error fetching webhook configs:", error);
      res.status(500).json({ message: "Failed to fetch webhook configurations" });
    }
  });

  // Get webhook configuration for channel
  app.get("/api/whatsapp/webhooks/:channelId", async (req, res) => {
    try {
      const webhook = await storage.getWebhookConfig(req.params.channelId);
      if (!webhook) {
        return res.status(404).json({ message: "Webhook configuration not found" });
      }
      res.json(webhook);
    } catch (error) {
      console.error("Error fetching webhook config:", error);
      res.status(500).json({ message: "Failed to fetch webhook configuration" });
    }
  });

  // Create or update webhook configuration
  app.post("/api/whatsapp/webhooks", async (req, res) => {
    try {
      const { channelId, isEnabled } = req.body;
      
      // For global webhook, channelId can be null
      const verifyToken = crypto.randomBytes(32).toString('hex');
      
      // Generate webhook URL
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const host = req.get('host');
      const webhookPath = channelId || 'd420e261-9c12-4cee-9d65-253cda8ab4bc';
      const webhookUrl = `${protocol}://${host}/webhook/${webhookPath}`;
      
      const webhook = await storage.createWebhookConfig({
        channelId: channelId || null,
        webhookUrl,
        verifyToken,
        isEnabled: isEnabled !== false,
        createdAt: new Date(),
        lastVerified: null
      });
      
      res.json(webhook);
    } catch (error) {
      console.error("Error creating webhook config:", error);
      res.status(500).json({ message: "Failed to create webhook configuration" });
    }
  });

  // WhatsApp webhook verification and message handling
  app.all("/webhook/:webhookPath", async (req, res) => {
    try {
      // Handle GET request for webhook verification
      if (req.method === 'GET') {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        console.log('Webhook verification request:', { mode, token, challenge });

        // Find webhook config by path
        const configs = await storage.getWebhookConfigs();
        const webhook = configs.find(w => 
          w.webhookUrl?.includes(req.params.webhookPath) || 
          req.params.webhookPath === 'd420e261-9c12-4cee-9d65-253cda8ab4bc' // Global webhook
        );

        if (!webhook) {
          console.error('No webhook configuration found for path:', req.params.webhookPath);
          return res.status(404).send('Webhook not found');
        }

        if (mode === 'subscribe' && token === webhook.verifyToken) {
          console.log('Webhook verified successfully');
          
          // Update last verified time
          if (webhook.id) {
            await storage.updateWebhookConfig(webhook.id, {
              lastVerified: new Date()
            });
          }
          
          res.status(200).send(challenge);
        } else {
          console.error('Webhook verification failed');
          res.status(403).send('Forbidden');
        }
      } 
      // Handle POST request for webhook events
      else if (req.method === 'POST') {
        const signature = req.headers['x-hub-signature-256'] as string;
        const body = req.body;

        console.log('Webhook POST received:', JSON.stringify(body, null, 2));

        // Verify webhook signature if configured
        if (process.env.WHATSAPP_APP_SECRET && signature) {
          const expectedSignature = `sha256=${crypto
            .createHmac('sha256', process.env.WHATSAPP_APP_SECRET)
            .update(JSON.stringify(body))
            .digest('hex')}`;

          if (signature !== expectedSignature) {
            console.error('Invalid webhook signature');
            return res.status(403).send('Invalid signature');
          }
        }

        // Process webhook using WebhookService
        await WebhookService.processWebhook(body);

        res.status(200).send('EVENT_RECEIVED');
      } else {
        res.status(405).send('Method not allowed');
      }
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).send('Internal server error');
    }
  });
}