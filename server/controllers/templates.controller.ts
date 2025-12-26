import type { Request, Response } from 'express';
import { storage } from '../storage';
import { insertTemplateSchema } from '@shared/schema';
import { AppError, asyncHandler } from '../middlewares/error.middleware';
import { WhatsAppApiService } from '../services/whatsapp-api';
import type { RequestWithChannel } from '../middlewares/channel.middleware';
import fs from "fs";
import sharp from 'sharp';
import { console } from 'inspector';



export const getTemplates = asyncHandler(
  async (req: RequestWithChannel, res: Response) => {
    const channelId = req.query.channelId as string | undefined;

    // Get page & limit from query params
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 100;

    let result;
    console.log("Fetching templates for channelId:", channelId, " page:", page, " limit:", limit);

    if (channelId) {
      // Agar channelId diya hai, to get paginated templates by channel
      result = await storage.getTemplatesByChannel(channelId, page, limit);
    } else {
      // Else, get all templates paginated
      result = await storage.getTemplates(page, limit);
    }

    // Return paginated response structure
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }
);



export const getTemplatesByUser = asyncHandler(async (req: RequestWithChannel, res: Response) => {
  const channelId = req.query.channelId as string;
  const userId = (req.session as any).user.id;
console.log("🚀 Request Params - channelId:", channelId, "userId:", userId);
  if (!channelId) {
    return res.status(400).json({ message: "channelId is required" });
  }

  const templates = await storage.getTemplatesByChannelAndUser(channelId, userId);
  res.json(templates);
});



export const getTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const template = await storage.getTemplate(id);
  if (!template) {
    throw new AppError(404, 'Template not found');
  }
  res.json(template);
});


export const getTemplateByUserID = asyncHandler(async (req: Request, res: Response) => {
  const { userId, page = 1, limit = 10 } = req.body;

  const templates = await storage.getTemplatesByUserId(userId, Number(page), Number(limit));

  if (!templates || templates.data.length === 0) {
    return res.status(404).json({ status: 'error', message: 'Template not found' });
  }

  res.json({
    status: 'success',
    data: templates.data,
    pagination: {
      page: templates.page,
      limit: templates.limit,
      total: templates.total,
      totalPages: Math.ceil(templates.total / templates.limit),
    },
  });
});




