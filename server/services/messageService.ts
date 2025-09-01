import { storage } from '../storage';
import { AppError } from '../middlewares/error.middleware';
import { WhatsAppApiService } from '../services/whatsapp-api';

export async function sendBusinessMessage({ to, message, templateName, parameters, channelId, conversationId }: {
    to: string;
    message?: string;
    templateName?: string;
    parameters?: any[];
    channelId?: string;
    conversationId?: string;  // ✅ allow explicit conversation link
  }) {
  // Get channelId (or fallback to active channel)
  if (!channelId) {
    const activeChannel = await storage.getActiveChannel();
    if (!activeChannel) {
      throw new AppError(400, "No active channel found. Please select a channel.");
    }
    channelId = activeChannel.id;
  }

  const channel = await storage.getChannel(channelId);
  if (!channel) {
    throw new AppError(404, "Channel not found");
  }

  const whatsappApi = new WhatsAppApiService(channel);

  // Send via WhatsApp API
  let result;
  if (templateName) {
    result = await whatsappApi.sendMessage(to, templateName, parameters || []);
  } else {
    result = await whatsappApi.sendTextMessage(to, message);
  }

  // Find or create conversation
  let conversation = conversationId
    ? await storage.getConversation(conversationId)
    : await storage.getConversationByPhone(to);
    
  if (!conversation) {
    let contact = await storage.getContactByPhone(to);
    if (!contact) {
      contact = await storage.createContact({
        name: to,
        phone: to,
        channelId,
      });
    }

    conversation = await storage.createConversation({
      contactId: contact.id,
      contactPhone: to,
      contactName: contact.name || to,
      channelId,
      unreadCount: 0,
    });
  }

  let newMsg = templateName ? await storage.getTemplatesByName(templateName) : null;

  // Save message
  const createdMessage = await storage.createMessage({
    conversationId: conversation.id,
    content: message || newMsg?.body,
    sender: "business",
    status: "sent",
    whatsappMessageId: result.messages?.[0]?.id,
  });

  // Update conversation last message
  await storage.updateConversation(conversation.id, {
    lastMessageAt: new Date(),
    lastMessageText: message || newMsg?.body,
  });

  // Broadcast to websocket
  if ((global as any).broadcastToConversation) {
    (global as any).broadcastToConversation(conversation.id, {
      type: "new-message",
      message: createdMessage,
    });
  }

  return {
    success: true,
    messageId: result.messages?.[0]?.id,
    conversationId: conversation.id,
    createdMessage,
  };
}
