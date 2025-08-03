import { useQuery } from "@tanstack/react-query";
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