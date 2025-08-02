import type { Express } from "express";
import { storage } from "../storage";
import { insertTemplateSchema } from "@shared/schema";
import { WhatsAppApiService } from "../services/whatsapp-api";

export function registerTemplateRoutes(app: Express) {
  // Seed templates
  app.post("/api/templates/seed", async (req, res) => {
    try {
      const channelId = req.query.channelId as string | undefined;
      
      // If no channelId in query, get active channel
      let finalChannelId = channelId;
      if (!finalChannelId) {
        const activeChannel = await storage.getActiveChannel();
        if (activeChannel) {
          finalChannelId = activeChannel.id;
        } else {
          return res.status(400).json({ 
            message: "No active channel found. Please configure a channel first." 
          });
        }
      }
      
      const templates = [
        {
          name: "hello_world",
          body: "Hello {{1}}! Welcome to our WhatsApp Business platform.",
          category: "utility" as const,
          language: "en",
          status: "pending",
          channelId: finalChannelId
        },
        {
          name: "order_confirmation",
          body: "Hi {{1}}, your order #{{2}} has been confirmed and will be delivered by {{3}}.",
          category: "utility" as const,
          language: "en",
          status: "pending",
          channelId: finalChannelId
        },
        {
          name: "appointment_reminder",
          body: "Hello {{1}}, this is a reminder about your appointment on {{2}} at {{3}}. Reply YES to confirm.",
          category: "utility" as const,
          language: "en",
          status: "pending",
          channelId: finalChannelId
        }
      ];

      const createdTemplates = await Promise.all(
        templates.map(template => storage.createTemplate(template))
      );

      res.json({ message: "Templates seeded successfully", templates: createdTemplates });
    } catch (error) {
      console.error("Error seeding templates:", error);
      res.status(500).json({ message: "Failed to seed templates" });
    }
  });

  // Get all templates
  app.get("/api/templates", async (req, res) => {
    try {
      const channelId = req.query.channelId as string | undefined;
      const templates = channelId 
        ? await storage.getTemplatesByChannel(channelId)
        : await storage.getTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  // Get single template
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

  // Create template
  app.post("/api/templates", async (req, res) => {
    try {
      console.log("Template creation request body:", JSON.stringify(req.body, null, 2));
      const validatedTemplate = insertTemplateSchema.parse(req.body);
      console.log("Validated template buttons:", validatedTemplate.buttons);
      
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

      // Create WhatsApp channel object from regular channel
      const whatsappChannel = {
        id: channel.id,
        name: channel.name,
        phoneNumber: channel.phoneNumber || "",
        phoneNumberId: channel.phoneNumberId,
        wabaId: channel.whatsappBusinessAccountId || "",
        accessToken: channel.accessToken,
        businessAccountId: channel.whatsappBusinessAccountId,
        mmLiteEnabled: channel.mmLiteEnabled || false,
        mmLiteEndpoint: null,
        qualityRating: "green",
        status: "active",
        lastHealthCheck: channel.lastHealthCheck || null,
      } as any;
      
      // Submit template to WhatsApp API
      try {
        const apiResponse = await WhatsAppApiService.createTemplate(whatsappChannel, {
          name: validatedTemplate.name,
          language: validatedTemplate.language || "en",
          category: validatedTemplate.category || "UTILITY",
          components: components
        });

        if (apiResponse.success) {
          await storage.updateTemplate(template.id, {
            status: "pending"
          });
        } else {
          await storage.updateTemplate(template.id, {
            status: "rejected",
            // rejectionReason: apiResponse.error || "Failed to submit to WhatsApp API"
          });
        }
        
        res.status(201).json(template);
      } catch (apiError) {
        console.error("WhatsApp API error:", apiError);
        
        await storage.updateTemplate(template.id, {
          status: "rejected",
          // rejectionReason: "Failed to submit to WhatsApp API"
        });
        
        res.status(201).json(template);
      }
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  // Update template
  app.put("/api/templates/:id", async (req, res) => {
    try {
      const template = await storage.updateTemplate(req.params.id, req.body);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error updating template:", error);
      res.status(500).json({ message: "Failed to update template" });
    }
  });

  // Delete template
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

  // Sync templates from WhatsApp
  app.post("/api/templates/sync", async (req, res) => {
    try {
      const channelId = req.query.channelId as string | undefined;
      
      if (!channelId) {
        return res.status(400).json({ message: "Channel ID is required" });
      }
      
      const channel = await storage.getChannel(channelId);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      
      if (!channel.phoneNumberId || !channel.accessToken) {
        return res.status(400).json({ message: "Channel is not configured for WhatsApp" });
      }
      
      // Create WhatsApp channel object from regular channel
      const whatsappChannel = {
        id: channel.id,
        name: channel.name,
        phoneNumber: channel.phoneNumber || "",
        phoneNumberId: channel.phoneNumberId,
        wabaId: channel.whatsappBusinessAccountId || "",
        accessToken: channel.accessToken,
        businessAccountId: channel.whatsappBusinessAccountId,
        mmLiteEnabled: channel.mmLiteEnabled || false,
        mmLiteEndpoint: null,
        qualityRating: "green",
        status: "active",
        lastHealthCheck: channel.lastHealthCheck || null,
      } as any;
      
      // Fetch templates from WhatsApp API
      const result = await WhatsAppApiService.getTemplates(whatsappChannel);
      
      if (!result.success || !result.data) {
        return res.status(500).json({ 
          message: "Failed to fetch templates from WhatsApp", 
          error: result.error 
        });
      }
      
      // Update local templates with WhatsApp statuses
      const whatsappTemplates = result.data;
      const localTemplates = await storage.getTemplatesByChannel(channelId);
      
      let updatedCount = 0;
      
      for (const localTemplate of localTemplates) {
        const whatsappTemplate = whatsappTemplates.find(
          t => t.name === localTemplate.name
        );
        
        if (whatsappTemplate && whatsappTemplate.status !== localTemplate.status) {
          await storage.updateTemplate(localTemplate.id, {
            status: whatsappTemplate.status.toLowerCase()
          });
          updatedCount++;
        }
      }
      
      res.json({ 
        message: `Sync completed. Updated ${updatedCount} templates.`,
        updatedCount 
      });
    } catch (error) {
      console.error("Error syncing templates:", error);
      res.status(500).json({ message: "Failed to sync templates" });
    }
  });

  // Submit template for approval
  app.post("/api/templates/:id/submit", async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      // Update status to pending
      await storage.updateTemplate(req.params.id, { status: "pending" });
      
      res.json({ message: "Template submitted for approval" });
    } catch (error) {
      console.error("Error submitting template:", error);
      res.status(500).json({ message: "Failed to submit template" });
    }
  });
}