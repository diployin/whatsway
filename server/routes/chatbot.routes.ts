import { Router } from 'express';
import * as chatbotController from '../controllers/chatbot.controller';
import type { Express } from "express";
import { requireAuth } from 'server/middlewares/auth.middleware';
import { storage } from 'server/storage';

export function registerChatbotRoutes(app: Express) {

// Chatbot routes
app.post('/api/chatbots', chatbotController.createChatbot);
app.get('/api/chatbots', chatbotController.getAllChatbots);
app.get('/api/chatbots/:id', chatbotController.getChatbot);
app.get('/api/chatbots/uuid/:uuid', chatbotController.getChatbotByUuid);
app.put('/api/chatbots/:id', chatbotController.updateChatbot);
app.delete('/api/chatbots/:id', chatbotController.deleteChatbot);
app.post('/api/training-data', chatbotController.addTrainingData);
app.get('/api/training-data/:chatbotId', chatbotController.getTrainingData);
app.delete('/api/training-data/:id', chatbotController.deleteTrainingData);

// Conversation routes
app.post('/api/conversations', chatbotController.createConversation);
app.post('/api/messages', chatbotController.sendMessage);
app.get('/api/conversations/:conversationId/messages', chatbotController.getConversationMessages);



// Serve static widget files
app.use('/widget', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
  
  // Get widget configuration (public endpoint for embedded widgets)
  app.get("/api/widget/config/:siteId", async (req, res) => {
    // Set CORS headers to allow widget access from any domain
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    
    try {
      const { siteId } = req.params;
      const site = await storage.getSite(siteId);
      
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }
      
      // Get tenant info to retrieve brand name
      const tenant = await storage.getTenant(site.tenantId);
      const tenantSettings = typeof tenant?.settings === 'object' && tenant.settings !== null ? tenant.settings as any : {};
      const brandName = tenantSettings.brandName || '';
      
      // Return widget configuration with brand name
      res.json({
        config: { ...site.widgetConfig || {}, brandName },
        siteId: site.id,
        siteName: site.name
      });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch widget configuration" });
    }
  });
  
  // Handle CORS preflight
  app.options("/api/widget/config/:siteId", (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200);
  });

  // Get widget knowledge base articles (public endpoint)
  app.get("/api/widget/kb/:siteId", async (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    
    try {
      const site = await storage.getSite(req.params.siteId);
      if (!site || !site.widgetEnabled) {
        return res.status(404).json({ error: "Widget not available" });
      }
      
      // Get all categories with their articles for this site - returns tree structure
      const categoriesTree = await storage.getKnowledgeCategoriesTree(req.params.siteId);
      
      // Get all articles for the site
      const allCategories = await storage.getKnowledgeCategories(req.params.siteId);
      const articlesMap = new Map();
      
      // Fetch articles for each category
      for (const category of allCategories) {
        const articles = await storage.getKnowledgeArticles(category.id);
        articlesMap.set(category.id, articles);
      }
      
      // Function to process category tree and add articles
      const processCategoryTree = (categories: any[]): any[] => {
        return categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          articleCount: articlesMap.get(cat.id)?.length || 0,
          articles: (articlesMap.get(cat.id) || []).map(article => ({
            id: article.id,
            title: article.title,
            preview: article.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...', // Strip HTML, show preview
          })),
          subcategories: processCategoryTree(cat.subcategories || [])
        }));
      };
      
      const kbData = {
        categories: processCategoryTree(categoriesTree)
      };
      
      res.json(kbData);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch knowledge base" });
    }
  });

  // Get full article by ID (public endpoint)
  app.get("/api/widget/article/:articleId", async (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    
    try {
      const article = await storage.getKnowledgeArticle(req.params.articleId);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      
      // Verify the article's site has widget enabled
      const category = await storage.getKnowledgeCategory(article.categoryId);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      const site = await storage.getSite(category.siteId);
      if (!site || !site.widgetEnabled) {
        return res.status(404).json({ error: "Widget not available" });
      }
      
      res.json({
        id: article.id,
        title: article.title,
        content: article.content,
      });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch article" });
    }
  });



  
  // ======================
  // Tenant Routes
  // ======================

  app.get("/api/tenants", requireAuth, async (req, res) => {
    try {
      const tenants = await storage.getTenants();
      res.json(tenants);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/tenants/:id", requireAuth, async (req, res) => {
    try {
      const tenant = await storage.getTenant(req.params.id);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }
      // Only allow access to own tenant or admin
      if (req.user?.tenantId !== tenant.id && req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(tenant);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update tenant settings (admin only)
  app.patch("/api/tenants/:id/settings", requireAuth, async (req, res) => {
    try {
      const tenant = await storage.getTenant(req.params.id);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }
      
      // Only allow tenant admin (must match tenant) or super admin (can access any tenant)
      const isSuperAdmin = req.user?.role === "super_admin";
      const isTenantAdmin = req.user?.role === "tenant_admin" && req.user?.tenantId === tenant.id;
      
      if (!isSuperAdmin && !isTenantAdmin) {
        return res.status(403).json({ message: "Only admins can update tenant settings" });
      }

      // Update settings (merge with existing settings)
      const currentSettings = typeof tenant.settings === 'object' ? tenant.settings : {};
      const updatedSettings = { ...currentSettings, ...req.body };
      
      const updatedTenant = await storage.updateTenant(req.params.id, { settings: updatedSettings });
      res.json(updatedTenant);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ======================
  // Site Routes
  // ======================

  app.get("/api/sites", requireAuth, async (req, res) => {
    try {
      // Use authenticated user's tenantId
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        return res.status(400).json({ message: "No tenant associated with user" });
      }
      const sites = await storage.getSitesByTenant(tenantId);
      res.json(sites);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/sites", requireAuth, async (req, res) => {
    try {
      const validated = insertSiteSchema.parse(req.body);
      // Ensure site belongs to user's tenant
      if (validated.tenantId !== req.user?.tenantId && req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const site = await storage.createSite(validated);
      res.json(site);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/sites/:id", requireAuth, async (req, res) => {
    try {
      // Verify site belongs to user's tenant
      const site = await storage.getSite(req.params.id);
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }
      if (site.tenantId !== req.user?.tenantId && req.user?.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Whitelist only safe fields to prevent tenantId/id manipulation
      const safeData: any = {};
      if (req.body.name !== undefined) safeData.name = req.body.name;
      if (req.body.domain !== undefined) safeData.domain = req.body.domain;
      if (req.body.widgetEnabled !== undefined) safeData.widgetEnabled = req.body.widgetEnabled;
      if (req.body.widgetConfig !== undefined) safeData.widgetConfig = req.body.widgetConfig;
      if (req.body.aiTrainingConfig !== undefined) safeData.aiTrainingConfig = req.body.aiTrainingConfig;
      
      const updatedSite = await storage.updateSite(req.params.id, safeData);
      res.json(updatedSite);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });


}