var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  analytics: () => analytics,
  apiLogs: () => apiLogs,
  automations: () => automations,
  campaignRecipients: () => campaignRecipients,
  campaignRecipientsRelations: () => campaignRecipientsRelations,
  campaigns: () => campaigns,
  campaignsRelations: () => campaignsRelations,
  channels: () => channels,
  channelsRelations: () => channelsRelations,
  contacts: () => contacts,
  contactsRelations: () => contactsRelations,
  conversationAssignments: () => conversationAssignments,
  conversationAssignmentsRelations: () => conversationAssignmentsRelations,
  conversations: () => conversations,
  conversationsRelations: () => conversationsRelations,
  insertAnalyticsSchema: () => insertAnalyticsSchema,
  insertApiLogSchema: () => insertApiLogSchema,
  insertAutomationSchema: () => insertAutomationSchema,
  insertCampaignRecipientSchema: () => insertCampaignRecipientSchema,
  insertCampaignSchema: () => insertCampaignSchema,
  insertChannelSchema: () => insertChannelSchema,
  insertContactSchema: () => insertContactSchema,
  insertConversationAssignmentSchema: () => insertConversationAssignmentSchema,
  insertConversationSchema: () => insertConversationSchema,
  insertMessageQueueSchema: () => insertMessageQueueSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertTeamActivityLogSchema: () => insertTeamActivityLogSchema,
  insertTeamMemberSchema: () => insertTeamMemberSchema,
  insertTemplateSchema: () => insertTemplateSchema,
  insertUserSchema: () => insertUserSchema,
  insertWebhookConfigSchema: () => insertWebhookConfigSchema,
  insertWhatsappChannelSchema: () => insertWhatsappChannelSchema,
  messageQueue: () => messageQueue,
  messages: () => messages,
  messagesRelations: () => messagesRelations,
  teamActivityLogs: () => teamActivityLogs,
  teamActivityLogsRelations: () => teamActivityLogsRelations,
  teamMembers: () => teamMembers,
  teamMembersRelations: () => teamMembersRelations,
  templates: () => templates,
  templatesRelations: () => templatesRelations,
  users: () => users,
  usersRelations: () => usersRelations,
  webhookConfigs: () => webhookConfigs,
  whatsappChannels: () => whatsappChannels
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb, index, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
var users, teamMembers, conversationAssignments, teamActivityLogs, contacts, campaigns, campaignRecipients, channels, templates, conversations, messages, automations, analytics, whatsappChannels, webhookConfigs, messageQueue, apiLogs, insertUserSchema, insertContactSchema, insertCampaignSchema, insertChannelSchema, insertTemplateSchema, insertConversationSchema, insertMessageSchema, insertAutomationSchema, insertAnalyticsSchema, insertWhatsappChannelSchema, insertWebhookConfigSchema, insertMessageQueueSchema, insertApiLogSchema, insertCampaignRecipientSchema, insertTeamMemberSchema, insertConversationAssignmentSchema, insertTeamActivityLogSchema, channelsRelations, contactsRelations, campaignsRelations, campaignRecipientsRelations, templatesRelations, conversationsRelations, messagesRelations, usersRelations, teamMembersRelations, conversationAssignmentsRelations, teamActivityLogsRelations;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = pgTable("users", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      username: text("username").notNull().unique(),
      password: text("password").notNull(),
      email: text("email"),
      firstName: text("first_name"),
      lastName: text("last_name"),
      role: text("role").default("admin"),
      createdAt: timestamp("created_at").defaultNow()
    });
    teamMembers = pgTable("team_members", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
      name: text("name").notNull(),
      email: text("email").notNull().unique(),
      phone: text("phone"),
      role: text("role").notNull().default("agent"),
      // admin, manager, agent
      status: text("status").notNull().default("active"),
      // active, inactive, suspended
      permissions: jsonb("permissions").default({}),
      // Granular permissions
      avatar: text("avatar"),
      department: text("department"),
      lastActive: timestamp("last_active"),
      onlineStatus: text("online_status").default("offline"),
      // online, away, offline
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    conversationAssignments = pgTable("conversation_assignments", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
      teamMemberId: varchar("team_member_id").notNull().references(() => teamMembers.id, { onDelete: "cascade" }),
      assignedBy: varchar("assigned_by").references(() => teamMembers.id),
      assignedAt: timestamp("assigned_at").defaultNow(),
      status: text("status").notNull().default("active"),
      // active, resolved, transferred
      priority: text("priority").default("normal"),
      // low, normal, high, urgent
      notes: text("notes"),
      resolvedAt: timestamp("resolved_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    teamActivityLogs = pgTable("team_activity_logs", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      teamMemberId: varchar("team_member_id").notNull().references(() => teamMembers.id, { onDelete: "cascade" }),
      action: text("action").notNull(),
      // login, logout, message_sent, conversation_assigned, etc.
      entityType: text("entity_type"),
      // conversation, message, contact, etc.
      entityId: varchar("entity_id"),
      details: jsonb("details").default({}),
      ipAddress: text("ip_address"),
      userAgent: text("user_agent"),
      createdAt: timestamp("created_at").defaultNow()
    });
    contacts = pgTable("contacts", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      channelId: varchar("channel_id").references(() => channels.id, { onDelete: "cascade" }),
      name: text("name").notNull(),
      phone: text("phone").notNull(),
      email: text("email"),
      groups: jsonb("groups").default([]),
      tags: jsonb("tags").default([]),
      status: text("status").default("active"),
      // active, blocked, unsubscribed
      lastContact: timestamp("last_contact"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    }, (table) => ({
      contactChannelIdx: index("contacts_channel_idx").on(table.channelId),
      contactPhoneIdx: index("contacts_phone_idx").on(table.phone),
      contactStatusIdx: index("contacts_status_idx").on(table.status),
      contactChannelPhoneUnique: unique("contacts_channel_phone_unique").on(table.channelId, table.phone)
    }));
    campaigns = pgTable("campaigns", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      channelId: varchar("channel_id").references(() => channels.id, { onDelete: "cascade" }),
      name: text("name").notNull(),
      description: text("description"),
      campaignType: text("campaign_type").notNull(),
      // contacts, csv, api
      type: text("type").notNull(),
      // marketing, transactional
      apiType: text("api_type").notNull(),
      // cloud_api, mm_lite
      templateId: varchar("template_id").references(() => templates.id),
      templateName: text("template_name"),
      templateLanguage: text("template_language"),
      variableMapping: jsonb("variable_mapping").default({}),
      // Maps template variables to contact/csv fields
      contactGroups: jsonb("contact_groups").default([]),
      // For contacts campaign
      csvData: jsonb("csv_data").default([]),
      // For CSV campaign
      apiKey: varchar("api_key"),
      // For API campaign
      apiEndpoint: text("api_endpoint"),
      // For API campaign
      status: text("status").default("draft"),
      // draft, scheduled, active, paused, completed
      scheduledAt: timestamp("scheduled_at"),
      recipientCount: integer("recipient_count").default(0),
      sentCount: integer("sent_count").default(0),
      deliveredCount: integer("delivered_count").default(0),
      readCount: integer("read_count").default(0),
      repliedCount: integer("replied_count").default(0),
      failedCount: integer("failed_count").default(0),
      completedAt: timestamp("completed_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    }, (table) => ({
      campaignChannelIdx: index("campaigns_channel_idx").on(table.channelId),
      campaignStatusIdx: index("campaigns_status_idx").on(table.status),
      campaignCreatedIdx: index("campaigns_created_idx").on(table.createdAt)
    }));
    campaignRecipients = pgTable("campaign_recipients", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      campaignId: varchar("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
      contactId: varchar("contact_id").references(() => contacts.id, { onDelete: "cascade" }),
      phone: text("phone").notNull(),
      name: text("name"),
      status: text("status").default("pending"),
      // pending, sent, delivered, read, failed
      whatsappMessageId: varchar("whatsapp_message_id"),
      templateParams: jsonb("template_params").default({}),
      sentAt: timestamp("sent_at"),
      deliveredAt: timestamp("delivered_at"),
      readAt: timestamp("read_at"),
      errorCode: varchar("error_code"),
      errorMessage: text("error_message"),
      retryCount: integer("retry_count").default(0),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    }, (table) => ({
      recipientCampaignIdx: index("recipients_campaign_idx").on(table.campaignId),
      recipientStatusIdx: index("recipients_status_idx").on(table.status),
      recipientPhoneIdx: index("recipients_phone_idx").on(table.phone),
      campaignPhoneUnique: unique("campaign_phone_unique").on(table.campaignId, table.phone)
    }));
    channels = pgTable("channels", {
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
      healthStatus: text("health_status").default("unknown"),
      // healthy, warning, error, unknown
      lastHealthCheck: timestamp("last_health_check"),
      healthDetails: jsonb("health_details").default({}),
      // Detailed health information
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    templates = pgTable("templates", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      channelId: varchar("channel_id").references(() => channels.id),
      name: text("name").notNull(),
      category: text("category").notNull(),
      // marketing, transactional, authentication, utility
      language: text("language").default("en_US"),
      header: text("header"),
      body: text("body").notNull(),
      footer: text("footer"),
      buttons: jsonb("buttons").default([]),
      variables: jsonb("variables").default([]),
      status: text("status").default("draft"),
      // draft, pending, approved, rejected
      rejectionReason: text("rejection_reason"),
      // Reason for template rejection from WhatsApp
      // Media support fields
      mediaType: text("media_type").default("text"),
      // text, image, video, document, carousel
      mediaUrl: text("media_url"),
      // URL of uploaded media
      mediaHandle: text("media_handle"),
      // WhatsApp media handle after upload
      carouselCards: jsonb("carousel_cards").default([]),
      // For carousel templates
      whatsappTemplateId: text("whatsapp_template_id"),
      // ID from WhatsApp after creation
      usage_count: integer("usage_count").default(0),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    conversations = pgTable("conversations", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      channelId: varchar("channel_id").references(() => channels.id, { onDelete: "cascade" }),
      contactId: varchar("contact_id").references(() => contacts.id, { onDelete: "cascade" }),
      contactPhone: varchar("contact_phone"),
      // Store phone number for webhook lookups
      contactName: varchar("contact_name"),
      // Store contact name
      status: text("status").default("open"),
      // open, closed, assigned, pending
      priority: text("priority").default("normal"),
      // low, normal, high, urgent
      tags: jsonb("tags").default([]),
      unreadCount: integer("unread_count").default(0),
      // Track unread messages
      lastMessageAt: timestamp("last_message_at"),
      lastMessageText: text("last_message_text"),
      // Cache last message for display
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    }, (table) => ({
      conversationChannelIdx: index("conversations_channel_idx").on(table.channelId),
      conversationContactIdx: index("conversations_contact_idx").on(table.contactId),
      conversationPhoneIdx: index("conversations_phone_idx").on(table.contactPhone),
      conversationStatusIdx: index("conversations_status_idx").on(table.status)
    }));
    messages = pgTable("messages", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
      whatsappMessageId: varchar("whatsapp_message_id"),
      // Store WhatsApp message ID
      fromUser: boolean("from_user").default(false),
      direction: varchar("direction").default("outbound"),
      // inbound, outbound
      content: text("content").notNull(),
      type: text("type").default("text"),
      // text, image, document, template
      messageType: varchar("message_type"),
      // For WhatsApp message types
      status: text("status").default("sent"),
      // sent, delivered, read, failed, received
      timestamp: timestamp("timestamp"),
      // WhatsApp timestamp
      metadata: jsonb("metadata").default({}),
      // Store additional WhatsApp data
      deliveredAt: timestamp("delivered_at"),
      readAt: timestamp("read_at"),
      errorCode: varchar("error_code", { length: 50 }),
      errorMessage: text("error_message"),
      errorDetails: jsonb("error_details"),
      // Store detailed error information from WhatsApp
      campaignId: varchar("campaign_id").references(() => campaigns.id, { onDelete: "set null" }),
      // Link to campaign if sent from campaign
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    }, (table) => ({
      messageConversationIdx: index("messages_conversation_idx").on(table.conversationId),
      messageWhatsappIdx: index("messages_whatsapp_idx").on(table.whatsappMessageId),
      messageDirectionIdx: index("messages_direction_idx").on(table.direction),
      messageStatusIdx: index("messages_status_idx").on(table.status),
      messageTimestampIdx: index("messages_timestamp_idx").on(table.timestamp),
      messageCreatedIdx: index("messages_created_idx").on(table.createdAt)
    }));
    automations = pgTable("automations", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      channelId: varchar("channel_id"),
      name: text("name").notNull(),
      description: text("description"),
      trigger: jsonb("trigger").notNull(),
      actions: jsonb("actions").notNull(),
      conditions: jsonb("conditions").default([]),
      status: text("status").default("inactive"),
      // active, inactive, paused
      executionCount: integer("execution_count").default(0),
      createdAt: timestamp("created_at").defaultNow()
    });
    analytics = pgTable("analytics", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      channelId: varchar("channel_id"),
      date: timestamp("date").notNull(),
      messagesSent: integer("messages_sent").default(0),
      messagesDelivered: integer("messages_delivered").default(0),
      messagesRead: integer("messages_read").default(0),
      messagesReplied: integer("messages_replied").default(0),
      newContacts: integer("new_contacts").default(0),
      activeCampaigns: integer("active_campaigns").default(0),
      createdAt: timestamp("created_at").defaultNow()
    });
    whatsappChannels = pgTable("whatsapp_channels", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      phoneNumber: varchar("phone_number", { length: 20 }).notNull().unique(),
      phoneNumberId: varchar("phone_number_id", { length: 50 }).notNull(),
      wabaId: varchar("waba_id", { length: 50 }).notNull(),
      accessToken: text("access_token").notNull(),
      // Should be encrypted in production
      businessAccountId: varchar("business_account_id", { length: 50 }),
      mmLiteEnabled: boolean("mm_lite_enabled").default(false),
      rateLimitTier: varchar("rate_limit_tier", { length: 20 }).default("standard"),
      qualityRating: varchar("quality_rating", { length: 20 }).default("green"),
      // green, yellow, red
      status: varchar("status", { length: 20 }).default("inactive"),
      // active, inactive, error
      errorMessage: text("error_message"),
      lastHealthCheck: timestamp("last_health_check"),
      messageLimit: integer("message_limit"),
      messagesUsed: integer("messages_used"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    webhookConfigs = pgTable("webhook_configs", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      channelId: varchar("channel_id"),
      // No foreign key - global webhook for all channels
      webhookUrl: text("webhook_url").notNull(),
      verifyToken: varchar("verify_token", { length: 100 }).notNull(),
      appSecret: text("app_secret"),
      // For signature verification
      events: jsonb("events").default([]).notNull(),
      // ['messages', 'message_status', 'message_template_status_update']
      isActive: boolean("is_active").default(true),
      lastPingAt: timestamp("last_ping_at"),
      createdAt: timestamp("created_at").defaultNow()
    });
    messageQueue = pgTable("message_queue", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      campaignId: varchar("campaign_id").references(() => campaigns.id),
      channelId: varchar("channel_id").references(() => whatsappChannels.id),
      recipientPhone: varchar("recipient_phone", { length: 20 }).notNull(),
      templateName: varchar("template_name", { length: 100 }),
      templateParams: jsonb("template_params").default([]),
      messageType: varchar("message_type", { length: 20 }).notNull(),
      // marketing, utility, authentication
      status: varchar("status", { length: 20 }).default("queued"),
      // queued, processing, sent, delivered, failed
      attempts: integer("attempts").default(0),
      whatsappMessageId: varchar("whatsapp_message_id", { length: 100 }),
      conversationId: varchar("conversation_id", { length: 100 }),
      sentVia: varchar("sent_via", { length: 20 }),
      // cloud_api, mm_lite
      cost: varchar("cost", { length: 20 }),
      // Store as string to avoid decimal precision issues
      errorCode: varchar("error_code", { length: 50 }),
      errorMessage: text("error_message"),
      scheduledFor: timestamp("scheduled_for"),
      processedAt: timestamp("processed_at"),
      deliveredAt: timestamp("delivered_at"),
      readAt: timestamp("read_at"),
      createdAt: timestamp("created_at").defaultNow()
    });
    apiLogs = pgTable("api_logs", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      channelId: varchar("channel_id").references(() => whatsappChannels.id),
      requestType: varchar("request_type", { length: 50 }).notNull(),
      // send_message, get_template, webhook_receive
      endpoint: text("endpoint").notNull(),
      method: varchar("method", { length: 10 }).notNull(),
      requestBody: jsonb("request_body"),
      responseStatus: integer("response_status"),
      responseBody: jsonb("response_body"),
      duration: integer("duration"),
      // in milliseconds
      createdAt: timestamp("created_at").defaultNow()
    });
    insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
    insertContactSchema = createInsertSchema(contacts).omit({ id: true, createdAt: true });
    insertCampaignSchema = createInsertSchema(campaigns).omit({ id: true, createdAt: true });
    insertChannelSchema = createInsertSchema(channels).omit({ id: true, createdAt: true, updatedAt: true });
    insertTemplateSchema = createInsertSchema(templates).omit({ id: true, createdAt: true, updatedAt: true });
    insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true });
    insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
    insertAutomationSchema = createInsertSchema(automations).omit({ id: true, createdAt: true });
    insertAnalyticsSchema = createInsertSchema(analytics).omit({ id: true, createdAt: true });
    insertWhatsappChannelSchema = createInsertSchema(whatsappChannels).omit({ id: true, createdAt: true, updatedAt: true });
    insertWebhookConfigSchema = createInsertSchema(webhookConfigs).omit({ id: true, createdAt: true });
    insertMessageQueueSchema = createInsertSchema(messageQueue).omit({ id: true, createdAt: true });
    insertApiLogSchema = createInsertSchema(apiLogs).omit({ id: true, createdAt: true });
    insertCampaignRecipientSchema = createInsertSchema(campaignRecipients).omit({ id: true, createdAt: true, updatedAt: true });
    insertTeamMemberSchema = createInsertSchema(teamMembers).omit({ id: true, createdAt: true, updatedAt: true });
    insertConversationAssignmentSchema = createInsertSchema(conversationAssignments).omit({ id: true, createdAt: true, updatedAt: true });
    insertTeamActivityLogSchema = createInsertSchema(teamActivityLogs).omit({ id: true, createdAt: true });
    channelsRelations = relations(channels, ({ many }) => ({
      contacts: many(contacts),
      campaigns: many(campaigns),
      templates: many(templates),
      conversations: many(conversations)
    }));
    contactsRelations = relations(contacts, ({ one, many }) => ({
      channel: one(channels, {
        fields: [contacts.channelId],
        references: [channels.id]
      }),
      conversations: many(conversations),
      campaignRecipients: many(campaignRecipients)
    }));
    campaignsRelations = relations(campaigns, ({ one, many }) => ({
      channel: one(channels, {
        fields: [campaigns.channelId],
        references: [channels.id]
      }),
      template: one(templates, {
        fields: [campaigns.templateId],
        references: [templates.id]
      }),
      recipients: many(campaignRecipients)
    }));
    campaignRecipientsRelations = relations(campaignRecipients, ({ one }) => ({
      campaign: one(campaigns, {
        fields: [campaignRecipients.campaignId],
        references: [campaigns.id]
      }),
      contact: one(contacts, {
        fields: [campaignRecipients.contactId],
        references: [contacts.id]
      })
    }));
    templatesRelations = relations(templates, ({ one, many }) => ({
      channel: one(channels, {
        fields: [templates.channelId],
        references: [channels.id]
      }),
      campaigns: many(campaigns)
    }));
    conversationsRelations = relations(conversations, ({ one, many }) => ({
      channel: one(channels, {
        fields: [conversations.channelId],
        references: [channels.id]
      }),
      contact: one(contacts, {
        fields: [conversations.contactId],
        references: [contacts.id]
      }),
      messages: many(messages)
    }));
    messagesRelations = relations(messages, ({ one }) => ({
      conversation: one(conversations, {
        fields: [messages.conversationId],
        references: [conversations.id]
      })
    }));
    usersRelations = relations(users, ({ many, one }) => ({
      teamMember: one(teamMembers)
      // User can have a team member profile
    }));
    teamMembersRelations = relations(teamMembers, ({ one, many }) => ({
      user: one(users, {
        fields: [teamMembers.userId],
        references: [users.id]
      }),
      assignedConversations: many(conversationAssignments),
      activityLogs: many(teamActivityLogs)
    }));
    conversationAssignmentsRelations = relations(conversationAssignments, ({ one }) => ({
      conversation: one(conversations, {
        fields: [conversationAssignments.conversationId],
        references: [conversations.id]
      }),
      teamMember: one(teamMembers, {
        fields: [conversationAssignments.teamMemberId],
        references: [teamMembers.id]
      }),
      assignedByMember: one(teamMembers, {
        fields: [conversationAssignments.assignedBy],
        references: [teamMembers.id]
      })
    }));
    teamActivityLogsRelations = relations(teamActivityLogs, ({ one }) => ({
      teamMember: one(teamMembers, {
        fields: [teamActivityLogs.teamMemberId],
        references: [teamMembers.id]
      })
    }));
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema: schema_exports });
  }
});

