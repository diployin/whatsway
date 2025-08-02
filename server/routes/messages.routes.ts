import type { Express } from "express";
import * as messagesController from "../controllers/messages.controller";
import { validateRequest } from "../middlewares/validation.middleware";
import { insertMessageSchema } from "@shared/schema";

export function registerMessageRoutes(app: Express) {
  // Get messages for conversation
  app.get("/api/conversations/:conversationId/messages", messagesController.getMessages);

  // Create message in conversation
  app.post("/api/conversations/:conversationId/messages",
    messagesController.createMessage
  );

  // Send WhatsApp message
  app.post("/api/messages/send", messagesController.sendMessage);
}