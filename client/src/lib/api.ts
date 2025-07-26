import { apiRequest } from "./queryClient";

export const api = {
  // Dashboard
  getDashboardStats: () => apiRequest("GET", "/api/dashboard/stats"),
  getAnalytics: (days?: number) => apiRequest("GET", `/api/analytics${days ? `?days=${days}` : ""}`),

  // Contacts
  getContacts: (search?: string) => apiRequest("GET", `/api/contacts${search ? `?search=${search}` : ""}`),
  getContact: (id: string) => apiRequest("GET", `/api/contacts/${id}`),
  createContact: (data: any) => apiRequest("POST", "/api/contacts", data),
  updateContact: (id: string, data: any) => apiRequest("PUT", `/api/contacts/${id}`, data),
  deleteContact: (id: string) => apiRequest("DELETE", `/api/contacts/${id}`),

  // Campaigns
  getCampaigns: () => apiRequest("GET", "/api/campaigns"),
  getCampaign: (id: string) => apiRequest("GET", `/api/campaigns/${id}`),
  createCampaign: (data: any) => apiRequest("POST", "/api/campaigns", data),
  updateCampaign: (id: string, data: any) => apiRequest("PUT", `/api/campaigns/${id}`, data),
  deleteCampaign: (id: string) => apiRequest("DELETE", `/api/campaigns/${id}`),

  // Templates
  getTemplates: () => apiRequest("GET", "/api/templates"),
  getTemplate: (id: string) => apiRequest("GET", `/api/templates/${id}`),
  createTemplate: (data: any) => apiRequest("POST", "/api/templates", data),
  updateTemplate: (id: string, data: any) => apiRequest("PUT", `/api/templates/${id}`, data),
  deleteTemplate: (id: string) => apiRequest("DELETE", `/api/templates/${id}`),

  // Conversations
  getConversations: () => apiRequest("GET", "/api/conversations"),
  getConversation: (id: string) => apiRequest("GET", `/api/conversations/${id}`),
  createConversation: (data: any) => apiRequest("POST", "/api/conversations", data),
  updateConversation: (id: string, data: any) => apiRequest("PUT", `/api/conversations/${id}`, data),

  // Messages
  getMessages: (conversationId: string) => apiRequest("GET", `/api/conversations/${conversationId}/messages`),
  createMessage: (conversationId: string, data: any) => apiRequest("POST", `/api/conversations/${conversationId}/messages`, data),

  // Automations
  getAutomations: () => apiRequest("GET", "/api/automations"),
  getAutomation: (id: string) => apiRequest("GET", `/api/automations/${id}`),
  createAutomation: (data: any) => apiRequest("POST", "/api/automations", data),
  updateAutomation: (id: string, data: any) => apiRequest("PUT", `/api/automations/${id}`, data),
  deleteAutomation: (id: string) => apiRequest("DELETE", `/api/automations/${id}`),
};
