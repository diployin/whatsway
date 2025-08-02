import type { Request, Response } from 'express';
import { storage } from '../storage';
import { insertCampaignSchema } from '@shared/schema';
import { AppError, asyncHandler } from '../middlewares/error.middleware';
import { WhatsAppApiService } from '../services/whatsapp-api';
import type { RequestWithChannel } from '../middlewares/channel.middleware';

export const getCampaigns = asyncHandler(async (req: RequestWithChannel, res: Response) => {
  const channelId = req.query.channelId as string | undefined;
  const campaigns = channelId 
    ? await storage.getCampaignsByChannel(channelId)
    : await storage.getCampaigns();
  res.json(campaigns);
});

export const getCampaign = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const campaign = await storage.getCampaign(id);
  if (!campaign) {
    throw new AppError(404, 'Campaign not found');
  }
  res.json(campaign);
});

export const createCampaign = asyncHandler(async (req: RequestWithChannel, res: Response) => {
  const validatedCampaign = insertCampaignSchema.parse(req.body);
  
  // Get active channel if channelId not provided
  let channelId = validatedCampaign.channelId;
  if (!channelId) {
    const activeChannel = await storage.getActiveChannel();
    if (!activeChannel) {
      throw new AppError(400, 'No active channel found. Please configure a channel first.');
    }
    channelId = activeChannel.id;
  }
  
  const campaign = await storage.createCampaign({
    ...validatedCampaign,
    channelId
  });
  
  res.json(campaign);
});

export const updateCampaign = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const campaign = await storage.updateCampaign(id, req.body);
  if (!campaign) {
    throw new AppError(404, 'Campaign not found');
  }
  res.json(campaign);
});

export const deleteCampaign = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const success = await storage.deleteCampaign(id);
  if (!success) {
    throw new AppError(404, 'Campaign not found');
  }
  res.status(204).send();
});

export const startCampaign = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const campaign = await storage.getCampaign(id);
  
  if (!campaign) {
    throw new AppError(404, 'Campaign not found');
  }
  
  if (!campaign.channelId) {
    throw new AppError(400, 'Campaign has no associated channel');
  }
  
  // Get channel
  const channel = await storage.getChannel(campaign.channelId);
  if (!channel) {
    throw new AppError(404, 'Channel not found');
  }
  
  // Get template
  const template = await storage.getTemplate(campaign.templateId);
  if (!template) {
    throw new AppError(404, 'Template not found');
  }
  
  // Update campaign status
  await storage.updateCampaign(id, { 
    status: 'active',
    startedAt: new Date()
  });
  
  // Start sending messages
  const whatsappApi = new WhatsAppApiService(channel);
  const recipients = campaign.recipients;
  let sent = 0;
  let failed = 0;
  
  for (const recipient of recipients) {
    try {
      await whatsappApi.sendMessage(
        recipient.replace(/\D/g, ''), // Clean phone number
        template.name,
        campaign.parameters || []
      );
      sent++;
    } catch (error) {
      console.error(`Failed to send to ${recipient}:`, error);
      failed++;
    }
  }
  
  // Update campaign with results
  await storage.updateCampaign(id, {
    messagesSent: sent,
    status: 'completed'
  });
  
  res.json({
    message: 'Campaign started',
    sent,
    failed,
    total: recipients.length
  });
});