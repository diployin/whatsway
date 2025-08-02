import { apiRequest } from "./queryClient";

export const api = {
  // Dashboard
<<<<<<< HEAD
  getDashboardStats: (channelId?: string) => apiRequest("GET", `/api/dashboard/stats${channelId ? `?channelId=${channelId}` : ""}`),
  getAnalytics: (days?: number, channelId?: string) => {
    const params = new URLSearchParams();
    if (days) params.append('days', days.toString());
    if (channelId) params.append('channelId', channelId);
    return apiRequest("GET", `/api/analytics${params.toString() ? `?${params.toString()}` : ""}`);
  },

  // Contacts
  getContacts: (search?: string, channelId?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (channelId) params.append('channelId', channelId);
    return apiRequest("GET", `/api/contacts${params.toString() ? `?${params.toString()}` : ""}`);
  },
  getContact: (id: string) => apiRequest("GET", `/api/contacts/${id}`),
  createContact: (data: any, channelId?: string) => apiRequest("POST", `/api/contacts${channelId ? `?channelId=${channelId}` : ""}`, data),
=======
  getDashboardStats: () => apiRequest("GET", "/api/dashboard/stats"),
  getAnalytics: (days?: number) => apiRequest("GET", `/api/analytics${days ? `?days=${days}` : ""}`),

  // Contacts
  getContacts: (search?: string) => apiRequest("GET", `/api/contacts${search ? `?search=${search}` : ""}`),
  getContact: (id: string) => apiRequest("GET", `/api/contacts/${id}`),
  createContact: (data: any) => apiRequest("POST", "/api/contacts", data),
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
  updateContact: (id: string, data: any) => apiRequest("PUT", `/api/contacts/${id}`, data),
  deleteContact: (id: string) => apiRequest("DELETE", `/api/contacts/${id}`),

  // Campaigns
<<<<<<< HEAD
  getCampaigns: (channelId?: string) => apiRequest("GET", `/api/campaigns${channelId ? `?channelId=${channelId}` : ""}`),
  getCampaign: (id: string) => apiRequest("GET", `/api/campaigns/${id}`),
  createCampaign: (data: any, channelId?: string) => apiRequest("POST", `/api/campaigns${channelId ? `?channelId=${channelId}` : ""}`, data),
=======
  getCampaigns: () => apiRequest("GET", "/api/campaigns"),
  getCampaign: (id: string) => apiRequest("GET", `/api/campaigns/${id}`),
  createCampaign: (data: any) => apiRequest("POST", "/api/campaigns", data),
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
  updateCampaign: (id: string, data: any) => apiRequest("PUT", `/api/campaigns/${id}`, data),
  deleteCampaign: (id: string) => apiRequest("DELETE", `/api/campaigns/${id}`),

  // Templates
<<<<<<< HEAD
  getTemplates: (channelId?: string) => apiRequest("GET", `/api/templates${channelId ? `?channelId=${channelId}` : ""}`),
=======
  getTemplates: () => apiRequest("GET", "/api/templates"),
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
  getTemplate: (id: string) => apiRequest("GET", `/api/templates/${id}`),
  createTemplate: (data: any) => apiRequest("POST", "/api/templates", data),
  updateTemplate: (id: string, data: any) => apiRequest("PUT", `/api/templates/${id}`, data),
  deleteTemplate: (id: string) => apiRequest("DELETE", `/api/templates/${id}`),

  // Conversations
<<<<<<< HEAD
  getConversations: (channelId?: string) => apiRequest("GET", `/api/conversations${channelId ? `?channelId=${channelId}` : ""}`),
=======
  getConversations: () => apiRequest("GET", "/api/conversations"),
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
  getConversation: (id: string) => apiRequest("GET", `/api/conversations/${id}`),
  createConversation: (data: any) => apiRequest("POST", "/api/conversations", data),
  updateConversation: (id: string, data: any) => apiRequest("PUT", `/api/conversations/${id}`, data),

  // Messages
  getMessages: (conversationId: string) => apiRequest("GET", `/api/conversations/${conversationId}/messages`),
  createMessage: (conversationId: string, data: any) => apiRequest("POST", `/api/conversations/${conversationId}/messages`, data),

  // Automations
<<<<<<< HEAD
  getAutomations: (channelId?: string) => apiRequest("GET", `/api/automations${channelId ? `?channelId=${channelId}` : ""}`),
  getAutomation: (id: string) => apiRequest("GET", `/api/automations/${id}`),
  createAutomation: (data: any, channelId?: string) => apiRequest("POST", `/api/automations${channelId ? `?channelId=${channelId}` : ""}`, data),
=======
  getAutomations: () => apiRequest("GET", "/api/automations"),
  getAutomation: (id: string) => apiRequest("GET", `/api/automations/${id}`),
  createAutomation: (data: any) => apiRequest("POST", "/api/automations", data),
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
  updateAutomation: (id: string, data: any) => apiRequest("PUT", `/api/automations/${id}`, data),
  deleteAutomation: (id: string) => apiRequest("DELETE", `/api/automations/${id}`),
};
