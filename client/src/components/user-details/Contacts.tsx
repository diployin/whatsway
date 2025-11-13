import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Contact {
  id: string;
  channelId: string;
  tenantId: string | null;
  name: string;
  phone: string;
  email: string;
  groups: string[];
  tags: string[];
  status: string;
  source: string | null;
  lastContact: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface ContactsProps {
  userId: string;
}

export default function Contacts({ userId }: ContactsProps) {
  const {
    data: contacts = [],
    isLoading,
    isError,
    error,
  } = useQuery<Contact[]>({
    queryKey: ["/api/user/contacts", userId],
    queryFn: async () => {
      const res: any = await apiRequest("GET", `/api/user/contacts/${userId}`);
      const json = await res.json();

      console.log("🧩 Parsed API JSON:", json);

      if (Array.isArray(json)) return json;
      if (Array.isArray(json?.data)) return json.data;
      return [];
    },
    enabled: !!userId,
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-10 text-muted-foreground">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading contacts...
      </div>
    );

  if (isError)
    return (
      <p className="text-red-500 text-sm">
        Error: {(error as Error)?.message || "Failed to load contacts"}
      </p>
    );

  if (contacts.length === 0)
    return <p className="text-muted-foreground">No contacts found.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 bg-white rounded-lg shadow-sm">
        <thead className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
          <tr>
            <th className="py-3 px-4 border-b">Name</th>
            <th className="py-3 px-4 border-b">Phone</th>
            <th className="py-3 px-4 border-b">Email</th>
            <th className="py-3 px-4 border-b">Status</th>
            <th className="py-3 px-4 border-b">Groups</th>
            <th className="py-3 px-4 border-b">Tags</th>
            <th className="py-3 px-4 border-b">Created At</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr
              key={contact.id}
              className="hover:bg-gray-50 transition-colors text-sm text-gray-700"
            >
              <td className="py-3 px-4 border-b">{contact.name}</td>
              <td className="py-3 px-4 border-b">{contact.phone}</td>
              <td className="py-3 px-4 border-b">{contact.email}</td>
              <td className="py-3 px-4 border-b">
                {contact.status === "active" ? (
                  <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                    {contact.status}
                  </span>
                )}
              </td>
              <td className="py-3 px-4 border-b">
                {contact.groups.join(", ") || "-"}
              </td>
              <td className="py-3 px-4 border-b">
                {contact.tags.join(", ") || "-"}
              </td>
              <td className="py-3 px-4 border-b">
                {new Date(contact.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
