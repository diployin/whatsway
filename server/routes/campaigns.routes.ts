import type { Express } from "express";
import { storage } from "../storage";
import { insertCampaignSchema } from "@shared/schema";

export function registerCampaignRoutes(app: Express) {
  // Get all campaigns
  app.get("/api/campaigns", async (req, res) => {
    try {
      const channelId = req.query.channelId as string | undefined;
      const campaigns = channelId 
        ? await storage.getCampaignsByChannel(channelId)
        : await storage.getCampaigns();
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  // Get single campaign
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

  // Create campaign
  app.post("/api/campaigns", async (req, res) => {
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
      
      const campaignData = {
        ...insertCampaignSchema.parse(req.body),
        channelId: finalChannelId
      };
      
      const campaign = await storage.createCampaign(campaignData);
      res.status(201).json(campaign);
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(500).json({ message: "Failed to create campaign" });
    }
  });

  // Update campaign
  app.put("/api/campaigns/:id", async (req, res) => {
    try {
      const campaign = await storage.updateCampaign(req.params.id, req.body);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      console.error("Error updating campaign:", error);
      res.status(500).json({ message: "Failed to update campaign" });
    }
  });

  // Delete campaign
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
}