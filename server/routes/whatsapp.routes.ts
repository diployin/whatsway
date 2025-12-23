import type { Express } from "express";
import { storage } from "../storage";
import { insertWhatsappChannelSchema } from "@shared/schema";
import { WhatsAppApiService } from "../services/whatsapp-api";
import { channelHealthMonitor } from "server/cron/channel-health-monitor";
import { handleDigitalOceanUpload, upload } from "../middlewares/upload.middleware";
import fs from "fs";

export function registerWhatsAppRoutes(app: Express) {
  // Get all WhatsApp channels
  app.get("/api/whatsapp/channels", async (req, res) => {
    try {
      const channels = await storage.getActiveChannel();
      res.json(channels);
    } catch (error) {
      console.error("Error fetching WhatsApp channels:", error);
      res.status(500).json({ message: "Failed to fetch WhatsApp channels" });
    }
  });

  // Get single WhatsApp channel
  app.get("/api/whatsapp/channels/:id", async (req, res) => {
    try {
      const channel = await storage.getWhatsappChannel(req.params.id);
      if (!channel) {
        return res.status(404).json({ message: "WhatsApp channel not found" });
      }
      res.json(channel);
    } catch (error) {
      console.error("Error fetching WhatsApp channel:", error);
      res.status(500).json({ message: "Failed to fetch WhatsApp channel" });
    }
  });

  // Create WhatsApp channel
  app.post("/api/whatsapp/channels", async (req, res) => {
    try {
      const data = insertWhatsappChannelSchema.parse(req.body);
      const channel = await storage.createWhatsappChannel(data);
      res.status(201).json(channel);
    } catch (error) {
      console.error("Error creating WhatsApp channel:", error);
      res.status(500).json({ message: "Failed to create WhatsApp channel" });
    }
  });

  // Update WhatsApp channel
  app.put("/api/whatsapp/channels/:id", async (req, res) => {
    try {
      const channel = await storage.updateWhatsappChannel(req.params.id, req.body);
      if (!channel) {
        return res.status(404).json({ message: "WhatsApp channel not found" });
      }
      res.json(channel);
    } catch (error) {
      console.error("Error updating WhatsApp channel:", error);
      res.status(500).json({ message: "Failed to update WhatsApp channel" });
    }
  });

  // Delete WhatsApp channel
  app.delete("/api/whatsapp/channels/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteChannel(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "WhatsApp channel not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting WhatsApp channel:", error);
      res.status(500).json({ message: "Failed to delete WhatsApp channel" });
    }
  });

  // Send WhatsApp message
  // app.post("/api/whatsapp/channels/:id/send", async (req, res) => {
  //   try {


  //     console.log("Req params.id : ===> "  , req.params.id)

  //     // Get the regular channel first
  //     const channel = await storage.getChannel(req.params.id);
  //     if (!channel) {
  //       return res.status(404).json({ message: "Channel not found" });
  //     }
      
  //     // Ensure channel has WhatsApp credentials
  //     if (!channel.phoneNumberId || !channel.accessToken) {
  //       return res.status(400).json({ message: "Channel is not configured for WhatsApp" });
  //     }

  //     const { to, type, message, templateName, templateLanguage, templateVariables } = req.body;
      

  //     console.log("Req body : ===> "  , req.body)


  //     // Build WhatsApp message payload
  //     let payload: any;

  //     let newMsg = null

  //     if (type === "template") {
  //       payload = {
  //         to,
  //         type: "template",
  //         template: {
  //           name: templateName,
  //           language: {
  //             code: templateLanguage || "en"
  //           }
  //         }
  //       };

  //       newMsg =  (await storage.getTemplatesByName(templateName))[0] ?? null

  //     // return  console.log("New msg ==>" , newMsg?.body)
        
  //       // Add template parameters if provided
  //       if (templateVariables && templateVariables.length > 0) {
  //         payload.template.components = [
  //           {
  //             type: "body",
  //             parameters: templateVariables.map((value: string) => ({
  //               type: "text",
  //               text: value
  //             }))
  //           }
  //         ];
  //       }
  //     } else {
  //       payload = {
  //         to,
  //         type: "text",
  //         text: {
  //           body: message
  //         }
  //       };
  //     }
      
  //     // Send message using WhatsApp API service instance
  //     const whatsappApi = new WhatsAppApiService(channel);
  //     const result = await whatsappApi.sendDirectMessage(payload);

  //     if (result.success && result.data) {
  //       // Save the message to database
  //       const messageId = result.data.messages?.[0]?.id;
        
  //       // Find or create contact
  //       const contacts = await storage.searchContacts(to);
  //       let contact = contacts.find(c => c.phone === to);
        
  //       if (!contact) {
  //         // Create new contact if doesn't exist
  //         contact = await storage.createContact({
  //           name: to,
  //           phone: to,
  //           email: "",
  //           channelId: channel.id,
  //           status: "active",
  //         });
  //       }
        
  //       console.log("conversation start ===> "  , req.body)

        
  //       // Find or create conversation
  //       let conversation = await storage.getConversationByPhone(to);
  //       console.log("conversation mid ===> "  ,conversation)
  //       if (!conversation) {
  //         conversation = await storage.createConversation({
  //           channelId: channel.id,
  //           contactId: contact.id,
  //           contactPhone: to,
  //           contactName: contact.name,
  //           status: "active",
  //           lastMessageAt: new Date(),
  //           lastMessageText: newMsg?.body || null
  //         });
  //       }
  //       console.log("conversation end ===> ")
        
  //       // Create message record
  //       await storage.createMessage({
  //         conversationId: conversation.id,
  //         content: type === "text" ? message : newMsg?.body,
  //         direction: "outgoing",
  //         type: type,
  //         status: "sent",
  //         whatsappMessageId: messageId || undefined,
  //       });
        
  //       console.log("updateConversation : ===> "  , {lastMessageAt: new Date(),
  //         lastMessageText:  newMsg?.body})


  //       // Update conversation last message time
  //       await storage.updateConversation(conversation.id, {
  //         lastMessageAt: new Date(),
  //         lastMessageText:  newMsg?.body || null
  //       });
        
  //       res.json({ 
  //         success: true, 
  //         messageId: messageId,
  //         message: "Message sent successfully" 
  //       });
  //     } else {
  //       res.status(400).json({ 
  //         success: false, 
  //         message: result.error || "Failed to send message" 
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error sending WhatsApp message:", error);
  //     res.status(500).json({ message: "Failed to send WhatsApp message" });
  //   }
  // });



