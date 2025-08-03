import { db } from "../db";
import { gte, desc, sql } from "drizzle-orm";
import { 
  analytics,
  messageQueue,
  type Analytics, 
  type InsertAnalytics 
} from "@shared/schema";

export class AnalyticsRepository {
  async getAnalytics(days?: number): Promise<Analytics[]> {
    const startDate = days 
      ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) 
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const result = await db
      .select({
        date: sql<Date>`DATE(${messageQueue.createdAt})`,
        sent: sql<number>`COUNT(CASE WHEN ${messageQueue.status} = 'sent' THEN 1 END)`,
        delivered: sql<number>`COUNT(CASE WHEN ${messageQueue.status} = 'delivered' THEN 1 END)`,
        read: sql<number>`COUNT(CASE WHEN ${messageQueue.status} = 'read' THEN 1 END)`,
        replied: sql<number>`COUNT(CASE WHEN ${messageQueue.status} = 'replied' THEN 1 END)`,
        failed: sql<number>`COUNT(CASE WHEN ${messageQueue.status} = 'failed' THEN 1 END)`,
      })
      .from(messageQueue)
      .where(gte(messageQueue.createdAt, startDate))
      .groupBy(sql`DATE(${messageQueue.createdAt})`)
      .orderBy(sql`DATE(${messageQueue.createdAt})`);

    // Convert to Analytics format
    return result.map(row => ({
      id: `analytics-${row.date.toISOString()}`,
      channelId: '',
      date: row.date,
      messagesTotal: Number(row.sent) + Number(row.delivered) + Number(row.read) + Number(row.replied) + Number(row.failed),
      messagesSent: Number(row.sent),
      messagesDelivered: Number(row.delivered),
      messagesRead: Number(row.read),
      messagesReplied: Number(row.replied),
      messagesFailed: Number(row.failed),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  async createOrUpdate(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const [analytics] = await db
      .insert(analytics)
      .values(insertAnalytics)
      .onConflictDoUpdate({
        target: [analytics.channelId, analytics.date],
        set: {
          messagesTotal: insertAnalytics.messagesTotal,
          messagesSent: insertAnalytics.messagesSent,
          messagesDelivered: insertAnalytics.messagesDelivered,
          messagesRead: insertAnalytics.messagesRead,
          messagesReplied: insertAnalytics.messagesReplied,
          messagesFailed: insertAnalytics.messagesFailed,
          updatedAt: new Date(),
        },
      })
      .returning();
    return analytics;
  }

  async deleteOldAnalytics(daysToKeep: number): Promise<void> {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    await db.delete(analytics).where(gte(analytics.date, cutoffDate));
  }
}