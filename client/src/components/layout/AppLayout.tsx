import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { setMeta } from "@/hooks/setMeta";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { useSocket } from "@/contexts/socket-context";
import { useGlobalNotifications } from "../notification/useGlobalNotifications";
import { api } from "@/lib/api"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: brandSettings } = useQuery({
    queryKey: ["/api/brand-settings"],
    queryFn: () => fetch("/api/brand-settings").then((res) => res.json()),
    staleTime: 5 * 60 * 1000,
  });


 const { socket } = useSocket();

  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/conversations/global"],
    queryFn: async () => {
      const res = await api.getConversations(); // or active channel
      return res.json();
    },
  });

  // 🔥 GLOBAL notification + title logic
  useGlobalNotifications(socket, conversations);

  useEffect(() => {
    if (brandSettings) {
      setMeta({
        title: brandSettings.title,
        favicon: brandSettings.favicon,
        description: brandSettings.tagline,
        keywords: `${brandSettings.title} ${brandSettings.tagline}`,
      });
    }
  }, [brandSettings]);

  return (
    <>
      <SidebarProvider>{children}</SidebarProvider>
    </>
  );
}
