import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Users, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";

interface Campaign {
  id: string;
  status: string;
  recipientCount?: number;
  sentCount?: number;
  deliveredCount?: number;
  readCount?: number;
  failedCount?: number;
}

interface CampaignStatisticsProps {
  campaigns: Campaign[];
}

export function CampaignStatistics({ campaigns }: CampaignStatisticsProps) {
  // Calculate aggregate statistics
  const stats = campaigns.reduce((acc, campaign) => ({
    totalCampaigns: acc.totalCampaigns + 1,
    activeCampaigns: acc.activeCampaigns + (campaign.status === 'active' ? 1 : 0),
    totalRecipients: acc.totalRecipients + (campaign.recipientCount || 0),
    totalSent: acc.totalSent + (campaign.sentCount || 0),
    totalDelivered: acc.totalDelivered + (campaign.deliveredCount || 0),
    totalRead: acc.totalRead + (campaign.readCount || 0),
    totalFailed: acc.totalFailed + (campaign.failedCount || 0),
  }), {
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalRecipients: 0,
    totalSent: 0,
    totalDelivered: 0,
    totalRead: 0,
    totalFailed: 0,
  });

  const deliveryRate = stats.totalRecipients > 0 
    ? Math.round((stats.totalDelivered / stats.totalRecipients) * 100) 
    : 0;

  const readRate = stats.totalDelivered > 0 
    ? Math.round((stats.totalRead / stats.totalDelivered) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Campaigns</p>
              <p className="text-2xl font-bold">{stats.totalCampaigns}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.activeCampaigns} active
              </p>
            </div>
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Recipients</p>
              <p className="text-2xl font-bold">{stats.totalRecipients.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalSent} sent
              </p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Delivery Rate</p>
              <p className="text-2xl font-bold text-green-600">{deliveryRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalDelivered} delivered
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Read Rate</p>
              <p className="text-2xl font-bold text-blue-600">{readRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalRead} read
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Failed Messages</p>
              <p className="text-2xl font-bold text-destructive">{stats.totalFailed}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalSent > 0 ? Math.round((stats.totalFailed / stats.totalSent) * 100) : 0}% failure rate
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}