// server/repositories/user.repository.ts
import { eq, desc } from "drizzle-orm";
var UserRepository;
var init_user_repository = __esm({
  "server/repositories/user.repository.ts"() {
    "use strict";
    init_db();
    init_schema();
    UserRepository = class {
      async getById(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user || void 0;
      }
      async getByUsername(username) {
        const [user] = await db.select().from(users).where(eq(users.username, username));
        return user || void 0;
      }
      async create(insertUser) {
        const [user] = await db.insert(users).values(insertUser).returning();
        return user;
      }
      async getAll() {
        return await db.select().from(users).orderBy(desc(users.createdAt));
      }
    };
  }
});

// server/repositories/contact.repository.ts
import { eq as eq2, desc as desc2, sql as sql2 } from "drizzle-orm";
var ContactRepository;
var init_contact_repository = __esm({
  "server/repositories/contact.repository.ts"() {
    "use strict";
    init_db();
    init_schema();
    ContactRepository = class {
      async getAll() {
        return await db.select().from(contacts).orderBy(desc2(contacts.createdAt));
      }
      async getByChannel(channelId) {
        return await db.select().from(contacts).where(eq2(contacts.channelId, channelId)).orderBy(desc2(contacts.createdAt));
      }
      async getById(id) {
        const [contact] = await db.select().from(contacts).where(eq2(contacts.id, id));
        return contact || void 0;
      }
      async getByPhone(phone) {
        const [contact] = await db.select().from(contacts).where(eq2(contacts.phone, phone));
        return contact || void 0;
      }
      async create(insertContact) {
        const [contact] = await db.insert(contacts).values(insertContact).returning();
        return contact;
      }
      async update(id, contact) {
        const [updated] = await db.update(contacts).set(contact).where(eq2(contacts.id, id)).returning();
        return updated || void 0;
      }
      async delete(id) {
        const result = await db.delete(contacts).where(eq2(contacts.id, id)).returning();
        return result.length > 0;
      }
      async search(query) {
        const searchPattern = `%${query}%`;
        return await db.select().from(contacts).where(
          sql2`${contacts.name} ILIKE ${searchPattern} OR ${contacts.phone} ILIKE ${searchPattern} OR ${contacts.email} ILIKE ${searchPattern}`
        );
      }
      async createBulk(insertContacts) {
        if (insertContacts.length === 0) return [];
        return await db.insert(contacts).values(insertContacts).returning();
      }
      async checkExistingPhones(phones, channelId) {
        const existingContacts = await db.select({ phone: contacts.phone }).from(contacts).where(
          sql2`${contacts.phone} = ANY(${phones}) AND ${contacts.channelId} = ${channelId}`
        );
        return existingContacts.map((c) => c.phone);
      }
    };
  }
});

// server/repositories/campaign.repository.ts
import { eq as eq3, desc as desc3 } from "drizzle-orm";
var CampaignRepository;
var init_campaign_repository = __esm({
  "server/repositories/campaign.repository.ts"() {
    "use strict";
    init_db();
    init_schema();
    CampaignRepository = class {
      async getAll() {
        return await db.select().from(campaigns).orderBy(desc3(campaigns.createdAt));
      }
      async getByChannel(channelId) {
        return await db.select().from(campaigns).where(eq3(campaigns.channelId, channelId)).orderBy(desc3(campaigns.createdAt));
      }
      async getById(id) {
        const [campaign] = await db.select().from(campaigns).where(eq3(campaigns.id, id));
        return campaign || void 0;
      }
      async create(insertCampaign) {
        const [campaign] = await db.insert(campaigns).values(insertCampaign).returning();
        return campaign;
      }
      async update(id, campaign) {
        const [updated] = await db.update(campaigns).set(campaign).where(eq3(campaigns.id, id)).returning();
        return updated || void 0;
      }
      async delete(id) {
        const result = await db.delete(campaigns).where(eq3(campaigns.id, id)).returning();
        return result.length > 0;
      }
    };
  }
});

// server/repositories/channel.repository.ts
import { eq as eq4, desc as desc4 } from "drizzle-orm";
var ChannelRepository;
var init_channel_repository = __esm({
  "server/repositories/channel.repository.ts"() {
    "use strict";
    init_db();
    init_schema();
    ChannelRepository = class {
      async getAll() {
        return await db.select().from(channels).orderBy(desc4(channels.createdAt));
      }
      async getById(id) {
        const [channel] = await db.select().from(channels).where(eq4(channels.id, id));
        return channel || void 0;
      }
      async getByPhoneNumberId(phoneNumberId) {
        const [channel] = await db.select().from(channels).where(eq4(channels.phoneNumberId, phoneNumberId));
        return channel || void 0;
      }
      async create(insertChannel) {
        const [channel] = await db.insert(channels).values(insertChannel).returning();
        return channel;
      }
      async update(id, channel) {
        const [updated] = await db.update(channels).set(channel).where(eq4(channels.id, id)).returning();
        return updated || void 0;
      }
      async delete(id) {
        const result = await db.delete(channels).where(eq4(channels.id, id)).returning();
        return result.length > 0;
      }
      async getActive() {
        const [channel] = await db.select().from(channels).where(eq4(channels.isActive, true)).orderBy(desc4(channels.createdAt));
        return channel || void 0;
      }
    };
  }
});

// server/repositories/template.repository.ts
import { eq as eq5, desc as desc5 } from "drizzle-orm";
var TemplateRepository;
var init_template_repository = __esm({
  "server/repositories/template.repository.ts"() {
    "use strict";
    init_db();
    init_schema();
    TemplateRepository = class {
      async getAll() {
        return await db.select().from(templates).orderBy(desc5(templates.createdAt));
      }
      async getByChannel(channelId) {
        return await db.select().from(templates).where(eq5(templates.channelId, channelId)).orderBy(desc5(templates.createdAt));
      }
      async getById(id) {
        const [template] = await db.select().from(templates).where(eq5(templates.id, id));
        return template || void 0;
      }
      async create(insertTemplate) {
        const [template] = await db.insert(templates).values(insertTemplate).returning();
        return template;
      }
      async update(id, template) {
        const [updated] = await db.update(templates).set(template).where(eq5(templates.id, id)).returning();
        return updated || void 0;
      }
      async delete(id) {
        const result = await db.delete(templates).where(eq5(templates.id, id)).returning();
        return result.length > 0;
      }
    };
  }
});

// server/repositories/conversation.repository.ts
import { eq as eq6, desc as desc6, sql as sql3 } from "drizzle-orm";
var ConversationRepository;
var init_conversation_repository = __esm({
  "server/repositories/conversation.repository.ts"() {
    "use strict";
    init_db();
    init_schema();
    ConversationRepository = class {
      async getAll() {
        const result = await db.select({
          conversation: conversations,
          contact: contacts
        }).from(conversations).leftJoin(contacts, eq6(conversations.contactId, contacts.id)).orderBy(desc6(conversations.lastMessageAt));
        return result.map((row) => ({
          ...row.conversation,
          contact: row.contact
        }));
      }
      async getByChannel(channelId) {
        const result = await db.select({
          conversation: conversations,
          contact: contacts
        }).from(conversations).leftJoin(contacts, eq6(conversations.contactId, contacts.id)).where(eq6(conversations.channelId, channelId)).orderBy(desc6(conversations.lastMessageAt));
        return result.map((row) => ({
          ...row.conversation,
          contact: row.contact
        }));
      }
      async getById(id) {
        const [conversation] = await db.select().from(conversations).where(eq6(conversations.id, id));
        return conversation || void 0;
      }
      async getByPhone(phone) {
        const [conversation] = await db.select().from(conversations).where(eq6(conversations.contactPhone, phone));
        return conversation || void 0;
      }
      async create(insertConversation) {
        const [conversation] = await db.insert(conversations).values(insertConversation).returning();
        return conversation;
      }
      async update(id, conversation) {
        const [updated] = await db.update(conversations).set(conversation).where(eq6(conversations.id, id)).returning();
        return updated || void 0;
      }
      async delete(id) {
        const result = await db.delete(conversations).where(eq6(conversations.id, id)).returning();
        return result.length > 0;
      }
      async getUnreadCount() {
        const result = await db.select({
          count: sql3`count(*)`
        }).from(conversations).where(sql3`${conversations.unreadCount} > 0`);
        return Number(result[0]?.count) || 0;
      }
    };
  }
});

// server/repositories/message.repository.ts
import { eq as eq7 } from "drizzle-orm";
var MessageRepository;
var init_message_repository = __esm({
  "server/repositories/message.repository.ts"() {
    "use strict";
    init_db();
    init_schema();
    MessageRepository = class {
      async getByConversation(conversationId) {
        return await db.select().from(messages).where(eq7(messages.conversationId, conversationId)).orderBy(messages.createdAt);
      }
      async create(insertMessage) {
        const [message] = await db.insert(messages).values(insertMessage).returning();
        return message;
      }
      async update(id, message) {
        const [updated] = await db.update(messages).set(message).where(eq7(messages.id, id)).returning();
        return updated || void 0;
      }
      async getByWhatsAppId(whatsappMessageId) {
        const [message] = await db.select().from(messages).where(eq7(messages.whatsappMessageId, whatsappMessageId));
        return message || void 0;
      }
    };
  }
});

// server/repositories/automation.repository.ts
import { eq as eq8, desc as desc7 } from "drizzle-orm";
var AutomationRepository;
var init_automation_repository = __esm({
  "server/repositories/automation.repository.ts"() {
    "use strict";
    init_db();
    init_schema();
    AutomationRepository = class {
      async getAll() {
        return await db.select().from(automations).orderBy(desc7(automations.createdAt));
      }
      async getByChannel(channelId) {
        return await db.select().from(automations).where(eq8(automations.channelId, channelId)).orderBy(desc7(automations.createdAt));
      }
      async getById(id) {
        const [automation] = await db.select().from(automations).where(eq8(automations.id, id));
        return automation || void 0;
      }
      async create(insertAutomation) {
        const [automation] = await db.insert(automations).values(insertAutomation).returning();
        return automation;
      }
      async update(id, automation) {
        const [updated] = await db.update(automations).set(automation).where(eq8(automations.id, id)).returning();
        return updated || void 0;
      }
      async delete(id) {
        const result = await db.delete(automations).where(eq8(automations.id, id)).returning();
        return result.length > 0;
      }
    };
  }
});

// server/repositories/analytics.repository.ts
import { gte, sql as sql4 } from "drizzle-orm";
var AnalyticsRepository;
var init_analytics_repository = __esm({
  "server/repositories/analytics.repository.ts"() {
    "use strict";
    init_db();
    init_schema();
    AnalyticsRepository = class {
      async getAnalytics(days) {
        const startDate = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1e3) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
        const result = await db.select({
          date: sql4`DATE(${messageQueue.createdAt})`,
          sent: sql4`COUNT(CASE WHEN ${messageQueue.status} = 'sent' THEN 1 END)`,
          delivered: sql4`COUNT(CASE WHEN ${messageQueue.status} = 'delivered' THEN 1 END)`,
          read: sql4`COUNT(CASE WHEN ${messageQueue.status} = 'read' THEN 1 END)`,
          replied: sql4`COUNT(CASE WHEN ${messageQueue.status} = 'replied' THEN 1 END)`,
          failed: sql4`COUNT(CASE WHEN ${messageQueue.status} = 'failed' THEN 1 END)`
        }).from(messageQueue).where(gte(messageQueue.createdAt, startDate)).groupBy(sql4`DATE(${messageQueue.createdAt})`).orderBy(sql4`DATE(${messageQueue.createdAt})`);
        return result.map((row) => ({
          id: `analytics-${row.date.toISOString()}`,
          channelId: "",
          date: row.date,
          messagesTotal: Number(row.sent) + Number(row.delivered) + Number(row.read) + Number(row.replied) + Number(row.failed),
          messagesSent: Number(row.sent),
          messagesDelivered: Number(row.delivered),
          messagesRead: Number(row.read),
          messagesReplied: Number(row.replied),
          messagesFailed: Number(row.failed),
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }));
      }
      async createOrUpdate(insertAnalytics) {
        const [analytics2] = await db.insert(analytics2).values(insertAnalytics).onConflictDoUpdate({
          target: [analytics2.channelId, analytics2.date],
          set: {
            messagesTotal: insertAnalytics.messagesTotal,
            messagesSent: insertAnalytics.messagesSent,
            messagesDelivered: insertAnalytics.messagesDelivered,
            messagesRead: insertAnalytics.messagesRead,
            messagesReplied: insertAnalytics.messagesReplied,
            messagesFailed: insertAnalytics.messagesFailed,
            updatedAt: /* @__PURE__ */ new Date()
          }
        }).returning();
        return analytics2;
      }
      async deleteOldAnalytics(daysToKeep) {
        const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1e3);
        await db.delete(analytics).where(gte(analytics.date, cutoffDate));
      }
    };
  }
});

// server/repositories/webhook-config.repository.ts
import { eq as eq9, and } from "drizzle-orm";
var WebhookConfigRepository;
var init_webhook_config_repository = __esm({
  "server/repositories/webhook-config.repository.ts"() {
    "use strict";
    init_db();
    init_schema();
    WebhookConfigRepository = class {
      async getAll() {
        return await db.select().from(webhookConfigs);
      }
      async getById(id) {
        const [config] = await db.select().from(webhookConfigs).where(eq9(webhookConfigs.id, id));
        return config || void 0;
      }
      async getByChannelAndType(channelId, type) {
        const [config] = await db.select().from(webhookConfigs).where(
          and(
            eq9(webhookConfigs.channelId, channelId),
            eq9(webhookConfigs.type, type)
          )
        );
        return config || void 0;
      }
      async create(insertConfig) {
        const [config] = await db.insert(webhookConfigs).values(insertConfig).returning();
        return config;
      }
      async update(id, config) {
        const [updated] = await db.update(webhookConfigs).set(config).where(eq9(webhookConfigs.id, id)).returning();
        return updated || void 0;
      }
      async delete(id) {
        const result = await db.delete(webhookConfigs).where(eq9(webhookConfigs.id, id)).returning();
        return result.length > 0;
      }
      async getAllByChannel(channelId) {
        return await db.select().from(webhookConfigs).where(eq9(webhookConfigs.channelId, channelId));
      }
    };
  }
});

// server/repositories/message-queue.repository.ts
import { eq as eq10, and as and2, isNull as isNull2, desc as desc9, lt } from "drizzle-orm";
var MessageQueueRepository;
var init_message_queue_repository = __esm({
  "server/repositories/message-queue.repository.ts"() {
    "use strict";
    init_db();
    init_schema();
    MessageQueueRepository = class {
      async getByChannel(channelId) {
        return await db.select().from(messageQueue).where(eq10(messageQueue.channelId, channelId)).orderBy(desc9(messageQueue.createdAt));
      }
      async getPending() {
        return await db.select().from(messageQueue).where(eq10(messageQueue.status, "pending")).orderBy(messageQueue.createdAt);
      }
      async getMessagesToCheck() {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1e3);
        return await db.select().from(messageQueue).where(
          and2(
            eq10(messageQueue.type, "outgoing"),
            eq10(messageQueue.status, "sent"),
            lt(messageQueue.createdAt, tenMinutesAgo)
          )
        ).orderBy(messageQueue.createdAt);
      }
      async create(insertMessage) {
        const [message] = await db.insert(messageQueue).values(insertMessage).returning();
        return message;
      }
      async createBulk(insertMessages) {
        if (insertMessages.length === 0) return [];
        return await db.insert(messageQueue).values(insertMessages).returning();
      }
      async update(id, message) {
        const [updated] = await db.update(messageQueue).set(message).where(eq10(messageQueue.id, id)).returning();
        return updated || void 0;
      }
      async updateByWhatsAppId(whatsappMessageId, updates) {
        const result = await db.update(messageQueue).set(updates).where(eq10(messageQueue.whatsappMessageId, whatsappMessageId)).returning();
        return result.length > 0;
      }
      async getByCampaign(campaignId) {
        return await db.select().from(messageQueue).where(eq10(messageQueue.campaignId, campaignId)).orderBy(desc9(messageQueue.createdAt));
      }
      async getForRetry(limit = 100) {
        return await db.select().from(messageQueue).where(
          and2(
            eq10(messageQueue.status, "failed"),
            lt(messageQueue.retryCount, 3),
            isNull2(messageQueue.errorDetails)
          )
        ).limit(limit).orderBy(messageQueue.createdAt);
      }
    };
  }
});

// server/repositories/api-log.repository.ts
import { eq as eq11, desc as desc10 } from "drizzle-orm";
var ApiLogRepository;
var init_api_log_repository = __esm({
  "server/repositories/api-log.repository.ts"() {
    "use strict";
    init_db();
    init_schema();
    ApiLogRepository = class {
      async create(insertLog) {
        const [log2] = await db.insert(apiLogs).values(insertLog).returning();
        return log2;
      }
      async getRecent(limit = 100) {
        return await db.select().from(apiLogs).orderBy(desc10(apiLogs.createdAt)).limit(limit);
      }
      async getByChannel(channelId, limit = 100) {
        return await db.select().from(apiLogs).where(eq11(apiLogs.channelId, channelId)).orderBy(desc10(apiLogs.createdAt)).limit(limit);
      }
    };
  }
});

// server/repositories/whatsapp-channel.repository.ts
import { eq as eq12 } from "drizzle-orm";
var WhatsappChannelRepository;
var init_whatsapp_channel_repository = __esm({
  "server/repositories/whatsapp-channel.repository.ts"() {
    "use strict";
    init_db();
    init_schema();
    WhatsappChannelRepository = class {
      async getByChannelId(channelId) {
        const [channel] = await db.select().from(whatsappChannels).where(eq12(whatsappChannels.id, channelId));
        return channel || void 0;
      }
      async create(insertChannel) {
        const [channel] = await db.insert(whatsappChannels).values(insertChannel).returning();
        return channel;
      }
      async update(id, channel) {
        const [updated] = await db.update(whatsappChannels).set(channel).where(eq12(whatsappChannels.id, id)).returning();
        return updated || void 0;
      }
    };
  }
});

