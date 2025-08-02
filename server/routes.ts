import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertContactSchema, insertCampaignSchema, insertChannelSchema, insertTemplateSchema, insertConversationSchema, insertMessageSchema, insertAutomationSchema, insertWhatsappChannelSchema, insertWebhookConfigSchema } from "@shared/schema";
import { WebhookHandler } from "./services/webhook-handler";
import { MessageQueueService } from "./services/message-queue";
import { WhatsAppApiService } from "./services/whatsapp-api";
import { WebhookService } from "./services/webhook-service";
import { ObjectStorageService } from "./objectStorage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Channel endpoints
  app.get("/api/channels", async (req, res) => {
    try {
      const channels = await storage.getChannels();
      res.json(channels);
    } catch (error) {
      console.error("Error fetching channels:", error);
      res.status(500).json({ message: "Failed to fetch channels" });
    }
  });

  app.get("/api/channels/active", async (req, res) => {
    try {
      const channel = await storage.getActiveChannel();
      if (!channel) {
        return res.status(404).json({ message: "No active channel found" });
      }
      res.json(channel);
    } catch (error) {
      console.error("Error fetching active channel:", error);
      res.status(500).json({ message: "Failed to fetch active channel" });
    }
  });

  app.get("/api/channels/:id", async (req, res) => {
    try {
      const channel = await storage.getChannel(req.params.id);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      res.json(channel);
    } catch (error) {
      console.error("Error fetching channel:", error);
      res.status(500).json({ message: "Failed to fetch channel" });
    }
  });

  app.post("/api/channels", async (req, res) => {
    try {
      const validatedChannel = insertChannelSchema.parse(req.body);
      const channel = await storage.createChannel(validatedChannel);
      res.status(201).json(channel);
    } catch (error) {
      console.error("Error creating channel:", error);
      res.status(400).json({ message: "Invalid channel data" });
    }
  });

  app.put("/api/channels/:id", async (req, res) => {
    try {
      const updates = req.body;
      const channel = await storage.updateChannel(req.params.id, updates);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      res.json(channel);
    } catch (error) {
      console.error("Error updating channel:", error);
      res.status(500).json({ message: "Failed to update channel" });
    }
  });

  app.delete("/api/channels/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteChannel(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Channel not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting channel:", error);
      res.status(500).json({ message: "Failed to delete channel" });
    }
  });

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

  // Create sample templates
  app.post("/api/templates/seed", async (req, res) => {
    try {
      const sampleTemplates = [
        {
          name: "hello_world",
          content: "Hello {{1}}! Thanks for your interest in {{2}}. Reply with STOP to unsubscribe.",
          category: "MARKETING",
          status: "APPROVED",
          language: "en_US",
          variables: ["customer_name", "business_name"]
        },
        {
          name: "order_confirmation",
          content: "Hi {{1}}, your order #{{2}} has been confirmed and will be delivered by {{3}}. Track: {{4}}",
          category: "UTILITY",
          status: "APPROVED",
          language: "en_US",
          variables: ["customer_name", "order_number", "delivery_date", "tracking_link"]
        },
        {
          name: "appointment_reminder",
          content: "Hi {{1}}, this is a reminder for your appointment on {{2}} at {{3}}. Reply YES to confirm or NO to reschedule.",
          category: "UTILITY",
          status: "APPROVED",
          language: "en_US",
          variables: ["customer_name", "appointment_date", "appointment_time"]
        },
        {
          name: "welcome_message",
          content: "Welcome to {{1}}, {{2}}! We're excited to have you. Get started by visiting {{3}} or reply HELP for assistance.",
          category: "MARKETING",
          status: "APPROVED",
          language: "en_US",
          variables: ["business_name", "customer_name", "website_link"]
        },
        {
          name: "payment_reminder",
          content: "Hi {{1}}, your payment of {{2}} for invoice #{{3}} is due on {{4}}. Pay now: {{5}}",
          category: "UTILITY",
          status: "APPROVED",
          language: "en_US",
          variables: ["customer_name", "amount", "invoice_number", "due_date", "payment_link"]
        },
        {
          name: "verification_code",
          content: "Your {{1}} verification code is {{2}}. This code expires in {{3}} minutes.",
          category: "AUTHENTICATION",
          status: "APPROVED",
          language: "en_US",
          variables: ["service_name", "otp_code", "expiry_time"]
        }
      ];

      const createdTemplates = [];
      for (const template of sampleTemplates) {
        try {
          const created = await storage.createTemplate(template);
          createdTemplates.push(created);
        } catch (err) {
          console.log(`Template ${template.name} already exists, skipping...`);
        }
      }

      res.json({ 
        message: "Sample templates created successfully", 
        created: createdTemplates.length 
      });
    } catch (error) {
      console.error("Error creating sample templates:", error);
      res.status(500).json({ message: "Failed to create sample templates" });
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
      
      // Get active channel if channelId not provided
      let channelId = validatedTemplate.channelId;
      if (!channelId) {
        const activeChannel = await storage.getActiveChannel();
        if (!activeChannel) {
          return res.status(400).json({ 
            message: "No active channel found. Please configure a channel first." 
          });
        }
        channelId = activeChannel.id;
      }
      
      // Create template in storage first
      const template = await storage.createTemplate({
        ...validatedTemplate,
        channelId,
        status: "pending"
      });
      
      // Get channel details
      const channel = await storage.getChannel(channelId);
      if (!channel) {
        return res.status(400).json({ message: "Channel not found" });
      }
      
      // Format components for WhatsApp API
      const components = [];
      
      // Handle media header if present
      if (validatedTemplate.mediaType && validatedTemplate.mediaType !== 'text') {
        const headerFormat = validatedTemplate.mediaType.toUpperCase();
        if (validatedTemplate.header) {
          components.push({
            type: "HEADER",
            format: headerFormat,
            text: validatedTemplate.header,
            example: validatedTemplate.mediaUrl ? {
              header_handle: [validatedTemplate.mediaUrl]
            } : undefined
          });
        }
      } else if (validatedTemplate.header) {
        components.push({
          type: "HEADER",
          format: "TEXT",
          text: validatedTemplate.header
        });
      }
      
      // Body component
      components.push({
        type: "BODY",
        text: validatedTemplate.body
      });
      
      // Footer component
      if (validatedTemplate.footer) {
        components.push({
          type: "FOOTER",
          text: validatedTemplate.footer
        });
      }
      
      // Buttons component
      if (validatedTemplate.buttons && (validatedTemplate.buttons as any[]).length > 0) {
        const buttons = (validatedTemplate.buttons as any[]).map(btn => {
          if (btn.type === "QUICK_REPLY") {
            return { type: "QUICK_REPLY", text: btn.text };
          } else if (btn.type === "URL") {
            return { type: "URL", text: btn.text, url: btn.url || "" };
          } else if (btn.type === "PHONE_NUMBER") {
            return { type: "PHONE_NUMBER", text: btn.text, phone_number: btn.phoneNumber || "" };
          }
          return btn;
        });
        
        components.push({
          type: "BUTTONS",
          buttons
        });
      }
      
      // Submit to WhatsApp API
      const apiUrl = `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION || 'v23.0'}/${channel.whatsappBusinessAccountId || channel.phoneNumberId}/message_templates`;
      
      const templatePayload = {
        name: template.name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        category: template.category.toUpperCase(),
        language: template.language || "en_US",
        components: components
      };
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${channel.accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(templatePayload)
      });
      
      const result = await response.json();
      
      if (response.ok && result.id) {
        // Update template with WhatsApp ID
        await storage.updateTemplate(template.id, { 
          whatsappTemplateId: result.id,
          status: "pending" 
        });
        
        res.status(201).json({ 
          ...template,
          whatsappTemplateId: result.id,
          status: "pending"
        });
      } else {
        // Delete template if WhatsApp submission failed
        await storage.deleteTemplate(template.id);
        
        console.error("WhatsApp API error:", result);
        res.status(400).json({ 
          message: "Failed to create template in WhatsApp",
          error: result.error?.message || "Unknown error"
        });
      }
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(400).json({ message: "Invalid template data", error: error instanceof Error ? error.message : String(error) });
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

  // Media upload endpoint
  app.post("/api/media/upload-url", async (req, res) => {
    try {
      const { contentType } = req.body;
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL(contentType);
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });

  // Submit template to WhatsApp for approval
  app.post("/api/templates/:id/submit", async (req, res) => {
    try {
      const { id } = req.params;
      const template = await storage.getTemplate(id);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      // Get the first active WhatsApp channel
      const channels = await storage.getWhatsappChannels();
      const activeChannel = channels.find(ch => ch.status === "active");
      
      if (!activeChannel) {
        return res.status(400).json({ 
          message: "No active WhatsApp channel found. Please configure a channel first." 
        });
      }

      // Format buttons for WhatsApp API
      const components = [];
      if (template.buttons && (template.buttons as any[]).length > 0) {
        const buttons = (template.buttons as any[]).map(btn => {
          if (btn.type === "QUICK_REPLY") {
            return { type: "QUICK_REPLY", text: btn.text };
          } else if (btn.type === "URL") {
            return { type: "URL", text: btn.text, url: btn.url };
          } else if (btn.type === "PHONE_NUMBER") {
            return { type: "PHONE_NUMBER", text: btn.text, phone_number: btn.phoneNumber };
          }
        });
        
        components.push({
          type: "BUTTONS",
          buttons
        });
      }

      // Create template via WhatsApp Business API
      const apiUrl = `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION || 'v23.0'}/${activeChannel.wabaId}/message_templates`;
      
      const templatePayload = {
        name: template.name,
        category: template.category,
        language: template.language || "en_US",
        components: [
          template.header && {
            type: "HEADER",
            format: "TEXT",
            text: template.header
          },
          {
            type: "BODY",
            text: template.body
          },
          template.footer && {
            type: "FOOTER",
            text: template.footer
          },
          ...components
        ].filter(Boolean)
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${activeChannel.accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(templatePayload)
      });

      const result = await response.json();

      if (response.ok && result.id) {
        // Update template status to pending
        await storage.updateTemplate(id, { status: "pending" });
        
        res.json({ 
          success: true, 
          message: "Template submitted to WhatsApp for approval",
          whatsappTemplateId: result.id
        });
      } else {
        console.error("WhatsApp API error:", result);
        res.status(400).json({ 
          success: false,
          message: "Failed to submit template to WhatsApp",
          error: result.error?.message || "Unknown error"
        });
      }
    } catch (error) {
      console.error("Error submitting template:", error);
      res.status(500).json({ 
        message: "Failed to submit template",
        error: error instanceof Error ? error.message : String(error)
      });
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
  app.post("/api/whatsapp/channels/:id/send", async (req, res) => {
    try {
      const channel = await storage.getWhatsappChannel(req.params.id);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }

      const { to, type, message, templateName, templateLanguage, templateVariables } = req.body;
      if (!to || !type) {
        return res.status(400).json({ message: "Phone number and message type are required" });
      }
      
      let payload: any;
      
      if (type === "template") {
        if (!templateName || !templateLanguage) {
          return res.status(400).json({ message: "Template name and language are required for template messages" });
        }
        
        // Build template components
        const components: any[] = [];
        
        if (templateVariables && templateVariables.length > 0) {
          components.push({
            type: "body",
            parameters: templateVariables.map((value: string) => ({
              type: "text",
              text: value
            }))
          });
        }
        
        payload = {
          to,
          type: "template",
          template: {
            name: templateName,
            language: {
              code: templateLanguage
            },
            components: components.length > 0 ? components : undefined
          }
        };
      } else {
        if (!message) {
          return res.status(400).json({ message: "Message text is required for text messages" });
        }
        
        payload = {
          to,
          type: "text",
          text: {
            body: message
          }
        };
      }
      
      // Send message
      const result = await WhatsAppApiService.sendMessage(channel, payload);

      if (result.success) {
        res.json({ 
          success: true, 
          messageId: result.data.messages?.[0]?.id,
          message: "Message sent successfully" 
        });
      } else {
        res.status(400).json({ 
          success: false, 
          message: result.error || "Failed to send message" 
        });
      }
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      res.status(500).json({ message: "Failed to send WhatsApp message" });
    }
  });

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
        qualityRating: health.qualityRating,
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

  // WhatsApp Webhook endpoints (receives messages from WhatsApp)
  // Dynamic webhook endpoints for each channel
  app.get("/webhook/:channelId", async (req, res) => {
    try {
      const mode = req.query["hub.mode"] as string;
      const token = req.query["hub.verify_token"] as string;
      const challenge = req.query["hub.challenge"] as string;
      const channelId = req.params.channelId;
      
      console.log("Webhook verification request:", {
        channelId,
        mode,
        token: token ? `${token.substring(0, 5)}...` : "missing",
        challenge: challenge ? `${challenge.substring(0, 10)}...` : "missing"
      });
      
      // Get webhook config for this channel
      const config = await storage.getWebhookConfig(channelId);
      if (!config) {
        console.error(`No webhook config found for channel: ${channelId}`);
        return res.status(403).send("Webhook config not found");
      }
      
      if (!config.isActive) {
        console.error(`Webhook config is inactive for channel: ${channelId}`);
        return res.status(403).send("Webhook is inactive");
      }
      
      console.log("Verifying token:", {
        providedToken: token ? `${token.substring(0, 5)}...` : "missing",
        expectedToken: config.verifyToken ? `${config.verifyToken.substring(0, 5)}...` : "missing",
        matches: token === config.verifyToken
      });
      
      const result = WebhookService.handleVerification(mode, token, challenge, config.verifyToken);
      
      if (result.verified && result.challenge) {
        console.log("Webhook verification successful");
        res.status(200).send(result.challenge);
      } else {
        console.error("Webhook verification failed:", { mode, tokenMatches: token === config.verifyToken });
        res.status(403).send("Verification failed");
      }
    } catch (error) {
      console.error("Webhook verification error:", error);
      res.status(403).send("Verification error");
    }
  });

  app.post("/webhook/:channelId", async (req, res) => {
    try {
      const channelId = req.params.channelId;
      const signature = req.headers["x-hub-signature-256"] as string;
      
      // Get webhook config
      const config = await storage.getWebhookConfig(channelId);
      if (!config || !config.isActive) {
        return res.sendStatus(403);
      }
      
      // Verify signature if app secret is configured
      if (config.appSecret && signature) {
        const isValid = WebhookService.verifySignature(
          JSON.stringify(req.body),
          signature,
          config.appSecret
        );
        
        if (!isValid) {
          console.error("Invalid webhook signature");
          return res.sendStatus(403);
        }
      }
      
      // Process webhook payload
      await WebhookService.processWebhook(req.body, channelId);
      
      // Update last ping timestamp
      await storage.updateWebhookConfig(config.id, {
        lastPingAt: new Date(),
      });
      
      res.sendStatus(200);
    } catch (error) {
      console.error("Webhook processing error:", error);
      res.sendStatus(500);
    }
  });

  // Test endpoint to verify webhook configuration
  app.get("/api/whatsapp/webhooks/test/:channelId", async (req, res) => {
    try {
      const channelId = req.params.channelId;
      const config = await storage.getWebhookConfig(channelId);
      
      if (!config) {
        return res.status(404).json({ 
          success: false,
          message: "No webhook configuration found for this channel",
          channelId 
        });
      }
      
      res.json({
        success: true,
        webhookUrl: `${req.protocol}://${req.get('host')}/webhook/${channelId}`,
        verifyToken: config.verifyToken,
        isActive: config.isActive,
        events: config.events,
        channelId: config.channelId,
        configId: config.id,
        createdAt: config.createdAt
      });
    } catch (error) {
      console.error("Error testing webhook config:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to test webhook configuration",
        error: error instanceof Error ? error.message : String(error)
      });
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
