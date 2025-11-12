import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest, queryClient } from "@/lib/queryClient";

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
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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
      return res1.json()
    },
  });

  const tickets: Ticket[] = ticketsData?.tickets || [];
  const totalPages = Math.ceil((ticketsData?.pagination?.total || 0) / itemsPerPage);

  console.log(tickets )

  // Fetch single ticket with messages
  const { data: ticketDetails, refetch: refetchTicketDetails } = useQuery<any>({
    queryKey: ["/api/tickets", selectedTicketId],
    queryFn: async () => {
      if (!selectedTicketId) return null;
      return await apiRequest("GET", `/api/tickets/${selectedTicketId}`);
    },
    enabled: !!selectedTicketId,
  });

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
    mutationFn: async ({ ticketId, message, isInternal }: { ticketId: string; message: string; isInternal: boolean }) => {
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
      setShowViewDialog(false);
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

  const handleViewTicket = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setShowViewDialog(true);
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
    
    const selectedAdmin = adminUsers.find(admin => admin.id === value);
    
    updateTicketMutation.mutate({
      id: selectedTicketId,
      data: { 
        assignedToId: value === "unassigned" ? null : value,
        assignedToName: value === "unassigned" ? null : selectedAdmin?.username
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

  const handleDeleteTicket = (ticket: Ticket) => {
    if (confirm(`Are you sure you want to delete ticket "${ticket.title}"?`)) {
      deleteTicketMutation.mutate(ticket.id);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      open: { variant: "default", icon: AlertCircle, label: "Open" },
      in_progress: { variant: "secondary", icon: Clock, label: "In Progress" },
      resolved: { variant: "default", icon: CheckCircle2, label: "Resolved" },
      closed: { variant: "secondary", icon: XCircle, label: "Closed" },
    };
    const config = variants[status] || variants.open;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      medium: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      high: "bg-orange-100 text-orange-800 hover:bg-orange-100",
      urgent: "bg-red-100 text-red-800 hover:bg-red-100",
    };
    return (
      <Badge className={colors[priority] || colors.medium}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const getCreatorTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          <p className="text-slate-600 mt-1">
            {isAdmin ? "Manage all support tickets from users and listeners" : "View and manage your support tickets"}
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tickets found
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    {isAdmin && <TableHead>Creator</TableHead>}
                    {isAdmin && <TableHead>Type</TableHead>}
                    {isAdmin && <TableHead>Assigned To</TableHead>}
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">
                        <button
                          onClick={() => handleViewTicket(ticket.id)}
                          className="text-left hover:underline"
                        >
                          {ticket.title}
                        </button>
                      </TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      {isAdmin && (
                        <TableCell>{ticket.creatorName}</TableCell>
                      )}
                      {isAdmin && (
                        <TableCell>
                          <Badge variant="outline">
                            {getCreatorTypeLabel(ticket.creatorType)}
                          </Badge>
                        </TableCell>
                      )}
                      {isAdmin && (
                        <TableCell>
                          {ticket.assignedToName || "Unassigned"}
                        </TableCell>
                      )}
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(ticket.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewTicket(ticket.id)}>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              View & Reply
                            </DropdownMenuItem>
                            {isAdmin && (
                              <DropdownMenuItem
                                onClick={() => handleDeleteTicket(ticket)}
                                className="text-red-600"
                              >
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Ticket Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Ticket</DialogTitle>
            <DialogDescription>
              Submit a new support ticket. We'll get back to you as soon as possible.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={createFormData.title}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, title: e.target.value })
                }
                placeholder="Brief description of the issue"
              />
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                value={createFormData.description}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, description: e.target.value })
                }
                placeholder="Detailed description of the issue"
                rows={5}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={createFormData.priority}
                onValueChange={(value: any) =>
                  setCreateFormData({ ...createFormData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTicket} disabled={createTicketMutation.isPending}>
              {createTicketMutation.isPending ? "Creating..." : "Create Ticket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Ticket Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{ticketDetails?.ticket?.title}</DialogTitle>
            <DialogDescription>
              Created by {ticketDetails?.ticket?.creatorName} ({getCreatorTypeLabel(ticketDetails?.ticket?.creatorType || "user")}) on{" "}
              {ticketDetails?.ticket?.createdAt && formatDate(ticketDetails.ticket.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {ticketDetails && (
            <div className="space-y-6">
              {/* Ticket Info */}
              <div className="flex gap-4 flex-wrap">
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  {isAdmin ? (
                    <Select
                      value={ticketDetails?.ticket?.status}
                      onValueChange={handleUpdateStatus}
                    >
                      <SelectTrigger className="w-40 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-1">{getStatusBadge(ticketDetails.ticket.status)}</div>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Priority</Label>
                  {isAdmin ? (
                    <Select
                      value={ticketDetails?.ticket?.priority}
                      onValueChange={handleUpdatePriority}
                    >
                      <SelectTrigger className="w-40 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-1">{getPriorityBadge(ticketDetails?.ticket.priority)}</div>
                  )}
                </div>
                {isAdmin && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Assign To</Label>
                    <Select
                      value={ticketDetails?.ticket?.assignedToId || "unassigned"}
                      onValueChange={handleAssignTicket}
                    >
                      <SelectTrigger className="w-48 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {adminUsers.map((admin) => (
                          <SelectItem key={admin.id} value={admin.id}>
                            {admin.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <Label className="text-xs text-muted-foreground">Description</Label>
                <p className="mt-2 text-sm whitespace-pre-wrap">
                  {ticketDetails?.ticket?.description}
                </p>
              </div>

              {/* Messages */}
              <div>
                <Label className="text-sm font-semibold">Messages</Label>
                <div className="mt-4 space-y-4 max-h-96 overflow-y-auto">
                  {ticketDetails?.messages?.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No messages yet
                    </p>
                  ) : (
                    ticketDetails?.messages?.map((msg: { id: Key | null | undefined; isInternal: any; senderName: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; senderType: string; createdAt: string; message: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; }) => (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-lg ${
                          msg.isInternal
                            ? "bg-amber-50 border border-amber-200"
                            : "bg-slate-800"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">
                              {msg.senderName}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {getCreatorTypeLabel(msg.senderType)}
                            </Badge>
                            {msg.isInternal && (
                              <Badge variant="secondary" className="text-xs">
                                Internal Note
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Reply Form */}
              <div className="space-y-3 border-t pt-4">
                <Label>Add Reply</Label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={4}
                  className="w-full bg-black px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="internal"
                      checked={isInternalNote}
                      onCheckedChange={(checked) => setIsInternalNote(!!checked)}
                    />
                    <Label htmlFor="internal" className="text-sm cursor-pointer">
                      Internal note (not visible to {ticketDetails?.ticket?.creatorType})
                    </Label>
                  </div>
                )}
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || addMessageMutation.isPending}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {addMessageMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}