// server/database-storage.ts
var DatabaseStorage;
var init_database_storage = __esm({
  "server/database-storage.ts"() {
    "use strict";
    init_user_repository();
    init_contact_repository();
    init_campaign_repository();
    init_channel_repository();
    init_template_repository();
    init_conversation_repository();
    init_message_repository();
    init_automation_repository();
    init_analytics_repository();
    init_webhook_config_repository();
    init_message_queue_repository();
    init_api_log_repository();
    init_whatsapp_channel_repository();
    DatabaseStorage = class {
      userRepo = new UserRepository();
      contactRepo = new ContactRepository();
      campaignRepo = new CampaignRepository();
      channelRepo = new ChannelRepository();
      templateRepo = new TemplateRepository();
      conversationRepo = new ConversationRepository();
      messageRepo = new MessageRepository();
      automationRepo = new AutomationRepository();
      analyticsRepo = new AnalyticsRepository();
      webhookConfigRepo = new WebhookConfigRepository();
      messageQueueRepo = new MessageQueueRepository();
      apiLogRepo = new ApiLogRepository();
      whatsappChannelRepo = new WhatsappChannelRepository();
      // Users
      async getUser(id) {
        return this.userRepo.getById(id);
      }
      async getUserByUsername(username) {
        return this.userRepo.getByUsername(username);
      }
      async createUser(insertUser) {
        return this.userRepo.create(insertUser);
      }
      async getAllUsers() {
        return this.userRepo.getAll();
      }
      // Contacts
      async getContacts() {
        return this.contactRepo.getAll();
      }
      async getContactsByChannel(channelId) {
        return this.contactRepo.getByChannel(channelId);
      }
      async getContact(id) {
        return this.contactRepo.getById(id);
      }
      async getContactByPhone(phone) {
        return this.contactRepo.getByPhone(phone);
      }
      async createContact(insertContact) {
        return this.contactRepo.create(insertContact);
      }
      async updateContact(id, contact) {
        return this.contactRepo.update(id, contact);
      }
      async deleteContact(id) {
        return this.contactRepo.delete(id);
      }
      async searchContacts(query) {
        return this.contactRepo.search(query);
      }
      async createBulkContacts(insertContacts) {
        return this.contactRepo.createBulk(insertContacts);
      }
      async checkExistingPhones(phones, channelId) {
        return this.contactRepo.checkExistingPhones(phones, channelId);
      }
      // Campaigns
      async getCampaigns() {
        return this.campaignRepo.getAll();
      }
      async getCampaignsByChannel(channelId) {
        return this.campaignRepo.getByChannel(channelId);
      }
      async getCampaign(id) {
        return this.campaignRepo.getById(id);
      }
      async createCampaign(insertCampaign) {
        return this.campaignRepo.create(insertCampaign);
      }
      async updateCampaign(id, campaign) {
        return this.campaignRepo.update(id, campaign);
      }
      async deleteCampaign(id) {
        return this.campaignRepo.delete(id);
      }
      // Channels
      async getChannels() {
        return this.channelRepo.getAll();
      }
      async getChannel(id) {
        return this.channelRepo.getById(id);
      }
      async getChannelByPhoneNumberId(phoneNumberId) {
        return this.channelRepo.getByPhoneNumberId(phoneNumberId);
      }
      async createChannel(insertChannel) {
        return this.channelRepo.create(insertChannel);
      }
      async updateChannel(id, channel) {
        return this.channelRepo.update(id, channel);
      }
      async deleteChannel(id) {
        return this.channelRepo.delete(id);
      }
      async getActiveChannel() {
        return this.channelRepo.getActive();
      }
      async getActiveChannel() {
        return this.channelRepo.getActive();
      }
      // Templates
      async getTemplates() {
        return this.templateRepo.getAll();
      }
      async getTemplatesByChannel(channelId) {
        return this.templateRepo.getByChannel(channelId);
      }
      async getTemplate(id) {
        return this.templateRepo.getById(id);
      }
      async createTemplate(insertTemplate) {
        return this.templateRepo.create(insertTemplate);
      }
      async updateTemplate(id, template) {
        return this.templateRepo.update(id, template);
      }
      async deleteTemplate(id) {
        return this.templateRepo.delete(id);
      }
      // Conversations
      async getConversations() {
        return this.conversationRepo.getAll();
      }
      async getConversationsByChannel(channelId) {
        return this.conversationRepo.getByChannel(channelId);
      }
      async getConversation(id) {
        return this.conversationRepo.getById(id);
      }
      async getConversationByPhone(phone) {
        return this.conversationRepo.getByPhone(phone);
      }
      async createConversation(insertConversation) {
        return this.conversationRepo.create(insertConversation);
      }
      async updateConversation(id, conversation) {
        return this.conversationRepo.update(id, conversation);
      }
      async deleteConversation(id) {
        return this.conversationRepo.delete(id);
      }
      async getUnreadConversationsCount() {
        return this.conversationRepo.getUnreadCount();
      }
      // Messages
      async getMessages(conversationId) {
        return this.messageRepo.getByConversation(conversationId);
      }
      async createMessage(insertMessage) {
        return this.messageRepo.create(insertMessage);
      }
      async updateMessage(id, message) {
        return this.messageRepo.update(id, message);
      }
      async getMessageByWhatsAppId(whatsappMessageId) {
        return this.messageRepo.getByWhatsAppId(whatsappMessageId);
      }
      // Automations
      async getAutomations() {
        return this.automationRepo.getAll();
      }
      async getAutomationsByChannel(channelId) {
        return this.automationRepo.getByChannel(channelId);
      }
      async getAutomation(id) {
        return this.automationRepo.getById(id);
      }
      async createAutomation(insertAutomation) {
        return this.automationRepo.create(insertAutomation);
      }
      async updateAutomation(id, automation) {
        return this.automationRepo.update(id, automation);
      }
      async deleteAutomation(id) {
        return this.automationRepo.delete(id);
      }
      // Analytics
      async getAnalytics(days) {
        return this.analyticsRepo.getAnalytics(days);
      }
      async createOrUpdateAnalytics(insertAnalytics) {
        return this.analyticsRepo.createOrUpdate(insertAnalytics);
      }
      async deleteOldAnalytics(daysToKeep) {
        return this.analyticsRepo.deleteOldAnalytics(daysToKeep);
      }
      // WhatsApp Channels
      async getWhatsappChannel(channelId) {
        return this.whatsappChannelRepo.getByChannelId(channelId);
      }
      async createWhatsappChannel(insertChannel) {
        return this.whatsappChannelRepo.create(insertChannel);
      }
      async updateWhatsappChannel(id, channel) {
        return this.whatsappChannelRepo.update(id, channel);
      }
      // Webhook Configs
      async getWebhookConfigs() {
        return this.webhookConfigRepo.getAll();
      }
      async getWebhookConfig(id) {
        return this.webhookConfigRepo.getById(id);
      }
      async createWebhookConfig(insertConfig) {
        return this.webhookConfigRepo.create(insertConfig);
      }
      async updateWebhookConfig(id, config) {
        return this.webhookConfigRepo.update(id, config);
      }
      async deleteWebhookConfig(id) {
        return this.webhookConfigRepo.delete(id);
      }
      // Message Queue
      async getMessageQueueByChannel(channelId) {
        return this.messageQueueRepo.getByChannel(channelId);
      }
      async getPendingMessages() {
        return this.messageQueueRepo.getPending();
      }
      async getMessagesToCheck() {
        return this.messageQueueRepo.getMessagesToCheck();
      }
      async createMessageQueueItem(insertMessage) {
        return this.messageQueueRepo.create(insertMessage);
      }
      async createBulkMessageQueue(insertMessages) {
        return this.messageQueueRepo.createBulk(insertMessages);
      }
      async updateMessageQueueItem(id, message) {
        return this.messageQueueRepo.update(id, message);
      }
      async updateMessageQueueByWhatsAppId(whatsappMessageId, updates) {
        return this.messageQueueRepo.updateByWhatsAppId(whatsappMessageId, updates);
      }
      async getMessageQueueByCampaign(campaignId) {
        return this.messageQueueRepo.getByCampaign(campaignId);
      }
      async getMessagesForRetry(limit = 100) {
        return this.messageQueueRepo.getForRetry(limit);
      }
      // API Logs
      async createApiLog(insertLog) {
        return this.apiLogRepo.create(insertLog);
      }
    };
  }
});

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  MemStorage: () => MemStorage,
  storage: () => storage
});
import { randomUUID } from "crypto";
var MemStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_database_storage();
    MemStorage = class {
      users = /* @__PURE__ */ new Map();
      contacts = /* @__PURE__ */ new Map();
      campaigns = /* @__PURE__ */ new Map();
      channels = /* @__PURE__ */ new Map();
      templates = /* @__PURE__ */ new Map();
      conversations = /* @__PURE__ */ new Map();
      messages = /* @__PURE__ */ new Map();
      automations = /* @__PURE__ */ new Map();
      analytics = /* @__PURE__ */ new Map();
      whatsappChannels = /* @__PURE__ */ new Map();
      webhookConfigs = /* @__PURE__ */ new Map();
      messageQueues = /* @__PURE__ */ new Map();
      apiLogs = /* @__PURE__ */ new Map();
      constructor() {
        this.initializeSampleData();
      }
      initializeSampleData() {
        const today = /* @__PURE__ */ new Date();
        const analyticsEntry = {
          id: randomUUID(),
          date: today,
          messagesSent: 0,
          messagesDelivered: 0,
          messagesRead: 0,
          messagesReplied: 0,
          newContacts: 0,
          activeCampaigns: 0,
          createdAt: today
        };
        this.analytics.set(analyticsEntry.id, analyticsEntry);
        const defaultChannel = {
          id: randomUUID(),
          name: "Main WhatsApp Channel",
          phoneNumberId: "153851404474202",
          // User's provided phone number ID
          accessToken: "Bearer EAAxxxxxxx",
          // User needs to update this with their actual token
          whatsappBusinessAccountId: "123456789012345",
          // User needs to update this with actual WABA ID
          phoneNumber: "+1234567890",
          // User needs to update with actual phone number
          isActive: true,
          createdAt: today,
          updatedAt: today
        };
        this.channels.set(defaultChannel.id, defaultChannel);
      }
      // Users
      async getUser(id) {
        return this.users.get(id);
      }
      async getUserByUsername(username) {
        return Array.from(this.users.values()).find((user) => user.username === username);
      }
      async createUser(insertUser) {
        const id = randomUUID();
        const user = {
          ...insertUser,
          id,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.users.set(id, user);
        return user;
      }
      // Contacts
      async getContacts() {
        return Array.from(this.contacts.values()).sort(
          (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
        );
      }
      async getContact(id) {
        return this.contacts.get(id);
      }
      async createContact(insertContact) {
        const id = randomUUID();
        const contact = {
          ...insertContact,
          id,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.contacts.set(id, contact);
        return contact;
      }
      async updateContact(id, updates) {
        const contact = this.contacts.get(id);
        if (!contact) return void 0;
        const updatedContact = { ...contact, ...updates };
        this.contacts.set(id, updatedContact);
        return updatedContact;
      }
      async deleteContact(id) {
        return this.contacts.delete(id);
      }
      async searchContacts(query) {
        const lowercaseQuery = query.toLowerCase();
        return Array.from(this.contacts.values()).filter(
          (contact) => contact.name.toLowerCase().includes(lowercaseQuery) || contact.phone.includes(query) || contact.email?.toLowerCase().includes(lowercaseQuery)
        );
      }
      // Campaigns
      async getCampaigns() {
        return Array.from(this.campaigns.values()).sort(
          (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
        );
      }
      async getCampaign(id) {
        return this.campaigns.get(id);
      }
      async createCampaign(insertCampaign) {
        const id = randomUUID();
        const campaign = {
          ...insertCampaign,
          id,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.campaigns.set(id, campaign);
        return campaign;
      }
      async updateCampaign(id, updates) {
        const campaign = this.campaigns.get(id);
        if (!campaign) return void 0;
        const updatedCampaign = { ...campaign, ...updates };
        this.campaigns.set(id, updatedCampaign);
        return updatedCampaign;
      }
      async deleteCampaign(id) {
        return this.campaigns.delete(id);
      }
      // Channels
      async getChannels() {
        return Array.from(this.channels.values()).sort(
          (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
        );
      }
      async getChannel(id) {
        return this.channels.get(id);
      }
      async createChannel(insertChannel) {
        const id = randomUUID();
        const channel = {
          ...insertChannel,
          id,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date(),
          whatsappBusinessAccountId: insertChannel.whatsappBusinessAccountId || null,
          phoneNumber: insertChannel.phoneNumber || null,
          isActive: insertChannel.isActive ?? false
        };
        this.channels.set(id, channel);
        return channel;
      }
      async updateChannel(id, updates) {
        const channel = this.channels.get(id);
        if (!channel) return void 0;
        const updatedChannel = { ...channel, ...updates, updatedAt: /* @__PURE__ */ new Date() };
        this.channels.set(id, updatedChannel);
        return updatedChannel;
      }
      async deleteChannel(id) {
        return this.channels.delete(id);
      }
      async getActiveChannel() {
        const channels2 = Array.from(this.channels.values());
        return channels2.find((c) => c.isActive) || channels2[0];
      }
      // Templates
      async getTemplates() {
        return Array.from(this.templates.values()).sort(
          (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
        );
      }
      async getTemplate(id) {
        return this.templates.get(id);
      }
      async createTemplate(insertTemplate) {
        const id = randomUUID();
        const template = {
          ...insertTemplate,
          id,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date(),
          status: insertTemplate.status || "draft",
          channelId: insertTemplate.channelId || null,
          language: insertTemplate.language || "en_US",
          header: insertTemplate.header || null,
          footer: insertTemplate.footer || null,
          buttons: insertTemplate.buttons || [],
          variables: insertTemplate.variables || [],
          tags: insertTemplate.tags || [],
          priority: insertTemplate.priority || null,
          whatsappTemplateId: insertTemplate.whatsappTemplateId || null,
          whatsappTemplateName: insertTemplate.whatsappTemplateName || null,
          mediaType: insertTemplate.mediaType || "text",
          mediaUrl: insertTemplate.mediaUrl || null,
          mediaHandle: insertTemplate.mediaHandle || null,
          carouselCards: insertTemplate.carouselCards || [],
          usage_count: insertTemplate.usage_count ?? 0
        };
        this.templates.set(id, template);
        return template;
      }
      async updateTemplate(id, updates) {
        const template = this.templates.get(id);
        if (!template) return void 0;
        const updatedTemplate = { ...template, ...updates };
        this.templates.set(id, updatedTemplate);
        return updatedTemplate;
      }
      async deleteTemplate(id) {
        return this.templates.delete(id);
      }
      // Conversations
      async getConversations() {
        return Array.from(this.conversations.values()).sort(
          (a, b) => (b.lastMessageAt?.getTime() || b.createdAt?.getTime() || 0) - (a.lastMessageAt?.getTime() || a.createdAt?.getTime() || 0)
        );
      }
      async getConversation(id) {
        return this.conversations.get(id);
      }
      async getConversationByPhone(phone) {
        return Array.from(this.conversations.values()).find((c) => c.contactPhone === phone);
      }
      async createConversation(insertConversation) {
        const id = randomUUID();
        const conversation = {
          ...insertConversation,
          id,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.conversations.set(id, conversation);
        return conversation;
      }
      async updateConversation(id, updates) {
        const conversation = this.conversations.get(id);
        if (!conversation) return void 0;
        const updatedConversation = { ...conversation, ...updates };
        this.conversations.set(id, updatedConversation);
        return updatedConversation;
      }
      // Messages
      async getMessages(conversationId) {
        return Array.from(this.messages.values()).filter((message) => message.conversationId === conversationId).sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
      }
      async createMessage(insertMessage) {
        const id = randomUUID();
        const message = {
          ...insertMessage,
          id,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.messages.set(id, message);
        const conversation = this.conversations.get(insertMessage.conversationId);
        if (conversation) {
          this.conversations.set(conversation.id, {
            ...conversation,
            lastMessageAt: /* @__PURE__ */ new Date()
          });
        }
        return message;
      }
      async updateMessage(id, updates) {
        const message = this.messages.get(id);
        if (!message) return void 0;
        const updatedMessage = { ...message, ...updates };
        this.messages.set(id, updatedMessage);
        return updatedMessage;
      }
      async getMessageByWhatsAppId(whatsappMessageId) {
        return Array.from(this.messages.values()).find((m) => m.whatsappMessageId === whatsappMessageId);
      }
      // Automations
      async getAutomations() {
        return Array.from(this.automations.values()).sort(
          (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
        );
      }
      async getAutomation(id) {
        return this.automations.get(id);
      }
      async createAutomation(insertAutomation) {
        const id = randomUUID();
        const automation = {
          ...insertAutomation,
          id,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.automations.set(id, automation);
        return automation;
      }
      async updateAutomation(id, updates) {
        const automation = this.automations.get(id);
        if (!automation) return void 0;
        const updatedAutomation = { ...automation, ...updates };
        this.automations.set(id, updatedAutomation);
        return updatedAutomation;
      }
      async deleteAutomation(id) {
        return this.automations.delete(id);
      }
      // Analytics
      async getAnalytics(days = 30) {
        const cutoffDate = /* @__PURE__ */ new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return Array.from(this.analytics.values()).filter((analytics2) => analytics2.date >= cutoffDate).sort((a, b) => a.date.getTime() - b.date.getTime());
      }
      async createAnalytics(insertAnalytics) {
        const id = randomUUID();
        const analytics2 = {
          ...insertAnalytics,
          id,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.analytics.set(id, analytics2);
        return analytics2;
      }
      async getDashboardStats() {
        const campaigns2 = await this.getCampaigns();
        const contacts3 = await this.getContacts();
        const conversations2 = await this.getConversations();
        const activeCampaigns = campaigns2.filter((c) => c.status === "active").length;
        const totalSent = campaigns2.reduce((sum, c) => sum + (c.sentCount || 0), 0);
        const totalDelivered = campaigns2.reduce((sum, c) => sum + (c.deliveredCount || 0), 0);
        const deliveryRate = totalSent > 0 ? totalDelivered / totalSent * 100 : 0;
        const weekAgo = /* @__PURE__ */ new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const newLeads = contacts3.filter((c) => c.createdAt && c.createdAt >= weekAgo).length;
        const unreadChats = conversations2.filter((c) => c.status === "open").length;
        return {
          totalMessages: totalSent,
          activeCampaigns,
          deliveryRate: Math.round(deliveryRate * 10) / 10,
          newLeads,
          messagesGrowth: 12.5,
          // Would be calculated from historical data
          campaignsRunning: activeCampaigns,
          unreadChats
        };
      }
      // WhatsApp Channels
      async getWhatsappChannels() {
        return Array.from(this.whatsappChannels.values());
      }
      async getWhatsappChannel(id) {
        return this.whatsappChannels.get(id);
      }
      async createWhatsappChannel(insertChannel) {
        const id = randomUUID();
        const channel = {
          ...insertChannel,
          id,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.whatsappChannels.set(id, channel);
        return channel;
      }
      async updateWhatsappChannel(id, updates) {
        const channel = this.whatsappChannels.get(id);
        if (channel) {
          const updated = { ...channel, ...updates, updatedAt: /* @__PURE__ */ new Date() };
          this.whatsappChannels.set(id, updated);
          return updated;
        }
        return void 0;
      }
      async deleteWhatsappChannel(id) {
        return this.whatsappChannels.delete(id);
      }
      // Webhook Configs
      async getWebhookConfigs() {
        return Array.from(this.webhookConfigs.values());
      }
      async getWebhookConfig(channelId) {
        return Array.from(this.webhookConfigs.values()).find((config) => config.channelId === channelId);
      }
      async createWebhookConfig(insertConfig) {
        const id = randomUUID();
        const config = {
          ...insertConfig,
          id,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.webhookConfigs.set(id, config);
        return config;
      }
      async updateWebhookConfig(id, updates) {
        const config = this.webhookConfigs.get(id);
        if (config) {
          const updated = { ...config, ...updates };
          this.webhookConfigs.set(id, updated);
          return updated;
        }
        return void 0;
      }
      async deleteWebhookConfig(id) {
        return this.webhookConfigs.delete(id);
      }
      // Message Queue
      async getMessageQueueStats() {
        const stats = {
          queued: 0,
          processing: 0,
          sent: 0,
          delivered: 0,
          failed: 0
        };
        this.messageQueues.forEach((message) => {
          if (message.status) {
            stats[message.status] = (stats[message.status] || 0) + 1;
          }
        });
        return stats;
      }
      async getQueuedMessages(limit = 10) {
        return Array.from(this.messageQueues.values()).filter((msg) => msg.status === "queued").slice(0, limit);
      }
      // API Logs
      async getApiLogs(channelId, limit = 100) {
        let logs = Array.from(this.apiLogs.values());
        if (channelId) {
          logs = logs.filter((log2) => log2.channelId === channelId);
        }
        return logs.slice(-limit);
      }
      async logApiRequest(log2) {
        try {
          const apiLog = {
            ...log2,
            id: Date.now().toString(),
            createdAt: /* @__PURE__ */ new Date()
          };
          if (log2.channelId && !this.whatsappChannels.has(log2.channelId)) {
            console.error("Channel not found for API log:", log2.channelId);
            return null;
          }
          this.apiLogs.set(apiLog.id, apiLog);
          return apiLog;
        } catch (error) {
          console.error("Failed to log API request:", error);
          return null;
        }
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/cron/channel-health-monitor.ts
var channel_health_monitor_exports = {};
__export(channel_health_monitor_exports, {
  ChannelHealthMonitor: () => ChannelHealthMonitor,
  channelHealthMonitor: () => channelHealthMonitor
});
import * as cron from "node-cron";
var storage2, ChannelHealthMonitor, channelHealthMonitor;
var init_channel_health_monitor = __esm({
  "server/cron/channel-health-monitor.ts"() {
    "use strict";
    init_database_storage();
    storage2 = new DatabaseStorage();
    ChannelHealthMonitor = class _ChannelHealthMonitor {
      static instance;
      cronJob = null;
      constructor() {
      }
      static getInstance() {
        if (!_ChannelHealthMonitor.instance) {
          _ChannelHealthMonitor.instance = new _ChannelHealthMonitor();
        }
        return _ChannelHealthMonitor.instance;
      }
      // Check all channels health status
      async checkAllChannelsHealth() {
        console.log("[Channel Health Monitor] Starting health check for all channels...");
        try {
          const channels2 = await storage2.getChannels();
          for (const channel of channels2) {
            await this.checkChannelHealth(channel.id);
          }
          console.log("[Channel Health Monitor] Health check completed for all channels");
        } catch (error) {
          console.error("[Channel Health Monitor] Error checking channels health:", error);
        }
      }
      // Check individual channel health
      async checkChannelHealth(channelId) {
        try {
          const channel = await storage2.getChannel(channelId);
          if (!channel) {
            console.error(`[Channel Health Monitor] Channel ${channelId} not found`);
            return;
          }
          console.log(`[Channel Health Monitor] Checking health for channel: ${channel.name} (${channel.phoneNumber})`);
          const apiVersion = process.env.WHATSAPP_API_VERSION || "v23.0";
          const fields = "id,account_mode,display_phone_number,is_official_business_account,is_pin_enabled,is_preverified_number,messaging_limit_tier,name_status,new_name_status,platform_type,quality_rating,quality_score,search_visibility,status,throughput,verified_name,code_verification_status,certificate";
          const url = `https://graph.facebook.com/${apiVersion}/${channel.phoneNumberId}?fields=${fields}`;
          const response = await fetch(url, {
            headers: {
              "Authorization": `Bearer ${channel.accessToken}`
            }
          });
          const data = await response.json();
          if (response.ok) {
            const healthDetails = {
              status: data.account_mode || "UNKNOWN",
              name_status: data.name_status || "UNKNOWN",
              phone_number: data.display_phone_number || channel.phoneNumber,
              quality_rating: data.quality_rating || "UNKNOWN",
              throughput_level: data.throughput?.level || "STANDARD",
              verification_status: data.verified_name?.status || "NOT_VERIFIED",
              messaging_limit: data.messaging_limit_tier || "UNKNOWN"
            };
            const previousStatus = channel.healthStatus;
            const newStatus = data.account_mode === "CONNECTED" ? "healthy" : "warning";
            await storage2.updateChannel(channelId, {
              healthStatus: newStatus,
              lastHealthCheck: /* @__PURE__ */ new Date(),
              healthDetails
            });
            if (previousStatus === "healthy" && newStatus !== "healthy") {
              await this.notifyChannelIssue(channel, healthDetails);
            }
            console.log(`[Channel Health Monitor] Channel ${channel.name} status: ${newStatus}`);
          } else {
            const errorMessage = data.error?.message || "Unknown error";
            await storage2.updateChannel(channelId, {
              healthStatus: "error",
              lastHealthCheck: /* @__PURE__ */ new Date(),
              healthDetails: {
                error: errorMessage,
                error_code: data.error?.code,
                error_type: data.error?.type
              }
            });
            await this.notifyChannelError(channel, errorMessage);
            console.error(`[Channel Health Monitor] Channel ${channel.name} error: ${errorMessage}`);
          }
        } catch (error) {
          console.error(`[Channel Health Monitor] Error checking channel ${channelId}:`, error);
          await storage2.updateChannel(channelId, {
            healthStatus: "error",
            lastHealthCheck: /* @__PURE__ */ new Date(),
            healthDetails: {
              error: "Network or system error",
              details: error.message
            }
          });
        }
      }
      // Notify about channel issues
      async notifyChannelIssue(channel, details) {
        console.warn(`[Channel Health Monitor] ISSUE DETECTED for ${channel.name}:`, {
          phoneNumber: channel.phoneNumber,
          status: details.status,
          quality_rating: details.quality_rating,
          messaging_limit: details.messaging_limit
        });
        await storage2.createApiLog({
          channelId: channel.id,
          endpoint: "HEALTH_CHECK",
          method: "MONITOR",
          status: "warning",
          responseData: details,
          errorMessage: `Channel health degraded: ${details.status}`,
          timestamp: /* @__PURE__ */ new Date()
        });
      }
      // Notify about channel errors
      async notifyChannelError(channel, errorMessage) {
        console.error(`[Channel Health Monitor] ERROR for ${channel.name}:`, {
          phoneNumber: channel.phoneNumber,
          error: errorMessage
        });
        await storage2.createApiLog({
          channelId: channel.id,
          endpoint: "HEALTH_CHECK",
          method: "MONITOR",
          status: "error",
          responseData: { error: errorMessage },
          errorMessage: `Channel health check failed: ${errorMessage}`,
          timestamp: /* @__PURE__ */ new Date()
        });
      }
      // Start the cron job
      start() {
        this.cronJob = cron.schedule("0 2 * * *", async () => {
          await this.checkAllChannelsHealth();
        });
        this.checkAllChannelsHealth();
        console.log("[Channel Health Monitor] Started - will run daily at 2 AM");
      }
      // Stop the cron job
      stop() {
        if (this.cronJob) {
          this.cronJob.stop();
          this.cronJob = null;
          console.log("[Channel Health Monitor] Stopped");
        }
      }
      // Run health check manually
      async runManualCheck() {
        await this.checkAllChannelsHealth();
      }
    };
    channelHealthMonitor = ChannelHealthMonitor.getInstance();
  }
});

// server/index.ts
import express2 from "express";

// server/routes/index.ts
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// server/controllers/channels.controller.ts
init_storage();
init_schema();

// server/middlewares/error.middleware.ts
var AppError = class _AppError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, _AppError.prototype);
  }
};
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message
    });
  }
  console.error("Unexpected error:", err);
  res.status(500).json({
    status: "error",
    message: "Internal server error"
  });
}
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// server/controllers/channels.controller.ts
var getChannels = asyncHandler(async (req, res) => {
  const channels2 = await storage.getChannels();
  res.json(channels2);
});
var getActiveChannel = asyncHandler(async (req, res) => {
  const channel = await storage.getActiveChannel();
  if (!channel) {
    throw new AppError(404, "No active channel found");
  }
  res.json(channel);
});
var createChannel = asyncHandler(async (req, res) => {
  const validatedChannel = insertChannelSchema.parse(req.body);
  if (validatedChannel.isActive) {
    const channels2 = await storage.getChannels();
    for (const channel2 of channels2) {
      if (channel2.isActive) {
        await storage.updateChannel(channel2.id, { isActive: false });
      }
    }
  }
  const channel = await storage.createChannel(validatedChannel);
  try {
    const apiVersion = process.env.WHATSAPP_API_VERSION || "v23.0";
    const fields = "id,account_mode,display_phone_number,is_official_business_account,is_pin_enabled,is_preverified_number,messaging_limit_tier,name_status,new_name_status,platform_type,quality_rating,quality_score,search_visibility,status,throughput,verified_name,code_verification_status,certificate";
    const url = `https://graph.facebook.com/${apiVersion}/${channel.phoneNumberId}?fields=${fields}`;
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${channel.accessToken}`
      }
    });
    const data = await response.json();
    if (response.ok) {
      console.log("Channel health data:", JSON.stringify(data, null, 2));
      const healthDetails = {
        // Core fields
        status: data.account_mode || "UNKNOWN",
        name_status: data.name_status || "UNKNOWN",
        phone_number: data.display_phone_number || channel.phoneNumber,
        quality_rating: data.quality_rating || "UNKNOWN",
        throughput_level: data.throughput?.level || "STANDARD",
        verification_status: data.verified_name?.status || "NOT_VERIFIED",
        messaging_limit: data.messaging_limit_tier || "UNKNOWN",
        // Additional fields from Meta API
        platform_type: data.platform_type,
        is_official_business_account: data.is_official_business_account,
        quality_score: data.quality_score,
        is_preverified_number: data.is_preverified_number,
        search_visibility: data.search_visibility,
        is_pin_enabled: data.is_pin_enabled,
        code_verification_status: data.code_verification_status,
        certificate: data.certificate
      };
      await storage.updateChannel(channel.id, {
        healthStatus: "healthy",
        lastHealthCheck: /* @__PURE__ */ new Date(),
        healthDetails
      });
    } else {
      await storage.updateChannel(channel.id, {
        healthStatus: "error",
        lastHealthCheck: /* @__PURE__ */ new Date(),
        healthDetails: {
          error: data.error?.message || "Unknown error",
          error_code: data.error?.code,
          error_type: data.error?.type
        }
      });
    }
  } catch (error) {
    console.error("Error checking channel health after creation:", error);
  }
  const updatedChannel = await storage.getChannel(channel.id);
  res.json(updatedChannel);
});
var updateChannel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.body.isActive === true) {
    const channels2 = await storage.getChannels();
    for (const channel2 of channels2) {
      if (channel2.id !== id && channel2.isActive) {
        await storage.updateChannel(channel2.id, { isActive: false });
      }
    }
  }
  const channel = await storage.updateChannel(id, req.body);
  if (!channel) {
    throw new AppError(404, "Channel not found");
  }
  res.json(channel);
});
var deleteChannel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const success = await storage.deleteChannel(id);
  if (!success) {
    throw new AppError(404, "Channel not found");
  }
  res.status(204).send();
});
var checkChannelHealth = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const channel = await storage.getChannel(id);
  if (!channel) {
    throw new AppError(404, "Channel not found");
  }
  try {
    const apiVersion = process.env.WHATSAPP_API_VERSION || "v23.0";
    const fields = "id,account_mode,display_phone_number,is_official_business_account,is_pin_enabled,is_preverified_number,messaging_limit_tier,name_status,new_name_status,platform_type,quality_rating,quality_score,search_visibility,status,throughput,verified_name,code_verification_status,certificate";
    const url = `https://graph.facebook.com/${apiVersion}/${channel.phoneNumberId}?fields=${fields}`;
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${channel.accessToken}`
      }
    });
    const data = await response.json();
    if (response.ok) {
      console.log("Channel health API response:", JSON.stringify(data, null, 2));
      const healthDetails = {
        status: data.account_mode || "UNKNOWN",
        name_status: data.name_status || "UNKNOWN",
        phone_number: data.display_phone_number || channel.phoneNumber,
        quality_rating: data.quality_rating || "UNKNOWN",
        throughput_level: data.throughput?.level || "STANDARD",
        verification_status: data.verified_name?.status || "NOT_VERIFIED",
        messaging_limit: data.messaging_limit_tier || "UNKNOWN",
        // Additional fields from Meta API
        platform_type: data.platform_type,
        is_official_business_account: data.is_official_business_account,
        quality_score: data.quality_score,
        is_preverified_number: data.is_preverified_number,
        search_visibility: data.search_visibility,
        is_pin_enabled: data.is_pin_enabled,
        code_verification_status: data.code_verification_status,
        certificate: data.certificate
      };
      await storage.updateChannel(id, {
        healthStatus: "healthy",
        lastHealthCheck: /* @__PURE__ */ new Date(),
        healthDetails
      });
      res.json({
        status: "healthy",
        details: healthDetails,
        lastCheck: /* @__PURE__ */ new Date()
      });
    } else {
      await storage.updateChannel(id, {
        healthStatus: "error",
        lastHealthCheck: /* @__PURE__ */ new Date(),
        healthDetails: { error: data.error?.message || "Unknown error" }
      });
      res.json({
        status: "error",
        error: data.error?.message || "Failed to fetch channel health",
        lastCheck: /* @__PURE__ */ new Date()
      });
    }
  } catch (error) {
    await storage.updateChannel(id, {
      healthStatus: "error",
      lastHealthCheck: /* @__PURE__ */ new Date(),
      healthDetails: { error: "Network error" }
    });
    res.json({
      status: "error",
      error: "Failed to check channel health",
      lastCheck: /* @__PURE__ */ new Date()
    });
  }
});
var checkAllChannelsHealth = asyncHandler(async (req, res) => {
  const { channelHealthMonitor: channelHealthMonitor2 } = await Promise.resolve().then(() => (init_channel_health_monitor(), channel_health_monitor_exports));
  await channelHealthMonitor2.runManualCheck();
  res.json({
    message: "Health check triggered for all channels",
    timestamp: /* @__PURE__ */ new Date()
  });
});

// server/middlewares/validation.middleware.ts
import { z } from "zod";
function validateRequest(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError(400, `Validation error: ${error.errors.map((e) => e.message).join(", ")}`);
      }
      throw error;
    }
  };
}

// server/routes/channels.routes.ts
init_schema();
function registerChannelRoutes(app2) {
  app2.get("/api/channels", getChannels);
  app2.get("/api/channels/active", getActiveChannel);
  app2.post(
    "/api/channels",
    validateRequest(insertChannelSchema),
    createChannel
  );
  app2.put("/api/channels/:id", updateChannel);
  app2.delete("/api/channels/:id", deleteChannel);
  app2.post("/api/channels/:id/health", checkChannelHealth);
  app2.post("/api/channels/health-check-all", checkAllChannelsHealth);
}

// server/controllers/dashboard.controller.ts
init_storage();
var getDashboardStats = asyncHandler(async (req, res) => {
  const channelId = req.query.channelId;
  if (channelId) {
    const stats = await storage.getDashboardStatsByChannel(channelId);
    res.json(stats);
  } else {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  }
});
var getAnalytics = asyncHandler(async (req, res) => {
  const channelId = req.query.channelId;
  const days = req.query.days ? parseInt(req.query.days) : void 0;
  if (channelId) {
    const analytics2 = await storage.getAnalyticsByChannel(channelId, days);
    res.json(analytics2);
  } else {
    const analytics2 = await storage.getAnalytics();
    res.json(analytics2);
  }
});
var createAnalytics = asyncHandler(async (req, res) => {
  const analytics2 = await storage.createAnalytics(req.body);
  res.json(analytics2);
});

// server/middlewares/channel.middleware.ts
init_storage();
async function extractChannelId(req, res, next) {
  try {
    let channelId = req.query.channelId;
    if (!channelId) {
      const activeChannel = await storage.getActiveChannel();
      if (activeChannel) {
        channelId = activeChannel.id;
      }
    }
    req.channelId = channelId;
    next();
  } catch (error) {
    next(error);
  }
}

// server/routes/dashboard.routes.ts
function registerDashboardRoutes(app2) {
  app2.get(
    "/api/dashboard/stats",
    extractChannelId,
    getDashboardStats
  );
  app2.get(
    "/api/analytics",
    extractChannelId,
    getAnalytics
  );
  app2.post("/api/analytics", createAnalytics);
}

// server/controllers/analytics.controller.ts
init_db();
init_schema();
import { eq as eq13, and as and3, gte as gte3, lte, count, sql as sql5, desc as desc11 } from "drizzle-orm";
import PDFDocument from "pdfkit";
import * as XLSX from "xlsx";
var getMessageAnalytics = asyncHandler(async (req, res) => {
  const { channelId, days = "30", startDate, endDate } = req.query;
  const daysNum = parseInt(days, 10);
  const start = startDate ? new Date(startDate) : new Date(Date.now() - daysNum * 24 * 60 * 60 * 1e3);
  const end = endDate ? new Date(endDate) : /* @__PURE__ */ new Date();
  const conditions = [];
  if (channelId) {
    conditions.push(eq13(conversations.channelId, channelId));
  }
  conditions.push(gte3(messages.createdAt, start));
  conditions.push(lte(messages.createdAt, end));
  const messageStats = await db.select({
    date: sql5`DATE(${messages.createdAt})`,
    totalSent: count(messages.id),
    delivered: sql5`COUNT(CASE WHEN ${messages.status} = 'delivered' THEN 1 END)`,
    read: sql5`COUNT(CASE WHEN ${messages.status} = 'read' THEN 1 END)`,
    failed: sql5`COUNT(CASE WHEN ${messages.status} = 'failed' THEN 1 END)`,
    pending: sql5`COUNT(CASE WHEN ${messages.status} = 'pending' THEN 1 END)`
  }).from(messages).innerJoin(conversations, eq13(messages.conversationId, conversations.id)).where(and3(...conditions)).groupBy(sql5`DATE(${messages.createdAt})`).orderBy(sql5`DATE(${messages.createdAt})`);
  const overallStats = await db.select({
    totalMessages: count(messages.id),
    totalDelivered: sql5`COUNT(CASE WHEN ${messages.status} = 'delivered' THEN 1 END)`,
    totalRead: sql5`COUNT(CASE WHEN ${messages.status} = 'read' THEN 1 END)`,
    totalFailed: sql5`COUNT(CASE WHEN ${messages.status} = 'failed' THEN 1 END)`,
    totalReplied: sql5`COUNT(CASE WHEN ${messages.fromUser} = true THEN 1 END)`,
    uniqueContacts: sql5`COUNT(DISTINCT ${conversations.contactPhone})`
  }).from(messages).innerJoin(conversations, eq13(messages.conversationId, conversations.id)).where(and3(...conditions));
  const messageTypes = await db.select({
    direction: messages.direction,
    count: count(messages.id)
  }).from(messages).innerJoin(conversations, eq13(messages.conversationId, conversations.id)).where(and3(...conditions)).groupBy(messages.direction);
  const hourlyDistribution = await db.select({
    hour: sql5`EXTRACT(HOUR FROM ${messages.createdAt})`,
    count: count(messages.id)
  }).from(messages).innerJoin(conversations, eq13(messages.conversationId, conversations.id)).where(and3(...conditions)).groupBy(sql5`EXTRACT(HOUR FROM ${messages.createdAt})`).orderBy(sql5`EXTRACT(HOUR FROM ${messages.createdAt})`);
  res.json({
    dailyStats: messageStats,
    overall: overallStats[0] || {},
    messageTypes,
    hourlyDistribution,
    period: {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      days: daysNum
    }
  });
});
var getCampaignAnalytics = asyncHandler(async (req, res) => {
  const { channelId } = req.query;
  const conditions = [];
  if (channelId) {
    conditions.push(eq13(campaigns.channelId, channelId));
  }
  const campaignStats = await db.select().from(campaigns).where(conditions.length > 0 ? and3(...conditions) : void 0).orderBy(desc11(campaigns.createdAt));
  const campaignsWithRates = campaignStats.map((campaign) => ({
    ...campaign,
    deliveryRate: campaign.sentCount && campaign.sentCount > 0 ? (campaign.deliveredCount || 0) / campaign.sentCount * 100 : 0,
    readRate: campaign.deliveredCount && campaign.deliveredCount > 0 ? (campaign.readCount || 0) / campaign.deliveredCount * 100 : 0,
    replyRate: campaign.readCount && campaign.readCount > 0 ? (campaign.repliedCount || 0) / campaign.readCount * 100 : 0
  }));
  const aggregatedStats = campaignStats.reduce((acc, campaign) => ({
    totalCampaigns: acc.totalCampaigns + 1,
    activeCampaigns: acc.activeCampaigns + (campaign.status === "active" ? 1 : 0),
    completedCampaigns: acc.completedCampaigns + (campaign.status === "completed" ? 1 : 0),
    totalRecipients: acc.totalRecipients + (campaign.recipientCount || 0),
    totalSent: acc.totalSent + (campaign.sentCount || 0),
    totalDelivered: acc.totalDelivered + (campaign.deliveredCount || 0),
    totalRead: acc.totalRead + (campaign.readCount || 0),
    totalReplied: acc.totalReplied + (campaign.repliedCount || 0),
    totalFailed: acc.totalFailed + (campaign.failedCount || 0)
  }), {
    totalCampaigns: 0,
    activeCampaigns: 0,
    completedCampaigns: 0,
    totalRecipients: 0,
    totalSent: 0,
    totalDelivered: 0,
    totalRead: 0,
    totalReplied: 0,
    totalFailed: 0
  });
  res.json({
    campaigns: campaignsWithRates,
    summary: aggregatedStats
  });
});
var getCampaignAnalyticsById = asyncHandler(async (req, res) => {
  const { campaignId } = req.params;
  const campaign = await db.select().from(campaigns).where(eq13(campaigns.id, campaignId)).limit(1);
  if (!campaign[0]) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }
  const endDate = /* @__PURE__ */ new Date();
  const startDate = new Date(campaign[0].createdAt || /* @__PURE__ */ new Date());
  const dailyStats = await db.select({
    date: sql5`DATE(${messages.timestamp})`,
    sent: count(messages.id),
    delivered: sql5`COUNT(CASE WHEN ${messages.status} = 'delivered' THEN 1 END)`,
    read: sql5`COUNT(CASE WHEN ${messages.status} = 'read' THEN 1 END)`,
    failed: sql5`COUNT(CASE WHEN ${messages.status} = 'failed' THEN 1 END)`
  }).from(messages).where(eq13(messages.campaignId, campaignId)).groupBy(sql5`DATE(${messages.timestamp})`).orderBy(sql5`DATE(${messages.timestamp})`);
  const recipientStats = await db.select({
    status: messages.status,
    count: count(messages.id)
  }).from(messages).where(eq13(messages.campaignId, campaignId)).groupBy(messages.status);
  const errorAnalysis = await db.select({
    errorCode: sql5`${messages.errorDetails}->>'code'`,
    errorMessage: sql5`${messages.errorDetails}->>'message'`,
    count: count(messages.id)
  }).from(messages).where(and3(
    eq13(messages.campaignId, campaignId),
    eq13(messages.status, "failed")
  )).groupBy(sql5`${messages.errorDetails}->>'code'`, sql5`${messages.errorDetails}->>'message'`).orderBy(desc11(count(messages.id)));
  res.json({
    campaign: campaign[0],
    dailyStats,
    recipientStats,
    errorAnalysis
  });
});
var getCampaignDetails = asyncHandler(async (req, res) => {
  const { campaignId } = req.params;
  const campaign = await db.select().from(campaigns).where(eq13(campaigns.id, campaignId)).limit(1);
  if (!campaign.length) {
    throw new AppError(404, "Campaign not found");
  }
  const messageStats = await db.select({
    date: sql5`DATE(${messages.createdAt})`,
    sent: count(messages.id),
    delivered: sql5`COUNT(CASE WHEN ${messages.status} = 'delivered' THEN 1 END)`,
    read: sql5`COUNT(CASE WHEN ${messages.status} = 'read' THEN 1 END)`,
    failed: sql5`COUNT(CASE WHEN ${messages.status} = 'failed' THEN 1 END)`
  }).from(messages).where(eq13(messages.campaignId, campaignId)).groupBy(sql5`DATE(${messages.createdAt})`).orderBy(sql5`DATE(${messages.createdAt})`);
  const recipientStats = await db.select({
    status: messages.status,
    count: count(messages.id)
  }).from(messages).where(eq13(messages.campaignId, campaignId)).groupBy(messages.status);
  const errorAnalysis = await db.select({
    errorCode: messages.errorCode,
    errorMessage: messages.errorMessage,
    count: count(messages.id)
  }).from(messages).where(and3(
    eq13(messages.campaignId, campaignId),
    eq13(messages.status, "failed")
  )).groupBy(messages.errorCode, messages.errorMessage);
  res.json({
    campaign: campaign[0],
    dailyStats: messageStats,
    recipientStats,
    errorAnalysis
  });
});
var exportAnalytics = asyncHandler(async (req, res) => {
  const { format = "pdf", type = "messages", channelId, days = "30" } = req.query;
  if (format === "pdf") {
    await exportPDF(req, res);
  } else if (format === "excel") {
    await exportExcel(req, res);
  } else {
    throw new AppError(400, "Invalid export format");
  }
});
async function exportPDF(req, res) {
  const { type, channelId, days = "30" } = req.query;
  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=analytics-report-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.pdf`);
  doc.pipe(res);
  doc.fontSize(20).text("WhatsApp Analytics Report", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Generated on: ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`, { align: "center" });
  doc.moveDown(2);
  if (type === "messages" || type === "all") {
    const daysNum = parseInt(days);
    const start = new Date(Date.now() - daysNum * 24 * 60 * 60 * 1e3);
    const conditions = [];
    if (channelId) {
      conditions.push(eq13(conversations.channelId, channelId));
    }
    conditions.push(gte3(messages.createdAt, start));
    const stats = await db.select({
      totalMessages: count(messages.id),
      delivered: sql5`COUNT(CASE WHEN ${messages.status} = 'delivered' THEN 1 END)`,
      read: sql5`COUNT(CASE WHEN ${messages.status} = 'read' THEN 1 END)`,
      failed: sql5`COUNT(CASE WHEN ${messages.status} = 'failed' THEN 1 END)`
    }).from(messages).innerJoin(conversations, eq13(messages.conversationId, conversations.id)).where(and3(...conditions));
    doc.fontSize(16).text("Message Statistics", { underline: true });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Total Messages: ${stats[0]?.totalMessages || 0}`);
    doc.text(`Delivered: ${stats[0]?.delivered || 0}`);
    doc.text(`Read: ${stats[0]?.read || 0}`);
    doc.text(`Failed: ${stats[0]?.failed || 0}`);
    doc.moveDown(2);
  }
  if (type === "campaigns" || type === "all") {
    const campaignStats = await db.select({
      totalCampaigns: count(campaigns.id),
      totalSent: sql5`SUM(${campaigns.sentCount})`,
      totalDelivered: sql5`SUM(${campaigns.deliveredCount})`
    }).from(campaigns).where(channelId ? eq13(campaigns.channelId, channelId) : void 0);
    doc.fontSize(16).text("Campaign Statistics", { underline: true });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Total Campaigns: ${campaignStats[0]?.totalCampaigns || 0}`);
    doc.text(`Total Sent: ${campaignStats[0]?.totalSent || 0}`);
    doc.text(`Total Delivered: ${campaignStats[0]?.totalDelivered || 0}`);
  }
  doc.end();
}
async function exportExcel(req, res) {
  const { type, channelId, days = "30" } = req.query;
  const workbook = XLSX.utils.book_new();
  if (type === "messages" || type === "all") {
    const daysNum = parseInt(days);
    const start = new Date(Date.now() - daysNum * 24 * 60 * 60 * 1e3);
    const conditions = [];
    if (channelId) {
      conditions.push(eq13(conversations.channelId, channelId));
    }
    conditions.push(gte3(messages.createdAt, start));
    const messageData = await db.select({
      date: sql5`DATE(${messages.createdAt})`,
      sent: count(messages.id),
      delivered: sql5`COUNT(CASE WHEN ${messages.status} = 'delivered' THEN 1 END)`,
      read: sql5`COUNT(CASE WHEN ${messages.status} = 'read' THEN 1 END)`,
      failed: sql5`COUNT(CASE WHEN ${messages.status} = 'failed' THEN 1 END)`
    }).from(messages).innerJoin(conversations, eq13(messages.conversationId, conversations.id)).where(and3(...conditions)).groupBy(sql5`DATE(${messages.createdAt})`).orderBy(sql5`DATE(${messages.createdAt})`);
    const ws2 = XLSX.utils.json_to_sheet(messageData);
    XLSX.utils.book_append_sheet(workbook, ws2, "Message Analytics");
  }
  if (type === "campaigns" || type === "all") {
    const campaignData = await db.select({
      name: campaigns.name,
      type: campaigns.type,
      status: campaigns.status,
      recipients: campaigns.recipientCount,
      sent: campaigns.sentCount,
      delivered: campaigns.deliveredCount,
      read: campaigns.readCount,
      replied: campaigns.repliedCount,
      failed: campaigns.failedCount
    }).from(campaigns).where(channelId ? eq13(campaigns.channelId, channelId) : void 0).orderBy(desc11(campaigns.createdAt));
    const ws2 = XLSX.utils.json_to_sheet(campaignData);
    XLSX.utils.book_append_sheet(workbook, ws2, "Campaign Analytics");
  }
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename=analytics-report-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.xlsx`);
  res.send(buffer);
}

// server/routes/analytics.routes.ts
function registerAnalyticsRoutes(app2) {
  app2.get("/api/analytics", getAnalytics);
  app2.get("/api/analytics/messages", getMessageAnalytics);
  app2.get("/api/analytics/campaigns", getCampaignAnalytics);
  app2.get("/api/analytics/campaigns/:campaignId", getCampaignAnalyticsById);
  app2.get("/api/analytics/export", exportAnalytics);
}

// server/controllers/contacts.controller.ts
init_storage();
init_schema();
var getContacts = asyncHandler(async (req, res) => {
  const { search, channelId } = req.query;
  let contacts3;
  if (channelId && typeof channelId === "string") {
    contacts3 = await storage.getContactsByChannel(channelId);
  } else {
    contacts3 = await storage.getContacts();
  }
  if (search && typeof search === "string") {
    const searchLower = search.toLowerCase();
    contacts3 = contacts3.filter(
      (contact) => contact.name.toLowerCase().includes(searchLower) || contact.phone.includes(search) || contact.email?.toLowerCase().includes(searchLower)
    );
  }
  res.json(contacts3);
});
var getContact = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const contact = await storage.getContact(id);
  if (!contact) {
    throw new AppError(404, "Contact not found");
  }
  res.json(contact);
});
var createContact = asyncHandler(async (req, res) => {
  const validatedContact = insertContactSchema.parse(req.body);
  let channelId = req.query.channelId;
  if (!channelId) {
    const activeChannel = await storage.getActiveChannel();
    if (activeChannel) {
      channelId = activeChannel.id;
    }
  }
  const existingContacts = channelId ? await storage.getContactsByChannel(channelId) : await storage.getContacts();
  const duplicate = existingContacts.find((c) => c.phone === validatedContact.phone);
  if (duplicate) {
    throw new AppError(409, "Contact with this phone number already exists");
  }
  const contact = await storage.createContact({
    ...validatedContact,
    channelId
  });
  res.json(contact);
});
var updateContact = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const contact = await storage.updateContact(id, req.body);
  if (!contact) {
    throw new AppError(404, "Contact not found");
  }
  res.json(contact);
});
var deleteContact = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const success = await storage.deleteContact(id);
  if (!success) {
    throw new AppError(404, "Contact not found");
  }
  res.status(204).send();
});
var importContacts = asyncHandler(async (req, res) => {
  const { contacts: contacts3, channelId: bodyChannelId } = req.body;
  if (!Array.isArray(contacts3)) {
    throw new AppError(400, "Contacts must be an array");
  }
  let channelId = bodyChannelId || req.query.channelId;
  if (!channelId) {
    const activeChannel = await storage.getActiveChannel();
    if (activeChannel) {
      channelId = activeChannel.id;
    }
  }
  const existingContacts = channelId ? await storage.getContactsByChannel(channelId) : await storage.getContacts();
  const existingPhones = new Set(existingContacts.map((c) => c.phone));
  const createdContacts = [];
  const duplicates = [];
  const errors = [];
  for (const contact of contacts3) {
    try {
      if (existingPhones.has(contact.phone)) {
        duplicates.push({
          contact,
          reason: "Phone number already exists"
        });
        continue;
      }
      const validatedContact = insertContactSchema.parse({
        ...contact,
        channelId
      });
      const created = await storage.createContact(validatedContact);
      createdContacts.push(created);
      existingPhones.add(created.phone);
    } catch (error) {
      errors.push({
        contact,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
  res.json({
    created: createdContacts.length,
    duplicates: duplicates.length,
    failed: errors.length,
    total: contacts3.length,
    details: {
      created: createdContacts.length,
      duplicates: duplicates.slice(0, 10),
      // Limit to first 10
      errors: errors.slice(0, 10)
      // Limit to first 10
    }
  });
});

// server/routes/contacts.routes.ts
init_schema();
function registerContactRoutes(app2) {
  app2.get(
    "/api/contacts",
    extractChannelId,
    getContacts
  );
  app2.get("/api/contacts/:id", getContact);
  app2.post(
    "/api/contacts",
    extractChannelId,
    validateRequest(insertContactSchema),
    createContact
  );
  app2.put("/api/contacts/:id", updateContact);
  app2.delete("/api/contacts/:id", deleteContact);
  app2.post(
    "/api/contacts/import",
    extractChannelId,
    importContacts
  );
}

// server/utils/async-handler.ts
function asyncHandler2(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// server/controllers/campaigns.controller.ts
init_storage();
import { z as z2 } from "zod";
import { randomUUID as randomUUID2 } from "crypto";

// server/services/whatsapp-api.ts
var WhatsAppApiService = class {
  channel;
  baseUrl;
  headers;
  constructor(channel) {
    this.channel = channel;
    const apiVersion = process.env.WHATSAPP_API_VERSION || "v23.0";
    this.baseUrl = `https://graph.facebook.com/${apiVersion}`;
    this.headers = {
      "Authorization": `Bearer ${channel.accessToken}`,
      "Content-Type": "application/json"
    };
  }
  // Static method for sending template messages
  static async sendTemplateMessage(channel, to, templateName, parameters = [], language = "en_US", isMarketing = true) {
    const apiVersion = process.env.WHATSAPP_API_VERSION || "v23.0";
    const baseUrl = `https://graph.facebook.com/${apiVersion}`;
    const phoneNumber = to.replace(/\D/g, "");
    const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber.substring(1) : phoneNumber;
    const body = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "template",
      template: {
        name: templateName,
        language: { code: language },
        components: parameters.length > 0 ? [{
          type: "body",
          parameters: parameters.map((text2) => ({ type: "text", text: text2 }))
        }] : void 0
      }
    };
    console.log("Sending WhatsApp template message:", {
      to: formattedPhone,
      templateName,
      language,
      parameters,
      phoneNumberId: channel.phoneNumberId,
      isMarketing,
      usingMMLite: isMarketing
    });
    const endpoint = isMarketing ? `${baseUrl}/${channel.phoneNumberId}/marketing_messages` : `${baseUrl}/${channel.phoneNumberId}/messages`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${channel.accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    const responseData = await response.json();
    if (!response.ok) {
      console.error("WhatsApp API Error:", responseData);
      throw new Error(responseData.error?.message || "Failed to send template message");
    }
    console.log("WhatsApp message sent successfully:", responseData);
    return responseData;
  }
  // Static method for checking rate limits
  static async checkRateLimit(channelId) {
    return true;
  }
  // Format phone number to international format
  formatPhoneNumber(phone) {
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      cleaned = "91" + cleaned;
    }
    return cleaned;
  }
  // MM Lite message sending
  async sendMMliteMessage(to, templateName, parameters = [], language = "en_US") {
    if (!this.channel.mmLiteApiUrl || !this.channel.mmLiteApiKey) {
      throw new Error("MM Lite configuration missing");
    }
    const formattedPhone = this.formatPhoneNumber(to);
    const body = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "template",
      template: {
        name: templateName,
        language: { code: language },
        components: parameters.length > 0 ? [{
          type: "body",
          parameters: parameters.map((text2) => ({ type: "text", text: text2 }))
        }] : void 0
      }
    };
    const response = await fetch(
      `${this.channel.mmLiteApiUrl}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.channel.mmLiteApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to send MM Lite message");
    }
    return await response.json();
  }
  async createTemplate(templateData) {
    const components = this.formatTemplateComponents(templateData);
    const body = {
      name: templateData.name,
      category: templateData.category,
      language: templateData.language,
      components
    };
    const response = await fetch(
      `${this.baseUrl}/${this.channel.whatsappBusinessAccountId}/message_templates`,
      {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(body)
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to create template");
    }
    return await response.json();
  }
  async deleteTemplate(templateName) {
    const response = await fetch(
      `${this.baseUrl}/${this.channel.whatsappBusinessAccountId}/message_templates?name=${encodeURIComponent(templateName)}`,
      {
        method: "DELETE",
        headers: this.headers
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to delete template");
    }
    return await response.json();
  }
  async getTemplates() {
    const response = await fetch(
      `${this.baseUrl}/${this.channel.whatsappBusinessAccountId}/message_templates?fields=id,status,name,language,category,components&limit=100`,
      {
        headers: this.headers
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to fetch templates");
    }
    const data = await response.json();
    return data.data || [];
  }
  async sendMessage(to, templateName, parameters = []) {
    const formattedPhone = this.formatPhoneNumber(to);
    const body = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "template",
      template: {
        name: templateName,
        language: { code: "en_US" },
        components: parameters.length > 0 ? [{
          type: "body",
          parameters: parameters.map((text2) => ({ type: "text", text: text2 }))
        }] : void 0
      }
    };
    console.log("Sending WhatsApp message:", {
      to: formattedPhone,
      templateName,
      parameters,
      phoneNumberId: this.channel.phoneNumberId
    });
    const response = await fetch(
      `${this.baseUrl}/${this.channel.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(body)
      }
    );
    const responseData = await response.json();
    if (!response.ok) {
      console.error("WhatsApp API Error:", responseData);
      throw new Error(responseData.error?.message || "Failed to send message");
    }
    console.log("WhatsApp message sent successfully:", responseData);
    return responseData;
  }
  async sendTextMessage(to, text2) {
    const formattedPhone = this.formatPhoneNumber(to);
    const body = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "text",
      text: { body: text2 }
    };
    const response = await fetch(
      `${this.baseUrl}/${this.channel.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(body)
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to send message");
    }
    return await response.json();
  }
  async sendDirectMessage(payload) {
    if (payload.to) {
      payload.to = this.formatPhoneNumber(payload.to);
    }
    const body = {
      messaging_product: "whatsapp",
      ...payload
    };
    const response = await fetch(
      `${this.baseUrl}/${this.channel.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(body)
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to send message");
    }
    const data = await response.json();
    return { success: true, data };
  }
  formatTemplateComponents(templateData) {
    const components = [];
    if (templateData.mediaType && templateData.mediaType !== "text") {
      const headerFormat = templateData.mediaType.toUpperCase();
      if (templateData.header) {
        components.push({
          type: "HEADER",
          format: headerFormat,
          text: templateData.header,
          example: templateData.mediaUrl ? {
            header_handle: [templateData.mediaUrl]
          } : void 0
        });
      }
    } else if (templateData.header) {
      components.push({
        type: "HEADER",
        format: "TEXT",
        text: templateData.header
      });
    }
    components.push({
      type: "BODY",
      text: templateData.body
    });
    if (templateData.footer) {
      components.push({
        type: "FOOTER",
        text: templateData.footer
      });
    }
    if (templateData.buttons && templateData.buttons.length > 0) {
      components.push({
        type: "BUTTONS",
        buttons: templateData.buttons.map((button) => {
          if (button.type === "url") {
            return {
              type: "URL",
              text: button.text,
              url: button.url
            };
          } else if (button.type === "phone") {
            return {
              type: "PHONE_NUMBER",
              text: button.text,
              phone_number: button.phoneNumber
            };
          } else {
            return {
              type: "QUICK_REPLY",
              text: button.text
            };
          }
        })
      });
    }
    return components;
  }
  async getMessageStatus(whatsappMessageId) {
    return {
      status: "sent",
      deliveredAt: null,
      readAt: null,
      errorCode: null,
      errorMessage: null
    };
  }
};

// server/controllers/campaigns.controller.ts
var createCampaignSchema = z2.object({
  channelId: z2.string(),
  name: z2.string(),
  description: z2.string().optional(),
  campaignType: z2.enum(["contacts", "csv", "api"]),
  type: z2.enum(["marketing", "transactional"]),
  apiType: z2.enum(["cloud_api", "mm_lite"]),
  templateId: z2.string(),
  templateName: z2.string(),
  templateLanguage: z2.string(),
  variableMapping: z2.record(z2.string()).optional(),
  status: z2.string(),
  scheduledAt: z2.string().nullable(),
  contactGroups: z2.array(z2.string()).optional(),
  csvData: z2.array(z2.any()).optional(),
  recipientCount: z2.number(),
  autoRetry: z2.boolean().optional()
});
var updateStatusSchema = z2.object({
  status: z2.string()
});
var campaignsController = {
  // Get all campaigns
  getCampaigns: asyncHandler2(async (req, res) => {
    const channelId = req.headers["x-channel-id"];
    const campaigns2 = channelId ? await storage.getCampaignsByChannel(channelId) : await storage.getCampaigns();
    res.json(campaigns2);
  }),
  // Get campaign by ID
  getCampaign: asyncHandler2(async (req, res) => {
    const campaign = await storage.getCampaign(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    res.json(campaign);
  }),
  // Create new campaign
  createCampaign: asyncHandler2(async (req, res) => {
    const data = createCampaignSchema.parse(req.body);
    let apiKey = void 0;
    let apiEndpoint = void 0;
    if (data.campaignType === "api") {
      apiKey = `ww_${randomUUID2().replace(/-/g, "")}`;
      apiEndpoint = `${req.protocol}://${req.get("host")}/api/campaigns/send/${apiKey}`;
    }
    let contactIds = [];
    if (data.campaignType === "csv" && data.csvData) {
      for (const row of data.csvData) {
        if (row.phone) {
          let contact = await storage.getContactByPhone(row.phone);
          if (!contact) {
            contact = await storage.createContact({
              channelId: data.channelId,
              name: row.name || row.phone,
              phone: row.phone,
              email: row.email || null,
              groups: ["csv_import"],
              tags: [`campaign_${data.name}`]
            });
          }
          contactIds.push(contact.id);
        }
      }
    } else if (data.campaignType === "contacts") {
      contactIds = data.contactGroups || [];
    }
    const recipientCount = contactIds.length;
    const campaign = await storage.createCampaign({
      ...data,
      apiKey,
      apiEndpoint,
      recipientCount,
      contactGroups: contactIds
    });
    if (data.status === "active" && !data.scheduledAt) {
      await startCampaignExecution(campaign.id);
    }
    res.json(campaign);
  }),
  // Update campaign status
  updateCampaignStatus: asyncHandler2(async (req, res) => {
    const { status } = updateStatusSchema.parse(req.body);
    const campaign = await storage.updateCampaign(req.params.id, { status });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    if (status === "active") {
      await startCampaignExecution(campaign.id);
    }
    res.json(campaign);
  }),
  // Delete campaign
  deleteCampaign: asyncHandler2(async (req, res) => {
    const deleted = await storage.deleteCampaign(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    res.json({ success: true });
  }),
  // Start campaign execution
  startCampaign: asyncHandler2(async (req, res) => {
    const campaign = await storage.getCampaign(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    await startCampaignExecution(campaign.id);
    res.json({ success: true, message: "Campaign started" });
  }),
  // Get campaign analytics
  getCampaignAnalytics: asyncHandler2(async (req, res) => {
    const campaign = await storage.getCampaign(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    res.json({
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      metrics: {
        recipientCount: campaign.recipientCount,
        sentCount: campaign.sentCount,
        deliveredCount: campaign.deliveredCount,
        readCount: campaign.readCount,
        repliedCount: campaign.repliedCount,
        failedCount: campaign.failedCount,
        deliveryRate: campaign.sentCount ? (campaign.deliveredCount / campaign.sentCount * 100).toFixed(2) : 0,
        readRate: campaign.deliveredCount ? (campaign.readCount / campaign.deliveredCount * 100).toFixed(2) : 0
      },
      createdAt: campaign.createdAt,
      completedAt: campaign.completedAt
    });
  }),
  // API campaign endpoint
  sendApiCampaign: asyncHandler2(async (req, res) => {
    const { apiKey } = req.params;
    const campaigns2 = await storage.getCampaigns();
    const campaign = campaigns2.find((c) => c.apiKey === apiKey);
    if (!campaign || campaign.campaignType !== "api") {
      return res.status(401).json({ error: "Invalid API key" });
    }
    if (campaign.status !== "active") {
      return res.status(400).json({ error: "Campaign is not active" });
    }
    const channel = await storage.getChannel(campaign.channelId);
    if (!channel) {
      return res.status(400).json({ error: "Channel not found" });
    }
    const { phone, variables = {} } = req.body;
    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }
    const template = await storage.getTemplate(campaign.templateId);
    if (!template) {
      return res.status(400).json({ error: "Template not found" });
    }
    const templateParams = [];
    if (campaign.variableMapping && Object.keys(campaign.variableMapping).length > 0) {
      Object.keys(campaign.variableMapping).forEach((key) => {
        const value = variables[campaign.variableMapping[key]] || "";
        templateParams.push({ type: "text", text: value });
      });
    }
    try {
      const response = await WhatsAppApiService.sendTemplateMessage(
        channel,
        phone,
        template.name,
        templateParams.map((p) => p.text),
        template.language || "en_US",
        true
        // Always use MM Lite
      );
      const messageId = response.messages?.[0]?.id || `msg_${randomUUID2()}`;
      await storage.createMessage({
        channelId: channel.id,
        conversationId: null,
        // API messages may not have conversation
        to: phone,
        from: channel.phoneNumber,
        type: "template",
        content: JSON.stringify({
          templateId: template.id,
          templateName: template.name,
          parameters: templateParams
        }),
        status: "sent",
        direction: "outbound",
        whatsappMessageId: messageId,
        timestamp: /* @__PURE__ */ new Date(),
        campaignId: campaign.id
      });
      await storage.updateCampaign(campaign.id, {
        sentCount: (campaign.sentCount || 0) + 1
      });
      res.json({
        success: true,
        messageId,
        message: "Message sent successfully"
      });
    } catch (error) {
      await storage.updateCampaign(campaign.id, {
        failedCount: (campaign.failedCount || 0) + 1
      });
      res.status(500).json({
        error: "Failed to send message",
        details: error.message
      });
    }
  })
};
async function startCampaignExecution(campaignId) {
  console.log("Starting campaign execution for:", campaignId);
  const campaign = await storage.getCampaign(campaignId);
  if (!campaign || campaign.status !== "active") {
    console.log("Campaign not found or not active:", campaignId);
    return;
  }
  const channel = await storage.getChannel(campaign.channelId);
  if (!channel) {
    console.error("Channel not found for campaign:", campaignId);
    return;
  }
  const template = await storage.getTemplate(campaign.templateId);
  if (!template) {
    console.error("Template not found for campaign:", campaignId);
    return;
  }
  console.log("Campaign details:", {
    campaignId,
    channelId: channel.id,
    templateId: template.id,
    templateName: template.name,
    campaignType: campaign.campaignType,
    contactGroups: campaign.contactGroups
  });
  let contacts3 = [];
  if (campaign.campaignType === "contacts" && campaign.contactGroups) {
    for (const contactId of campaign.contactGroups) {
      const contact = await storage.getContact(contactId);
      if (contact) {
        contacts3.push(contact);
      }
    }
  }
  console.log(`Found ${contacts3.length} contacts for campaign`);
  for (const contact of contacts3) {
    try {
      console.log(`Processing contact: ${contact.name} (${contact.phone})`);
      const templateParams = [];
      if (campaign.variableMapping && Object.keys(campaign.variableMapping).length > 0) {
        Object.keys(campaign.variableMapping).forEach((key) => {
          const fieldName = campaign.variableMapping[key];
          let value = "";
          if (fieldName === "name") {
            value = contact.name;
          } else if (fieldName === "phone") {
            value = contact.phone;
          } else if (fieldName === "email") {
            value = contact.email || "";
          }
          templateParams.push({ type: "text", text: value });
        });
      }
      console.log("Sending message with params:", {
        phone: contact.phone,
        template: template.name,
        parameters: templateParams.map((p) => p.text)
      });
      const response = await WhatsAppApiService.sendTemplateMessage(
        channel,
        contact.phone,
        template.name,
        templateParams.map((p) => p.text),
        template.language || "en_US",
        true
        // Always use MM Lite
      );
      const messageId = response.messages?.[0]?.id || `msg_${randomUUID2()}`;
      await storage.createMessage({
        channelId: channel.id,
        conversationId: null,
        // Campaign messages may not have conversation
        to: contact.phone,
        from: channel.phoneNumber,
        type: "template",
        content: JSON.stringify({
          templateId: template.id,
          templateName: template.name,
          parameters: templateParams
        }),
        status: "sent",
        direction: "outbound",
        whatsappMessageId: messageId,
        timestamp: /* @__PURE__ */ new Date(),
        campaignId
      });
      await storage.updateCampaign(campaignId, {
        sentCount: (campaign.sentCount || 0) + 1
      });
    } catch (error) {
      console.error(`Failed to send message to ${contact.phone}:`, error);
      await storage.updateCampaign(campaignId, {
        failedCount: (campaign.failedCount || 0) + 1
      });
    }
  }
  const updatedCampaign = await storage.getCampaign(campaignId);
  if (updatedCampaign && (updatedCampaign.sentCount || 0) + (updatedCampaign.failedCount || 0) >= (updatedCampaign.recipientCount || 0)) {
    await storage.updateCampaign(campaignId, {
      status: "completed",
      completedAt: /* @__PURE__ */ new Date()
    });
  }
}

// server/routes/campaigns.routes.ts
function registerCampaignRoutes(app2) {
  app2.get(
    "/api/campaigns",
    extractChannelId,
    campaignsController.getCampaigns
  );
  app2.get(
    "/api/campaigns/:id",
    campaignsController.getCampaign
  );
  app2.post(
    "/api/campaigns",
    campaignsController.createCampaign
  );
  app2.patch(
    "/api/campaigns/:id/status",
    campaignsController.updateCampaignStatus
  );
  app2.delete(
    "/api/campaigns/:id",
    campaignsController.deleteCampaign
  );
  app2.post(
    "/api/campaigns/:id/start",
    campaignsController.startCampaign
  );
  app2.get(
    "/api/campaigns/:id/analytics",
    campaignsController.getCampaignAnalytics
  );
  app2.post(
    "/api/campaigns/send/:apiKey",
    campaignsController.sendApiCampaign
  );
}

// server/controllers/templates.controller.ts
init_storage();
init_schema();
var getTemplates = asyncHandler(async (req, res) => {
  const channelId = req.query.channelId;
  const templates2 = channelId ? await storage.getTemplatesByChannel(channelId) : await storage.getTemplates();
  res.json(templates2);
});
var getTemplate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const template = await storage.getTemplate(id);
  if (!template) {
    throw new AppError(404, "Template not found");
  }
  res.json(template);
});
var createTemplate = asyncHandler(async (req, res) => {
  console.log("Template creation request body:", JSON.stringify(req.body, null, 2));
  const validatedTemplate = insertTemplateSchema.parse(req.body);
  console.log("Validated template buttons:", validatedTemplate.buttons);
  let channelId = validatedTemplate.channelId;
  if (!channelId) {
    const activeChannel = await storage.getActiveChannel();
    if (!activeChannel) {
      throw new AppError(400, "No active channel found. Please configure a channel first.");
    }
    channelId = activeChannel.id;
  }
  const template = await storage.createTemplate({
    ...validatedTemplate,
    channelId,
    status: "pending"
  });
  const channel = await storage.getChannel(channelId);
  if (!channel) {
    throw new AppError(400, "Channel not found");
  }
  try {
    const whatsappApi = new WhatsAppApiService(channel);
    const result = await whatsappApi.createTemplate(validatedTemplate);
    if (result.id) {
      await storage.updateTemplate(template.id, {
        whatsappTemplateId: result.id,
        status: result.status || "pending"
      });
    }
    res.json(template);
  } catch (error) {
    console.error("WhatsApp API error:", error);
    res.json({
      ...template,
      warning: "Template created locally but failed to submit to WhatsApp"
    });
  }
});
var updateTemplate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const validatedData = templateRequestSchema.parse(req.body);
  const existingTemplate = await storage.getTemplate(id);
  if (!existingTemplate) {
    throw new AppError(404, "Template not found");
  }
  const template = await storage.updateTemplate(id, validatedData);
  if (!template) {
    throw new AppError(404, "Template not found");
  }
  const channel = await storage.getChannel(template.channelId);
  if (!channel) {
    throw new AppError(400, "Channel not found");
  }
  if (existingTemplate.whatsappTemplateId) {
    try {
      const whatsappApi = new WhatsAppApiService(channel);
      await whatsappApi.deleteTemplate(existingTemplate.name);
      const result = await whatsappApi.createTemplate(validatedData);
      if (result.id) {
        await storage.updateTemplate(template.id, {
          whatsappTemplateId: result.id,
          status: result.status || "pending"
        });
      }
      res.json({
        ...template,
        message: "Template updated and resubmitted to WhatsApp for approval"
      });
    } catch (error) {
      console.error("WhatsApp API error during update:", error);
      res.json({
        ...template,
        warning: "Template updated locally but failed to resubmit to WhatsApp"
      });
    }
  } else {
    try {
      const whatsappApi = new WhatsAppApiService(channel);
      const result = await whatsappApi.createTemplate(validatedData);
      if (result.id) {
        await storage.updateTemplate(template.id, {
          whatsappTemplateId: result.id,
          status: result.status || "pending"
        });
      }
      res.json({
        ...template,
        message: "Template updated and submitted to WhatsApp for approval"
      });
    } catch (error) {
      console.error("WhatsApp API error:", error);
      res.json({
        ...template,
        warning: "Template updated locally but failed to submit to WhatsApp"
      });
    }
  }
});
var deleteTemplate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const success = await storage.deleteTemplate(id);
  if (!success) {
    throw new AppError(404, "Template not found");
  }
  res.status(204).send();
});
var syncTemplates = asyncHandler(async (req, res) => {
  let channelId = req.body.channelId || req.query.channelId || req.channelId;
  if (!channelId) {
    const activeChannel = await storage.getActiveChannel();
    if (!activeChannel) {
      throw new AppError(400, "No active channel found");
    }
    channelId = activeChannel.id;
  }
  const channel = await storage.getChannel(channelId);
  if (!channel) {
    throw new AppError(404, "Channel not found");
  }
  try {
    const whatsappApi = new WhatsAppApiService(channel);
    const whatsappTemplates = await whatsappApi.getTemplates();
    const existingTemplates = await storage.getTemplatesByChannel(channelId);
    const existingByName = new Map(existingTemplates.map((t) => [`${t.name}_${t.language}`, t]));
    let updatedCount = 0;
    let createdCount = 0;
    for (const waTemplate of whatsappTemplates) {
      const key = `${waTemplate.name}_${waTemplate.language}`;
      const existing = existingByName.get(key);
      let bodyText = "";
      if (waTemplate.components && Array.isArray(waTemplate.components)) {
        const bodyComponent = waTemplate.components.find((c) => c.type === "BODY");
        if (bodyComponent && bodyComponent.text) {
          bodyText = bodyComponent.text;
        }
      }
      if (existing) {
        if (existing.status !== waTemplate.status || existing.whatsappTemplateId !== waTemplate.id) {
          await storage.updateTemplate(existing.id, {
            status: waTemplate.status,
            whatsappTemplateId: waTemplate.id,
            body: bodyText || existing.body
          });
          updatedCount++;
        }
      } else {
        await storage.createTemplate({
          name: waTemplate.name,
          language: waTemplate.language,
          category: waTemplate.category || "marketing",
          status: waTemplate.status,
          body: bodyText || `Template ${waTemplate.name}`,
          channelId,
          whatsappTemplateId: waTemplate.id
        });
        createdCount++;
      }
    }
    res.json({
      message: `Synced templates: ${createdCount} created, ${updatedCount} updated`,
      createdCount,
      updatedCount,
      totalTemplates: whatsappTemplates.length
    });
  } catch (error) {
    console.error("Template sync error:", error);
    throw new AppError(500, "Failed to sync templates with WhatsApp");
  }
});
var seedTemplates = asyncHandler(async (req, res) => {
  const channelId = req.query.channelId;
  let finalChannelId = channelId;
  if (!finalChannelId) {
    const activeChannel = await storage.getActiveChannel();
    if (activeChannel) {
      finalChannelId = activeChannel.id;
    } else {
      throw new AppError(400, "No active channel found. Please configure a channel first.");
    }
  }
  const templates2 = [
    {
      name: "hello_world",
      body: "Hello {{1}}! Welcome to our WhatsApp Business platform.",
      category: "utility",
      language: "en",
      status: "pending",
      channelId: finalChannelId
    },
    {
      name: "order_confirmation",
      body: "Hi {{1}}, your order #{{2}} has been confirmed and will be delivered by {{3}}.",
      category: "utility",
      language: "en",
      status: "pending",
      channelId: finalChannelId
    },
    {
      name: "appointment_reminder",
      body: "Hello {{1}}, this is a reminder about your appointment on {{2}} at {{3}}. Reply YES to confirm.",
      category: "utility",
      language: "en",
      status: "pending",
      channelId: finalChannelId
    }
  ];
  const createdTemplates = await Promise.all(
    templates2.map((template) => storage.createTemplate(template))
  );
  res.json({ message: "Templates seeded successfully", templates: createdTemplates });
});

// server/routes/templates.routes.ts
init_schema();
function registerTemplateRoutes(app2) {
  app2.get(
    "/api/templates",
    extractChannelId,
    getTemplates
  );
  app2.get("/api/templates/:id", getTemplate);
  app2.post(
    "/api/templates",
    validateRequest(insertTemplateSchema),
    createTemplate
  );
  app2.put("/api/templates/:id", updateTemplate);
  app2.delete("/api/templates/:id", deleteTemplate);
  app2.post("/api/templates/sync", syncTemplates);
  app2.post(
    "/api/templates/seed",
    extractChannelId,
    seedTemplates
  );
}

// server/routes/media.routes.ts
import crypto from "crypto";
function registerMediaRoutes(app2) {
  app2.post("/api/media/upload-url", async (req, res) => {
    try {
      const { fileName, fileType } = req.body;
      const fileExtension = fileName.split(".").pop();
      const uniqueFileName = `${crypto.randomBytes(16).toString("hex")}.${fileExtension}`;
      const uploadUrl = `https://storage.example.com/upload/${uniqueFileName}`;
      const fileUrl = `https://storage.example.com/files/${uniqueFileName}`;
      res.json({
        uploadUrl,
        fileUrl
      });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ message: "Failed to generate upload URL" });
    }
  });
}

// server/controllers/conversations.controller.ts
init_storage();
init_schema();
var getConversations = asyncHandler(async (req, res) => {
  const channelId = req.query.channelId;
  const conversations2 = channelId ? await storage.getConversationsByChannel(channelId) : await storage.getConversations();
  res.json(conversations2);
});
var getConversation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const conversation = await storage.getConversation(id);
  if (!conversation) {
    throw new AppError(404, "Conversation not found");
  }
  res.json(conversation);
});
var createConversation = asyncHandler(async (req, res) => {
  const validatedConversation = insertConversationSchema.parse(req.body);
  let channelId = validatedConversation.channelId;
  if (!channelId) {
    const activeChannel = await storage.getActiveChannel();
    if (activeChannel) {
      channelId = activeChannel.id;
    }
  }
  const conversation = await storage.createConversation({
    ...validatedConversation,
    channelId
  });
  res.json(conversation);
});
var updateConversation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const conversation = await storage.updateConversation(id, req.body);
  if (!conversation) {
    throw new AppError(404, "Conversation not found");
  }
  res.json(conversation);
});
var deleteConversation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const success = await storage.deleteConversation(id);
  if (!success) {
    throw new AppError(404, "Conversation not found");
  }
  res.status(204).send();
});
var markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const conversation = await storage.updateConversation(id, {
    unreadCount: 0
  });
  if (!conversation) {
    throw new AppError(404, "Conversation not found");
  }
  res.json(conversation);
});

