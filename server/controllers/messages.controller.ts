import type { Request, Response } from 'express';
import { storage } from '../storage';
import { insertMessageSchema, insertConversationSchema, messages } from '@shared/schema';
import { AppError, asyncHandler } from '../middlewares/error.middleware';
import { WhatsAppApiService } from '../services/whatsapp-api';
import type { RequestWithChannel } from '../middlewares/channel.middleware';
import { triggerService } from "../services/automation-execution.service";
import { db } from 'server/db';

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const messages = await storage.getMessages(conversationId);

  await storage.updateConversation(conversationId, {
    unreadCount:null
  });
  res.json(messages);
});

// export const createMessage = asyncHandler(async (req: Request, res: Response) => {
//   const { conversationId } = req.params;
//   const { content, fromUser } = req.body;
  
//   console.log("Req body : ===> "  , req.body)


//   // Get conversation details
//   const conversation = await storage.getConversation(conversationId);
//   if (!conversation) {
//     throw new AppError(404, 'Conversation not found');
//   }
  
//   // If message is from user, send it via WhatsApp
//   if (fromUser && content) {
//     // Get active channel
//     if (!conversation.channelId) {
//       throw new Error("ChannelId is missing");
//     }
//     const channel = await storage.getChannel(conversation.channelId);
//     if (!channel) {
//       throw new AppError(404, 'Channel not found');
//     }
    
//     const whatsappApi = new WhatsAppApiService(channel);
    
//     try {
//       // Send text message via WhatsApp
//       if (!conversation.contactPhone) {
//         throw new Error("Contact phone is missing");
//       }
//       const result = await whatsappApi.sendTextMessage(conversation.contactPhone, content);

//       console.log("sendTextMessage : ===> "  , conversation.contactPhone, content)
      
//       // Create message record with WhatsApp message ID
//       const message = await storage.createMessage({
//         conversationId,
//         fromUser: true,
//         content,
//         status: 'sent',
//         whatsappMessageId: result.messages?.[0]?.id
//       });

//       console.log("Req body : ===> "  , {lastMessageAt: new Date(),
//         lastMessageText:content})
      
//       // Update conversation's last message
//       await storage.updateConversation(conversationId, {
//         lastMessageAt: new Date(),
//         lastMessageText:content
//       });
      
//       // Broadcast new message to WebSocket clients
//       if ((global as any).broadcastToConversation) {
//         (global as any).broadcastToConversation(conversationId, {
//           type: 'new-message',
//           message
//         });
//       }
      
//       res.json(message);
//     } catch (error) {
//       console.error('Error sending WhatsApp message:', error);
//       throw new AppError(500, error instanceof Error ? error.message : 'Failed to send message');
//     }
//   } else {
//     // Just create message record (for incoming messages)
//     const validatedMessage = insertMessageSchema.parse({
//       ...req.body,
//       conversationId
//     });
    
//     const message = await storage.createMessage(validatedMessage);

//       // 🎯 TRIGGER MESSAGE-BASED AUTOMATIONS


//   try {

//     if (!conversation.channelId) {
//       throw new Error("ChannelId is missing");
//     }
//     if (!conversation.contactId) {
//       throw new Error("contactId is missing");
//     }
//     await triggerService.handleMessageReceived(
//       conversationId,
//       message,
//       conversation.channelId,
//       conversation.contactId
//     );
//     console.log(`Triggered automations for message: ${message.id}`);
//   } catch (error) {
//     console.error(`Failed to trigger message automations:`, error);
//     // Don't fail message handling if automation fails
//   }
    
//     // Update conversation's last message
//     await storage.updateConversation(conversationId, {
//       lastMessageAt: new Date(),
//         lastMessageText:content
//     });
    
//     // Broadcast new message to WebSocket clients
//     if ((global as any).broadcastToConversation) {
//       (global as any).broadcastToConversation(conversationId, {
//         type: 'new-message',
//         message
//       });
//     }
    
//     res.json(message);
//   }
// });


