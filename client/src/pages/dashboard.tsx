import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Loading } from "@/components/ui/loading";
import { MessageChart } from "@/components/charts/message-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Megaphone, 
  CheckCircle, 
  Users, 
  TrendingUp,
  Clock,
  Activity,
  Zap,
  Upload,
  FileText,
  BarChart3,
  ExternalLink
} from "lucide-react";
import { useDashboardStats, useAnalytics } from "@/hooks/use-dashboard";
<<<<<<< HEAD
import { useTranslation } from "@/lib/i18n";

export default function Dashboard() {
  const { t } = useTranslation();
  const { data: activeChannel } = useQuery({
    queryKey: ["/api/channels/active"],
    queryFn: async () => {
      const response = await fetch("/api/channels/active");
      if (!response.ok) return null;
      return await response.json();
    },
  });

  const { data: stats, isLoading: statsLoading } = useDashboardStats(activeChannel?.id);
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics(7, activeChannel?.id);
=======

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics(7);
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)

  if (statsLoading) {
    return (
      <div className="flex-1 dots-bg">
        <Header title="Dashboard" subtitle="Loading dashboard data..." />
        <div className="p-6">
          <Loading size="lg" text="Loading dashboard..." />
        </div>
      </div>
    );
  }

  const chartData = analytics || [];

  return (
    <div className="flex-1 dots-bg min-h-screen">
      <Header 
<<<<<<< HEAD
        title={t('dashboard.title')} 
        subtitle={t('dashboard.subtitle')}
        action={{
          label: t('dashboard.newCampaign'),
=======
        title="Dashboard Overview" 
        subtitle="Welcome back! Here's what's happening with your WhatsApp business."
        action={{
          label: "New Campaign",
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
          onClick: () => console.log("Create campaign")
        }}
      />

      <main className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover-lift fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
<<<<<<< HEAD
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.totalMessagesSent')}</p>
=======
                  <p className="text-sm font-medium text-gray-600">Total Messages Sent</p>
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats?.totalMessages?.toLocaleString() || "0"}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">
                      +{stats?.messagesGrowth || 0}%
                    </span>
<<<<<<< HEAD
                    <span className="text-sm text-gray-500 ml-1">{t('dashboard.vsLastMonth')}</span>
=======
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
<<<<<<< HEAD
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.activeCampaigns')}</p>
=======
                  <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats?.activeCampaigns || 0}
                  </p>
                  <div className="flex items-center mt-2">
                    <Clock className="w-4 h-4 text-orange-500 mr-1" />
                    <span className="text-sm text-orange-600 font-medium">
<<<<<<< HEAD
                      {stats?.campaignsRunning || 0} {t('dashboard.runningNow')}
=======
                      {stats?.campaignsRunning || 0} running now
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <Megaphone className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
<<<<<<< HEAD
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.deliveryRate')}</p>
=======
                  <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats?.deliveryRate?.toFixed(1) || "0.0"}%
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${stats?.deliveryRate || 0}%` }}
                    />
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New Leads</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats?.newLeads?.toLocaleString() || "0"}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-purple-500 mr-1" />
                    <span className="text-sm text-purple-600 font-medium">+18.2%</span>
                    <span className="text-sm text-gray-500 ml-1">this week</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Message Analytics Chart */}
          <Card className="lg:col-span-2 hover-lift fade-in">
            <CardHeader>
              <div className="flex items-center justify-between">
<<<<<<< HEAD
                <CardTitle>{t('dashboard.messageAnalytics')}</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="bg-green-600 text-white border-green-600">
                    {t('dashboard.7Days')}
                  </Button>
                  <Button variant="outline" size="sm">{t('dashboard.30Days')}</Button>
                  <Button variant="outline" size="sm">{t('dashboard.3Months')}</Button>
=======
                <CardTitle>Message Analytics</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="bg-green-600 text-white border-green-600">
                    7 Days
                  </Button>
                  <Button variant="outline" size="sm">30 Days</Button>
                  <Button variant="outline" size="sm">3 Months</Button>
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Loading text="Loading chart data..." />
              ) : (
                <MessageChart data={chartData} />
              )}
              
              {/* Chart Legend */}
              <div className="flex items-center justify-center space-x-6 mt-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-600 rounded mr-2" />
<<<<<<< HEAD
                  <span className="text-sm text-gray-600">{t('dashboard.sent')}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-600 rounded mr-2" />
                  <span className="text-sm text-gray-600">{t('dashboard.delivered')}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-600 rounded mr-2" />
                  <span className="text-sm text-gray-600">{t('dashboard.read')}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-600 rounded mr-2" />
                  <span className="text-sm text-gray-600">{t('dashboard.replied')}</span>
=======
                  <span className="text-sm text-gray-600">Messages Sent</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-600 rounded mr-2" />
                  <span className="text-sm text-gray-600">Delivered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-600 rounded mr-2" />
                  <span className="text-sm text-gray-600">Read</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-600 rounded mr-2" />
                  <span className="text-sm text-gray-600">Replied</span>
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="hover-lift fade-in">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
<<<<<<< HEAD
                {t('dashboard.recentActivities')}
=======
                Recent Activities
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Megaphone className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
<<<<<<< HEAD
                    <p className="text-sm text-gray-900">{t('dashboard.noRecentCampaigns')}</p>
                    <p className="text-xs text-gray-500">{t('dashboard.createFirstCampaign')}</p>
=======
                    <p className="text-sm text-gray-900">No recent campaigns</p>
                    <p className="text-xs text-gray-500">Create your first campaign to see activity</p>
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
<<<<<<< HEAD
                    <p className="text-sm text-gray-900">{t('dashboard.noContactsImported')}</p>
                    <p className="text-xs text-gray-500">{t('dashboard.importContactsToStart')}</p>
=======
                    <p className="text-sm text-gray-900">No contacts imported</p>
                    <p className="text-xs text-gray-500">Import contacts to start messaging</p>
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
<<<<<<< HEAD
                    <p className="text-sm text-gray-900">{t('dashboard.noAutomationsActive')}</p>
                    <p className="text-xs text-gray-500">{t('dashboard.setupAutomationFlows')}</p>
=======
                    <p className="text-sm text-gray-900">No automations active</p>
                    <p className="text-xs text-gray-500">Set up automation flows</p>
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
                  </div>
                </div>
              </div>
              
              <Button variant="ghost" className="w-full mt-4 text-green-600 hover:text-green-700">
<<<<<<< HEAD
                {t('dashboard.viewAllActivities')} <ExternalLink className="w-4 h-4 ml-1" />
=======
                View All Activities <ExternalLink className="w-4 h-4 ml-1" />
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions and API Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card className="hover-lift fade-in">
            <CardHeader>
<<<<<<< HEAD
              <CardTitle>{t('dashboard.quickActions')}</CardTitle>
=======
              <CardTitle>Quick Actions</CardTitle>
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="p-4 h-auto text-left flex flex-col items-start space-y-2 hover:bg-blue-50"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Upload className="w-4 h-4 text-white" />
                  </div>
                  <div>
<<<<<<< HEAD
                    <h4 className="font-medium text-gray-900">{t('dashboard.importContacts')}</h4>
                    <p className="text-sm text-gray-600">{t('dashboard.uploadCSV')}</p>
=======
                    <h4 className="font-medium text-gray-900">Import Contacts</h4>
                    <p className="text-sm text-gray-600">Upload CSV file</p>
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="p-4 h-auto text-left flex flex-col items-start space-y-2 hover:bg-green-50"
                >
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
<<<<<<< HEAD
                    <h4 className="font-medium text-gray-900">{t('dashboard.newTemplate')}</h4>
                    <p className="text-sm text-gray-600">{t('dashboard.createMessageTemplate')}</p>
=======
                    <h4 className="font-medium text-gray-900">New Template</h4>
                    <p className="text-sm text-gray-600">Create message template</p>
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="p-4 h-auto text-left flex flex-col items-start space-y-2 hover:bg-purple-50"
                >
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
<<<<<<< HEAD
                    <h4 className="font-medium text-gray-900">{t('dashboard.buildFlow')}</h4>
                    <p className="text-sm text-gray-600">{t('dashboard.createAutomation')}</p>
=======
                    <h4 className="font-medium text-gray-900">Build Flow</h4>
                    <p className="text-sm text-gray-600">Create automation</p>
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="p-4 h-auto text-left flex flex-col items-start space-y-2 hover:bg-orange-50"
                >
                  <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <div>
<<<<<<< HEAD
                    <h4 className="font-medium text-gray-900">{t('dashboard.viewReports')}</h4>
                    <p className="text-sm text-gray-600">{t('dashboard.detailedAnalytics')}</p>
=======
                    <h4 className="font-medium text-gray-900">View Reports</h4>
                    <p className="text-sm text-gray-600">Detailed analytics</p>
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* API Status */}
          <Card className="hover-lift fade-in">
            <CardHeader>
<<<<<<< HEAD
              <CardTitle>{t('dashboard.apiStatusConnection')}</CardTitle>
=======
              <CardTitle>API Status & Connection</CardTitle>
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* WhatsApp Cloud API */}
<<<<<<< HEAD
                <div className={`flex items-center justify-between p-3 rounded-lg ${
                  activeChannel?.status === 'active' ? 'bg-green-50' : 
                  activeChannel?.status === 'warning' ? 'bg-yellow-50' : 'bg-red-50'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activeChannel?.status === 'active' ? 'bg-green-600' : 
                      activeChannel?.status === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
                    }`}>
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{t('dashboard.whatsAppCloudAPI')}</h4>
                      <p className="text-sm text-gray-600">
                        {activeChannel ? `${activeChannel.name} (${activeChannel.phoneNumber})` : t('dashboard.noChannelSelected')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      activeChannel?.status === 'active' ? 'bg-green-500 pulse-gentle' : 
                      activeChannel?.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className={`text-sm font-medium ${
                      activeChannel?.status === 'active' ? 'text-green-600' : 
                      activeChannel?.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {activeChannel?.status === 'active' ? t('dashboard.connected') : 
                       activeChannel?.status === 'warning' ? t('dashboard.warning') : 
                       activeChannel ? t('dashboard.error') : t('dashboard.noChannel')}
                    </span>
                  </div>
                </div>

                {/* Channel Quality */}
                {activeChannel && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Activity className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{t('dashboard.channelQuality')}</h4>
                        <p className="text-sm text-gray-600">
                          {t('dashboard.rating')}: {activeChannel.qualityRating || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-blue-600 font-medium">
                        {t('dashboard.tier')}: {activeChannel.messagingLimitTier || 'N/A'}
                      </span>
                    </div>
                  </div>
                )}
=======
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">WhatsApp Cloud API</h4>
                      <p className="text-sm text-gray-600">Two-way messaging & support</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full pulse-gentle" />
                    <span className="text-sm text-green-600 font-medium">Connected</span>
                  </div>
                </div>

                {/* MM Lite API */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">MM Lite API</h4>
                      <p className="text-sm text-gray-600">Bulk marketing campaigns</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full pulse-gentle" />
                    <span className="text-sm text-green-600 font-medium">Active</span>
                  </div>
                </div>
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)

                {/* Performance Stats */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
<<<<<<< HEAD
                    <p className="text-lg font-bold text-gray-900">
                      {activeChannel?.lastCheckedAt ? '100%' : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-600">{t('dashboard.apiUptime')}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-900">
                      {activeChannel ? '~200ms' : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-600">{t('dashboard.avgResponse')}</p>
=======
                    <p className="text-lg font-bold text-gray-900">99.9%</p>
                    <p className="text-xs text-gray-600">API Uptime</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-900">142ms</p>
                    <p className="text-xs text-gray-600">Avg Response</p>
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
                  </div>
                </div>

                {/* Daily Limit */}
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
<<<<<<< HEAD
                    <span className="text-sm font-medium text-gray-700">{t('dashboard.dailyMessageLimit')}</span>
                    <span className="text-sm text-gray-600">
                      {stats?.totalMessages || 0} / {
                        activeChannel?.messagingLimitTier === 'TIER_1K' ? '1,000' :
                        activeChannel?.messagingLimitTier === 'TIER_10K' ? '10,000' :
                        activeChannel?.messagingLimitTier === 'TIER_100K' ? '100,000' :
                        activeChannel?.messagingLimitTier === 'TIER_UNLIMITED' ? 'Unlimited' : '1,000'
                      }
                    </span>
                  </div>
                  <div className="w-full bg-yellow-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(
                          (stats?.totalMessages || 0) / (
                            activeChannel?.messagingLimitTier === 'TIER_1K' ? 1000 :
                            activeChannel?.messagingLimitTier === 'TIER_10K' ? 10000 :
                            activeChannel?.messagingLimitTier === 'TIER_100K' ? 100000 : 1000
                          ) * 100, 
                          100
                        )}%` 
                      }} 
                    />
=======
                    <span className="text-sm font-medium text-gray-700">Daily Message Limit</span>
                    <span className="text-sm text-gray-600">0 / 50,000</span>
                  </div>
                  <div className="w-full bg-yellow-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "0%" }} />
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
