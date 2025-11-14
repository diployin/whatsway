// UPDATED UI – MATCHES NEW BACKEND API
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
import { Plus, Send, Users, Loader2, AlertCircle } from "lucide-react";
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
  TableRow 
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
  targetIds: z.array(z.string()).optional()
});

type FormData = z.infer<typeof formSchema>;

export default function Notifications() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // ----------- Fetch All Notifications (new API) ------------
  const { data: notifications = [], isLoading, isError, error } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  useEffect(() => {
    if (isError) {
      toast({
        title: "Error",
        description: error?.message || "Failed to load notifications",
        variant: "destructive",
      });
    }
  }, [isError]);

  // ---------------- Form (updated) ----------------
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      message: "",
      targetType: "all",
    },
  });

  // ---------------- Create Notification (this sends instantly) ----------------
  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiRequest("POST", "/api/notifications", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({ title: "Success", description: "Notification sent!" });
      form.reset();
      setShowDialog(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: FormData) => createMutation.mutate(data);

  // ---------------- Pagination ----------------
  const totalItems = notifications.length;
  const start = (currentPage - 1) * itemsPerPage;
  const paginatedNotifications = notifications.slice(start, start + itemsPerPage);

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

        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Notification
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Total Sent</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{notifications.length}</div></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>User Target</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {notifications.filter(n => n.targetType === "users").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Admin / Team</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {notifications.filter(n => n.targetType === "admins" || n.targetType === "team").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader><CardTitle>All Notifications</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="animate-spin" />
            </div>
          ) : paginatedNotifications.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No notifications found</div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Sent At</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {paginatedNotifications.map(n => (
                    <TableRow key={n.id}>
                      <TableCell className="font-mono">{n.id.slice(0, 8)}</TableCell>
                      <TableCell>{n.title}</TableCell>
                      <TableCell>
                        <StatusBadge status={n.targetType} variant="info" />
                      </TableCell>
                      <TableCell>{n.sentAt ? new Date(n.sentAt).toLocaleString() : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <TablePagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Notification</DialogTitle>
            <DialogDescription>Send instant notification to recipients.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div>
              <Label>Title</Label>
              <Input {...form.register("title")} />
            </div>

            <div>
              <Label>Message</Label>
              <Textarea rows={5} {...form.register("message")} />
            </div>

            <div>
              <Label>Target Audience</Label>
              <Select 
                value={form.watch("targetType")}
                onValueChange={(v) => form.setValue("targetType", v as any)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Label>User IDs (comma separated)</Label>
                <Input
                  placeholder="user1,user2,user3"
                  onChange={(e) =>
                    form.setValue("targetIds", e.target.value.split(",").map(s => s.trim()))
                  }
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4 mr-2" />}
              Send Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
