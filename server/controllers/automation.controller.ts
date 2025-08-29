import type { Request, Response } from "express";
import { db } from "../db"; 
import {
  automations,
  automationNodes,
  automationExecutions,
  automationExecutionLogs,
  insertAutomationSchema,
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { AppError, asyncHandler } from "../middlewares/error.middleware";
import { storage } from "server/storage";

//
// ─── AUTOMATIONS (flows) ───────────────────────────────────────────────
//

// GET all automations (optionally by channelId)
export const getAutomations = asyncHandler(async (req: Request, res: Response) => {
  const channelId = req.query.channelId as string | undefined;

  // Query with optional channelId filtering
  const rows = channelId
    ? await db.select()
        .from(automations)
        .leftJoin(automationNodes, eq(automations.id, automationNodes.automationId))
        .where(eq(automations.channelId, channelId))
    : await db.select()
        .from(automations)
        .leftJoin(automationNodes, eq(automations.id, automationNodes.automationId));

  // Group by automation ID and collect nodes
  const automationMap = new Map<string, any>();

  for (const row of rows) {
    const automation = row.automations;
    const node = row.automation_nodes;

    // If automation not already added, add it
    if (!automationMap.has(automation.id)) {
      automationMap.set(automation.id, {
        ...automation,
        automation_nodes: []
      });
    }

    // If a node exists, add it to the automation's nodes
    if (node && node.id) {
      automationMap.get(automation.id).automation_nodes.push(node);
    }
  }

  // Convert the Map to a plain array of objects
  const result = Array.from(automationMap.values());

  res.json(result);
});


// GET single automation (with nodes)
export const getAutomation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const automation = await db.query.automations.findFirst({
    where: eq(automations.id, id),
  });

  if (!automation) throw new AppError(404, "Automation not found");

  const nodes = await db.select().from(automationNodes).where(eq(automationNodes.automationId, id));

  res.json({ ...automation, nodes });
});

// CREATE automation (empty flow or with initial nodes)
export const createAutomation = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, trigger, triggerConfig, nodes = [] } = req.body;
console.log("Creating automation with data:", req.body); // Debug log
const validatedAutomation = insertAutomationSchema.parse(req.body);
  
// Get active channel if channelId not provided
let channelId = validatedAutomation.channelId;
if (!channelId) {
  const activeChannel = await storage.getActiveChannel();
  if (activeChannel) {
    channelId = activeChannel.id;
  }
}
console.log("Using channelId:", channelId); // Debug log
  const [automation] = await db.insert(automations).values({
    name,
    description,
    channelId,
    trigger,
    triggerConfig,
  }).returning();

  // optional: insert initial nodes
  if (nodes.length) {
    await db.insert(automationNodes).values(
      nodes.map((n: any) => ({
        automationId: automation.id,
        nodeId: n.nodeId,
        type: n.type,
        subtype: n.subtype,
        position: n.position,
        data: n.data,
        connections: n.connections,
      }))
    );
  }

  res.status(201).json(automation);
});

// UPDATE automation
export const updateAutomation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const [automation] = await db.update(automations).set(req.body).where(eq(automations.id, id)).returning();

  if (!automation) throw new AppError(404, "Automation not found");

  res.json(automation);
});

// DELETE automation (cascade deletes nodes + executions due to schema)
export const deleteAutomation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log("Deleting automation with id:", id); // Debug log
  const deleted = await db.delete(automations).where(eq(automations.id, id)).returning();

  if (!deleted.length) throw new AppError(404, "Automation not found");

  res.status(204).send();
});

// Toggle active/inactive
export const toggleAutomation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const automation = await db.query.automations.findFirst({
    where: eq(automations.id, id),
  });
  if (!automation) throw new AppError(404, "Automation not found");

  const [updated] = await db.update(automations)
    .set({ status: automation.status === "active" ? "inactive" : "active" })
    .where(eq(automations.id, id))
    .returning();

  res.json(updated);
});


//
// ─── NODES ─────────────────────────────────────────────────────────────
//

// Add or update nodes (bulk save from visual builder)
export const saveAutomationNodes = asyncHandler(async (req: Request, res: Response) => {
  const { automationId } = req.params;
  const { nodes } = req.body;

  // Delete old nodes
  await db.delete(automationNodes).where(eq(automationNodes.automationId, automationId));

  // Insert new nodes
  if (nodes?.length) {
    await db.insert(automationNodes).values(
      nodes.map((n: any) => ({
        automationId,
        nodeId: n.nodeId,
        type: n.type,
        subtype: n.subtype,
        position: n.position,
        data: n.data,
        connections: n.connections,
      }))
    );
  }

  res.json({ success: true });
});


//
// ─── EXECUTION ─────────────────────────────────────────────────────────
//

// Start execution for a contact/conversation
export const startAutomationExecution = asyncHandler(async (req: Request, res: Response) => {
  const { automationId } = req.params;
  const { contactId, conversationId, triggerData } = req.body;

  const [execution] = await db.insert(automationExecutions).values({
    automationId,
    contactId,
    conversationId,
    triggerData,
    status: "running",
  }).returning();

  // TODO: kick off worker/queue to actually run nodes step-by-step

  res.status(201).json(execution);
});

// Log node execution (for debugging/history)
export const logAutomationNodeExecution = asyncHandler(async (req: Request, res: Response) => {
  const { executionId } = req.params;
  const { nodeId, nodeType, status, input, output, error } = req.body;

  const [log] = await db.insert(automationExecutionLogs).values({
    executionId,
    nodeId,
    nodeType,
    status,
    input,
    output,
    error,
  }).returning();

  res.status(201).json(log);
});
