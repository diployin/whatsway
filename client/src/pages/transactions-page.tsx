import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Search,
  Filter,
  Download,
  DollarSign,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Ban,
  ChevronLeft,
  ChevronRight,
  X,
  IndianRupeeIcon,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import { formatDateTime } from "@/lib/formatDate";

function TransactionsPage() {
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    paymentMethod: "",
    billingCycle: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
    page: 1,
    limit: 20,
  });

  const [showFilters, setShowFilters] = useState(false);

  // ==================== API CALLS ====================

  // 🔹 Fetch Transactions
  const {
    data: transactionData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["transactions", filters],
    queryFn: async () => {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "" && v !== undefined)
      );
      const { data } = await axios.get("/api/transactions", { params });
      return data;
    },
    keepPreviousData: true,
  });

  // 🔹 Fetch Transaction Stats
  const { data: statsData } = useQuery({
    queryKey: ["transactionStats"],
    queryFn: async () => {
      const { data } = await axios.get("/api/transactions/stats");
      return data;
    },
  });

  const transactions = transactionData?.data || [];
  const stats = statsData?.data || {
    totalRevenue: 0,
    statusCounts: [],
  };

  const totalPages = transactionData?.pagination?.totalPages || 1;
  const totalCount = transactionData?.pagination?.totalCount || 0;

  // ==================== HANDLERS ====================

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      paymentMethod: "",
      billingCycle: "",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
      page: 1,
      limit: 20,
    });
  };

  const handleExport = async () => {
    try {
      const response = await axios.get("/api/transactions/export", {
        params: filters,
        responseType: "blob",
      });
  
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions_${new Date().toISOString()}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };
  

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "refunded":
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      case "cancelled":
        return <Ban className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
      refunded: "bg-blue-100 text-blue-800",
      cancelled: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          colors[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  // ==================== UI ====================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600 mt-1">
              Manage and monitor all payment transactions
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₹{stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <IndianRupeeIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {["completed", "pending", "failed"].map((status) => {
            const stat = stats.statusCounts.find(
              (s: any) => s.status === status
            );
            const color =
              status === "completed"
                ? "blue"
                : status === "pending"
                ? "yellow"
                : "red";
            const Icon =
              status === "completed"
                ? CheckCircle
                : status === "pending"
                ? Clock
                : XCircle;

            return (
              <div
                key={status}
                className="bg-white rounded-lg shadow p-6 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-gray-600 capitalize">{status}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat?.count || 0}
                  </p>
                </div>
                <div className={`p-3 bg-${color}-100 rounded-full`}>
                  <Icon className={`w-6 h-6 text-${color}-600`} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
  <div className="p-6">
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Search */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by email, transaction ID, or order ID..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
        />
      </div>

      {/* Filter Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
      >
        <Filter className="w-5 h-5" />
        Filters
        {Object.values(filters).filter((v) => v && v !== 1 && v !== 20).length > 0 && (
          <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
            {Object.values(filters).filter((v) => v && v !== 1 && v !== 20).length}
          </span>
        )}
      </button>

      {/* Export */}
      <button
        onClick={handleExport}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
      >
        <Download className="w-5 h-5" />
        Export
      </button>
    </div>

    {/* Advanced Filters */}
    {showFilters && (
      <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              handleFilterChange("status", value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <Select
            value={filters.paymentMethod || "all"}
            onValueChange={(value) =>
              handleFilterChange("paymentMethod", value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Methods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
              <SelectItem value="wallet">Wallet</SelectItem>
              <SelectItem value="netbanking">Net Banking</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Billing Cycle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Billing Cycle</label>
          <Select
            value={filters.billingCycle || "all"}
            onValueChange={(value) =>
              handleFilterChange("billingCycle", value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Cycles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cycles</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={filters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={filters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
          />
        </div>

        {/* Min Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Min Amount</label>
          <input
            type="number"
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={filters.minAmount}
            onChange={(e) => handleFilterChange("minAmount", e.target.value)}
          />
        </div>

        {/* Max Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Amount</label>
          <input
            type="number"
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={filters.maxAmount}
            onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
          />
        </div>

        {/* Clear Filters */}
        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        </div>
      </div>
    )}
  </div>
</div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No transactions found
              </h3>
              <p className="text-gray-600">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((item: any) => (
                      <tr
                        key={item.transaction.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item.transaction.providerTransactionId}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.transaction.providerOrderId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {item.user?.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {item.plan?.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.transaction.billingCycle}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item.transaction.currency}{" "}
                            {Number(item.transaction.amount).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(item.transaction.status)}
                            {getStatusBadge(item.transaction.status)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">
                            {item.provider.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                           {formatDateTime(item.transaction.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-gray-50 px-6 py-4 border-t flex flex-wrap items-center justify-between gap-3">
                {/* Left side: summary + per-page selector */}
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {(filters.page - 1) * filters.limit + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(filters.page * filters.limit, totalCount)}
                    </span>{" "}
                    of <span className="font-medium">{totalCount}</span> results
                  </div>

                  {/* Items per page selector */}
                  <select
                    value={filters.limit}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        limit: Number(e.target.value),
                        page: 1,
                      }))
                    }
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                  >
                    {[10, 20, 50, 100, 500].map((val) => (
                      <option key={val} value={val}>
                        {val}/page
                      </option>
                    ))}
                  </select>
                </div>

                {/* Right side: navigation + jump to page */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        page: Math.max(1, prev.page - 1),
                      }))
                    }
                    disabled={filters.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  {/* Jump to page input */}
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      placeholder={`${filters.page}/${totalPages}`}
                      className="w-20 text-center border rounded-md px-2 py-1 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const value = Number(
                            (e.target as HTMLInputElement).value
                          );
                          if (value >= 1 && value <= totalPages) {
                            setFilters((prev) => ({ ...prev, page: value }));
                          }
                        }
                      }}
                    />
                    <span className="text-sm text-gray-600">
                      / {totalPages}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        page: Math.min(totalPages, prev.page + 1),
                      }))
                    }
                    disabled={filters.page >= totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TransactionsPage;
