import type { Request, Response } from 'express';
import { storage } from '../storage';
import { insertTemplateSchema } from '@shared/schema';
import { AppError, asyncHandler } from '../middlewares/error.middleware';
import { WhatsAppApiService } from '../services/whatsapp-api';
import type { RequestWithChannel } from '../middlewares/channel.middleware';
import fs from "fs";
import sharp from 'sharp';



export const getTemplatesOld = asyncHandler(async (req: RequestWithChannel, res: Response) => {
  const channelId = req.query.channelId as string | undefined;
  console.log("Fetching templates for channelId:", channelId);
  const templates = channelId 
    ? await storage.getTemplatesByChannel(channelId)
    : await storage.getTemplates();
  res.json(templates);
});


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


async function normalizeTemplateHeaderImage(input: Buffer): Promise<Buffer> {
  return await sharp(input)
    .rotate() // removes EXIF rotation
    .resize(1024, 1024, {
      fit: "cover",   // force square
    })
    .jpeg({
      quality: 90,
      chromaSubsampling: "4:4:4",
    })
    .toBuffer();
}



export const createTemplate = asyncHandler(
  async (req: RequestWithChannel, res: Response) => {
    console.log(
      "🚀 Incoming template creation request body:",
      JSON.stringify(req.body, null, 2)
    );

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
        const fileBuffer = fs.readFileSync(mediaFile.path);

        if (mediaFile) {
          console.log("📤 Uploading media buffer to WhatsApp...");
          const normalizedBuffer = await normalizeTemplateHeaderImage(fileBuffer);

        

        const finalMimeType = "image/jpeg";
        const finalFilename = `template-header-${Date.now()}.jpg`;

          mediaId = await whatsappApi.uploadMediaBufferForTemplate(
            normalizedBuffer,
            // mediaFile.mimetype,
            // mediaFile.originalname
            finalMimeType,
            finalFilename
          );
          console.log("✅ Media uploaded successfully. ID:", mediaId);
          
          // Add a small delay to ensure WhatsApp has processed the upload
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else if (validatedTemplate.mediaUrl) {
          console.log("📤 Uploading media from URL to WhatsApp...");
          let mimeType: string;
          if (mediaType === "image") mimeType = "image/jpeg";
          else if (mediaType === "video") mimeType = "video/mp4";
          else if (mediaType === "document") mimeType = "application/pdf";
          else mimeType = `${mediaType}/jpeg`;

          mediaId = await whatsappApi.uploadMediaFromUrl(
            validatedTemplate.mediaUrl,
            mimeType
          );
          console.log("✅ Media uploaded successfully. ID:", mediaId);
          
          // Add a small delay to ensure WhatsApp has processed the upload
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          throw new AppError(
            400,
            "Media header requires file upload or mediaUrl"
          );
        }

        // Verify the media ID is valid (should be numeric string)
        // if (!mediaId || !/^\d+$/.test(mediaId)) {
        //   throw new AppError(
        //     400,
        //     `Invalid media ID received from WhatsApp: ${mediaId}`
        //   );
        // }

        components.push({
          type: "HEADER",
          format: mediaType.toUpperCase(),
          example: {
            header_handle: [mediaId], // WhatsApp expects array of strings
          },
        });
      }

      /* ---------- HEADER ---------- */
// if (mediaType === "text" && validatedTemplate.header) {
//   components.push({
//     type: "HEADER",
//     format: "TEXT",
//     text: validatedTemplate.header,
//   });
// }

// if (mediaType !== "text") {
//   let mediaId: string;

//   if (mediaFile) {
//     console.log("📤 Uploading media file to WhatsApp (template upload)...");

//     if (!mediaFile.path) {
//       throw new AppError(
//         400,
//         "Media file path missing. Disk storage expected."
//       );
//     }

//     const fileBuffer = fs.readFileSync(mediaFile.path);

//     mediaId = await whatsappApi.uploadTemplateMedia(
//       fileBuffer,
//       mediaFile.mimetype,
//       mediaFile.originalname
//     );

//     console.log("✅ Template media uploaded. Handle:", mediaId);

//   } else {
//     throw new AppError(
//       400,
//       "Media header requires file upload (mediaFile)"
//     );
//   }

//   components.push({
//     type: "HEADER",
//     format: mediaType.toUpperCase(),
//     example: {
//       header_handle: [mediaId],
//     },
//   });
// }


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


export const createTemplate17dec = asyncHandler(
  async (req: RequestWithChannel, res: Response) => {
    console.log(
      "🚀 Incoming template creation request body:",
      JSON.stringify(req.body, null, 2)
    );

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
    });

    /* ------------------------------------------------
       BUILD WHATSAPP COMPONENTS
    ------------------------------------------------ */
    try {
      const whatsappApi = new WhatsAppApiService(channel);
      const components: any[] = [];

      console.log("🔨 Building components from individual fields");

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
          mediaId = await whatsappApi.uploadMediaBufferForTemplate(
            mediaFile.buffer,
            mediaFile.mimetype,
            mediaFile.originalname
          );
        } else if (validatedTemplate.mediaUrl) {
          let mimeType: string;
          if (mediaType === "image") mimeType = "image/jpeg";
          else if (mediaType === "video") mimeType = "video/mp4";
          else if (mediaType === "document") mimeType = "application/pdf";
          else mimeType = `${mediaType}/jpeg`;

          mediaId = await whatsappApi.uploadMediaFromUrl(
            validatedTemplate.mediaUrl,
            mimeType
          );
        } else {
          throw new AppError(
            400,
            "Media header requires file upload or mediaUrl"
          );
        }

        components.push({
          type: "HEADER",
          format: mediaType.toUpperCase(),
          example: {
            header_handle: [String(mediaId)], // ✅ FINAL correct format
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
      return res.json({
        ...template,
        warning: "Template saved locally but failed to submit to WhatsApp",
      });
    }
  }
);





export const createTemplateAAAAAAAAAAAAA = asyncHandler(
  async (req: RequestWithChannel, res: Response) => {
    console.log(
      "🚀 Incoming template creation request body:",
      JSON.stringify(req.body, null, 2)
    );

    const validatedTemplate = req.body;

    /* ------------------------------------------------
       BASIC NORMALIZATION
    ------------------------------------------------ */

    // Normalize category
    let category = validatedTemplate.category?.toLowerCase() || "authentication";
    if (!["marketing", "utility", "authentication"].includes(category)) {
      category = "authentication";
    }
    category = category.toUpperCase();

    // Normalize media type
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

    console.log("🔢 Extracted placeholders:", placeholders);

    // Validate sequential placeholders {{1}}, {{2}} ...
    for (let i = 0; i < placeholders.length; i++) {
      if (placeholders[i] !== i + 1) {
        throw new AppError(
          400,
          "Placeholders must be sequential starting from {{1}}"
        );
      }
    }

    const samples = validatedTemplate.samples || [];
    console.log("📝 Samples:", samples);

    if (placeholders.length > 0 && samples.length !== placeholders.length) {
      throw new AppError(
        400,
        `Expected ${placeholders.length} sample values, got ${samples.length}`
      );
    }

    /* ------------------------------------------------
       CHANNEL + USER
    ------------------------------------------------ */

    let channelId = validatedTemplate.channelId;
    if (!channelId) {
      const activeChannel = await storage.getActiveChannel();
      if (!activeChannel) throw new AppError(400, "No active channel found");
      channelId = activeChannel.id;
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

    /* ------------------------------------------------
       BUILD WHATSAPP COMPONENTS
    ------------------------------------------------ */

    try {
      const whatsappApi = new WhatsAppApiService(channel);
      let components: any[] = [];

      // Check if components are already provided in the request
      if (validatedTemplate.components && Array.isArray(validatedTemplate.components)) {
        console.log("📦 Using pre-built components from request");
        
        // ✅ Use async map for media uploads
        components = await Promise.all(
          validatedTemplate.components.map(async (comp) => {
            // For HEADER with IMAGE/VIDEO/DOCUMENT
            if (comp.type === "HEADER" && ["IMAGE", "VIDEO", "DOCUMENT"].includes(comp.format)) {
              const mediaUrl = comp.example?.header_handle?.[0];
              
              if (mediaUrl && mediaUrl.startsWith('http')) {
                console.log(`🔄 Processing ${comp.format} for template...`);
                
                try {
                  // Determine MIME type based on format
                  let mimeType: string;
                  if (comp.format === "IMAGE") {
                    mimeType = "image/jpeg";
                  } else if (comp.format === "VIDEO") {
                    mimeType = "video/mp4";
                  } else if (comp.format === "DOCUMENT") {
                    mimeType = "application/pdf";
                  } else {
                    throw new AppError(400, `Unsupported format: ${comp.format}`);
                  }
                  
                  // ✅ Upload and get Media ID immediately before template creation
                  const mediaId = await whatsappApi.uploadMediaFromUrl(mediaUrl, mimeType);
                  console.log(`✅ Media uploaded for template, ID: ${mediaId}`);
                  
                  // ✅ Return component with Media ID as STRING
                  return {
                    type: "HEADER",
                    format: comp.format,
                    example: {
                      header_handle: [String(mediaId)],
                    },
                  };
                } catch (uploadError: any) {
                  console.error("⚠️ Media processing failed:", uploadError.message);
                  throw new AppError(400, `Failed to process media: ${uploadError.message}`);
                }
              }
            }
            
            // Add BODY example if missing
            if (comp.type === "BODY" && comp.text) {
              const bodyVars = comp.text.match(/{{\d+}}/g);
              if (bodyVars && bodyVars.length > 0 && !comp.example) {
                return {
                  type: "BODY",
                  text: comp.text,
                  example: {
                    body_text: [samples],
                  },
                };
              }
            }
            
            // Return all other components as-is
            return comp;
          })
        );
      } else {
        console.log("🔨 Building components from individual fields");
        
        /* ---------- HEADER : TEXT ---------- */
        if (mediaType === "text" && validatedTemplate.header) {
          const headerVars = validatedTemplate.header.match(/{{\d+}}/g);

          const headerObj: any = {
            type: "HEADER",
            format: "TEXT",
            text: validatedTemplate.header,
          };

          if (headerVars?.length) {
            if (
              !validatedTemplate.headerSamples ||
              validatedTemplate.headerSamples.length !== headerVars.length
            ) {
              throw new AppError(
                400,
                `Header has ${headerVars.length} variables but ${
                  validatedTemplate.headerSamples?.length || 0
                } samples provided`
              );
            }

            headerObj.example = {
              header_text: validatedTemplate.headerSamples,
            };
          }

          components.push(headerObj);
        }

        /* ---------- HEADER : MEDIA ---------- */
        if (mediaType !== "text") {
          if (!validatedTemplate.mediaUrl) {
            throw new AppError(400, "Media header requires mediaUrl");
          }

          // ✅ Upload media and get Media ID
          console.log("🔄 Uploading media to WhatsApp for template...");
          
          // Determine MIME type
          let mimeType: string;
          if (mediaType === "image") {
            mimeType = "image/jpeg";
          } else if (mediaType === "video") {
            mimeType = "video/mp4";
          } else if (mediaType === "document") {
            mimeType = "application/pdf";
          } else {
            mimeType = `${mediaType}/jpeg`;
          }
          
          const mediaId = await whatsappApi.uploadMediaFromUrl(
            validatedTemplate.mediaUrl,
            mimeType
          );
          console.log("✅ Media uploaded, Media ID:", mediaId);

          components.push({
            type: "HEADER",
            format: mediaType.toUpperCase(),
            example: {
              header_handle: [String(mediaId)],
            },
          });
        }

        /* ---------- BODY (REQUIRED) ---------- */
        const bodyVars = validatedTemplate.body.match(/{{\d+}}/g);

        const bodyObj: any = {
          type: "BODY",
          text: validatedTemplate.body,
        };

        if (bodyVars?.length) {
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
        if (validatedTemplate.buttons?.length > 0) {
          const buttons = validatedTemplate.buttons.map((btn: any) => {
            const type =
              btn.type.toUpperCase() === "URL"
                ? "URL"
                : btn.type.toUpperCase() === "PHONE"
                ? "PHONE_NUMBER"
                : "QUICK_REPLY";

            const buttonObj: any = {
              type,
              text: btn.text,
            };

            if (type === "URL") buttonObj.url = btn.url;
            if (type === "PHONE_NUMBER")
              buttonObj.phone_number = btn.phoneNumber;

            return buttonObj;
          });

          components.push({
            type: "BUTTONS",
            buttons,
          });
        }
      }

      /* ------------------------------------------------
         FINAL META PAYLOAD
      ------------------------------------------------ */

      const templatePayload = {
        name: validatedTemplate.name,
        category,
        language: validatedTemplate.language,
        components,
      };

      console.log(
        "📤 FINAL META PAYLOAD:",
        JSON.stringify(templatePayload, null, 2)
      );

      // ✅ Create template IMMEDIATELY after all uploads
      const result = await whatsappApi.createTemplate(templatePayload);

      if (result?.id) {
        await storage.updateTemplate(template.id, {
          whatsappTemplateId: result.id,
          status: result.status || "pending",
          category,
        });
      }

      return res.json(template);
    } catch (err: any) {
      console.log("------ RAW ERROR START ------");
      console.dir(err, { depth: null });
      console.log("------ RAW ERROR END ------");

      if (err.response && typeof err.response.text === "function") {
        const raw = await err.response.text();
        console.log("❌ RAW WHATSAPP TEXT ERROR:", raw);
      }

      console.log("❌ err.message:", err.message);

      return res.json({
        ...template,
        warning: "Template saved locally but failed to submit to WhatsApp",
      });
    }
  }
);

export const createTemplateDATEEEEE16 = asyncHandler(async (req: RequestWithChannel, res: Response) => {
  console.log("🚀 Incoming template creation request body:", JSON.stringify(req.body, null, 2));

  const validatedTemplate = req.body;
  console.log("✅ Validated template:", validatedTemplate);

  // Normalize category
  let category = validatedTemplate.category?.toLowerCase() || "authentication";
  if (!["marketing", "utility", "authentication"].includes(category)) {
    category = "authentication";
  }
  category = category.toUpperCase();

  // Extract placeholders from body
  const placeholderPattern = /\{\{(\d+)\}\}/g;
  const placeholderMatches = Array.from(validatedTemplate.body.matchAll(placeholderPattern));
  const placeholders = placeholderMatches.map(m => parseInt(m[1], 10)).sort((a, b) => a - b);

  console.log("🔢 Extracted placeholders:", placeholders);

  // Validate sequential placeholders
  for (let i = 0; i < placeholders.length; i++) {
    if (placeholders[i] !== i + 1) {
      throw new AppError(400, "Placeholders must be sequential starting from {{1}}");
    }
  }

  const samples = validatedTemplate.samples || [];
  console.log("📝 Samples:", samples);

  // Validate samples match placeholder count
  if (placeholders.length > 0 && samples.length !== placeholders.length) {
    throw new AppError(400, `Expected ${placeholders.length} sample values, got ${samples.length}`);
  }

  // Channel selection
  let channelId = validatedTemplate.channelId;
  if (!channelId) {
    const activeChannel = await storage.getActiveChannel();
    if (!activeChannel) throw new AppError(400, "No active channel found");
    channelId = activeChannel.id;
  }

  const createdBy = req.user?.id;
  if (!createdBy) throw new AppError(401, "User not authenticated");

  const template = await storage.createTemplate({
    ...validatedTemplate,
    category,
    channelId,
    status: "pending",
    createdBy,
  });

  const channel = await storage.getChannel(channelId);
  if (!channel) throw new AppError(400, "Channel not found");

  try {
    const whatsappApi = new WhatsAppApiService(channel);

    const components: any[] = [];

    // HEADER
    if (validatedTemplate.header) {
      const headerVars = validatedTemplate.header.match(/{{\d+}}/g);
      const headerObj: any = {
        type: "HEADER",
        format: validatedTemplate.mediaType?.toUpperCase() || "TEXT",
      };

      // For TEXT headers
      if (!validatedTemplate.mediaType || validatedTemplate.mediaType === "text") {
        headerObj.text = validatedTemplate.header;
        
        // Add examples if header has variables
        if (headerVars?.length) {
          if (!validatedTemplate.headerSamples || validatedTemplate.headerSamples.length !== headerVars.length) {
            throw new AppError(400, `Header has ${headerVars.length} variables but ${validatedTemplate.headerSamples?.length || 0} samples provided`);
          }
          headerObj.example = {
            header_text: validatedTemplate.headerSamples
          };
        }
      } 
      // For MEDIA headers (IMAGE, VIDEO, DOCUMENT)
      else {
        if (validatedTemplate.mediaUrl) {
          headerObj.example = {
            header_handle: [validatedTemplate.mediaUrl]
          };
        }
      }

      components.push(headerObj);
    }

    // BODY (required)
    const bodyVars = validatedTemplate.body.match(/{{\d+}}/g);
    const bodyObj: any = {
      type: "BODY",
      text: validatedTemplate.body,
    };

    // Add examples if body has variables
    if (bodyVars?.length) {
      bodyObj.example = {
        body_text: [samples] // Array of array format required by WhatsApp
      };
    }

    components.push(bodyObj);

    // FOOTER (optional)
    if (validatedTemplate.footer) {
      components.push({
        type: "FOOTER",
        text: validatedTemplate.footer,
      });
    }

    // BUTTONS (optional)
    if (validatedTemplate.buttons?.length > 0) {
      const buttons = validatedTemplate.buttons.map((btn: any) => {
        const buttonObj: any = {
          type: btn.type.toUpperCase() === "URL" ? "URL" : 
                btn.type.toUpperCase() === "PHONE" ? "PHONE_NUMBER" : 
                "QUICK_REPLY",
          text: btn.text,
        };

        if (buttonObj.type === "URL") {
          buttonObj.url = btn.url;
        } else if (buttonObj.type === "PHONE_NUMBER") {
          buttonObj.phone_number = btn.phoneNumber;
        }

        return buttonObj;
      });

      components.push({
        type: "BUTTONS",
        buttons,
      });
    }

    // FINAL META PAYLOAD - Use actual template data, not static
    const templatePayload = {
      name: validatedTemplate.name,
      category,
      language: validatedTemplate.language,
      components,
    };

    console.log("📤 FINAL META PAYLOAD:", JSON.stringify(templatePayload, null, 2));

    // Send the actual payload, not the static one
    const result = await whatsappApi.createTemplate(templatePayload);

    if (result.id) {
      await storage.updateTemplate(template.id, {
        whatsappTemplateId: result.id,
        status: result.status || "pending",
        category,
      });
    }

    return res.json(template);

  } catch (err: any) {
    console.log("------ RAW ERROR START ------");
    console.dir(err, { depth: null });
    console.log("------ RAW ERROR END ------");

    if (err.response && typeof err.response.text === "function") {
      const raw = await err.response.text();
      console.log("❌ RAW WHATSAPP TEXT ERROR:", raw);
    }

    console.log("❌ err.message:", err.message);

    // Optionally delete the locally saved template on API failure
    // await storage.deleteTemplate(template.id);

    return res.json({
      ...template,
      warning: "Template saved locally but failed to submit to WhatsApp",
    });
  }
});




export const createTemplateONEEE = asyncHandler(async (req: RequestWithChannel, res: Response) => {
  console.log("🚀 Incoming template creation request body:", JSON.stringify(req.body, null, 2));

  const validatedTemplate = req.body;
  console.log("✅ Validated template:", validatedTemplate);

  // Normalize category
  let category = validatedTemplate.category?.toLowerCase() || "authentication";
  if (!["marketing", "utility", "authentication"].includes(category)) {
    category = "authentication";
  }
  console.log("📌 Using category:", category);

  // Extract placeholders
  const placeholderPattern = /\{\{(\d+)\}\}/g;
  const placeholderMatches = Array.from(validatedTemplate.body.matchAll(placeholderPattern));
  const placeholders = placeholderMatches.map(m => parseInt(m[1], 10)).sort((a, b) => a - b);
  console.log("🔢 Extracted placeholders:", placeholders);

  // Ensure placeholders are sequential
  for (let i = 0; i < placeholders.length; i++) {
    if (placeholders[i] !== i + 1) {
      throw new AppError(400, "Placeholders must be sequential starting from {{1}}");
    }
  }

  // Validate samples
  const samples = validatedTemplate.samples;
  // if (!samples || !Array.isArray(samples) || samples.length !== placeholders.length) {
  //   throw new AppError(400, `You must provide ${placeholders.length} sample value(s) for the placeholders`);
  // }
  console.log("📝 Samples:", samples);

  // Determine channel ID
  let channelId = validatedTemplate.channelId;
  if (!channelId) {
    const activeChannel = await storage.getActiveChannel();
    if (!activeChannel) throw new AppError(400, "No active channel found. Please configure a channel first.");
    channelId = activeChannel.id;
  }
  console.log("📡 Using channelId:", channelId);

  // Get logged-in user ID
  const createdBy = req.user?.id;
  if (!createdBy) throw new AppError(401, "User not authenticated");
  console.log("👤 Created by userId:", createdBy);

  // Create template in DB
  const template = await storage.createTemplate({
    ...validatedTemplate,
    category,
    channelId,
    status: "pending",
    createdBy,
  });
  console.log("💾 Template created locally:", template);

  // Get channel info
  const channel = await storage.getChannel(channelId);
  if (!channel) throw new AppError(400, "Channel not found");
  console.log("📡 Channel details:", channel);

  // Prepare WhatsApp API payload
  try {
    const whatsappApi = new WhatsAppApiService(channel);

    const components: any[] = [];

  // HEADER (optional)
if (validatedTemplate.header) {
  components.push({
    type: "HEADER",
    format: "TEXT",
    text: validatedTemplate.header,
  });
}


    // BODY (always required)
    components.push({
      type: "BODY",
      text: validatedTemplate.body,
      example: {
        body_text: samples, // ✅ must be array of arrays
      },
    });

    // FOOTER (optional)
    if (validatedTemplate.footer) {
      components.push({
        type: "FOOTER",
        text: validatedTemplate.footer,
      });
    }

    // BUTTONS (optional)
    if (validatedTemplate.buttons?.length > 0) {
      components.push({
        type: "BUTTONS",
        buttons: validatedTemplate.buttons.map((btn) => {
          const obj: any = { type: btn.type.toUpperCase(), text: btn.text };
          if (btn.type.toUpperCase() === "URL") obj.url = btn.url;
          if (btn.type.toUpperCase() === "PHONE_NUMBER") obj.phone_number = btn.phoneNumber;
          return obj;
        }),
      });
    }

    const templatePayload = {
      name: validatedTemplate.name,
      category: category.toUpperCase(),
      language: validatedTemplate.language,
      components,
    };

    console.log("📤 WhatsApp API payload:", JSON.stringify(templatePayload, null, 2));

    // Submit to WhatsApp API
    const result = await whatsappApi.createTemplate(templatePayload);
    console.log("✅ WhatsApp API response:", result);

    if (result.id) {
      await storage.updateTemplate(template.id, {
        whatsappTemplateId: result.id,
        status: result.status || "pending",
        category,
      });
      console.log("💾 Template updated with WhatsApp ID and status");
    }

    res.json(template);
  } catch (error) {
    console.error("⚠️ WhatsApp API error:", error);
    console.log(JSON.stringify(error.response?.data, null, 2));;


    res.json({
      ...template,
      warning: "Template created locally but failed to submit to WhatsApp",
    });
  }
});


export const createTemplateyyyy = asyncHandler(async (req: RequestWithChannel, res: Response) => {
  console.log("🚀 Incoming template creation request body:", JSON.stringify(req.body, null, 2));

  // 1️⃣ Validate request body
  const validatedTemplate = req.body;
  console.log("✅ Validated template:", validatedTemplate);

  // 2️⃣ Normalize category
  let category = validatedTemplate.category?.toLowerCase() || "authentication";
  if (!["marketing", "utility", "authentication"].includes(category)) {
    category = "authentication";
  }
  console.log("📌 Using category:", category);

  // 3️⃣ Extract placeholders from body
  const placeholderPattern = /\{\{(\d+)\}\}/g;
  const placeholderMatches = Array.from(validatedTemplate.body.matchAll(placeholderPattern));
  const placeholders = placeholderMatches.map(m => parseInt(m[1], 10)).sort((a, b) => a - b);
  console.log("🔢 Extracted placeholders:", placeholders);

  // 3a️⃣ Ensure placeholders are sequential starting from 1
  for (let i = 0; i < placeholders.length; i++) {
    if (placeholders[i] !== i + 1) {
      throw new AppError(400, "Placeholders must be sequential starting from {{1}}");
    }
  }

  // 4️⃣ Validate samples
  const samples = validatedTemplate.samples;
  console.log("📝 Frontend-provided samples:", samples);
  if (!samples || !Array.isArray(samples) || samples.length !== placeholders.length) {
    throw new AppError(
      400,
      `You must provide ${placeholders.length} sample value(s) for the placeholders`
    );
  }

  // 5️⃣ Determine channelId
  let channelId = validatedTemplate.channelId;
  if (!channelId) {
    const activeChannel = await storage.getActiveChannel();
    if (!activeChannel) throw new AppError(400, "No active channel found. Please configure a channel first.");
    channelId = activeChannel.id;
  }
  console.log("📡 Using channelId:", channelId);

  // 6️⃣ Get logged-in user id
  const createdBy = req.user?.id;
  if (!createdBy) throw new AppError(401, "User not authenticated");
  console.log("👤 Created by userId:", createdBy);

  // 7️⃣ Create template locally
  const template = await storage.createTemplate({
    ...validatedTemplate,
    category,
    channelId,
    status: "pending",
    createdBy,
  });
  console.log("💾 Template created locally:", template);

  // 8️⃣ Get channel info
  const channel = await storage.getChannel(channelId);
  if (!channel) throw new AppError(400, "Channel not found");
  console.log("📡 Channel details:", channel);

  // 9️⃣ Prepare WhatsApp API request
  try {
    const whatsappApi = new WhatsAppApiService(channel);

    const components: any[] = [];

    // Header
    if (validatedTemplate.header) {
      components.push({
        type: "HEADER",
        format: "TEXT",
        text: validatedTemplate.header,
      });
    }

    // Body (with proper 2D array for examples)
    components.push({
      type: "BODY",
      text: validatedTemplate.body,
      example: {
        body_text: samples, // ⭐ WhatsApp requires 2D array
      },
    });

    // Footer
    if (validatedTemplate.footer) {
      components.push({
        type: "FOOTER",
        text: validatedTemplate.footer,
      });
    }

    // Buttons
    if (validatedTemplate.buttons?.length > 0) {
      components.push({
        type: "BUTTONS",
        buttons: validatedTemplate.buttons.map((btn) => {
          const obj: any = {
            type: btn.type.toUpperCase(),
            text: btn.text,
          };
          if (btn.type.toUpperCase() === "URL") obj.url = btn.url;
          if (btn.type.toUpperCase() === "PHONE_NUMBER") obj.phone_number = btn.phoneNumber;
          return obj;
        }),
      });
    }

    const templatePayload = {
      name: validatedTemplate.name,
      category: category.toUpperCase(),
      language: validatedTemplate.language,
      components,
    };

    console.log("📤 WhatsApp API payload:", JSON.stringify(templatePayload, null, 2));

    // 10️⃣ Submit to WhatsApp API
    const result = await whatsappApi.createTemplate(templatePayload);
    console.log("✅ WhatsApp API response:", result);

    if (result.id) {
      await storage.updateTemplate(template.id, {
        whatsappTemplateId: result.id,
        status: result.status || "pending",
        category,
      });
      console.log("💾 Template updated with WhatsApp ID and status");
    }

    res.json(template);

  } catch (error) {
    console.error("⚠️ WhatsApp API error:", error);
    res.json({
      ...template,
      warning: "Template created locally but failed to submit to WhatsApp",
    });
  }
});




export const createTemplateLLLL = asyncHandler(async (req: RequestWithChannel, res: Response) => {
  console.log("Template creation request body:", JSON.stringify(req.body, null, 2));

  // 1️⃣ Validate request body
  const validatedTemplate = insertTemplateSchema.parse(req.body);

  // 2️⃣ Validate category
  let category = validatedTemplate.category.toLowerCase();
  if (!["marketing", "utility", "authentication"].includes(category)) {
    category = "authentication";
  }

  // 3️⃣ Extract placeholders from body and sort numerically
  const placeholderPattern = /\{\{(\d+)\}\}/g;
  const placeholderMatches = Array.from(validatedTemplate.body.matchAll(placeholderPattern));

  const placeholders = placeholderMatches
    .map((m) => parseInt(m[1], 10))
    .sort((a, b) => a - b);

  // 3a️⃣ Validate placeholders are sequential starting from 1
  for (let i = 0; i < placeholders.length; i++) {
    if (placeholders[i] !== i + 1) {
      throw new AppError(400, "Placeholders must be sequential starting from {{1}}");
    }
  }

  // 4️⃣ Generate sample values
  const sampleValues = placeholders.map((num) => `sample_${num}`);

  // 5️⃣ Get active channel if channelId not provided
  let channelId = validatedTemplate.channelId;
  if (!channelId) {
    const activeChannel = await storage.getActiveChannel();
    if (!activeChannel) throw new AppError(400, 'No active channel found. Please configure a channel first.');
    channelId = activeChannel.id;
  }

  // 6️⃣ Get logged-in user id
  const createdBy = req.user?.id;
  if (!createdBy) throw new AppError(401, "User not authenticated");

  // 7️⃣ Create template in local storage
  const template = await storage.createTemplate({
    ...validatedTemplate,
    category,
    channelId,
    status: "pending",
    createdBy,
  });

  // 8️⃣ Get channel details
  const channel = await storage.getChannel(channelId);
  if (!channel) throw new AppError(400, 'Channel not found');

  // 9️⃣ Submit to WhatsApp API
  try {
    const whatsappApi = new WhatsAppApiService(channel);

    // Construct payload
    const templatePayload = {
      name: validatedTemplate.name,
      category: category.toUpperCase(),
      language: validatedTemplate.language,
      components: [
        // Body
        {
          type: "BODY",
          text: validatedTemplate.body,
          example: {
            body_text: sampleValues
          }
        },
        // Header (optional)
        ...(validatedTemplate.header
          ? [
              {
                type: "HEADER",
                format: "TEXT",
                text: validatedTemplate.header
              }
            ]
          : []),
        // Footer (optional)
        ...(validatedTemplate.footer
          ? [
              {
                type: "FOOTER",
                text: validatedTemplate.footer
              }
            ]
          : []),
        // Buttons (optional)
        ...(validatedTemplate.buttons && validatedTemplate.buttons.length > 0
          ? [
              {
                type: "BUTTONS",
                buttons: validatedTemplate.buttons.map((btn) => ({
                  type: btn.type.toUpperCase(),
                  text: btn.text
                }))
              }
            ]
          : [])
      ]
    };

    // Send to WhatsApp API
    const result = await whatsappApi.createTemplate(templatePayload);

    if (result.id) {
      await storage.updateTemplate(template.id, {
        whatsappTemplateId: result.id,
        status: result.status || "pending",
        category,
      });
    }

    res.json(template);
  } catch (error) {
    console.error("WhatsApp API error:", error);
    res.json({
      ...template,
      warning: "Template created locally but failed to submit to WhatsApp",
    });
  }
});



export const createTemplatechhh = asyncHandler(async (req: RequestWithChannel, res: Response) => {
  console.log("Template creation request body:", JSON.stringify(req.body, null, 2));

  // 1️⃣ Validate request body
  const validatedTemplate = insertTemplateSchema.parse(req.body);

  // 2️⃣ Validate category
  let category = validatedTemplate.category.toLowerCase();
  if (!["marketing", "utility", "authentication"].includes(category)) {
    category = "authentication";
  }

  // 3️⃣ Extract placeholders from body
  const placeholderPattern = /\{\{\d+\}\}/g;
  const placeholders = validatedTemplate.body.match(placeholderPattern) || [];

  // 4️⃣ Generate sample values for WhatsApp API
  const sampleValues = placeholders.map((p, i) => `sample_${i + 1}`);
  
  // 5️⃣ Get active channel if channelId not provided
  let channelId = validatedTemplate.channelId;
  if (!channelId) {
    const activeChannel = await storage.getActiveChannel();
    if (!activeChannel) throw new AppError(400, 'No active channel found. Please configure a channel first.');
    channelId = activeChannel.id;
  }

  // 6️⃣ Get logged-in user id
  const createdBy = req.user?.id;
  if (!createdBy) throw new AppError(401, "User not authenticated");

  // 7️⃣ Create template in local storage
  const template = await storage.createTemplate({
    ...validatedTemplate,
    category,
    channelId,
    status: "pending",
    createdBy,
  });

  // 8️⃣ Get channel details
  const channel = await storage.getChannel(channelId);
  if (!channel) throw new AppError(400, 'Channel not found');

  // 9️⃣ Submit to WhatsApp API
  try {
    const whatsappApi = new WhatsAppApiService(channel);

    // Construct payload for WhatsApp API with sample values
    const templatePayload = {
      name: validatedTemplate.name,
      category: category.toUpperCase(),
      language: validatedTemplate.language,
      components: [
        {
          type: "BODY",
          text: validatedTemplate.body,
          example: {
            body_text: [sampleValues]
          }
        }
      ],
      header: validatedTemplate.header ? [{ type: "TEXT", text: validatedTemplate.header }] : undefined,
      footer: validatedTemplate.footer ? [{ type: "TEXT", text: validatedTemplate.footer }] : undefined,
      buttons: validatedTemplate.buttons || undefined
    };

    const result = await whatsappApi.createTemplate(templatePayload);

    if (result.id) {
      await storage.updateTemplate(template.id, {
        whatsappTemplateId: result.id,
        status: result.status || "pending",
        category,
      });
    }

    res.json(template);
  } catch (error) {
    console.error("WhatsApp API error:", error);
    res.json({
      ...template,
      warning: "Template created locally but failed to submit to WhatsApp",
    });
  }
});



export const createTemplateOLD = asyncHandler(async (req: RequestWithChannel, res: Response) => {
  console.log("Template creation request body:", JSON.stringify(req.body, null, 2));

  // 1️⃣ Validate request body
  const validatedTemplate = insertTemplateSchema.parse(req.body);

  // 2️⃣ Validate category and placeholders
  const { category, body, buttons } = validatedTemplate;

  // Default category to 'authentication' if unsafe
  let finalCategory: "marketing" | "utility" | "authentication" = category as any;
  if (!["marketing", "utility", "authentication"].includes(category)) {
    finalCategory = "authentication";
  }

  // Check for placeholders {{1}}, {{2}} etc.
  const placeholderPattern = /\{\{\d+\}\}/g;
  const foundPlaceholders = body.match(placeholderPattern) || [];

  if ((finalCategory === "marketing" || finalCategory === "utility") && foundPlaceholders.length === 0) {
    console.warn("⚠️ No placeholders found. Switching to authentication to prevent rejection.");
    finalCategory = "authentication";
  }

  // 3️⃣ Get active channel if channelId not provided
  let channelId = validatedTemplate.channelId;
  if (!channelId) {
    const activeChannel = await storage.getActiveChannel();
    if (!activeChannel) {
      throw new AppError(400, 'No active channel found. Please configure a channel first.');
    }
    channelId = activeChannel.id;
  }

  // 4️⃣ Get logged-in user id
  const createdBy = req.user?.id;
  if (!createdBy) {
    throw new AppError(401, "User not authenticated");
  }

  // 5️⃣ Create template in local storage
  const template = await storage.createTemplate({
    ...validatedTemplate,
    category: finalCategory,
    channelId,
    status: "pending",
    createdBy,
  });

  // 6️⃣ Get channel details
  const channel = await storage.getChannel(channelId);
  if (!channel) throw new AppError(400, 'Channel not found');

  // 7️⃣ Submit to WhatsApp API
  try {
    const whatsappApi = new WhatsAppApiService(channel);

    // Adjust body to ensure placeholders exist for marketing/utility
    const adjustedBody =
      (finalCategory === "marketing" || finalCategory === "utility") && foundPlaceholders.length === 0
        ? "Hello {{1}}" // Minimal placeholder to prevent rejection
        : body;

    const result = await whatsappApi.createTemplate({
      ...validatedTemplate,
      body: adjustedBody,
      category: finalCategory,
      buttons,
    });

    if (result.id) {
      await storage.updateTemplate(template.id, {
        whatsappTemplateId: result.id,
        status: result.status || "pending",
        category: finalCategory,
      });
    }

    res.json(template);
  } catch (error) {
    console.error("WhatsApp API error:", error);
    res.json({
      ...template,
      warning: "Template created locally but failed to submit to WhatsApp",
    });
  }
});



export const createTemplateOLDDD = asyncHandler(async (req: RequestWithChannel, res: Response) => {
  console.log("Template creation request body:", JSON.stringify(req.body, null, 2));
  
  // 1️⃣ Validate request body
  const validatedTemplate = insertTemplateSchema.parse(req.body);
  console.log("Validated template buttons:", validatedTemplate.buttons);

  // 2️⃣ Get active channel if channelId not provided
  let channelId = validatedTemplate.channelId;
  if (!channelId) {
    const activeChannel = await storage.getActiveChannel();
    if (!activeChannel) {
      throw new AppError(400, 'No active channel found. Please configure a channel first.');
    }
    channelId = activeChannel.id;
  }

  // 3️⃣ Get logged-in user id (assume auth middleware sets req.user)
  const createdBy = req.user?.id;
  if (!createdBy) {
    throw new AppError(401, "User not authenticated");
  }

  // 4️⃣ Create template in storage
  const template = await storage.createTemplate({
    ...validatedTemplate,
    channelId,
    status: "pending",
    createdBy,
  });

  // 5️⃣ Get channel details
  const channel = await storage.getChannel(channelId);
  if (!channel) {
    throw new AppError(400, 'Channel not found');
  }

  // 6️⃣ Format and submit to WhatsApp API
  try {
    const whatsappApi = new WhatsAppApiService(channel);
    const result = await whatsappApi.createTemplate(validatedTemplate);

    // Update template with WhatsApp ID
    if (result.id) {
      await storage.updateTemplate(template.id, {
        whatsappTemplateId: result.id,
        status: result.status || "pending"
      });
    }

    res.json(template);
  } catch (error) {
    console.error("WhatsApp API error:", error);
    res.json({
      ...template,
      warning: "Template created locally but failed to submit to WhatsApp"
    });
  }
});


// *************************
// UPDATE TEMPLATE CONTROLLER
// *************************

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


async function waitForTemplateDeletionOLD(api: WhatsAppApiService, templateName: string) {
  console.log(`⏳ Waiting for WhatsApp to finish deleting template: ${templateName}`);

  for (let i = 0; i < 12; i++) {   // ~12 × 5 sec = 60 seconds max wait
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

    try {
      const status = await api.getTemplateStatus(templateName);

      // If template no longer exists, deletion complete
      if (status === "NOT_FOUND" || status === "DELETED") {
        console.log("✅ Template deletion confirmed by WhatsApp");
        return;
      }

      console.log(`⌛ Still deleting... status = ${status}`);
    } catch (error) {
      // 404 → template not found → deletion done
      console.log("✅ Template deletion completed (404 Not Found)");
      return;
    }
  }

  throw new Error("🚨 Timeout: WhatsApp still deleting template after 60 seconds");
}


export const updateTemplateOLDD = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedData = req.body;

  const existingTemplate = await storage.getTemplate(id);
  if (!existingTemplate) throw new AppError(404, "Template not found");

  const updatedTemplate = await storage.updateTemplate(id, validatedData);
  const channel = await storage.getChannel(updatedTemplate.channelId!);
  if (!channel) throw new AppError(400, "Channel not found");

  const whatsappApi = new WhatsAppApiService(channel);

  // ============================
  //     CHECK + DELETE FLOW
  // ============================
  if (existingTemplate.whatsappTemplateId) {
    try {
      console.log("🗑 Checking if WhatsApp template exists:", existingTemplate.name);

      // NEW: check existing template on WhatsApp
      const exists = await whatsappApi.checkTemplateExists(existingTemplate.name);

      if (!exists) {
        console.log(`⚠️ Template ${existingTemplate.name} does NOT exist on WhatsApp. Skipping delete.`);
      } else {
        console.log("🗑 Deleting existing WhatsApp template:", existingTemplate.name);
        await whatsappApi.deleteTemplate(existingTemplate.name);

        // NEW: wait only if delete actually happened
        await waitForTemplateDeletion(whatsappApi, existingTemplate.name);
      }

      console.log("🆕 Creating updated WhatsApp template...");
      const result = await whatsappApi.createTemplate(validatedData);

      if (result.id) {
        await storage.updateTemplate(updatedTemplate.id, {
          whatsappTemplateId: result.id,
          status: result.status || "pending",
        });
      }

      return res.json({
        ...updatedTemplate,
        message: "Template updated and resubmitted to WhatsApp for approval",
      });

    } catch (err) {
      console.error("❌ WhatsApp API error:", err);
      return res.json({
        ...updatedTemplate,
        warning: "Template updated locally but failed to resubmit to WhatsApp",
      });
    }
  }

  // ============================
  //     NEW TEMPLATE SUBMISSION
  // ============================
  try {
    const result = await whatsappApi.createTemplate(validatedData);
    if (result.id) {
      await storage.updateTemplate(updatedTemplate.id, {
        whatsappTemplateId: result.id,
        status: result.status || "pending",
      });
    }

    return res.json({
      ...updatedTemplate,
      message: "Template updated and submitted to WhatsApp for approval",
    });
  } catch (err) {
    console.error("WhatsApp API error:", err);
    return res.json({
      ...updatedTemplate,
      warning: "Template updated locally but failed to submit to WhatsApp",
    });
  }
});



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
          mediaId = await whatsappApi.uploadMediaBufferForTemplate(
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

export const syncTemplates = asyncHandler(async (req: RequestWithChannel, res: Response) => {
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