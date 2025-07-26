import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Megaphone, 
  Activity, 
  Clock, 
  CheckCircle, 
  Eye,
  Copy,
  Trash2,
  Zap
} from "lucide-react";
import { api } from "@/lib/api";
import type { Campaign } from "@shared/schema";

export default function Campaigns() {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["/api/campaigns"],
    queryFn: async () => {
      const response = await api.getCampaigns();
      return await response.json();
    },
  });

  const activeCampaigns = campaigns?.filter((c: Campaign) => c.status === "active").length || 0;
  const scheduledCampaigns = campaigns?.filter((c: Campaign) => c.status === "scheduled").length || 0;
  const completedCampaigns = campaigns?.filter((c: Campaign) => c.status === "completed").length || 0;

  if (isLoading) {
    return (
      <div className="flex-1 dots-bg">
        <Header title="Campaigns" subtitle="Loading campaigns..." />
        <div className="p-6">
          <Loading size="lg" text="Loading campaigns..." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 dots-bg min-h-screen">
      <Header 
        title="Campaign Management" 
        subtitle="Create and manage your WhatsApp marketing campaigns"
        action={{
          label: "Create Campaign",
          onClick: () => console.log("Create campaign")
        }}
      />

      <main className="p-6 space-y-6">
        {/* API Selection Banner */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Choose Your Campaign Type</h3>
                <p className="text-blue-100 text-sm">Select the best API for your campaign goals</p>
              </div>
              <div className="flex space-x-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                  <div className="text-sm font-medium">Cloud API</div>
                  <div className="text-xs text-blue-100">Two-way conversations</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                  <div className="text-sm font-medium">MM Lite API</div>
                  <div className="text-xs text-blue-100">Marketing optimization</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Campaigns</p>
                  <p className="text-2xl font-bold text-gray-900">{campaigns?.length || 0}</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Megaphone className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{activeCampaigns}</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold text-orange-600">{scheduledCampaigns}</p>
                </div>
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completedCampaigns}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Campaigns</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">All Campaigns</Button>
                <Button variant="outline" size="sm">Active</Button>
                <Button variant="outline" size="sm">Scheduled</Button>
                <Button variant="outline" size="sm">Completed</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!campaigns?.length ? (
              <EmptyState
                icon={Megaphone}
                title="No campaigns yet"
                description="You haven't created any campaigns yet. Create your first campaign to start sending WhatsApp messages to your contacts."
                action={{
                  label: "Create First Campaign",
                  onClick: () => console.log("Create campaign")
                }}
                className="py-12"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Campaign
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        API Type
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recipients
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Delivery Rate
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {campaigns.map((campaign: Campaign) => {
                      const deliveryRate = campaign.sentCount 
                        ? ((campaign.deliveredCount || 0) / campaign.sentCount) * 100 
                        : 0;
                      
                      return (
                        <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                                <Megaphone className="w-5 h-5 text-green-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {campaign.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {campaign.type} campaign
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge 
                              variant="outline"
                              className={campaign.apiType === "mm_lite" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200"}
                            >
                              {campaign.apiType === "mm_lite" ? "MM Lite" : "Cloud API"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {Array.isArray(campaign.recipients) ? campaign.recipients.length : 0}
                          </td>
                          <td className="px-6 py-4">
                            <Badge 
                              variant={campaign.status === "active" ? "default" : "secondary"}
                              className={
                                campaign.status === "active" ? "bg-green-100 text-green-800" :
                                campaign.status === "completed" ? "bg-gray-100 text-gray-800" :
                                campaign.status === "scheduled" ? "bg-orange-100 text-orange-800" :
                                "bg-gray-100 text-gray-800"
                              }
                            >
                              {campaign.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {campaign.sentCount > 0 ? (
                              <div className="flex items-center">
                                <span className="text-green-600 font-medium">
                                  {deliveryRate.toFixed(1)}%
                                </span>
                                <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-500 h-2 rounded-full" 
                                    style={{ width: `${deliveryRate}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {campaign.createdAt 
                              ? new Date(campaign.createdAt).toLocaleDateString()
                              : "Unknown"
                            }
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" title="View Details">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Clone Campaign">
                                <Copy className="w-4 h-4 text-orange-600" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Delete">
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
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
