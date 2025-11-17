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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Send notifications to users, admins, or your team.
          </p>
        </div>

        <div className="flex gap-3">
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
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Target</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.users}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin / Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.adminTeam}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-32">
              <Loader2 className="animate-spin h-8 w-8" />
              <p className="text-muted-foreground mt-2">
                Loading notifications...
              </p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-32">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-destructive mt-2">
                Failed to load notifications
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="mt-3"
              >
                Try Again
              </Button>
            </div>
          ) : paginatedNotifications.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No notifications found
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {paginatedNotifications.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell className="font-mono text-xs">
                        {String(n.id).slice(0, 8)}
                      </TableCell>
                      <TableCell className="font-medium">{n.title}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                        {n.message}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={n.targetType} variant="info" />
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={n.status || "sent"}
                          variant={n.status === "sent" ? "success" : "warning"}
                        />
                      </TableCell>
                      <TableCell className="text-sm">
                        {n.sentAt
                          ? new Date(n.sentAt).toLocaleString()
                          : n.createdAt
                          ? new Date(n.createdAt).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell>
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
                          <span className="text-green-600 text-sm">Sent</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
                  <SelectItem value="specific">Specific Users (IDs)</SelectItem>
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
  );
}
