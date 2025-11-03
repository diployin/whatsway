// ============================================
// ENHANCED WIDGET ROUTES - With Agent Chat Support
// ============================================

import { Router } from 'express';
import type { Express } from "express";
import { storage } from 'server/storage';
import OpenAI from 'openai';
import { requireAuth } from 'server/middlewares/auth.middleware';
import { insertSiteSchema } from '@shared/schema';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

export function registerWidgetRoutes(app: Express) {
  
  // CORS middleware for widget endpoints
  app.use('/api/widget', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Get widget configuration (public endpoint)
  app.get("/api/widget/config/:siteId", async (req, res) => {
    try {
      const { siteId } = req.params;
      const site = await storage.getSite(siteId);
      
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }
      
      const tenant = await storage.getTenant(site.tenantId);
      const tenantSettings = typeof tenant?.settings === 'object' && tenant.settings !== null ? tenant.settings as any : {};
      const brandName = tenantSettings.brandName || '';
      
      res.json({
        config: { ...site.widgetConfig || {}, brandName },
        siteId: site.id,
        siteName: site.name
      });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch widget configuration" });
    }
  });

  // Get knowledge base articles (public endpoint)
  app.get("/api/widget/kb/:siteId", async (req, res) => {
    try {
      const site = await storage.getSite(req.params.siteId);
      if (!site || !site.widgetEnabled) {
        return res.status(404).json({ error: "Widget not available" });
      }
      
      const categoriesTree = await storage.getKnowledgeCategoriesTree(req.params.siteId);
      const allCategories = await storage.getKnowledgeCategories(req.params.siteId);
      const articlesMap = new Map();
      
      for (const category of allCategories) {
        const articles = await storage.getKnowledgeArticles(category.id);
        articlesMap.set(category.id, articles);
      }
      
      const processCategoryTree = (categories: any[]): any[] => {
        return categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          articleCount: articlesMap.get(cat.id)?.length || 0,
          articles: (articlesMap.get(cat.id) || []).map(article => ({
            id: article.id,
            title: article.title,
            preview: article.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
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

  // Get full article (public endpoint)
  app.get("/api/widget/article/:articleId", async (req, res) => {
    try {
      const article = await storage.getKnowledgeArticle(req.params.articleId);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      
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

  // Save contact from widget (public endpoint)
  app.post("/api/widget/contacts", async (req, res) => {
    try {
      const { siteId, name, email, phone, source } = req.body;
  
      // Validate input
      if (!siteId || !phone) {
        return res.status(400).json({ error: "siteId and phone are required" });
      }
  
      // Check if site exists
      const site = await storage.getSite(siteId);
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }
  
      // Check if contact already exists by phone
      let existingContact = await storage.getContactByPhone(phone);
      if (existingContact) {
        return res.json({
          success: true,
          contactId: existingContact.id,
          message: "Contact already exists",
        });
      }
  
      // Create new contact if not found
      const contact = await storage.createContact({
        tenantId: site.tenantId,
        name,
        email,
        phone,
        source: source || "chat_widget",
        tags: ["widget-lead"],
      });
  
      res.json({ success: true, contactId: contact.id });
    } catch (error: any) {
      console.error("Failed to save contact:", error);
      res.status(500).json({ error: "Failed to save contact" });
    }
  });

  // Handle chat messages with ChatGPT or Agent (public endpoint)
  app.post("/api/widget/chat", async (req, res) => {
    try {
      const { siteId, channelId, sessionId, conversationId, message, visitorInfo } = req.body;
      
      if (!message || !siteId || !sessionId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const site = await storage.getSite(siteId);
      if (!site || !site.widgetEnabled) {
        return res.status(404).json({ error: "Widget not available" });
      }

      // Get or create contact
      let contact = null;
      if (visitorInfo?.email) {
        const contacts = await storage.getContactsByTenant(site.tenantId);
        contact = contacts.find(c => c.email === visitorInfo.email);
        
        if (!contact) {
          contact = await storage.createContact({
            tenantId: site.tenantId,
            name: visitorInfo.name || 'Anonymous',
            email: visitorInfo.email,
            phone: visitorInfo.mobile || '',
            source: 'chat_widget',
            tags: ['widget-user'],
          });
        }
      }

      // Get or create conversation
      let conversation;
      if (conversationId) {
        conversation = await storage.getConversation(conversationId);
      }
      
      if (!conversation) {
        conversation = await storage.createConversation({
          channelId: channelId || null,
          contactId: contact?.id || null,
          contactName: visitorInfo?.name || 'Anonymous',
          contactPhone: visitorInfo?.mobile || '',
          status: 'open',
          type: 'chatbot',
          sessionId: sessionId,
          tags: ['widget-chat'],
        });
      }

      // Save user message
      const userMessage = await storage.createMessage({
        conversationId: conversation.id,
        content: message,
        direction: 'inbound',
        fromUser: true,
        fromType: 'user',
        type: 'text',
        status: 'received',
      });

      // Check if conversation is assigned to an agent
      let assignedAgent = null;
      if (conversation.assignedToId) {
        const agent = await storage.getUser(conversation.assignedToId);
        if (agent) {
          assignedAgent = {
            id: agent.id,
            name: agent.name || agent.email,
            email: agent.email
          };
        }
      }

      // If assigned to agent, don't send AI response - agent will reply manually
      if (assignedAgent) {
        // Update conversation to show new user message
        await storage.updateConversation(conversation.id, {
          lastMessageAt: new Date(),
          lastMessageText: message,
          updatedAt: new Date(),
        });

        return res.json({
          success: true,
          conversationId: conversation.id,
          response: null, // No auto-response when assigned to agent
          assignedAgent: assignedAgent,
          waitingForAgent: true,
          message: "Your message has been sent to our support team. They'll respond shortly."
        });
      }

      // If not assigned, use AI to respond
      // Get conversation history for context
      const messages = await storage.getConversationMessages(conversation.id);
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.fromUser ? 'user' : 'assistant',
        content: msg.content
      }));

      // Get AI training configuration
      const aiConfig = site.aiTrainingConfig || {};
      const systemPrompt = site.systemPrompt || 
        `You are a helpful customer support assistant for ${site.name}. Be friendly, professional, and concise.`;

      // Call ChatGPT API
      const completion = await openai.chat.completions.create({
        model: aiConfig.model || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: message }
        ],
        temperature: aiConfig.temperature || 0.7,
        max_tokens: aiConfig.maxTokens || 500,
      });

      const aiResponse = completion.choices[0]?.message?.content || 
        "I'm sorry, I couldn't generate a response. Please try again.";

      // Save AI response
      const botMessage = await storage.createMessage({
        conversationId: conversation.id,
        content: aiResponse,
        direction: 'outbound',
        fromUser: false,
        fromType: 'bot',
        type: 'text',
        status: 'sent',
      });

      // Update conversation last message
      await storage.updateConversation(conversation.id, {
        lastMessageAt: new Date(),
        lastMessageText: aiResponse,
        updatedAt: new Date(),
      });

      res.json({
        success: true,
        response: aiResponse,
        conversationId: conversation.id,
        messageId: botMessage.id,
        fromType: 'bot'
      });

    } catch (error: any) {
      console.error('Widget chat error:', error);
      res.status(500).json({ 
        error: "Failed to process message",
        message: error.message 
      });
    }
  });

  // Get new messages for a conversation (polling endpoint for widget)
  app.get("/api/widget/messages/:conversationId", async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { lastMessageId } = req.query;
      
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      // Get assigned agent info if exists
      let assignedAgent = null;
      if (conversation.assignedTo) {
        const agent = await storage.getUser(conversation.assignedTo);
        if (agent) {
          assignedAgent = {
            id: agent.id,
            name: agent.firstName || agent.email,
            email: agent.email
          };
        }
      }

      // Get all messages
      const allMessages = await storage.getConversationMessages(conversationId);
      // console.log(`Fetched ${allMessages.length} messages for conversation ${conversationId}`);
      // Filter messages after lastMessageId if provided
      let newMessages = allMessages;
      if (lastMessageId) {
        const lastIndex = allMessages.findIndex(m => m.id === lastMessageId);
        if (lastIndex !== -1) {
          newMessages = allMessages.slice(lastIndex + 1);
        }
      }
console.log(`Returning ${newMessages.length} new messages since ID ${lastMessageId}`);
      // Format messages for widget
      const formattedMessages = newMessages
        .filter(msg => msg.fromUser) // Only return bot/agent messages (user's own messages are already shown)
        .map(msg => ({
          id: msg.id,
          content: msg.content,
          fromUser: msg.fromUser,
          fromType: msg.fromType,
          direction: msg.direction,
          createdAt: msg.createdAt,
        }));

      res.json({ 
        messages: formattedMessages,
        assignedAgent: assignedAgent,
        conversationStatus: conversation.status
      });
    } catch (error: any) {
      console.error('Failed to fetch messages:', error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Send message from agent to widget user (authenticated endpoint)
  app.post("/api/conversations/:conversationId/agent-reply", requireAuth, async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { message } = req.body;
      const userId = req.user?.id;

      if (!message || !userId) {
        return res.status(400).json({ error: "Message and user required" });
      }

      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      // Verify user has access to this conversation's tenant
      if (conversation.tenantId && conversation.tenantId !== req.user?.tenantId && req.user?.role !== 'super_admin') {
        return res.status(403).json({ error: "Access denied" });
      }

      // Assign conversation to this agent if not already assigned
      if (!conversation.assignedToId) {
        await storage.updateConversation(conversationId, {
          assignedToId: userId,
          status: 'in_progress'
        });
      }

      // Create agent message
      const agentMessage = await storage.createMessage({
        conversationId: conversation.id,
        content: message,
        direction: 'outbound',
        fromUser: false,
        fromType: 'agent',
        type: 'text',
        status: 'sent',
        userId: userId
      });

      // Update conversation
      await storage.updateConversation(conversationId, {
        lastMessageAt: new Date(),
        lastMessageText: message,
        updatedAt: new Date(),
      });

      res.json({
        success: true,
        message: agentMessage
      });
    } catch (error: any) {
      console.error('Failed to send agent reply:', error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Assign conversation to agent (authenticated endpoint)
  app.post("/api/conversations/:conversationId/assign", requireAuth, async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { agentId } = req.body;

      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      // Verify permissions
      if (conversation.tenantId && conversation.tenantId !== req.user?.tenantId && req.user?.role !== 'super_admin') {
        return res.status(403).json({ error: "Access denied" });
      }

      // Update assignment
      await storage.updateConversation(conversationId, {
        assignedToId: agentId,
        status: 'in_progress',
        updatedAt: new Date()
      });

      // Get agent info
      const agent = await storage.getUser(agentId);

      // Send system message to conversation
      if (agent) {
        await storage.createMessage({
          conversationId: conversation.id,
          content: `Conversation assigned to ${agent.name || agent.email}`,
          direction: 'internal',
          fromUser: false,
          fromType: 'system',
          type: 'text',
          status: 'sent',
        });
      }

      res.json({
        success: true,
        assignedTo: agent ? {
          id: agent.id,
          name: agent.name || agent.email,
          email: agent.email
        } : null
      });
    } catch (error: any) {
      console.error('Failed to assign conversation:', error);
      res.status(500).json({ error: "Failed to assign conversation" });
    }
  });

  // Get conversation history (optional - for restoring sessions)
  app.get("/api/widget/conversation/:conversationId", async (req, res) => {
    try {
      const { conversationId } = req.params;
      const messages = await storage.getConversationMessages(conversationId);
      
      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        fromUser: msg.fromUser,
        fromType: msg.fromType,
        createdAt: msg.createdAt,
      }));

      res.json({ messages: formattedMessages });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  // Site management routes (authenticated)
  app.get("/api/sites", requireAuth, async (req, res) => {
    try {
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
      const site = await storage.getSite(req.params.id);
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }
      if (site.tenantId !== req.user?.tenantId && req.user?.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const safeData: any = {};
      if (req.body.name !== undefined) safeData.name = req.body.name;
      if (req.body.domain !== undefined) safeData.domain = req.body.domain;
      if (req.body.widgetEnabled !== undefined) safeData.widgetEnabled = req.body.widgetEnabled;
      if (req.body.widgetConfig !== undefined) safeData.widgetConfig = req.body.widgetConfig;
      if (req.body.aiTrainingConfig !== undefined) safeData.aiTrainingConfig = req.body.aiTrainingConfig;
      if (req.body.systemPrompt !== undefined) safeData.systemPrompt = req.body.systemPrompt;
      
      const updatedSite = await storage.updateSite(req.params.id, safeData);
      res.json(updatedSite);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });



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