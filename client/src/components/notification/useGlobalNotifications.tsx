import { useEffect } from "react";
import { useLocation } from "wouter";

export function useGlobalNotifications(
  socket: any,
  conversations: any[]
) {
  const [location] = useLocation();

  // 🔔 Browser title update (ALWAYS works)
  useEffect(() => {
    const totalUnread = conversations.reduce(
      (sum, c) => sum + (c.unreadCount || 0),
      0
    );

    document.title =
      totalUnread > 0 ? `(${totalUnread}) Team Inbox` : "Team Inbox";
  }, [conversations]);

  // 🔔 Browser notification (ALWAYS works)
  useEffect(() => {
    if (!socket) return;

    const handler = (data: any) => {
      const message =
        typeof data?.content === "string"
          ? data.content
          : "New message";

      const isInbox = location.startsWith("/inbox");
      const shouldNotify =
        Notification.permission === "granted" &&
        !document.hasFocus();

      if (shouldNotify) {
        new Notification("New WhatsApp Message", {
          body: message,
          icon: "/whatsapp-icon.png",
        });
      }
    };

    socket.on("new-message", handler);
    return () => socket.off("new-message", handler);
  }, [socket, location]);
}
