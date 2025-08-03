import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Pause, Play, Code, Trash2, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface CampaignsTableProps {
  campaigns: any[];
  onViewCampaign: (campaign: any) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDeleteCampaign: (id: string) => void;
}

export function CampaignsTable({ campaigns, onViewCampaign, onUpdateStatus, onDeleteCampaign }: CampaignsTableProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Play className="h-4 w-4" />;
      case "scheduled":
        return <Clock className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "paused":
        return <Pause className="h-4 w-4" />;
      case "failed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Template</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Recipients</TableHead>
          <TableHead>Sent</TableHead>
          <TableHead>Delivered</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {campaigns.map((campaign: any) => (
          <TableRow key={campaign.id}>
            <TableCell className="font-medium">{campaign.name}</TableCell>
            <TableCell>
              <Badge variant="outline">{campaign.campaignType}</Badge>
            </TableCell>
            <TableCell>{campaign.templateName}</TableCell>
            <TableCell>
              <Badge className={getStatusColor(campaign.status)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(campaign.status)}
                  {campaign.status}
                </span>
              </Badge>
            </TableCell>
            <TableCell>{campaign.recipientCount || 0}</TableCell>
            <TableCell>{campaign.sentCount || 0}</TableCell>
            <TableCell>{campaign.deliveredCount || 0}</TableCell>
            <TableCell>{format(new Date(campaign.createdAt), "MMM d, yyyy")}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewCampaign(campaign)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                
                {campaign.status === "active" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onUpdateStatus(campaign.id, "paused")}
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                )}
                
                {campaign.status === "paused" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onUpdateStatus(campaign.id, "active")}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                )}
                
                {campaign.campaignType === "api" && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onViewCampaign(campaign)}
                  >
                    <Code className="h-4 w-4" />
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteCampaign(campaign.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}