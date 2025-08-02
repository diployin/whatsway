import type { Express } from "express";
import { storage } from "../storage";

export function registerDashboardRoutes(app: Express) {
  // Get dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const channelId = req.query.channelId as string | undefined;
      
      const [messages, campaigns, templates, contacts, analytics] = await Promise.all([
        storage.getMessages({}),
        storage.getCampaigns(),
        storage.getTemplates(),
        storage.getContacts(),
        storage.getAnalytics()
      ]);

      // Filter by channel if channelId is provided
      const filteredCampaigns = channelId 
        ? campaigns.filter(c => c.channelId === channelId)
        : campaigns;
      
      const filteredTemplates = channelId
        ? templates.filter(t => t.channelId === channelId)
        : templates;
        
      const filteredContacts = channelId
        ? contacts.filter(c => c.channelId === channelId)
        : contacts;
        
      const filteredAnalytics = channelId
        ? analytics.filter(a => a.channelId === channelId)
        : analytics;

      const activeCampaigns = filteredCampaigns.filter(c => c.status === "active").length;
      const pendingTemplates = filteredTemplates.filter(t => t.status === "pending").length;
      const approvedTemplates = filteredTemplates.filter(t => t.status === "approved").length;

      // Calculate message metrics from analytics
      const totalMessages = filteredAnalytics.reduce((sum, a) => sum + (a.messagesSent || 0), 0);
      const deliveredMessages = filteredAnalytics.reduce((sum, a) => sum + (a.messagesDelivered || 0), 0);
      const readMessages = filteredAnalytics.reduce((sum, a) => sum + (a.messagesRead || 0), 0);
      const repliedMessages = filteredAnalytics.reduce((sum, a) => sum + (a.messagesReplied || 0), 0);

      const deliveryRate = totalMessages > 0 ? Math.round((deliveredMessages / totalMessages) * 100) : 0;
      const readRate = deliveredMessages > 0 ? Math.round((readMessages / deliveredMessages) * 100) : 0;
      const responseRate = readMessages > 0 ? Math.round((repliedMessages / readMessages) * 100) : 0;

      res.json({
        totalMessages,
        activeCampaigns,
        deliveryRate,
        readRate,
        responseRate,
        totalContacts: filteredContacts.length,
        pendingTemplates,
        approvedTemplates,
        recentActivity: []
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
}