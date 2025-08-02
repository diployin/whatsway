import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Building, Phone, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Channel } from "@shared/schema";

export function ChannelSwitcher() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
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
      queryClient.invalidateQueries({ queryKey: ["/api/channels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/channels/active"] });
      toast({
        title: "Channel switched",
        description: "Active channel has been updated successfully.",
      });
    },
  });

  // Create channel mutation
  const createChannelMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      phoneNumber: string;
      phoneNumberId: string;
      whatsappBusinessAccountId: string;
      accessToken: string;
    }) => {
      const response = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          provider: "whatsapp",
          status: "active",
          isActive: channels.length === 0, // Make first channel active by default
        }),
      });
      if (!response.ok) throw new Error("Failed to create channel");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/channels"] });
      setShowAddDialog(false);
      toast({
        title: "Channel added",
        description: "New channel has been added successfully.",
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
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Add Channel Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              createChannelMutation.mutate({
                name: formData.get("name") as string,
                phoneNumber: formData.get("phoneNumber") as string,
                phoneNumberId: formData.get("phoneNumberId") as string,
                whatsappBusinessAccountId: formData.get("whatsappBusinessAccountId") as string,
                accessToken: formData.get("accessToken") as string,
              });
            }}
          >
            <DialogHeader>
              <DialogTitle>Add WhatsApp Channel</DialogTitle>
              <DialogDescription>
                Add a new WhatsApp Business account channel
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Channel Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Main Business Account"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="+1234567890"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumberId">Phone Number ID</Label>
                <Input
                  id="phoneNumberId"
                  name="phoneNumberId"
                  placeholder="153851404474202"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="whatsappBusinessAccountId">WhatsApp Business Account ID</Label>
                <Input
                  id="whatsappBusinessAccountId"
                  name="whatsappBusinessAccountId"
                  placeholder="123456789012345"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accessToken">Access Token</Label>
                <Input
                  id="accessToken"
                  name="accessToken"
                  type="password"
                  placeholder="Bearer token..."
                  required
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Channel</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}