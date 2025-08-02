import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Phone, Check, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Channel } from "@shared/schema";

export function ChannelSwitcher() {
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch channels
  const { data: channels = [], isLoading } = useQuery<Channel[]>({
    queryKey: ["/api/channels"],
  });

  // Fetch active channel
  const { data: activeChannel } = useQuery<Channel>({
    queryKey: ["/api/channels/active"],
    retry: false,
  });

  // Set selected channel on mount
  useEffect(() => {
    if (activeChannel && !selectedChannelId) {
      setSelectedChannelId(activeChannel.id);
    }
  }, [activeChannel, selectedChannelId]);

  // Update channel mutation
  const updateChannelMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      // First, set all channels to inactive
      if (isActive) {
        await Promise.all(
          channels.map(async (channel) => {
            const response = await fetch(`/api/channels/${channel.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ isActive: false }),
            });
            if (!response.ok) throw new Error("Failed to update channel");
            return response.json();
          })
        );
      }
      
      // Then set the selected channel as active
      const response = await fetch(`/api/channels/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error("Failed to update channel");
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all queries to refresh data for the new channel
      queryClient.invalidateQueries({ queryKey: ["/api/channels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/channels/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/automations"] });
      
      toast({
        title: "Channel switched",
        description: "Active channel has been updated successfully.",
      });
    },
  });



  const handleChannelChange = (channelId: string) => {
    setSelectedChannelId(channelId);
    updateChannelMutation.mutate({ id: channelId, isActive: true });
  };

  if (isLoading) {
    return <div className="w-48 h-9 bg-gray-100 animate-pulse rounded" />;
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Select value={selectedChannelId || ""} onValueChange={handleChannelChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select channel">
              {selectedChannelId && channels.find(c => c.id === selectedChannelId) ? (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span className="truncate">
                    {channels.find(c => c.id === selectedChannelId)?.name}
                  </span>
                </div>
              ) : (
                "Select channel"
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {channels.map((channel) => (
              <SelectItem key={channel.id} value={channel.id}>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{channel.name}</span>
                  {channel.isActive && <Check className="w-3 h-3 text-green-600 ml-auto" />}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => setLocation("/settings?tab=whatsapp")}
          title="Add new channel"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>


    </>
  );
}