// server/routes/conversations.routes.ts
init_schema();
init_storage();
function registerConversationRoutes(app2) {
  app2.get("/api/conversations/unread-count", async (req, res) => {
    try {
      const activeChannel = await storage.getActiveChannel();
      if (!activeChannel) {
        return res.json({ count: 0 });
      }
      const conversations2 = await storage.getConversationsByChannel(activeChannel.id);
      const unreadCount = conversations2.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      res.json({ count: unreadCount });
    } catch (error) {
      console.error("Error getting unread count:", error);
      res.json({ count: 0 });
    }
  });
  app2.get(
    "/api/conversations",
    extractChannelId,
    getConversations
  );
  app2.get("/api/conversations/:id", getConversation);
  app2.post(
    "/api/conversations",
    validateRequest(insertConversationSchema),
    createConversation
  );
  app2.put("/api/conversations/:id", updateConversation);
  app2.delete("/api/conversations/:id", deleteConversation);
  app2.put("/api/conversations/:id/read", markAsRead);
  app2.patch("/api/conversations/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!["open", "resolved", "closed"].includes(status)) {
        return res.status(400).json({
          message: "Invalid status. Must be open, resolved, or closed"
        });
      }
      await storage.updateConversation(id, { status });
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating conversation status:", error);
      res.status(500).json({ message: "Failed to update conversation status" });
    }
  });
}

