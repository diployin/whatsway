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
import { storage } from "../storage";
import { executionService, triggerService } from "../services/automation-execution.service";
import fs from "fs/promises";
import path from "path";
//
// ─── AUTOMATIONS (flows) ───────────────────────────────────────────────
//


// ─── Node & Edge Types ─────────────────────────
interface Node {
  id: string;
  automationId: string;
  nodeId: string;
  type: string;
  subtype?: string | null;
  position: Record<string, any>;
  measured: Record<string, any>;
  data: Record<string, any>;
  connections: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface Edge {
  id: string;
  automationId: string;
  sourceNodeId: string;
  targetNodeId: string;
  animated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Automation Type ─────────────────────────
interface Automation {
  id: string;
  channelId: string | null;
  name: string;
  description?: string | null;
  trigger: string;
  triggerConfig: any;
  status: string;
  executionCount: number;
  lastExecutedAt?: Date | null;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
  automation_nodes: Node[];
  automation_edges: Edge[];
}

// GET all automations (optionally by channelId)
export const getAutomations = asyncHandler(async (req: Request, res: Response) => {
  const channelId = req.query.channelId as string | undefined;

  // Fetch all rows with optional channelId filter
  const rows = channelId
    ? await db.select()
        .from(automations)
        .leftJoin(automationNodes, eq(automations.id, automationNodes.automationId))
        .leftJoin(automationEdges, eq(automations.id, automationEdges.automationId))
        .where(eq(automations.channelId, channelId))
    : await db.select()
        .from(automations)
        .leftJoin(automationNodes, eq(automations.id, automationNodes.automationId))
        .leftJoin(automationEdges, eq(automations.id, automationEdges.automationId));

  const automationMap = new Map<string, Automation>();

  for (const row of rows) {
    const automationRow = row.automations as Omit<Automation, "automation_nodes" | "automation_edges">;
    const node = row.automation_nodes as Node | null;
    const edge = row.automation_edges as Edge | null;

    if (!automationMap.has(automationRow.id)) {
      automationMap.set(automationRow.id, {
        ...automationRow,
        automation_nodes: [],
        automation_edges: [],
      });
    }

    const automationEntry = automationMap.get(automationRow.id)!;

    // Add node if not already in the array
    if (node && !automationEntry.automation_nodes.some((n: Node) => n.id === node.id)) {
      automationEntry.automation_nodes.push(node);
    }

    // Add edge if not already in the array
    if (edge && !automationEntry.automation_edges.some((e: Edge) => e.id === edge.id)) {
      automationEntry.automation_edges.push(edge);
    }
  }

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
// export const createAutomation = asyncHandler(async (req: Request, res: Response) => {
//   const { name, description, trigger, triggerConfig, nodes = [], edges = [] } = req.body;
//   console.log("Creating automation with data:", req.body); // Debug log
//   const validatedAutomation = insertAutomationSchema.parse(req.body);
  
//   // Get active channel if channelId not provided
//   let channelId = validatedAutomation.channelId;
//   if (!channelId) {
//     const activeChannel = await storage.getActiveChannel();
//     if (activeChannel) {
//       channelId = activeChannel.id;
//     }
//   }
  
//   const [automation] = await db.insert(automations).values({
//     name,
//     description,
//     channelId,
//     trigger,
//     triggerConfig,
//   }).returning();

//   // Process nodes and handle file uploads
//   if (nodes.length) {
//     const processedNodes = await Promise.all(
//       nodes.map(async (node: any) => {
//         const processedData = { ...node.data };
        
//         // Handle file uploads in custom_reply and user_reply nodes
//         if (node.type === 'custom_reply' || node.type === 'user_reply') {
//           // Handle image files
//           if (processedData.imageFile && Object.keys(processedData.imageFile).length > 0) {
//             try {
//               const savedFile = await saveUploadedFile(processedData.imageFile, 'images');
//               processedData.imageFile = savedFile;
//               // Update imagePreview to use the saved file path
//               processedData.imagePreview = `/uploads/images/${savedFile.filename}`;
//             } catch (error) {
//               console.error('Error saving image file:', error);
//               processedData.imageFile = null;
//               processedData.imagePreview = null;
//             }
//           }
          
//           // Handle video files
//           if (processedData.videoFile && Object.keys(processedData.videoFile).length > 0) {
//             try {
//               const savedFile = await saveUploadedFile(processedData.videoFile, 'videos');
//               processedData.videoFile = savedFile;
//               processedData.videoPreview = `/uploads/videos/${savedFile.filename}`;
//             } catch (error) {
//               console.error('Error saving video file:', error);
//               processedData.videoFile = null;
//               processedData.videoPreview = null;
//             }
//           }
          
//           // Handle audio files
//           if (processedData.audioFile && Object.keys(processedData.audioFile).length > 0) {
//             try {
//               const savedFile = await saveUploadedFile(processedData.audioFile, 'audio');
//               processedData.audioFile = savedFile;
//               processedData.audioPreview = `/uploads/audio/${savedFile.filename}`;
//             } catch (error) {
//               console.error('Error saving audio file:', error);
//               processedData.audioFile = null;
//               processedData.audioPreview = null;
//             }
//           }
          
//           // Handle document files
//           if (processedData.documentFile && Object.keys(processedData.documentFile).length > 0) {
//             try {
//               const savedFile = await saveUploadedFile(processedData.documentFile, 'documents');
//               processedData.documentFile = savedFile;
//               processedData.documentPreview = `/uploads/documents/${savedFile.filename}`;
//             } catch (error) {
//               console.error('Error saving document file:', error);
//               processedData.documentFile = null;
//               processedData.documentPreview = null;
//             }
//           }
//         }
        
//         return {
//           automationId: automation.id,
//           nodeId: node.id,
//           type: node.type,
//           subtype: node.subtype,
//           position: node.position,
//           data: processedData,
//           connections: node.connections,
//           measured: node.measured,
//         };
//       })
//     );
    
//     await db.insert(automationNodes).values(processedNodes);
//   }

//   if (edges.length) {
//     await db.insert(automationEdges).values(
//       edges.map((edge: any) => ({
//         id: edge.id,
//         automationId: automation.id,
//         sourceNodeId: edge.source,
//         targetNodeId: edge.target,
//         animated: edge.animated,
//       }))
//     );
//   }

//   res.status(201).json(automation);
// });

export const createAutomation = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { name, description, trigger, triggerConfig, nodes, edges } = req.body;
    const validatedAutomation = insertAutomationSchema.parse(req.body);

    // Get active channel if not provided
    let channelId = validatedAutomation.channelId;
    if (!channelId) {
      const activeChannel = await storage.getActiveChannel();
      if (activeChannel) {
        channelId = activeChannel.id;
      }
    }

    // Parse nodes and edges safely
    let parsedNodes: any[] = [];
    let parsedEdges: any[] = [];

    try {
      parsedNodes = typeof nodes === "string" ? JSON.parse(nodes) : nodes;
      if (!Array.isArray(parsedNodes)) parsedNodes = [];
    } catch {
      parsedNodes = [];
    }

    try {
      parsedEdges = typeof edges === "string" ? JSON.parse(edges) : edges;
      if (!Array.isArray(parsedEdges)) parsedEdges = [];
    } catch {
      parsedEdges = [];
    }

    // ✅ Attach uploaded files (supports both local + cloud uploads)
    if (req.files && Array.isArray(req.files)) {
      const files = req.files as (Express.Multer.File & { cloudUrl?: string })[];

      for (const file of files) {
        // Match fieldname format: node_<nodeId>_<field>
        const match = file.fieldname.match(/^node_(.+)_(.+)$/);
        if (!match) continue;

        const nodeId = `node_${match[1]}`;
        const field = match[2];
        const node = parsedNodes.find((n) => n.id === nodeId);
        if (!node || !node.data) continue;

        // Check if file is uploaded to cloud or stored locally
        const isCloudFile = !!file.cloudUrl;
        const filePath = file.cloudUrl || `/uploads/${path.basename(path.dirname(file.path))}/${file.filename}`;

        console.log(`📤 Processing media: ${isCloudFile ? "Cloud" : "Local"} (${filePath})`);

        node.data[field] = {
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          path: filePath,
        };

        // Optional: set a preview field if it exists
        node.data[`${field.replace("File", "Preview")}`] = filePath;
      }
    }

    // ✅ Save automation
    const [automation] = await db
      .insert(automations)
      .values({
        name,
        description,
        channelId,
        trigger,
        triggerConfig: JSON.parse(triggerConfig || "{}"),
      })
      .returning();

    // ✅ Save nodes
    for (const node of parsedNodes) {
      await db.insert(automationNodes).values({
        automationId: automation.id,
        nodeId: node.id,
        type: node.type,
        position: node.position,
        measured: node.measured,
        data: node.data,
      });
    }

    // ✅ Save edges
    for (const edge of parsedEdges) {
      await db.insert(automationEdges).values({
        id: edge.id,
        automationId: automation.id,
        sourceNodeId: edge.source,
        targetNodeId: edge.target,
        animated: !!edge.animated,
      });
    }

    res.json({
      success: true,
      automation,
      nodes: parsedNodes,
      edges: parsedEdges,
    });
  } catch (err: any) {
    console.error("❌ Automation creation failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});




// Helper function to save uploaded files
async function saveUploadedFile(file: Express.Multer.File, folder: string) {
  const uploadPath = path.join("uploads", folder);
  await fs.mkdir(uploadPath, { recursive: true });

  const filename = Date.now() + "-" + file.originalname;
  const destPath = path.join(uploadPath, filename);

  if (file.buffer) {
    // memoryStorage
    await fs.writeFile(destPath, file.buffer);
  } else if (file.path) {
    // diskStorage
    await fs.copyFile(file.path, destPath);
  }

  return {
    filename,
    path: `/uploads/${folder}/${filename}`,
  };
}


// UPDATE automation
export const updateAutomation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, trigger, triggerConfig, nodes, edges, ...rest } = req.body;

  // ✅ Parse safely
  let parsedNodes: any[] = [];
  let parsedEdges: any[] = [];

  try {
    parsedNodes = typeof nodes === "string" ? JSON.parse(nodes) : nodes;
    if (!Array.isArray(parsedNodes)) parsedNodes = [];
  } catch {
    parsedNodes = [];
  }

  try {
    parsedEdges = typeof edges === "string" ? JSON.parse(edges) : edges;
    if (!Array.isArray(parsedEdges)) parsedEdges = [];
  } catch {
    parsedEdges = [];
  }

  // ✅ Attach uploaded files (supports both local + cloud)
  if (req.files && Array.isArray(req.files)) {
    const files = req.files as (Express.Multer.File & { cloudUrl?: string })[];

    for (const file of files) {
      // fieldname format: node_<nodeId>_<field>
      const match = file.fieldname.match(/^node_(.+)_(.+)$/);
      if (!match) continue;

      const nodeId = `node_${match[1]}`;
      const field = match[2];
      const node = parsedNodes.find((n) => n.id === nodeId);
      if (!node || !node.data) continue;

      const isCloudFile = !!file.cloudUrl;
      const filePath =
        file.cloudUrl ||
        `/uploads/${path.basename(path.dirname(file.path))}/${file.filename}`;

      console.log(`📤 Updating media: ${isCloudFile ? "Cloud" : "Local"} (${filePath})`);

      node.data[field] = {
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: filePath,
      };

      node.data[`${field.replace("File", "Preview")}`] = filePath;
    }
  }

  // ✅ Update main automation record
  const [automation] = await db
    .update(automations)
    .set({
      name,
      description,
      trigger,
      triggerConfig: JSON.parse(triggerConfig || "{}"),
      ...rest,
    })
    .where(eq(automations.id, id))
    .returning();

  if (!automation) {
    throw new AppError(404, "Automation not found");
  }

  console.log(`🔄 Updating automation with ID: ${automation.id}`);

  // ✅ Delete existing nodes & edges before reinserting
  await db.delete(automationNodes).where(eq(automationNodes.automationId, automation.id));
  await db.delete(automationEdges).where(eq(automationEdges.automationId, automation.id));

  // ✅ Insert updated nodes
  if (parsedNodes.length > 0) {
    await db.insert(automationNodes).values(
      parsedNodes.map((node: any) => ({
        automationId: automation.id,
        nodeId: node.id,
        type: node.type,
        subtype: node.subtype,
        position: node.position,
        measured: node.measured,
        data: node.data,
        connections: node.connections,
      }))
    );
  }

  // ✅ Insert updated edges
  if (parsedEdges.length > 0) {
    await db.insert(automationEdges).values(
      parsedEdges.map((edge: any) => ({
        id: edge.id,
        automationId: automation.id,
        sourceNodeId: edge.source,
        targetNodeId: edge.target,
        animated: !!edge.animated,
      }))
    );
  }

  res.json({
    success: true,
    automation,
    nodes: parsedNodes,
    edges: parsedEdges,
  });
});



// DELETE automation (cascade deletes nodes + executions due to schema)
export const deleteAutomation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  // console.log("Deleting automation with id:", id); // Debug log

  const deleted = await db
    .delete(automations)
    .where(eq(automations.id, id))
    .returning();

  // console.log("Deleted rows:", deleted, deleted.length); // Debug log

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
        result: (error as Error).message
      })
      .where(eq(automationExecutions.id, execution.id));

    throw new AppError(500, `Failed to start automation execution: ${(error as Error).message}`);
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
        result: (error as Error).message
      })
      .where(eq(automationExecutions.id, execution.id));

    throw new AppError(500, `Test execution failed: ${(error as Error).message}`);
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
    .orderBy(automationExecutionLogs.executedAt);

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
    .orderBy(automationExecutions.startedAt);

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
    throw new AppError(500, `Failed to process triggers: ${(error as Error).message}`);
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
    throw new AppError(500, `Failed to process triggers: ${(error as Error).message}`);
  }
});