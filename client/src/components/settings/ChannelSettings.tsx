import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, Plus, Edit, Trash2, CheckCircle, XCircle, 
  TestTube, RefreshCw, Info, Activity, MessageSquare 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Channel } from "@shared/schema";
import { Loading } from "@/components/ui/loading";
import { ChannelDialog } from "./ChannelDialog";
import { TestMessageDialog } from "./TestMessageDialog";

export function ChannelSettings() {
  const [showChannelDialog, setShowChannelDialog] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testingChannelId, setTestingChannelId] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch WhatsApp channels
  const { data: channels = [], isLoading: channelsLoading } = useQuery<Channel[]>({
    queryKey: ["/api/channels"],
  });

  // Delete channel mutation
  const deleteChannelMutation = useMutation({
    mutationFn: async (channelId: string) => {
      return await apiRequest("DELETE", `/api/channels/${channelId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/channels"] });
      toast({
        title: "Channel deleted",
        description: "The channel has been removed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditChannel = (channel: Channel) => {
    setEditingChannel(channel);
    setShowChannelDialog(true);
  };

  const handleDeleteChannel = (channelId: string) => {
    if (confirm("Are you sure you want to delete this channel?")) {
      deleteChannelMutation.mutate(channelId);
    }
  };

  const checkChannelHealth = async (channelId: string) => {
    try {
      toast({
        title: "Checking health...",
        description: "Verifying channel connection and status",
      });
      
      const response = await apiRequest("POST", `/api/channels/${channelId}/health`);
      
      await queryClient.invalidateQueries({ queryKey: ["/api/channels"] });
      
      if (response.healthStatus === 'healthy') {
        toast({
          title: "Channel is healthy",
          description: "The WhatsApp channel is working properly",
        });
      } else if (response.healthStatus === 'warning') {
        toast({
          title: "Channel has warnings", 
          description: response.message || "Check health details for more information",
          variant: "default",
        });
      } else {
        toast({
          title: "Channel has issues",
          description: response.message || "The channel needs attention",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Health check failed",
        description: "Could not verify channel status",
        variant: "destructive",
      });
    }
  };

  const getHealthIcon = (status?: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <Activity className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getHealthStatusBadge = (status?: string, lastChecked?: string) => {
    const variant = status === 'healthy' ? 'success' : status === 'warning' ? 'warning' : status === 'error' ? 'destructive' : 'secondary';
    return (
      <div className="flex items-center space-x-2">
        <Badge variant={variant as any} className="capitalize">
          {status || 'unknown'}
        </Badge>
        {lastChecked && (
          <span className="text-xs text-gray-500">
            Last checked: {new Date(lastChecked).toLocaleString()}
          </span>
        )}
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Smartphone className="w-5 h-5 mr-2" />
              WhatsApp Channels
            </CardTitle>
            <Button onClick={() => {
              setEditingChannel(null);
              setShowChannelDialog(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Channel
            </Button>
          </div>
          <CardDescription>
            Configure your WhatsApp Business API channels for Cloud API and MM Lite
          </CardDescription>
        </CardHeader>
        <CardContent>
          {channelsLoading ? (
            <Loading />
          ) : channels.length === 0 ? (
            <div className="text-center py-12">
              <Smartphone className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No WhatsApp channels configured yet</p>
              <Button onClick={() => setShowChannelDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Channel
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {channels.map((channel) => (
                <div key={channel.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">{channel.name}</h3>
                        {channel.isActive && (
                          <Badge variant="success" className="text-xs">Active</Badge>
                        )}
                        {channel.mmLiteEnabled && (
                          <Badge variant="secondary" className="text-xs">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            MM Lite
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Phone: {channel.phoneNumber || 'Not set'}</p>
                        <p>Phone Number ID: {channel.phoneNumberId}</p>
                        <p>Business Account ID: {channel.whatsappBusinessAccountId || 'Not set'}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span>Health Status:</span>
                          {getHealthStatusBadge(channel.healthStatus, channel.lastHealthCheck)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => checkChannelHealth(channel.id)}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Check Health
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTestingChannelId(channel.id);
                          setShowTestDialog(true);
                        }}
                      >
                        <TestTube className="w-4 h-4 mr-1" />
                        Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditChannel(channel)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteChannel(channel.id)}
                        disabled={deleteChannelMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Channel Dialog */}
      <ChannelDialog
        open={showChannelDialog}
        onOpenChange={setShowChannelDialog}
        editingChannel={editingChannel}
        onSuccess={() => {
          setShowChannelDialog(false);
          setEditingChannel(null);
        }}
      />

      {/* Test Message Dialog */}
      <TestMessageDialog
        open={showTestDialog}
        onOpenChange={setShowTestDialog}
        channelId={testingChannelId}
      />
    </>
  );
}