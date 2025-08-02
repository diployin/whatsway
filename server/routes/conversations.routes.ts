import type { Express } from "express";
import * as conversationsController from "../controllers/conversations.controller";
import { validateRequest } from "../middlewares/validation.middleware";
import { insertConversationSchema } from "@shared/schema";
import { extractChannelId } from "../middlewares/channel.middleware";
import { storage } from "../storage";

export function registerConversationRoutes(app: Express) {
  // Get unread count
  app.get('/api/conversations/unread-count', async (req, res) => {
    try {
      const activeChannel = await storage.getActiveChannel();
      if (!activeChannel) {
        return res.json({ count: 0 });
      }
      
      const conversations = await storage.getConversationsByChannel(activeChannel.id);
      const unreadCount = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      
      res.json({ count: unreadCount });
    } catch (error) {
      console.error('Error getting unread count:', error);
      res.json({ count: 0 });
    }
  });
  
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