export const createMessage = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const { content, fromUser, caption, templateName, parameters } = req.body;
  const file = (req as any).file; // multer populated file if uploaded

  // Get conversation
  const conversation = await storage.getConversation(conversationId);
  if (!conversation) throw new AppError(404, "Conversation not found");

  let msgBody = content;
  let messageType = "text";
  let result: any = null;
  let mediaId: string | null = null;
  let mediaUrl: string | null = null;

  // If message is from user, push it to WhatsApp
  if (fromUser) {
    if (!conversation.channelId) throw new Error("ChannelId is missing");
    if (!conversation.contactPhone) throw new Error("Contact phone is missing");

    const channel = await storage.getChannel(conversation.channelId);
    if (!channel) throw new AppError(404, "Channel not found");

    const whatsappApi = new WhatsAppApiService(channel);

    try {
      if (templateName) {
        // Send template
        result = await whatsappApi.sendMessage(conversation.contactPhone, templateName, parameters || []);
        const newMsg = await storage.getTemplatesByName(templateName);
        msgBody = newMsg[0]?.body || `[template: ${templateName}]`;
        messageType = "template";
      } else if (file) {
        // Upload + send media
        const mimeType = file.mimetype;
        console.log("Uploading media with mimetype:", file.path, mimeType);
        
        // Upload media and get WhatsApp media ID
        mediaId = await whatsappApi.uploadMedia(file.path, mimeType);
        console.log("Media uploaded successfully, ID:", mediaId);

        // Get media URL from WhatsApp for display purposes
        try {
          mediaUrl = await whatsappApi.getMediaUrl(mediaId);
          console.log("Media URL retrieved:", mediaUrl);
        } catch (error) {
          console.warn("Failed to get media URL:", error);
          // Continue without URL - we still have the mediaId
        }

        if (mimeType.startsWith("image")) messageType = "image";
        else if (mimeType.startsWith("video")) messageType = "video";
        else if (mimeType.startsWith("audio")) messageType = "audio";
        else messageType = "document";

        result = await whatsappApi.sendMediaMessage(
          conversation.contactPhone,
          mediaId,
          messageType as any,
          caption || content
        );
        msgBody = caption || `[${messageType}]`;
      } else {
        // Plain text
        result = await whatsappApi.sendTextMessage(conversation.contactPhone, content);
        msgBody = content;
        messageType = "text";
      }

      // Save message with media information
      const message = await storage.createMessage({
        conversationId,
        fromUser: true,
        content: msgBody,
        status: "sent",
        whatsappMessageId: result?.messages?.[0]?.id,
        messageType,
        type: messageType, // Ensure both fields are set
        mediaId: mediaId || undefined,
        mediaUrl: mediaUrl || undefined,
        mediaMimeType: file?.mimetype || undefined,
        metadata: file
          ? { 
              mimeType: file.mimetype, 
              originalName: file.originalname,
              filePath: file.path,
              fileSize: file.size
            }
          : {}
      });

      await storage.updateConversation(conversationId, {
        lastMessageAt: new Date(),
        lastMessageText: msgBody
      });

      if ((global as any).broadcastToConversation) {
        (global as any).broadcastToConversation(conversationId, {
          type: "new-message",
          message
        });
      }

      return res.json(message);
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      throw new AppError(500, error instanceof Error ? error.message : "Failed to send message");
    }
  } else {
    // Incoming message flow
    const validatedMessage = insertMessageSchema.parse({
      ...req.body,
      conversationId
    });

    const message = await storage.createMessage(validatedMessage);

    // Trigger automations
    try {
      if (!conversation.channelId) throw new Error("ChannelId is missing");
      if (!conversation.contactId) throw new Error("contactId is missing");

      await triggerService.handleMessageReceived(
        conversationId,
        message,
        conversation.channelId,
        conversation.contactId
      );
      console.log(`Triggered automations for message: ${message.id}`);
    } catch (error) {
      console.error("Failed to trigger message automations:", error);
    }

    await storage.updateConversation(conversationId, {
      lastMessageAt: new Date(),
      lastMessageText: msgBody
    });

    if ((global as any).broadcastToConversation) {
      (global as any).broadcastToConversation(conversationId, {
        type: "new-message",
        message
      });
    }

    return res.json(message);
  }
});


