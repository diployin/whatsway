import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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

export default function Templates({ userId }: TemplatesProps) {
  const {
    data: templates = [],
    isLoading,
    isError,
    error,
  } = useQuery<Template[]>({
    queryKey: ["/api/getTemplateByUserId", userId],
    queryFn: async () => {
      const res = await apiRequest("POST", "/api/getTemplateByUserId", { userId });
      const json = await res.json();
      console.log("🧩 Parsed templates JSON:", json);
      if (Array.isArray(json)) return json;
      if (Array.isArray(json?.data)) return json.data;
      return [];
    },
    enabled: !!userId,
  });

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
  );
}
