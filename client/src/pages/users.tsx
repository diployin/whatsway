import React, { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FaEdit,
  FaTrash,
  FaEllipsisH,
  FaEye,
  FaBan,
  FaSearch,
} from "react-icons/fa";
import Header from "@/components/layout/header";
import { Link } from "wouter";

interface UserType {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  permissions: string[];
  avatar?: string | null;
  lastLogin?: string | null;
  createdAt?: string;
  updatedAt?: string;
  phone?: string;
  groups?: string[];
}

interface PaginationType {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  banned: "bg-red-100 text-red-800",
};

const User: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const [pagination, setPagination] = useState<PaginationType>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [search, setSearch] = useState("");

  const fetchUsers = async (page = 1, searchTerm = "") => {
    try {
      setLoading(true);
      const response = await apiRequest(
        "GET",
        `/api/admin/users?page=${page}&limit=${pagination.limit}&search=${searchTerm}`
      );
      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
        setPagination(data.pagination);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(pagination.page, search);
  }, [pagination.page]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchUsers(1, search);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const toggleAllUsers = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map((u) => u.id)));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Users" subtitle="Manage all registered users" />
      <div className="p-3 sm:p-4 md:p-6">
        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6"
        >
          <div className="relative flex-1">
            <Input
              placeholder="Search by username or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
          >
            Search
          </Button>
        </form>

        {/* Stats */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {users.length} of {pagination.total} users
          {selectedUsers.size > 0 && (
            <span className="ml-2 text-green-600 font-medium">
              ({selectedUsers.size} selected)
            </span>
          )}
        </div>

        {/* Desktop & Tablet Table View */}
        <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 lg:px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      users.length > 0 && selectedUsers.size === users.length
                    }
                    onChange={toggleAllUsers}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </th>
                <th className="px-3 lg:px-4 py-3 text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-3 lg:px-4 py-3 text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-3 lg:px-4 py-3 text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                  Groups
                </th>
                <th className="px-3 lg:px-4 py-3 text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 lg:px-4 py-3 text-left text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider hidden xl:table-cell">
                  Last Login
                </th>
                <th className="px-3 lg:px-4 py-3 text-center text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {(() => {
                if (loading) {
                  return (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
                          <p className="text-gray-500">Loading users...</p>
                        </div>
                      </td>
                    </tr>
                  );
                }
                if (users.length === 0) {
                  return (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <p className="text-gray-500">No users found</p>
                      </td>
                    </tr>
                  );
                }
                return users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-3 lg:px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </td>

                    {/* Contact */}
                    <td className="px-3 lg:px-4 py-3">
                      <div className="flex items-center space-x-2 lg:space-x-3">
                        <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold overflow-hidden flex-shrink-0 shadow-sm">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm lg:text-base">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/users/${user.id}`}
                            className="text-gray-800 font-medium hover:text-green-600 transition-colors text-sm lg:text-base block truncate"
                          >
                            {user.username}
                          </Link>
                          <p className="text-gray-500 text-xs lg:text-sm truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-3 lg:px-4 py-3 text-xs lg:text-sm text-gray-600">
                      {user.phone || "—"}
                    </td>

                    {/* Groups */}
                    <td className="px-3 lg:px-4 py-3 text-xs lg:text-sm text-gray-500 hidden lg:table-cell">
                      {user.groups && user.groups.length > 0
                        ? user.groups.join(", ")
                        : "No groups"}
                    </td>

                    {/* Status */}
                    <td className="px-3 lg:px-4 py-3">
                      <span
                        className={`px-2 lg:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          statusColors[user.status?.toLowerCase() || "inactive"]
                        }`}
                      >
                        {user.status?.toUpperCase() || "UNKNOWN"}
                      </span>
                    </td>

                    {/* Last login */}
                    <td className="px-3 lg:px-4 py-3 text-xs lg:text-sm text-gray-600 hidden xl:table-cell">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : "Never"}
                    </td>

                    {/* Actions */}
                    <td className="px-3 lg:px-4 py-3">
                      <div className="flex justify-center space-x-2 lg:space-x-3 text-gray-500">
                        <Link href={`/users/${user.id}`}>
                          <FaEye
                            className="w-4 h-4 hover:text-green-600 cursor-pointer transition-colors"
                            title="View Details"
                          />
                        </Link>
                        <FaBan
                          className="w-4 h-4 hover:text-red-600 cursor-pointer transition-colors"
                          title="Block User"
                        />
                        <FaEllipsisH
                          className="w-4 h-4 hover:text-gray-700 cursor-pointer transition-colors"
                          title="More"
                        />
                      </div>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {(() => {
            if (loading) {
              return (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
                  <p className="text-gray-500 text-sm">Loading users...</p>
                </div>
              );
            }
            if (users.length === 0) {
              return (
                <div className="text-center py-12">
                  <p className="text-gray-500">No users found</p>
                </div>
              );
            }
            return users.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500 mt-1 flex-shrink-0"
                    />
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold overflow-hidden flex-shrink-0 shadow-sm">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/users/${user.id}`}
                        className="text-gray-800 font-semibold text-base hover:text-green-600 transition-colors block truncate"
                      >
                        {user.username}
                      </Link>
                      <p className="text-gray-500 text-sm truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      statusColors[user.status?.toLowerCase() || "inactive"]
                    }`}
                  >
                    {user.status?.toUpperCase() || "UNKNOWN"}
                  </span>
                </div>

                {/* Card Details */}
                <div className="space-y-2 text-sm border-t border-gray-100 pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Phone:</span>
                    <span className="text-gray-700">{user.phone || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Groups:</span>
                    <span className="text-gray-700 text-right truncate ml-2">
                      {user.groups && user.groups.length > 0
                        ? user.groups.join(", ")
                        : "No groups"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">
                      Last Login:
                    </span>
                    <span className="text-gray-700">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : "Never"}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex justify-end space-x-4 mt-4 pt-3 border-t border-gray-100">
                  <Link href={`/users/${user.id}`}>
                    <button
                      className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm font-medium"
                      title="View Details"
                    >
                      <FaEye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </Link>
                  <button
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm font-medium"
                    title="Block User"
                  >
                    <FaBan className="w-4 h-4" />
                    <span>Block</span>
                  </button>
                  <button
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-700 text-sm font-medium"
                    title="More"
                  >
                    <FaEllipsisH className="w-4 h-4" />
                    <span>More</span>
                  </button>
                </div>
              </div>
            ));
          })()}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <div className="flex gap-2 order-2 sm:order-1">
            <Button
              onClick={() => handlePageChange(1)}
              disabled={pagination.page === 1 || loading}
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
            >
              First
            </Button>
            <Button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1 || loading}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
          </div>

          <span className="text-sm text-gray-700 font-medium order-1 sm:order-2">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <div className="flex gap-2 order-3">
            <Button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages || loading}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
            <Button
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages || loading}
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
            >
              Last
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default User;
