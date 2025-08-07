import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertContactSchema, insertCampaignSchema, insertTemplateSchema, insertConversationSchema, insertMessageSchema, insertAutomationSchema, insertWhatsappChannelSchema, insertWebhookConfigSchema } from "@shared/schema";
import { WebhookHandler } from "./services/webhook-handler";
import { MessageQueueService } from "./services/message-queue";
import { WhatsAppApiService } from "./services/whatsapp-api";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard endpoints
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  app.get("/api/analytics", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const analytics = await storage.getAnalytics(days);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics data" });
    }
  });

  // Contact endpoints
  app.get("/api/contacts", async (req, res) => {
    try {
      if (req.query.search) {
        const contacts = await storage.searchContacts(req.query.search as string);
        res.json(contacts);
      } else {
        const contacts = await storage.getContacts();
        res.json(contacts);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.get("/api/contacts/:id", async (req, res) => {
    try {
      const contact = await storage.getContact(req.params.id);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      console.error("Error fetching contact:", error);
      res.status(500).json({ message: "Failed to fetch contact" });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const validatedContact = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedContact);
      res.status(201).json(contact);
    } catch (error) {
      console.error("Error creating contact:", error);
      res.status(400).json({ message: "Invalid contact data" });
    }
  });

  app.put("/api/contacts/:id", async (req, res) => {
    try {
      const updates = req.body;
      const contact = await storage.updateContact(req.params.id, updates);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      console.error("Error updating contact:", error);
      res.status(500).json({ message: "Failed to update contact" });
    }
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteContact(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting contact:", error);
      res.status(500).json({ message: "Failed to delete contact" });
    }
  });

  // Campaign endpoints
  app.get("/api/campaigns", async (req, res) => {
    try {
      const campaigns = await storage.getCampaigns();
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const campaign = await storage.getCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      console.error("Error fetching campaign:", error);
      res.status(500).json({ message: "Failed to fetch campaign" });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const validatedCampaign = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(validatedCampaign);
      res.status(201).json(campaign);
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(400).json({ message: "Invalid campaign data" });
    }
  });

  app.put("/api/campaigns/:id", async (req, res) => {
    try {
      const updates = req.body;
      const campaign = await storage.updateCampaign(req.params.id, updates);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      console.error("Error updating campaign:", error);
      res.status(500).json({ message: "Failed to update campaign" });
    }
  });

  app.delete("/api/campaigns/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCampaign(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting campaign:", error);
      res.status(500).json({ message: "Failed to delete campaign" });
    }
  });

  // Template endpoints
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  app.post("/api/templates", async (req, res) => {
    try {
      const validatedTemplate = insertTemplateSchema.parse(req.body);
      const template = await storage.createTemplate(validatedTemplate);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(400).json({ message: "Invalid template data" });
    }
  });

  app.put("/api/templates/:id", async (req, res) => {
    try {
      const updates = req.body;
      const template = await storage.updateTemplate(req.params.id, updates);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error updating template:", error);
      res.status(500).json({ message: "Failed to update template" });
    }
  });

  app.delete("/api/templates/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTemplate(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ message: "Failed to delete template" });
    }
  });

  // Conversation endpoints
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const validatedConversation = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(validatedConversation);
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(400).json({ message: "Invalid conversation data" });
    }
  });

  app.put("/api/conversations/:id", async (req, res) => {
    try {
      const updates = req.body;
      const conversation = await storage.updateConversation(req.params.id, updates);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      console.error("Error updating conversation:", error);
      res.status(500).json({ message: "Failed to update conversation" });
    }
  });

  // Message endpoints
  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const validatedMessage = insertMessageSchema.parse({
        ...req.body,
        conversationId: req.params.id,
      });
      const message = await storage.createMessage(validatedMessage);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  // Automation endpoints
  app.get("/api/automations", async (req, res) => {
    try {
      const automations = await storage.getAutomations();
      res.json(automations);
    } catch (error) {
      console.error("Error fetching automations:", error);
      res.status(500).json({ message: "Failed to fetch automations" });
    }
  });

  app.get("/api/automations/:id", async (req, res) => {
    try {
      const automation = await storage.getAutomation(req.params.id);
      if (!automation) {
        return res.status(404).json({ message: "Automation not found" });
      }
      res.json(automation);
    } catch (error) {
      console.error("Error fetching automation:", error);
      res.status(500).json({ message: "Failed to fetch automation" });
    }
  });

  app.post("/api/automations", async (req, res) => {
    try {
      const validatedAutomation = insertAutomationSchema.parse(req.body);
      const automation = await storage.createAutomation(validatedAutomation);
      res.status(201).json(automation);
    } catch (error) {
      console.error("Error creating automation:", error);
      res.status(400).json({ message: "Invalid automation data" });
    }
  });

  app.put("/api/automations/:id", async (req, res) => {
    try {
      const updates = req.body;
      const automation = await storage.updateAutomation(req.params.id, updates);
      if (!automation) {
        return res.status(404).json({ message: "Automation not found" });
      }
      res.json(automation);
    } catch (error) {
      console.error("Error updating automation:", error);
      res.status(500).json({ message: "Failed to update automation" });
    }
  });

  app.delete("/api/automations/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteAutomation(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Automation not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting automation:", error);
      res.status(500).json({ message: "Failed to delete automation" });
    }
  });

  // WhatsApp Channel endpoints
  app.get("/api/whatsapp/channels", async (req, res) => {
    try {
      const channels = await storage.getWhatsappChannels();
      res.json(channels);
    } catch (error) {
      console.error("Error fetching WhatsApp channels:", error);
      res.status(500).json({ message: "Failed to fetch WhatsApp channels" });
    }
  });

  app.get("/api/whatsapp/channels/:id", async (req, res) => {
    try {
      const channel = await storage.getWhatsappChannel(req.params.id);
      if (!channel) {
        return res.status(404).json({ message: "WhatsApp channel not found" });
      }
      res.json(channel);
    } catch (error) {
      console.error("Error fetching WhatsApp channel:", error);
      res.status(500).json({ message: "Failed to fetch WhatsApp channel" });
    }
  });

  app.post("/api/whatsapp/channels", async (req, res) => {
    try {
      const validatedChannel = insertWhatsappChannelSchema.parse(req.body);
      const channel = await storage.createWhatsappChannel(validatedChannel);
      res.status(201).json(channel);
    } catch (error) {
      console.error("Error creating WhatsApp channel:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ 
          message: "Invalid WhatsApp channel data",
          errors: error.errors 
        });
      }
      res.status(400).json({ message: "Invalid WhatsApp channel data" });
    }
  });

  app.put("/api/whatsapp/channels/:id", async (req, res) => {
    try {
      const updates = req.body;
      const channel = await storage.updateWhatsappChannel(req.params.id, updates);
      if (!channel) {
        return res.status(404).json({ message: "WhatsApp channel not found" });
      }
      res.json(channel);
    } catch (error) {
      console.error("Error updating WhatsApp channel:", error);
      res.status(500).json({ message: "Failed to update WhatsApp channel" });
    }
  });

  app.delete("/api/whatsapp/channels/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteWhatsappChannel(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "WhatsApp channel not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting WhatsApp channel:", error);
      res.status(500).json({ message: "Failed to delete WhatsApp channel" });
    }
  });

  // Test WhatsApp connection
  app.post("/api/whatsapp/channels/:id/test", async (req, res) => {
    try {
      const channel = await storage.getWhatsappChannel(req.params.id);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }

      const testPhone = req.body.testPhone || "919310797700"; // Default test number
      
      // Test connection by sending hello_world template
      const result = await WhatsAppApiService.sendMessage(channel, {
        to: testPhone,
        type: "template",
        template: {
          name: "hello_world",
          language: {
            code: "en_US"
          }
        }
      });

      // Log the API request
      await storage.logApiRequest({
        channelId: channel.id,
        requestType: "test_connection",
        endpoint: `https://graph.facebook.com/v22.0/${channel.phoneNumberId}/messages`,
        method: "POST",
        requestBody: {
          messaging_product: "whatsapp",
          to: testPhone,
          type: "template",
          template: {
            name: "hello_world",
            language: { code: "en_US" }
          }
        },
        responseStatus: result.success ? 200 : 400,
        responseBody: result.data || result.error,
        duration: 0
      });

      if (result.success) {
        // Update channel status to active
        await storage.updateWhatsappChannel(channel.id, {
          status: "active",
          lastHealthCheck: new Date(),
          errorMessage: null,
        });
        
        res.json({ 
          success: true, 
          message: "Test message sent successfully",
          messageId: result.data?.messages?.[0]?.id
        });
      } else {
        // Update channel status to error
        await storage.updateWhatsappChannel(channel.id, {
          status: "error",
          lastHealthCheck: new Date(),
          errorMessage: result.error,
        });
        
        res.status(400).json({ 
          success: false, 
          message: "Failed to send test message",
          error: result.error 
        });
      }
    } catch (error) {
      console.error("Error testing WhatsApp connection:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to test connection",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Health check endpoint for WhatsApp channels
  app.get("/api/whatsapp/channels/:id/health", async (req, res) => {
    try {
      const channel = await storage.getWhatsappChannel(req.params.id);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }

      // Perform health check using WhatsApp Business API
      const health = await WhatsAppApiService.checkHealth(channel);
      
      // Update channel with health check results
      await storage.updateWhatsappChannel(channel.id, {
        status: health.status,
        lastHealthCheck: new Date(),
        messageLimit: health.messageLimit,
        messagesUsed: health.messagesUsed,
        errorMessage: health.error,
      });

      res.json({
        success: true,
        health: {
          status: health.status,
          messageLimit: health.messageLimit,
          messagesUsed: health.messagesUsed,
          messagesRemaining: health.messageLimit ? health.messageLimit - (health.messagesUsed || 0) : null,
          lastCheck: new Date(),
          error: health.error,
        }
      });
    } catch (error) {
      console.error("Health check error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Webhook Configuration endpoints
  app.get("/api/whatsapp/webhooks", async (req, res) => {
    try {
      const configs = await storage.getWebhookConfigs();
      res.json(configs);
    } catch (error) {
      console.error("Error fetching webhook configs:", error);
      res.status(500).json({ message: "Failed to fetch webhook configurations" });
    }
  });

  app.get("/api/whatsapp/webhooks/:channelId", async (req, res) => {
    try {
      const config = await storage.getWebhookConfig(req.params.channelId);
      if (!config) {
        return res.status(404).json({ message: "Webhook configuration not found" });
      }
      res.json(config);
    } catch (error) {
      console.error("Error fetching webhook config:", error);
      res.status(500).json({ message: "Failed to fetch webhook configuration" });
    }
  });

  app.post("/api/whatsapp/webhooks", async (req, res) => {
    try {
      const validatedConfig = insertWebhookConfigSchema.parse(req.body);
      const config = await storage.createWebhookConfig(validatedConfig);
      res.status(201).json(config);
    } catch (error) {
      console.error("Error creating webhook config:", error);
      res.status(400).json({ message: "Invalid webhook configuration data" });
    }
  });

  app.put("/api/whatsapp/webhooks/:id", async (req, res) => {
    try {
      const updates = req.body;
      const config = await storage.updateWebhookConfig(req.params.id, updates);
      if (!config) {
        return res.status(404).json({ message: "Webhook configuration not found" });
      }
      res.json(config);
    } catch (error) {
      console.error("Error updating webhook config:", error);
      res.status(500).json({ message: "Failed to update webhook configuration" });
    }
  });

  // WhatsApp Webhook endpoint (receives messages from WhatsApp)
  app.get("/webhook", async (req, res) => {
    try {
      const mode = req.query["hub.mode"] as string;
      const token = req.query["hub.verify_token"] as string;
      const challenge = req.query["hub.challenge"] as string;
      
      // For now, just verify with a simple token
      const result = await WebhookHandler.handleVerification(mode, token, challenge, "VERIFY_TOKEN");
      
      if (result.verified && result.challenge) {
        res.status(200).send(result.challenge);
      } else {
        res.sendStatus(403);
      }
    } catch (error) {
      console.error("Webhook verification error:", error);
      res.sendStatus(403);
    }
  });

  app.post("/webhook", async (req, res) => {
    try {
      await WebhookHandler.processWebhook(req.body);
      res.sendStatus(200);
    } catch (error) {
      console.error("Webhook processing error:", error);
      res.sendStatus(500);
    }
  });

  // Message Queue endpoints
  app.get("/api/whatsapp/queue/stats", async (req, res) => {
    try {
      const stats = await storage.getMessageQueueStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching queue stats:", error);
      res.status(500).json({ message: "Failed to fetch queue statistics" });
    }
  });

  app.get("/api/whatsapp/queue", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const messages = await storage.getQueuedMessages(limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching queued messages:", error);
      res.status(500).json({ message: "Failed to fetch queued messages" });
    }
  });

  // API Logs endpoint
  app.get("/api/whatsapp/logs", async (req, res) => {
    try {
      const channelId = req.query.channelId as string;
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getApiLogs(channelId, limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching API logs:", error);
      res.status(500).json({ message: "Failed to fetch API logs" });
    }
  });

  // Start message queue processing
  MessageQueueService.startProcessing();

  const httpServer = createServer(app);
  return httpServer;
}
