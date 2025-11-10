import React, { useState } from "react";
import {
  FileText,
  Search,
  Filter,
  Download,
  CheckCheck,
  Clock,
  AlertCircle,
  XCircle,
  MessageSquare,
  User,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Eye,
  MoreVertical,
} from "lucide-react";

const MessageLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateRange, setDateRange] = useState("7d");
  const [expandedMessage, setExpandedMessage] = useState<number | null>(null);

  const messages = [
    {
      id: 1,
      recipient: "John Smith",
      phone: "+1 (555) 123-4567",
      type: "text",
      content:
        "Thank you for your order! Your package will be shipped within 24 hours.",
      status: "delivered",
      timestamp: "2024-01-20 14:30:45",
      deliveredAt: "2024-01-20 14:30:52",
      readAt: "2024-01-20 14:35:12",
      campaign: "Order Confirmation",
      template: "order_confirmation",
      metadata: {
        orderId: "ORD-12345",
        deliveryDate: "2024-01-25",
        trackingNumber: "TRK-9876543",
      },
    },
    {
      id: 2,
      recipient: "Sarah Johnson",
      phone: "+1 (555) 234-5678",
      type: "template",
      content:
        "Your appointment with Dr. Michael Chen is scheduled for January 25, 2024 at 10:00 AM. Reply YES to confirm or NO to reschedule.",
      status: "read",
      timestamp: "2024-01-20 13:15:22",
      deliveredAt: "2024-01-20 13:15:30",
      readAt: "2024-01-20 13:20:45",
      campaign: "Appointment Reminder",
      template: "appointment_reminder",
      metadata: {
        appointmentId: "APT-54321",
        doctorName: "Dr. Michael Chen",
        appointmentDate: "2024-01-25",
        appointmentTime: "10:00 AM",
      },
    },
    {
      id: 3,
      recipient: "Michael Brown",
      phone: "+1 (555) 345-6789",
      type: "image",
      content:
        "Check out our new product lineup for 2024! [Image: product_catalog.jpg]",
      status: "failed",
      timestamp: "2024-01-20 12:05:10",
      deliveredAt: null,
      readAt: null,
      campaign: "Product Launch",
      template: "product_announcement",
      metadata: {
        errorCode: "INVALID_RECIPIENT",
        errorMessage: "The recipient is not a valid WhatsApp user",
      },
    },
    {
      id: 4,
      recipient: "Emily Davis",
      phone: "+1 (555) 456-7890",
      type: "text",
      content:
        "Your cart is waiting! Complete your purchase to get 15% off with code COMEBACK15.",
      status: "sent",
      timestamp: "2024-01-20 11:30:15",
      deliveredAt: null,
      readAt: null,
      campaign: "Cart Abandonment",
      template: "cart_recovery",
      metadata: {
        cartId: "CART-67890",
        itemCount: 3,
        cartValue: "$125.45",
        discountCode: "COMEBACK15",
      },
    },
    {
      id: 5,
      recipient: "David Wilson",
      phone: "+1 (555) 567-8901",
      type: "interactive",
      content:
        "How would you rate your recent experience with our customer service team? [Buttons: 1-5 stars]",
      status: "delivered",
      timestamp: "2024-01-20 10:45:30",
      deliveredAt: "2024-01-20 10:45:38",
      readAt: null,
      campaign: "Customer Feedback",
      template: "feedback_request",
      metadata: {
        ticketId: "TKT-24680",
        agentName: "Lisa Thompson",
        serviceDate: "2024-01-19",
      },
    },
  ];

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.phone.includes(searchTerm) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.campaign.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || message.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-blue-100 text-blue-800";
      case "read":
        return "bg-green-100 text-green-800";
      case "sent":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      case "read":
        return <CheckCheck className="w-4 h-4 text-green-500" />;
      case "sent":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return <MessageSquare className="w-4 h-4 text-gray-500" />;
      case "image":
        return <Eye className="w-4 h-4 text-gray-500" />;
      case "template":
        return <FileText className="w-4 h-4 text-gray-500" />;
      case "interactive":
        return <MessageSquare className="w-4 h-4 text-gray-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  const toggleMessageExpand = (id: number) => {
    setExpandedMessage(expandedMessage === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 sm:py-4 gap-3">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  Message Logs
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  Track and analyze your WhatsApp messages
                </p>
              </div>
            </div>
            <button className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center text-sm sm:text-base">
              <Download className="w-4 h-4 mr-2" />
              Export Logs
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {[
            {
              title: "Total Messages",
              value: messages.length.toString(),
              icon: MessageSquare,
              color: "blue",
            },
            {
              title: "Delivery Rate",
              value: `${Math.round(
                (messages.filter(
                  (m) => m.status === "delivered" || m.status === "read"
                ).length /
                  messages.length) *
                  100
              )}%`,
              icon: CheckCheck,
              color: "green",
            },
            {
              title: "Read Rate",
              value: `${Math.round(
                (messages.filter((m) => m.status === "read").length /
                  messages.length) *
                  100
              )}%`,
              icon: Eye,
              color: "purple",
            },
            {
              title: "Failed Messages",
              value: messages
                .filter((m) => m.status === "failed")
                .length.toString(),
              icon: AlertCircle,
              color: "red",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                    {stat.title}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`p-2 sm:p-3 rounded-lg bg-${stat.color}-100 flex-shrink-0 ml-2`}
                >
                  <stat.icon
                    className={`w-5 h-5 sm:w-6 sm:h-6 text-${stat.color}-600`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 mb-4 sm:mb-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="delivered">Delivered</option>
                <option value="read">Read</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
              </select>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
              <button className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                <Filter className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">More Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Message Logs - Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipient
                  </th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMessages.map((message) => (
                  <React.Fragment key={message.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {message.timestamp}
                      </td>
                      <td className="px-4 xl:px-6 py-4">
                        <div className="flex items-center">
                          <User className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {message.recipient}
                            </div>
                            <div className="text-sm text-gray-500">
                              {message.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 xl:px-6 py-4">
                        <div className="flex items-center">
                          {getTypeIcon(message.type)}
                          <div className="ml-2 text-sm text-gray-900 max-w-xs truncate">
                            {message.content}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {message.campaign}
                      </td>
                      <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(message.status)}
                          <span
                            className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              message.status
                            )}`}
                          >
                            {message.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleMessageExpand(message.id)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            {expandedMessage === message.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedMessage === message.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="px-4 xl:px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">
                                Message Details
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Type:</span>
                                  <span className="text-gray-900">
                                    {message.type}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">
                                    Template:
                                  </span>
                                  <span className="text-gray-900">
                                    {message.template}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Sent:</span>
                                  <span className="text-gray-900">
                                    {message.timestamp}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">
                                Delivery Status
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Status:</span>
                                  <span
                                    className={`font-medium ${
                                      message.status === "read"
                                        ? "text-green-600"
                                        : message.status === "delivered"
                                        ? "text-blue-600"
                                        : message.status === "sent"
                                        ? "text-yellow-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {message.status.charAt(0).toUpperCase() +
                                      message.status.slice(1)}
                                  </span>
                                </div>
                                {message.deliveredAt && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">
                                      Delivered:
                                    </span>
                                    <span className="text-gray-900">
                                      {message.deliveredAt}
                                    </span>
                                  </div>
                                )}
                                {message.readAt && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Read:</span>
                                    <span className="text-gray-900">
                                      {message.readAt}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">
                                Metadata
                              </h4>
                              <div className="space-y-2 text-sm">
                                {message.metadata &&
                                  Object.entries(message.metadata).map(
                                    ([key, value]) => (
                                      <div
                                        key={key}
                                        className="flex justify-between"
                                      >
                                        <span className="text-gray-500">
                                          {key
                                            .replace(/([A-Z])/g, " $1")
                                            .replace(/^./, (str) =>
                                              str.toUpperCase()
                                            )}
                                          :
                                        </span>
                                        <span className="text-gray-900">
                                          {value as string}
                                        </span>
                                      </div>
                                    )
                                  )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Message Logs - Mobile Card View */}
        <div className="lg:hidden space-y-3 sm:space-y-4">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {message.recipient}
                      </div>
                      <div className="text-xs text-gray-500">
                        {message.phone}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    {getStatusIcon(message.status)}
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        message.status
                      )}`}
                    >
                      {message.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-3">
                  <div className="flex items-start space-x-2 mb-2">
                    {getTypeIcon(message.type)}
                    <p className="text-sm text-gray-900 line-clamp-2">
                      {message.content}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{message.campaign}</span>
                    <span>{message.timestamp}</span>
                  </div>
                </div>

                {/* Expand Button */}
                <button
                  onClick={() => toggleMessageExpand(message.id)}
                  className="w-full flex items-center justify-center py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  {expandedMessage === message.id ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-1" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
                      View Details
                    </>
                  )}
                </button>

                {/* Expanded Details */}
                {expandedMessage === message.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-900 mb-2 uppercase">
                        Message Details
                      </h4>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Type:</span>
                          <span className="text-gray-900 font-medium">
                            {message.type}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Template:</span>
                          <span className="text-gray-900 font-medium">
                            {message.template}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Sent:</span>
                          <span className="text-gray-900 font-medium">
                            {message.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-gray-900 mb-2 uppercase">
                        Delivery Status
                      </h4>
                      <div className="space-y-1.5 text-xs">
                        {message.deliveredAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Delivered:</span>
                            <span className="text-gray-900 font-medium">
                              {message.deliveredAt}
                            </span>
                          </div>
                        )}
                        {message.readAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Read:</span>
                            <span className="text-gray-900 font-medium">
                              {message.readAt}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {message.metadata && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900 mb-2 uppercase">
                          Metadata
                        </h4>
                        <div className="space-y-1.5 text-xs">
                          {Object.entries(message.metadata).map(
                            ([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-gray-500">
                                  {key
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str) => str.toUpperCase())}
                                  :
                                </span>
                                <span className="text-gray-900 font-medium">
                                  {value as string}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <button className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                      <button className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Resend
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredMessages.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              No messages found
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-6">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria"
                : "No messages have been sent yet"}
            </p>
            <button className="bg-blue-500 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg hover:bg-blue-600 transition-colors flex items-center mx-auto">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Logs
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageLogs;
