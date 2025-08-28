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

export const createWebhookConfig = asyncHandler(async (req: Request, res: Response) => {
  const { verifyToken, appSecret, events } = req.body;
  
  if (!verifyToken) {
    throw new AppError(400, 'Verify token is required');
  }
  
  const protocol = req.protocol;
  const host = req.get('host');
  const webhookUrl = `${protocol}://${host}/webhook/d420e261-9c12-4cee-9d65-253cda8ab4bc`;
  
  const config = await storage.createWebhookConfig({
    webhookUrl,
    verifyToken,
    appSecret: appSecret || '',
    events: events || ['messages', 'message_status', 'message_template_status_update'],
    isActive: true,
    channelId: null // Global webhook
  });
  
  res.json(config);
});

export const updateWebhookConfig = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  
  const config = await storage.updateWebhookConfig(id, updates);
  if (!config) {
    throw new AppError(404, 'Webhook config not found');
  }
  
  res.json(config);
});

export const deleteWebhookConfig = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const deleted = await storage.deleteWebhookConfig(id);
  if (!deleted) {
    throw new AppError(404, 'Webhook config not found');
  }
  
  res.json({ success: true, message: 'Webhook config deleted' });
});

export const testWebhook = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  // console.log("Testing webhook for config ID:", id);
  const config = await storage.getWebhookConfig(id);
  if (!config) {
    throw new AppError(404, 'Webhook config not found');
  }
  // console.log("Webhook config:", config);
  // Send a test webhook event
  const testPayload = {
    entry: [{
      id: "test-entry",
      changes: [{
        value: {
          messaging_product: "whatsapp",
          metadata: {
            display_phone_number: "15550555555",
            phone_number_id: "test-phone-id"
          },
          test: true
        },
        field: "messages"
      }]
    }]
  };
  // console.log("Sending test webhook to:", config.webhookUrl , testPayload);
  try {
    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });
    
    // console.log('Test :::==========>' , response);
    if (!response.ok) {
      throw new AppError(500, `Test webhook failed with status ${response.status}`);
    }
    res.json({ success: true, message: 'Test webhook sent successfully' });
  } catch (error) {
    throw new AppError(500, `Failed to send test webhook: ${error.message}`);
  }
});

export const handleWebhook = asyncHandler(async (req: Request, res: Response) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': verifyToken } = req.query;
  
  // Handle webhook verification
  if (mode && challenge) {
    // Get webhook config from database to check verify token
    const configs = await storage.getWebhookConfigs();
    const activeConfig = configs.find(c => c.isActive);
    
    if (mode === 'subscribe' && activeConfig && verifyToken === activeConfig.verifyToken) {
      console.log('Webhook verified');
      // Update last ping timestamp
      await storage.updateWebhookConfig(activeConfig.id, {
        lastPingAt: new Date()
      });
      return res.send(challenge);
    }
    throw new AppError(403, 'Verification failed');
  }
  
  // Handle webhook events
  const body = req.body;
  console.log('Webhook received:', JSON.stringify(body, null, 2));
  
  // Update last ping timestamp for webhook events
  const configs = await storage.getWebhookConfigs();
  const activeConfig = configs.find(c => c.isActive);
  if (activeConfig) {
    await storage.updateWebhookConfig(activeConfig.id, {
      lastPingAt: new Date()
    });
  }
  
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
  const { messages, contacts, metadata, statuses } = value;
  
  // Handle message status updates (sent, delivered, read, failed)
  if (statuses && statuses.length > 0) {
    await handleMessageStatuses(statuses, metadata);
    return;
  }
  
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
      // Find or create contact first
      let contact = await storage.getContactByPhone(from);
      if (!contact) {
        const contactName = contacts?.find((c: any) => c.wa_id === from)?.profile?.name || from;
        contact = await storage.createContact({
          name: contactName,
          phone: from,
          channelId: channel.id
        });
      }
      
      conversation = await storage.createConversation({
        contactId: contact.id,
        contactPhone: from,
        contactName: contact.name || from,
        channelId: channel.id,
        unreadCount: 1
      });
    } else {
      // Increment unread count


      
      
      await storage.updateConversation(conversation.id, {
        unreadCount: (conversation.unreadCount || 0) + 1,
        lastMessageAt: new Date(),
        lastMessageText:text?.body || `[${type} message]`,
      });
    }
    
    console.log("Webhook Message ::>>" , text , text?.body)

    // Create message
    const newMessage = await storage.createMessage({
      conversationId: conversation.id,
      content: text?.body || `[${type} message]`,
      fromUser: false,
      direction: 'inbound',
      status: 'received',
      whatsappMessageId,
      timestamp: new Date(parseInt(timestamp, 10) * 1000)
    });
    
    // Broadcast new message via WebSocket
    if ((global as any).broadcastToConversation) {
      (global as any).broadcastToConversation(conversation.id, {
        type: 'new-message',
        message: newMessage
      });
    }
  }
}

