import { Loader2, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";

interface TeamMember {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  permissions: string[];
  avatar: string | null;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface TeamMembersProps {
  userId: string;
}

export default function TeamMembers({ userId }: TeamMembersProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<{
    data: TeamMember[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>({
    queryKey: ["/api/team/membersByUserId", userId, page],
    queryFn: async () => {
      const res = await apiRequest("POST", "/api/team/membersByUserId", {
        userId,
        page,
        limit,
      });
      return res.json();
    },
    enabled: !!userId,
    keepPreviousData: true,
  });

  const teamMembers = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-10 text-muted-foreground">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading team members...
      </div>
    );

  if (isError)
    return (
      <p className="text-red-500 text-sm">
        Error: {(error as Error)?.message || "Failed to load team members"}
      </p>
    );

  if (teamMembers.length === 0)
    return <p className="text-muted-foreground">No team members found.</p>;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 bg-white rounded-lg shadow-sm">
          <thead className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
            <tr>
              <th className="py-3 px-4 border-b">Name</th>
              <th className="py-3 px-4 border-b">Email</th>
              <th className="py-3 px-4 border-b">Role</th>
              <th className="py-3 px-4 border-b">Status</th>
              <th className="py-3 px-4 border-b">Created At</th>
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((member) => (
              <tr
                key={member.id}
                className="hover:bg-gray-50 transition-colors text-sm text-gray-700"
              >
                <td className="py-3 px-4 border-b flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold">
                    {member.firstName?.[0]}
                    {member.lastName?.[0]}
                  </div>
                  {member.firstName} {member.lastName}
                </td>
                <td className="py-3 px-4 border-b">{member.email}</td>
                <td className="py-3 px-4 border-b flex items-center gap-1">
                  <Shield className="w-3 h-3 text-gray-500" />
                  {member.role}
                </td>
                <td className="py-3 px-4 border-b">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      member.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {member.status}
                  </span>
                </td>
                <td className="py-3 px-4 border-b text-gray-500 text-xs">
                  {new Date(member.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {/* Pagination (Responsive & Unified) */}
{data?.pagination && (
  <div className="w-full mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

    {/* LEFT SIDE → Showing X to Y of Total */}
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <span className="text-sm text-gray-700">
        Showing {(page - 1) * limit + 1} to{" "}
        {Math.min(page * limit, data.pagination.total)} of{" "}
        {data.pagination.total} team members
      </span>

      {/* Optional: Per Page Selector */}
      <select
  value={limit}
  onChange={(e) => {
    setLimit(Number(e.target.value));
    setPage(1); // Reset page when limit changes
  }}
  className="border px-3 py-2 rounded-md text-sm w-24"
>
  <option value={5}>5</option>
  <option value={10}>10</option>
  <option value={20}>20</option>
  <option value={50}>50</option>
</select>

    </div>

    {/* RIGHT SIDE → Pagination Buttons */}
    <div className="flex items-center justify-center sm:justify-end gap-2">

      <button
        className="px-3 py-1 border rounded disabled:opacity-50"
        disabled={page <= 1}
        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
      >
        Previous
      </button>

      <span className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium">
        {page}
      </span>

      <button
        className="px-3 py-1 border rounded disabled:opacity-50"
        disabled={page >= data.pagination.totalPages}
        onClick={() =>
          setPage((prev) => Math.min(prev + 1, data.pagination.totalPages))
        }
      >
        Next
      </button>

    </div>
  </div>
)}

    </div>
  );
}