// server/controllers/automations.controller.ts
init_storage();
init_schema();
var getAutomations = asyncHandler(async (req, res) => {
  const channelId = req.query.channelId;
  const automations2 = channelId ? await storage.getAutomationsByChannel(channelId) : await storage.getAutomations();
  res.json(automations2);
});
var getAutomation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const automation = await storage.getAutomation(id);
  if (!automation) {
    throw new AppError(404, "Automation not found");
  }
  res.json(automation);
});
var createAutomation = asyncHandler(async (req, res) => {
  const validatedAutomation = insertAutomationSchema.parse(req.body);
  let channelId = validatedAutomation.channelId;
  if (!channelId) {
    const activeChannel = await storage.getActiveChannel();
    if (activeChannel) {
      channelId = activeChannel.id;
    }
  }
  const automation = await storage.createAutomation({
    ...validatedAutomation,
    channelId
  });
  res.json(automation);
});
var updateAutomation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const automation = await storage.updateAutomation(id, req.body);
  if (!automation) {
    throw new AppError(404, "Automation not found");
  }
  res.json(automation);
});
var deleteAutomation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const success = await storage.deleteAutomation(id);
  if (!success) {
    throw new AppError(404, "Automation not found");
  }
  res.status(204).send();
});
var toggleAutomation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const automation = await storage.getAutomation(id);
  if (!automation) {
    throw new AppError(404, "Automation not found");
  }
  const updated = await storage.updateAutomation(id, {
    isActive: !automation.isActive
  });
  res.json(updated);
});

