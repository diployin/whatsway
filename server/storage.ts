import {
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
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Contacts
  getContacts(): Promise<Contact[]>;
  getContact(id: string): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: string, contact: Partial<Contact>): Promise<Contact | undefined>;
  deleteContact(id: string): Promise<boolean>;
  searchContacts(query: string): Promise<Contact[]>;

  // Campaigns
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: string, campaign: Partial<Campaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: string): Promise<boolean>;

  // Templates
  getTemplates(): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: string, template: Partial<Template>): Promise<Template | undefined>;
  deleteTemplate(id: string): Promise<boolean>;

  // Conversations
  getConversations(): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  getConversationByPhone(phone: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, conversation: Partial<Conversation>): Promise<Conversation | undefined>;

  // Messages
  getMessages(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: string, message: Partial<Message>): Promise<Message | undefined>;
  getMessageByWhatsAppId(whatsappMessageId: string): Promise<Message | undefined>;

  // Automations
  getAutomations(): Promise<Automation[]>;
  getAutomation(id: string): Promise<Automation | undefined>;
  createAutomation(automation: InsertAutomation): Promise<Automation>;
  updateAutomation(id: string, automation: Partial<Automation>): Promise<Automation | undefined>;
  deleteAutomation(id: string): Promise<boolean>;

  // Analytics
  getAnalytics(days?: number): Promise<Analytics[]>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  getDashboardStats(): Promise<{
    totalMessages: number;
    activeCampaigns: number;
    deliveryRate: number;
    newLeads: number;
    messagesGrowth: number;
    campaignsRunning: number;
    unreadChats: number;
  }>;

  // Channels
  getChannels(): Promise<Channel[]>;
  getChannel(id: string): Promise<Channel | undefined>;
  createChannel(channel: InsertChannel): Promise<Channel>;
  updateChannel(id: string, channel: Partial<Channel>): Promise<Channel | undefined>;
  deleteChannel(id: string): Promise<boolean>;
  getActiveChannel(): Promise<Channel | undefined>;

  // WhatsApp Channels
  getWhatsappChannels(): Promise<WhatsappChannel[]>;
  getWhatsappChannel(id: string): Promise<WhatsappChannel | undefined>;
  createWhatsappChannel(channel: InsertWhatsappChannel): Promise<WhatsappChannel>;
  updateWhatsappChannel(id: string, channel: Partial<WhatsappChannel>): Promise<WhatsappChannel | undefined>;
  deleteWhatsappChannel(id: string): Promise<boolean>;

  // Webhook Configs
  getWebhookConfigs(): Promise<WebhookConfig[]>;
  getWebhookConfig(channelId: string): Promise<WebhookConfig | undefined>;
  createWebhookConfig(config: InsertWebhookConfig): Promise<WebhookConfig>;
  updateWebhookConfig(id: string, config: Partial<WebhookConfig>): Promise<WebhookConfig | undefined>;

  // Message Queue
  getMessageQueueStats(): Promise<Record<string, number>>;
  getQueuedMessages(limit?: number): Promise<MessageQueue[]>;

  // API Logs
  getApiLogs(channelId?: string, limit?: number): Promise<ApiLog[]>;
  logApiRequest(log: InsertApiLog): Promise<ApiLog | null>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private contacts: Map<string, Contact> = new Map();
  private campaigns: Map<string, Campaign> = new Map();
  private channels: Map<string, Channel> = new Map();
  private templates: Map<string, Template> = new Map();
  private conversations: Map<string, Conversation> = new Map();
  private messages: Map<string, Message> = new Map();
  private automations: Map<string, Automation> = new Map();
  private analytics: Map<string, Analytics> = new Map();
  private whatsappChannels: Map<string, WhatsappChannel> = new Map();
  private webhookConfigs: Map<string, WebhookConfig> = new Map();
  private messageQueues: Map<string, MessageQueue> = new Map();
  private apiLogs: Map<string, ApiLog> = new Map();

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Initialize with some basic structure - no mock data
    const today = new Date();
    const analyticsEntry: Analytics = {
      id: randomUUID(),
      date: today,
      messagesSent: 0,
      messagesDelivered: 0,
      messagesRead: 0,
      messagesReplied: 0,
      newContacts: 0,
      activeCampaigns: 0,
      createdAt: today,
    };
    this.analytics.set(analyticsEntry.id, analyticsEntry);
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Contacts
  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values()).sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getContact(id: string): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = randomUUID();
    const contact: Contact = {
      ...insertContact,
      id,
      createdAt: new Date(),
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact | undefined> {
    const contact = this.contacts.get(id);
    if (!contact) return undefined;

    const updatedContact = { ...contact, ...updates };
    this.contacts.set(id, updatedContact);
    return updatedContact;
  }

  async deleteContact(id: string): Promise<boolean> {
    return this.contacts.delete(id);
  }

  async searchContacts(query: string): Promise<Contact[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.contacts.values()).filter(contact =>
      contact.name.toLowerCase().includes(lowercaseQuery) ||
      contact.phone.includes(query) ||
      contact.email?.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Campaigns
  async getCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values()).sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getCampaign(id: string): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = randomUUID();
    const campaign: Campaign = {
      ...insertCampaign,
      id,
      createdAt: new Date(),
    };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | undefined> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return undefined;

    const updatedCampaign = { ...campaign, ...updates };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async deleteCampaign(id: string): Promise<boolean> {
    return this.campaigns.delete(id);
  }

  // Channels
  async getChannels(): Promise<Channel[]> {
    return Array.from(this.channels.values()).sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getChannel(id: string): Promise<Channel | undefined> {
    return this.channels.get(id);
  }

  async getActiveChannel(): Promise<Channel | undefined> {
    return Array.from(this.channels.values()).find(channel => channel.isActive);
  }

  async createChannel(insertChannel: InsertChannel): Promise<Channel> {
    const id = randomUUID();
    const channel: Channel = {
      ...insertChannel,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.channels.set(id, channel);
    return channel;
  }

  async updateChannel(id: string, updates: Partial<Channel>): Promise<Channel | undefined> {
    const channel = this.channels.get(id);
    if (!channel) return undefined;

    const updatedChannel = { ...channel, ...updates, updatedAt: new Date() };
    this.channels.set(id, updatedChannel);
    return updatedChannel;
  }

  async deleteChannel(id: string): Promise<boolean> {
    return this.channels.delete(id);
  }

  async getActiveChannel(): Promise<Channel | undefined> {
    const channels = Array.from(this.channels.values());
    return channels.find(c => c.isActive) || channels[0];
  }

  // Templates
  async getTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values()).sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = randomUUID();
    const template: Template = {
      ...insertTemplate,
      id,
      createdAt: new Date(),
    };
    this.templates.set(id, template);
    return template;
  }

  async updateTemplate(id: string, updates: Partial<Template>): Promise<Template | undefined> {
    const template = this.templates.get(id);
    if (!template) return undefined;

    const updatedTemplate = { ...template, ...updates };
    this.templates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    return this.templates.delete(id);
  }

  // Conversations
  async getConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).sort((a, b) => 
      (b.lastMessageAt?.getTime() || b.createdAt?.getTime() || 0) - 
      (a.lastMessageAt?.getTime() || a.createdAt?.getTime() || 0)
    );
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationByPhone(phone: string): Promise<Conversation | undefined> {
    return Array.from(this.conversations.values()).find(c => c.contactPhone === phone);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const conversation: Conversation = {
      ...insertConversation,
      id,
      createdAt: new Date(),
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;

    const updatedConversation = { ...conversation, ...updates };
    this.conversations.set(id, updatedConversation);
    return updatedConversation;
  }

  // Messages
  async getMessages(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.messages.set(id, message);

    // Update conversation last message time
    const conversation = this.conversations.get(insertMessage.conversationId);
    if (conversation) {
      this.conversations.set(conversation.id, {
        ...conversation,
        lastMessageAt: new Date(),
      });
    }

    return message;
  }

  async updateMessage(id: string, updates: Partial<Message>): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;

    const updatedMessage = { ...message, ...updates };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  async getMessageByWhatsAppId(whatsappMessageId: string): Promise<Message | undefined> {
    return Array.from(this.messages.values()).find(m => m.whatsappMessageId === whatsappMessageId);
  }

  // Automations
  async getAutomations(): Promise<Automation[]> {
    return Array.from(this.automations.values()).sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getAutomation(id: string): Promise<Automation | undefined> {
    return this.automations.get(id);
  }

  async createAutomation(insertAutomation: InsertAutomation): Promise<Automation> {
    const id = randomUUID();
    const automation: Automation = {
      ...insertAutomation,
      id,
      createdAt: new Date(),
    };
    this.automations.set(id, automation);
    return automation;
  }

  async updateAutomation(id: string, updates: Partial<Automation>): Promise<Automation | undefined> {
    const automation = this.automations.get(id);
    if (!automation) return undefined;

    const updatedAutomation = { ...automation, ...updates };
    this.automations.set(id, updatedAutomation);
    return updatedAutomation;
  }

  async deleteAutomation(id: string): Promise<boolean> {
    return this.automations.delete(id);
  }

  // Analytics
  async getAnalytics(days: number = 30): Promise<Analytics[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return Array.from(this.analytics.values())
      .filter(analytics => analytics.date >= cutoffDate)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const id = randomUUID();
    const analytics: Analytics = {
      ...insertAnalytics,
      id,
      createdAt: new Date(),
    };
    this.analytics.set(id, analytics);
    return analytics;
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
    const campaigns = await this.getCampaigns();
    const contacts = await this.getContacts();
    const conversations = await this.getConversations();
    
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const totalSent = campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0);
    const totalDelivered = campaigns.reduce((sum, c) => sum + (c.deliveredCount || 0), 0);
    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
    
    // Calculate new leads from last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newLeads = contacts.filter(c => c.createdAt && c.createdAt >= weekAgo).length;
    
    const unreadChats = conversations.filter(c => c.status === 'open').length;

    return {
      totalMessages: totalSent,
      activeCampaigns,
      deliveryRate: Math.round(deliveryRate * 10) / 10,
      newLeads,
      messagesGrowth: 12.5, // Would be calculated from historical data
      campaignsRunning: activeCampaigns,
      unreadChats,
    };
  }

  // WhatsApp Channels
  async getWhatsappChannels(): Promise<WhatsappChannel[]> {
    return Array.from(this.whatsappChannels.values());
  }

  async getWhatsappChannel(id: string): Promise<WhatsappChannel | undefined> {
    return this.whatsappChannels.get(id);
  }

  async createWhatsappChannel(insertChannel: InsertWhatsappChannel): Promise<WhatsappChannel> {
    const id = randomUUID();
    const channel: WhatsappChannel = {
      ...insertChannel,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.whatsappChannels.set(id, channel);
    return channel;
  }

  async updateWhatsappChannel(id: string, updates: Partial<WhatsappChannel>): Promise<WhatsappChannel | undefined> {
    const channel = this.whatsappChannels.get(id);
    if (channel) {
      const updated = { ...channel, ...updates, updatedAt: new Date() };
      this.whatsappChannels.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deleteWhatsappChannel(id: string): Promise<boolean> {
    return this.whatsappChannels.delete(id);
  }

  // Webhook Configs
  async getWebhookConfigs(): Promise<WebhookConfig[]> {
    return Array.from(this.webhookConfigs.values());
  }

  async getWebhookConfig(channelId: string): Promise<WebhookConfig | undefined> {
    return Array.from(this.webhookConfigs.values()).find(config => config.channelId === channelId);
  }

  async createWebhookConfig(insertConfig: InsertWebhookConfig): Promise<WebhookConfig> {
    const id = randomUUID();
    const config: WebhookConfig = {
      ...insertConfig,
      id,
      createdAt: new Date(),
    };
    this.webhookConfigs.set(id, config);
    return config;
  }

  async updateWebhookConfig(id: string, updates: Partial<WebhookConfig>): Promise<WebhookConfig | undefined> {
    const config = this.webhookConfigs.get(id);
    if (config) {
      const updated = { ...config, ...updates };
      this.webhookConfigs.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // Message Queue
  async getMessageQueueStats(): Promise<Record<string, number>> {
    const stats: Record<string, number> = {
      queued: 0,
      processing: 0,
      sent: 0,
      delivered: 0,
      failed: 0,
    };
    
    this.messageQueues.forEach(message => {
      if (message.status) {
        stats[message.status] = (stats[message.status] || 0) + 1;
      }
    });
    
    return stats;
  }

  async getQueuedMessages(limit: number = 10): Promise<MessageQueue[]> {
    return Array.from(this.messageQueues.values())
      .filter(msg => msg.status === 'queued')
      .slice(0, limit);
  }

  // API Logs
  async getApiLogs(channelId?: string, limit: number = 100): Promise<ApiLog[]> {
    let logs = Array.from(this.apiLogs.values());
    
    if (channelId) {
      logs = logs.filter(log => log.channelId === channelId);
    }
    
    return logs.slice(-limit);
  }

  async logApiRequest(log: InsertApiLog): Promise<ApiLog | null> {
    try {
      const apiLog: ApiLog = {
        ...log,
        id: Date.now().toString(),
        createdAt: new Date(),
      };
      // Check if channel exists before logging
      if (log.channelId && !this.whatsappChannels.has(log.channelId)) {
        console.error("Channel not found for API log:", log.channelId);
        return null;
      }
      this.apiLogs.set(apiLog.id, apiLog);
      return apiLog;
    } catch (error) {
      console.error("Failed to log API request:", error);
      return null;
    }
  }
}

// export const storage = new MemStorage();

// Import DatabaseStorage and use it instead
import { DatabaseStorage } from "./database-storage";
export const storage = new DatabaseStorage();
