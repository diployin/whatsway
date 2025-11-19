import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "./layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardStats } from "@/types/types";
import { useAuth } from "@/contexts/auth-context";

// Utility: always return a safe value for any stat key
function getStatValue(stats: any, key: string | undefined): string {
  if (!stats || !key) return "0";
  const val = stats[key];
  if (val === undefined || val === null) return "0";
  return typeof val === "number" ? String(val) : val;
}

// Cards config for your dashboard (update fields as needed)
const CARD_META = [
  {
    key: "messagesSent",
    label: "Total Messages Sent",
    valueKey: "messagesSent",
    subLabel: "-0% vs last month",
    iconClass: "bg-blue-50 text-blue-500",
    iconNode: (
      <svg
        className="w-6 h-6"
        stroke="currentColor"
        fill="none"
        viewBox="0 0 24 24"
      >
        <rect x="4" y="8" width="16" height="8" rx="2" />
        <path d="M8 12h.01M12 12h.01M16 12h.01" />
      </svg>
    ),
    primary: true,
  },
  {
    key: "totalCampaigns",
    label: "Total Campaigns",
    valueKey: "totalCampaigns",
    subLabel: "0 running now",
    iconClass: "bg-orange-50 text-orange-500",
    iconNode: (
      <svg
        className="w-6 h-6"
        stroke="currentColor"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path d="M7 13V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v8m-10 4h12" />
      </svg>
    ),
  },
  {
    key: "deliveryRate",
    label: "Delivery Rate",
    getValue: (stats: DashboardStats) => {
      const delivered = Number(stats?.messagesDelivered ?? 0);
      const sent = Number(stats?.messagesSent ?? 0);
      if (sent === 0) return "0%";
      return `${((delivered / sent) * 100).toFixed(1)}%`;
    },
    subLabel: "",
    iconClass: "bg-green-50 text-green-500",
    iconNode: (
      <svg
        className="w-6 h-6"
        stroke="currentColor"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9 12l2 2l4 -4" />
      </svg>
    ),
    isRate: true,
  },
  {
    key: "totalUsers",
    label: "Total Users",
    valueKey: "totalUsers",
    iconClass: "bg-purple-50 text-purple-500",
    iconNode: (
      <svg
        className="w-6 h-6"
        stroke="currentColor"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="7" r="4" />
        <path d="M5.5 20a7 7 0 0 1 13 0" />
      </svg>
    ),
  },
  {
    key: "totalContacts",
    label: "Total Contacts",
    valueKey: "totalContacts",
    iconClass: "bg-blue-50 text-blue-500",
    iconNode: (
      <svg
        className="w-6 h-6"
        stroke="currentColor"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M7 20a5 5 0 0 1 10 0" />
      </svg>
    ),
  },
  {
    key: "totalTemplates",
    label: "Total Templates",
    valueKey: "totalTemplates",
    iconClass: "bg-violet-50 text-violet-500",
    iconNode: (
      <svg
        className="w-6 h-6"
        stroke="currentColor"
        fill="none"
        viewBox="0 0 24 24"
      >
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M15 3v18" />
      </svg>
    ),
  },
  {
    key: "totalChannels",
    label: "Total Channels",
    valueKey: "totalChannels",
    iconClass: "bg-indigo-50 text-indigo-500",
    iconNode: (
      <svg
        className="w-6 h-6"
        stroke="currentColor"
        fill="none"
        viewBox="0 0 24 24"
      >
        <rect x="4" y="8" width="16" height="8" rx="2" />
        <path d="M8 12h.01M12 12h.01M16 12h.01" />
      </svg>
    ),
  },
];

export default function AdminStats() {
  const { user } = useAuth();

  // Pick correct API/query for admin/user role
  const isAdmin = user?.role !== "admin";
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: [
      isAdmin
        ? "/api/dashboard/admin/stats"
        : `/api/dashboard/user/statss?channelId=${user?.id}`,
    ],
    queryFn: () =>
      apiRequest(
        "GET",
        isAdmin
          ? "/api/dashboard/admin/stats"
          : `/api/dashboard/user/statss?channelId=${user?.id}`
      ).then((res) => res.json()),
  });

  return (
    <div className="container mx-auto">
      <div className="">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 py-6">
          {CARD_META.map((card, idx) => {
            // Always show "0" if not present
            const value = card.getValue
              ? card.getValue(stats ?? {})
              : getStatValue(stats ?? {}, card.valueKey);

            return (
              <Card
                key={card.key}
                className="rounded-xl border p-0 shadow hover:shadow-md transition duration-150 bg-white flex flex-col h-full"
              >
                <CardContent className="flex flex-col justify-between p-6 gap-2 h-full">
                  <div className="flex justify-between items-center mb-1 gap-2">
                    <div>
                      <div className="font-semibold text-gray-600">
                        {card.label}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {value}
                      </div>
                    </div>
                    <div
                      className={`rounded-xl p-2 ${card.iconClass} flex items-center justify-center`}
                    >
                      {card.iconNode}
                    </div>
                  </div>
                  {card.isRate && (
                    <div className="h-2 w-full bg-gray-200 rounded mt-1">
                      <div
                        className="bg-green-500 h-2 rounded"
                        style={{
                          width: `${
                            stats && stats.messagesSent
                              ? Math.min(
                                  100,
                                  Math.round(
                                    ((Number(stats.messagesDelivered) || 0) /
                                      (Number(stats.messagesSent) || 1)) *
                                      100
                                  )
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  )}
                  {card.subLabel && (
                    <div
                      className={`
                        flex items-center mt-2 text-sm 
                        ${
                          card.key === "totalCampaigns"
                            ? "text-orange-600"
                            : card.key === "messagesSent"
                            ? "text-gray-400"
                            : card.key === "newLeads"
                            ? "text-purple-500"
                            : "text-gray-400"
                        }`}
                    >
                      {card.key === "messagesSent" && (
                        <svg
                          className="w-4 h-4 mr-1 text-red-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      {card.key === "totalCampaigns" && (
                        <svg
                          className="w-4 h-4 mr-1 text-orange-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                      )}
                      <span>{card.subLabel}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
