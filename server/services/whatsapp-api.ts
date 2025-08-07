<<<<<<< HEAD
import type { Channel } from '@shared/schema';

interface WhatsAppTemplate {
  id: string;
  status: string;
  name: string;
  language: string;
  category: string;
  components: any[];
}

export class WhatsAppApiService {
  private channel: Channel;
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(channel: Channel) {
    this.channel = channel;
    const apiVersion = process.env.WHATSAPP_API_VERSION || 'v23.0';
    this.baseUrl = `https://graph.facebook.com/${apiVersion}`;
    this.headers = {
      'Authorization': `Bearer ${channel.accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  // Static method for sending template messages
  static async sendTemplateMessage(
    channel: Channel,
    to: string,
    templateName: string,
    parameters: string[] = [],
    language: string = "en_US",
    isMarketing: boolean = true // Marketing messages use MM Lite API
  ): Promise<any> {
    const apiVersion = process.env.WHATSAPP_API_VERSION || 'v23.0';
    const baseUrl = `https://graph.facebook.com/${apiVersion}`;
    
    // Format phone number
    const phoneNumber = to.replace(/\D/g, '');
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber;
    
    const body = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "template",
      template: {
        name: templateName,
        language: { code: language },
        components: parameters.length > 0 ? [{
          type: "body",
          parameters: parameters.map(text => ({ type: "text", text }))
        }] : undefined
      }
    };

    console.log('Sending WhatsApp template message:', {
      to: formattedPhone,
      templateName,
      language,
      parameters,
      phoneNumberId: channel.phoneNumberId,
      isMarketing,
      usingMMLite: isMarketing
    });

    // Use MM Lite API endpoint for marketing messages
    const endpoint = isMarketing 
      ? `${baseUrl}/${channel.phoneNumberId}/marketing_messages`
      : `${baseUrl}/${channel.phoneNumberId}/messages`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${channel.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API Error:', responseData);
      throw new Error(responseData.error?.message || 'Failed to send template message');
    }

    console.log('WhatsApp message sent successfully:', responseData);
    return responseData;
  }

  // Static method for checking rate limits
  static async checkRateLimit(channelId: string): Promise<boolean> {
    // Simple rate limit check - can be enhanced with Redis or database tracking
    return true;
  }

  // Format phone number to international format
  private formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If number doesn't start with country code, add it
    // Assuming India code 91 if not specified (based on the test number +919310797700)
    if (cleaned.length === 10) {
      // Indian number without country code
      cleaned = '91' + cleaned;
    }
    
