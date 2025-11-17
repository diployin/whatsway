import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Channel {
  id: string;
  name: string;
  phoneNumberId: string;
  phoneNumber: string;
  accessToken: string;
  whatsappBusinessAccountId: string;
  isActive: boolean;
  healthStatus: string;
  lastHealthCheck: string;
  healthDetails: {
    error: string;
    error_code: number;
    error_type: string;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface ChannelsProps {
  userId: string;
}

export default function Channels({ userId }: ChannelsProps) {
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // default 10 per page

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["/api/channels/userid", userId, page],
    queryFn: async () => {
      const res = await apiRequest("POST", "/api/channels/userid", {
        userId,
        page,
        limit,
      });
      const json = await res.json();
      return json;
    },
    enabled: !!userId,
  });

  const channels: Channel[] = response?.data || [];
  const pagination = response?.pagination;

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-10 text-muted-foreground">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading channels...
      </div>
    );

  if (isError)
    return (
      <p className="text-red-500 text-sm">
        Error: {(error as Error)?.message || "Failed to load channels"}
      </p>
    );

  if (channels.length === 0)
    return <p className="text-muted-foreground">No channels found.</p>;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 bg-white rounded-lg shadow-sm">
          <thead className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
            <tr>
              <th className="py-3 px-4 border-b">Name</th>
              <th className="py-3 px-4 border-b">Phone Number</th>
              <th className="py-3 px-4 border-b">Status</th>
              <th className="py-3 px-4 border-b">Health</th>
              <th className="py-3 px-4 border-b">Last Health Check</th>
              <th className="py-3 px-4 border-b">Created At</th>
            </tr>
          </thead>
          <tbody>
            {channels.map((channel) => (
              <tr
                key={channel.id}
                className="hover:bg-gray-50 transition-colors text-sm text-gray-700"
              >
                <td className="py-3 px-4 border-b">{channel.name}</td>
                <td className="py-3 px-4 border-b">{channel.phoneNumber}</td>
                <td className="py-3 px-4 border-b">
                  {channel.isActive ? (
                    <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 border-b">
                  {channel.healthStatus === "error" ? (
                    <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-700">
                      {channel.healthDetails?.error || "Error"}
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                      {channel.healthStatus}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 border-b">
                  {channel.lastHealthCheck
                    ? new Date(channel.lastHealthCheck).toLocaleString()
                    : "-"}
                </td>
                <td className="py-3 px-4 border-b">
                  {new Date(channel.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && (
        <div className="flex justify-between items-center mt-4">
          <button
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </button>

          <span>
            Page {page} of {pagination.totalPages}
          </span>

          <button
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            disabled={page >= pagination.totalPages}
            onClick={() =>
              setPage((prev) =>
                Math.min(prev + 1, pagination.totalPages)
              )
            }
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