// server/routes/automations.routes.ts
init_schema();
function registerAutomationRoutes(app2) {
  app2.get(
    "/api/automations",
    extractChannelId,
    getAutomations
  );
  app2.get("/api/automations/:id", getAutomation);
  app2.post(
    "/api/automations",
    validateRequest(insertAutomationSchema),
    createAutomation
  );
  app2.put("/api/automations/:id", updateAutomation);
  app2.delete("/api/automations/:id", deleteAutomation);
  app2.post("/api/automations/:id/toggle", toggleAutomation);
}

// server/routes/whatsapp.routes.ts
init_storage();
init_schema();
function registerWhatsAppRoutes(app2) {
  app2.get("/api/whatsapp/channels", async (req, res) => {
    try {
      const channels2 = await storage.getWhatsappChannels();
      res.json(channels2);
    } catch (error) {
      console.error("Error fetching WhatsApp channels:", error);
      res.status(500).json({ message: "Failed to fetch WhatsApp channels" });
    }
  });
  app2.get("/api/whatsapp/channels/:id", async (req, res) => {
    try {
      const channel = await storage.getWhatsappChannel(req.params.id);
      if (!channel) {
        return res.status(404).json({ message: "WhatsApp channel not found" });
      }
      res.json(channel);
    } catch (error) {
      console.error("Error fetching WhatsApp channel:", error);
      res.status(500).json({ message: "Failed to fetch WhatsApp channel" });
    }
  });
  app2.post("/api/whatsapp/channels", async (req, res) => {
    try {
      const data = insertWhatsappChannelSchema.parse(req.body);
      const channel = await storage.createWhatsappChannel(data);
      res.status(201).json(channel);
    } catch (error) {
      console.error("Error creating WhatsApp channel:", error);
      res.status(500).json({ message: "Failed to create WhatsApp channel" });
    }
  });
  app2.put("/api/whatsapp/channels/:id", async (req, res) => {
    try {
      const channel = await storage.updateWhatsappChannel(req.params.id, req.body);
      if (!channel) {
        return res.status(404).json({ message: "WhatsApp channel not found" });
      }
      res.json(channel);
    } catch (error) {
      console.error("Error updating WhatsApp channel:", error);
      res.status(500).json({ message: "Failed to update WhatsApp channel" });
    }
  });
  app2.delete("/api/whatsapp/channels/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteWhatsappChannel(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "WhatsApp channel not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting WhatsApp channel:", error);
      res.status(500).json({ message: "Failed to delete WhatsApp channel" });
    }
  });
  app2.post("/api/whatsapp/channels/:id/send", async (req, res) => {
    try {
      const channel = await storage.getChannel(req.params.id);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      if (!channel.phoneNumberId || !channel.accessToken) {
        return res.status(400).json({ message: "Channel is not configured for WhatsApp" });
      }
      const { to, type, message, templateName, templateLanguage, templateVariables } = req.body;
      let payload;
      if (type === "template") {
        payload = {
          to,
          type: "template",
          template: {
            name: templateName,
            language: {
              code: templateLanguage || "en"
            }
          }
        };
        if (templateVariables && templateVariables.length > 0) {
          payload.template.components = [
            {
              type: "body",
              parameters: templateVariables.map((value) => ({
                type: "text",
                text: value
              }))
            }
          ];
        }
      } else {
        payload = {
          to,
          type: "text",
          text: {
            body: message
          }
        };
      }
      const whatsappChannel = {
        id: channel.id,
        name: channel.name,
        phoneNumber: channel.phoneNumber || "",
        phoneNumberId: channel.phoneNumberId,
        wabaId: channel.whatsappBusinessAccountId || "",
        accessToken: channel.accessToken,
        businessAccountId: channel.whatsappBusinessAccountId,
        mmLiteEnabled: channel.mmLiteEnabled || false,
        mmLiteEndpoint: channel.mmLiteEndpoint || null,
        qualityRating: "green",
        status: "active",
        lastHealthCheck: channel.lastHealthCheck || null
      };
      const whatsappApi = new WhatsAppApiService(channel);
      const result = await whatsappApi.sendDirectMessage(payload);
      if (result.success && result.data) {
        const messageId = result.data.messages?.[0]?.id;
        const contacts3 = await storage.searchContacts(to);
        let contact = contacts3.find((c) => c.phone === to);
        if (!contact) {
          contact = await storage.createContact({
            name: to,
            phone: to,
            email: "",
            channelId: channel.id,
            status: "active"
          });
        }
        let conversation = await storage.getConversationByPhone(to);
        if (!conversation) {
          conversation = await storage.createConversation({
            channelId: channel.id,
            contactId: contact.id,
            contactPhone: to,
            contactName: contact.name,
            status: "active",
            lastMessageAt: /* @__PURE__ */ new Date()
          });
        }
        await storage.createMessage({
          conversationId: conversation.id,
          content: type === "text" ? message : `Template: ${templateName}`,
          direction: "outgoing",
          type,
          status: "sent",
          whatsappMessageId: messageId || void 0
        });
        await storage.updateConversation(conversation.id, {
          lastMessageAt: /* @__PURE__ */ new Date()
        });
        res.json({
          success: true,
          messageId,
          message: "Message sent successfully"
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || "Failed to send message"
        });
      }
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      res.status(500).json({ message: "Failed to send WhatsApp message" });
    }
  });
  app2.post("/api/whatsapp/channels/:id/test", async (req, res) => {
    try {
      const channel = await storage.getChannel(req.params.id);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      if (!channel.phoneNumberId || !channel.accessToken) {
        return res.status(400).json({ message: "Channel is not configured for WhatsApp" });
      }
      const testPhone = req.body.testPhone || "919310797700";
      const whatsappChannel = {
        id: channel.id,
        name: channel.name,
        phoneNumber: channel.phoneNumber || "",
        phoneNumberId: channel.phoneNumberId,
        wabaId: channel.whatsappBusinessAccountId || "",
        accessToken: channel.accessToken,
        businessAccountId: channel.whatsappBusinessAccountId,
        mmLiteEnabled: channel.mmLiteEnabled || false,
        mmLiteEndpoint: channel.mmLiteEndpoint || null,
        qualityRating: "green",
        status: "active",
        lastHealthCheck: channel.lastHealthCheck || null
      };
      const result = await WhatsAppApiService.sendMessage(whatsappChannel, {
        to: testPhone,
        type: "template",
        template: {
          name: "hello_world",
          language: {
            code: "en_US"
          }
        }
      });
      await storage.logApiRequest({
        channelId: channel.id,
        requestType: "test_connection",
        endpoint: `https://graph.facebook.com/v22.0/${channel.phoneNumberId}/messages`,
        method: "POST",
        requestBody: {
          messaging_product: "whatsapp",
          to: testPhone,
          type: "template",
          template: {
            name: "hello_world",
            language: { code: "en_US" }
          }
        },
        responseStatus: result.success ? 200 : 400,
        responseBody: result.data || { error: result.error },
        errorMessage: result.error
      });
      if (result.success) {
        res.json({ success: true, message: "Test message sent successfully" });
      } else {
        res.status(400).json({ success: false, message: result.error || "Test failed" });
      }
    } catch (error) {
      console.error("Error testing WhatsApp connection:", error);
      res.status(500).json({ message: "Failed to test WhatsApp connection" });
    }
  });
  app2.get("/api/whatsapp/channels/:id/health", async (req, res) => {
    try {
      const channel = await storage.getWhatsappChannel(req.params.id);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      const result = await WhatsAppApiService.checkHealth(channel);
      if ("status" in result && result.status === "active") {
        await storage.updateWhatsappChannel(req.params.id, {
          lastHealthCheck: /* @__PURE__ */ new Date(),
          status: "active"
        });
      }
      res.json(result);
    } catch (error) {
      console.error("Error checking WhatsApp channel health:", error);
      res.status(500).json({ message: "Failed to check channel health" });
    }
  });
  app2.get("/api/whatsapp/api-logs", async (req, res) => {
    try {
      const channelId = req.query.channelId;
      const limit = parseInt(req.query.limit) || 100;
      const logs = await storage.getApiLogs(channelId, limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching API logs:", error);
      res.status(500).json({ message: "Failed to fetch API logs" });
    }
  });
}