async function handleMessageStatuses(statuses: any[], metadata: any) {
  const phoneNumberId = metadata?.phone_number_id;
  if (!phoneNumberId) {
    console.error('No phone_number_id in webhook status update');
    return;
  }

  const channel = await storage.getChannelByPhoneNumberId(phoneNumberId);
  if (!channel) {
    console.error(`No channel found for phone_number_id: ${phoneNumberId}`);
    return;
  }

  for (const statusUpdate of statuses) {
    const { id: whatsappMessageId, status, timestamp, errors } = statusUpdate;
    
    console.log(`Message status update: ${whatsappMessageId} - ${status}`, errors);
    
    // Find the message by WhatsApp ID
    const message = await storage.getMessageByWhatsAppId(whatsappMessageId);
    if (!message) {
      console.log(`Message not found for WhatsApp ID: ${whatsappMessageId}`);
      continue;
    }

    // Map WhatsApp status to our status
    let messageStatus: 'sent' | 'delivered' | 'read' | 'failed' = 'sent';
    let errorDetails = null;
    
    if (status === 'sent') {
      messageStatus = 'sent';
    } else if (status === 'delivered') {
      messageStatus = 'delivered';
    } else if (status === 'read') {
      messageStatus = 'read';
    } else if (status === 'failed' && errors && errors.length > 0) {
      messageStatus = 'failed';
      // Capture the error details
      const error = errors[0];
      errorDetails = {
        code: error.code,
        title: error.title,
        message: error.message || error.details,
        errorData: error.error_data
      };
      
      console.error(`Message failed with error:`, errorDetails);
    }

    // Update message status and error details
    await storage.updateMessage(message.id, {
      status: messageStatus,
      errorDetails: errorDetails ? JSON.stringify(errorDetails) : null,
      updatedAt: new Date()
    });

    // If message has a campaign ID, update campaign stats
    if (message.campaignId) {
      const campaign = await storage.getCampaign(message.campaignId);
      if (campaign && messageStatus === 'failed') {
        await storage.updateCampaign(campaign.id, {
          failedCount: (campaign.failedCount || 0) + 1,
          sentCount: Math.max(0, (campaign.sentCount || 0) - 1)
        });
      }
    }
  }
}

async function handleTemplateStatusUpdate(value: any) {
  const { message_template_id, message_template_name, event, reason } = value;
  
  console.log(`Template status update: ${message_template_name} - ${event}${reason ? ` - Reason: ${reason}` : ''}`);
  
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
      const updateData: any = { status };
      // If rejected, save the rejection reason
      if (event === 'REJECTED' && reason) {
        updateData.rejectionReason = reason;
      }
      await storage.updateTemplate(template.id, updateData);
      console.log(`Updated template ${template.name} status to ${status}${reason ? ` with reason: ${reason}` : ''}`);
    }
  }
}