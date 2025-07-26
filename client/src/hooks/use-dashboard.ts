import { useQuery } from "@tanstack/react-query";
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