export const getMediaById = asyncHandler(async (req: Request, res: Response) => {
  const { messageId } = req.params;

  // Get message with media info
  const message = await storage.getMessage(messageId);
  if (!message) {
    throw new AppError(404, "Message not found");
  }

  if (!message.mediaId) {
    throw new AppError(404, "No media found for this message");
  }

  // Get conversation to access channel info
  const conversation = await storage.getConversation(message.conversationId);
  if (!conversation || !conversation.channelId) {
    throw new AppError(404, "Conversation or channel not found");
  }

  const channel = await storage.getChannel(conversation.channelId);
  if (!channel) {
    throw new AppError(404, "Channel not found");
  }

  try {
    const whatsappApi = new WhatsAppApiService(channel);
    
    // If we don't have the URL cached, fetch it
    let mediaUrl = message.mediaUrl;
    if (!mediaUrl) {
      mediaUrl = await whatsappApi.getMediaUrl(message.mediaId);
      
      // Update message with the URL for future use
      await storage.updateMessage(messageId, { mediaUrl });
    }

    // Fetch the actual media content
    const mediaResponse = await fetch(mediaUrl, {
      headers: {
        Authorization: `Bearer ${channel.accessToken}`,
      },
    });

    if (!mediaResponse.ok) {
      throw new AppError(500, "Failed to fetch media from WhatsApp");
    }

    // Set appropriate headers
    const contentType = message.mediaMimeType || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

    // Stream the media content
    const arrayBuffer = await mediaResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    res.send(buffer);
  } catch (error) {
    console.error("Error serving media:", error);
    throw new AppError(500, "Failed to serve media");
  }
});

// Get media URL without downloading
export const getMediaUrl = asyncHandler(async (req: Request, res: Response) => {
  const { messageId } = req.params;

  const message = await storage.getMessage(messageId);
  if (!message || !message.mediaId) {
    throw new AppError(404, "Message or media not found");
  }

  // Return cached URL if available
  if (message.mediaUrl) {
    return res.json({ url: `/api/media/${messageId}`, whatsappUrl: message.mediaUrl });
  }

  // Get fresh URL from WhatsApp
  const conversation = await storage.getConversation(message.conversationId);
  const channel = await storage.getChannel(conversation!.channelId!);
  const whatsappApi = new WhatsAppApiService(channel!);

  try {
    const mediaUrl = await whatsappApi.getMediaUrl(message.mediaId);
    
    // Update message with the URL
    await storage.updateMessage(messageId, { mediaUrl });

    res.json({ 
      url: `/api/media/${messageId}`, 
      whatsappUrl: mediaUrl 
    });
  } catch (error) {
    console.error("Error getting media URL:", error);
    throw new AppError(500, "Failed to get media URL");
  }
});


