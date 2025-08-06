'use strict';

import { db } from '../db';
import { messages, campaigns, conversations, contacts, whatsappChannels } from '@shared/schema';
import { eq, and, gte, lte, count, sql, desc } from 'drizzle-orm';

export interface AnalyticsFilters {
  channelId?: string;
  startDate: Date;
  endDate: Date;
}

export class AnalyticsService {
  /**
   * Build common filter conditions for analytics queries
   */
  private buildConditions(filters: AnalyticsFilters) {
    const conditions = [];
    
    if (filters.channelId) {
      conditions.push(eq(conversations.channelId, filters.channelId));
    }
    
    conditions.push(gte(messages.createdAt, filters.startDate));
    conditions.push(lte(messages.createdAt, filters.endDate));
    
    return conditions;
  }

  /**
   * Get daily message statistics
   */
  async getDailyMessageStats(filters: AnalyticsFilters) {
    const conditions = this.buildConditions(filters);
    
    return db
      .select({
        date: sql<string>`DATE(${messages.createdAt})`,
        totalSent: count(messages.id),
        delivered: sql<number>`COUNT(CASE WHEN ${messages.status} = 'delivered' THEN 1 END)`,
        read: sql<number>`COUNT(CASE WHEN ${messages.status} = 'read' THEN 1 END)`,
        failed: sql<number>`COUNT(CASE WHEN ${messages.status} = 'failed' THEN 1 END)`,
        pending: sql<number>`COUNT(CASE WHEN ${messages.status} = 'pending' THEN 1 END)`,
      })
      .from(messages)
      .innerJoin(conversations, eq(messages.conversationId, conversations.id))
      .where(and(...conditions))
      .groupBy(sql`DATE(${messages.createdAt})`)
      .orderBy(sql`DATE(${messages.createdAt})`);
  }

  /**
   * Get overall message statistics
   */
  async getOverallStats(filters: AnalyticsFilters) {
    const conditions = this.buildConditions(filters);
    
    const stats = await db
      .select({
        totalMessages: count(messages.id),
        totalDelivered: sql<number>`COUNT(CASE WHEN ${messages.status} = 'delivered' THEN 1 END)`,
        totalRead: sql<number>`COUNT(CASE WHEN ${messages.status} = 'read' THEN 1 END)`,
        totalFailed: sql<number>`COUNT(CASE WHEN ${messages.status} = 'failed' THEN 1 END)`,
        totalReplied: sql<number>`COUNT(CASE WHEN ${messages.fromUser} = true THEN 1 END)`,
        uniqueContacts: sql<number>`COUNT(DISTINCT ${conversations.contactPhone})`,
      })
      .from(messages)
      .innerJoin(conversations, eq(messages.conversationId, conversations.id))
      .where(and(...conditions));
      
    return stats[0] || {};
  }

  /**
   * Get message type breakdown
   */
  async getMessageTypeBreakdown(filters: AnalyticsFilters) {
    const conditions = this.buildConditions(filters);
    
    return db
      .select({
        direction: messages.direction,
        count: count(messages.id),
      })
      .from(messages)
      .innerJoin(conversations, eq(messages.conversationId, conversations.id))
      .where(and(...conditions))
      .groupBy(messages.direction);
  }

  /**
   * Get hourly message distribution
   */
  async getHourlyDistribution(filters: AnalyticsFilters) {
    const conditions = this.buildConditions(filters);
    
    return db
      .select({
        hour: sql<number>`EXTRACT(HOUR FROM ${messages.createdAt})`,
        count: count(messages.id),
      })
      .from(messages)
      .innerJoin(conversations, eq(messages.conversationId, conversations.id))
      .where(and(...conditions))
      .groupBy(sql`EXTRACT(HOUR FROM ${messages.createdAt})`)
      .orderBy(sql`EXTRACT(HOUR FROM ${messages.createdAt})`);
  }

  /**
   * Get campaign performance metrics
   */
  async getCampaignPerformance(filters: AnalyticsFilters) {
    const campaignConditions = [];
    
    if (filters.channelId) {
      campaignConditions.push(eq(campaigns.channelId, filters.channelId));
    }
    
    campaignConditions.push(gte(campaigns.createdAt, filters.startDate));
    campaignConditions.push(lte(campaigns.createdAt, filters.endDate));
    
    return db
      .select({
        id: campaigns.id,
        name: campaigns.name,
        status: campaigns.status,
        totalRecipients: campaigns.recipientCount,
        sent: campaigns.sentCount,
        delivered: campaigns.deliveredCount,
        failed: campaigns.failedCount,
        read: campaigns.readCount,
        startedAt: campaigns.scheduledAt,
        completedAt: campaigns.completedAt,
      })
      .from(campaigns)
      .where(and(...campaignConditions))
      .orderBy(desc(campaigns.createdAt))
      .limit(10);
  }

  /**
   * Get engagement rates
   */
  async getEngagementRates(filters: AnalyticsFilters) {
    const stats = await this.getOverallStats(filters);
    
    const totalMessages = Number(stats.totalMessages) || 0;
    const totalDelivered = Number(stats.totalDelivered) || 0;
    const totalRead = Number(stats.totalRead) || 0;
    const totalReplied = Number(stats.totalReplied) || 0;
    
    return {
      deliveryRate: totalMessages > 0 ? (totalDelivered / totalMessages) * 100 : 0,
      readRate: totalDelivered > 0 ? (totalRead / totalDelivered) * 100 : 0,
      replyRate: totalRead > 0 ? (totalReplied / totalRead) * 100 : 0,
    };
  }

  /**
   * Get top contacts by message count
   */
  async getTopContacts(filters: AnalyticsFilters, limit = 10) {
    const conditions = this.buildConditions(filters);
    
    return db
      .select({
        contactPhone: conversations.contactPhone,
        contactName: conversations.contactName,
        messageCount: count(messages.id),
        lastMessage: sql<Date>`MAX(${messages.createdAt})`,
      })
      .from(messages)
      .innerJoin(conversations, eq(messages.conversationId, conversations.id))
      .where(and(...conditions))
      .groupBy(conversations.contactPhone, conversations.contactName)
      .orderBy(desc(count(messages.id)))
      .limit(limit);
  }

  /**
   * Get channel performance metrics
   */
  async getChannelPerformance(filters: AnalyticsFilters) {
    const messageConditions = [];
    messageConditions.push(gte(messages.createdAt, filters.startDate));
    messageConditions.push(lte(messages.createdAt, filters.endDate));
    
    return db
      .select({
        channelId: whatsappChannels.id,
        channelName: whatsappChannels.name,
        phoneNumber: whatsappChannels.phoneNumber,
        totalMessages: count(messages.id),
        delivered: sql<number>`COUNT(CASE WHEN ${messages.status} = 'delivered' THEN 1 END)`,
        failed: sql<number>`COUNT(CASE WHEN ${messages.status} = 'failed' THEN 1 END)`,
      })
      .from(whatsappChannels)
      .leftJoin(conversations, eq(conversations.channelId, whatsappChannels.id))
      .leftJoin(messages, eq(messages.conversationId, conversations.id))
      .where(and(...messageConditions))
      .groupBy(whatsappChannels.id, whatsappChannels.name, whatsappChannels.phoneNumber);
  }

  /**
   * Format analytics data for export
   */
  formatForExport(data: any[], format: 'csv' | 'json' | 'pdf' | 'excel') {
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        return this.convertToCSV(data);
      default:
        return data;
    }
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: any[]): string {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',');
    });
    
    return [csvHeaders, ...csvRows].join('\n');
  }
}

export const analyticsService = new AnalyticsService();