//   app.post("/api/whatsapp/channels/:id/send", async (req, res) => {
//   try {
//     console.log("Req params.id : ===>", req.params.id);
//     console.log("Req body : ===>", req.body);

//     const channel = await storage.getChannel(req.params.id);
//     if (!channel) {
//       return res.status(404).json({ message: "Channel not found" });
//     }

//     if (!channel.phoneNumberId || !channel.accessToken) {
//       return res
//         .status(400)
//         .json({ message: "Channel is not configured for WhatsApp" });
//     }

//     let {
//       to,
//       type,
//       message,
//       templateName,
//       templateLanguage,
//       templateVariables,
//     } = req.body;

//     // 🔥 STATIC FALLBACK (IMPORTANT)
//     if (type === "template") {
//       if (!Array.isArray(templateVariables) || templateVariables.length === 0) {
//         templateVariables = ["Ram"]; // 👈 static value
//       }
//     }

//     let payload: any;
//     let newMsg = null;

//     const whatsappApi = new WhatsAppApiService(channel);

//     // ================= TEMPLATE =================
//     if (type === "template") {
//       payload = {
//         messaging_product: "whatsapp",
//         to,
//         type: "template",
//         template: {
//           name: templateName,
//           language: {
//             code: templateLanguage || "en_US",
//           },
//           components: [
//             {
//               type: "body",
//               parameters: templateVariables.map((value: string) => ({
//                 type: "text",
//                 text: value,
//               })),
//             },
//           ],
//         },
//       };

