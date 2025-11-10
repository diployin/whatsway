import React, { useState } from "react";
import {
  Headphones,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Tag,
  Mail,
  Phone,
} from "lucide-react";

const SupportTickets = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
  const [activeTicket, setActiveTicket] = useState<number | null>(null);

  const tickets = [
    {
      id: 1,
      subject: "Unable to send bulk messages",
      description: `I'm trying to send a campaign to 500 contacts but keep getting an error message.`,
      status: "open",
      priority: "high",
      category: "technical",
      createdAt: "2024-01-20 14:30",
      updatedAt: "2024-01-20 15:45",
      customer: {
        name: "John Smith",
        email: "john.smith@example.com",
        phone: "+1 (555) 123-4567",
        company: "TechCorp Inc.",
        avatar:
          "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
      },
      assignee: {
        name: "Sarah Johnson",
        avatar:
          "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
      },
      messages: [
        {
          id: 101,
          sender: "customer",
          content: `I'm trying to send a campaign to 500 contacts but keep getting an error message saying "Rate limit exceeded". What does this mean?`,
          timestamp: "2024-01-20 14:30",
        },
        {
          id: 102,
          sender: "agent",
          content: `Hi John, thank you for reaching out. The "Rate limit exceeded" error means you've reached your WhatsApp API sending limits. What plan are you currently on?`,
          timestamp: "2024-01-20 15:45",
        },
      ],
    },
    {
      id: 2,
      subject: "Need help with template approval",
      description:
        "My message template was rejected by Meta. Need assistance to fix it.",
      status: "in-progress",
      priority: "medium",
      category: "account",
      createdAt: "2024-01-19 10:15",
      updatedAt: "2024-01-20 09:30",
      customer: {
        name: "Sarah Johnson",
        email: "sarah.johnson@example.com",
        phone: "+1 (555) 234-5678",
        company: "Marketing Pro",
        avatar:
          "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
      },
      assignee: {
        name: "Michael Brown",
        avatar:
          "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
      },
      messages: [
        {
          id: 201,
          sender: "customer",
          content: `My message template was rejected by Meta. The error says it violates their policies but I don't understand why.`,
          timestamp: "2024-01-19 10:15",
        },
        {
          id: 202,
          sender: "agent",
          content: `Hello Sarah, I'll help you with your template. Could you please share the exact template content and the rejection reason from Meta?`,
          timestamp: "2024-01-19 11:20",
        },
        {
          id: 203,
          sender: "customer",
          content: `The template says "Limited time offer! 50% off all products. Shop now!" and the rejection reason is "Promotional content not allowed in this template type".`,
          timestamp: "2024-01-19 13:45",
        },
        {
          id: 204,
          sender: "agent",
          content: `I see the issue. You need to use a Marketing template type for promotional content. I'll help you resubmit it correctly.`,
          timestamp: "2024-01-20 09:30",
        },
      ],
    },
    {
      id: 3,
      subject: "Billing question about subscription",
      description:
        "I was charged twice for my monthly subscription. Need refund.",
      status: "resolved",
      priority: "low",
      category: "billing",
      createdAt: "2024-01-18 16:20",
      updatedAt: "2024-01-19 14:10",
      customer: {
        name: "Michael Brown",
        email: "michael.brown@example.com",
        phone: "+1 (555) 345-6789",
        company: "Brown Enterprises",
        avatar:
          "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
      },
      assignee: {
        name: "Emily Davis",
        avatar:
          "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
      },
      messages: [
        {
          id: 301,
          sender: "customer",
          content: `I noticed I was charged twice for my monthly subscription on January 15th. Can you please look into this and process a refund?`,
          timestamp: "2024-01-18 16:20",
        },
        {
          id: 302,
          sender: "agent",
          content: `Hi Michael, I apologize for the inconvenience. I've checked your account and confirmed the double charge. I've processed a refund for the duplicate charge, which should appear in your account in 3-5 business days.`,
          timestamp: "2024-01-19 10:30",
        },
        {
          id: 303,
          sender: "customer",
          content: `Thank you for the quick resolution! I appreciate it.`,
          timestamp: "2024-01-19 11:45",
        },
        {
          id: 304,
          sender: "agent",
          content: `You're welcome, Michael! Is there anything else I can help you with today?`,
          timestamp: "2024-01-19 12:15",
        },
        {
          id: 305,
          sender: "customer",
          content: `No, that's all. Thanks again!`,
          timestamp: "2024-01-19 14:00",
        },
      ],
    },
    {
      id: 4,
      subject: "Feature request: Scheduled messages",
      description:
        "Would like to request a feature to schedule messages for future delivery.",
      status: "pending",
      priority: "medium",
      category: "feature-request",
      createdAt: "2024-01-17 09:45",
      updatedAt: "2024-01-17 11:30",
      customer: {
        name: "Emily Davis",
        email: "emily.davis@example.com",
        phone: "+1 (555) 456-7890",
        company: "Davis Marketing",
        avatar:
          "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
      },
      assignee: null,
      messages: [
        {
          id: 401,
          sender: "customer",
          content: `I would like to request a feature to schedule WhatsApp messages for future delivery. This would be very helpful for our marketing campaigns.`,
          timestamp: "2024-01-17 09:45",
        },
        {
          id: 402,
          sender: "system",
          content: `Thank you for your feature request. We've recorded it and will forward it to our product team for consideration.`,
          timestamp: "2024-01-17 09:46",
        },
      ],
    },
  ];

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || ticket.status === filterStatus;
    const matchesPriority =
      filterPriority === "all" || ticket.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-purple-100 text-purple-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertTriangle className="w-4 h-4 text-blue-500" />;
      case "in-progress":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-purple-500" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "technical":
        return "bg-blue-100 text-blue-800";
      case "account":
        return "bg-purple-100 text-purple-800";
      case "billing":
        return "bg-orange-100 text-orange-800";
      case "feature-request":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSelectTicket = (id: number) => {
    setSelectedTickets((prev) =>
      prev.includes(id)
        ? prev.filter((ticketId) => ticketId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedTickets.length === filteredTickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(filteredTickets.map((ticket) => ticket.id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 py-3 sm:py-4">
            {/* Left: Icon + titles */}
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
              <div className="bg-purple-100 p-2 sm:p-2.5 rounded-lg shrink-0">
                <Headphones className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                  Support Tickets
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  Manage customer support requests
                </p>
              </div>
            </div>

            {/* Right: CTA */}
            <div className="w-full sm:w-auto">
              <button
                className="w-full sm:w-auto inline-flex items-center justify-center bg-purple-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 text-sm sm:text-base"
                aria-label="Create ticket"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="max-[360px]:sr-only">Create Ticket</span>
                <span className="max-[360px]:hidden">Create Ticket</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Total Tickets",
              value: tickets.length.toString(),
              color: "blue",
            },
            {
              title: "Open Tickets",
              value: tickets
                .filter((t) => t.status === "open")
                .length.toString(),
              color: "yellow",
            },
            {
              title: "In Progress",
              value: tickets
                .filter((t) => t.status === "in-progress")
                .length.toString(),
              color: "purple",
            },
            {
              title: "Resolved",
              value: tickets
                .filter((t) => t.status === "resolved")
                .length.toString(),
              color: "green",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <Headphones className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tickets List */}
          <div className="lg:col-span-1">
            {/* Filters and Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-2 mt-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                </select>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Tickets */}
            <div className="space-y-3">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setActiveTicket(ticket.id)}
                  className={`bg-white p-4 rounded-xl shadow-sm border ${
                    activeTicket === ticket.id
                      ? "border-purple-500 ring-2 ring-purple-200"
                      : "border-gray-200"
                  } hover:border-purple-500 transition-all cursor-pointer`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(ticket.status)}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        {ticket.status.replace("-", " ")}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                          ticket.priority
                        )}`}
                      >
                        {ticket.priority}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-medium text-gray-900 mb-2">
                    {ticket.subject}
                  </h3>

                  <div className="flex items-center space-x-2 mb-3">
                    <img
                      src={ticket.customer.avatar}
                      alt={ticket.customer.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-sm text-gray-600">
                      {ticket.customer.name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{ticket.messages.length} messages</span>
                    <span>
                      Updated {new Date(ticket.updatedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {filteredTickets.length === 0 && (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
                <Headphones className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tickets found
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ||
                  filterStatus !== "all" ||
                  filterPriority !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "All support tickets have been resolved!"}
                </p>
              </div>
            )}
          </div>

          {/* Ticket Details */}
          <div className="lg:col-span-2">
            {activeTicket ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {(() => {
                  const ticket = tickets.find((t) => t.id === activeTicket);
                  if (!ticket) return null;

                  return (
                    <>
                      {/* Ticket Header */}
                      <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <h2 className="text-xl font-bold text-gray-900">
                              {ticket.subject}
                            </h2>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                ticket.status
                              )}`}
                            >
                              {ticket.status.replace("-", " ")}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                              <Edit className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Customer:</span>
                            <div className="flex items-center mt-1">
                              <img
                                src={ticket.customer.avatar}
                                alt={ticket.customer.name}
                                className="w-6 h-6 rounded-full mr-2 object-cover"
                              />
                              <span className="font-medium text-gray-900">
                                {ticket.customer.name}
                              </span>
                            </div>
                            <div className="mt-1 text-gray-600">
                              {ticket.customer.company}
                            </div>
                          </div>

                          <div>
                            <span className="text-gray-500">Contact:</span>
                            <div className="flex items-center mt-1">
                              <Mail className="w-4 h-4 text-gray-400 mr-1" />
                              <span className="text-gray-900">
                                {ticket.customer.email}
                              </span>
                            </div>
                            <div className="flex items-center mt-1">
                              <Phone className="w-4 h-4 text-gray-400 mr-1" />
                              <span className="text-gray-900">
                                {ticket.customer.phone}
                              </span>
                            </div>
                          </div>

                          <div>
                            <span className="text-gray-500">Details:</span>
                            <div className="flex items-center mt-1">
                              <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                              <span className="text-gray-900">
                                {new Date(
                                  ticket.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center mt-1">
                              <Tag className="w-4 h-4 text-gray-400 mr-1" />
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(
                                  ticket.category
                                )}`}
                              >
                                {ticket.category.replace("-", " ")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Conversation */}
                      <div className="p-6 bg-gray-50 max-h-[500px] overflow-y-auto">
                        <h3 className="font-medium text-gray-900 mb-4">
                          Conversation
                        </h3>
                        <div className="space-y-4">
                          {ticket.messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${
                                message.sender === "customer"
                                  ? "justify-start"
                                  : message.sender === "agent"
                                  ? "justify-end"
                                  : "justify-center"
                              }`}
                            >
                              {message.sender === "system" ? (
                                <div className="bg-gray-200 px-4 py-2 rounded-lg text-sm text-gray-700 max-w-md">
                                  {message.content}
                                </div>
                              ) : (
                                <div
                                  className={`max-w-md ${
                                    message.sender === "customer"
                                      ? "bg-white border border-gray-200"
                                      : "bg-purple-500 text-white"
                                  } px-4 py-3 rounded-lg shadow-sm`}
                                >
                                  <p className="text-sm">{message.content}</p>
                                  <div
                                    className={`text-xs mt-1 ${
                                      message.sender === "customer"
                                        ? "text-gray-500"
                                        : "text-purple-100"
                                    }`}
                                  >
                                    {new Date(
                                      message.timestamp
                                    ).toLocaleTimeString()}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Reply Box */}
                      <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center space-x-2">
                          <textarea
                            placeholder="Type your reply..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            rows={3}
                          ></textarea>
                          <button className="bg-purple-500 text-white p-3 rounded-lg hover:bg-purple-600 transition-colors">
                            <ArrowRight className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex space-x-2">
                            <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
                              Add Note
                            </button>
                            <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
                              Canned Response
                            </button>
                          </div>
                          <div className="flex space-x-2">
                            <button className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200">
                              Resolve Ticket
                            </button>
                            <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                              Assign
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
                <Headphones className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No ticket selected
                </h3>
                <p className="text-gray-500 mb-4">
                  Select a ticket from the list to view details and respond
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportTickets;