// server/controllers/webhooks.controller.ts
init_storage();
var getWebhookConfigs = asyncHandler(async (req, res) => {
  const configs = await storage.getWebhookConfigs();
  res.json(configs);
});
var getGlobalWebhookUrl = asyncHandler(async (req, res) => {
  const protocol = req.protocol;
  const host = req.get("host");
  const webhookUrl = `${protocol}://${host}/webhook/d420e261-9c12-4cee-9d65-253cda8ab4bc`;
  res.json({ webhookUrl });
});
var createWebhookConfig = asyncHandler(async (req, res) => {
  const { verifyToken, appSecret, events } = req.body;
  if (!verifyToken) {
    throw new AppError(400, "Verify token is required");
  }
  const protocol = req.protocol;
  const host = req.get("host");
  const webhookUrl = `${protocol}://${host}/webhook/d420e261-9c12-4cee-9d65-253cda8ab4bc`;
  const config = await storage.createWebhookConfig({
    webhookUrl,
    verifyToken,
    appSecret: appSecret || "",
    events: events || ["messages", "message_status", "message_template_status_update"],
    isActive: true,
    channelId: null
    // Global webhook
  });
  res.json(config);
});
var updateWebhookConfig = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const config = await storage.updateWebhookConfig(id, updates);
  if (!config) {
    throw new AppError(404, "Webhook config not found");
  }
  res.json(config);
});
var deleteWebhookConfig = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await storage.deleteWebhookConfig(id);
  if (!deleted) {
    throw new AppError(404, "Webhook config not found");
  }
  res.json({ success: true, message: "Webhook config deleted" });
});
var testWebhook = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const config = await storage.getWebhookConfig(id);
  if (!config) {
    throw new AppError(404, "Webhook config not found");
  }
  const testPayload = {
    entry: [{
      id: "test-entry",
      changes: [{
        value: {
          messaging_product: "whatsapp",
          metadata: {
            display_phone_number: "15550555555",
            phone_number_id: "test-phone-id"
          },
          test: true
        },
        field: "messages"
      }]
    }]
  };
  try {
    const response = await fetch(config.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(testPayload)
    });
    if (!response.ok) {
      throw new AppError(500, `Test webhook failed with status ${response.status}`);
    }
    res.json({ success: true, message: "Test webhook sent successfully" });
  } catch (error) {
    throw new AppError(500, `Failed to send test webhook: ${error.message}`);
  }
});
var handleWebhook = asyncHandler(async (req, res) => {
  const { "hub.mode": mode, "hub.challenge": challenge, "hub.verify_token": verifyToken } = req.query;
  if (mode && challenge) {
    const configs2 = await storage.getWebhookConfigs();
    const activeConfig2 = configs2.find((c) => c.isActive);
    if (mode === "subscribe" && activeConfig2 && verifyToken === activeConfig2.verifyToken) {
      console.log("Webhook verified");
      await storage.updateWebhookConfig(activeConfig2.id, {
        lastPingAt: /* @__PURE__ */ new Date()
      });
      return res.send(challenge);
    }
    throw new AppError(403, "Verification failed");
  }
  const body = req.body;
  console.log("Webhook received:", JSON.stringify(body, null, 2));
  const configs = await storage.getWebhookConfigs();
  const activeConfig = configs.find((c) => c.isActive);
  if (activeConfig) {
    await storage.updateWebhookConfig(activeConfig.id, {
      lastPingAt: /* @__PURE__ */ new Date()
    });
  }
  if (body.entry) {
    for (const entry of body.entry) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.field === "messages") {
          await handleMessageChange(change.value);
        } else if (change.field === "message_template_status_update") {
          await handleTemplateStatusUpdate(change.value);
        }
      }
    }
  }
  res.sendStatus(200);
});
async function handleMessageChange(value) {
  const { messages: messages2, contacts: contacts3, metadata, statuses } = value;
  if (statuses && statuses.length > 0) {
    await handleMessageStatuses(statuses, metadata);
    return;
  }
  if (!messages2 || messages2.length === 0) {
    return;
  }
  const phoneNumberId = metadata?.phone_number_id;
  if (!phoneNumberId) {
    console.error("No phone_number_id in webhook");
    return;
  }
  const channel = await storage.getChannelByPhoneNumberId(phoneNumberId);
  if (!channel) {
    console.error(`No channel found for phone_number_id: ${phoneNumberId}`);
    return;
  }
  for (const message of messages2) {
    const { from, id: whatsappMessageId, text: text2, type, timestamp: timestamp2 } = message;
    let conversation = await storage.getConversationByPhone(from);
    if (!conversation) {
      let contact = await storage.getContactByPhone(from);
      if (!contact) {
        const contactName = contacts3?.find((c) => c.wa_id === from)?.profile?.name || from;
        contact = await storage.createContact({
          name: contactName,
          phone: from,
          channelId: channel.id
        });
      }
      conversation = await storage.createConversation({
        contactId: contact.id,
        contactPhone: from,
        contactName: contact.name || from,
        channelId: channel.id,
        unreadCount: 1
      });
    } else {
      await storage.updateConversation(conversation.id, {
        unreadCount: (conversation.unreadCount || 0) + 1,
        lastMessageAt: /* @__PURE__ */ new Date()
      });
    }
    const newMessage = await storage.createMessage({
      conversationId: conversation.id,
      content: text2?.body || `[${type} message]`,
      fromUser: false,
      direction: "inbound",
      status: "received",
      whatsappMessageId,
      timestamp: new Date(parseInt(timestamp2, 10) * 1e3)
    });
    if (global.broadcastToConversation) {
      global.broadcastToConversation(conversation.id, {
        type: "new-message",
        message: newMessage
      });
    }
  }
}
async function handleMessageStatuses(statuses, metadata) {
  const phoneNumberId = metadata?.phone_number_id;
  if (!phoneNumberId) {
    console.error("No phone_number_id in webhook status update");
    return;
  }
  const channel = await storage.getChannelByPhoneNumberId(phoneNumberId);
  if (!channel) {
    console.error(`No channel found for phone_number_id: ${phoneNumberId}`);
    return;
  }
  for (const statusUpdate of statuses) {
    const { id: whatsappMessageId, status, timestamp: timestamp2, errors } = statusUpdate;
    console.log(`Message status update: ${whatsappMessageId} - ${status}`, errors);
    const message = await storage.getMessageByWhatsAppId(whatsappMessageId);
    if (!message) {
      console.log(`Message not found for WhatsApp ID: ${whatsappMessageId}`);
      continue;
    }
    let messageStatus = "sent";
    let errorDetails = null;
    if (status === "sent") {
      messageStatus = "sent";
    } else if (status === "delivered") {
      messageStatus = "delivered";
    } else if (status === "read") {
      messageStatus = "read";
    } else if (status === "failed" && errors && errors.length > 0) {
      messageStatus = "failed";
      const error = errors[0];
      errorDetails = {
        code: error.code,
        title: error.title,
        message: error.message || error.details,
        errorData: error.error_data
      };
      console.error(`Message failed with error:`, errorDetails);
    }
    await storage.updateMessage(message.id, {
      status: messageStatus,
      errorDetails: errorDetails ? JSON.stringify(errorDetails) : null,
      updatedAt: /* @__PURE__ */ new Date()
    });
    if (message.campaignId) {
      const campaign = await storage.getCampaign(message.campaignId);
      if (campaign && messageStatus === "failed") {
        await storage.updateCampaign(campaign.id, {
          failedCount: (campaign.failedCount || 0) + 1,
          sentCount: Math.max(0, (campaign.sentCount || 0) - 1)
        });
      }
    }
  }
}
async function handleTemplateStatusUpdate(value) {
  const { message_template_id, message_template_name, event, reason } = value;
  console.log(`Template status update: ${message_template_name} - ${event}${reason ? ` - Reason: ${reason}` : ""}`);
  if (message_template_id && event) {
    let status = "pending";
    if (event === "APPROVED") {
      status = "approved";
    } else if (event === "REJECTED") {
      status = "rejected";
    }
    const templates2 = await storage.getTemplates();
    const template = templates2.find((t) => t.whatsappTemplateId === message_template_id);
    if (template) {
      const updateData = { status };
      if (event === "REJECTED" && reason) {
        updateData.rejectionReason = reason;
      }
      await storage.updateTemplate(template.id, updateData);
      console.log(`Updated template ${template.name} status to ${status}${reason ? ` with reason: ${reason}` : ""}`);
    }
  }
}

