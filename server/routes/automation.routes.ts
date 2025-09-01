import { z } from "zod";
import type { Express } from "express";

import { insertAutomationSchema, insertAutomationNodeSchema } from "@shared/schema";
import { requireAuth } from "../middlewares/auth.middleware";
import { extractChannelId } from "../middlewares/channel.middleware";
import * as automationController from "../controllers/automation.controller";

// Schema for automation + nodes (used for builder save)
const automationWithNodesSchema = z.object({
  automation: insertAutomationSchema,
  nodes: z.array(insertAutomationNodeSchema),
});

export function registerAutomationRoutes(app: Express) {
  //
  // ─── AUTOMATION CRUD ──────────────────────────────────────────────
  //

  // Get all automations
  app.get(
    "/api/automations",
    requireAuth,
    extractChannelId,
    automationController.getAutomations
  );

  // Get single automation with nodes
  app.get(
    "/api/automations/:id",
    requireAuth,
    extractChannelId,
    automationController.getAutomation
  );

  // Create automation
  app.post(
    "/api/automations",
    requireAuth,
    extractChannelId,
    automationController.createAutomation
  );

  // Update automation
  app.put(
    "/api/automations/:id",
    requireAuth,
    extractChannelId,
    automationController.updateAutomation
  );

  // Delete automation
  app.delete(
    "/api/automations/:id",
    requireAuth,
    extractChannelId,
    automationController.deleteAutomation
  );

  // Toggle status active/inactive
  app.post(
    "/api/automations/:id/toggle",
    requireAuth,
    extractChannelId,
    automationController.toggleAutomation
  );

  //
  // ─── NODES (visual builder) ──────────────────────────────────────
  //

  // Save automation nodes (bulk replace from builder)
  app.post(
    "/api/automations/:automationId/nodes",
    requireAuth,
    extractChannelId,
    automationController.saveAutomationNodes
  );

    // Save automation edges (bulk replace from builder)
  app.post(
    "/api/automations/:automationId/edges",
    requireAuth,
    extractChannelId,
    automationController.saveAutomationNodes
  );

  //
  // ─── EXECUTION ───────────────────────────────────────────────────
  //

  // Start execution for a contact/conversation
  app.post(
    "/api/automations/:automationId/executions",
    requireAuth,
    extractChannelId,
    automationController.startAutomationExecution
  );

  // Log node execution (worker will call this per node)
  app.post(
    "/api/automations/executions/:executionId/logs",
    requireAuth,
    extractChannelId,
    automationController.logAutomationNodeExecution
  );
}
