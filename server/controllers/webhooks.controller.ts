import type { Request, Response } from 'express';
import { storage } from '../storage';
import { insertMessageSchema } from '@shared/schema';
import { AppError, asyncHandler } from '../middlewares/error.middleware';
import crypto from 'crypto';

export const getWebhookConfigs = asyncHandler(async (req: Request, res: Response) => {
  const configs = await storage.getWebhookConfigs();
  res.json(configs);
});

export const getGlobalWebhookUrl = asyncHandler(async (req: Request, res: Response) => {
  const protocol = req.protocol;
  const host = req.get('host');
  const webhookUrl = `${protocol}://${host}/webhook/d420e261-9c12-4cee-9d65-253cda8ab4bc`;
  res.json({ webhookUrl });
});

export const handleWebhook = asyncHandler(async (req: Request, res: Response) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': verifyToken } = req.query;
  
  // Handle webhook verification
  if (mode && challenge) {
    if (mode === 'subscribe' && verifyToken === process.env.WEBHOOK_VERIFY_TOKEN) {
      console.log('Webhook verified');
      return res.send(challenge);
    }
    throw new AppError(403, 'Verification failed');
  }
  
  // Handle webhook events
  const body = req.body;
  console.log('Webhook received:', JSON.stringify(body, null, 2));
  
  if (body.entry) {
    for (const entry of body.entry) {
      const changes = entry.changes || [];
      
      for (const change of changes) {
        if (change.field === 'messages') {
          await handleMessageChange(change.value);
        } else if (change.field === 'message_template_status_update') {
          await handleTemplateStatusUpdate(change.value);
        }
      }
    }
  }
  
  res.sendStatus(200);
});

async function handleMessageChange(value: any) {
  const { messages, contacts, metadata } = value;
  
  if (!messages || messages.length === 0) {
    return;
  }
  
  // Find channel by phone number ID
  const phoneNumberId = metadata?.phone_number_id;
  if (!phoneNumberId) {
    console.error('No phone_number_id in webhook');
    return;
  }
  
  const channel = await storage.getChannelByPhoneNumberId(phoneNumberId);
  if (!channel) {
    console.error(`No channel found for phone_number_id: ${phoneNumberId}`);
    return;
  }
  
  for (const message of messages) {
    const { from, id: whatsappMessageId, text, type, timestamp } = message;
    
    // Find or create conversation
    let conversation = await storage.getConversationByPhone(from);
    if (!conversation) {
      const contactName = contacts?.find((c: any) => c.wa_id === from)?.profile?.name || from;
      conversation = await storage.createConversation({
        contactPhone: from,
        contactName,
        channelId: channel.id,
        unreadCount: 1
      });
    } else {
      // Increment unread count
      await storage.updateConversation(conversation.id, {
        unreadCount: (conversation.unreadCount || 0) + 1,
        lastMessageAt: new Date()
      });
    }
    
    // Create message
    await storage.createMessage({
      conversationId: conversation.id,
      content: text?.body || `[${type} message]`,
      sender: 'contact',
      status: 'received',
      whatsappMessageId
    });
  }
}

async function handleTemplateStatusUpdate(value: any) {
  const { message_template_id, message_template_name, event } = value;
  
  console.log(`Template status update: ${message_template_name} - ${event}`);
  
  if (message_template_id && event) {
    // Map WhatsApp status to our status
    let status = 'pending';
    if (event === 'APPROVED') {
      status = 'approved';
    } else if (event === 'REJECTED') {
      status = 'rejected';
    }
    
    // Update template status in database
    const templates = await storage.getTemplates();
    const template = templates.find(t => t.whatsappTemplateId === message_template_id);
    
    if (template) {
      await storage.updateTemplate(template.id, { status });
      console.log(`Updated template ${template.name} status to ${status}`);
    }
  }
}