export const createTemplate = asyncHandler(
  async (req: RequestWithChannel, res: Response) => {
    /* ------------------------------------------------
       MEDIA FILE (multer.fields compatible)
    ------------------------------------------------ */
    const mediaFile =
      Array.isArray(req.files?.mediaFile) ? req.files.mediaFile[0] : undefined;

    console.log("📦 mediaFile:", mediaFile?.originalname || "none");

    const validatedTemplate = req.body;

    /* ------------------------------------------------
       BASIC NORMALIZATION
    ------------------------------------------------ */
    let category = validatedTemplate.category?.toLowerCase() || "authentication";
    if (!["marketing", "utility", "authentication"].includes(category)) {
      category = "authentication";
    }
    category = category.toUpperCase();

    const mediaType = validatedTemplate.mediaType
      ? validatedTemplate.mediaType.toLowerCase()
      : "text";

    /* ------------------------------------------------
       BODY PLACEHOLDER VALIDATION
    ------------------------------------------------ */
    const placeholderPattern = /\{\{(\d+)\}\}/g;
    const placeholderMatches = Array.from(
      validatedTemplate.body.matchAll(placeholderPattern)
    );

    const placeholders = placeholderMatches
      .map((m) => parseInt(m[1], 10))
      .sort((a, b) => a - b);

    for (let i = 0; i < placeholders.length; i++) {
      if (placeholders[i] !== i + 1) {
        throw new AppError(
          400,
          "Placeholders must be sequential starting from {{1}}"
        );
      }
    }

    /* ------------------------------------------------
       PARSE + VALIDATE SAMPLES
    ------------------------------------------------ */
    let samples: string[] = [];

    if (validatedTemplate.samples) {
      if (typeof validatedTemplate.samples === "string") {
        try {
          samples = JSON.parse(validatedTemplate.samples);
        } catch {
          throw new AppError(400, "Invalid samples format");
        }
      } else if (Array.isArray(validatedTemplate.samples)) {
        samples = validatedTemplate.samples;
      }
    }

    if (placeholders.length > 0) {
      if (samples.length !== placeholders.length) {
        throw new AppError(
          400,
          `Expected ${placeholders.length} sample values, got ${samples.length}`
        );
      }

      if (samples.some((s) => !String(s).trim())) {
        throw new AppError(
          400,
          "Sample values for template variables cannot be empty"
        );
      }
    }

    /* ------------------------------------------------
       CHANNEL + USER (STRICT)
    ------------------------------------------------ */
    const channelId = validatedTemplate.channelId;
    if (!channelId) {
      throw new AppError(400, "channelId is required");
    }

    const createdBy = req.user?.id;
    if (!createdBy) throw new AppError(401, "User not authenticated");

    /* ------------------------------------------------
       SAVE TEMPLATE LOCALLY
    ------------------------------------------------ */
    const template = await storage.createTemplate({
      ...validatedTemplate,
      category,
      channelId,
      status: "pending",
      createdBy,
      mediaType,
      variables: samples,
    });

    const channel = await storage.getChannel(channelId);
    if (!channel) throw new AppError(400, "Channel not found");

    console.log("🗄️ Fetched channel from DB:", {
      id: channel.id,
      phoneNumberId: channel.phoneNumberId,
      accessTokenPrefix: channel.accessToken?.slice(0, 12),
      isActive: channel.isActive,
    });

    /* ------------------------------------------------
       BUILD WHATSAPP COMPONENTS
    ------------------------------------------------ */
    try {
      const whatsappApi = new WhatsAppApiService(channel);
      const components: any[] = [];

      console.log("🔨 Building components from individual fields");
      const isValid = await whatsappApi.verifyPhoneNumberBelongsToWABA();

      if (!isValid) {
        console.warn("⚠️ Warning: Phone Number may not belong to this WABA");
      }

      /* ---------- HEADER ---------- */
      if (mediaType === "text" && validatedTemplate.header) {
        components.push({
          type: "HEADER",
          format: "TEXT",
          text: validatedTemplate.header,
        });
      }

      if (mediaType !== "text") {
        let mediaId: string;
        let headerHandle: string;

        if (mediaFile) {
          console.log("📤 Uploading media file to WhatsApp...");

          if (!mediaFile.path) {
            throw new AppError(
              400,
              "Media file path missing. Disk storage expected."
            );
          }

          const fileBuffer = fs.readFileSync(mediaFile.path);

          // 🔥 Upload media and get both IDs
          console.log("📤 Step 1: Uploading media via Buffer (for sending messages)...");
          mediaId = await whatsappApi.uploadMediaBufferHeader(
            fileBuffer,
            mediaFile.mimetype,
            mediaFile.originalname
          );
          console.log("✅ Media ID obtained:", mediaId);

          console.log("📤 Step 2: Uploading template media (for template creation)...");
          headerHandle = await whatsappApi.uploadTemplateMedia(
            fileBuffer,
            mediaFile.mimetype,
            mediaFile.originalname
          );
          console.log("✅ Header Handle obtained:", headerHandle);

          // 🔥 STORE MEDIA INFO IN DATABASE using existing fields
          await storage.updateTemplate(template.id, {
            mediaHandle: headerHandle, // Store header handle (4::xxx format)
            mediaUrl: mediaId, // Store media ID temporarily (will get actual URL later)
          });

          console.log("💾 Stored media info in database:", {
            mediaHandle: headerHandle,
            mediaUrl: mediaId,
            mediaType: mediaType.toUpperCase(),
          });

        } else {
          throw new AppError(
            400,
            "Media header requires file upload (mediaFile)"
          );
        }

        components.push({
          type: "HEADER",
          format: mediaType.toUpperCase(),
          example: {
            header_handle: [headerHandle],
          },
        });
      }

      /* ---------- BODY ---------- */
      const bodyObj: any = {
        type: "BODY",
        text: validatedTemplate.body,
      };

      if (placeholders.length > 0) {
        bodyObj.example = {
          body_text: [samples],
        };
      }

      components.push(bodyObj);

      /* ---------- FOOTER ---------- */
      if (validatedTemplate.footer) {
        components.push({
          type: "FOOTER",
          text: validatedTemplate.footer,
        });
      }

      /* ---------- BUTTONS ---------- */
      if (validatedTemplate.buttons) {
        let buttons = validatedTemplate.buttons;

        if (typeof buttons === "string") {
          try {
            buttons = JSON.parse(buttons);
          } catch {
            throw new AppError(400, "Invalid buttons format");
          }
        }

        if (Array.isArray(buttons) && buttons.length > 0) {
          components.push({
            type: "BUTTONS",
            buttons: buttons.map((btn: any) => {
              const type =
                btn.type === "URL"
                  ? "URL"
                  : btn.type === "PHONE_NUMBER"
                  ? "PHONE_NUMBER"
                  : "QUICK_REPLY";

              const obj: any = { type, text: btn.text };
              if (type === "URL") obj.url = btn.url;
              if (type === "PHONE_NUMBER")
                obj.phone_number = btn.phoneNumber;
              return obj;
            }),
          });
        }
      }

      /* ---------- FINAL PAYLOAD ---------- */
      const templatePayload = {
        name: validatedTemplate.name,
        category,
        language: validatedTemplate.language,
        components,
      };

      console.log(
        "📤 FINAL WHATSAPP PAYLOAD:",
        JSON.stringify(templatePayload, null, 2)
      );

      const result = await whatsappApi.createTemplate(templatePayload);

      if (result?.id) {
        await storage.updateTemplate(template.id, {
          whatsappTemplateId: result.id,
          status: result.status || "pending",
        });
      }

      return res.json(template);
    } catch (err: any) {
      console.error("❌ Template creation error:", err);
      console.error("❌ Error details:", {
        message: err.message,
        stack: err.stack,
        response: err.response?.data,
      });

      return res.json({
        ...template,
        warning: "Template saved locally but failed to submit to WhatsApp",
        error: err.message,
      });
    }
  }
);



