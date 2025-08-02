import type { Express } from "express";
import { storage } from "../storage";
import { insertAutomationSchema } from "@shared/schema";

export function registerAutomationRoutes(app: Express) {
  // Get all automations
  app.get("/api/automations", async (req, res) => {
    try {
      const channelId = req.query.channelId as string | undefined;
      const automations = channelId 
        ? await storage.getAutomationsByChannel(channelId)
        : await storage.getAutomations();
      res.json(automations);
    } catch (error) {
      console.error("Error fetching automations:", error);
      res.status(500).json({ message: "Failed to fetch automations" });
    }
  });

  // Get single automation
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

  // Create automation
  app.post("/api/automations", async (req, res) => {
    try {
      const channelId = req.query.channelId as string | undefined;
      
      // If no channelId in query, get active channel
      let finalChannelId = channelId;
      if (!finalChannelId) {
        const activeChannel = await storage.getActiveChannel();
        if (activeChannel) {
          finalChannelId = activeChannel.id;
        }
      }
      
      const automationData = {
        ...insertAutomationSchema.parse(req.body),
        channelId: finalChannelId
      };
      
      const automation = await storage.createAutomation(automationData);
      res.status(201).json(automation);
    } catch (error) {
      console.error("Error creating automation:", error);
      res.status(500).json({ message: "Failed to create automation" });
    }
  });

  // Update automation
  app.put("/api/automations/:id", async (req, res) => {
    try {
      const automation = await storage.updateAutomation(req.params.id, req.body);
      if (!automation) {
        return res.status(404).json({ message: "Automation not found" });
      }
      res.json(automation);
    } catch (error) {
      console.error("Error updating automation:", error);
      res.status(500).json({ message: "Failed to update automation" });
    }
  });

  // Delete automation
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
}