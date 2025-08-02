import type { Express } from "express";
import { storage } from "../storage";

export function registerAnalyticsRoutes(app: Express) {
  // Get analytics data
  app.get("/api/analytics", async (req, res) => {
    try {
      const channelId = req.query.channelId as string | undefined;
      const analytics = await storage.getAnalytics();
      
      // Filter by channel if channelId is provided
      const filteredAnalytics = channelId 
        ? analytics.filter(a => a.channelId === channelId)
        : analytics;
      
      res.json(filteredAnalytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });
}