//       // optional preview text
//       newMsg = templateVariables.join(" ");
//     }

//     // ================= TEXT =================
//     else {
//       payload = {
//         messaging_product: "whatsapp",
//         to,
//         type: "text",
//         text: { body: message },
//       };

//       newMsg = message;
//     }

//     console.log(
//       "📤 Sending WhatsApp payload:",
//       JSON.stringify(payload, null, 2)
//     );

//     // ================= SEND =================
//     const result = await whatsappApi.sendDirectMessage(payload);

//     if (!result.success || !result.data) {
//       return res.status(400).json({
//         success: false,
//         message: result.error || "Failed to send message",
//       });
//     }

//     const messageId = result.data.messages?.[0]?.id;

//     // ================= CONTACT =================
//     const contacts = await storage.searchContacts(to);
//     let contact = contacts.find((c) => c.phone === to);

//     if (!contact) {
//       contact = await storage.createContact({
//         name: to,
//         phone: to,
//         email: "",
//         channelId: channel.id,
//         status: "active",
//       });
//     }

//     // ================= CONVERSATION =================
//     let conversation = await storage.getConversationByPhone(to);

//     if (!conversation) {
//       conversation = await storage.createConversation({
//         channelId: channel.id,
//         contactId: contact.id,
//         contactPhone: to,
//         contactName: contact.name,
//         status: "active",
//         lastMessageAt: new Date(),
//         lastMessageText: newMsg,
//       });
//     }

//     await storage.createMessage({
//       conversationId: conversation.id,
//       content: newMsg,
//       direction: "outgoing",
//       type,
//       status: "sent",
//       whatsappMessageId: messageId,
//     });

//     await storage.updateConversation(conversation.id, {
//       lastMessageAt: new Date(),
//       lastMessageText: newMsg,
//     });

//     return res.json({
//       success: true, 
//       messageId,
//       message: "Message sent successfully",
//     });
//   } catch (error: any) {
//     console.error("❌ Error sending WhatsApp message:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to send WhatsApp message",
//     });
//   }
// });


