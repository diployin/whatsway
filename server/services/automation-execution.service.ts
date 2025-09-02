// automation-execution.service.ts
import { db } from "../db";
import {
  automations,
  automationNodes,
  automationExecutions,
  automationExecutionLogs,
  automationEdges,
  contacts,
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { sendBusinessMessage } from "../services/messageService";


interface ExecutionContext {
  executionId: string;
  automationId: string;
  contactId?: string;
  conversationId?: string;
  variables: Record<string, any>;
  triggerData: any;
}

interface PendingExecution {
  executionId: string;
  automationId: string;
  nodeId: string;
  conversationId: string;
  contactId?: string;
  context: ExecutionContext;
  saveAs?: string;
  timestamp: Date;
  status: 'waiting_for_response';
}

export class AutomationExecutionService {
  private pendingExecutions = new Map<string, PendingExecution>();
  /**
   * Start automation execution (called from your controller)
   */
  async executeAutomation(executionId: string) {
    console.log(`Starting execution: ${executionId}`);
    
    try {
      // Get execution record
      const execution = await db.query.automationExecutions.findFirst({
        where: eq(automationExecutions.id, executionId),
      });

      if (!execution) {
        throw new Error(`Execution ${executionId} not found`);
      }

      // Get automation with nodes and edges
      const automation = await this.getAutomationWithFlow(execution.automationId);
      if (!automation) {
        throw new Error(`Automation ${execution.automationId} not found`);
      }

      // Update execution count
      await db.update(automations)
        .set({ 
          executionCount: automation.executionCount + 1,
          lastExecutedAt: new Date()
        })
        .where(eq(automations.id, execution.automationId));

      // Create execution context
      const context: ExecutionContext = {
        executionId: execution.id,
        automationId: execution.automationId,
        contactId: execution.contactId,
        conversationId: execution.conversationId,
        variables: {
          contactId: execution.contactId,
          conversationId: execution.conversationId,
          ...execution.triggerData
        },
        triggerData: execution.triggerData
      };

      // Get first node = no incoming edges
        const firstNode = automation.nodes.find(
          (n: any) => !automation.edges.some((e: any) => e.targetNodeId === n.nodeId)
        );

        if (firstNode) {
          await this.executeNode(firstNode, automation, context);
        } else {
          await this.completeExecution(executionId, 'completed', 'No start node found');
        }

    } catch (error) {
      console.error(`Error executing automation ${executionId}:`, error);
      await this.completeExecution(executionId, 'failed', error.message);
      throw error;
    }
  }

  /**
   * Execute a single node
   */
  private async executeNode(node: any, automation: any, context: ExecutionContext) {
    const startTime = new Date();
    console.log(`Executing node ${node.nodeId} (${node.type})`);

    try {
      // Log node start
      await this.logNodeExecution(
        context.executionId,
        node.nodeId,
        node.type,
        'running',
        node.data,
        null,
        null
      );

      let result: any = null;

      // Execute based on node type
      switch (node.type) {
        case 'custom_reply':
          result = await this.executeCustomReply(node, context);
          break;
          
        case 'user_reply':
          result = await this.executeUserReply(node, context);
          break;
          
        case 'time_gap':
          result = await this.executeTimeGap(node, context);
          return; // Time gap handles its own continuation
          
        case 'send_template':
          result = await this.executeSendTemplate(node, context);
          break;
          
        case 'assign_user':
          result = await this.executeAssignUser(node, context);
          break;
          
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      // Log success
      await this.logNodeExecution(
        context.executionId,
        node.nodeId,
        node.type,
        'completed',
        node.data,
        result,
        null
      );

      // Continue to next node
      await this.continueToNextNode(node, automation, context);

    } catch (error) {
      console.error(`Error executing node ${node.nodeId}:`, error);
      
      // Log error
      await this.logNodeExecution(
        context.executionId,
        node.nodeId,
        node.type,
        'failed',
        node.data,
        null,
        error.message
      );

      // Fail the entire execution
      await this.completeExecution(context.executionId, 'failed', `Node ${node.nodeId} failed: ${error.message}`);
      throw error;
    }
  }

/**
 * Continue to next node(s) using edges
 */
private async continueToNextNode(currentNode: any, automation: any, context: ExecutionContext) {
  // Get outgoing edges
  const outgoingEdges = automation.edges.filter(
    (e: any) => e.sourceNodeId === currentNode.nodeId
  );

  if (outgoingEdges.length === 0) {
    // No more nodes → execution complete
    await this.completeExecution(context.executionId, 'completed', 'All nodes executed successfully');
    return;
  }

  // Follow each edge
  for (const edge of outgoingEdges) {
    const nextNode = automation.nodes.find((n: any) => n.nodeId === edge.targetNodeId);
    if (nextNode) {
      await this.executeNode(nextNode, automation, context);
    }
  }
}



  /**
   * Execute custom reply node
   */
  private async executeCustomReply(node: any, context: ExecutionContext) {
    const message = this.replaceVariables(node.data.message || '', context.variables);
    // console.log("node & context", node, context);
    console.log(`Sending message to conversation ${context.conversationId}: "${message}"`);
    console.log('Context variables:', context.variables);
    // TODO: Replace with your actual messaging service

    const getContact = await db.query.contacts.findFirst({
        where: eq(contacts?.id, context.contactId),
      });

      // console.log('Contact info:', getContact);

      if (getContact?.phone) {
        await sendBusinessMessage({
          to: getContact?.phone,  // make sure you pass recipient
          message,
          channelId: getContact?.channelId, // optional
        });
      }
    
    
    // Mock implementation for now
    console.log(`✅ Message sent: ${message}`);
    
    return {
      action: 'message_sent',
      message,
      conversationId: context.conversationId
    };
  }


  /**
   * Execute user reply node (question) - ENHANCED VERSION
   */
  private async executeUserReply(node: any, automation: any, context: ExecutionContext) {
    const question = this.replaceVariables(node.data.question || '', context.variables);
    
    console.log(`Asking question to conversation ${context.conversationId}: "${question}"`);
    
    // 1. Send the question to the user
    const getContact = await db.query.contacts.findFirst({
      where: eq(contacts?.id, context.contactId),
    });

    if (getContact?.phone) {
      await sendBusinessMessage({
        to: getContact?.phone,
        message: question,
        channelId: getContact?.channelId,
        conversationId: context.conversationId,
      });
    }
    
    // 2. Create a unique pending execution ID
    const pendingId = `${context.executionId}_${node.nodeId}_${Date.now()}`;
    
    // 3. Store the execution state for resumption
    const pendingExecution: PendingExecution = {
      executionId: context.executionId,
      automationId: context.automationId,
      nodeId: node.nodeId,
      conversationId: context.conversationId,
      contactId: context.contactId,
      context: { ...context },
      saveAs: node.data.saveAs,
      timestamp: new Date(),
      status: 'waiting_for_response'
    };
    
    this.pendingExecutions.set(pendingId, pendingExecution);
    
    // 4. Update execution status to paused
    await db.update(automationExecutions)
      .set({
        status: 'paused',
        result: `Waiting for user response to: "${question}"`
      })
      .where(eq(automationExecutions.id, context.executionId));
    
    // 5. Log that we're waiting
    await this.logNodeExecution(
      context.executionId,
      node.nodeId,
      node.type,
      'waiting_for_response',
      { ...node.data, question },
      { pendingId, action: 'question_sent' },
      null
    );
    
    console.log(`✅ Question sent: ${question}`);
    console.log(`⏸️  Execution paused. Waiting for user response (pending ID: ${pendingId})`);
    
    return {
      action: 'execution_paused',
      question,
      conversationId: context.conversationId,
      pendingId,
      saveAs: node.data.saveAs
    };
  }


    /**
   * Handle user response and resume execution - NEW METHOD
   */
  async handleUserResponse(conversationId: string, userResponse: string) {
    console.log(`📨 Received user response for conversation ${conversationId}: "${userResponse}"`);
    
    // Find pending execution for this conversation
    const pendingExecution = this.findPendingExecutionByConversation(conversationId);
    if (!pendingExecution) {
      console.warn(`No pending execution found for conversation ${conversationId}`);
      return null;
    }

    try {
      // Remove from pending
      this.pendingExecutions.delete(pendingExecution.pendingId);
      
      // Update context with user response
      const context = pendingExecution.context;
      if (pendingExecution.saveAs) {
        context.variables[pendingExecution.saveAs] = userResponse;
        console.log(`💾 Saved user response to variable: ${pendingExecution.saveAs} = "${userResponse}"`);
      }

      // Log the response received
      await this.logNodeExecution(
        context.executionId,
        pendingExecution.nodeId,
        'user_reply',
        'completed',
        { question: 'User response received' },
        { userResponse, savedAs: pendingExecution.saveAs },
        null
      );

      // Resume execution status
      await db.update(automationExecutions)
        .set({
          status: 'running',
          result: null
        })
        .where(eq(automationExecutions.id, context.executionId));

      console.log(`▶️  Resuming execution ${context.executionId} with user response`);

      // Get fresh automation data
      const automation = await this.getAutomationWithFlow(context.automationId);
      if (!automation) {
        throw new Error(`Automation ${context.automationId} not found during resume`);
      }

      // Find the current node and continue to next
      const currentNode = automation.nodes.find((n: any) => n.nodeId === pendingExecution.nodeId);
      if (currentNode) {
        await this.continueToNextNode(currentNode, automation, context);
      } else {
        throw new Error(`Node ${pendingExecution.nodeId} not found during resume`);
      }

      return {
        success: true,
        executionId: context.executionId,
        userResponse,
        savedVariable: pendingExecution.saveAs,
        resumedAt: new Date()
      };

    } catch (error) {
      console.error(`Error resuming execution for conversation ${conversationId}:`, error);
      
      // Fail the execution
      await this.completeExecution(
        pendingExecution.executionId, 
        'failed', 
        `Failed to resume after user response: ${error.message}`
      );
      
      throw error;
    }
  }

  /**
   * Find pending execution by conversation ID
   */
  private findPendingExecutionByConversation(conversationId: string) {
    for (const [pendingId, execution] of this.pendingExecutions) {
      if (execution.conversationId === conversationId) {
        return { pendingId, ...execution };
      }
    }
    return null;
  }

  /**
   * Execute time gap node
   */
  private async executeTimeGap(node: any, context: ExecutionContext, automation?: any) {
    const delay = node.data?.delay || 60;
    console.log(`⏳ Delaying execution by ${delay} seconds`);
    
    // Schedule continuation after delay
    setTimeout(async () => {
      try {
        console.log(`⏰ Delay completed, continuing execution`);
        
        // Get fresh automation data
        const freshAutomation = await this.getAutomationWithFlow(context.automationId);
        await this.continueToNextNode(node, freshAutomation, context);
      } catch (error) {
        console.error('Error continuing after delay:', error);
        await this.completeExecution(context.executionId, 'failed', `Delay continuation failed: ${error.message}`);
      }
    }, delay * 1000);

    return {
      action: 'delay_started',
      delay,
      scheduledFor: new Date(Date.now() + delay * 1000)
    };
  }

  /**
   * Execute send template node
   */
  private async executeSendTemplate(node: any, context: ExecutionContext) {
    const templateId = node.data?.templateId;
    
    if (!templateId) {
      throw new Error('No template ID provided');
    }
    
    console.log(`📄 Sending template ${templateId} to conversation ${context.conversationId}`);

    if (context.variables?.to) {
      await sendBusinessMessage({
        to: context.variables.to,
        templateName: templateId,
        parameters: node.data?.parameters || [],
        channelId: context.variables.channelId,
      });
    }
    
    console.log(`✅ Template sent: ${templateId}`);
    
    return {
      action: 'template_sent',
      templateId,
      conversationId: context.conversationId
    };
  }

  /**
   * Execute assign user node
   */
  private async executeAssignUser(node: any, context: ExecutionContext) {
    const assigneeId = node.data?.assigneeId;
    
    if (!assigneeId) {
      throw new Error('No assignee ID provided');
    }
    
    console.log(`👤 Assigning conversation ${context.conversationId} to user ${assigneeId}`);
    
    // TODO: Update conversation assignment
    // if (context.conversationId) {
    //   await db.update(conversations)
    //     .set({ assignedTo: assigneeId })
    //     .where(eq(conversations.id, context.conversationId));
    // }
    
    console.log(`✅ Conversation assigned to: ${assigneeId}`);
    
    return {
      action: 'user_assigned',
      assigneeId,
      conversationId: context.conversationId
    };
  }


  /**
   * Get pending executions for monitoring
   */
  getPendingExecutions() {
    return Array.from(this.pendingExecutions.entries()).map(([pendingId, execution]) => ({
      pendingId,
      executionId: execution.executionId,
      conversationId: execution.conversationId,
      nodeId: execution.nodeId,
      contactId: execution.contactId,
      saveAs: execution.saveAs,
      timestamp: execution.timestamp,
      waitingTime: Date.now() - execution.timestamp.getTime()
    }));
  }

  /**
   * Check if conversation has pending execution
   */
  hasPendingExecution(conversationId: string): boolean {
    return this.findPendingExecutionByConversation(conversationId) !== null;
  }

  /**
   * Clean up expired pending executions (call this periodically)
   */
  async cleanupExpiredExecutions(timeoutMs: number = 30 * 60 * 1000) { // 30 minutes default
    const now = Date.now();
    const expired = [];
    
    for (const [pendingId, execution] of this.pendingExecutions) {
      if (now - execution.timestamp.getTime() > timeoutMs) {
        expired.push({ pendingId, execution });
      }
    }
    
    for (const { pendingId, execution } of expired) {
      this.pendingExecutions.delete(pendingId);
      
      // Mark execution as failed due to timeout
      await this.completeExecution(
        execution.executionId,
        'failed',
        'Execution timed out waiting for user response'
      );
      
      console.warn(`⚠️  Cleaned up expired execution: ${pendingId} (conversation: ${execution.conversationId})`);
    }
    
    return expired.length;
  }

  /**
   * Cancel pending execution
   */
  async cancelExecution(conversationId: string): Promise<boolean> {
    const pending = this.findPendingExecutionByConversation(conversationId);
    if (pending) {
      this.pendingExecutions.delete(pending.pendingId);
      await this.completeExecution(pending.executionId, 'failed', 'Execution cancelled by user');
      console.log(`❌ Cancelled execution for conversation: ${conversationId}`);
      return true;
    }
    return false;
  }

  /**
   * Complete execution
   */
  private async completeExecution(executionId: string, status: 'completed' | 'failed', result: string) {
    await db.update(automationExecutions)
      .set({
        status,
        completedAt: new Date(),
        result
      })
      .where(eq(automationExecutions.id, executionId));

    console.log(`🏁 Execution ${executionId} ${status}: ${result}`);
  }

  /**
   * Log node execution
   */
  private async logNodeExecution(
    executionId: string,
    nodeId: string,
    nodeType: string,
    status: string,
    input: any,
    output: any,
    error: string | null
  ) {
    await db.insert(automationExecutionLogs).values({
      executionId,
      nodeId,
      nodeType,
      status,
      input: JSON.stringify(input),
      output: JSON.stringify(output),
      error
    });
  }

  /**
   * Replace variables in text
   */
  private replaceVariables(text: string, variables: Record<string, any>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  /**
   * Get automation with nodes and edges
   */
  private async getAutomationWithFlow(automationId: string) {
    // Get automation
    const automation = await db.query.automations.findFirst({
      where: eq(automations.id, automationId),
      with: {
        nodes: true,
        edges: true,
      },
    });
  
    return automation;
  }
}







// Trigger Manager - handles when automations should start
export class AutomationTriggerService {
  private executionService: AutomationExecutionService;

  constructor() {
    this.executionService = new AutomationExecutionService();
  }

  /**
   * Handle new conversation trigger
   */
  async handleNewConversation(conversationId: string, channelId: string, contactId?: string) {
    console.log(`🎯 New conversation trigger: ${conversationId}`);
    
    // Find active automations with "new_conversation" trigger
    const activeAutomations = await db.select()
      .from(automations)
      .where(and(
        eq(automations.channelId, channelId),
        eq(automations.trigger, 'new_conversation'),
        eq(automations.status, 'active')
      ));

    console.log(`Found ${activeAutomations.length} active automation(s)`);

    // Start execution for each automation
    for (const automation of activeAutomations) {
      try {
        // Create execution record
        const [execution] = await db.insert(automationExecutions).values({
          automationId: automation.id,
          contactId,
          conversationId,
          triggerData: {
            trigger: 'new_conversation',
            channelId,
            timestamp: new Date()
          },
          status: 'running'
        }).returning();

        // Start execution
        await this.executionService.executeAutomation(execution.id);

      } catch (error) {
        console.error(`Failed to execute automation ${automation.id}:`, error);
      }
    }
  }

  /**
   * Handle message received trigger
   */
  async handleMessageReceived(conversationId: string, message: any, channelId: string, contactId?: string) {
    console.log(`💬 Message received trigger: ${conversationId}`);
    
    // First, check if this is a response to a pending user_reply node
    if (this.executionService.hasPendingExecution(conversationId)) {
      console.log(`📨 Processing as user response to pending execution`);
      try {
        await this.executionService.handleUserResponse(conversationId, message.content || message.text || message);
        return; // Don't trigger new automations if this was a response
      } catch (error) {
        console.error(`Error handling user response:`, error);
        // Continue to trigger new automations as fallback
      }
    }
    
    // Normal message-based automation triggers
    const activeAutomations = await db.select()
      .from(automations)
      .where(and(
        eq(automations.channelId, channelId),
        eq(automations.trigger, 'message_received'),
        eq(automations.status, 'active')
      ));

    for (const automation of activeAutomations) {
      try {
        const [execution] = await db.insert(automationExecutions).values({
          automationId: automation.id,
          contactId,
          conversationId,
          triggerData: {
            trigger: 'message_received',
            message,
            channelId,
            timestamp: new Date()
          },
          status: 'running'
        }).returning();

        await this.executionService.executeAutomation(execution.id);
      } catch (error) {
        console.error(`Failed to execute automation ${automation.id}:`, error);
      }
    }
  }

    /**
   * Get execution service for external access
   */
    getExecutionService() {
      return this.executionService;
    }
}

// Export singleton instances
export const executionService = new AutomationExecutionService();
export const triggerService = new AutomationTriggerService();


// Periodic cleanup (run this somewhere in your app)
setInterval(() => {
  executionService.cleanupExpiredExecutions();
}, 5 * 60 * 1000); // Every 5 minutes