import type { Express } from "express";
import * as channelsController from "../controllers/channels.controller";
import { validateRequest } from "../middlewares/validation.middleware";
import { insertChannelSchema } from "@shared/schema";
import { requireAuth } from "server/middlewares/auth.middleware";
import { requireSubscription } from "server/middlewares/requireSubscription";

export function registerChannelRoutes(app: Express) {
  // Get all channels
  app.get("/api/channels", channelsController.getChannels);

  app.post("/api/channels/userid", channelsController.getChannelsByUserId)

  // Get active channel
  app.get("/api/channels/active",requireAuth, channelsController.getActiveChannel);

  // Create channel
  app.post("/api/channels", 
    validateRequest(insertChannelSchema), requireSubscription("channel"), 
    channelsController.createChannel
  );

  // Update channel
  app.put("/api/channels/:id",requireAuth,  channelsController.updateChannel);

  // Delete channel
  app.delete("/api/channels/:id", channelsController.deleteChannel);

  // Check channel health
  app.post("/api/channels/:id/health", channelsController.checkChannelHealth);
  
  // Check all channels health
  app.post("/api/channels/health-check-all", channelsController.checkAllChannelsHealth);
}