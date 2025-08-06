'use strict';

import { db } from '../db';
import { messages, campaigns, campaignRecipients } from '@shared/schema';
import { eq, and, count, sql, desc } from 'drizzle-orm';

export class CampaignAnalyticsService {
  /**
   * Get campaign by ID
   */
  async getCampaignById(campaignId: string) {
    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, campaignId))
      .limit(1);
    
    return campaign;
  }

  /**
   * Get daily stats for a campaign
   */
  async getCampaignDailyStats(campaignId: string) {
    return db
      .select({
        date: sql<string>`DATE(${messages.timestamp})`,
        sent: count(messages.id),
        delivered: sql<number>`COUNT(CASE WHEN ${messages.status} = 'delivered' THEN 1 END)`,
        read: sql<number>`COUNT(CASE WHEN ${messages.status} = 'read' THEN 1 END)`,
        failed: sql<number>`COUNT(CASE WHEN ${messages.status} = 'failed' THEN 1 END)`,
      })
      .from(messages)
      .where(eq(messages.campaignId, campaignId))
      .groupBy(sql`DATE(${messages.timestamp})`)
      .orderBy(sql`DATE(${messages.timestamp})`);
  }

  /**
   * Get recipient status distribution
   */
  async getRecipientStatusDistribution(campaignId: string) {
    return db
      .select({
        status: messages.status,
        count: count(messages.id),
      })
      .from(messages)
      .where(eq(messages.campaignId, campaignId))
      .groupBy(messages.status);
  }

  /**
   * Get error analysis for failed messages
   */
  async getErrorAnalysis(campaignId: string) {
    return db
      .select({
        errorCode: sql<string>`${messages.errorDetails}->>'code'`,
        errorMessage: sql<string>`${messages.errorDetails}->>'message'`,
        count: count(messages.id),
      })
      .from(messages)
      .where(and(
        eq(messages.campaignId, campaignId),
        eq(messages.status, 'failed')
      ))
      .groupBy(sql`${messages.errorDetails}->>'code'`, sql`${messages.errorDetails}->>'message'`)
      .orderBy(desc(count(messages.id)));
  }

  /**
   * Get campaign recipients with pagination
   */
  async getCampaignRecipients(campaignId: string, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    
    const recipients = await db
      .select()
      .from(campaignRecipients)
      .where(eq(campaignRecipients.campaignId, campaignId))
      .orderBy(desc(campaignRecipients.createdAt))
      .limit(limit)
      .offset(offset);
    
    const [total] = await db
      .select({ count: count(campaignRecipients.id) })
      .from(campaignRecipients)
      .where(eq(campaignRecipients.campaignId, campaignId));
    
    return {
      recipients,
      total: total?.count || 0,
      page,
      totalPages: Math.ceil((total?.count || 0) / limit),
    };
  }

  /**
   * Get hourly message distribution for campaign
   */
  async getCampaignHourlyDistribution(campaignId: string) {
    return db
      .select({
        hour: sql<number>`EXTRACT(HOUR FROM ${messages.timestamp})`,
        count: count(messages.id),
      })
      .from(messages)
      .where(eq(messages.campaignId, campaignId))
      .groupBy(sql`EXTRACT(HOUR FROM ${messages.timestamp})`)
      .orderBy(sql`EXTRACT(HOUR FROM ${messages.timestamp})`);
  }
}

export const campaignAnalyticsService = new CampaignAnalyticsService();