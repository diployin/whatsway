import type { Request, Response } from "express";
import { db } from "../db"; 
import {
  automations,
  automationNodes,
  automationExecutions,
  automationExecutionLogs,
  insertAutomationSchema,
  automationEdges,
} from "@shared/schema";
import { eq , and } from "drizzle-orm";
import { AppError, asyncHandler } from "../middlewares/error.middleware";
import { storage } from "server/storage";
import { executionService } from "server/services/automation-execution.service";

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
        .leftJoin(automationEdges, eq(automations.id, automationEdges.automationId))
        .where(eq(automations.channelId, channelId))
        : await db.select()
        .from(automations)
        .leftJoin(automationNodes, eq(automations.id, automationNodes.automationId))
        .leftJoin(automationEdges, eq(automations.id, automationEdges.automationId))

  // Group by automation ID and collect nodes
  const automationMap = new Map<string, any>();

  for (const row of rows) {
    const automation = row.automations;
    const node = row.automation_nodes;
    const edge = row.automation_edges;

    // If automation not already added, add it
    if (!automationMap.has(automation.id)) {
      automationMap.set(automation.id, {
        ...automation,
        automation_nodes: [],
      automation_edges: []
      });
    }

    // If a node exists, add it to the automation's nodes
    if (node && node.id) {
      automationMap.get(automation.id).automation_nodes.push(node);
    }

      // If an edge exists, add it to the automation's edges
  if (edge && edge.id) {
    automationMap.get(automation.id).automation_edges.push(edge);
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
  const { name, description, trigger, triggerConfig, nodes = [] , edges=[] } = req.body;
// console.log("Creating automation with data:", req.body); // Debug log
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

  // console.log(nodes)
  // optional: insert initial nodes
  if (nodes.length) {
    await db.insert(automationNodes).values(
      nodes.map((n: any) => ({
        automationId: automation.id,
        nodeId: n.id,
        type: n.type,
        subtype: n.subtype,
        position: n.position,
        data: n.data,
        connections: n.connections,
      }))
    );
  }
// console.log("Edges:", edges); // Debug log
  if (edges.length) {
    await db.insert(automationEdges).values(
      edges.map((n: any) => ({
        id: n.id,
        automationId: automation.id,
        sourceNodeId: n.source,
        targetNodeId: n.target,
        animated: n.animated,
      }))
    );
  }

  res.status(201).json(automation);
});

// UPDATE automation
export const updateAutomation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nodes = [], edges = [], ...automationData } = req.body;

  // Update automation main record
  const [automation] = await db
    .update(automations)
    .set(automationData)
    .where(eq(automations.id, id))
    .returning();

  if (!automation) {
    throw new AppError(404, "Automation not found");
  }

  console.log("Updating automation with ID:", automation.id);

  // Delete existing nodes for this automation
 const getDlt = await db
    .delete(automationNodes)
    .where(eq(automationNodes.automationId, automation.id));
console.log("Deleted nodes result:", getDlt , automation.id); // Debug log
  // Insert new nodes if provided
  if (nodes.length > 0) {
    const insertedNodes = await db.insert(automationNodes).values(
      nodes.map((node: any) => ({
        automationId: automation.id,
        nodeId: node.id,
        type: node.type,
        subtype: node.subtype,
        position: node.position,
        data: node.data,
        connections: node.connections,
      }))
    );
    console.log("Inserted nodes:", insertedNodes.length);
  }

  // Delete existing edges
  await db
    .delete(automationEdges)
    .where(eq(automationEdges.automationId, automation.id));

  // Insert new edges if provided
  if (edges.length > 0) {
    const insertedEdges = await db.insert(automationEdges).values(
      edges.map((edge: any) => ({
        id: edge.id,
        automationId: automation.id,
        sourceNodeId: edge.source,
        targetNodeId: edge.target,
        animated: edge.animated,
      }))
    );
    console.log("Inserted edges:", insertedEdges.length);
  }

  // Respond with updated automation
  res.json(automation);
});


