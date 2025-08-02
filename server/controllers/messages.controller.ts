import type { Request, Response } from 'express';
import { storage } from '../storage';
import { insertMessageSchema, insertConversationSchema } from '@shared/schema';
import { AppError, asyncHandler } from '../middlewares/error.middleware';
import { WhatsAppApiService } from '../services/whatsapp-api';
import type { RequestWithChannel } from '../middlewares/channel.middleware';

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const messages = await storage.getMessages(conversationId);
  res.json(messages);
});

export const createMessage = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const validatedMessage = insertMessageSchema.parse({
    ...req.body,
    conversationId
  });
  
  const message = await storage.createMessage(validatedMessage);
  
  // Update conversation's last message
  await storage.updateConversation(conversationId, {
    lastMessageAt: new Date()
  });
  
  res.json(message);
});

export const sendMessage = asyncHandler(async (req: RequestWithChannel, res: Response) => {
  const { to, message, templateName, parameters, channelId: bodyChannelId } = req.body;
  
  // Get channelId from body or active channel
  let channelId = bodyChannelId;
  if (!channelId) {
    const activeChannel = await storage.getActiveChannel();
    if (!activeChannel) {
      throw new AppError(400, 'No active channel found. Please select a channel.');
    }
    channelId = activeChannel.id;
  }
  
  const channel = await storage.getChannel(channelId);
  if (!channel) {
    throw new AppError(404, 'Channel not found');
  }
  
  const whatsappApi = new WhatsAppApiService(channel);
  
  try {
    let result;
    if (templateName) {
      // Send template message
      result = await whatsappApi.sendMessage(to, templateName, parameters || []);
    } else {
      // Send text message
      result = await whatsappApi.sendTextMessage(to, message);
    }
    
    // Find or create conversation
    let conversation = await storage.getConversationByPhone(to);
    if (!conversation) {
      // Find or create contact first
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
    
    // Create message record
    await storage.createMessage({
      conversationId: conversation.id,
      content: message || `Template: ${templateName}`,
      sender: 'business',
      status: 'sent',
      whatsappMessageId: result.messages?.[0]?.id
    });
    
    res.json({
      success: true,
      messageId: result.messages?.[0]?.id,
      conversationId: conversation.id
    });
  } catch (error) {
    console.error('Error sending message:', error);
    throw new AppError(500, error instanceof Error ? error.message : 'Failed to send message');
  }
});