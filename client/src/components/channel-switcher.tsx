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
import { Plus, Phone, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useChannelContext } from "@/contexts/channel-context";
import type { Channel } from "@shared/schema";
import { useAuth } from "@/contexts/auth-context";

interface ChannelsResponse {
  data: Channel[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function ChannelSwitcher() {
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const limit = 10;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { setSelectedChannel } = useChannelContext();
  const {user} = useAuth()

  const userId = user?.id;

  // Fetch channels with pagination
  const { data: response, isLoading } = useQuery<ChannelsResponse>({
    queryKey: ["/api/channels", page],
    queryFn: async () => {
      const res = await apiRequest("POST", "/api/channels/userid", {
        userId:userId,
        page,
        limit,
      });
      return res.json();
    },
    keepPreviousData: true,
  });

  const channels: Channel[] = Array.isArray(response?.data) ? response.data : [];
  const totalPages = response?.totalPages || 1;

  // Fetch active channel
  const { data: activeChannel } = useQuery<Channel>({
    queryKey: ["/api/channels/active"],
    retry: false,
  });

  // Set selected channel on mount
  useEffect(() => {
    if (activeChannel && !selectedChannelId) {
      setSelectedChannelId(activeChannel.id);
      setSelectedChannel(activeChannel);
    }
  }, [activeChannel, selectedChannelId, setSelectedChannel]);

  // Update context when selectedChannelId changes
  useEffect(() => {
    const channel = channels.find(c => c.id === selectedChannelId);
    if (channel) {
      setSelectedChannel(channel);
    }
  }, [selectedChannelId, channels, setSelectedChannel]);

  // Mutation to activate a channel
  const updateChannelMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      // Deactivate all channels first if activating
      if (isActive) {
        await Promise.all(
          channels.map(async (channel) => {
            await fetch(`/api/channels/${channel.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ isActive: false }),
            });
          })
        );
      }

      // Activate the selected channel
      const res = await fetch(`/api/channels/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });

      if (!res.ok) throw new Error("Failed to update channel");
      return res.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/channels"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/channels/active"] });
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
    <div className="flex flex-col gap-2">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2 mt-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
