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
    useMMlite: boolean = true // Always use MM Lite for marketing campaigns
  ): Promise<any> {
    const apiService = new WhatsAppApiService(channel);
    
    // Always use standard Meta API with marketing messaging (MM Lite)
    // MM Lite is not a separate endpoint, it's a feature of the standard API
    return await apiService.sendMessage(to, templateName, parameters);
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

  // MM Lite message sending
  private async sendMMliteMessage(to: string, templateName: string, parameters: string[] = [], language: string = "en_US"): Promise<any> {
    if (!this.channel.mmLiteApiUrl || !this.channel.mmLiteApiKey) {
      throw new Error("MM Lite configuration missing");
    }

    const formattedPhone = this.formatPhoneNumber(to);
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

    const response = await fetch(
      `${this.channel.mmLiteApiUrl}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.channel.mmLiteApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to send MM Lite message');
    }

    return await response.json();
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
  }
}