app.post("/api/whatsapp/channels/:id/send", async (req, res) => {
  try {
    console.log("🚀 SEND MESSAGE REQUEST");
    console.log("📝 Req params.id:", req.params.id);
    console.log("📦 Req body:", JSON.stringify(req.body, null, 2));

    const channel = await storage.getChannel(req.params.id);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    if (!channel.phoneNumberId || !channel.accessToken) {
      return res.status(400).json({
        message: "Channel is not configured for WhatsApp",
      });
    }

    const {
      to,
      type,
      message,
      templateName,
      templateLanguage = "en_US",
      templateVariables = [],
      headerMediaId,
    } = req.body;

    console.log("🖼️ Header Media ID from request:", headerMediaId);

    const whatsappApi = new WhatsAppApiService(channel);

    let payload: any;
    let newMsg: string | null = null;

    // ================= TEMPLATE =================
    if (type === "template") {
      if (!templateName) {
        return res.status(400).json({
          success: false,
          message: "Template name is required",
        });
      }

      const components: any[] = [];

      // 🔥 HEADER COMPONENT (Optional)
      if (headerMediaId) {
        console.log("✅ Adding header component with media ID:", headerMediaId);
        components.push({
          type: "header",
          parameters: [
            {
              type: "image",
              image: {
                id: headerMediaId,
              },
            },
          ],
        });
      }

      // 🔥 BODY VARIABLES (Optional)
      if (Array.isArray(templateVariables) && templateVariables.length > 0) {
        console.log("✅ Adding body component with variables:", templateVariables);
        components.push({
          type: "body",
          parameters: templateVariables.map((value: string) => ({
            type: "text",
            text: value,
          })),
        });
      }

      // ✅ Build template payload
      // If no components (simple template), send without components array
      payload = {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: templateLanguage,
          },
          ...(components.length > 0 && { components }), // ✅ Only add if components exist
        },
      };

      newMsg =
        templateVariables.length > 0
          ? templateVariables.join(" ")
          : templateName;
      
      console.log("📝 Template message content:", newMsg);
    }

    // ================= TEXT =================
    else {
      payload = {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: {
          body: message,
        },
      };
      newMsg = message;
    }

    console.log(
      "📤 FINAL WHATSAPP PAYLOAD:",
      JSON.stringify(payload, null, 2)
    );

    // ================= SEND =================
    const result = await whatsappApi.sendDirectMessage(payload);

    if (!result.success || !result.data) {
      console.error("❌ WhatsApp API error:", result.error);
      return res.status(400).json({
        success: false,
        message: result.error || "Failed to send message",
      });
    }

    console.log("✅ WhatsApp message sent:", result.data);

    const messageId = result.data.messages?.[0]?.id;

    // ================= CONTACT =================
    let contact =
      (await storage.searchContacts(to)).find((c) => c.phone === to) ||
      (await storage.createContact({
        name: to,
        phone: to,
        email: "",
        channelId: channel.id,
        status: "active",
      }));

    // ================= CONVERSATION =================
    let conversation = await storage.getConversationByPhone(to);

    if (!conversation) {
      conversation = await storage.createConversation({
        channelId: channel.id,
        contactId: contact.id,
        contactPhone: to,
        contactName: contact.name,
        status: "active",
        lastMessageAt: new Date(),
        lastMessageText: newMsg,
      });
    }

    await storage.createMessage({
      conversationId: conversation.id,
      content: newMsg,
      direction: "outgoing",
      type,
      status: "sent",
      whatsappMessageId: messageId,
    });

    await storage.updateConversation(conversation.id, {
      lastMessageAt: new Date(),
      lastMessageText: newMsg,
    });

    return res.json({
      success: true,
      messageId,
      message: "Message sent successfully",
    });
  } catch (error: any) {
    console.error("❌ Error sending WhatsApp message:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send WhatsApp message",
    });
  }
});


app.get(
  "/api/whatsapp/templates/:templateId/meta",
  async (req, res) => {
    try {
      const { templateId } = req.params;
      const channelId = req.query.channelId as string;

      const channel = await storage.getChannel(channelId);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }

      const response = await fetch(
        `https://graph.facebook.com/v19.0/${templateId}`,
        {
          headers: {
            Authorization: `Bearer ${channel.accessToken}`,
          },
        }
      );

      const meta = await response.json();

      // 🔥 Extract REQUIRED INFO
      let headerType: string | null = null;
      let bodyText = "";
      let bodyVariables = 0;

      for (const c of meta.components || []) {
        if (c.type === "HEADER") {
          headerType = c.format; // IMAGE / TEXT
        }

        if (c.type === "BODY") {
          bodyText = c.text || "";
          bodyVariables =
            (bodyText.match(/\{\{\d+\}\}/g) || []).length;
        }
      }

      return res.json({
        id: meta.id,
        name: meta.name,
        headerType,        // 🔥 IMPORTANT
        body: bodyText,
        bodyVariables,
        language: meta.language,
        status: meta.status,
        category: meta.category,
      });
    } catch (err) {
      console.error("Template meta error:", err);
      res.status(500).json({ message: "Failed to fetch template meta" });
    }
  }
);




// image upload for header

