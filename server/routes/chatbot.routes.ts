// ============================================
// ENHANCED WIDGET ROUTES - With Agent Chat Support
// ============================================

import { Router } from 'express';
import type { Express } from "express";
import { storage } from 'server/storage';
import OpenAI from 'openai';
import { requireAuth } from 'server/middlewares/auth.middleware';
import { aiSettings, insertSiteSchema, panelConfig, sites } from '@shared/schema';
import { io } from '../socket';
import { requireSubscription } from 'server/middlewares/requireSubscription';
import { eq } from 'drizzle-orm';
import { db } from 'server/db';

function buildAIClient(aiSetting) {
  if (aiSetting.provider === "openai") {
    return new OpenAI({
      apiKey: aiSetting.apiKey,
      baseURL: aiSetting.endpoint || "https://api.openai.com/v1",
    });
  }

  // Future provider support (Anthropic, Gemini, etc.)
  return new OpenAI({
    apiKey: aiSetting.apiKey,
    baseURL: aiSetting.endpoint || "https://api.openai.com/v1",
  });
}


export function registerWidgetRoutes(app: Express) {
  
  // CORS middleware
  app.use('/api/widget', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Get widget configuration
  app.get("/api/widget/config/:siteId", async (req, res) => {
    try {
      const { siteId } = req.params;
      const site = await storage.getSite(siteId);
      
      
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }
      

      const [brandName] = await db
  .select({
    name: panelConfig.name
  })
  .from(panelConfig);

      
      const name = brandName?.name;
      

res.json({
  config: { ...(site.widgetConfig || {}), brandName: name },
  siteId: site.id,
  siteName: site.name,
  
});
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch widget configuration" });
    }
  });


  // Get knowledge base articles
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

  // Get article
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

  // Save contact
  app.post("/api/widget/contacts",requireSubscription('contacts'), async (req, res) => {
    try {
      const { siteId, name, email, phone, source } = req.body;
      console.log("widget contact body", req.body)
      const site = await storage.getSite(siteId);
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }

      const getCreated = await storage.getChannel(site.channelId!);
      
      // Check if contact exists
      let [contact] = await storage.getContactByEmail(email);
      // return  console.log("site", site ,contact)
      
      if (!contact) {
        contact = await storage.createContact({
          channelId: site?.channelId || null,
          name,
          email,
          phone,
          createdBy: getCreated?.createdBy || null,
          source: source || 'chat_widget',
          tags: ['widget-lead'],
        });
      }

      res.json({ success: true, contactId: contact.id });
    } catch (error: any) {
      console.error('Failed to save contact:', error);
      res.status(500).json({ error: "Failed to save contact" });
    }
  });

// Handle chat messages - WITH REAL-TIME SUPPORT
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

    // 🔹 Detect if user wants human help
    const humanKeywords = [
      "human", "agent", "person", "support", "real person", "real human",
      "representative", "talk to someone", "customer care", "customer support"
    ];
    const wantsHuman = humanKeywords.some((kw) =>
      message.toLowerCase().includes(kw)
    );

    // 🔹 Get or create contact
    let contact = null;
    if (visitorInfo?.email) {
      contact = await storage.getContactByEmail(site.tenantId, visitorInfo.email);
      if (!contact) {
        contact = await storage.createContact({
          tenantId: site.tenantId,
          name: visitorInfo.name || "Anonymous",
          email: visitorInfo.email,
          phone: visitorInfo.mobile || "",
          source: "chat_widget",
          tags: ["widget-user"],
        });
      }
    }

    // 🔹 Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await storage.getConversation(conversationId);
    }
    if (!conversation) {
      conversation = await storage.createConversation({
        channelId: channelId || null,
        contactId: contact?.id || null,
        contactName: visitorInfo?.name || "Anonymous",
        contactPhone: visitorInfo?.mobile || "",
        status: "open",
        type: "chatbot",
        sessionId: sessionId,
        tags: ["widget-chat"],
      });
    }

    // 🔹 Save user message
    const userMessage = await storage.createMessage({
      conversationId: conversation.id,
      content: message,
      direction: "inbound",
      fromUser: true,
      fromType: "user",
      type: "text",
      status: "received",
    });

    // 🔹 Emit user message to agents via Socket.io
    if (io) {
      io.to(`conversation:${conversation.id}`).emit("new_message", {
        conversationId: conversation.id,
        message: {
          id: userMessage.id,
          content: message,
          fromUser: true,
          fromType: "user",
          fromName: visitorInfo?.name || "Visitor",
          createdAt: userMessage.createdAt,
          status: "received",
        },
      });

      await storage.updateMessage(userMessage.id, {
        status: "delivered",
        deliveredAt: new Date(),
      });
    }

    // 🔹 Helper: Assign random agent
    async function assignToRandomAgent(conversation, site) {
      const teamMembers = site?.widgetConfig?.teamMembers || [];
      if (teamMembers.length === 0) return null;

      const randomAgent =
        teamMembers[Math.floor(Math.random() * teamMembers.length)];

      await storage.updateConversation(conversation.id, {
        status: "assigned",
        assignedTo: randomAgent.id,
        updatedAt: new Date(),
      });

      if (io) {
        io.to(`site:${siteId}`).emit("new_conversation_assigned", {
          conversationId: conversation.id,
          agentId: randomAgent.id,
          agentName: randomAgent.name,
        });
      }

      return randomAgent;
    }

    let aiResponse = null;
    let aiMessageId = null;

    const isAssigned =
      conversation.status === "assigned" && conversation.assignedTo;

    // 🔹 If user requests human support
    if (wantsHuman && !isAssigned) {
      const assignedAgent = await assignToRandomAgent(conversation, site);
      if (assignedAgent) {
        aiResponse = `I've connected you with ${assignedAgent.name} from our ${assignedAgent.role} team. They'll assist you shortly.`;
      } else {
        aiResponse = "All our agents are currently offline. Please wait while we connect you soon.";
      }

      const botMessage = await storage.createMessage({
        conversationId: conversation.id,
        content: aiResponse,
        direction: "outbound",
        fromUser: false,
        fromType: "bot",
        type: "text",
        status: "sent",
      });

      if (io) {
        io.to(`conversation:${conversation.id}`).emit("new_message", {
          conversationId: conversation.id,
          message: {
            id: botMessage.id,
            content: aiResponse,
            fromUser: false,
            fromType: "bot",
            fromName: "AI Assistant",
            createdAt: botMessage.createdAt,
            status: "sent",
          },
        });
      }

      return res.json({
        success: true,
        response: aiResponse,
        conversationId: conversation.id,
        messageId: botMessage.id,
        mode: "human",
      });
    }

