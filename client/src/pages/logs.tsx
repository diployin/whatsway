import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, MessageSquare, RefreshCw, AlertCircle, Search } from "lucide-react";
import { format } from "date-fns";
import { Loading } from "@/components/ui/loading";

interface MessageLog {
  id: string;
  channelId: string;
  phoneNumber: string;
  contactName?: string;
  messageType: string;
  content: string;
  templateName?: string;
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'pending';
  errorCode?: string;
  errorMessage?: string;
  whatsappMessageId?: string;
  createdAt: string;
  updatedAt: string;
}

export default function Logs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("7d");

  // Get active channel
  const { data: activeChannel } = useQuery({
    queryKey: ["/api/channels/active"],
  });

  // Fetch message logs
  const { data: logs = [], isLoading, refetch } = useQuery<MessageLog[]>({
    queryKey: ["/api/messages/logs", activeChannel?.id, statusFilter, dateFilter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeChannel?.id) params.append("channelId", activeChannel.id);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (dateFilter !== "all") params.append("dateRange", dateFilter);
      if (searchQuery) params.append("search", searchQuery);
      
      const response = await fetch(`/api/messages/logs?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch logs');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!activeChannel,
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'read':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'sent':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return "default";
      case 'read':
        return "default";
      case 'failed':
        return "destructive";
      case 'sent':
        return "secondary";
      case 'pending':
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="flex-1 dots-bg min-h-screen">
      <Header 
        title="Message Logs" 
        subtitle="Track all sent messages and their delivery status"
      />

      <main className="p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Message History
                </CardTitle>
                <CardDescription>
                  View detailed logs of all messages sent through WhatsApp
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by phone number or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Logs Table */}
            {isLoading ? (
              <Loading />
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-2">No message logs found</p>
                <p className="text-sm text-gray-400">
                  {searchQuery || statusFilter !== "all" 
                    ? "Try adjusting your filters" 
                    : "Send some messages to see them here"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Error</TableHead>
                      <TableHead>Sent At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge 
                            variant={getStatusVariant(log.status)}
                            className="flex items-center gap-1 w-fit"
                          >
                            {getStatusIcon(log.status)}
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.phoneNumber}
                        </TableCell>
                        <TableCell>
                          {log.contactName || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {log.messageType === "template" ? (
                              <>Template: {log.templateName}</>
                            ) : (
                              log.messageType
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {log.content}
                        </TableCell>
                        <TableCell>
                          {log.status === "failed" && log.errorCode ? (
                            <div className="text-sm">
                              <div className="flex items-center gap-1 text-red-600">
                                <AlertCircle className="w-3 h-3" />
                                Code: {log.errorCode}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {log.errorMessage}
                              </div>
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {format(new Date(log.createdAt), "MMM d, h:mm a")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}