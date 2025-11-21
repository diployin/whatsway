// FULLY INTEGRATED WITH BACKEND API
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TablePagination } from "@/components/table-pagination";
import Header from "@/components/layout/header";
import {
  Plus,
  Send,
  Users,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Notification } from "@shared/schema";
import { z } from "zod";

// ---------------- Schema (updated to match backend) ----------------

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  targetType: z.enum(["all", "users", "admins", "team", "specific"]),
  targetIds: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function Notifications() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // ----------- Fetch All Notifications (GET /api/notifications) ------------
  const {
    data: notifications = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const response = await fetch("/api/notifications", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch notifications: ${response.statusText}`
        );
      }

      return response.json();
    },
    staleTime: 30000, // Cache for 30 seconds
  });

  useEffect(() => {
    if (isError) {
      toast({
        title: "Error",
        description: error?.message || "Failed to load notifications",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  // ---------------- Form (updated) ----------------
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      message: "",
      targetType: "all",
      targetIds: [],
    },
  });

  // ---------------- Create & Send Notification (POST /api/notifications) ----------------
  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        title: data.title,
        message: data.message,
        targetType: data.targetType,
        targetIds:
          data.targetIds && data.targetIds.length > 0
            ? data.targetIds
            : undefined,
      };

      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send notification");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });

      toast({
        title: "Success",
        description: "Notification sent successfully!",
      });

      form.reset();
      setShowDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  // ---------------- Manual Refresh ----------------
  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing",
      description: "Loading latest notifications...",
    });
  };

  // ---------------- Pagination ----------------
  const totalItems = notifications.length;
  const start = (currentPage - 1) * itemsPerPage;
  const paginatedNotifications = notifications.slice(
    start,
    start + itemsPerPage
  );

  // ---------------- Stats ----------------
  const stats = {
    total: notifications.length,
    users: notifications.filter((n) => n.targetType === "users").length,
    adminTeam: notifications.filter(
      (n) => n.targetType === "admins" || n.targetType === "team"
    ).length,
  };

  const sendMutation = useMutation({
    mutationFn: async (id: string | number) => {
      const response = await fetch(`/api/notifications/${id}/send`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({ title: "Success", description: "Notification sent!" });
    },
    onError: (err: Error) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex-1  min-h-screen">
      <Header
        title={"Notifications"}
        subtitle={"Send notifications to users, admins, or your team."}
        action={{
          label: "Create Notification",
          onClick: () => setShowDialog(true),
        }}
      />
      <div className="py-8 px-5">
        {/* Header */}
        <div className="flex items-center justify-between my-3">
          <div>
            {/* <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Send notifications to users, admins, or your team.
          </p> */}
          </div>

          <div className=" w-full flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            <Button onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Notification
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Send className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                Total Sent
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                {notifications.length}
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                All notifications
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                User Target
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                {notifications.filter((n) => n.targetType === "users").length}
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Users only
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
                Admin / Team
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                {
                  notifications.filter(
                    (n) => n.targetType === "admins" || n.targetType === "team"
                  ).length
                }
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Staff notifications
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="text-base sm:text-lg">
                All Notifications
              </CardTitle>
              <div className="text-xs sm:text-sm text-gray-500">
                {totalItems} total
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-48 sm:h-64 px-4">
                <Loader2 className="animate-spin w-8 h-8 sm:w-10 sm:h-10 text-green-600 mb-4" />
                <p className="text-sm text-gray-500">
                  Loading notifications...
                </p>
              </div>
            ) : paginatedNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                </div>
                <p className="text-sm sm:text-base font-medium text-gray-900 mb-2">
                  No notifications found
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mb-4">
                  Create your first notification to get started
                </p>
                <Button
                  onClick={() => setShowDialog(true)}
                  className="bg-green-600 hover:bg-green-700 text-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Notification
                </Button>
              </div>
            ) : (
              <>
                {/* Desktop & Tablet Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-[100px] px-3 lg:px-6 py-3 text-xs font-semibold text-gray-600 uppercase">
                          ID
                        </TableHead>
                        <TableHead className="w-[100px] px-3 lg:px-6 py-3 text-xs font-semibold text-gray-600 uppercase">
                          Title
                        </TableHead>
                        <TableHead className="w-[100px] px-3 lg:px-6 py-3 text-xs font-semibold text-gray-600 uppercase">
                          Message
                        </TableHead>
                        <TableHead className="w-[100px] px-3 lg:px-6 py-3 text-xs font-semibold text-gray-600 uppercase">
                          Target
                        </TableHead>
                        <TableHead className="w-[100px] px-3 lg:px-6 py-3 text-xs font-semibold text-gray-600 uppercase">
                          Status
                        </TableHead>
                        <TableHead className="w-[100px] px-3 lg:px-6 py-3 text-xs font-semibold text-gray-600 uppercase">
                          Sent At
                        </TableHead>
                        <TableHead className="w-[100px] px-3 lg:px-6 py-3 text-xs font-semibold text-gray-600 uppercase">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedNotifications.map((n) => (
                        <TableRow key={n.id} className="hover:bg-gray-50">
                          <TableCell className="px-3 lg:px-6 py-3 font-mono text-xs text-gray-600">
                            {String(n.id).slice(0, 8)}
                          </TableCell>
                          <TableCell className="px-3 lg:px-6 py-3 text-sm font-medium text-gray-900">
                            {n.title}
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                            {n.message}
                          </TableCell>
                          <TableCell className="px-3 lg:px-6 py-3 font-mono text-xs text-gray-600">
                            <StatusBadge status={n.targetType} variant="info" />
                          </TableCell>
                          <TableCell className="px-3 lg:px-6 py-3 font-mono text-xs text-gray-600">
                            <StatusBadge
                              status={n.status || "sent"}
                              variant={
                                n.status === "sent" ? "success" : "warning"
                              }
                            />
                          </TableCell>
                          <TableCell className="px-3 lg:px-6 py-3 font-mono text-xs text-gray-600">
                            {n.sentAt
                              ? new Date(n.sentAt).toLocaleString()
                              : n.createdAt
                              ? new Date(n.createdAt).toLocaleString()
                              : "-"}
                          </TableCell>
                          <TableCell className="px-3 lg:px-6 py-3 font-mono text-xs text-gray-600">
                            {n.status !== "sent" ? (
                              <Button
                                size="sm"
                                onClick={() => sendMutation.mutate(n.id)}
                                disabled={sendMutation.isPending}
                              >
                                {sendMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Send"
                                )}
                              </Button>
                            ) : (
                              <span className="text-green-600 text-sm">
                                Sent
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="sm:hidden space-y-3 p-3">
                  {paginatedNotifications.map((n) => (
                    <div
                      key={n.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-3 gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                            {n.title}
                          </h3>
                          <p className="text-xs font-mono text-gray-500">
                            {String(n.id).slice(0, 8)}
                          </p>
                        </div>
                        <StatusBadge status={n.targetType} variant="info" />
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500">Sent At:</span>
                        <div className="text-right">
                          {n.sentAt ? (
                            <>
                              <div className="text-xs text-gray-900 font-medium">
                                {new Date(n.sentAt).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(n.sentAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </>
                          ) : (
                            "-"
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {totalItems > 0 && (
              <TablePagination
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            )}
          </CardContent>
        </Card>

        {/* Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create & Send Notification</DialogTitle>
              <DialogDescription>
                Notification will be sent immediately to selected recipients.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              <div>
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder="Enter notification title"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="message">
                  Message <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="message"
                  rows={5}
                  {...form.register("message")}
                  placeholder="Enter notification message"
                />
                {form.formState.errors.message && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.message.message}
                  </p>
                )}
              </div>

              <div>
                <Label>Target Audience</Label>
                <Select
                  value={form.watch("targetType")}
                  onValueChange={(v) => form.setValue("targetType", v as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="users">Users Only</SelectItem>
                    <SelectItem value="admins">Admins Only</SelectItem>
                    <SelectItem value="team">Team Only</SelectItem>
                    <SelectItem value="specific">
                      Specific Users (IDs)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.watch("targetType") === "specific" && (
                <div>
                  <Label htmlFor="targetIds">
                    User IDs (comma separated){" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="targetIds"
                    placeholder="user1,user2,user3"
                    onChange={(e) =>
                      form.setValue(
                        "targetIds",
                        e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean)
                      )
                    }
                  />
                  {form.formState.errors.targetIds && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.targetIds.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDialog(false);
                  form.reset();
                }}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Now
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
