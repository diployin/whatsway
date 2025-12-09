import type { Request, Response } from 'express';
import { storage } from '../storage';
import { insertTemplateSchema } from '@shared/schema';
import { AppError, asyncHandler } from '../middlewares/error.middleware';
import { WhatsAppApiService } from '../services/whatsapp-api';
import type { RequestWithChannel } from '../middlewares/channel.middleware';

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
    const limit = Number(req.query.limit) || 10;

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


export const createTemplate = asyncHandler(async (req: RequestWithChannel, res: Response) => {
  console.log("🚀 Incoming template creation request body:", JSON.stringify(req.body, null, 2));

  const validatedTemplate = req.body;
  console.log("✅ Validated template:", validatedTemplate);

  // Normalize Category
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

  // Validate sequence
  for (let i = 0; i < placeholders.length; i++) {
    if (placeholders[i] !== i + 1) {
      throw new AppError(400, "Placeholders must be sequential starting from {{1}}");
    }
  }

  // Samples
  const samples = validatedTemplate.samples || [];
  console.log("📝 Samples:", samples);

  // Channel ID
  let channelId = validatedTemplate.channelId;
  if (!channelId) {
    const activeChannel = await storage.getActiveChannel();
    if (!activeChannel) throw new AppError(400, "No active channel found. Please configure a channel first.");
    channelId = activeChannel.id;
  }

  console.log("📡 Using channelId:", channelId);

  // User
  const createdBy = req.user?.id;
  if (!createdBy) throw new AppError(401, "User not authenticated");

  console.log("👤 Created by:", createdBy);

  // Save locally
  const template = await storage.createTemplate({
    ...validatedTemplate,
    category,
    channelId,
    status: "pending",
    createdBy,
  });

  console.log("💾 Template created locally:", template);

  // Fetch channel
  const channel = await storage.getChannel(channelId);
  if (!channel) throw new AppError(400, "Channel not found");

  console.log("📡 Channel:", channel);

  try {
    const whatsappApi = new WhatsAppApiService(channel);

    const components: any[] = [];

    // HEADER
    if (validatedTemplate.header) {
      const headerObj: any = {
        type: "HEADER",
        format: "TEXT",
        text: validatedTemplate.header,
      };

      const vars = validatedTemplate.header.match(/{{\d+}}/g);
      if (vars?.length) {
        headerObj.example = {
          header_text: validatedTemplate.headerSamples || [],
        };
      }

      components.push(headerObj);
    }

    // BODY
    const bodyObj: any = {
      type: "BODY",
      text: validatedTemplate.body,
    };

    const bodyVars = validatedTemplate.body.match(/{{\d+}}/g);

    if (bodyVars?.length) {
      bodyObj.example = {
        body_text: [samples],
      };
    }

    components.push(bodyObj);

    // FOOTER
    if (validatedTemplate.footer) {
      components.push({
        type: "FOOTER",
        text: validatedTemplate.footer,
      });
    }

    // BUTTONS
    if (validatedTemplate.buttons?.length > 0) {
      components.push({
        type: "BUTTONS",
        buttons: validatedTemplate.buttons.map((btn) => {
          const obj: any = {
            type: btn.type.toUpperCase(),
            text: btn.text,
          };
          if (btn.type === "url") obj.url = btn.url;
          if (btn.type === "phone") obj.phone_number = btn.phoneNumber;
          return obj;
        }),
      });
    }

    // FINAL PAYLOAD
    const templatePayload = {
      name: validatedTemplate.name,
      category: category.toUpperCase(),
      language: validatedTemplate.language,
      components,
    };

    console.log("📤 WhatsApp API payload:", JSON.stringify(templatePayload, null, 2));

    // ===============================
    // 🌟 SUBMIT TO WHATSAPP (patched)
    // ===============================
    const result = await whatsappApi.createTemplate(templatePayload);
    console.log("✅ WhatsApp API response:", result);

    // Update local DB
    if (result.id) {
      await storage.updateTemplate(template.id, {
        whatsappTemplateId: result.id,
        status: result.status || "pending",
        category,
      });

      console.log("💾 Template updated with WhatsApp ID");
    }

    return res.json(template);

  } catch (err: any) {

    // -----------------------------------------------------------
    // ⭐ NEW SUPER DEBUGGER → SHOW RAW WHATSAPP ERROR ALWAYS ⭐
    // -----------------------------------------------------------
    console.log("------ RAW ERROR START ------");
    console.dir(err, { depth: null });
    console.log("------ RAW ERROR END ------");

    // If fetch() returned a Response with plain text
    if (err.response && typeof err.response.text === "function") {
      const raw = await err.response.text();
      console.log("❌ RAW WHATSAPP TEXT ERROR:", raw);
    }

    console.log("❌ err.response?.data:", err.response?.data);
    console.log("❌ err.response:", err.response);
    console.log("❌ err.request:", err.request);
    console.log("❌ err.message:", err.message);

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





export const updateTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedData = insertTemplateSchema.parse(req.body);
  
  // Get existing template
  const existingTemplate = await storage.getTemplate(id);
  if (!existingTemplate) {
    throw new AppError(404, 'Template not found');
  }
  
  // Update template in database
  const template = await storage.updateTemplate(id, validatedData);
  if (!template) {
    throw new AppError(404, 'Template not found');
  }
  
  // Get channel for WhatsApp API
  const channel = await storage.getChannel(template.channelId!);
  if (!channel) {
    throw new AppError(400, 'Channel not found');
  }
  
  // If template has a WhatsApp ID, delete the old one and create new one
  // (WhatsApp doesn't allow editing approved templates)
  if (existingTemplate.whatsappTemplateId) {
    try {
      const whatsappApi = new WhatsAppApiService(channel);
      
      // Delete old template
      await whatsappApi.deleteTemplate(existingTemplate.name);
      
      // Create new template with updated content
      const result = await whatsappApi.createTemplate(validatedData);
      
      // Update template with new WhatsApp ID
      if (result.id) {
        await storage.updateTemplate(template.id, {
          whatsappTemplateId: result.id,
          status: result.status || "pending"
        });
      }
      
      res.json({
        ...template,
        message: "Template updated and resubmitted to WhatsApp for approval"
      });
    } catch (error) {
      console.error("WhatsApp API error during update:", error);
      res.json({
        ...template,
        warning: "Template updated locally but failed to resubmit to WhatsApp"
      });
    }
  } else {
    // Template was never submitted to WhatsApp, just submit it now
    try {
      const whatsappApi = new WhatsAppApiService(channel);
      const result = await whatsappApi.createTemplate(validatedData);
      
      if (result.id) {
        await storage.updateTemplate(template.id, {
          whatsappTemplateId: result.id,
          status: result.status || "pending"
        });
      }
      
      res.json({
        ...template,
        message: "Template updated and submitted to WhatsApp for approval"
      });
    } catch (error) {
      console.error("WhatsApp API error:", error);
      res.json({
        ...template,
        warning: "Template updated locally but failed to submit to WhatsApp"
      });
    }
  }
});

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