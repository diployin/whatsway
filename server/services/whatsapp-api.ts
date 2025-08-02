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
      `${this.baseUrl}/${this.channel.whatsappBusinessAccountId}/message_templates?fields=id,status,name,language,category`,
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
    const body = {
      messaging_product: "whatsapp",
      to,
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
    const body = {
      messaging_product: "whatsapp",
      to,
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
}