export const createTemplateCORRRECT = asyncHandler(
  async (req: RequestWithChannel, res: Response) => {
    // console.log(
    //   "🚀 Incoming template creation request body:",
    //   JSON.stringify(req.body, null, 2)
    // );

    /* ------------------------------------------------
       MEDIA FILE (multer.fields compatible)
    ------------------------------------------------ */
    const mediaFile =
      Array.isArray(req.files?.mediaFile) ? req.files.mediaFile[0] : undefined;

    console.log("📦 mediaFile:", mediaFile?.originalname || "none");

    const validatedTemplate = req.body;

    /* ------------------------------------------------
       BASIC NORMALIZATION
    ------------------------------------------------ */
    let category = validatedTemplate.category?.toLowerCase() || "authentication";
    if (!["marketing", "utility", "authentication"].includes(category)) {
      category = "authentication";
    }
    category = category.toUpperCase();

    const mediaType = validatedTemplate.mediaType
      ? validatedTemplate.mediaType.toLowerCase()
      : "text";

    /* ------------------------------------------------
       BODY PLACEHOLDER VALIDATION
    ------------------------------------------------ */
    const placeholderPattern = /\{\{(\d+)\}\}/g;
    const placeholderMatches = Array.from(
      validatedTemplate.body.matchAll(placeholderPattern)
    );

    const placeholders = placeholderMatches
      .map((m) => parseInt(m[1], 10))
      .sort((a, b) => a - b);

    for (let i = 0; i < placeholders.length; i++) {
      if (placeholders[i] !== i + 1) {
        throw new AppError(
          400,
          "Placeholders must be sequential starting from {{1}}"
        );
      }
    }

   

    /* ------------------------------------------------
       PARSE + VALIDATE SAMPLES
    ------------------------------------------------ */
    let samples: string[] = [];

    if (validatedTemplate.samples) {
      if (typeof validatedTemplate.samples === "string") {
        try {
          samples = JSON.parse(validatedTemplate.samples);
        } catch {
          throw new AppError(400, "Invalid samples format");
        }
      } else if (Array.isArray(validatedTemplate.samples)) {
        samples = validatedTemplate.samples;
      }
    }

    if (placeholders.length > 0) {
      if (samples.length !== placeholders.length) {
        throw new AppError(
          400,
          `Expected ${placeholders.length} sample values, got ${samples.length}`
        );
      }

      // ❌ empty sample not allowed
      if (samples.some((s) => !String(s).trim())) {
        throw new AppError(
          400,
          "Sample values for template variables cannot be empty"
        );
      }
    }

    /* ------------------------------------------------
       CHANNEL + USER (STRICT)
    ------------------------------------------------ */
    const channelId = validatedTemplate.channelId;
    if (!channelId) {
      throw new AppError(400, "channelId is required");
    }

    const createdBy = req.user?.id;
    if (!createdBy) throw new AppError(401, "User not authenticated");

    /* ------------------------------------------------
       SAVE TEMPLATE LOCALLY
    ------------------------------------------------ */
    const template = await storage.createTemplate({
      ...validatedTemplate,
      category,
      channelId,
      status: "pending",
      createdBy,
    });

    const channel = await storage.getChannel(channelId);
    if (!channel) throw new AppError(400, "Channel not found");

    console.log("🗄️ Fetched channel from DB:", {
      id: channel.id,
      phoneNumberId: channel.phoneNumberId,
      accessTokenPrefix: channel.accessToken?.slice(0, 12),
      isActive: channel.isActive,
      channel
    });

    /* ------------------------------------------------
       BUILD WHATSAPP COMPONENTS
    ------------------------------------------------ */
    try {
      const whatsappApi = new WhatsAppApiService(channel);
      const components: any[] = [];

      console.log("🔨 Building components from individual fields");
       const isValid = await whatsappApi.verifyPhoneNumberBelongsToWABA();
       
      

    if (!isValid) {
      console.warn("⚠️ Warning: Phone Number may not belong to this WABA");
      // Note: Proceed anyway, but log the warning
    }

      /* ---------- HEADER ---------- */
if (mediaType === "text" && validatedTemplate.header) {
  components.push({
    type: "HEADER",
    format: "TEXT",
    text: validatedTemplate.header,
  });
}

if (mediaType !== "text") {
  let mediaId: string;

  if (mediaFile) {
    console.log("📤 Uploading media file to WhatsApp (template upload)...");

    if (!mediaFile.path) {
      throw new AppError(
        400,
        "Media file path missing. Disk storage expected."
      );
    }

    const fileBuffer = fs.readFileSync(mediaFile.path);

    mediaId = await whatsappApi.uploadTemplateMedia(
      fileBuffer,
      mediaFile.mimetype,
      mediaFile.originalname
    );

    console.log("✅ Template media uploaded. Handle:", mediaId);

  } else {
    throw new AppError(
      400,
      "Media header requires file upload (mediaFile)"
    );
  }

  components.push({
    type: "HEADER",
    format: mediaType.toUpperCase(),
    example: {
      header_handle: [mediaId],
    },
  });
}


      /* ---------- BODY ---------- */
      const bodyObj: any = {
        type: "BODY",
        text: validatedTemplate.body,
      };

      if (placeholders.length > 0) {
        bodyObj.example = {
          body_text: [samples], // samples guaranteed non-empty
        };
      }

      components.push(bodyObj);

      /* ---------- FOOTER ---------- */
      if (validatedTemplate.footer) {
        components.push({
          type: "FOOTER",
          text: validatedTemplate.footer,
        });
      }

      /* ---------- BUTTONS ---------- */
      if (validatedTemplate.buttons) {
        let buttons = validatedTemplate.buttons;

        if (typeof buttons === "string") {
          try {
            buttons = JSON.parse(buttons);
          } catch {
            throw new AppError(400, "Invalid buttons format");
          }
        }

        if (Array.isArray(buttons) && buttons.length > 0) {
          components.push({
            type: "BUTTONS",
            buttons: buttons.map((btn: any) => {
              const type =
                btn.type === "URL"
                  ? "URL"
                  : btn.type === "PHONE_NUMBER"
                  ? "PHONE_NUMBER"
                  : "QUICK_REPLY";

              const obj: any = { type, text: btn.text };
              if (type === "URL") obj.url = btn.url;
              if (type === "PHONE_NUMBER")
                obj.phone_number = btn.phoneNumber;
              return obj;
            }),
          });
        }
      }

      /* ---------- FINAL PAYLOAD ---------- */
      const templatePayload = {
        name: validatedTemplate.name,
        category,
        language: validatedTemplate.language,
        components,
      };

      console.log(
        "📤 FINAL WHATSAPP PAYLOAD:",
        JSON.stringify(templatePayload, null, 2)
      );


      const result = await whatsappApi.createTemplate(templatePayload);

      if (result?.id) {
        await storage.updateTemplate(template.id, {
          whatsappTemplateId: result.id,
          status: result.status || "pending",
        });
      }

      return res.json(template);
    } catch (err: any) {
      console.error("❌ Template creation error:", err);
      console.error("❌ Error details:", {
        message: err.message,
        stack: err.stack,
        response: err.response?.data,
      });
      
      return res.json({
        ...template,
        warning: "Template saved locally but failed to submit to WhatsApp",
        error: err.message,
      });
    }
  }
);



