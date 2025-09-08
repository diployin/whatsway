import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import Header from "@/components/layout/header";
import { Loading } from "@/components/ui/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageChart } from "@/components/charts/message-chart";
import { 
  ArrowLeft,
  BarChart3, 
  MessageSquare, 
  Eye, 
  Reply, 
  XCircle,
  Download,
  Calendar,
  CheckCircle,
  Clock,
  Send,
  AlertCircle,
  Users,
  Target
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function CampaignAnalytics() {
  const { campaignId } = useParams();
  const [exportLoading, setExportLoading] = useState(false);

  // Fetch campaign details and analytics
  const { data: campaignData, isLoading } = useQuery({
    queryKey: ["/api/analytics/campaigns", campaignId],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/campaigns/${campaignId}`);
      if (!response.ok) throw new Error('Failed to fetch campaign analytics');
      return await response.json();
    },
    enabled: !!campaignId,
  });

  const campaign = campaignData?.campaign || {};
  const dailyStats = campaignData?.dailyStats || [];
  const recipientStats = campaignData?.recipientStats || [];
  const errorAnalysis = campaignData?.errorAnalysis || [];

  // Calculate metrics
  const deliveryRate = campaign.sentCount > 0 
    ? ((campaign.deliveredCount || 0) / campaign.sentCount) * 100 
    : 0;
  const readRate = campaign.deliveredCount > 0 
    ? ((campaign.readCount || 0) / campaign.deliveredCount) * 100 
    : 0;
  const replyRate = campaign.readCount > 0 
    ? ((campaign.repliedCount || 0) / campaign.readCount) * 100 
    : 0;
  const failureRate = campaign.sentCount > 0 
    ? ((campaign.failedCount || 0) / campaign.sentCount) * 100 
    : 0;

  // Transform daily stats for chart
  const chartData = dailyStats.map((stat: any) => ({
    date: new Date(stat.date).toLocaleDateString(),
    sent: stat.sent || 0,
    delivered: stat.delivered || 0,
    read: stat.read || 0,
    failed: stat.failed || 0,
  }));

  // Handle export
  const handleExport = async (format: 'pdf' | 'excel') => {
    setExportLoading(true);
    try {
      const params = new URLSearchParams({
        format,
        type: 'campaigns',
        campaignId: campaignId || '',
      });
      
      const response = await fetch(`/api/analytics/export?${params}`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = (campaign.name ?? 'unnamed').replace(/[^a-z0-9_\-]/gi, '_');
      a.download = `campaign-${safeName}-${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export successful",
        description: `Campaign report exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export campaign report",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 dots-bg">
        <Header title="Campaign Analytics" subtitle="Loading..." />
        <div className="p-6">
          <Loading size="lg" text="Loading campaign analytics..." />
        </div>
      </div>
    );
  }

  if (!campaign.id) {
    return (
      <div className="flex-1 dots-bg">
        <Header title="Campaign Analytics" subtitle="Campaign not found" />
        <div className="p-6">
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Campaign Not Found</h3>
              <p className="text-gray-500 mb-4">The requested campaign could not be found</p>
              <Link href="/analytics">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 dots-bg min-h-screen">
      <Header 
        title={`Campaign: ${campaign.name}`}
        subtitle="Detailed campaign performance analytics"
      />

      <main className="p-6 space-y-6">
        {/* Navigation and Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Link href="/analytics">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Analytics
                </Button>
              </Link>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('pdf')}
                  disabled={exportLoading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {exportLoading ? 'Exporting...' : 'Export PDF'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('excel')}
                  disabled={exportLoading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {exportLoading ? 'Exporting...' : 'Export Excel'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Info */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-medium">{campaign.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full
                  ${campaign.status === 'active' ? 'bg-green-100 text-green-800' : 
                    campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                  {campaign.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">API Type</p>
                <p className="font-medium">{campaign.apiType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium">{new Date(campaign.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="font-medium">
                  {campaign.scheduledAt ? new Date(campaign.scheduledAt).toLocaleString() : 'Immediate'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="font-medium">
                  {campaign.completedAt ? new Date(campaign.completedAt).toLocaleString() : 'In Progress'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Recipients</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(campaign.recipientCount || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Messages Sent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(campaign.sentCount || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <Send className="w-6 h-6 text-green-600" />
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

        {/* Performance Chart and Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Daily Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <MessageChart data={chartData} />
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No daily data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Message Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recipientStats.map((stat: any) => {
                  const total = recipientStats.reduce((sum: number, s: any) => sum + s.count, 0);
                  const percentage = total > 0 ? (stat.count / total) * 100 : 0;
                  
                  return (
                    <div key={stat.status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          stat.status === 'delivered' ? 'bg-green-500' :
                          stat.status === 'read' ? 'bg-blue-500' :
                          stat.status === 'failed' ? 'bg-red-500' :
                          stat.status === 'pending' ? 'bg-yellow-500' :
                          'bg-gray-500'
                        }`} />
                        <span className="text-sm capitalize">{stat.status}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{stat.count}</span>
                        <span className="text-sm text-gray-500">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Analysis */}
        {errorAnalysis.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Error Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Error Code
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Error Message
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Occurrences
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {errorAnalysis.map((error: any, index: number) => (
                      <tr key={index}>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {error.errorCode || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {error.errorMessage || 'No message provided'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {error.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}