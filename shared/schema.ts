import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channelId: varchar("channel_id"),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  groups: jsonb("groups").default([]),
  tags: jsonb("tags").default([]),
  status: text("status").default("active"), // active, blocked, unsubscribed
  lastContact: timestamp("last_contact"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channelId: varchar("channel_id"),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // marketing, transactional
  apiType: text("api_type").notNull(), // cloud_api, mm_lite
  templateId: varchar("template_id"),
  recipients: jsonb("recipients").default([]),
  status: text("status").default("draft"), // draft, scheduled, active, paused, completed
  scheduledAt: timestamp("scheduled_at"),
  sentCount: integer("sent_count").default(0),
  deliveredCount: integer("delivered_count").default(0),
  readCount: integer("read_count").default(0),
  repliedCount: integer("replied_count").default(0),
  failedCount: integer("failed_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// WhatsApp Business Channels for multi-account support
export const channels = pgTable("channels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phoneNumberId: text("phone_number_id").notNull(),
  accessToken: text("access_token").notNull(),
  whatsappBusinessAccountId: text("whatsapp_business_account_id"),
  phoneNumber: text("phone_number"),
  isActive: boolean("is_active").default(true),
  // MM Lite configuration
  mmLiteEnabled: boolean("mm_lite_enabled").default(false),
  mmLiteApiUrl: text("mm_lite_api_url"),
  mmLiteApiKey: text("mm_lite_api_key"),
  // Health status fields
  healthStatus: text("health_status").default("unknown"), // healthy, warning, error, unknown
  lastHealthCheck: timestamp("last_health_check"),
  healthDetails: jsonb("health_details").default({}), // Detailed health information
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channelId: varchar("channel_id").references(() => channels.id),
  name: text("name").notNull(),
  category: text("category").notNull(), // marketing, transactional, authentication, utility
  language: text("language").default("en_US"),
  header: text("header"),
  body: text("body").notNull(),
  footer: text("footer"),
  buttons: jsonb("buttons").default([]),
  variables: jsonb("variables").default([]),
  status: text("status").default("draft"), // draft, pending, approved, rejected
  // Media support fields
  mediaType: text("media_type").default("text"), // text, image, video, document, carousel
  mediaUrl: text("media_url"), // URL of uploaded media
  mediaHandle: text("media_handle"), // WhatsApp media handle after upload
  carouselCards: jsonb("carousel_cards").default([]), // For carousel templates
  whatsappTemplateId: text("whatsapp_template_id"), // ID from WhatsApp after creation
  usage_count: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channelId: varchar("channel_id"),
  contactId: varchar("contact_id").notNull(),
  contactPhone: varchar("contact_phone"), // Store phone number for webhook lookups
  contactName: varchar("contact_name"), // Store contact name
  assignedTo: varchar("assigned_to"),
  status: text("status").default("open"), // open, closed, assigned
  priority: text("priority").default("normal"), // low, normal, high, urgent
  tags: jsonb("tags").default([]),
  unreadCount: integer("unread_count").default(0), // Track unread messages
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull(),
  whatsappMessageId: varchar("whatsapp_message_id"), // Store WhatsApp message ID
  fromUser: boolean("from_user").default(false),
  direction: varchar("direction").default("outbound"), // inbound, outbound
  content: text("content").notNull(),
  type: text("type").default("text"), // text, image, document, template
  messageType: varchar("message_type"), // For WhatsApp message types
  status: text("status").default("sent"), // sent, delivered, read, failed, received
  timestamp: timestamp("timestamp"), // WhatsApp timestamp
  metadata: jsonb("metadata").default({}), // Store additional WhatsApp data
  createdAt: timestamp("created_at").defaultNow(),
});

export const automations = pgTable("automations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channelId: varchar("channel_id"),
  name: text("name").notNull(),
  description: text("description"),
  trigger: jsonb("trigger").notNull(),
  actions: jsonb("actions").notNull(),
  conditions: jsonb("conditions").default([]),
  status: text("status").default("inactive"), // active, inactive, paused
  executionCount: integer("execution_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channelId: varchar("channel_id"),
  date: timestamp("date").notNull(),
  messagesSent: integer("messages_sent").default(0),
  messagesDelivered: integer("messages_delivered").default(0),
  messagesRead: integer("messages_read").default(0),
  messagesReplied: integer("messages_replied").default(0),
  newContacts: integer("new_contacts").default(0),
  activeCampaigns: integer("active_campaigns").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// WhatsApp Channels table
export const whatsappChannels = pgTable("whatsapp_channels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull().unique(),
  phoneNumberId: varchar("phone_number_id", { length: 50 }).notNull(),
  wabaId: varchar("waba_id", { length: 50 }).notNull(),
  accessToken: text("access_token").notNull(), // Should be encrypted in production
  businessAccountId: varchar("business_account_id", { length: 50 }),
  mmLiteEnabled: boolean("mm_lite_enabled").default(false),
  rateLimitTier: varchar("rate_limit_tier", { length: 20 }).default("standard"),
  qualityRating: varchar("quality_rating", { length: 20 }).default("green"), // green, yellow, red
  status: varchar("status", { length: 20 }).default("inactive"), // active, inactive, error
  errorMessage: text("error_message"),
  lastHealthCheck: timestamp("last_health_check"),
  messageLimit: integer("message_limit"),
  messagesUsed: integer("messages_used"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Webhook Configuration table
export const webhookConfigs = pgTable("webhook_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channelId: varchar("channel_id"), // No foreign key - global webhook for all channels
  webhookUrl: text("webhook_url").notNull(),
  verifyToken: varchar("verify_token", { length: 100 }).notNull(),
  appSecret: text("app_secret"), // For signature verification
  events: jsonb("events").default([]).notNull(), // ['messages', 'message_status', 'message_template_status_update']
  isActive: boolean("is_active").default(true),
  lastPingAt: timestamp("last_ping_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Message Queue table for campaign management
export const messageQueue = pgTable("message_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").references(() => campaigns.id),
  channelId: varchar("channel_id").references(() => whatsappChannels.id),
  recipientPhone: varchar("recipient_phone", { length: 20 }).notNull(),
  templateName: varchar("template_name", { length: 100 }),
  templateParams: jsonb("template_params").default([]),
  messageType: varchar("message_type", { length: 20 }).notNull(), // marketing, utility, authentication
  status: varchar("status", { length: 20 }).default("queued"), // queued, processing, sent, delivered, failed
  attempts: integer("attempts").default(0),
  whatsappMessageId: varchar("whatsapp_message_id", { length: 100 }),
  conversationId: varchar("conversation_id", { length: 100 }),
  sentVia: varchar("sent_via", { length: 20 }), // cloud_api, mm_lite
  cost: varchar("cost", { length: 20 }), // Store as string to avoid decimal precision issues
  errorCode: varchar("error_code", { length: 50 }),
  errorMessage: text("error_message"),
  scheduledFor: timestamp("scheduled_for"),
  processedAt: timestamp("processed_at"),
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// API Request Logs for debugging
export const apiLogs = pgTable("api_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channelId: varchar("channel_id").references(() => whatsappChannels.id),
  requestType: varchar("request_type", { length: 50 }).notNull(), // send_message, get_template, webhook_receive
  endpoint: text("endpoint").notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  requestBody: jsonb("request_body"),
  responseStatus: integer("response_status"),
  responseBody: jsonb("response_body"),
  duration: integer("duration"), // in milliseconds
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, createdAt: true });
export const insertCampaignSchema = createInsertSchema(campaigns).omit({ id: true, createdAt: true });
export const insertChannelSchema = createInsertSchema(channels).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTemplateSchema = createInsertSchema(templates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertAutomationSchema = createInsertSchema(automations).omit({ id: true, createdAt: true });
export const insertAnalyticsSchema = createInsertSchema(analytics).omit({ id: true, createdAt: true });
export const insertWhatsappChannelSchema = createInsertSchema(whatsappChannels).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWebhookConfigSchema = createInsertSchema(webhookConfigs).omit({ id: true, createdAt: true });
export const insertMessageQueueSchema = createInsertSchema(messageQueue).omit({ id: true, createdAt: true });
export const insertApiLogSchema = createInsertSchema(apiLogs).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Channel = typeof channels.$inferSelect;
export type InsertChannel = z.infer<typeof insertChannelSchema>;
export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Automation = typeof automations.$inferSelect;
export type InsertAutomation = z.infer<typeof insertAutomationSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type WhatsappChannel = typeof whatsappChannels.$inferSelect;
export type InsertWhatsappChannel = z.infer<typeof insertWhatsappChannelSchema>;
export type WebhookConfig = typeof webhookConfigs.$inferSelect;
export type InsertWebhookConfig = z.infer<typeof insertWebhookConfigSchema>;
export type MessageQueue = typeof messageQueue.$inferSelect;
export type InsertMessageQueue = z.infer<typeof insertMessageQueueSchema>;
export type ApiLog = typeof apiLogs.$inferSelect;
export type InsertApiLog = z.infer<typeof insertApiLogSchema>;
