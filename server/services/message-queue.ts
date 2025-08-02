import { db } from "../db";
<<<<<<< HEAD
import { messageQueue, channels, campaigns } from "@shared/schema";
=======
import { messageQueue, whatsappChannels, campaigns } from "@shared/schema";
>>>>>>> 2a6e854b (Enable campaign creation and manage WhatsApp channel configurations)
import { eq, and, lte, isNull, sql } from "drizzle-orm";
import { WhatsAppApiService } from "./whatsapp-api";

export class MessageQueueService {
  private static isProcessing = false;
  private static processingInterval: NodeJS.Timeout | null = null;

  // Start processing the message queue
  static startProcessing(intervalMs: number = 1000) {
    if (this.processingInterval) {
      return;
    }

    this.processingInterval = setInterval(() => {
      if (!this.isProcessing) {
        this.processQueue();
      }
    }, intervalMs);

    console.log("Message queue processing started");
  }

  // Stop processing the message queue
  static stopProcessing() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log("Message queue processing stopped");
    }
  }

  // Process queued messages
  private static async processQueue() {
    this.isProcessing = true;

    try {
      // Get messages that are ready to be sent
      const messages = await db
        .select()
        .from(messageQueue)
        .where(
          and(
            eq(messageQueue.status, "queued"),
            lte(messageQueue.attempts, 3),
            and(
              isNull(messageQueue.scheduledFor),
              sql`${messageQueue.scheduledFor} <= NOW()`
            )
          )
        )
        .limit(10); // Process 10 messages at a time

      for (const message of messages) {
        await this.processMessage(message);
      }
    } catch (error) {
      console.error("Error processing message queue:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  // Process a single message
  private static async processMessage(message: any) {
    try {
      // Update status to processing
      await db
        .update(messageQueue)
        .set({ 
          status: "processing",
          processedAt: new Date()
        })
        .where(eq(messageQueue.id, message.id));

      // Get the channel
      const [channel] = await db
        .select()
<<<<<<< HEAD
        .from(channels)
        .where(eq(channels.id, message.channelId))
=======
        .from(whatsappChannels)
        .where(eq(whatsappChannels.id, message.channelId))
>>>>>>> 2a6e854b (Enable campaign creation and manage WhatsApp channel configurations)
        .limit(1);

      if (!channel) {
        throw new Error(`Channel not found: ${message.channelId}`);
      }

      // Check rate limit
      const canSend = await WhatsAppApiService.checkRateLimit(channel.id);
      if (!canSend) {
        // Reschedule for later
        await db
          .update(messageQueue)
          .set({ 
            status: "queued",
            scheduledFor: new Date(Date.now() + 5000) // Try again in 5 seconds
          })
          .where(eq(messageQueue.id, message.id));
        return;
      }

<<<<<<< HEAD
      // Determine if we should use marketing_messages endpoint
      const isMarketing = message.messageType === "marketing" && 
                         message.sentVia !== "cloud_api"; // Allow forcing standard API
=======
      // Determine if we should use MM Lite
      const useMMlite = message.messageType === "marketing" && 
                       channel.mmLiteEnabled === true && 
                       message.sentVia !== "cloud_api"; // Allow forcing standard API
>>>>>>> 2a6e854b (Enable campaign creation and manage WhatsApp channel configurations)

      // Send the message
      let response;
      if (message.templateName) {
        response = await WhatsAppApiService.sendTemplateMessage(
          channel,
          message.recipientPhone,
          message.templateName,
          message.templateParams || [],
          "en_US",
<<<<<<< HEAD
          isMarketing
=======
          useMMlite
>>>>>>> 2a6e854b (Enable campaign creation and manage WhatsApp channel configurations)
        );
      } else {
        // For non-template messages (future implementation)
        throw new Error("Non-template messages not yet implemented");
      }

      // Update message with success
      await db
        .update(messageQueue)
        .set({
          status: "sent",
          whatsappMessageId: response.messages?.[0]?.id,
<<<<<<< HEAD
          sentVia: isMarketing ? "marketing_messages" : "cloud_api",
=======
          sentVia: useMMlite ? "mm_lite" : "cloud_api",
>>>>>>> 2a6e854b (Enable campaign creation and manage WhatsApp channel configurations)
          attempts: message.attempts + 1
        })
        .where(eq(messageQueue.id, message.id));

      // Update campaign sent count if part of a campaign
      if (message.campaignId) {
        await db
          .update(campaigns)
          .set({
            sentCount: sql`${campaigns.sentCount} + 1`
          })
          .where(eq(campaigns.id, message.campaignId));
      }

      console.log(`Message sent successfully: ${message.id}`);
    } catch (error) {
      console.error(`Failed to send message ${message.id}:`, error);

      // Update message with failure
      await db
        .update(messageQueue)
        .set({
          status: message.attempts >= 2 ? "failed" : "queued",
          attempts: message.attempts + 1,
          errorCode: error instanceof Error ? error.name : "UNKNOWN_ERROR",
          errorMessage: error instanceof Error ? error.message : String(error),
          scheduledFor: message.attempts < 2 
            ? new Date(Date.now() + Math.pow(2, message.attempts + 1) * 1000) // Exponential backoff
            : null
        })
        .where(eq(messageQueue.id, message.id));

      // Update campaign failed count if it's a final failure
      if (message.campaignId && message.attempts >= 2) {
        await db
          .update(campaigns)
          .set({
            failedCount: sql`${campaigns.failedCount} + 1`
          })
          .where(eq(campaigns.id, message.campaignId));
      }
    }
  }

  // Queue messages for a campaign
  static async queueCampaignMessages(
    campaignId: string,
    channelId: string,
    recipients: string[],
    templateName: string,
    templateParams: any[] = [],
    messageType: string = "marketing",
    scheduledFor?: Date
  ): Promise<number> {
    const messagesToQueue = recipients.map(phone => ({
      campaignId,
      channelId,
      recipientPhone: phone,
      templateName,
      templateParams,
      messageType,
      status: "queued" as const,
      scheduledFor
    }));

    // Insert in batches to avoid overwhelming the database
    const batchSize = 100;
    let totalQueued = 0;

    for (let i = 0; i < messagesToQueue.length; i += batchSize) {
      const batch = messagesToQueue.slice(i, i + batchSize);
      await db.insert(messageQueue).values(batch);
      totalQueued += batch.length;
    }

    return totalQueued;
  }

  // Get queue statistics
  static async getQueueStats() {
    const stats = await db
      .select({
        status: messageQueue.status,
        count: sql<number>`count(*)::int`
      })
      .from(messageQueue)
      .groupBy(messageQueue.status);

    return stats.reduce((acc, stat) => {
      if (stat.status) {
        acc[stat.status] = stat.count;
      }
      return acc;
    }, {} as Record<string, number>);
  }

  // Clear failed messages older than X days
  static async clearOldFailedMessages(daysOld: number = 7) {
    const result = await db
      .delete(messageQueue)
      .where(
        and(
          eq(messageQueue.status, "failed"),
          sql`${messageQueue.createdAt} < NOW() - INTERVAL '${daysOld} days'`
        )
      );

    return result;
  }
}