// DELETE automation (cascade deletes nodes + executions due to schema)
export const deleteAutomation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log("Deleting automation with id:", id); // Debug log

  const deleted = await db
    .delete(automations)
    .where(eq(automations.id, id))
    .returning();

  console.log("Deleted rows:", deleted, deleted.length); // Debug log

  if (!deleted.length) throw new AppError(404, "Automation not found");

  // Return a success response properly
  res.status(200).json({ deleted: deleted[0] }); // or res.status(204).send()
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
console.log("Saving nodes for automationId:", automationId, "Nodes:", nodes); // Debug log
  // Delete old nodes
const getDelete =   await db.delete(automationNodes).where(eq(automationNodes.automationId, automationId));
console.log("Deleted nodes result:", getDelete); // Debug log
  // Insert new nodes
  if (nodes?.length) {
  const getNodes =   await db.insert(automationNodes).values(
      nodes.map((n: any) => ({
        automationId,
        nodeId: n.id,
        type: n.type,
        subtype: n.subtype,
        position: n.position,
        data: n.data,
        connections: n.connections,
      }))
      );
      console.log("Inserted nodes result:", getNodes)
  }

  res.json({ success: true });
});


// Add or update edges (bulk save from visual builder)
export const saveAutomationEdges = asyncHandler(async (req: Request, res: Response) => {
  const { automationId } = req.params;
  const { edges } = req.body;

  // Delete old edges
  await db.delete(automationEdges).where(eq(automationEdges.automationId, automationId));

  // Insert new edges
  if (edges?.length) {
    await db.insert(automationEdges).values(
      edges.map((n: any) => ({
        id: n.id,
        automationId: automationId,
        sourceNodeId: n.source,
        targetNodeId: n.target,
        animated: n.animated,
      }))
    );
  }

  res.json({ success: true });
});


//
// ─── EXECUTION ─────────────────────────────────────────────────────────
//

// Start execution for a contact/conversation
// export const startAutomationExecution = asyncHandler(async (req: Request, res: Response) => {
//   const { automationId } = req.params;
//   const { contactId, conversationId, triggerData } = req.body;

//   const [execution] = await db.insert(automationExecutions).values({
//     automationId,
//     contactId,
//     conversationId,
//     triggerData,
//     status: "running",
//   }).returning();

//   // TODO: kick off worker/queue to actually run nodes step-by-step

//   res.status(201).json(execution);
// });

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



// UPDATED: Start execution for a contact/conversation
export const startAutomationExecution = asyncHandler(async (req: Request, res: Response) => {
  const { automationId } = req.params;
  const { contactId, conversationId, triggerData } = req.body;

  // Create execution record
  const [execution] = await db.insert(automationExecutions).values({
    automationId,
    contactId,
    conversationId,
    triggerData,
    status: "running",
  }).returning();

  // Start actual execution using the service
  try {
    // Execute in background (don't await to avoid timeout)
    executionService.executeAutomation(execution.id).catch((error) => {
      console.error(`Background execution failed for ${execution.id}:`, error);
    });

    res.status(201).json({
      ...execution,
      message: "Execution started successfully"
    });
  } catch (error) {
    console.error(`Failed to start execution:`, error);
    
    // Update execution status to failed
    await db.update(automationExecutions)
      .set({ 
        status: 'failed', 
        completedAt: new Date(),
        result: error.message 
      })
      .where(eq(automationExecutions.id, execution.id));

    throw new AppError(500, `Failed to start automation execution: ${error.message}`);
  }
});


export const startAutomationExecutionFunction = asyncHandler(
  async (contactId: string, conversationId: string, triggerData: any = {}) => {
    // Create execution record in the database

    const getAutomations = await db.query.automations.findMany({
      where: (fields) => 
        and(
          eq(fields.trigger, 'new_conversation'),
          eq(fields.status, 'active')
        )
    }); 
    
    for (const automation of getAutomations) {
      console.log("Found automation for new conversation trigger:", automation.id, automation.name);
 

    const [execution] = await db.insert(automationExecutions).values({
      automationId:automation.id,
      contactId,
      conversationId,
      triggerData,
      status: "running",
    }).returning();

    try {
      // Start automation in background
      executionService.executeAutomation(execution.id).catch((error) => {
        console.error(`Background execution failed for ${execution.id}:`, error);
      });

      // Return execution info (or you could log it, etc.)
      return {
        ...execution,
        message: "Execution started successfully"
      };
    } catch (error: any) {
      console.error(`Failed to start execution:`, error);

      // Mark execution as failed in DB
      await db.update(automationExecutions)
        .set({ 
          status: 'failed', 
          completedAt: new Date(),
          result: error.message 
        })
        .where(eq(automationExecutions.id, execution.id));

      throw new AppError(500, `Failed to start automation execution: ${error.message}`);
    }
  }
  }
);


