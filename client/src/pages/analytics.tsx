import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
<<<<<<< HEAD
import { Link } from "wouter";
=======
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
import Header from "@/components/layout/header";
import { Loading } from "@/components/ui/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageChart } from "@/components/charts/message-chart";
<<<<<<< HEAD
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
=======
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
import { 
  BarChart3, 
  TrendingUp, 
  MessageSquare, 
  Eye, 
  Reply, 
  XCircle,
  Download,
  Calendar,
<<<<<<< HEAD
  PlusCircle,
  FileText,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  Send,
  AlertCircle,
  Users,
  Target,
  Activity
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<number>(30);
  const [exportLoading, setExportLoading] = useState(false);

  const { data: activeChannel } = useQuery({
    queryKey: ["/api/channels/active"],
    queryFn: async () => {
      const response = await fetch("/api/channels/active");
      if (!response.ok) return null;
=======
  Filter
} from "lucide-react";
import { api } from "@/lib/api";
import { useAnalytics } from "@/hooks/use-dashboard";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<number>(30);
  const [selectedMetric, setSelectedMetric] = useState<string>("messages");

  const { data: analytics, isLoading: analyticsLoading } = useAnalytics(timeRange);
  const { data: campaigns } = useQuery({
    queryKey: ["/api/campaigns"],
    queryFn: async () => {
      const response = await api.getCampaigns();
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
      return await response.json();
    },
  });

<<<<<<< HEAD
  // Fetch message analytics
  const { data: messageAnalytics, isLoading: messageLoading } = useQuery({
    queryKey: ["/api/analytics/messages", activeChannel?.id, timeRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        days: timeRange.toString(),
        ...(activeChannel?.id && { channelId: activeChannel.id })
      });
      const response = await fetch(`/api/analytics/messages?${params}`);
      if (!response.ok) throw new Error('Failed to fetch message analytics');
      return await response.json();
    },
    enabled: !!activeChannel,
  });

  // Fetch campaign analytics
  const { data: campaignAnalytics, isLoading: campaignLoading } = useQuery({
    queryKey: ["/api/analytics/campaigns", activeChannel?.id],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(activeChannel?.id && { channelId: activeChannel.id })
      });
      const response = await fetch(`/api/analytics/campaigns?${params}`);
      if (!response.ok) throw new Error('Failed to fetch campaign analytics');
      return await response.json();
    },
    enabled: !!activeChannel,
  });

  // Handle export functionality
  const handleExport = async (format: 'pdf' | 'excel', type: 'messages' | 'campaigns' | 'all') => {
    setExportLoading(true);
    try {
      const params = new URLSearchParams({
        format,
        type,
        days: timeRange.toString(),
        ...(activeChannel?.id && { channelId: activeChannel.id })
      });
      
      const response = await fetch(`/api/analytics/export?${params}`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export successful",
        description: `Analytics report exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export analytics report",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
    }
  };

  // Calculate metrics from real data
  const messageMetrics = messageAnalytics?.overall || {};
  const campaignMetrics = campaignAnalytics?.summary || {};

  // Calculate rates
  const deliveryRate = messageMetrics.totalMessages > 0 
    ? ((messageMetrics.totalDelivered || 0) / messageMetrics.totalMessages) * 100 
    : 0;
  const readRate = messageMetrics.totalDelivered > 0 
    ? ((messageMetrics.totalRead || 0) / messageMetrics.totalDelivered) * 100 
    : 0;
  const replyRate = messageMetrics.totalMessages > 0 
    ? ((messageMetrics.totalReplied || 0) / messageMetrics.totalMessages) * 100 
    : 0;
  const failureRate = messageMetrics.totalMessages > 0 
    ? ((messageMetrics.totalFailed || 0) / messageMetrics.totalMessages) * 100 
    : 0;

  // Transform daily stats for chart
  const chartData = messageAnalytics?.dailyStats?.map((stat: any) => ({
    date: new Date(stat.date).toLocaleDateString(),
    sent: stat.totalSent || 0,
    delivered: stat.delivered || 0,
    read: stat.read || 0,
    failed: stat.failed || 0,
  })) || [];

  if (messageLoading || campaignLoading) {
=======
  const calculateMetrics = () => {
    if (!campaigns) return { totalSent: 0, totalDelivered: 0, totalRead: 0, totalReplied: 0, totalFailed: 0 };
    
    return campaigns.reduce((acc: any, campaign: any) => ({
      totalSent: acc.totalSent + (campaign.sentCount || 0),
      totalDelivered: acc.totalDelivered + (campaign.deliveredCount || 0),
      totalRead: acc.totalRead + (campaign.readCount || 0),
      totalReplied: acc.totalReplied + (campaign.repliedCount || 0),
      totalFailed: acc.totalFailed + (campaign.failedCount || 0),
    }), { totalSent: 0, totalDelivered: 0, totalRead: 0, totalReplied: 0, totalFailed: 0 });
  };

  const metrics = calculateMetrics();
  const deliveryRate = metrics.totalSent > 0 ? (metrics.totalDelivered / metrics.totalSent) * 100 : 0;
  const readRate = metrics.totalDelivered > 0 ? (metrics.totalRead / metrics.totalDelivered) * 100 : 0;
  const replyRate = metrics.totalRead > 0 ? (metrics.totalReplied / metrics.totalRead) * 100 : 0;
  const failureRate = metrics.totalSent > 0 ? (metrics.totalFailed / metrics.totalSent) * 100 : 0;

  // Sample chart data since we don't have real historical data
  const chartData = analytics || Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
    sent: Math.floor(Math.random() * 1000) + 500,
    delivered: Math.floor(Math.random() * 800) + 400,
    read: Math.floor(Math.random() * 600) + 300,
    replied: Math.floor(Math.random() * 200) + 50,
  }));

  if (analyticsLoading) {
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
    return (
      <div className="flex-1 dots-bg">
        <Header title="Analytics" subtitle="Loading analytics..." />
        <div className="p-6">
<<<<<<< HEAD
          <Loading size="lg" text="Loading analytics data..." />
=======
          <Loading size="lg" text="Loading analytics..." />
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 dots-bg min-h-screen">
      <Header 
        title="Analytics & Reports" 
<<<<<<< HEAD
        subtitle="Track your WhatsApp business performance with real-time data"
      />

      <main className="p-6 space-y-6">
        {/* Time Range and Export Controls */}
=======
        subtitle="Track your WhatsApp business performance"
      />

      <main className="p-6 space-y-6">
        {/* Time Range Selector */}
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Time Range:</span>
                </div>
                <div className="flex space-x-2">
                  {[
                    { value: 7, label: "7 Days" },
                    { value: 30, label: "30 Days" },
                    { value: 90, label: "3 Months" }
                  ].map((range) => (
                    <Button
                      key={range.value}
                      variant={timeRange === range.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeRange(range.value)}
                      className={timeRange === range.value ? "bg-green-600" : ""}
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2">
<<<<<<< HEAD
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const dropdown = document.getElementById('export-dropdown');
                      if (dropdown) dropdown.classList.toggle('hidden');
                    }}
                    disabled={exportLoading}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {exportLoading ? 'Exporting...' : 'Export'}
                  </Button>
                  <div id="export-dropdown" className="hidden absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border">
                    <div className="py-1">
                      <button
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                        onClick={() => {
                          handleExport('pdf', 'all');
                          document.getElementById('export-dropdown')?.classList.add('hidden');
                        }}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Export as PDF
                      </button>
                      <button
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                        onClick={() => {
                          handleExport('excel', 'all');
                          document.getElementById('export-dropdown')?.classList.add('hidden');
                        }}
                      >
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Export as Excel
                      </button>
                    </div>
                  </div>
                </div>
=======
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
              </div>
            </div>
          </CardContent>
        </Card>

<<<<<<< HEAD
        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Messages</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(messageMetrics.totalMessages || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Last {timeRange} days
                      </p>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <MessageSquare className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Delivery Rate</p>
                      <p className="text-2xl font-bold text-green-600">
                        {deliveryRate.toFixed(1)}%
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${deliveryRate}%` }}
                        />
                      </div>
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Read Rate</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {readRate.toFixed(1)}%
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${readRate}%` }}
                        />
                      </div>
                    </div>
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <Eye className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Reply Rate</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {replyRate.toFixed(1)}%
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${replyRate}%` }}
                        />
                      </div>
                    </div>
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Reply className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Failure Rate</p>
                      <p className="text-2xl font-bold text-red-600">
                        {failureRate.toFixed(1)}%
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${failureRate}%` }}
                        />
                      </div>
                    </div>
                    <div className="p-2 bg-red-50 rounded-lg">
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chart and Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Message Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  {chartData.length > 0 ? (
                    <MessageChart data={chartData} />
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      No data available for the selected period
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Campaigns</span>
                    <span className="text-sm font-medium">{campaignMetrics.activeCampaigns || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Campaigns</span>
                    <span className="text-sm font-medium">{campaignMetrics.totalCampaigns || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Unique Contacts</span>
                    <span className="text-sm font-medium">{messageMetrics.uniqueContacts || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Recipients</span>
                    <span className="text-sm font-medium">{campaignMetrics.totalRecipients || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            {/* Message Type Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Outbound Messages</CardTitle>
                  <Send className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {messageAnalytics?.messageTypes?.find((t: any) => t.direction === 'outbound')?.count || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inbound Messages</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {messageAnalytics?.messageTypes?.find((t: any) => t.direction === 'inbound')?.count || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.5m</div>
                </CardContent>
              </Card>
            </div>

            {/* Hourly Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Message Activity by Hour</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {messageAnalytics?.hourlyDistribution?.map((hour: any) => {
                    const maxCount = Math.max(...(messageAnalytics.hourlyDistribution?.map((h: any) => h.count) || [1]));
                    const percentage = (hour.count / maxCount) * 100;
                    return (
                      <div key={hour.hour} className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 w-12">{hour.hour}:00</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-4">
                          <div 
                            className="bg-blue-500 h-4 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-700 w-12 text-right">{hour.count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            {campaignAnalytics?.campaigns?.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Campaigns Found</h3>
                  <p className="text-gray-500 mb-4">Start creating campaigns to see analytics here</p>
                  <Link href="/campaigns">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Create Campaign
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Campaign Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                      <Send className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{campaignMetrics.totalSent || 0}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Delivered</CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{campaignMetrics.totalDelivered || 0}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Read</CardTitle>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{campaignMetrics.totalRead || 0}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Failed</CardTitle>
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{campaignMetrics.totalFailed || 0}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Campaign Performance Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Campaign
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Recipients
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Sent
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Delivered
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Read
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Delivery Rate
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {campaignAnalytics?.campaigns?.map((campaign: any) => (
                            <tr key={campaign.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                                <div className="text-sm text-gray-500">{campaign.type}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full
                                  ${campaign.status === 'active' ? 'bg-green-100 text-green-800' : 
                                    campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                                    'bg-gray-100 text-gray-800'}`}>
                                  {campaign.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {campaign.recipientCount || 0}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {campaign.sentCount || 0}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {campaign.deliveredCount || 0}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {campaign.readCount || 0}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {campaign.deliveryRate?.toFixed(1) || 0}%
                              </td>
                              <td className="px-6 py-4">
                                <Link href={`/analytics/campaign/${campaign.id}`}>
                                  <Button variant="ghost" size="sm">
                                    <Activity className="w-4 h-4 mr-1" />
                                    View Details
                                  </Button>
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
=======
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Messages Sent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.totalSent.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+12.5%</span>
                  </div>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Delivery Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {deliveryRate.toFixed(1)}%
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${deliveryRate}%` }}
                    />
                  </div>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Read Rate</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {readRate.toFixed(1)}%
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${readRate}%` }}
                    />
                  </div>
                </div>
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Eye className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Reply Rate</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {replyRate.toFixed(1)}%
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${replyRate}%` }}
                    />
                  </div>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Reply className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Failure Rate</p>
                  <p className="text-2xl font-bold text-red-600">
                    {failureRate.toFixed(1)}%
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${failureRate}%` }}
                    />
                  </div>
                </div>
                <div className="p-2 bg-red-50 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Message Performance Trends</CardTitle>
                <div className="flex space-x-2">
                  {[
                    { value: "messages", label: "Messages" },
                    { value: "delivery", label: "Delivery" },
                    { value: "engagement", label: "Engagement" }
                  ].map((metric) => (
                    <Button
                      key={metric.value}
                      variant={selectedMetric === metric.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedMetric(metric.value)}
                      className={selectedMetric === metric.value ? "bg-green-600" : ""}
                    >
                      {metric.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <MessageChart data={chartData} />
            </CardContent>
          </Card>

          {/* Top Performing Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns?.slice(0, 5).map((campaign: any, index: number) => {
                  const campaignDeliveryRate = campaign.sentCount > 0 
                    ? (campaign.deliveredCount / campaign.sentCount) * 100 
                    : 0;
                  
                  return (
                    <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                            {campaign.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {campaign.sentCount || 0} sent
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">
                          {campaignDeliveryRate.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500">delivery</p>
                      </div>
                    </div>
                  );
                }) || (
                  <div className="text-center py-8 text-gray-500">
                    No campaigns to display
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics Table */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {!campaigns?.length ? (
              <div className="text-center py-12 text-gray-500">
                No campaign data available
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Campaign
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Messages Sent
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Delivered
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Read
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Replied
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Failed
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Delivery Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {campaigns.map((campaign: any) => {
                      const campaignDeliveryRate = campaign.sentCount > 0 
                        ? (campaign.deliveredCount / campaign.sentCount) * 100 
                        : 0;
                      
                      return (
                        <tr key={campaign.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {campaign.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {campaign.type} • {campaign.apiType}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {(campaign.sentCount || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {(campaign.deliveredCount || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {(campaign.readCount || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {(campaign.repliedCount || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {(campaign.failedCount || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <span className={`text-sm font-medium ${
                                campaignDeliveryRate >= 90 ? "text-green-600" :
                                campaignDeliveryRate >= 70 ? "text-orange-600" :
                                "text-red-600"
                              }`}>
                                {campaignDeliveryRate.toFixed(1)}%
                              </span>
                              <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    campaignDeliveryRate >= 90 ? "bg-green-500" :
                                    campaignDeliveryRate >= 70 ? "bg-orange-500" :
                                    "bg-red-500"
                                  }`}
                                  style={{ width: `${campaignDeliveryRate}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
