import { db } from "../db";
import { eq, and, gte, isNull, desc, lt, sql } from "drizzle-orm";
import { 
  messageQueue, 
  type MessageQueue, 
  type InsertMessageQueue 
} from "@shared/schema";
import { startOfMonth, subMonths } from "date-fns";


export class MessageQueueRepository {
  async getByChannel(channelId: string): Promise<MessageQueue[]> {
    return await db
      .select()
      .from(messageQueue)
      .where(eq(messageQueue.channelId, channelId))
      .orderBy(desc(messageQueue.createdAt));
  }

  async getPending(): Promise<MessageQueue[]> {
    return await db
      .select()
      .from(messageQueue)
      .where(eq(messageQueue.status, 'pending'))
      .orderBy(messageQueue.createdAt);
  }

  async getMessagesToCheck(): Promise<MessageQueue[]> {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    return await db
      .select()
      .from(messageQueue)
      .where(
        and(
          eq(messageQueue.type, 'outgoing'),
          eq(messageQueue.status, 'sent'),
          lt(messageQueue.createdAt, tenMinutesAgo)
        )
      )
      .orderBy(messageQueue.createdAt);
  }

  async create(insertMessage: InsertMessageQueue): Promise<MessageQueue> {
    const [message] = await db
      .insert(messageQueue)
      .values(insertMessage)
      .returning();
    return message;
  }

  async createBulk(insertMessages: InsertMessageQueue[]): Promise<MessageQueue[]> {
    if (insertMessages.length === 0) return [];
    return await db
      .insert(messageQueue)
      .values(insertMessages)
      .returning();
  }

  async update(id: string, message: Partial<MessageQueue>): Promise<MessageQueue | undefined> {
    const [updated] = await db
      .update(messageQueue)
      .set(message)
      .where(eq(messageQueue.id, id))
      .returning();
    return updated || undefined;
  }

  async updateByWhatsAppId(whatsappMessageId: string, updates: Partial<MessageQueue>): Promise<boolean> {
    const result = await db
      .update(messageQueue)
      .set(updates)
      .where(eq(messageQueue.whatsappMessageId, whatsappMessageId))
      .returning();
    return result.length > 0;
  }

  async getByCampaign(campaignId: string): Promise<MessageQueue[]> {
    return await db
      .select()
      .from(messageQueue)
      .where(eq(messageQueue.campaignId, campaignId))
      .orderBy(desc(messageQueue.createdAt));
  }

  async getForRetry(limit: number = 100): Promise<MessageQueue[]> {
    return await db
      .select()
      .from(messageQueue)
      .where(
        and(
          eq(messageQueue.status, 'failed'),
          lt(messageQueue.retryCount, 3),
          isNull(messageQueue.errorDetails)
        )
      )
      .limit(limit)
      .orderBy(messageQueue.createdAt);
  }

  async getMessageStats(): Promise<any> {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = thisMonthStart;
  
    const result = await db
      .select({
        // Status-wise counts
        messagesSent: sql<number>`COUNT(CASE WHEN ${messageQueue.status} = 'sent' THEN 1 END)`.mapWith(Number),
        messagesDelivered: sql<number>`COUNT(CASE WHEN ${messageQueue.status} = 'delivered' THEN 1 END)`.mapWith(Number),
        messagesFailed: sql<number>`COUNT(CASE WHEN ${messageQueue.status} = 'failed' THEN 1 END)`.mapWith(Number),
        messagesRead: sql<number>`COUNT(CASE WHEN ${messageQueue.status} = 'read' THEN 1 END)`.mapWith(Number),
  
        // Total (all messages)
        totalMessages: sql<number>`COUNT(*)`.mapWith(Number),

        todayMessages: sql<number>`
        COUNT(CASE WHEN ${messageQueue.createdAt} >= ${todayStart} THEN 1 END)
      `.mapWith(Number),
  
        // This month (all statuses)
        thisMonthMessages: sql<number>`
          COUNT(CASE WHEN ${messageQueue.createdAt} >= ${thisMonthStart} THEN 1 END)
        `.mapWith(Number),
  
        // Last month (all statuses)
        lastMonthMessages: sql<number>`
          COUNT(CASE WHEN ${messageQueue.createdAt} >= ${lastMonthStart}
                     AND ${messageQueue.createdAt} < ${lastMonthEnd}
          THEN 1 END)
        `.mapWith(Number),
      })
      .from(messageQueue);
  
    return (
      result[0] || {
        messagesSent: 0,
        messagesDelivered: 0,
        messagesFailed: 0,
        messagesRead: 0,
        totalMessages: 0,
        todayMessages: 0,
        thisMonthMessages: 0,
        lastMonthMessages: 0,
      }
    );
  }

  async getMessageStatsByChannel(channelId: string): Promise<any> {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = thisMonthStart;
  
    const result = await db
      .select({
        messagesSent: sql<number>`COUNT(CASE WHEN ${messageQueue.status} = 'sent' THEN 1 END)`.mapWith(Number),
        messagesDelivered: sql<number>`COUNT(CASE WHEN ${messageQueue.status} = 'delivered' THEN 1 END)`.mapWith(Number),
        messagesFailed: sql<number>`COUNT(CASE WHEN ${messageQueue.status} = 'failed' THEN 1 END)`.mapWith(Number),
        messagesRead: sql<number>`COUNT(CASE WHEN ${messageQueue.status} = 'read' THEN 1 END)`.mapWith(Number),
  
        totalMessages: sql<number>`COUNT(*)`.mapWith(Number),

        todayMessages: sql<number>`
        COUNT(CASE WHEN ${messageQueue.createdAt} >= ${todayStart} THEN 1 END)
      `.mapWith(Number),

        // This month
        thisMonthMessages: sql<number>`
          COUNT(CASE WHEN ${messageQueue.createdAt} >= ${thisMonthStart} THEN 1 END)
        `.mapWith(Number),
  
        // Last month
        lastMonthMessages: sql<number>`
          COUNT(CASE WHEN ${messageQueue.createdAt} >= ${lastMonthStart} 
                     AND ${messageQueue.createdAt} < ${lastMonthEnd} 
          THEN 1 END)
        `.mapWith(Number),
      })
      .from(messageQueue)
      .where(eq(messageQueue.channelId, channelId));
  
    return (
      result[0] || {
        messagesSent: 0,
        messagesDelivered: 0,
        messagesFailed: 0,
        totalMessages: 0,
        messagesRead: 0,
        thisMonthMessages: 0,
        todayMessages: 0,
        lastMonthMessages: 0,
      }
    );
  }
}