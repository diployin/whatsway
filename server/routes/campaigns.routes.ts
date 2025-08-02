import type { Express } from "express";
import * as campaignsController from "../controllers/campaigns.controller";
import { validateRequest } from "../middlewares/validation.middleware";
import { insertCampaignSchema } from "@shared/schema";
import { extractChannelId } from "../middlewares/channel.middleware";

export function registerCampaignRoutes(app: Express) {
  // Get all campaigns
  app.get("/api/campaigns",
    extractChannelId,
    campaignsController.getCampaigns
  );

  // Get single campaign
  app.get("/api/campaigns/:id", campaignsController.getCampaign);

  // Create campaign
  app.post("/api/campaigns",
    validateRequest(insertCampaignSchema),
    campaignsController.createCampaign
  );

  // Update campaign
  app.put("/api/campaigns/:id", campaignsController.updateCampaign);

  // Delete campaign
  app.delete("/api/campaigns/:id", campaignsController.deleteCampaign);

  // Start campaign
  app.post("/api/campaigns/:id/start", campaignsController.startCampaign);
}