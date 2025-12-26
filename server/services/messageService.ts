// import { storage } from '../storage';
// import { AppError } from '../middlewares/error.middleware';
// import { WhatsAppApiService } from '../services/whatsapp-api';

// export async function sendBusinessMessage({ to, message, templateName, parameters, channelId, conversationId }: {
//     to: string;
//     message?: string;
//     templateName?: string;
//     parameters?: any[];
//     channelId?: string;
//     conversationId?: string;  // ✅ allow explicit conversation link
//   }) {
//   // Get channelId (or fallback to active channel)
//   if (!channelId) {
//     const activeChannel = await storage.getActiveChannel();
//     if (!activeChannel) {
//       throw new AppError(400, "No active channel found. Please select a channel.");
//     }
//     channelId = activeChannel.id;
//   }

//   const channel = await storage.getChannel(channelId);
//   if (!channel) {
//     throw new AppError(404, "Channel not found");
//   }
// console.log('Sending message via channel:', channelId, 'to:', to);
//   const whatsappApi = new WhatsAppApiService(channel);

//   // Send via WhatsApp API
//   let result;
//   if (templateName) {
//     // console.log('Sending template message:', templateName, 'with parameters:', parameters);
//     result = await whatsappApi.sendMessage(to, templateName, parameters || []);
//   } else {
//     // console.log('Sending text message:', message);
//     result = await whatsappApi.sendTextMessage(to, message|| "Test message");
//   }
// console.log('WhatsApp API result:', result);
//   // Find or create conversation
//   let conversation = conversationId
//     ? await storage.getConversation(conversationId)
//     : await storage.getConversationByPhone(to);
// // console.log('Using conversation:', conversation?.id);
//   if (!conversation) {
//     let contact = await storage.getContactByPhone(to);
//     if (!contact) {
//       contact = await storage.createContact({
//         name: to,
//         phone: to,
//         channelId,
//       });
//     }

//     conversation = await storage.createConversation({
//       contactId: contact.id,
//       contactPhone: to,
//       contactName: contact.name || to,
//       channelId,
//       unreadCount: 0,
//     });
//   }

//   let newMsg = templateName ? (await storage.getTemplatesByName(templateName))[0] : null;

// console.log('Using template for message body:',{
//     conversationId: conversation.id,
//     content: message || newMsg?.body,
//     sender: "business",
//     status: "sent",
//     whatsappMessageId: result.messages?.[0]?.id,
//   });
//   // Save message
//   const createdMessage = await storage.createMessage({
//     conversationId: conversation.id,
//     content: message ?? newMsg?.body ?? "",
//     status: "sent",
//     whatsappMessageId: result.messages?.[0]?.id,
//   });

  
// // console.log('Created message:', createdMessage);
//   // Update conversation last message
//   await storage.updateConversation(conversation.id, {
//     lastMessageAt: new Date(),
//     lastMessageText: message || newMsg?.body,
//   });

//   // Broadcast to websocket
//   if ((global as any).broadcastToConversation) {
//     (global as any).broadcastToConversation(conversation.id, {
//       type: "new-message",
//       message: createdMessage,
//     });
//   }
// console.log('Broadcasted new message to conversation:', conversation.id);
// // console.log('sendBusinessMessage completed successfully' , {    success: true,
// // messageId: result.messages?.[0]?.id,
// // conversationId: conversation.id,
// // createdMessage});
//   return {
//     success: true,
//     messageId: result.messages?.[0]?.id,
//     conversationId: conversation.id,
//     createdMessage,
//   };
// }



import { storage } from "../storage";
import { AppError } from "../middlewares/error.middleware";

export async function sendBusinessMessage({
  to,
  message,
  templateName,
  parameters,
  mediaId,
  channelId,
  conversationId,
}: {
  to: string;
  message?: string;
  templateName?: string;
  parameters?: string[];
  mediaId?: string | null;
  channelId?: string;
  conversationId?: string;
}) {
  /* ───── Resolve channel ───── */
  if (!channelId) {
    const active = await storage.getActiveChannel();
    if (!active) throw new AppError(400, "No active channel");
    channelId = active.id;
  }

  const channel = await storage.getChannel(channelId);
  if (!channel) throw new AppError(404, "Channel not found");

  let result;
  let sentText = message || "";

  /* ───────── TEMPLATE MESSAGE ───────── */
  if (templateName) {
    const components: any[] = [];

    // HEADER IMAGE
    if (mediaId) {
      components.push({
        type: "header",
        parameters: [
          {
            type: "image",
            image: { id: mediaId },
          },
        ],
      });
    }

    // BODY VARIABLES
    if (parameters && parameters.length > 0) {
      components.push({
        type: "body",
        parameters: parameters.map((val) => ({
          type: "text",
          text: String(val),
        })),
      });
    }

    const payload = {
      messaging_product: "whatsapp",
      to: to.replace(/\D/g, ""),
      type: "template",
      template: {
        name: templateName,
        language: { code: "en_US" },
        ...(components.length > 0 ? { components } : {}), // ✅ SAFE
      },
    };

    console.log(
      "🚀 FINAL WhatsApp TEMPLATE PAYLOAD:",
      JSON.stringify(payload, null, 2)
    );

    const response = await fetch(
      `https://graph.facebook.com/v23.0/${channel.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${channel.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      console.error("WhatsApp API Error:", err);
      throw new Error(err.error?.message || "Template send failed");
    }

    result = await response.json();
    sentText = templateName; // fallback for conversation
  }

  /* ───────── TEXT MESSAGE ───────── */
  else {
    const payload = {
      messaging_product: "whatsapp",
      to: to.replace(/\D/g, ""),
      type: "text",
      text: { body: message || "Test message" },
    };

    const response = await fetch(
      `https://graph.facebook.com/v23.0/${channel.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${channel.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Text send failed");
    }

    result = await response.json();
  }

  /* ───── Conversation handling ───── */
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

  const createdMessage = await storage.createMessage({
    conversationId: conversation.id,
    content: sentText, // ✅ FIXED
    status: "sent",
    whatsappMessageId: result.messages?.[0]?.id,
  });

  await storage.updateConversation(conversation.id, {
    lastMessageAt: new Date(),
    lastMessageText: sentText,
  });

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
  };
}