// NEW: Manual test endpoint
export const testAutomation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { conversationId , contactId } = req.body;
  
  console.log("Testing automation with id:", id, "Body:", req.body); // Debug log
  
  // Check if automation exists and is active
  const automation = await db.query.automations.findFirst({
    where: eq(automations.id, id),
  });

  if (!automation) {
    throw new AppError(404, "Automation not found");
  }

  // Create test execution
  const [execution] = await db.insert(automationExecutions).values({
    automationId: id,
    contactId,
    conversationId,
    triggerData: {
      trigger: 'manual_test',
      timestamp: new Date(),
      testMode: true
    },
    status: "running",
  }).returning();

  try {
    // Start execution
    executionService.executeAutomation(execution.id).catch((error) => {
      console.error(`Test execution failed for ${execution.id}:`, error);
    });

    res.status(200).json({
      success: true,
      execution,
      message: `Test execution started for automation: ${automation.name}`
    });
  } catch (error) {
    await db.update(automationExecutions)
      .set({ 
        status: 'failed', 
        completedAt: new Date(),
        result: error.message 
      })
      .where(eq(automationExecutions.id, execution.id));

    throw new AppError(500, `Test execution failed: ${error.message}`);
  }
});

// NEW: Get execution status and logs
export const getExecutionStatus = asyncHandler(async (req: Request, res: Response) => {
  const { executionId } = req.params;

  // Get execution
  const execution = await db.query.automationExecutions.findFirst({
    where: eq(automationExecutions.id, executionId),
  });

  if (!execution) {
    throw new AppError(404, "Execution not found");
  }

  // Get logs
  const logs = await db.select()
    .from(automationExecutionLogs)
    .where(eq(automationExecutionLogs.executionId, executionId))
    .orderBy(automationExecutionLogs.createdAt);

  res.json({
    execution,
    logs,
    logCount: logs.length
  });
});

// NEW: Get automation execution history
export const getAutomationExecutions = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { limit = 10, offset = 0 } = req.query;

  const executions = await db.select()
    .from(automationExecutions)
    .where(eq(automationExecutions.automationId, id))
    .limit(parseInt(limit as string))
    .offset(parseInt(offset as string))
    .orderBy(automationExecutions.createdAt);

  res.json(executions);
});

// NEW: Trigger automation for new conversation (call this from your conversation controller)
export const triggerNewConversation = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId, channelId, contactId } = req.body;

  if (!conversationId || !channelId) {
    throw new AppError(400, "conversationId and channelId are required");
  }

  try {
    await triggerService.handleNewConversation(conversationId, channelId, contactId);
    
    res.json({
      success: true,
      message: "New conversation triggers processed",
      conversationId,
      channelId
    });
  } catch (error) {
    console.error("Error processing new conversation triggers:", error);
    throw new AppError(500, `Failed to process triggers: ${error.message}`);
  }
});

// NEW: Trigger automation for message received
export const triggerMessageReceived = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId, message, channelId, contactId } = req.body;

  if (!conversationId || !message || !channelId) {
    throw new AppError(400, "conversationId, message, and channelId are required");
  }

  try {
    await triggerService.handleMessageReceived(conversationId, message, channelId, contactId);
    
    res.json({
      success: true,
      message: "Message received triggers processed",
      conversationId,
      channelId
    });
  } catch (error) {
    console.error("Error processing message triggers:", error);
    throw new AppError(500, `Failed to process triggers: ${error.message}`);
  }
});