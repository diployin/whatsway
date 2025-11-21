// import React, { useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { Loader2 } from "lucide-react";
// import { apiRequest } from "@/lib/queryClient";
// import Header from "@/components/layout/header";
// import { useAuth } from "@/contexts/auth-context";

// // ------------------- TYPES -------------------
// interface MasterSubscription {
//   id: string;
//   userId: string;
//   planId: string;
//   planData: {
//     icon: string;
//     name: string;
//     features: { name: string; included: boolean }[];
//     annualPrice: string;
//     monthlyPrice: string;
//     description: string;
//   };
//   status: string;
//   billingCycle: "monthly" | "annual";
//   startDate: string;
//   endDate: string;
//   autoRenew: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// interface User {
//   id: string;
//   username: string;
// }

// interface Plan {
//   id: string;
//   name: string;
//   description: string;
//   icon: string;
//   monthlyPrice: string;
//   annualPrice: string;
//   features: { name: string; included: boolean }[];
//   permissions: {
//     channel: string;
//     contacts: string;
//     automation: string;
//   };
// }

// interface SubscriptionResponse {
//   success: boolean;
//   data: Array<{
//     subscription: MasterSubscription;
//     user: User;
//     plan: Plan;
//   }>;
//   pagination: {
//     total: number;
//     totalPages: number;
//     page: number;
//     limit: number;
//   };
// }

// // ------------------- COMPONENT -------------------
// export default function AllSubscriptionsPage() {
//   const [currentPage, setCurrentPage] = useState(1);
//   const { user, currencySymbol } = useAuth();
//   const [limit, setLimit] = useState(10);

//   const { data, isLoading, isError, error } = useQuery<SubscriptionResponse>({
//     queryKey: ["subscriptions", currentPage],
//     queryFn: async () => {
//       const res = await apiRequest(
//         "GET",
//         `/api/subscriptions?page=${currentPage}&limit=${limit}`
//       );
//       const json = await res.json();
//       return json;
//     },
//     keepPreviousData: true,
//   });

//   const subscriptions = data?.data ?? [];
//   const page = data?.pagination?.page ?? currentPage;
//   const totalPages = data?.pagination?.totalPages ?? 1;

//   // ------------------- LOADING -------------------
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center py-10 text-muted-foreground">
//         <Loader2 className="w-5 h-5 mr-2 animate-spin" />
//         Loading subscriptions...
//       </div>
//     );
//   }

//   // ------------------- ERROR -------------------
//   if (isError) {
//     return (
//       <p className="text-red-500 text-sm">
//         Error: {(error as Error)?.message || "Failed to load subscriptions"}
//       </p>
//     );
//   }

//   // ------------------- RENDER TABLE -------------------
//   return (
//     <>
//       <Header
//         title="Master Subscriptions"
//         subtitle="Manage all subscriptions"
//       />
//       <div className="container mx-auto px-4 py-6">
//         <h1 className="text-2xl font-semibold mb-4">All Subscriptions</h1>
//         <div className="overflow-x-auto">
//           <table className="min-w-full border border-gray-200 bg-white rounded-lg shadow-sm">
//             <thead className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
//               <tr>
//                 <th className="py-3 px-4 border-b">Username</th>
//                 <th className="py-3 px-4 border-b">Plan</th>
//                 <th className="py-3 px-4 border-b">Price</th>
//                 <th className="py-3 px-4 border-b">Status</th>
//                 <th className="py-3 px-4 border-b">Start Date</th>
//                 <th className="py-3 px-4 border-b">End Date</th>
//                 <th className="py-3 px-4 border-b">Auto Renew</th>
//               </tr>
//             </thead>
//             <tbody>
//               {subscriptions.map(({ subscription, user, plan }) => (
//                 <tr
//                   key={subscription.id}
//                   className="hover:bg-gray-50 transition-colors text-sm text-gray-700"
//                 >
//                   <td className="py-3 px-4 border-b">{user.username}</td>
//                   <td className="py-3 px-4 border-b">{plan.name}</td>
//                   <td className="py-3 px-4 border-b">
//                     {subscription.billingCycle === "monthly"
//                       ? `${currencySymbol}${plan.monthlyPrice}`
//                       : `${currencySymbol}${plan.annualPrice}`}
//                   </td>
//                   <td className="py-3 px-4 border-b">
//                     <span
//                       className={`px-2 py-1 rounded text-xs ${
//                         subscription.status === "active"
//                           ? "bg-green-100 text-green-700"
//                           : subscription.status === "pending"
//                           ? "bg-yellow-100 text-yellow-700"
//                           : "bg-red-100 text-red-700"
//                       }`}
//                     >
//                       {subscription.status}
//                     </span>
//                   </td>
//                   <td className="py-3 px-4 border-b">
//                     {new Date(subscription.startDate).toLocaleString()}
//                   </td>
//                   <td className="py-3 px-4 border-b">
//                     {new Date(subscription.endDate).toLocaleString()}
//                   </td>
//                   <td className="py-3 px-4 border-b">
//                     {subscription.autoRenew ? "Yes" : "No"}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* ------------------- PAGINATION ------------------- */}

//         {/* Pagination Section */}
//         <div className="flex items-center justify-between mt-4 p-4 bg-white border rounded-lg shadow-sm">
//           {/* Showing information */}
//           <div className="text-sm text-gray-600">
//             Showing{" "}
//             <span className="font-semibold">{(page - 1) * limit + 1}</span> to{" "}
//             <span className="font-semibold">
//               {Math.min(page * limit, data?.pagination?.total ?? 0)}
//             </span>{" "}
//             of{" "}
//             <span className="font-semibold">
//               {data?.pagination?.total ?? 0}
//             </span>{" "}
//             subscriptions
//           </div>

