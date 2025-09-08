import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Play, Pause, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";

interface Campaign {
  id: string;
  name: string;
  status: string;
  templateName?: string;
  recipientCount?: number;
  sentCount?: number;
  deliveredCount?: number;
  readCount?: number;
  repliedCount?: number;
  failedCount?: number;
  createdAt: string;
  completedAt?: string;
  scheduledAt?: string;
}

interface CampaignsTableProps {
  campaigns: Campaign[];
  onViewCampaign: (campaign: Campaign) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDeleteCampaign: (id: string) => void;
}

export function CampaignsTable({ campaigns, onViewCampaign, onUpdateStatus, onDeleteCampaign }: CampaignsTableProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "success" | "destructive" | "outline"; label: string }> = {
      active: { variant: "success", label: "Active" },
      completed: { variant: "default", label: "Completed" },
      scheduled: { variant: "secondary", label: "Scheduled" },
      paused: { variant: "outline", label: "Paused" },
      failed: { variant: "destructive", label: "Failed" },
    };

    const config = statusConfig[status] || { variant: "outline", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const calculateDeliveryRate = (sent?: number, delivered?: number) => {
    if (!sent || sent === 0) return 0;
    return Math.round((delivered || 0) / sent * 100);
  };

  const calculateReadRate = (delivered?: number, read?: number) => {
    if (!delivered || delivered === 0) return 0;
    return Math.round((read || 0) / delivered * 100);
  };

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No campaigns found. Create your first campaign to get started.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Campaign</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Template</TableHead>
          <TableHead>Recipients</TableHead>
          <TableHead>Sent</TableHead>
          <TableHead>Delivered</TableHead>
          <TableHead>Read</TableHead>
          <TableHead>Delivery Rate</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {campaigns.map((campaign) => {
          const deliveryRate = calculateDeliveryRate(campaign.totalRecipients, campaign.deliveredCount);
          const readRate = calculateReadRate(campaign.deliveredCount, campaign.readCount);
          
          return (
            <TableRow key={campaign.id}>
              <TableCell className="font-medium">{campaign.name}</TableCell>
              <TableCell>{getStatusBadge(campaign.status)}</TableCell>
              <TableCell>{campaign.templateName || "-"}</TableCell>
              <TableCell>{campaign.recipientCount || 0}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{campaign.sentCount || 0}</span>
                  {campaign.failedCount ? (
                    <span className="text-xs text-destructive">({campaign.failedCount} failed)</span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{campaign.deliveredCount || 0}</span>
                  {deliveryRate > 0 && (
                    <span className="text-xs text-muted-foreground">({deliveryRate}%)</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{campaign.readCount || 0}</span>
                  {readRate > 0 && (
                    <span className="text-xs text-muted-foreground">({readRate}%)</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress value={deliveryRate} className="w-20" />
                  <span className="text-sm font-medium">{deliveryRate}%</span>
                </div>
              </TableCell>
              <TableCell>
                {format(new Date(campaign.createdAt), "MMM d, h:mm a")}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewCampaign(campaign)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    {campaign.status === "active" && (
                      <DropdownMenuItem onClick={() => onUpdateStatus(campaign.id, "paused")}>
                        <Pause className="mr-2 h-4 w-4" />
                        Pause
                      </DropdownMenuItem>
                    )}
                    {campaign.status === "paused" && (
                      <DropdownMenuItem onClick={() => onUpdateStatus(campaign.id, "active")}>
                        <Play className="mr-2 h-4 w-4" />
                        Resume
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => onDeleteCampaign(campaign.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}