export const sendMessage = asyncHandler(async (req: RequestWithChannel, res: Response) => {
  const { to, message, templateName, parameters, channelId: bodyChannelId, caption, type } = req.body;
  const file = (req as any).file; // multer adds this

  // Get channel
  let channelId = bodyChannelId;
  if (!channelId) {
    const activeChannel = await storage.getActiveChannel();
    if (!activeChannel) {
      throw new AppError(400, "No active channel found. Please select a channel.");
    }
    channelId = activeChannel.id;
  }

  const channel = await storage.getChannel(channelId);
  if (!channel) throw new AppError(404, "Channel not found");

  const whatsappApi = new WhatsAppApiService(channel);

  let result;
  let msgBody = message;
  let messageType = "text";

  if (templateName) {
    // Send template
    result = await whatsappApi.sendMessage(to, templateName, parameters || []);
    const newMsg = await storage.getTemplatesByName(templateName);
    msgBody = newMsg[0].body;
    messageType = "template";
  } else if (file) {
    // Handle media upload + send
    const mimeType = file.mimetype;
    const mediaId = await whatsappApi.uploadMedia(file.path, mimeType);

    // detect type automatically from mimetype
    if (mimeType.startsWith("image")) messageType = "image";
    else if (mimeType.startsWith("video")) messageType = "video";
    else if (mimeType.startsWith("audio")) messageType = "audio";
    else messageType = "document";

    result = await whatsappApi.sendMediaMessage(to, mediaId, messageType as any, caption || message);
    msgBody = caption || `[${messageType}]`;
  } else {
    // Text
    result = await whatsappApi.sendTextMessage(to, message);
    msgBody = message;
    messageType = "text";
  }

  // Conversation / contact logic (same as before)
  let conversation = await storage.getConversationByPhone(to);
  if (!conversation) {
    let contact = await storage.getContactByPhone(to);
    if (!contact) {
      contact = await storage.createContact({ name: to, phone: to, channelId });
    }
    conversation = await storage.createConversation({
      contactId: contact.id,
      contactPhone: to,
      contactName: contact.name || to,
      channelId,
      unreadCount: 0
    });
  }

  const createdMessage = await storage.createMessage({
    conversationId: conversation.id,
    content: msgBody,
    status: "sent",
    whatsappMessageId: result.messages?.[0]?.id,
    messageType: messageType,
    metadata: file ? { mimeType: file.mimetype, originalName: file.originalname } : {}
  });

  await storage.updateConversation(conversation.id, {
    lastMessageAt: new Date(),
    lastMessageText: msgBody,
  });

  if ((global as any).broadcastToConversation) {
    (global as any).broadcastToConversation(conversation.id, {
      type: "new-message",
      message: createdMessage
    });
  }

  res.json({
    success: true,
    messageId: result.messages?.[0]?.id,
    conversationId: conversation.id
  });
});


// export const sendMessage = asyncHandler(async (req: RequestWithChannel, res: Response) => {
//   const { to, message, templateName, parameters, channelId: bodyChannelId } = req.body;
  
//   // Get channelId from body or active channel
//   let channelId = bodyChannelId;
//   if (!channelId) {
//     const activeChannel = await storage.getActiveChannel();
//     if (!activeChannel) {
//       throw new AppError(400, 'No active channel found. Please select a channel.');
//     }
//     channelId = activeChannel.id;
//   }
  
//   const channel = await storage.getChannel(channelId);
//   if (!channel) {
//     throw new AppError(404, 'Channel not found');
//   }
  
//   const whatsappApi = new WhatsAppApiService(channel);
  
//   try {
//     let result;
//     if (templateName) {
//       // Send template message
//       result = await whatsappApi.sendMessage(to, templateName, parameters || []);
//     } else {
//       // Send text message
//       result = await whatsappApi.sendTextMessage(to, message);
//     }
    
//     // Find or create conversation
//     let conversation = await storage.getConversationByPhone(to);
//     if (!conversation) {
//       // Find or create contact first
//       let contact = await storage.getContactByPhone(to);
//       if (!contact) {
//         contact = await storage.createContact({
//           name: to,
//           phone: to,
//           channelId
//         });
//       }
      
//       conversation = await storage.createConversation({
//         contactId: contact.id,
//         contactPhone: to,
//         contactName: contact.name || to,
//         channelId,
//         unreadCount: 0
//       });
//     }


//    let newMsg =  await storage.getTemplatesByName(templateName)
    
//     // Create message record
//     const createdMessage = await storage.createMessage({
//       conversationId: conversation.id,
//       content: message || newMsg[0].body,
//       status: 'sent',
//       whatsappMessageId: result.messages?.[0]?.id
//     });

//         // Update conversation's last message
//         await storage.updateConversation(conversation.id, {
//           lastMessageAt: new Date(),
//             lastMessageText: message ||  newMsg[0].body,
//         });
    
//     // Broadcast new message to WebSocket clients
//     if ((global as any).broadcastToConversation) {
//       (global as any).broadcastToConversation(conversation.id, {
//         type: 'new-message',
//         message: createdMessage
//       });
//     }
    
//     res.json({
//       success: true,
//       messageId: result.messages?.[0]?.id,
//       conversationId: conversation.id
//     });
//   } catch (error) {
//     console.error('Error sending message:', error);
//     throw new AppError(500, error instanceof Error ? error.message : 'Failed to send message');
//   }
// });