async function waitForTemplateDeletion(api: WhatsAppApiService, templateName: string) {
  console.log(`⏳ Fully waiting for WhatsApp to finish deleting template: ${templateName}`);

  for (let i = 0; i < 20; i++) {   // wait up to ~100 seconds
    await new Promise((resolve) => setTimeout(resolve, 5000)); // wait 5 sec

    try {
      const status = await api.getTemplateStatus(templateName);

      // If template no longer exists → both template + language deleted
      if (status === "NOT_FOUND") {
        console.log("✅ Fully deleted (template + language cleared)");
        return;
      }

      // Some states you will see while still deleting:
      if (status === "DELETING" || status === "PENDING_DELETION") {
        console.log(`⌛ Still deleting language... status=${status}`);
        continue;
      }

      console.log(`⌛ Soft deletion…but still present: status=${status}`);

    } catch (err) {
      // 404 → Not found → deletion complete
      console.log("✅ Template & its language fully deleted (404)");
      return;
    }
  }

  throw new Error("⚠️ Timeout: template language still deleting after 100 seconds");
}


export const updateTemplate = asyncHandler(
  async (req: RequestWithChannel, res: Response) => {
    const { id } = req.params;
    const validatedTemplate = req.body;

    console.log("✏️ Updating template:", id);
    console.log("📥 Incoming body:", JSON.stringify(validatedTemplate, null, 2));

    /* ------------------------------------------------
       FETCH EXISTING TEMPLATE
    ------------------------------------------------ */
    const existingTemplate = await storage.getTemplate(id);
    if (!existingTemplate) throw new AppError(404, "Template not found");

    /* ------------------------------------------------
       MEDIA FILE
    ------------------------------------------------ */
    const mediaFile =
      Array.isArray(req.files?.mediaFile) ? req.files.mediaFile[0] : undefined;

    console.log("📦 mediaFile:", mediaFile?.originalname || "none");

    /* ------------------------------------------------
       NORMALIZATION
    ------------------------------------------------ */
    let category =
      validatedTemplate.category?.toLowerCase() ||
      existingTemplate.category?.toLowerCase() ||
      "authentication";

    if (!["marketing", "utility", "authentication"].includes(category)) {
      category = "authentication";
    }
    category = category.toUpperCase();

    const mediaType = validatedTemplate.mediaType
      ? validatedTemplate.mediaType.toLowerCase()
      : "text";

    /* ------------------------------------------------
       PLACEHOLDER VALIDATION
    ------------------------------------------------ */
    if (!validatedTemplate.body) {
      throw new AppError(400, "body is required");
    }

    const placeholderPattern = /\{\{(\d+)\}\}/g;
    const placeholderMatches = Array.from(
      validatedTemplate.body.matchAll(placeholderPattern)
    );

    const placeholders = placeholderMatches
      .map((m) => parseInt(m[1], 10))
      .sort((a, b) => a - b);

    for (let i = 0; i < placeholders.length; i++) {
      if (placeholders[i] !== i + 1) {
        throw new AppError(
          400,
          "Placeholders must be sequential starting from {{1}}"
        );
      }
    }

    /* ------------------------------------------------
       PARSE + VALIDATE SAMPLES
    ------------------------------------------------ */
    let samples: string[] = [];

    if (validatedTemplate.samples) {
      if (typeof validatedTemplate.samples === "string") {
        try {
          samples = JSON.parse(validatedTemplate.samples);
        } catch {
          throw new AppError(400, "Invalid samples format");
        }
      } else if (Array.isArray(validatedTemplate.samples)) {
        samples = validatedTemplate.samples;
      }
    }

    if (placeholders.length > 0) {
      if (samples.length !== placeholders.length) {
        throw new AppError(
          400,
          `Expected ${placeholders.length} sample values, got ${samples.length}`
        );
      }

      if (samples.some((s) => !String(s).trim())) {
        throw new AppError(
          400,
          "Sample values for template variables cannot be empty"
        );
      }
    }

    /* ------------------------------------------------
       CHANNEL
    ------------------------------------------------ */
    const channelId = validatedTemplate.channelId || existingTemplate.channelId;
    if (!channelId) throw new AppError(400, "channelId is required");

    const channel = await storage.getChannel(channelId);
    if (!channel) throw new AppError(400, "Channel not found");

    /* ------------------------------------------------
       SAFE DB UPDATE PAYLOAD  🔥🔥🔥
    ------------------------------------------------ */
    const updatePayload: Record<string, any> = {
      name: validatedTemplate.name,
      category,
      language: validatedTemplate.language,
      body: validatedTemplate.body,
      samples,
      footer: validatedTemplate.footer,
      buttons: validatedTemplate.buttons,
      channelId,
      status: "pending",
      updatedAt: new Date(), // 🚀 prevents "No values to set"
    };

    // remove undefined / null
    Object.keys(updatePayload).forEach(
      (k) => updatePayload[k] === undefined && delete updatePayload[k]
    );

    if (Object.keys(updatePayload).length === 0) {
      throw new AppError(400, "No fields provided to update");
    }

    const updatedTemplate = await storage.updateTemplate(id, updatePayload);

    /* ------------------------------------------------
       WHATSAPP API
    ------------------------------------------------ */
    const whatsappApi = new WhatsAppApiService(channel);

    /* ------------------------------------------------
       DELETE EXISTING WHATSAPP TEMPLATE
    ------------------------------------------------ */
    if (existingTemplate.whatsappTemplateId) {
      try {
        console.log("🗑 Deleting WhatsApp template:", existingTemplate.name);
        await whatsappApi.deleteTemplate(existingTemplate.name);
        await waitForTemplateDeletion(whatsappApi, existingTemplate.name);
      } catch {
        console.warn("⚠️ Failed to delete old template. Continuing.");
      }
    }

    /* ------------------------------------------------
       BUILD WHATSAPP COMPONENTS
    ------------------------------------------------ */
    try {
      const components: any[] = [];

      /* ---------- HEADER ---------- */
      if (mediaType === "text" && validatedTemplate.header) {
        components.push({
          type: "HEADER",
          format: "TEXT",
          text: validatedTemplate.header,
        });
      }

      if (mediaType !== "text") {
        let mediaId: string;

        if (mediaFile) {
          mediaId = await whatsappApi.uploadTemplateMedia(
            mediaFile.buffer,
            mediaFile.mimetype,
            mediaFile.originalname
          );
          await new Promise((r) => setTimeout(r, 1000));
        } else if (validatedTemplate.mediaUrl) {
          let mimeType = "image/jpeg";
          if (mediaType === "video") mimeType = "video/mp4";
          if (mediaType === "document") mimeType = "application/pdf";

          mediaId = await whatsappApi.uploadMediaFromUrl(
            validatedTemplate.mediaUrl,
            mimeType
          );
          await new Promise((r) => setTimeout(r, 1000));
        } else {
          throw new AppError(
            400,
            "Media header requires file upload or mediaUrl"
          );
        }

        if (!/^\d+$/.test(mediaId)) {
          throw new AppError(400, `Invalid media ID: ${mediaId}`);
        }

        components.push({
          type: "HEADER",
          format: mediaType.toUpperCase(),
          example: {
            header_handle: [mediaId],
          },
        });
      }

      /* ---------- BODY ---------- */
      const bodyObj: any = {
        type: "BODY",
        text: validatedTemplate.body,
      };

      if (placeholders.length > 0) {
        bodyObj.example = {
          body_text: [samples],
        };
      }

      components.push(bodyObj);

      /* ---------- FOOTER ---------- */
      if (validatedTemplate.footer) {
        components.push({
          type: "FOOTER",
          text: validatedTemplate.footer,
        });
      }

      /* ---------- BUTTONS ---------- */
      if (validatedTemplate.buttons) {
        const buttons =
          typeof validatedTemplate.buttons === "string"
            ? JSON.parse(validatedTemplate.buttons)
            : validatedTemplate.buttons;

        if (Array.isArray(buttons) && buttons.length) {
          components.push({
            type: "BUTTONS",
            buttons: buttons.map((btn: any) => {
              const type =
                btn.type === "URL"
                  ? "URL"
                  : btn.type === "PHONE_NUMBER"
                  ? "PHONE_NUMBER"
                  : "QUICK_REPLY";

              const obj: any = { type, text: btn.text };
              if (type === "URL") obj.url = btn.url;
              if (type === "PHONE_NUMBER")
                obj.phone_number = btn.phoneNumber;
              return obj;
            }),
          });
        }
      }

      /* ---------- FINAL PAYLOAD ---------- */
      const templatePayload = {
        name: validatedTemplate.name,
        category,
        language: validatedTemplate.language,
        components,
      };

      console.log(
        "📤 FINAL UPDATE PAYLOAD:",
        JSON.stringify(templatePayload, null, 2)
      );

      const result = await whatsappApi.createTemplate(templatePayload);

      if (result?.id) {
        await storage.updateTemplate(updatedTemplate.id, {
          whatsappTemplateId: result.id,
          status: result.status || "pending",
        });
      }

      return res.json({
        ...updatedTemplate,
        message: "Template updated and resubmitted to WhatsApp",
      });
    } catch (err: any) {
      console.error("❌ Update template error:", err);
      return res.json({
        ...updatedTemplate,
        warning: "Template updated locally but failed to submit to WhatsApp",
        error: err.message,
      });
    }
  }
);