// 🔹 If conversation is not assigned, use AI
if (!isAssigned) {

  const messages = await storage.getConversationMessages(conversation.id);
  const conversationHistory = messages.slice(-10).map((msg) => ({
    role: msg.fromUser ? "user" : "assistant",
    content: msg.content,
  }));

  const aiSetting = await db
  .select()
  .from(aiSettings)
  .where(eq(aiSettings.channelId, channelId || ""))
  .limit(1);

let activeAI = aiSetting?.[0];

if (!activeAI || !activeAI.isActive) {
  console.warn("⚠ No active AI configured for channel:", channelId);
}

// Build AI client dynamically
let aiClient = null;
if (activeAI?.apiKey) {
  aiClient = buildAIClient(activeAI);
}

  const aiConfig = site.aiTrainingConfig || {};

  // Merge AI settings
  const finalModel = activeAI?.model || aiConfig.model || "gpt-4o-mini";
  const finalTemp = parseFloat(activeAI?.temperature || aiConfig.temperature || "0.7");
  const finalMaxTokens = parseInt(activeAI?.maxTokens || aiConfig.maxTokens || "500");

  const systemPrompt =
    aiConfig.systemPrompt ||
    `You are a helpful support assistant for ${site.name}. Respond based on past messages.`;


  try {
    if (!aiClient) {
      throw new Error("AI client is not initialized. Missing API key.");
    }

    const completion = await aiClient.chat.completions.create({
      model: finalModel,
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
        { role: "user", content: message },
      ],
      temperature: finalTemp,
      max_tokens: finalMaxTokens,
    });

    aiResponse =
      completion.choices?.[0]?.message?.content ||
      "I'm here, but unable to generate a response right now.";

    const botMessage = await storage.createMessage({
      conversationId: conversation.id,
      content: aiResponse,
      direction: "outbound",
      fromUser: false,
      fromType: "bot",
      type: "text",
      status: "sent",
    });

    aiMessageId = botMessage.id;

    if (io) {
      io.to(`conversation:${conversation.id}`).emit("new_message", {
        conversationId: conversation.id,
        message: {
          id: botMessage.id,
          content: aiResponse,
          fromUser: false,
          fromType: "bot",
          fromName: "AI Assistant",
          createdAt: botMessage.createdAt,
          status: "sent",
        },
      });
    }
  } catch (error) {
    console.error("AI provider error:", error.message);

    // Auto-assign fallback
    const assignedAgent = await assignToRandomAgent(conversation, site);

    aiResponse = assignedAgent
      ? `I'm having difficulty responding. I've connected you with ${assignedAgent.name}.`
      : "AI is unavailable and no agent is online right now.";

    const botMessage = await storage.createMessage({
      conversationId: conversation.id,
      content: aiResponse,
      direction: "outbound",
      fromUser: false,
      fromType: "bot",
      type: "text",
      status: "sent",
    });

    if (io) {
      io.to(`conversation:${conversation.id}`).emit("new_message", {
        conversationId: conversation.id,
        message: {
          id: botMessage.id,
          content: aiResponse,
          fromUser: false,
          fromType: "bot",
          fromName: "AI Assistant",
          createdAt: botMessage.createdAt,
          status: "sent",
        },
      });
    }
  }
} else {
      aiResponse = null; // assigned conversation handled by human
    }

    // 🔹 Update conversation
    await storage.updateConversation(conversation.id, {
      lastMessageAt: new Date(),
      lastMessageText: aiResponse || message,
      unreadCount: (conversation.unreadCount || 0) + 1,
      updatedAt: new Date(),
    });

    res.json({
      success: true,
      response: aiResponse,
      conversationId: conversation.id,
      messageId: aiMessageId,
      mode: isAssigned ? "human" : "ai",
    });
  } catch (error) {
    console.error("Widget chat error:", error);
    res.status(500).json({
      error: "Failed to process message",
      message: error.message,
    });
  }
});


  // Get conversation history
  app.get("/api/widget/conversation/:conversationId", async (req, res) => {
    try {
      const { conversationId } = req.params;
      const messages = await storage.getConversationMessages(conversationId);
      
      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        fromUser: msg.fromUser,
        fromType: msg.fromType,
        status: msg.status,
        createdAt: msg.createdAt,
      }));

      res.json({ messages: formattedMessages });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  // Request human agent
  app.post("/api/widget/request-agent", async (req, res) => {
    try {
      const { conversationId, siteId } = req.body;

      if (!conversationId) {
        return res.status(400).json({ error: "Conversation ID required" });
      }

      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      // Check for available agents
      const onlineAgents = io?.getOnlineAgents?.(siteId);
      
      if (!onlineAgents || onlineAgents.length === 0) {
        // No agents online - update status to pending
        await storage.updateConversation(conversationId, {
          status: 'pending',
          updatedAt: new Date()
        });

        // Create system message
        await storage.createMessage({
          conversationId,
          content: "All agents are currently busy. You'll be connected with the next available agent.",
          direction: 'outbound',
          fromUser: false,
          fromType: 'system',
          type: 'text',
          status: 'sent'
        });

        return res.json({
          success: true,
          status: 'pending',
          message: 'No agents available. You are in queue.'
        });
      }

      // Assign to first available agent
      const agent = onlineAgents[0];
      await storage.updateConversation(conversationId, {
        status: 'assigned',
        assignedTo: agent.userId,
        updatedAt: new Date()
      });

      // Create system message
      await storage.createMessage({
        conversationId,
        content: `${agent.name || 'An agent'} has joined the conversation.`,
        direction: 'outbound',
        fromUser: false,
        fromType: 'system',
        type: 'text',
        status: 'sent'
      });

      // Notify agent via Socket.io
      if (io) {
        io.to(`site:${siteId}`).emit('new_conversation_assigned', {
          conversationId,
          agentId: agent.userId
        });
      }

      res.json({
        success: true,
        status: 'assigned',
        agent: {
          id: agent.userId,
          name: agent.name
        }
      });

    } catch (error: any) {
      console.error('Request agent error:', error);
      res.status(500).json({ error: "Failed to request agent" });
    }
  });

  // Site management routes (authenticated)


  app.get("/api/active-site", async (req, res) => {
    try {
      // Use authenticated user's tenantId
      // console.log("active-site-channelId" , req)
      const { channelId } = req.query; 
      // console.log("active-site-channelId" , channelId)

      if (!channelId) {
        return res.status(400).json({ message: "No Channel fount" });
      }

      const [site] = await storage.getSitesByChannel(channelId);
      // console.log("site" , site)
      res.json(site);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/sites", async (req, res) => {
    try {
      // Use authenticated user's tenantId
      // const tenantId = req.user?.id;
      // if (!tenantId) {
      //   return res.status(400).json({ message: "No associated with user" });
      // }
      const sites = await storage.getSites();
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



  app.get("/api/get_sites", requireAuth, async (req, res) => {
    try {
      const sites = await storage.getSites();
      res.status(200).json({success: true, message: 'getting sites successfully',sites});
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });


app.post('/api/sites/create_or_update', requireAuth, async (req, res) => {
  try {
    const validated = insertSiteSchema.parse(req.body);
    const userRole     = req.user?.role;
    // console.log("userRoleee", userRole)
    // console.log("body-site", req.body)

    // if (validated.tenantId !== userTenantId && userRole !== 'super_admin') {
    //   return res.status(403).json({ message: 'Access denied: invalid tenant' });
    // }

    const [existingSite]: any | undefined = await storage.getSitesByChannel(req.body.channelId);

    let site: any;

    if (existingSite) {
      // if (existingSite.tenantId !== userTenantId && userRole !== 'admin') {
      //   return res.status(403).json({ message: 'Access denied: cannot update' });
      // }

      const safeData: any = {};
      if (validated.name              !== undefined) safeData.name              = validated.name;
      if (validated.domain            !== undefined) safeData.domain            = validated.domain;
      if (validated.widgetEnabled     !== undefined) safeData.widgetEnabled     = validated.widgetEnabled;
      if (validated.widgetConfig      !== undefined) safeData.widgetConfig      = validated.widgetConfig;
      if (validated.aiTrainingConfig  !== undefined) safeData.aiTrainingConfig  = validated.aiTrainingConfig;
      // if (validated.systemPrompt      !== undefined) safeData.systemPrompt      = validated.systemPrompt;
      
      site = await storage.updateSite(existingSite.id, safeData);
    } else {
      site = await storage.createSite(validated);
    }

    return res.status(200).json(site);

  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

  // new api for api sites create end
}





