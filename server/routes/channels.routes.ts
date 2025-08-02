import type { Express } from "express";
import { storage } from "../storage";
import { insertChannelSchema } from "@shared/schema";

export function registerChannelRoutes(app: Express) {
  // Get all channels
  app.get("/api/channels", async (req, res) => {
    try {
      const channels = await storage.getChannels();
      res.json(channels);
    } catch (error) {
      console.error("Error fetching channels:", error);
      res.status(500).json({ message: "Failed to fetch channels" });
    }
  });

  // Get active channel
  app.get("/api/channels/active", async (req, res) => {
    try {
      const channel = await storage.getActiveChannel();
      res.json(channel || null);
    } catch (error) {
      console.error("Error fetching active channel:", error);
      res.status(500).json({ message: "Failed to fetch active channel" });
    }
  });

  // Update channel health
  app.post("/api/channels/:id/health", async (req, res) => {
    try {
      const channel = await storage.getChannel(req.params.id);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }

      const updated = await storage.updateChannel(req.params.id, {
        lastHealthCheck: new Date()
      });

      res.json(updated);
    } catch (error) {
      console.error("Error updating channel health:", error);
      res.status(500).json({ message: "Failed to update channel health" });
    }
  });

  // Get single channel
  app.get("/api/channels/:id", async (req, res) => {
    try {
      const channel = await storage.getChannel(req.params.id);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      res.json(channel);
    } catch (error) {
      console.error("Error fetching channel:", error);
      res.status(500).json({ message: "Failed to fetch channel" });
    }
  });

  // Create channel
  app.post("/api/channels", async (req, res) => {
    try {
      const data = insertChannelSchema.parse(req.body);
      const channel = await storage.createChannel(data);
      res.status(201).json(channel);
    } catch (error) {
      console.error("Error creating channel:", error);
      res.status(500).json({ message: "Failed to create channel" });
    }
  });

  // Update channel
  app.put("/api/channels/:id", async (req, res) => {
    try {
      const channel = await storage.updateChannel(req.params.id, req.body);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      res.json(channel);
    } catch (error) {
      console.error("Error updating channel:", error);
      res.status(500).json({ message: "Failed to update channel" });
    }
  });

  // Delete channel
  app.delete("/api/channels/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteChannel(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Channel not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting channel:", error);
      res.status(500).json({ message: "Failed to delete channel" });
    }
  });
}