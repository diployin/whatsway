import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface CampaignDetailsDialogProps {
  campaign: any | null;
  onClose: () => void;
}

export function CampaignDetailsDialog({ campaign, onClose }: CampaignDetailsDialogProps) {
  const { toast } = useToast();

  if (!campaign) return null;

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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    });
  };

  const generateSampleCode = () => {
    const baseUrl = window.location.origin;
    return `// Using fetch (JavaScript)
const response = await fetch('${baseUrl}${campaign.apiEndpoint}', {
  method: 'POST',
  headers: {
    'X-API-Key': '${campaign.apiKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: '+919876543210',
    variables: {
      '1': 'John Doe',
      '2': 'Order #12345'
    }
  })
});

// Using cURL
curl -X POST ${baseUrl}${campaign.apiEndpoint} \\
  -H "X-API-Key: ${campaign.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+919876543210",
    "variables": {
      "1": "John Doe",
      "2": "Order #12345"
    }
  }'`;
  };

  return (
    <Dialog open={!!campaign} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{campaign.name}</DialogTitle>
          <DialogDescription>Campaign Analytics & Details</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Campaign Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Sent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaign.sentCount || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Delivered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaign.deliveredCount || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Read</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaign.readCount || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Failed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaign.failedCount || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Campaign Info */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Type:</span>
              <span>{campaign.campaignType}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Template:</span>
              <span>{campaign.templateName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <Badge className={getStatusColor(campaign.status)}>
                {campaign.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Created:</span>
              <span>{format(new Date(campaign.createdAt), "PPP")}</span>
            </div>
            {campaign.scheduledAt && (
              <div className="flex justify-between">
                <span className="font-medium">Scheduled:</span>
                <span>{format(new Date(campaign.scheduledAt), "PPP p")}</span>
              </div>
            )}
          </div>

          {/* API Details for API campaigns */}
          {campaign.campaignType === "api" && campaign.apiEndpoint && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">API Integration Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Endpoint URL</Label>
                  <div className="flex gap-2">
                    <Input value={`${window.location.origin}${campaign.apiEndpoint}`} readOnly />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => copyToClipboard(`${window.location.origin}${campaign.apiEndpoint}`, "Endpoint URL")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label>API Key</Label>
                  <div className="flex gap-2">
                    <Input value={campaign.apiKey} readOnly type="password" />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => copyToClipboard(campaign.apiKey, "API Key")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label>Sample Code</Label>
                  <div className="relative">
                    <Textarea 
                      value={generateSampleCode()} 
                      readOnly 
                      className="font-mono text-sm h-64"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(generateSampleCode(), "Sample code")}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Code
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}