    return cleaned;
  }

  // Deprecated - MM Lite now uses marketing_messages endpoint in sendTemplateMessage
  // Keeping for backward compatibility but routes to sendTemplateMessage
  private async sendMMliteMessage(to: string, templateName: string, parameters: string[] = [], language: string = "en_US"): Promise<any> {
    return WhatsAppApiService.sendTemplateMessage(
      this.channel,
      to,
      templateName,
      parameters,
      language,
      true // isMarketing = true for MM Lite
    );
  }

  async createTemplate(templateData: any): Promise<any> {
    const components = this.formatTemplateComponents(templateData);
    
    const body = {
      name: templateData.name,
      category: templateData.category,
      language: templateData.language,
      components
    };

    const response = await fetch(
      `${this.baseUrl}/${this.channel.whatsappBusinessAccountId}/message_templates`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to create template');
    }

    return await response.json();
  }

  async deleteTemplate(templateName: string): Promise<any> {
    // WhatsApp API requires template name to delete
    const response = await fetch(
      `${this.baseUrl}/${this.channel.whatsappBusinessAccountId}/message_templates?name=${encodeURIComponent(templateName)}`,
      {
        method: 'DELETE',
        headers: this.headers
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to delete template');
    }

    return await response.json();
  }

  async getTemplates(): Promise<WhatsAppTemplate[]> {
    const response = await fetch(
      `${this.baseUrl}/${this.channel.whatsappBusinessAccountId}/message_templates?fields=id,status,name,language,category,components&limit=100`,
      {
        headers: this.headers
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch templates');
    }

    const data = await response.json();
    return data.data || [];
  }

  async sendMessage(to: string, templateName: string, parameters: string[] = []): Promise<any> {
    const formattedPhone = this.formatPhoneNumber(to);
    const body = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "template",
      template: {
        name: templateName,
        language: { code: "en_US" },
        components: parameters.length > 0 ? [{
          type: "body",
          parameters: parameters.map(text => ({ type: "text", text }))
        }] : undefined
      }
    };

    console.log('Sending WhatsApp message:', {
      to: formattedPhone,
      templateName,
      parameters,
      phoneNumberId: this.channel.phoneNumberId
    });

    const response = await fetch(
      `${this.baseUrl}/${this.channel.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(body)
      }
    );

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('WhatsApp API Error:', responseData);
      throw new Error(responseData.error?.message || 'Failed to send message');
    }

    console.log('WhatsApp message sent successfully:', responseData);
    return responseData;
  }

  async sendTextMessage(to: string, text: string): Promise<any> {
    const formattedPhone = this.formatPhoneNumber(to);
    const body = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "text",
      text: { body: text }
    };

    const response = await fetch(
      `${this.baseUrl}/${this.channel.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to send message');
    }

    return await response.json();
  }

  async sendDirectMessage(payload: any): Promise<any> {
    // Format phone number if 'to' field exists
    if (payload.to) {
      payload.to = this.formatPhoneNumber(payload.to);
    }
    
    const body = {
      messaging_product: "whatsapp",
      ...payload
    };

    const response = await fetch(
      `${this.baseUrl}/${this.channel.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to send message');
    }

    const data = await response.json();
    return { success: true, data };
  }

  private formatTemplateComponents(templateData: any): any[] {
    const components = [];
    
    // Handle media header if present
    if (templateData.mediaType && templateData.mediaType !== 'text') {
      const headerFormat = templateData.mediaType.toUpperCase();
      if (templateData.header) {
        components.push({
          type: "HEADER",
          format: headerFormat,
          text: templateData.header,
          example: templateData.mediaUrl ? {
            header_handle: [templateData.mediaUrl]
          } : undefined
        });
      }
    } else if (templateData.header) {
      components.push({
        type: "HEADER",
        format: "TEXT",
        text: templateData.header
      });
    }
    
    // Body component
    components.push({
      type: "BODY",
      text: templateData.body
    });
    
    // Footer component
    if (templateData.footer) {
      components.push({
        type: "FOOTER",
        text: templateData.footer
      });
    }
    
    // Buttons
    if (templateData.buttons && templateData.buttons.length > 0) {
      components.push({
        type: "BUTTONS",
        buttons: templateData.buttons.map((button: any) => {
          if (button.type === 'url') {
            return {
              type: "URL",
              text: button.text,
              url: button.url
            };
          } else if (button.type === 'phone') {
            return {
              type: "PHONE_NUMBER",
              text: button.text,
              phone_number: button.phoneNumber
            };
          } else {
            return {
              type: "QUICK_REPLY",
              text: button.text
            };
          }
        })
      });
    }

    return components;
  }

  async getMessageStatus(whatsappMessageId: string): Promise<any> {
    // WhatsApp doesn't provide a direct API to get message status by ID
    // Status updates come through webhooks, so we'll return a mock response
    // In production, you would store webhook status updates and query from database
    return {
      status: 'sent',
      deliveredAt: null,
      readAt: null,
      errorCode: null,
      errorMessage: null
    };
=======
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

interface HealthCheckResult {
  status: "active" | "error" | "inactive";
  messageLimit?: number;
  messagesUsed?: number;
  error?: string;
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
  ): Promise<{ success: boolean; data?: WhatsAppApiResponse; error?: string }> {
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

      // Log API request (with error handling for foreign key constraint)
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
        return {
          success: false,
          error: responseData.error?.message || "Failed to send message"
        };
      }

      return {
        success: true,
        data: responseData
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Try to log but don't fail if logging fails
      try {
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
      } catch (logError) {
        console.error("Failed to log API request:", logError);
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }

  static async checkHealth(channel: WhatsappChannel): Promise<HealthCheckResult> {
    try {
      // Check WhatsApp Business Account details and message limits
      const endpoint = `${this.CLOUD_API_BASE_URL}/${channel.businessAccountId || channel.phoneNumberId}`;
      
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${channel.accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          status: "error",
          error: errorData.error?.message || "Failed to check health"
        };
      }

      const data = await response.json();
      
      // For now, if we can fetch the account, it's active
      // In a real implementation, you would parse the response for actual limits
      return {
        status: "active",
        messageLimit: 1000, // Default limit, should be fetched from API
        messagesUsed: 0, // Should be calculated from actual usage
      };
    } catch (error) {
      return {
        status: "error",
        error: error instanceof Error ? error.message : "Health check failed"
      };
    }
  }

  static async sendTemplateMessage(
    channel: WhatsappChannel,
    recipientPhone: string,
    templateName: string,
    templateParams: any[] = [],
    languageCode: string = "en_US",
    useMMlite: boolean = false
  ): Promise<{ success: boolean; data?: WhatsAppApiResponse; error?: string }> {
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
>>>>>>> 2a6e854b (Enable campaign creation and manage WhatsApp channel configurations)
  }
}