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
import {
  Plus,
  Send,
  Users,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
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
import Header from "@/components/layout/header";

// ---------------- Schema ----------------
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
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ----------- Fetch Notifications ------------
  const {
    data: notifications = [],
    isLoading,
    isError,
    error,
  } = useQuery<Notification[]>({
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
  }, [isError, error, toast]);

  // ---------------- Form ----------------
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      message: "",
      targetType: "all",
    },
  });

  // ---------------- Create Notification ----------------
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
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => createMutation.mutate(data);

  // ---------------- Simple Pagination ----------------
  const totalItems = notifications.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNotifications = notifications.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to page 1 when items per page changes
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <Header
        title="Notifications"
        subtitle="Send notifications to users, admins, or your team."
        action={{
          label: "Create Notification",
          onClick: () => setShowDialog(true),
        }}
      />

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
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Users only</p>
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

      {/* Table */}
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
              <p className="text-sm text-gray-500">Loading notifications...</p>
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
                      <TableHead className="min-w-[200px] px-3 lg:px-6 py-3 text-xs font-semibold text-gray-600 uppercase">
                        Title
                      </TableHead>
                      <TableHead className="w-[130px] px-3 lg:px-6 py-3 text-xs font-semibold text-gray-600 uppercase">
                        Target
                      </TableHead>
                      <TableHead className="w-[180px] px-3 lg:px-6 py-3 text-xs font-semibold text-gray-600 uppercase">
                        Sent At
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedNotifications.map((n) => (
                      <TableRow key={n.id} className="hover:bg-gray-50">
                        <TableCell className="px-3 lg:px-6 py-3 font-mono text-xs text-gray-600">
                          {n.id.slice(0, 8)}
                        </TableCell>
                        <TableCell className="px-3 lg:px-6 py-3 text-sm font-medium text-gray-900">
                          {n.title}
                        </TableCell>
                        <TableCell className="px-3 lg:px-6 py-3">
                          <StatusBadge status={n.targetType} variant="info" />
                        </TableCell>
                        <TableCell className="px-3 lg:px-6 py-3 text-sm text-gray-600 whitespace-nowrap">
                          {n.sentAt
                            ? new Date(n.sentAt).toLocaleString([], {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : "-"}
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
                          {n.id.slice(0, 8)}
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

          {/* Simple Pagination */}
          {paginatedNotifications.length > 0 && (
            <div className="border-t border-gray-200 px-3 sm:px-6 py-3 sm:py-4 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Items per page & Info */}
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">
                      Rows per page:
                    </span>
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={handleItemsPerPageChange}
                    >
                      <SelectTrigger className="w-16 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-700">
                    {startIndex + 1}-{Math.min(endIndex, totalItems)} of{" "}
                    {totalItems}
                  </span>
                </div>

                {/* Page Navigation */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="h-8 px-2 sm:px-3"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">Previous</span>
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        // Show first page, last page, current page, and adjacent pages
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, index, array) => {
                        // Add ellipsis
                        const prevPage = array[index - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;

                        return (
                          <div key={page} className="flex items-center">
                            {showEllipsis && (
                              <span className="px-2 text-gray-400">...</span>
                            )}
                            <Button
                              variant={
                                currentPage === page ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => goToPage(page)}
                              className={`h-8 w-8 p-0 text-xs ${
                                currentPage === page
                                  ? "bg-green-600 hover:bg-green-700"
                                  : ""
                              }`}
                            >
                              {page}
                            </Button>
                          </div>
                        );
                      })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="h-8 px-2 sm:px-3"
                  >
                    <span className="hidden sm:inline mr-1">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="w-[95vw] sm:w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg sm:text-xl">
              Create Notification
            </DialogTitle>
            <DialogDescription className="text-sm">
              Send instant notification to recipients.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                {...form.register("title")}
                placeholder="Enter notification title"
                className="text-sm"
              />
              {form.formState.errors.title && (
                <p className="text-xs text-red-600">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Message <span className="text-red-500">*</span>
              </Label>
              <Textarea
                rows={4}
                {...form.register("message")}
                placeholder="Enter your notification message"
                className="text-sm resize-none"
              />
              {form.formState.errors.message && (
                <p className="text-xs text-red-600">
                  {form.formState.errors.message.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Target Audience</Label>
              <Select
                value={form.watch("targetType")}
                onValueChange={(v) => form.setValue("targetType", v as any)}
              >
                <SelectTrigger className="text-sm">
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
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  User IDs (comma separated)
                </Label>
                <Input
                  placeholder="user1, user2, user3"
                  className="text-sm"
                  onChange={(e) =>
                    form.setValue(
                      "targetIds",
                      e.target.value.split(",").map((s) => s.trim())
                    )
                  }
                />
              </div>
            )}

            <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
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
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
