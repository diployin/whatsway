import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Campaign {
  id: string;
  channelId: string | null;
  createdBy: string | null;
  name: string;
  description: string | null;
  campaignType: string;
  type: string;
  apiType: string | null;
  templateId: string | null;
  templateName: string | null;
  templateLanguage: string | null;
  variableMapping: Record<string, any>;
  contactGroups: string[];
  csvData: any[];
  apiKey: string | null;
  apiEndpoint: string | null;
  status: string | null;
  scheduledAt: string | null;
  recipientCount: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  repliedCount: number;
  failedCount: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CampaignsProps {
  userId: string;
}

export default function Campaigns({ userId }: CampaignsProps) {
  const {
    data: campaigns = [],
    isLoading,
    isError,
    error,
  } = useQuery<Campaign[]>({
    queryKey: ["/api/getCampaignsByUserId", userId],
    queryFn: async () => {
      const res = await apiRequest("POST", "/api/getCampaignsByUserId", { userId });
      const json = await res.json();
      console.log("🧩 Parsed campaigns JSON:", json);
      // API response might be object for a single campaign
      if (Array.isArray(json)) return json;
      if (Array.isArray(json?.data)) return json.data;
      // If API returns single object, wrap in array
      return json ? [json] : [];
    },
    enabled: !!userId,
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-10 text-muted-foreground">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading campaigns...
      </div>
    );

  if (isError)
    return (
      <p className="text-red-500 text-sm">
        Error: {(error as Error)?.message || "Failed to load campaigns"}
      </p>
    );

  if (campaigns.length === 0)
    return <p className="text-muted-foreground">No campaigns found.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 bg-white rounded-lg shadow-sm">
        <thead className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
          <tr>
            <th className="py-3 px-4 border-b">Name</th>
            <th className="py-3 px-4 border-b">Type</th>
            <th className="py-3 px-4 border-b">Status</th>
            <th className="py-3 px-4 border-b">Scheduled At</th>
            <th className="py-3 px-4 border-b">Created At</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr
              key={campaign.id}
              className="hover:bg-gray-50 transition-colors text-sm text-gray-700"
            >
              <td className="py-3 px-4 border-b">{campaign.name}</td>
              <td className="py-3 px-4 border-b">{campaign.type}</td>
              <td className="py-3 px-4 border-b">
                {campaign.status === "scheduled" ? (
                  <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                    {campaign.status}
                  </span>
                ) : campaign.status === "completed" ? (
                  <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                    {campaign.status}
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700">
                    {campaign.status || "unknown"}
                  </span>
                )}
              </td>
              <td className="py-3 px-4 border-b">
                {campaign.scheduledAt
                  ? new Date(campaign.scheduledAt).toLocaleString()
                  : "-"}
              </td>
              <td className="py-3 px-4 border-b">
                {new Date(campaign.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