export const deleteTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const success = await storage.deleteTemplate(id);
  if (!success) {
    throw new AppError(404, 'Template not found');
  }
  res.status(204).send();
});

export const syncTemplatesOLDD = asyncHandler(async (req: RequestWithChannel, res: Response) => {
  let channelId = req.body.channelId || req.query.channelId as string || req.channelId;
  // console.log(channelId, "CHEKJLKKKKKKKKKKKKKKKKKKKKKKKKK")
  
  if (!channelId) {
    // Get active channel if not provided
    const activeChannel = await storage.getActiveChannel();
    
    if (!activeChannel) {
      throw new AppError(400, 'No active channel found');
    }
    channelId = activeChannel.id;
  }
  
  const channel = await storage.getChannel(channelId);
  if (!channel) {
    throw new AppError(404, 'Channel not found');
  }

  console.log("🔍 Channel loaded for template sync:", channel);

  
  try {
    const whatsappApi = new WhatsAppApiService(channel);
    const whatsappTemplates = await whatsappApi.getTemplates();
    
    


    // Get existing templates (Paginated)
const { data: existingTemplatesRaw } = await storage.getTemplatesByChannel(channelId);

// Ensure it's always an array
const existingTemplates = Array.isArray(existingTemplatesRaw)
  ? existingTemplatesRaw
  : [];
    const existingByName = new Map(existingTemplates.map(t => [`${t.name}_${t.language}`, t]));
    
    let updatedCount = 0;
    let createdCount = 0;
    
    for (const waTemplate of whatsappTemplates) {
      const key = `${waTemplate.name}_${waTemplate.language}`;
      const existing = existingByName.get(key);
      
      // Extract body text from components
      let bodyText = '';
      if (waTemplate.components && Array.isArray(waTemplate.components)) {
        const bodyComponent = waTemplate.components.find((c: any) => c.type === 'BODY');
        if (bodyComponent && bodyComponent.text) {
          bodyText = bodyComponent.text;
        }
      }
      
      if (existing) {
        // Update existing template
        if (existing.status !== waTemplate.status || existing.whatsappTemplateId !== waTemplate.id) {
          await storage.updateTemplate(existing.id, {
            status: waTemplate.status,
            whatsappTemplateId: waTemplate.id,
            body: bodyText || existing.body
          });
          updatedCount++;
        }
      } else {
        // Create new template
        await storage.createTemplate({
          name: waTemplate.name,
          language: waTemplate.language,
          category: waTemplate.category || 'marketing',
          status: waTemplate.status,
          body: bodyText || `Template ${waTemplate.name}`,
          channelId: channelId,
          whatsappTemplateId: waTemplate.id
        });
        createdCount++;
      }
    }
    
    res.json({
      message: `Synced templates: ${createdCount} created, ${updatedCount} updated`,
      createdCount,
      updatedCount,
      totalTemplates: whatsappTemplates.length
    });
  } catch (error) {
    console.error("Template sync error:", error);
    throw new AppError(500, 'Failed to sync templates with WhatsApp');
  }
});


