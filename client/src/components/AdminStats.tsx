import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "./layout/header";

import { useAuth } from "@/contexts/auth-context";
import type { DashboardStats } from "@/types/types";
import { CardStat } from "./CardStat";

// Example: manually define icons for your cards
const MsgIcon = (
  <svg
    className="w-6 h-6"
    stroke="currentColor"
    fill="none"
    viewBox="0 0 24 24"
  >
    <rect x="4" y="8" width="16" height="8" rx="2" />
    <path d="M8 12h.01M12 12h.01M16 12h.01" />
  </svg>
);
const CampaignIcon = (
  <svg
    className="w-6 h-6"
    stroke="currentColor"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path d="M7 13V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v8m-10 4h12" />
  </svg>
);

export default function AdminStats() {
  const { user } = useAuth();

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: [
      user?.role === "admin"
        ? `/api/dashboard/user/statss?channelId=${user.id}`
        : "/api/dashboard/admin/stats",
    ],
    queryFn: () =>
      apiRequest(
        "GET",
        user?.role === "admin"
          ? `/api/dashboard/user/statss?channelId=${user.id}`
          : "/api/dashboard/admin/stats"
      ).then((res) => res.json()),
  });

  // Helper to safely get value
  const safe = (k: keyof DashboardStats) =>
    stats && stats[k] !== undefined && stats[k] !== null ? stats[k] : 0;

  return (
    <div className="container mx-auto">
      <div className="px-4 py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Manually control which cards show and what icon/color */}
        {stats &&
          stats.totalContacts !== undefined &&
          stats.totalContacts !== null && (
            <CardStat
              label="Total Contacts"
              value={stats.totalContacts}
              icon={MsgIcon}
              iconClassName="bg-blue-50 text-blue-500"
            />
          )}

        {stats &&
          stats.totalTemplates !== undefined &&
          stats.totalTemplates !== null && (
            <CardStat
              label="Total Templates"
              value={stats.totalTemplates}
              icon={MsgIcon}
              iconClassName="bg-blue-50 text-blue-500"
            />
          )}

        {stats &&
          stats.totalChannels !== undefined &&
          stats.totalChannels !== null && (
            <CardStat
              label="Total Channels"
              value={stats.totalChannels}
              icon={MsgIcon}
              iconClassName="bg-blue-50 text-blue-500"
            />
          )}

        {stats &&
          stats.totalMessages !== undefined &&
          stats.totalMessages !== null && (
            <CardStat
              label="Total Messages"
              value={stats.totalMessages}
              icon={MsgIcon}
              iconClassName="bg-blue-50 text-blue-500"
            />
          )}

        {stats &&
          stats.totalUsers !== undefined &&
          stats.totalUsers !== null && (
            <CardStat
              label="Total Contacts"
              value={stats.totalUsers}
              icon={MsgIcon}
              iconClassName="bg-blue-50 text-blue-500"
            />
          )}

        {stats &&
          stats.totalUsers !== undefined &&
          stats.totalUsers !== null && (
            <CardStat
              label="Total Contacts"
              value={stats.totalUsers}
              icon={MsgIcon}
              iconClassName="bg-blue-50 text-blue-500"
            />
          )}
        {stats &&
          stats.todaySignups !== undefined &&
          stats.todaySignups !== null && (
            <CardStat
              label="Today SignUP"
              value={stats.todaySignups}
              icon={MsgIcon}
              iconClassName="bg-blue-50 text-blue-500"
            />
          )}
      </div>
    </div>
  );
}
