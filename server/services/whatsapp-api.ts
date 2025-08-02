import { WhatsappChannel, MessageQueue } from "@shared/schema";
import { db } from "../db";
import { whatsappChannels, messageQueue, apiLogs } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

export interface WhatsAppMessage {
  to: string;
  type: "text" | "template" | "image" | "document" | "audio" | "video";
  text?: {
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: Array<{
      type: string;
      parameters: Array<{
        type: string;
        text?: string;
        image?: {
          link: string;
        };
      }>;
    }>;
  };
}

export interface WhatsAppApiResponse {
  messaging_product: string;
  contacts?: Array<{
    input: string;
    wa_id: string;
  }>;
  messages?: Array<{
    id: string;
  }>;
  error?: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
  };
}

export class WhatsAppApiService {
  private static CLOUD_API_BASE_URL = "https://graph.facebook.com/v18.0";
  private static MM_LITE_API_BASE_URL = "https://graph.facebook.com/v18.0"; // MM Lite uses same base URL but different endpoint

  private static async logApiRequest(
    channelId: string,
    requestType: string,
    endpoint: string,
    method: string,
    requestBody: any,
    responseStatus: number,
    responseBody: any,
    duration: number
  ) {
    try {
      await db.insert(apiLogs).values({
        channelId,
        requestType,
        endpoint,
        method,
        requestBody,
        responseStatus,
        responseBody,
        duration,
      });
    } catch (error) {
      console.error("Failed to log API request:", error);
    }
  }

  static async sendMessage(
    channel: WhatsappChannel,
    message: WhatsAppMessage,
    useMMlite: boolean = false
  ): Promise<WhatsAppApiResponse> {
    const startTime = Date.now();
    
    // Determine endpoint based on API type
    const endpoint = useMMlite && channel.mmLiteEnabled
      ? `${this.MM_LITE_API_BASE_URL}/${channel.phoneNumberId}/mm_messages` // MM Lite endpoint
      : `${this.CLOUD_API_BASE_URL}/${channel.phoneNumberId}/messages`; // Standard Cloud API

    const requestBody = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      ...message,
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${channel.accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();
      const duration = Date.now() - startTime;

      await this.logApiRequest(
        channel.id,
        "send_message",
        endpoint,
        "POST",
        requestBody,
        response.status,
        responseData,
        duration
      );

      if (!response.ok) {
        throw new Error(responseData.error?.message || "Failed to send message");
      }

      return responseData;
    } catch (error) {
      const duration = Date.now() - startTime;
      await this.logApiRequest(
        channel.id,
        "send_message",
        endpoint,
        "POST",
        requestBody,
        500,
        { error: error instanceof Error ? error.message : String(error) },
        duration
      );
      throw error;
    }
  }

  static async sendTemplateMessage(
    channel: WhatsappChannel,
    recipientPhone: string,
    templateName: string,
    templateParams: any[] = [],
    languageCode: string = "en_US",
    useMMlite: boolean = false
  ): Promise<WhatsAppApiResponse> {
    const components = templateParams.length > 0 ? [{
      type: "body",
      parameters: templateParams.map(param => ({
        type: "text",
        text: param
      }))
    }] : undefined;

    const message: WhatsAppMessage = {
      to: recipientPhone,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: languageCode,
        },
        ...(components && { components }),
      },
    };

    return this.sendMessage(channel, message, useMMlite);
  }

  static async getTemplates(channel: WhatsappChannel): Promise<any> {
    const startTime = Date.now();
    const endpoint = `${this.CLOUD_API_BASE_URL}/${channel.wabaId}/message_templates`;

    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${channel.accessToken}`,
        },
      });

      const responseData = await response.json();
      const duration = Date.now() - startTime;

      await this.logApiRequest(
        channel.id,
        "get_templates",
        endpoint,
        "GET",
        null,
        response.status,
        responseData,
        duration
      );

      if (!response.ok) {
        throw new Error(responseData.error?.message || "Failed to get templates");
      }

      return responseData.data || [];
    } catch (error) {
      const duration = Date.now() - startTime;
      await this.logApiRequest(
        channel.id,
        "get_templates",
        endpoint,
        "GET",
        null,
        500,
        { error: error instanceof Error ? error.message : String(error) },
        duration
      );
      throw error;
    }
  }

  static async verifyPhoneNumber(channel: WhatsappChannel): Promise<any> {
    const startTime = Date.now();
    const endpoint = `${this.CLOUD_API_BASE_URL}/${channel.phoneNumberId}`;

    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${channel.accessToken}`,
        },
      });

      const responseData = await response.json();
      const duration = Date.now() - startTime;

      await this.logApiRequest(
        channel.id,
        "verify_phone",
        endpoint,
        "GET",
        null,
        response.status,
        responseData,
        duration
      );

      if (!response.ok) {
        throw new Error(responseData.error?.message || "Failed to verify phone number");
      }

      return responseData;
    } catch (error) {
      const duration = Date.now() - startTime;
      await this.logApiRequest(
        channel.id,
        "verify_phone",
        endpoint,
        "GET",
        null,
        500,
        { error: error instanceof Error ? error.message : String(error) },
        duration
      );
      throw error;
    }
  }

  static async getBusinessProfile(channel: WhatsappChannel): Promise<any> {
    const startTime = Date.now();
    const endpoint = `${this.CLOUD_API_BASE_URL}/${channel.phoneNumberId}/whatsapp_business_profile`;

    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${channel.accessToken}`,
        },
      });

      const responseData = await response.json();
      const duration = Date.now() - startTime;

      await this.logApiRequest(
        channel.id,
        "get_profile",
        endpoint,
        "GET",
        null,
        response.status,
        responseData,
        duration
      );

      if (!response.ok) {
        throw new Error(responseData.error?.message || "Failed to get business profile");
      }

      return responseData.data?.[0] || {};
    } catch (error) {
      const duration = Date.now() - startTime;
      await this.logApiRequest(
        channel.id,
        "get_profile",
        endpoint,
        "GET",
        null,
        500,
        { error: error instanceof Error ? error.message : String(error) },
        duration
      );
      throw error;
    }
  }

  // Rate limiting helper
  static async checkRateLimit(channelId: string): Promise<boolean> {
    // Simple rate limiting check - can be enhanced with Redis or in-memory store
    const recentMessages = await db
      .select()
      .from(messageQueue)
      .where(
        and(
          eq(messageQueue.channelId, channelId),
          eq(messageQueue.status, "sent"),
          sql`${messageQueue.processedAt} > NOW() - INTERVAL '1 second'`
        )
      )
      .limit(250); // WhatsApp limit is 250 msg/sec

    return recentMessages.length < 250;
  }
}