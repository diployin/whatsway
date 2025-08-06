'use strict';

import type { Request, Response } from 'express';
import { AppError, asyncHandler } from '../middlewares/error.middleware';
import { analyticsService } from '../services/analytics.service';
import PDFDocument from 'pdfkit';
import * as XLSX from 'xlsx';

// Parse analytics query parameters
const parseAnalyticsFilters = (query: any) => {
  const { channelId, days = '30', startDate, endDate } = query;
  const daysNum = parseInt(days as string, 10);
  const start = startDate ? new Date(startDate as string) : new Date(Date.now() - daysNum * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate as string) : new Date();
  
  return {
    channelId: channelId as string | undefined,
    startDate: start,
    endDate: end,
    days: daysNum,
  };
};

// Get message analytics with real-time data
export const getMessageAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const filters = parseAnalyticsFilters(req.query);
  
  // Fetch all analytics data in parallel
  const [
    dailyStats,
    overallStats,
    messageTypes,
    hourlyDistribution,
  ] = await Promise.all([
    analyticsService.getDailyMessageStats(filters),
    analyticsService.getOverallStats(filters),
    analyticsService.getMessageTypeBreakdown(filters),
    analyticsService.getHourlyDistribution(filters),
  ]);

  res.json({
    dailyStats,
    overall: overallStats,
    messageTypes,
    hourlyDistribution,
    period: {
      startDate: filters.startDate.toISOString(),
      endDate: filters.endDate.toISOString(),
      days: filters.days,
    },
  });
});

// Calculate campaign rates
const calculateCampaignRates = (campaign: any) => ({
  ...campaign,
  deliveryRate: (campaign.sent && campaign.sent > 0)
    ? ((campaign.delivered || 0) / campaign.sent) * 100 
    : 0,
  readRate: (campaign.delivered && campaign.delivered > 0)
    ? ((campaign.read || 0) / campaign.delivered) * 100 
    : 0,
  replyRate: (campaign.read && campaign.read > 0)
    ? ((campaign.replied || 0) / campaign.read) * 100 
    : 0,
});

// Get campaign analytics
export const getCampaignAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const filters = parseAnalyticsFilters(req.query);
  
  // Get campaign performance data from service
  const campaignStats = await analyticsService.getCampaignPerformance(filters);

  // Calculate rates for each campaign
  const campaignsWithRates = campaignStats.map(calculateCampaignRates);

  // Calculate aggregated stats
  const aggregatedStats = campaignStats.reduce((acc, campaign) => ({
    totalCampaigns: acc.totalCampaigns + 1,
    activeCampaigns: acc.activeCampaigns + (campaign.status === 'active' ? 1 : 0),
    completedCampaigns: acc.completedCampaigns + (campaign.status === 'completed' ? 1 : 0),
    totalRecipients: acc.totalRecipients + (campaign.totalRecipients || 0),
    totalSent: acc.totalSent + (campaign.sent || 0),
    totalDelivered: acc.totalDelivered + (campaign.delivered || 0),
    totalRead: acc.totalRead + (campaign.read || 0),
    totalFailed: acc.totalFailed + (campaign.failed || 0),
  }), {
    totalCampaigns: 0,
    activeCampaigns: 0,
    completedCampaigns: 0,
    totalRecipients: 0,
    totalSent: 0,
    totalDelivered: 0,
    totalRead: 0,
    totalFailed: 0,
  });

  res.json({
    campaigns: campaignsWithRates,
    summary: aggregatedStats,
  });
});

// Get individual campaign analytics
export const getCampaignAnalyticsById = asyncHandler(async (req: Request, res: Response) => {
  const { campaignId } = req.params;
  const { campaignAnalyticsService } = await import('../services/campaign-analytics.service');

  // Get campaign details
  const campaign = await campaignAnalyticsService.getCampaignById(campaignId);

  if (!campaign) {
    res.status(404).json({ error: 'Campaign not found' });
    return;
  }

  // Fetch analytics data in parallel
  const [dailyStats, recipientStats, errorAnalysis] = await Promise.all([
    campaignAnalyticsService.getCampaignDailyStats(campaignId),
    campaignAnalyticsService.getRecipientStatusDistribution(campaignId),
    campaignAnalyticsService.getErrorAnalysis(campaignId),
  ]);

  res.json({
    campaign,
    dailyStats,
    recipientStats,
    errorAnalysis,
  });
});

// Get individual campaign details
export const getCampaignDetails = asyncHandler(async (req: Request, res: Response) => {
  const { campaignId } = req.params;
  const { campaignAnalyticsService } = await import('../services/campaign-analytics.service');

  const campaign = await campaignAnalyticsService.getCampaignById(campaignId);

  if (!campaign) {
    throw new AppError(404, 'Campaign not found');
  }

  // Fetch all analytics data in parallel
  const [dailyStats, recipientStats, errorAnalysis] = await Promise.all([
    campaignAnalyticsService.getCampaignDailyStats(campaignId),
    campaignAnalyticsService.getRecipientStatusDistribution(campaignId),
    campaignAnalyticsService.getErrorAnalysis(campaignId),
  ]);

  res.json({
    campaign,
    dailyStats,
    recipientStats,
    errorAnalysis,
  });
});

// Export analytics report
export const exportAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const { format = 'pdf', type = 'messages' } = req.query;
  const { exportService } = await import('../services/export.service');
  
  const filters = parseAnalyticsFilters(req.query);
  const filename = `analytics-report-${new Date().toISOString().split('T')[0]}`;
  
  // Get analytics data based on type
  let data: any = {};
  
  if (type === 'messages') {
    const [overallStats, dailyStats] = await Promise.all([
      analyticsService.getOverallStats(filters),
      analyticsService.getDailyMessageStats(filters),
    ]);
    data = { summary: overallStats, tableData: dailyStats };
  } else if (type === 'campaigns') {
    const campaigns = await analyticsService.getCampaignPerformance(filters);
    data = { tableData: campaigns };
  }
  
  // Export based on format
  switch (format) {
    case 'pdf':
      exportService.exportToPDF(data, 'Analytics Report', filename, res);
      break;
    case 'excel':
      exportService.exportToExcel(data.tableData || [], filename, res);
      break;
    case 'csv':
      exportService.exportToCSV(data.tableData || [], filename, res);
      break;
    case 'json':
      exportService.exportToJSON(data, filename, res);
      break;
    default:
      throw new AppError(400, 'Invalid export format');
  }
});