app.post(
  "/api/whatsapp/channels/:id/upload-image",
  upload.fields([{ name: "mediaFile", maxCount: 1 }]),
  async (req, res) => {
    try {
      console.log("📥 Upload image request");

      const channel = await storage.getChannel(req.params.id);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }

      if (!channel.phoneNumberId || !channel.accessToken) {
        return res.status(400).json({
          message: "Channel is not configured for WhatsApp",
        });
      }

      // 🔥 multer.fields output handling
      const mediaFile =
        Array.isArray(req.files?.mediaFile)
          ? req.files.mediaFile[0]
          : null;

      if (!mediaFile) {
        return res.status(400).json({
          message: "mediaFile (image) is required",
        });
      }

      console.log("📁 Image:", mediaFile.originalname);

      const buffer = fs.readFileSync(mediaFile.path);

      const whatsappApi = new WhatsAppApiService(channel);

      // 🔥 Upload image to WhatsApp Media API
      const mediaId = await whatsappApi.uploadMediaBufferHeader(
        buffer,
        mediaFile.mimetype,
        mediaFile.originalname
      );

      // optional cleanup
      fs.unlinkSync(mediaFile.path);

      return res.json({
        success: true,
        mediaId, // 👈 TEMPLATE HEADER IMAGE ID
        message: "Image uploaded successfully",
      });
    } catch (error: any) {
      console.error("❌ Image upload error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to upload image",
      });
    }
  }
);


// image upload for header



  // Test WhatsApp connection
  app.post("/api/whatsapp/channels/:id/test", async (req, res) => {
    try {
      const channel = await storage.getChannel(req.params.id);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      
      if (!channel.phoneNumberId || !channel.accessToken) {
        return res.status(400).json({ message: "Channel is not configured for WhatsApp" });
      }

      const testPhone = req.body.phoneNumber || "919310797700"; // Default test number
      
      // Test connection by sending hello_world template
      const result = await WhatsAppApiService.sendTemplateMessage(
        channel,
        testPhone,
        "hello_world",
        [],
        "en_US",
        false // not marketing
      );

      // Log the API request
      await storage.createApiLog({
        channelId: channel.id,
        requestType: "test_connection",
        endpoint: `https://graph.facebook.com/v22.0/${channel.phoneNumberId}/messages`,
        method: "POST",
        requestBody: {
          messaging_product: "whatsapp",
          to: testPhone,
          type: "template",
          template: {
            name: "hello_world",
            language: { code: "en_US" }
          }
        },
        responseStatus: 200,
        responseBody: result,
        duration: 0
      });

      res.json({ success: true, message: "Test message sent successfully", result });
    } catch (error) {
      console.error("Error testing WhatsApp connection:", error);
      res.status(500).json({ message: "Failed to test WhatsApp connection" });
    }
  });

  // Get WhatsApp channel health
  // app.get("/api/whatsapp/channels/:id/health", async (req, res) => {
  //   try {
  //     const channel = await storage.getWhatsappChannel(req.params.id);
  //     if (!channel) {
  //       return res.status(404).json({ message: "Channel not found" });
  //     }

  //     const result = await channelHealthMonitor.checkChannelHealth(channel);
      
  //     // Update last health check time if health check succeeded
  //     if ('status' in result && result.status === 'active') {
  //       await storage.updateWhatsappChannel(req.params.id, {
  //         lastHealthCheck: new Date(),
  //         status: "active"
  //       });
  //     }

  //     res.json(result);
  //   } catch (error) {
  //     console.error("Error checking WhatsApp channel health:", error);
  //     res.status(500).json({ message: "Failed to check channel health" });
  //   }
  // });

  // Get API logs
  app.get("/api/whatsapp/api-logs", async (req, res) => {
    try {
      const channelId = req.query.channelId as string | undefined;
      const limit = parseInt(req.query.limit as string) || 100;
  
      if (!channelId) {
        return res.status(400).json({ message: "Missing required query parameter: channelId" });
      }
  
      const logs = await storage.getApiLogs(channelId, limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching API logs:", error);
      res.status(500).json({ message: "Failed to fetch API logs" });
    }
  });  
}