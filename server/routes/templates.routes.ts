import type { Express } from "express";
import * as templatesController from "../controllers/templates.controller";
import { validateRequest } from "../middlewares/validation.middleware";
import { insertTemplateSchema } from "@shared/schema";
import { extractChannelId } from "../middlewares/channel.middleware";

export function registerTemplateRoutes(app: Express) {
  // Get all templates
  app.get("/api/templates",
    extractChannelId,
    templatesController.getTemplates
  );

  // Get single template
  app.get("/api/templates/:id", templatesController.getTemplate);

  // Create template
  app.post("/api/templates",
    validateRequest(insertTemplateSchema),
    templatesController.createTemplate
  );

  // Update template
  app.put("/api/templates/:id", templatesController.updateTemplate);

  // Delete template
  app.delete("/api/templates/:id", templatesController.deleteTemplate);

  // Sync templates with WhatsApp
  app.post("/api/templates/sync", templatesController.syncTemplates);

  // Seed templates
  app.post("/api/templates/seed",
    extractChannelId,
    templatesController.seedTemplates
  );
}