//           {/* Page size dropdown */}
//           <div className="flex items-center space-x-2">
//             <select
//               className="border rounded-md px-3 py-1 text-sm bg-white shadow-sm"
//               value={limit}
//               onChange={(e) => {
//                 setCurrentPage(1);
//                 setLimit(Number(e.target.value));
//                 // Optional: setLimit(Number(e.target.value));
//               }}
//             >
//               {[10, 20, 50, 100].map((size) => (
//                 <option key={size} value={size}>
//                   {size}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Pagination buttons */}
//           <div className="flex items-center space-x-1">
//             <button
//               onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//               disabled={page === 1}
//               className="px-3 py-1 text-sm border rounded-md bg-gray-100 disabled:opacity-50"
//             >
//               Previous
//             </button>

//             {/* Page numbers */}
//             {[...Array(totalPages)].map((_, i) => {
//               const pageNumber = i + 1;
//               return (
//                 <button
//                   key={pageNumber}
//                   onClick={() => setCurrentPage(pageNumber)}
//                   className={`px-3 py-1 text-sm border rounded-md ${
//                     pageNumber === page
//                       ? "bg-green-600 text-white"
//                       : "bg-white hover:bg-gray-50"
//                   }`}
//                 >
//                   {pageNumber}
//                 </button>
//               );
//             })}

//             <button
//               onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//               disabled={page === totalPages}
//               className="px-3 py-1 text-sm border rounded-md bg-gray-100 disabled:opacity-50"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [limit, setLimit] = useState(10);
  const { currencySymbol } = useAuth();

  const { data, isLoading, isError, error } = useQuery<SubscriptionResponse>({
    queryKey: ["subscriptions", currentPage, limit],
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
  const total = data?.pagination?.total ?? 0;

  // Handle limit change
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1); // Reset to first page
  };

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5; // Number of page buttons to show

    if (totalPages <= showPages) {
      // Show all pages if total is less than showPages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages with ellipsis
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  // ------------------- LOADING -------------------
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mb-3" />
          <p className="text-gray-600">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  // ------------------- ERROR -------------------
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-600 font-medium mb-2">Error Loading Data</p>
          <p className="text-red-500 text-sm">
            {(error as Error)?.message || "Failed to load subscriptions"}
          </p>
        </div>
      </div>
    );
  }

  // ------------------- RENDER -------------------
  return (
    <>
      <Header
        title="Master Subscriptions"
        subtitle="Manage all subscriptions"
      />
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            All Subscriptions
          </h1>
          <p className="text-gray-600 mt-1">
            Total {total} subscription{total !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                  Username
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                  Plan
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                  Price
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                  Status
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                  Start Date
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                  End Date
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                  Auto Renew
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subscriptions.map(({ subscription, user, plan }) => (
                <tr
                  key={subscription.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {user.username}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {plan.name}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                    {subscription.billingCycle === "monthly"
                      ? `${currencySymbol}${plan.monthlyPrice}`
                      : `${currencySymbol}${plan.annualPrice}`}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
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
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(subscription.startDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(subscription.endDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    <span
                      className={`${
                        subscription.autoRenew
                          ? "text-green-600 font-medium"
                          : "text-gray-500"
                      }`}
                    >
                      {subscription.autoRenew ? "Yes" : "No"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden space-y-4">
          {subscriptions.map(({ subscription, user, plan }) => (
            <div
              key={subscription.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {user.username}
                  </h3>
                  <p className="text-sm text-gray-600">{plan.name}</p>
                </div>
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    subscription.status === "active"
                      ? "bg-green-100 text-green-700"
                      : subscription.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {subscription.status}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium text-gray-900">
                    {subscription.billingCycle === "monthly"
                      ? `${currencySymbol}${plan.monthlyPrice}`
                      : `${currencySymbol}${plan.annualPrice}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Start Date:</span>
                  <span className="text-gray-900">
                    {new Date(subscription.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">End Date:</span>
                  <span className="text-gray-900">
                    {new Date(subscription.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Auto Renew:</span>
                  <span
                    className={`${
                      subscription.autoRenew
                        ? "text-green-600 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {subscription.autoRenew ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Section */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          {/* Desktop Pagination */}
          <div className="hidden md:flex items-center justify-between">
            {/* Left: Showing info */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {(page - 1) * limit + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-gray-900">
                  {Math.min(page * limit, total)}
                </span>{" "}
                of <span className="font-semibold text-gray-900">{total}</span>
              </div>

              {/* Page size dropdown */}
              <select
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
              >
                {[10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
            </div>

            {/* Right: Page buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {getPageNumbers().map((pageNum, idx) =>
                pageNum === "..." ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-3 py-2 text-gray-500"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum as number)}
                    className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                      pageNum === page
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              )}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={page === totalPages}
                className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Pagination */}
          <div className="md:hidden space-y-4">
            {/* Info and Dropdown */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">
                  {(page - 1) * limit + 1}
                </span>{" "}
                -{" "}
                <span className="font-semibold text-gray-900">
                  {Math.min(page * limit, total)}
                </span>{" "}
                of <span className="font-semibold text-gray-900">{total}</span>
              </div>

              <select
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white shadow-sm w-full sm:w-auto"
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
              >
                {[10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex-1 flex items-center justify-center gap-1 px-4 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-1 px-3 py-2 bg-green-100 rounded-md">
                <span className="text-sm font-medium text-green-700">
                  Page {page} of {totalPages}
                </span>
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={page === totalPages}
                className="flex-1 flex items-center justify-center gap-1 px-4 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
