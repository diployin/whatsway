import { useQuery } from "@tanstack/react-query";
<<<<<<< HEAD
import { apiRequest } from "@/lib/queryClient";

export function useDashboardStats(channelId?: string) {
  return useQuery({
    queryKey: ["/api/dashboard/stats", channelId],
    queryFn: async () => {
      if (!channelId) {
        // Return default stats if no channel is selected
        return {
          totalMessages: 0,
          messagesGrowth: 0,
          activeCampaigns: 0,
          campaignsRunning: 0,
          deliveryRate: 0,
          activeContacts: 0,
          contactsGrowth: 0,
        };
      }
      
      const response = await fetch(`/api/dashboard/stats?channelId=${channelId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }
      return response.json();
    },
    enabled: true,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useAnalytics(days: number = 7, channelId?: string) {
  return useQuery({
    queryKey: ["/api/analytics", days, channelId],
    queryFn: async () => {
      if (!channelId) {
        // Return empty data if no channel is selected
        return [];
      }
      
      const response = await fetch(`/api/analytics?days=${days}&channelId=${channelId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }
      return response.json();
    },
    enabled: true,
  });
}
=======
import { api } from "@/lib/api";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const response = await api.getDashboardStats();
      return await response.json();
    },
  });
}

export function useAnalytics(days: number = 30) {
  return useQuery({
    queryKey: ["/api/analytics", days],
    queryFn: async () => {
      const response = await api.getAnalytics(days);
      return await response.json();
    },
  });
}
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
