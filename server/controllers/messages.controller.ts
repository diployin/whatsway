import type { Request, Response } from 'express';
import { storage } from '../storage';
import { insertMessageSchema, insertConversationSchema } from '@shared/schema';
import { AppError, asyncHandler } from '../middlewares/error.middleware';
import { WhatsAppApiService } from '../services/whatsapp-api';
import type { RequestWithChannel } from '../middlewares/channel.middleware';
import { randomUUID } from 'crypto';

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const messages = await storage.getMessages(conversationId);
  res.json(messages);
});

export const createMessage = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const { content, fromUser } = req.body;
  
  console.log("Req body : ===> "  , req.body)


  // Get conversation details
  const conversation = await storage.getConversation(conversationId);
  if (!conversation) {
    throw new AppError(404, 'Conversation not found');
  }
  
  // If message is from user, send it via WhatsApp
  if (fromUser && content) {
    // Get active channel
    const channel = await storage.getChannel(conversation.channelId);
    if (!channel) {
      throw new AppError(404, 'Channel not found');
    }
    
    const whatsappApi = new WhatsAppApiService(channel);
    
    try {
      // Send text message via WhatsApp
      const result = await whatsappApi.sendTextMessage(conversation.contactPhone, content);

      console.log("sendTextMessage : ===> "  , conversation.contactPhone, content)
      
      // Create message record with WhatsApp message ID
      const message = await storage.createMessage({
        conversationId,
        content,
        sender: 'business',
        status: 'sent',
        whatsappMessageId: result.messages?.[0]?.id
      });

      console.log("Req body : ===> "  , {lastMessageAt: new Date(),
        lastMessageText:content})
      
      // Update conversation's last message
      await storage.updateConversation(conversationId, {
        lastMessageAt: new Date(),
        lastMessageText:content
      });
      
      // Broadcast new message to WebSocket clients
      if ((global as any).broadcastToConversation) {
        (global as any).broadcastToConversation(conversationId, {
          type: 'new-message',
          message
        });
      }
      
      res.json(message);
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw new AppError(500, error instanceof Error ? error.message : 'Failed to send message');
    }
  } else {
    // Just create message record (for incoming messages)
    const validatedMessage = insertMessageSchema.parse({
      ...req.body,
      conversationId
    });
    
    const message = await storage.createMessage(validatedMessage);
    
    // Update conversation's last message
    await storage.updateConversation(conversationId, {
      lastMessageAt: new Date(),
        lastMessageText:content
    });
    
    // Broadcast new message to WebSocket clients
    if ((global as any).broadcastToConversation) {
      (global as any).broadcastToConversation(conversationId, {
        type: 'new-message',
        message
      });
    }
    
    res.json(message);
  }
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


   let newMsg =  await storage.getTemplatesByName(templateName)
    
    // Create message record
    const createdMessage = await storage.createMessage({
      conversationId: conversation.id,
      content: message || newMsg?.body,
      sender: 'business',
      status: 'sent',
      whatsappMessageId: result.messages?.[0]?.id
    });

        // Update conversation's last message
        await storage.updateConversation(conversation.id, {
          lastMessageAt: new Date(),
            lastMessageText: message ||  newMsg?.body,
        });
    
    // Broadcast new message to WebSocket clients
    if ((global as any).broadcastToConversation) {
      (global as any).broadcastToConversation(conversation.id, {
        type: 'new-message',
        message: createdMessage
      });
    }
    
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