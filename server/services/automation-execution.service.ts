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

export class AutomationExecutionService {
  
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

      // Find first node (position 0 or lowest position)
      const firstNode = automation.nodes.sort((a, b) => a.position - b.position)[0];
      
      if (firstNode) {
        await this.executeNode(firstNode, automation, context);
      } else {
        await this.completeExecution(executionId, 'completed', 'No nodes to execute');
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
   * Find and execute next node
   */
  private async continueToNextNode(currentNode: any, automation: any, context: ExecutionContext) {
    // Find next node by position (simple sequential flow)
    const nextNode = automation.nodes.find((n: any) => n.position === currentNode.position + 1);
    
    if (nextNode) {
      await this.executeNode(nextNode, automation, context);
    } else {
      // No more nodes - complete execution
      await this.completeExecution(context.executionId, 'completed', 'All nodes executed successfully');
    }
  }

  /**
   * Execute custom reply node
   */
  private async executeCustomReply(node: any, context: ExecutionContext) {
    const message = this.replaceVariables(node.data.message || '', context.variables);
    console.log("node & context", node, context);
    console.log(`Sending message to conversation ${context.conversationId}: "${message}"`);
    console.log('Context variables:', context.variables);
    // TODO: Replace with your actual messaging service

    const getContact = await db.query.contacts.findFirst({
        where: eq(contacts?.id, context.contactId),
      });

      console.log('Contact info:', getContact);

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
   * Execute user reply node (question)
   */
  private async executeUserReply(node: any, context: ExecutionContext) {
    const question = this.replaceVariables(node.data.question || '', context.variables);
    
    console.log(`Asking question to conversation ${context.conversationId}: "${question}"`);
    
    // TODO: This is complex - you need to:
    // 1. Send the question
    // 2. Pause execution
    // 3. Wait for user response
    // 4. Resume execution with the response
    
    // For now, just send the question and continue
    // In a real implementation, you'd pause here and resume when user responds
    
    console.log(`✅ Question sent: ${question}`);
    
    return {
      action: 'question_sent',
      question,
      conversationId: context.conversationId,
      saveAs: node.data.saveAs
    };
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
    });

    if (!automation) return null;

    // Get nodes
    const nodes = await db.select()
      .from(automationNodes)
      .where(eq(automationNodes.automationId, automationId));

    // Get edges  
    const edges = await db.select()
      .from(automationEdges)
      .where(eq(automationEdges.automationId, automationId));

    return {
      ...automation,
      nodes: nodes.sort((a, b) => a.position - b.position),
      edges
    };
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
    
    // Similar logic for message-based triggers
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
}

// Export singleton instances
export const executionService = new AutomationExecutionService();
export const triggerService = new AutomationTriggerService();