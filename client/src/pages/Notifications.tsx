import React, { useState } from "react";
import {
  Bell,
  MessageSquare,
  Users,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  Trash2,
  MoreVertical,
  Filter,
  Search,
  Eye,
  EyeOff,
  ArrowDown,
  ArrowUp,
  RefreshCw,
  X,
} from "lucide-react";

const Notifications = () => {
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>(
    []
  );
  const [showRead, setShowRead] = useState(true);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [showFilters, setShowFilters] = useState(false);

  const notifications = [
    {
      id: 1,
      type: "message",
      title: "New message from John Smith",
      description: "Hi, I have a question about your service...",
      timestamp: "2024-01-20T14:30:00",
      read: false,
      priority: "medium",
      actionUrl: "/chat-hub",
    },
    {
      id: 2,
      type: "campaign",
      title: 'Campaign "Welcome Series" completed',
      description:
        "Your campaign has been delivered to 1,247 contacts with 98.5% success rate.",
      timestamp: "2024-01-20T12:15:00",
      read: false,
      priority: "low",
      actionUrl: "/campaigns",
    },
    {
      id: 3,
      type: "system",
      title: "System maintenance scheduled",
      description:
        "Scheduled maintenance on January 25, 2024 from 2:00 AM to 4:00 AM UTC.",
      timestamp: "2024-01-19T18:45:00",
      read: false,
      priority: "high",
      actionUrl: "/health-monitor",
    },
    {
      id: 4,
      type: "contact",
      title: "New contacts imported",
      description:
        "892 contacts were successfully imported from your CSV file.",
      timestamp: "2024-01-19T10:30:00",
      read: true,
      priority: "low",
      actionUrl: "/contacts",
    },
    {
      id: 5,
      type: "system",
      title: "API rate limit warning",
      description: "You have reached 80% of your API rate limit for the day.",
      timestamp: "2024-01-18T16:20:00",
      read: true,
      priority: "medium",
      actionUrl: "/settings/api",
    },
    {
      id: 6,
      type: "message",
      title: "Message template approved",
      description:
        'Your "Order Confirmation" template has been approved by Meta.',
      timestamp: "2024-01-18T11:05:00",
      read: true,
      priority: "medium",
      actionUrl: "/templates",
    },
    {
      id: 7,
      type: "team",
      title: "New team member joined",
      description:
        "Sarah Johnson has accepted your invitation and joined your team.",
      timestamp: "2024-01-17T14:50:00",
      read: true,
      priority: "low",
      actionUrl: "/team",
    },
  ];

  const getFilteredNotifications = () => {
    let filtered = [...notifications];

    if (filterType !== "all") {
      filtered = filtered.filter(
        (notification) => notification.type === filterType
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (notification) =>
          notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (!showRead) {
      filtered = filtered.filter((notification) => !notification.read);
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  };

  const filteredNotifications = getFilteredNotifications();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "message":
        return (
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
        );
      case "campaign":
        return <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />;
      case "system":
        return <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />;
      case "contact":
        return <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />;
      case "team":
        return <Users className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />;
      default:
        return <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "message":
        return "bg-blue-100 text-blue-800";
      case "campaign":
        return "bg-green-100 text-green-800";
      case "system":
        return "bg-red-100 text-red-800";
      case "contact":
        return "bg-purple-100 text-purple-800";
      case "team":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleSelectNotification = (id: number) => {
    setSelectedNotifications((prev) =>
      prev.includes(id)
        ? prev.filter((notificationId) => notificationId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map((n) => n.id));
    }
  };

  const handleMarkAsRead = () => {
    console.log("Mark as read:", selectedNotifications);
  };

  const handleMarkAllAsRead = () => {
    console.log("Mark all as read");
  };

  const handleDeleteSelected = () => {
    console.log("Delete selected:", selectedNotifications);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 sm:py-4 gap-3">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  Notifications
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  Stay updated with important alerts
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleMarkAllAsRead}
                className="flex-1 sm:flex-none text-purple-600 hover:text-purple-700 font-medium text-sm sm:text-base px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors"
              >
                Mark all read
              </button>
              <button className="flex-1 sm:flex-none bg-purple-500 text-white px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center">
                <Settings className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {[
            {
              title: "All Notifications",
              value: notifications.length.toString(),
              icon: Bell,
              color: "blue",
            },
            {
              title: "Unread",
              value: notifications.filter((n) => !n.read).length.toString(),
              icon: Eye,
              color: "purple",
            },
            {
              title: "High Priority",
              value: notifications
                .filter((n) => n.priority === "high")
                .length.toString(),
              icon: AlertCircle,
              color: "red",
            },
            {
              title: "Today",
              value: notifications
                .filter(
                  (n) =>
                    new Date(n.timestamp).toDateString() ===
                    new Date().toDateString()
                )
                .length.toString(),
              icon: Calendar,
              color: "green",
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
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
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
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-between w-full px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700"
            >
              <span className="flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Filters & Sort
              </span>
              {showFilters ? (
                <X className="w-4 h-4" />
              ) : (
                <MoreVertical className="w-4 h-4" />
              )}
            </button>

            {/* Filters - Desktop Always Visible, Mobile Collapsible */}
            <div
              className={`${
                showFilters ? "flex" : "hidden"
              } lg:flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3`}
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hidden sm:block" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="message">Messages</option>
                    <option value="campaign">Campaigns</option>
                    <option value="system">System</option>
                    <option value="contact">Contacts</option>
                    <option value="team">Team</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <button
                  onClick={() => setShowRead(!showRead)}
                  className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  {showRead ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  <span>{showRead ? "Hide Read" : "Show Read"}</span>
                </button>

                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
                  }
                  className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  {sortOrder === "newest" ? (
                    <ArrowDown className="w-4 h-4" />
                  ) : (
                    <ArrowUp className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">
                    {sortOrder === "newest" ? "Newest" : "Oldest"}
                  </span>
                </button>

                <button className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100">
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span className="text-xs sm:text-sm text-blue-800 font-medium">
                {selectedNotifications.length} notification
                {selectedNotifications.length > 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={handleMarkAsRead}
                  className="flex-1 sm:flex-none text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-100"
                >
                  Mark as Read
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="flex-1 sm:flex-none text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-100"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedNotifications([])}
                  className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={
                    selectedNotifications.length ===
                      filteredNotifications.length &&
                    filteredNotifications.length > 0
                  }
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs sm:text-sm font-medium text-gray-700">
                  Select All
                </span>
              </div>
              <span className="text-xs sm:text-sm text-gray-500">
                {filteredNotifications.length} notification
                {filteredNotifications.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 sm:p-4 hover:bg-gray-50 transition-colors ${
                  !notification.read ? "bg-purple-50" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => handleSelectNotification(notification.id)}
                    className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500 flex-shrink-0"
                  />

                  <div
                    className={`p-1.5 sm:p-2 rounded-lg ${getTypeColor(
                      notification.type
                    )} flex-shrink-0`}
                  >
                    {getTypeIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`text-sm sm:text-base font-medium ${
                            !notification.read
                              ? "text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                            notification.priority
                          )}`}
                        >
                          {notification.priority}
                        </span>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                      <a
                        href={notification.actionUrl}
                        className="text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        View Details
                      </a>
                      <div className="flex items-center gap-1 sm:gap-2">
                        {!notification.read && (
                          <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredNotifications.length === 0 && (
            <div className="p-8 sm:p-12 text-center">
              <Bell className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                No notifications found
              </h3>
              <p className="text-sm sm:text-base text-gray-500">
                {searchTerm || filterType !== "all" || !showRead
                  ? "Try adjusting your filters or search criteria"
                  : "You're all caught up!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
