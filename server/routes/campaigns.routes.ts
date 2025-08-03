import type { Express } from "express";
import { campaignsController } from "../controllers/campaigns.controller";
import { extractChannelId } from "../middlewares/channel.middleware";

export function registerCampaignRoutes(app: Express) {
  // Get all campaigns
  app.get("/api/campaigns", 
    extractChannelId,
    campaignsController.getCampaigns
  );

  // Get campaign by ID
  app.get("/api/campaigns/:id", 
    campaignsController.getCampaign
  );

  // Create new campaign
  app.post("/api/campaigns", 
    campaignsController.createCampaign
  );

  // Update campaign status
  app.patch("/api/campaigns/:id/status", 
    campaignsController.updateCampaignStatus
  );

  // Delete campaign
  app.delete("/api/campaigns/:id", 
    campaignsController.deleteCampaign
  );

  // Start campaign execution
  app.post("/api/campaigns/:id/start", 
    campaignsController.startCampaign
  );

  // Get campaign analytics
  app.get("/api/campaigns/:id/analytics", 
    campaignsController.getCampaignAnalytics
  );

  // API campaign endpoint
  app.post("/api/campaigns/send/:apiKey", 
    campaignsController.sendApiCampaign
  );
}