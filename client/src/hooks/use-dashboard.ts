import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useDashboardStats(channelId?: string) {
  return useQuery({
    queryKey: ["/api/dashboard/stats", channelId],
    queryFn: async () => {
      const response = await api.getDashboardStats(channelId);
      return await response.json();
    },
  });
}

export function useAnalytics(days: number = 30, channelId?: string) {
  return useQuery({
    queryKey: ["/api/analytics", days, channelId],
    queryFn: async () => {
      const response = await api.getAnalytics(days, channelId);
      return await response.json();
    },
  });
}
