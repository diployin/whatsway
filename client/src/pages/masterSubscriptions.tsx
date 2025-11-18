import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import { useAuth } from "@/contexts/auth-context";

// ------------------- TYPES -------------------
interface MasterSubscription {
  id: string;
  userId: string;
  planId: string;
  planData: {
    icon: string;
    name: string;
    features: { name: string; included: boolean }[];
    annualPrice: string;
    monthlyPrice: string;
    description: string;
  };
  status: string;
  billingCycle: "monthly" | "annual";
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  username: string;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  icon: string;
  monthlyPrice: string;
  annualPrice: string;
  features: { name: string; included: boolean }[];
  permissions: {
    channel: string;
    contacts: string;
    automation: string;
  };
}

interface SubscriptionResponse {
  success: boolean;
  data: Array<{
    subscription: MasterSubscription;
    user: User;
    plan: Plan;
  }>;
  pagination: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

// ------------------- COMPONENT -------------------
export default function AllSubscriptionsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const {user} = useAuth();
  const limit = 10;

  const { data, isLoading, isError, error } = useQuery<SubscriptionResponse>({
    queryKey: ["subscriptions", currentPage],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/subscriptions?page=${currentPage}&limit=${limit}`
      );
      const json = await res.json();
      return json;
    },
    keepPreviousData: true,
  });

  const subscriptions = data?.data ?? [];
  const page = data?.pagination?.page ?? currentPage;
  const totalPages = data?.pagination?.totalPages ?? 1;

  // ------------------- LOADING -------------------
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-muted-foreground">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        Loading subscriptions...
      </div>
    );
  }

  // ------------------- ERROR -------------------
  if (isError) {
    return (
      <p className="text-red-500 text-sm">
        Error: {(error as Error)?.message || "Failed to load subscriptions"}
      </p>
    );
  }

  // ------------------- RENDER TABLE -------------------
  return (
    <>
    <Header 
      title="Master Subscriptions" 
      subtitle="Manage all subscriptions" 
      userPhotoUrl={user?.photoUrl}
    />
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">All Subscriptions</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 bg-white rounded-lg shadow-sm">
          <thead className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
            <tr>
              <th className="py-3 px-4 border-b">Username</th>
              <th className="py-3 px-4 border-b">Plan</th>
              <th className="py-3 px-4 border-b">Price</th>
              <th className="py-3 px-4 border-b">Status</th>
              <th className="py-3 px-4 border-b">Start Date</th>
              <th className="py-3 px-4 border-b">End Date</th>
              <th className="py-3 px-4 border-b">Auto Renew</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map(({ subscription, user, plan }) => (
              <tr
                key={subscription.id}
                className="hover:bg-gray-50 transition-colors text-sm text-gray-700"
              >
                <td className="py-3 px-4 border-b">{user.username}</td>
                <td className="py-3 px-4 border-b">{plan.name}</td>
                <td className="py-3 px-4 border-b">
                  {subscription.billingCycle === "monthly"
                    ? `$${plan.monthlyPrice}`
                    : `$${plan.annualPrice}`}
                </td>
                <td className="py-3 px-4 border-b">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      subscription.status === "active"
                        ? "bg-green-100 text-green-700"
                        : subscription.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {subscription.status}
                  </span>
                </td>
                <td className="py-3 px-4 border-b">
                  {new Date(subscription.startDate).toLocaleString()}
                </td>
                <td className="py-3 px-4 border-b">
                  {new Date(subscription.endDate).toLocaleString()}
                </td>
                <td className="py-3 px-4 border-b">
                  {subscription.autoRenew ? "Yes" : "No"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ------------------- PAGINATION ------------------- */}
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
    </>
  );
}