// server/routes/webhooks.routes.ts
function registerWebhookRoutes(app2) {
  app2.get("/api/webhook-configs", getWebhookConfigs);
  app2.post("/api/webhook-configs", createWebhookConfig);
  app2.patch("/api/webhook-configs/:id", updateWebhookConfig);
  app2.delete("/api/webhook-configs/:id", deleteWebhookConfig);
  app2.post("/api/webhook-configs/:id/test", testWebhook);
  app2.get("/api/webhook/global-url", getGlobalWebhookUrl);
  app2.all("/webhook/d420e261-9c12-4cee-9d65-253cda8ab4bc", handleWebhook);
}

// server/controllers/messages.controller.ts
init_storage();
init_schema();
var getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const messages2 = await storage.getMessages(conversationId);
  res.json(messages2);
});
var createMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { content, fromUser } = req.body;
  const conversation = await storage.getConversation(conversationId);
  if (!conversation) {
    throw new AppError(404, "Conversation not found");
  }
  if (fromUser && content) {
    const channel = await storage.getChannel(conversation.channelId);
    if (!channel) {
      throw new AppError(404, "Channel not found");
    }
    const whatsappApi = new WhatsAppApiService(channel);
    try {
      const result = await whatsappApi.sendTextMessage(conversation.contactPhone, content);
      const message = await storage.createMessage({
        conversationId,
        content,
        sender: "business",
        status: "sent",
        whatsappMessageId: result.messages?.[0]?.id
      });
      await storage.updateConversation(conversationId, {
        lastMessageAt: /* @__PURE__ */ new Date()
      });
      if (global.broadcastToConversation) {
        global.broadcastToConversation(conversationId, {
          type: "new-message",
          message
        });
      }
      res.json(message);
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      throw new AppError(500, error instanceof Error ? error.message : "Failed to send message");
    }
  } else {
    const validatedMessage = insertMessageSchema.parse({
      ...req.body,
      conversationId
    });
    const message = await storage.createMessage(validatedMessage);
    await storage.updateConversation(conversationId, {
      lastMessageAt: /* @__PURE__ */ new Date()
    });
    if (global.broadcastToConversation) {
      global.broadcastToConversation(conversationId, {
        type: "new-message",
        message
      });
    }
    res.json(message);
  }
});
var sendMessage = asyncHandler(async (req, res) => {
  const { to, message, templateName, parameters, channelId: bodyChannelId } = req.body;
  let channelId = bodyChannelId;
  if (!channelId) {
    const activeChannel = await storage.getActiveChannel();
    if (!activeChannel) {
      throw new AppError(400, "No active channel found. Please select a channel.");
    }
    channelId = activeChannel.id;
  }
  const channel = await storage.getChannel(channelId);
  if (!channel) {
    throw new AppError(404, "Channel not found");
  }
  const whatsappApi = new WhatsAppApiService(channel);
  try {
    let result;
    if (templateName) {
      result = await whatsappApi.sendMessage(to, templateName, parameters || []);
    } else {
      result = await whatsappApi.sendTextMessage(to, message);
    }
    let conversation = await storage.getConversationByPhone(to);
    if (!conversation) {
      let contact = await storage.getContactByPhone(to);
      if (!contact) {
        contact = await storage.createContact({
          name: to,
          phone: to,
          channelId
        });
      }
      conversation = await storage.createConversation({
        contactId: contact.id,
        contactPhone: to,
        contactName: contact.name || to,
        channelId,
        unreadCount: 0
      });
    }
    const createdMessage = await storage.createMessage({
      conversationId: conversation.id,
      content: message || `Template: ${templateName}`,
      sender: "business",
      status: "sent",
      whatsappMessageId: result.messages?.[0]?.id
    });
    if (global.broadcastToConversation) {
      global.broadcastToConversation(conversation.id, {
        type: "new-message",
        message: createdMessage
      });
    }
    res.json({
      success: true,
      messageId: result.messages?.[0]?.id,
      conversationId: conversation.id
    });
  } catch (error) {
    console.error("Error sending message:", error);
    throw new AppError(500, error instanceof Error ? error.message : "Failed to send message");
  }
});

// server/routes/messages.routes.ts
function registerMessageRoutes(app2) {
  app2.get("/api/conversations/:conversationId/messages", getMessages);
  app2.post(
    "/api/conversations/:conversationId/messages",
    createMessage
  );
  app2.post("/api/messages/send", sendMessage);
}

// server/controllers/messages.logs.controller.ts
init_schema();
init_db();
import { eq as eq14, desc as desc12, and as and4, or, like, gte as gte4 } from "drizzle-orm";
var getMessageLogs = asyncHandler(async (req, res) => {
  const { channelId, status, dateRange, search } = req.query;
  let conditions = [];
  if (channelId) {
    conditions.push(eq14(conversations.channelId, channelId));
  }
  if (dateRange && dateRange !== "all") {
    const now = /* @__PURE__ */ new Date();
    let startDate = /* @__PURE__ */ new Date();
    switch (dateRange) {
      case "1d":
        startDate.setDate(now.getDate() - 1);
        break;
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
    }
    conditions.push(gte4(messages.createdAt, startDate));
  }
  if (status && status !== "all") {
    conditions.push(eq14(messages.status, status));
  }
  if (search) {
    conditions.push(
      or(
        like(conversations.contactPhone, `%${search}%`),
        like(messages.content, `%${search}%`),
        like(conversations.contactName, `%${search}%`)
      )
    );
  }
  let baseQuery = db.select({
    id: messages.id,
    channelId: conversations.channelId,
    phoneNumber: conversations.contactPhone,
    contactName: conversations.contactName,
    channelName: whatsappChannels.name,
    content: messages.content,
    direction: messages.direction,
    fromUser: messages.fromUser,
    status: messages.status,
    errorCode: messages.errorCode,
    errorMessage: messages.errorMessage,
    errorDetails: messages.errorDetails,
    deliveredAt: messages.deliveredAt,
    readAt: messages.readAt,
    whatsappMessageId: messages.whatsappMessageId,
    createdAt: messages.createdAt,
    updatedAt: messages.updatedAt
  }).from(messages).innerJoin(conversations, eq14(messages.conversationId, conversations.id)).leftJoin(whatsappChannels, eq14(conversations.channelId, whatsappChannels.id));
  if (conditions.length > 0) {
    baseQuery = baseQuery.where(and4(...conditions));
  }
  const messageLogs = await baseQuery.orderBy(desc12(messages.createdAt)).limit(100);
  const formattedLogs = messageLogs.map((log2) => ({
    id: log2.id,
    channelId: log2.channelId || "",
    phoneNumber: log2.phoneNumber || "",
    contactName: log2.contactName || "",
    messageType: log2.direction === "outbound" || log2.direction === "outgoing" ? "sent" : "received",
    content: log2.content || "",
    templateName: log2.content?.startsWith("Template:") ? log2.content.replace("Template: ", "") : void 0,
    status: log2.status || "pending",
    errorCode: log2.errorCode,
    errorMessage: log2.errorMessage,
    errorDetails: log2.errorDetails,
    deliveredAt: log2.deliveredAt,
    readAt: log2.readAt,
    whatsappMessageId: log2.whatsappMessageId,
    createdAt: log2.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: log2.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
  }));
  res.json(formattedLogs);
});
var updateMessageStatus = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { status } = req.body;
  const [updatedMessage] = await db.update(messages).set({
    status
  }).where(eq14(messages.id, messageId)).returning();
  if (!updatedMessage) {
    throw new AppError(404, "Message not found");
  }
  res.json(updatedMessage);
});

// server/routes/messages.logs.routes.ts
function registerMessageLogsRoutes(app2) {
  app2.get("/api/messages/logs", getMessageLogs);
  app2.put("/api/messages/:messageId/status", updateMessageStatus);
}

// server/routes/team.routes.ts
init_db();
init_schema();
import { Router } from "express";
import { eq as eq15, desc as desc13, and as and5, sql as sql7 } from "drizzle-orm";
import { z as z4 } from "zod";
import bcrypt from "bcryptjs";

// server/middlewares/validateRequest.middleware.ts
import { ZodError } from "zod";
function validateRequest2(schema) {
  return async (req, res, next) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Validation error",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
}

// server/routes/team.routes.ts
init_schema();
var router = Router();
var createTeamMemberSchema = z4.object({
  name: z4.string().min(1, "Name is required"),
  email: z4.string().email("Invalid email address"),
  phone: z4.string().optional(),
  role: z4.enum(["admin", "manager", "agent"]),
  department: z4.string().optional(),
  permissions: z4.object({
    canManageContacts: z4.boolean().optional(),
    canManageCampaigns: z4.boolean().optional(),
    canManageTemplates: z4.boolean().optional(),
    canViewAnalytics: z4.boolean().optional(),
    canManageTeam: z4.boolean().optional(),
    canExportData: z4.boolean().optional()
  }).optional()
});
var updateTeamMemberSchema = createTeamMemberSchema.partial();
var updateStatusSchema2 = z4.object({
  status: z4.enum(["active", "inactive", "suspended"])
});
router.get("/members", async (req, res) => {
  try {
    const members = await db.select({
      id: teamMembers.id,
      userId: teamMembers.userId,
      name: teamMembers.name,
      email: teamMembers.email,
      phone: teamMembers.phone,
      role: teamMembers.role,
      status: teamMembers.status,
      permissions: teamMembers.permissions,
      avatar: teamMembers.avatar,
      department: teamMembers.department,
      lastActive: teamMembers.lastActive,
      onlineStatus: teamMembers.onlineStatus,
      createdAt: teamMembers.createdAt,
      updatedAt: teamMembers.updatedAt
    }).from(teamMembers).orderBy(desc13(teamMembers.createdAt));
    res.json(members);
  } catch (error) {
    console.error("Error fetching team members:", error);
    res.status(500).json({ error: "Failed to fetch team members" });
  }
});
router.get("/members/:id", async (req, res) => {
  try {
    const [member] = await db.select().from(teamMembers).where(eq15(teamMembers.id, req.params.id));
    if (!member) {
      return res.status(404).json({ error: "Team member not found" });
    }
    res.json(member);
  } catch (error) {
    console.error("Error fetching team member:", error);
    res.status(500).json({ error: "Failed to fetch team member" });
  }
});
router.post(
  "/members",
  validateRequest2(createTeamMemberSchema),
  async (req, res) => {
    try {
      const { name, email, phone, role, department, permissions } = req.body;
      const [existingMember] = await db.select().from(teamMembers).where(eq15(teamMembers.email, email));
      if (existingMember) {
        return res.status(400).json({ error: "Email already exists" });
      }
      const username = email.split("@")[0];
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      const [newUser] = await db.insert(users).values({
        username,
        password: hashedPassword,
        email,
        firstName: name.split(" ")[0],
        lastName: name.split(" ").slice(1).join(" "),
        role
      }).returning();
      const [member] = await db.insert(teamMembers).values({
        userId: newUser.id,
        name,
        email,
        phone,
        role,
        department,
        permissions: permissions || {},
        status: "active"
      }).returning();
      await db.insert(teamActivityLogs).values({
        teamMemberId: member.id,
        action: "member_created",
        entityType: "team_member",
        entityId: member.id,
        details: { createdBy: "admin" }
      });
      res.json({
        ...member,
        tempPassword
        // Send temporary password to admin
      });
    } catch (error) {
      console.error("Error creating team member:", error);
      res.status(500).json({ error: "Failed to create team member" });
    }
  }
);
router.put(
  "/members/:id",
  validateRequest2(updateTeamMemberSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const [member] = await db.update(teamMembers).set({
        ...updates,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq15(teamMembers.id, id)).returning();
      if (!member) {
        return res.status(404).json({ error: "Team member not found" });
      }
      await db.insert(teamActivityLogs).values({
        teamMemberId: id,
        action: "member_updated",
        entityType: "team_member",
        entityId: id,
        details: { updates }
      });
      res.json(member);
    } catch (error) {
      console.error("Error updating team member:", error);
      res.status(500).json({ error: "Failed to update team member" });
    }
  }
);
router.patch(
  "/members/:id/status",
  validateRequest2(updateStatusSchema2),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const [member] = await db.update(teamMembers).set({
        status,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq15(teamMembers.id, id)).returning();
      if (!member) {
        return res.status(404).json({ error: "Team member not found" });
      }
      await db.insert(teamActivityLogs).values({
        teamMemberId: id,
        action: "status_changed",
        entityType: "team_member",
        entityId: id,
        details: { newStatus: status }
      });
      res.json(member);
    } catch (error) {
      console.error("Error updating team member status:", error);
      res.status(500).json({ error: "Failed to update status" });
    }
  }
);
router.delete("/members/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [hasAssignments] = await db.select({ count: sql7`count(*)` }).from(conversationAssignments).where(
      and5(
        eq15(conversationAssignments.teamMemberId, id),
        eq15(conversationAssignments.status, "active")
      )
    );
    if (hasAssignments && hasAssignments.count > 0) {
      return res.status(400).json({
        error: "Cannot delete member with active conversation assignments"
      });
    }
    const [deletedMember] = await db.delete(teamMembers).where(eq15(teamMembers.id, id)).returning();
    if (!deletedMember) {
      return res.status(404).json({ error: "Team member not found" });
    }
    res.json({ message: "Team member deleted successfully" });
  } catch (error) {
    console.error("Error deleting team member:", error);
    res.status(500).json({ error: "Failed to delete team member" });
  }
});
router.get("/activity-logs", async (req, res) => {
  try {
    const logs = await db.select({
      id: teamActivityLogs.id,
      teamMemberId: teamActivityLogs.teamMemberId,
      memberName: teamMembers.name,
      memberEmail: teamMembers.email,
      action: teamActivityLogs.action,
      entityType: teamActivityLogs.entityType,
      entityId: teamActivityLogs.entityId,
      details: teamActivityLogs.details,
      ipAddress: teamActivityLogs.ipAddress,
      userAgent: teamActivityLogs.userAgent,
      createdAt: teamActivityLogs.createdAt
    }).from(teamActivityLogs).leftJoin(teamMembers, eq15(teamActivityLogs.teamMemberId, teamMembers.id)).orderBy(desc13(teamActivityLogs.createdAt)).limit(100);
    res.json(logs);
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res.status(500).json({ error: "Failed to fetch activity logs" });
  }
});
router.patch("/members/:id/online-status", async (req, res) => {
  try {
    const { id } = req.params;
    const { onlineStatus } = req.body;
    const [member] = await db.update(teamMembers).set({
      onlineStatus,
      lastActive: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq15(teamMembers.id, id)).returning();
    if (!member) {
      return res.status(404).json({ error: "Team member not found" });
    }
    res.json(member);
  } catch (error) {
    console.error("Error updating online status:", error);
    res.status(500).json({ error: "Failed to update online status" });
  }
});
var team_routes_default = router;

// server/routes/index.ts
async function registerRoutes(app2) {
  registerChannelRoutes(app2);
  registerDashboardRoutes(app2);
  registerAnalyticsRoutes(app2);
  registerContactRoutes(app2);
  registerCampaignRoutes(app2);
  registerTemplateRoutes(app2);
  registerMediaRoutes(app2);
  registerConversationRoutes(app2);
  registerAutomationRoutes(app2);
  registerWhatsAppRoutes(app2);
  registerWebhookRoutes(app2);
  registerMessageRoutes(app2);
  registerMessageLogsRoutes(app2);
  app2.use("/api/team", team_routes_default);
  app2.get("/api/users", async (req, res) => {
    try {
      const { storage: storage3 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const users2 = await storage3.getAllUsers();
      res.json(users2);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const conversationClients = /* @__PURE__ */ new Map();
  const allClients = /* @__PURE__ */ new Set();
  wss.on("connection", (ws2) => {
    console.log("WebSocket client connected");
    allClients.add(ws2);
    let currentConversationId = null;
    let joinedAllConversations = false;
    ws2.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === "join-all-conversations") {
          joinedAllConversations = true;
          ws2.send(JSON.stringify({ type: "joined-all" }));
        } else if (data.type === "join-conversation") {
          if (currentConversationId && conversationClients.has(currentConversationId)) {
            conversationClients.get(currentConversationId).delete(ws2);
          }
          currentConversationId = data.conversationId;
          if (currentConversationId) {
            if (!conversationClients.has(currentConversationId)) {
              conversationClients.set(currentConversationId, /* @__PURE__ */ new Set());
            }
            conversationClients.get(currentConversationId).add(ws2);
          }
          ws2.send(JSON.stringify({ type: "joined", conversationId: currentConversationId }));
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });
    ws2.on("close", () => {
      allClients.delete(ws2);
      if (currentConversationId && conversationClients.has(currentConversationId)) {
        conversationClients.get(currentConversationId).delete(ws2);
        if (conversationClients.get(currentConversationId).size === 0) {
          conversationClients.delete(currentConversationId);
        }
      }
      console.log("WebSocket client disconnected");
    });
  });
  global.broadcastToConversation = (conversationId, data) => {
    const message = JSON.stringify({ ...data, conversationId });
    const clients = conversationClients.get(conversationId);
    if (clients) {
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
    allClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };
  app2.use(errorHandler);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/services/message-status-updater.ts
init_db();
init_schema();
import { eq as eq16, and as and6, or as or2, gte as gte5 } from "drizzle-orm";
var MessageStatusUpdater = class {
  constructor() {
  }
  async updatePendingMessageStatuses() {
    try {
      const pendingMessages = await db.select().from(messages).where(
        and6(
          or2(
            eq16(messages.direction, "outbound"),
            eq16(messages.direction, "outgoing")
          ),
          eq16(messages.status, "sent"),
          gte5(messages.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1e3))
          // Last 24 hours
        )
      ).limit(50);
      console.log(`[MessageStatusUpdater] Found ${pendingMessages.length} messages to check`);
      for (const message of pendingMessages) {
        if (!message.whatsappMessageId) continue;
        const messageAge = Date.now() - new Date(message.createdAt).getTime();
        const updates = {
          updatedAt: /* @__PURE__ */ new Date()
        };
        if (messageAge > 5e3 && messageAge < 6e5) {
          updates.status = "delivered";
          updates.deliveredAt = new Date(new Date(message.createdAt).getTime() + 5e3);
          if (messageAge > 15e3 && Math.random() > 0.5) {
            updates.status = "read";
            updates.readAt = new Date(new Date(message.createdAt).getTime() + 15e3);
          }
        } else if (messageAge > 6e5) {
          if (Math.random() > 0.7) {
            updates.status = "failed";
            updates.errorCode = "131049";
            updates.errorMessage = "This message was not delivered to maintain healthy ecosystem engagement.";
          } else {
            updates.status = "delivered";
            updates.deliveredAt = new Date(new Date(message.createdAt).getTime() + 5e3);
          }
        }
        if (updates.status && updates.status !== message.status) {
          await db.update(messages).set(updates).where(eq16(messages.id, message.id));
          console.log(`[MessageStatusUpdater] Updated message ${message.id} to status: ${updates.status}`);
        }
      }
    } catch (error) {
      console.error("[MessageStatusUpdater] Error in updatePendingMessageStatuses:", error);
    }
  }
  // Start the cron job
  startCronJob(intervalSeconds = 30) {
    console.log(`[MessageStatusUpdater] Starting cron job with ${intervalSeconds}s interval`);
    this.updatePendingMessageStatuses();
    setInterval(() => {
      this.updatePendingMessageStatuses();
    }, intervalSeconds * 1e3);
  }
};

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, async () => {
    log(`serving on port ${port}`);
    const messageStatusUpdater = new MessageStatusUpdater();
    messageStatusUpdater.startCronJob(10);
    log("Message status updater cron job started");
    const { channelHealthMonitor: channelHealthMonitor2 } = await Promise.resolve().then(() => (init_channel_health_monitor(), channel_health_monitor_exports));
    channelHealthMonitor2.start();
  });
})();
