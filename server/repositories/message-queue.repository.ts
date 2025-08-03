import { db } from "../db";
import { eq, and, gte, isNull, desc, lt } from "drizzle-orm";
import { 
  messageQueue, 
  type MessageQueue, 
  type InsertMessageQueue 
} from "@shared/schema";

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
}