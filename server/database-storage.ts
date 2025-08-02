import { db } from "./db";
import { eq, and, desc, sql, gte, gt } from "drizzle-orm";
import {
  users,
  contacts,
  campaigns,
  channels,
  templates,
  conversations,
  messages,
  automations,
  analytics,
  whatsappChannels,
  webhookConfigs,
  messageQueue,
  apiLogs,
  type User,
  type InsertUser,
  type Contact,
  type InsertContact,
  type Campaign,
  type InsertCampaign,
  type Channel,
  type InsertChannel,
  type Template,
  type InsertTemplate,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type Automation,
  type InsertAutomation,
  type Analytics,
  type InsertAnalytics,
  type WhatsappChannel,
  type InsertWhatsappChannel,
  type WebhookConfig,
  type InsertWebhookConfig,
  type MessageQueue,
  type InsertMessageQueue,
  type ApiLog,
  type InsertApiLog,
} from "@shared/schema";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Contacts
  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }

  async getContact(id: string): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact || undefined;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(insertContact)
      .returning();
    return contact;
  }

  async updateContact(id: string, contact: Partial<Contact>): Promise<Contact | undefined> {
    const [updated] = await db
      .update(contacts)
      .set(contact)
      .where(eq(contacts.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteContact(id: string): Promise<boolean> {
    const result = await db.delete(contacts).where(eq(contacts.id, id)).returning();
    return result.length > 0;
  }

  async searchContacts(query: string): Promise<Contact[]> {
    const searchPattern = `%${query}%`;
    return await db
      .select()
      .from(contacts)
      .where(
        sql`${contacts.name} ILIKE ${searchPattern} OR ${contacts.phone} ILIKE ${searchPattern} OR ${contacts.email} ILIKE ${searchPattern}`
      );
  }

  // Campaigns
  async getCampaigns(): Promise<Campaign[]> {
    return await db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
  }

  async getCampaign(id: string): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign || undefined;
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const [campaign] = await db
      .insert(campaigns)
      .values(insertCampaign)
      .returning();
    return campaign;
  }

  async updateCampaign(id: string, campaign: Partial<Campaign>): Promise<Campaign | undefined> {
    const [updated] = await db
      .update(campaigns)
      .set(campaign)
      .where(eq(campaigns.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteCampaign(id: string): Promise<boolean> {
    const result = await db.delete(campaigns).where(eq(campaigns.id, id)).returning();
    return result.length > 0;
  }

  // Channels
  async getChannels(): Promise<Channel[]> {
    return await db.select().from(channels).orderBy(desc(channels.createdAt));
  }

  async getChannel(id: string): Promise<Channel | undefined> {
    const [channel] = await db.select().from(channels).where(eq(channels.id, id));
    return channel || undefined;
  }

  async createChannel(insertChannel: InsertChannel): Promise<Channel> {
    const [channel] = await db
      .insert(channels)
      .values(insertChannel)
      .returning();
    return channel;
  }

  async updateChannel(id: string, channel: Partial<Channel>): Promise<Channel | undefined> {
    const [updated] = await db
      .update(channels)
      .set(channel)
      .where(eq(channels.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteChannel(id: string): Promise<boolean> {
    const result = await db.delete(channels).where(eq(channels.id, id)).returning();
    return result.length > 0;
  }

  async getActiveChannel(): Promise<Channel | undefined> {
    const [channel] = await db
      .select()
      .from(channels)
      .where(eq(channels.isActive, true))
      .orderBy(desc(channels.createdAt));
    return channel || undefined;
  }

  // Templates
  async getTemplates(): Promise<Template[]> {
    return await db.select().from(templates).orderBy(desc(templates.createdAt));
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || undefined;
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const [template] = await db
      .insert(templates)
      .values(insertTemplate)
      .returning();
    return template;
  }

  async updateTemplate(id: string, template: Partial<Template>): Promise<Template | undefined> {
    const [updated] = await db
      .update(templates)
      .set(template)
      .where(eq(templates.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const result = await db.delete(templates).where(eq(templates.id, id)).returning();
    return result.length > 0;
  }

  // Conversations
  async getConversations(): Promise<Conversation[]> {
    return await db.select().from(conversations).orderBy(desc(conversations.lastMessageAt));
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation || undefined;
  }

  async getConversationByPhone(phone: string): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.contactPhone, phone));
    return conversation || undefined;
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values(insertConversation)
      .returning();
    return conversation;
  }

  async updateConversation(id: string, conversation: Partial<Conversation>): Promise<Conversation | undefined> {
    const [updated] = await db
      .update(conversations)
      .set(conversation)
      .where(eq(conversations.id, id))
      .returning();
    return updated || undefined;
  }

  // Messages
  async getMessages(conversationId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async updateMessage(id: string, message: Partial<Message>): Promise<Message | undefined> {
    const [updated] = await db
      .update(messages)
      .set(message)
      .where(eq(messages.id, id))
      .returning();
    return updated || undefined;
  }

  async getMessageByWhatsAppId(whatsappMessageId: string): Promise<Message | undefined> {
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.whatsappMessageId, whatsappMessageId));
    return message || undefined;
  }

  // Automations
  async getAutomations(): Promise<Automation[]> {
    return await db.select().from(automations).orderBy(desc(automations.createdAt));
  }

  async getAutomation(id: string): Promise<Automation | undefined> {
    const [automation] = await db.select().from(automations).where(eq(automations.id, id));
    return automation || undefined;
  }

  async createAutomation(insertAutomation: InsertAutomation): Promise<Automation> {
    const [automation] = await db
      .insert(automations)
      .values(insertAutomation)
      .returning();
    return automation;
  }

  async updateAutomation(id: string, automation: Partial<Automation>): Promise<Automation | undefined> {
    const [updated] = await db
      .update(automations)
      .set(automation)
      .where(eq(automations.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteAutomation(id: string): Promise<boolean> {
    const result = await db.delete(automations).where(eq(automations.id, id)).returning();
    return result.length > 0;
  }

  // Analytics
  async getAnalytics(days?: number): Promise<Analytics[]> {
    const startDate = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : undefined;
    const query = startDate
      ? db.select().from(analytics).where(gte(analytics.date, startDate))
      : db.select().from(analytics);
    return await query.orderBy(analytics.date);
  }

  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const [analytic] = await db
      .insert(analytics)
      .values(insertAnalytics)
      .returning();
    return analytic;
  }

  async getDashboardStats(): Promise<{
    totalMessages: number;
    activeCampaigns: number;
    deliveryRate: number;
    newLeads: number;
    messagesGrowth: number;
    campaignsRunning: number;
    unreadChats: number;
  }> {
    // Get total messages count
    const [messageCountResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages);
    const totalMessages = Number(messageCountResult?.count || 0);

    // Get active campaigns count
    const [activeCampaignResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(campaigns)
      .where(eq(campaigns.status, "active"));
    const activeCampaigns = Number(activeCampaignResult?.count || 0);
    const campaignsRunning = activeCampaigns;

    // Get unread chats count
    const [unreadChatsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(conversations)
      .where(gt(conversations.unreadCount, 0));
    const unreadChats = Number(unreadChatsResult?.count || 0);

    // Calculate delivery rate (mock for now, would need message status tracking)
    const deliveryRate = totalMessages > 0 ? 92 : 0;

    // Calculate new leads (contacts created in last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [newLeadsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(contacts)
      .where(gte(contacts.createdAt, sevenDaysAgo));
    const newLeads = Number(newLeadsResult?.count || 0);

    // Calculate growth (mock for now)
    const messagesGrowth = 12.5;

    return {
      totalMessages,
      activeCampaigns,
      deliveryRate,
      newLeads,
      messagesGrowth,
      campaignsRunning,
      unreadChats,
    };
  }

  // WhatsApp Channels
  async getWhatsappChannels(): Promise<WhatsappChannel[]> {
    return await db.select().from(whatsappChannels).orderBy(desc(whatsappChannels.createdAt));
  }

  async getWhatsappChannel(id: string): Promise<WhatsappChannel | undefined> {
    const [channel] = await db.select().from(whatsappChannels).where(eq(whatsappChannels.id, id));
    return channel || undefined;
  }

  async createWhatsappChannel(insertChannel: InsertWhatsappChannel): Promise<WhatsappChannel> {
    const [channel] = await db
      .insert(whatsappChannels)
      .values(insertChannel)
      .returning();
    return channel;
  }

  async updateWhatsappChannel(id: string, channel: Partial<WhatsappChannel>): Promise<WhatsappChannel | undefined> {
    const [updated] = await db
      .update(whatsappChannels)
      .set({
        ...channel,
        updatedAt: new Date(),
      })
      .where(eq(whatsappChannels.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteWhatsappChannel(id: string): Promise<boolean> {
    const result = await db.delete(whatsappChannels).where(eq(whatsappChannels.id, id)).returning();
    return result.length > 0;
  }

  // Webhook Configs
  async getWebhookConfigs(): Promise<WebhookConfig[]> {
    return await db.select().from(webhookConfigs).orderBy(desc(webhookConfigs.createdAt));
  }

  async getWebhookConfig(channelId: string): Promise<WebhookConfig | undefined> {
    const [config] = await db.select().from(webhookConfigs).where(eq(webhookConfigs.channelId, channelId));
    return config || undefined;
  }

  async createWebhookConfig(insertConfig: InsertWebhookConfig): Promise<WebhookConfig> {
    const [config] = await db
      .insert(webhookConfigs)
      .values(insertConfig)
      .returning();
    return config;
  }

  async updateWebhookConfig(id: string, config: Partial<WebhookConfig>): Promise<WebhookConfig | undefined> {
    const [updated] = await db
      .update(webhookConfigs)
      .set(config)
      .where(eq(webhookConfigs.id, id))
      .returning();
    return updated || undefined;
  }

  // Message Queue
  async getMessageQueueStats(): Promise<Record<string, number>> {
    const results = await db
      .select({
        status: messageQueue.status,
        count: sql<number>`count(*)`,
      })
      .from(messageQueue)
      .groupBy(messageQueue.status);
    
    const stats: Record<string, number> = {};
    results.forEach(({ status, count }) => {
      if (status) stats[status] = Number(count);
    });
    return stats;
  }

  async getQueuedMessages(limit?: number): Promise<MessageQueue[]> {
    const query = db
      .select()
      .from(messageQueue)
      .where(eq(messageQueue.status, "queued"))
      .orderBy(messageQueue.createdAt);
    
    if (limit) {
      return await query.limit(limit);
    }
    return await query;
  }

  // API Logs
  async getApiLogs(channelId?: string, limit?: number): Promise<ApiLog[]> {
    const query = channelId
      ? db.select().from(apiLogs).where(eq(apiLogs.channelId, channelId))
      : db.select().from(apiLogs);
    
    const orderedQuery = query.orderBy(desc(apiLogs.createdAt));
    
    if (limit) {
      return await orderedQuery.limit(limit);
    }
    return await orderedQuery;
  }

  async logApiRequest(log: InsertApiLog): Promise<ApiLog | null> {
    try {
      const [apiLog] = await db
        .insert(apiLogs)
        .values(log)
        .returning();
      return apiLog;
    } catch (error) {
      console.error("Failed to log API request to database:", error);
      return null;
    }
  }
}