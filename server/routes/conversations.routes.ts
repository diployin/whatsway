import type { Express } from "express";
import * as conversationsController from "../controllers/conversations.controller";
import { validateRequest } from "../middlewares/validation.middleware";
import { insertConversationSchema } from "@shared/schema";
import { extractChannelId } from "../middlewares/channel.middleware";

export function registerConversationRoutes(app: Express) {
  // Get all conversations
  app.get("/api/conversations",
    extractChannelId,
    conversationsController.getConversations
  );

  // Get single conversation
  app.get("/api/conversations/:id", conversationsController.getConversation);

  // Create conversation
  app.post("/api/conversations",
    validateRequest(insertConversationSchema),
    conversationsController.createConversation
  );

  // Update conversation
  app.put("/api/conversations/:id", conversationsController.updateConversation);

  // Delete conversation
  app.delete("/api/conversations/:id", conversationsController.deleteConversation);

  // Mark conversation as read
  app.put("/api/conversations/:id/read", conversationsController.markAsRead);
}