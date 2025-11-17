import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";

interface Template {
  id: string;
  channelId: string;
  createdBy: string;
  name: string;
  category: string;
  language: string;
  header: string | null;
  body: string;
  footer: string | null;
  buttons: any[];
  variables: any[];
  status: string;
  rejectionReason: string | null;
  mediaType: string;
  mediaUrl: string | null;
  mediaHandle: string | null;
  carouselCards: any[];
  whatsappTemplateId: string | null;
  usage_count: number;
  createdAt: string;
  updatedAt: string;
}

interface TemplatesProps {
  userId: string;
}

interface TemplatesResponse {
  data: Template[];
  pagination: {
    page: number;
    limit: number;
    total: number | string;
    totalPages: number;
  };
}

export default function Templates({ userId }: TemplatesProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10; // items per page

  const { data, isLoading, isError, error } = useQuery<TemplatesResponse>({
    queryKey: ["templates", userId, currentPage],
    queryFn: async () => {
      const res = await apiRequest("POST", "/api/getTemplateByUserId", {
        userId,
        page: currentPage,
        limit,
      });
      const json = await res.json();
      console.log("🧩 Templates API response:", json);
      return json;
    },
    enabled: !!userId,
    keepPreviousData: true, // React Query feature to prevent flicker
  });

  const templates = data?.data ?? [];
  const page = data?.pagination?.page ?? 1;
  const totalPages = Number(data?.pagination?.totalPages ?? 1);

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-10 text-muted-foreground">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading templates...
      </div>
    );

  if (isError)
    return (
      <p className="text-red-500 text-sm">
        Error: {(error as Error)?.message || "Failed to load templates"}
      </p>
    );

  if (templates.length === 0)
    return <p className="text-muted-foreground">No templates found.</p>;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 bg-white rounded-lg shadow-sm">
          <thead className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
            <tr>
              <th className="py-3 px-4 border-b">Name</th>
              <th className="py-3 px-4 border-b">Category</th>
              <th className="py-3 px-4 border-b">Status</th>
              <th className="py-3 px-4 border-b">Body</th>
              <th className="py-3 px-4 border-b">Created At</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((template) => (
              <tr
                key={template.id}
                className="hover:bg-gray-50 transition-colors text-sm text-gray-700"
              >
                <td className="py-3 px-4 border-b">{template.name}</td>
                <td className="py-3 px-4 border-b">{template.category}</td>
                <td className="py-3 px-4 border-b">
                  {template.status === "approved" ? (
                    <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                      {template.status}
                    </span>
                  ) : template.status === "pending" ? (
                    <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700">
                      {template.status}
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-700">
                      {template.status}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 border-b">{template.body}</td>
                <td className="py-3 px-4 border-b">
                  {new Date(template.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={page <= 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page >= totalPages}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