export const syncTemplates = asyncHandler(
  async (req: RequestWithChannel, res: Response) => {
    let channelId =
      (req.body.channelId as string) ||
      (req.query.channelId as string) ||
      req.channelId;

    if (!channelId) {
      const activeChannel = await storage.getActiveChannel();
      if (!activeChannel) {
        throw new AppError(400, "No active channel found");
      }
      channelId = activeChannel.id;
    }

    const channel = await storage.getChannel(channelId);
    if (!channel) throw new AppError(404, "Channel not found");

    console.log("🔄 Syncing template statuses for channel:", channelId);

    const whatsappApi = new WhatsAppApiService(channel);
    const whatsappTemplates = await whatsappApi.getTemplates();

    console.log("📥 WhatsApp templates fetched:", whatsappTemplates.length);

    const { data: dbTemplates } = await storage.getTemplatesByChannel(channelId);
    const existingTemplates = Array.isArray(dbTemplates) ? dbTemplates : [];

    console.log("📦 Existing templates in DB:", existingTemplates.length);

    // 🔑 Create lookup maps (normalize IDs to string)
    const existingByWhatsappId = new Map<string, any>();
    const existingByName = new Map<string, any>();

    for (const t of existingTemplates) {
      if (t.whatsappTemplateId) {
        existingByWhatsappId.set(String(t.whatsappTemplateId).trim(), t);
      }
      if (t.name) {
        existingByName.set(t.name.trim(), t);
      }
    }

    let updatedCount = 0;
    let skippedCount = 0;
    let newTemplatesFound = 0;

    for (const waTemplate of whatsappTemplates) {
      const waId = String(waTemplate.id).trim();
      const waName = waTemplate.name.trim();
      const waStatus = waTemplate.status;

      // Try to find existing template
      let existing = existingByWhatsappId.get(waId) || existingByName.get(waName);

      if (existing) {
        // ✅ Template exists - only update status if changed
        if (existing.status !== waStatus) {
          console.log(`🔄 Updating status: ${waName} | ${existing.status} → ${waStatus}`);
          
          await storage.updateTemplate(existing.id, {
            status: waStatus,
            whatsappTemplateId: waId // Ensure ID is set correctly
          });

          updatedCount++;
        } else {
          skippedCount++;
        }
      } else {
        // ⚠️ New template found (not in DB)
        console.log(`⚠️ New template found in WhatsApp but not in DB: ${waName}`);
        newTemplatesFound++;
      }
    }

    console.log(`\n✅ Status sync done | Updated: ${updatedCount}, Skipped: ${skippedCount}, New: ${newTemplatesFound}`);

    res.json({
      success: true,
      message: "Template statuses synced successfully",
      totalFromWhatsApp: whatsappTemplates.length,
      updatedCount,
      skippedCount,
      newTemplatesFound,
      note: newTemplatesFound > 0 
        ? "Some new templates were found in WhatsApp but not synced. Create them manually if needed."
        : "All templates are in sync"
    });
  }
);


