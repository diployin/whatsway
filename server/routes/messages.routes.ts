import type { Express } from "express";
import { storage } from "../storage";

export function registerMessageRoutes(app: Express) {
  // Get all messages
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages({});
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Get single message
  app.get("/api/messages/:id", async (req, res) => {
    try {
      // Get all messages and find the one with matching ID
      const messages = await storage.getMessages({});
      const message = messages.find(m => m.id === req.params.id);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json(message);
    } catch (error) {
      console.error("Error fetching message:", error);
      res.status(500).json({ message: "Failed to fetch message" });
    }
  });

  // Update message status
  app.patch("/api/messages/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const message = await storage.updateMessage(req.params.id, { status });
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json(message);
    } catch (error) {
      console.error("Error updating message status:", error);
      res.status(500).json({ message: "Failed to update message status" });
    }
  });
}