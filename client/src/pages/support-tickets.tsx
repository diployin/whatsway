import {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useState,
} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/lib/i18n";
import {
  Search,
  MoreVertical,
  Plus,
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Send,
  Headphones,
  Edit,
  Calendar,
  Tag,
  Mail,
  Phone,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/layout/header";

interface AdminUser {
  id: string;
  username: string;
  role: string;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  creatorId: string;
  creatorType: "user" | "listener" | "admin";
  creatorName: string;
  creatorEmail: string;
  assignedToId?: string | null;
  assignedToName?: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  closedAt?: string | null;
}

interface Message {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: "user" | "listener" | "admin";
  senderName: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
}

interface TicketDetailsResponse {
  ticket: Ticket;
  messages: Message[];
}

export default function SupportTicketsNew() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const { t } = useTranslation();

  const [createFormData, setCreateFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
  });

  const itemsPerPage = 25;

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  // Fetch tickets
  const buildQueryKey = () => {
    const params: any = { page: currentPage, limit: itemsPerPage };
    if (searchQuery) params.search = searchQuery;
    if (statusFilter !== "all") params.status = statusFilter;
    if (priorityFilter !== "all") params.priority = priorityFilter;
    return ["/api/tickets", params];
  };

  const { data: ticketsData, isLoading } = useQuery({
    queryKey: buildQueryKey(),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", itemsPerPage.toString());
      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (priorityFilter !== "all") params.append("priority", priorityFilter);

      const res1 = await apiRequest("GET", `/api/tickets?${params.toString()}`);
      return res1.json();
    },
  });

  const tickets: Ticket[] = ticketsData?.tickets || [];
  const totalPages = Math.ceil(
    (ticketsData?.pagination?.total || 0) / itemsPerPage
  );

  // Fetch single ticket with messages
  const { data: ticketDetails, refetch: refetchTicketDetails } = useQuery<any>({
    queryKey: ["/api/tickets", selectedTicketId],
    queryFn: async () => {
      if (!selectedTicketId) return null;
      const resNew = await apiRequest(
        "GET",
        `/api/tickets/${selectedTicketId}`
      );
      return resNew.json();
    },
    enabled: !!selectedTicketId,
  });

  console.log(ticketDetails);

  // Fetch all admins for assignment (admin only)
  const { data: adminsData } = useQuery({
    queryKey: ["/api/admin/admins"],
    queryFn: async () => await apiRequest("GET", "/api/admins?limit=100"),
    enabled: isAdmin,
  });

  const adminUsers: AdminUser[] = adminsData?.admins || [];

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (data: typeof createFormData) => {
      return await apiRequest("POST", "/api/tickets", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      toast({
        title: "Success",
        description: "Ticket created successfully",
      });
      setShowCreateDialog(false);
      setCreateFormData({ title: "", description: "", priority: "medium" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create ticket",
        variant: "destructive",
      });
    },
  });

  // Update ticket mutation (admin only)
  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PUT", `/api/tickets/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      refetchTicketDetails();
      toast({
        title: "Success",
        description: "Ticket updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update ticket",
        variant: "destructive",
      });
    },
  });

  // Add message mutation
  const addMessageMutation = useMutation({
    mutationFn: async ({
      ticketId,
      message,
      isInternal,
    }: {
      ticketId: string;
      message: string;
      isInternal: boolean;
    }) => {
      return await apiRequest("POST", `/api/tickets/${ticketId}/messages`, {
        message,
        isInternal,
      });
    },
    onSuccess: () => {
      refetchTicketDetails();
      setNewMessage("");
      setIsInternalNote(false);
      toast({
        title: "Success",
        description: "Message sent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Delete ticket mutation (admin only)
  const deleteTicketMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/tickets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      setSelectedTicketId(null);
      toast({
        title: "Success",
        description: "Ticket deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete ticket",
        variant: "destructive",
      });
    },
  });

  const handleCreateTicket = () => {
    if (!createFormData.title || !createFormData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createTicketMutation.mutate(createFormData);
  };

  const handleUpdateStatus = (status: string) => {
    if (!selectedTicketId) return;
    updateTicketMutation.mutate({
      id: selectedTicketId,
      data: { status },
    });
  };

  const handleUpdatePriority = (priority: string) => {
    if (!selectedTicketId) return;
    updateTicketMutation.mutate({
      id: selectedTicketId,
      data: { priority },
    });
  };

  const handleAssignTicket = (value: string) => {
    if (!selectedTicketId) return;

    const selectedAdmin = adminUsers.find((admin) => admin.id === value);

    updateTicketMutation.mutate({
      id: selectedTicketId,
      data: {
        assignedToId: value === "unassigned" ? null : value,
        assignedToName: value === "unassigned" ? null : selectedAdmin?.username,
      },
    });
  };

  const handleSendMessage = () => {
    if (!selectedTicketId || !newMessage.trim()) return;

    addMessageMutation.mutate({
      ticketId: selectedTicketId,
      message: newMessage.trim(),
      isInternal: isInternalNote,
    });
  };

  const handleDeleteTicket = (ticketId: string, ticketTitle: string) => {
    if (confirm(`Are you sure you want to delete ticket "${ticketTitle}"?`)) {
      deleteTicketMutation.mutate(ticketId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertTriangle className="w-4 h-4 text-blue-500" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "resolved":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "closed":
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case "user":
        return "bg-blue-100 text-blue-800";
      case "listener":
        return "bg-green-100 text-green-800";
      case "admin":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const getCreatorTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}

      <Header
        title={t("support.title")}
        subtitle={
          isAdmin ? t("support.subtitleAdmin") : t("support.subtitleUser")
        }
        action={{
          label: t("support.createTicket"),
          onClick: () => setShowCreateDialog(true),
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: t("support.stats.totalTickets"),
              value: tickets.length.toString(),
              color: "blue",
            },
            {
              title: t("support.stats.openTickets"),
              value: tickets
                .filter((t) => t.status === "open")
                .length.toString(),
              color: "yellow",
            },
            {
              title: t("support.stats.inProgress"),
              value: tickets
                .filter((t) => t.status === "in_progress")
                .length.toString(),
              color: "green",
            },
            {
              title: t("support.stats.resolved"),
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
                  placeholder={t("support.search.placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-2 mt-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                >
                  <option value="all">{t("support.search.allStatus")}</option>
                  <option value="open">
                    {t("support.search.status.open")}
                  </option>
                  <option value="in_progress">
                    {t("support.search.status.inProgress")}
                  </option>
                  <option value="resolved">
                    {t("support.search.status.resolved")}
                  </option>
                  <option value="closed">
                    {t("support.search.status.closed")}
                  </option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                >
                  <option value="all">{t("support.search.allPriority")}</option>
                  <option value="low">
                    {t("support.search.priority.low")}
                  </option>
                  <option value="medium">
                    {t("support.search.priority.medium")}
                  </option>
                  <option value="high">
                    {t("support.search.priority.high")}
                  </option>
                  <option value="urgent">
                    {t("support.search.priority.urgent")}
                  </option>
                </select>
              </div>
            </div>

            {/* Tickets */}
            {isLoading ? (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
                <div className="text-gray-500">{t("support.loading")}</div>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`bg-white p-4 rounded-xl shadow-sm border ${
                      selectedTicketId === ticket.id
                        ? "border-green-500 ring-2 ring-green-200"
                        : "border-gray-200"
                    } hover:border-green-500 transition-all cursor-pointer`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2 flex-wrap">
                        {getStatusIcon(ticket.status)}
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            ticket.status
                          )}`}
                        >
                          {ticket.status.replace("_", " ")}
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
                      {ticket.title}
                    </h3>

                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-semibold">
                        {ticket.creatorName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-600">
                        {ticket.creatorName}
                      </span>
                      {isAdmin && (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(
                            ticket.creatorType
                          )}`}
                        >
                          {t(`support.creatorType.${ticket.creatorType}`)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {t("support.ticket.updated")}{" "}
                        {new Date(ticket.updatedAt).toLocaleTimeString()}
                      </span>
                      {isAdmin && ticket.assignedToName && (
                        <span className="text-green-600 font-medium">
                          → {ticket.assignedToName}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {tickets.length === 0 && (
                  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
                    <Headphones className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t("support.empty.noTickets")}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchQuery ||
                      statusFilter !== "all" ||
                      priorityFilter !== "all"
                        ? t("support.empty.adjustFilters")
                        : t("support.empty.allResolved")}
                    </p>
                  </div>
                )}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-600">
                  {t("support.pagination.page")} {currentPage}{" "}
                  {t("support.pagination.of")} {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("support.pagination.previous")}
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("support.pagination.next")}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Ticket Details - Continue in next section... */}
        </div>
      </div>
      {/* Create Ticket Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Ticket</DialogTitle>
            <DialogDescription>
              Submit a new support ticket. We'll get back to you as soon as
              possible.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium">
                Title *
              </Label>
              <Input
                id="title"
                value={createFormData.title}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    title: e.target.value,
                  })
                }
                placeholder="Brief description of the issue"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                Description *
              </Label>
              <textarea
                id="description"
                value={createFormData.description}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    description: e.target.value,
                  })
                }
                placeholder="Detailed description of the issue"
                rows={5}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <Label htmlFor="priority" className="text-sm font-medium">
                Priority
              </Label>
              <select
                id="priority"
                value={createFormData.priority}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    priority: e.target.value as any,
                  })
                }
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <button
              onClick={() => setShowCreateDialog(false)}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateTicket}
              disabled={createTicketMutation.isPending}
              className="px-4 py-2 text-sm text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createTicketMutation.isPending ? "Creating..." : "Create Ticket"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