export const syncTemplatesAKKKK = asyncHandler(
  async (req: RequestWithChannel, res: Response) => {
    let channelId =
      (req.body.channelId as string) ||
      (req.query.channelId as string) ||
      req.channelId;

    if (!channelId) {
      const activeChannel = await storage.getActiveChannel();
      if (!activeChannel) {
        throw new AppError(400, "No active channel found");
      }
      channelId = activeChannel.id;
    }

    const channel = await storage.getChannel(channelId);
    if (!channel) throw new AppError(404, "Channel not found");

    console.log("🔄 Syncing templates for channel:", channelId);

    const whatsappApi = new WhatsAppApiService(channel);
    const whatsappTemplates = await whatsappApi.getTemplates();

    console.log("📥 WhatsApp templates fetched:", whatsappTemplates.length);

    const { data: dbTemplates } =
      await storage.getTemplatesByChannel(channelId);

    const existingTemplates = Array.isArray(dbTemplates) ? dbTemplates : [];

    // 🔑 MAP BY whatsappTemplateId (STRING ONLY)
    const existingByWhatsappId = new Map<string, any>();

    for (const t of existingTemplates) {
      if (t.whatsappTemplateId) {
        existingByWhatsappId.set(String(t.whatsappTemplateId), t);
      }
    }

    let createdCount = 0;
    let updatedCount = 0;

    for (const waTemplate of whatsappTemplates) {
      const waId = String(waTemplate.id); // 🔥 ALWAYS STRING

      const existing = existingByWhatsappId.get(waId);

      const bodyComponent = Array.isArray(waTemplate.components)
        ? waTemplate.components.find((c: any) => c.type === "BODY")
        : null;

      const bodyText = bodyComponent?.text || "";

      // 🔹 Detect header type
      const headerComponent = waTemplate.components?.find(
        (c: any) => c.type === "HEADER"
      );

      const headerType = headerComponent?.format || null;

      // 🔹 Variable count
      const bodyVariables =
        (bodyText.match(/\{\{\d+\}\}/g) || []).length;

      if (existing) {
        // 🔄 UPDATE ONLY IF REQUIRED
        const needsUpdate =
          existing.status !== waTemplate.status ||
          existing.body !== bodyText ||
          existing.headerType !== headerType ||
          existing.bodyVariables !== bodyVariables;

        if (needsUpdate) {
          await storage.updateTemplate(existing.id, {
            status: waTemplate.status,
            body: bodyText,
            headerType,
            bodyVariables,
          });

          updatedCount++;
        }
      } else {
        // ➕ INSERT (ONLY ONCE)
        await storage.createTemplate({
          name: waTemplate.name,
          language: waTemplate.language || "en_US",
          category: waTemplate.category || "MARKETING",
          status: waTemplate.status,
          body: bodyText,
          headerType,        // 👈 IMPORTANT
          bodyVariables,     // 👈 IMPORTANT
          channelId,
          whatsappTemplateId: waId, // 👈 UNIQUE
        });

        createdCount++;
      }
    }

    console.log(
      `✅ Template sync done | Created: ${createdCount}, Updated: ${updatedCount}`
    );

    res.json({
      success: true,
      message: "Templates synced successfully",
      totalFromWhatsApp: whatsappTemplates.length,
      createdCount,
      updatedCount,
    });
  }
);




