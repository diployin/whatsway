import React, { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Toast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FaComment,
  FaEdit,
  FaTrash,
  FaEllipsisH,
  FaEye,
  FaBan,
} from "react-icons/fa";
import Header from "@/components/layout/header";
import { Link, useLocation } from "wouter";

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
  const [pagination, setPagination] = useState<PaginationType>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [search, setSearch] = useState("");
  const [location, setLocation] = useLocation();

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
        Toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      Toast({
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
  }, [pagination.page, search]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleViewUser = (user: UserType) => {
    // Navigate to details page with user data
    setLocation(`/users/${user.id}`, { state: user });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Users" subtitle="Manage all registered users" />
      <div className="p-6">
        {/* <h1 className="text-3xl font-bold mb-6">Users</h1> */}

        {/* Search */}
        <div className="flex flex-col md:flex-row mb-6 space-y-2 md:space-y-0 md:space-x-2">
          <Input
            placeholder="Search by username or email"
            value={search}
            onChange={handleSearch}
          />
          <Button onClick={() => fetchUsers(1, search)}>Search</Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  <input type="checkbox" />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  CONTACT
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  PHONE
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  GROUPS
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  STATUS
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  LAST LOGIN
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                  ACTIONS
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user, idx) => {
                  const phone = user.phone || "—";
                  const groups =
                    user.groups && user.groups.length > 0
                      ? user.groups.join(", ")
                      : "No groups";

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-gray-50 ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-3 text-center">
                        <input type="checkbox" />
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3 flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold overflow-hidden">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            user.username.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/users/${user.id}`}
                            className="text-gray-800 font-medium hover:underline"
                          >
                            {user.username}
                          </Link>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {phone}
                      </td>

                      {/* Groups */}
                      <td className="px-4 py-3 text-sm text-gray-500 italic">
                        {groups}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            statusColors[
                              user.status?.toLowerCase() || "inactive"
                            ]
                          }`}
                        >
                          {user.status?.toUpperCase() || "UNKNOWN"}
                        </span>
                      </td>

                      {/* Last login */}
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleString()
                          : "Never"}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 flex justify-center space-x-4 text-gray-500">
                        {/* <FaComment className="hover:text-blue-500 cursor-pointer" title="Message" /> */}
                        {/* <FaEdit className="hover:text-green-500 cursor-pointer" title="Edit" /> */}
                        {/* <FaTrash className="hover:text-red-500 cursor-pointer" title="Delete" /> */}
                        <FaEye
                          className="hover:text-indigo-500 cursor-pointer"
                          title="View Details"
                          onClick={() => handleViewUser(user)}
                        />
                        <FaBan
                          className="hover:text-red-600 cursor-pointer"
                          title="Block User"
                        />
                        <FaEllipsisH
                          className="hover:text-gray-700 cursor-pointer"
                          title="More"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <div>
            <Button
              onClick={() => handlePageChange(1)}
              disabled={pagination.page === 1}
            >
              First
            </Button>
            <Button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="ml-2"
            >
              Previous
            </Button>
          </div>
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div>
            <Button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
            </Button>
            <Button
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
              className="ml-2"
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
