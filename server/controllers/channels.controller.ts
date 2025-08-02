import type { Request, Response } from 'express';
import { storage } from '../storage';
import { insertChannelSchema } from '@shared/schema';
import { AppError, asyncHandler } from '../middlewares/error.middleware';
import type { RequestWithChannel } from '../middlewares/channel.middleware';

export const getChannels = asyncHandler(async (req: Request, res: Response) => {
  const channels = await storage.getChannels();
  res.json(channels);
});

export const getActiveChannel = asyncHandler(async (req: Request, res: Response) => {
  const channel = await storage.getActiveChannel();
  if (!channel) {
    throw new AppError(404, 'No active channel found');
  }
  res.json(channel);
});

export const createChannel = asyncHandler(async (req: Request, res: Response) => {
  const validatedChannel = insertChannelSchema.parse(req.body);
  
  // If this is set as active, deactivate all other channels
  if (validatedChannel.isActive) {
    const channels = await storage.getChannels();
    for (const channel of channels) {
      if (channel.isActive) {
        await storage.updateChannel(channel.id, { isActive: false });
      }
    }
  }
  
  const channel = await storage.createChannel(validatedChannel);
  res.json(channel);
});

export const updateChannel = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // If setting this channel as active, deactivate all others
  if (req.body.isActive === true) {
    const channels = await storage.getChannels();
    for (const channel of channels) {
      if (channel.id !== id && channel.isActive) {
        await storage.updateChannel(channel.id, { isActive: false });
      }
    }
  }
  
  const channel = await storage.updateChannel(id, req.body);
  if (!channel) {
    throw new AppError(404, 'Channel not found');
  }
  res.json(channel);
});

export const deleteChannel = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const success = await storage.deleteChannel(id);
  if (!success) {
    throw new AppError(404, 'Channel not found');
  }
  res.status(204).send();
});

export const checkChannelHealth = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const channel = await storage.getChannel(id);
  if (!channel) {
    throw new AppError(404, 'Channel not found');
  }

  try {
    const url = `https://graph.facebook.com/v23.0/${channel.phoneNumberId}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${channel.accessToken}`
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      const healthDetails = {
        status: data.account_mode || 'UNKNOWN',
        name_status: data.name_status || 'UNKNOWN',
        phone_number: data.display_phone_number || channel.phoneNumber,
        quality_rating: data.quality_rating || 'UNKNOWN',
        throughput_level: data.throughput?.level || 'STANDARD',
        verification_status: data.verified_name?.status || 'NOT_VERIFIED'
      };

      await storage.updateChannel(id, {
        healthStatus: 'healthy',
        lastHealthCheck: new Date(),
        healthDetails
      });

      res.json({
        status: 'healthy',
        details: healthDetails,
        lastCheck: new Date()
      });
    } else {
      await storage.updateChannel(id, {
        healthStatus: 'error',
        lastHealthCheck: new Date(),
        healthDetails: { error: data.error?.message || 'Unknown error' }
      });

      res.json({
        status: 'error',
        error: data.error?.message || 'Failed to fetch channel health',
        lastCheck: new Date()
      });
    }
  } catch (error) {
    await storage.updateChannel(id, {
      healthStatus: 'error',
      lastHealthCheck: new Date(),
      healthDetails: { error: 'Network error' }
    });

    res.json({
      status: 'error',
      error: 'Failed to check channel health',
      lastCheck: new Date()
    });
  }
});