export const seedTemplates = asyncHandler(async (req: RequestWithChannel, res: Response) => {
  const channelId = req.query.channelId as string | undefined;
  
  // If no channelId in query, get active channel
  let finalChannelId = channelId;
  if (!finalChannelId) {
    const activeChannel = await storage.getActiveChannel();
    if (activeChannel) {
      finalChannelId = activeChannel.id;
    } else {
      throw new AppError(400, 'No active channel found. Please configure a channel first.');
    }
  }
  
  const templates = [
    {
      name: "hello_world",
      body: "Hello {{1}}! Welcome to our WhatsApp Business platform.",
      category: "utility" as const,
      language: "en",
      status: "pending",
      channelId: finalChannelId
    },
    {
      name: "order_confirmation",
      body: "Hi {{1}}, your order #{{2}} has been confirmed and will be delivered by {{3}}.",
      category: "utility" as const,
      language: "en",
      status: "pending",
      channelId: finalChannelId
    },
    {
      name: "appointment_reminder",
      body: "Hello {{1}}, this is a reminder about your appointment on {{2}} at {{3}}. Reply YES to confirm.",
      category: "utility" as const,
      language: "en",
      status: "pending",
      channelId: finalChannelId
    }
  ];

  const createdTemplates = await Promise.all(
    templates.map(template => storage.createTemplate(template))
  );

  res.json({ message: "Templates seeded successfully", templates: createdTemplates });
});