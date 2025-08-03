import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Channel } from "@shared/schema";
import { MessageSquare } from "lucide-react";

const channelFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phoneNumber: z.string().min(10, "Valid phone number required"),
  phoneNumberId: z.string().min(1, "Phone Number ID is required"),
  wabaId: z.string().min(1, "Business Account ID is required"),
  accessToken: z.string().min(1, "Access Token is required"),
  businessAccountId: z.string().optional(),
  mmLiteEnabled: z.boolean().default(false),
  mmLiteApiUrl: z.string().optional(),
  mmLiteApiKey: z.string().optional(),
});

interface ChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingChannel: Channel | null;
  onSuccess: () => void;
}

export function ChannelDialog({ open, onOpenChange, editingChannel, onSuccess }: ChannelDialogProps) {
  const { toast } = useToast();

  const channelForm = useForm<z.infer<typeof channelFormSchema>>({
    resolver: zodResolver(channelFormSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      phoneNumberId: "",
      wabaId: "",
      accessToken: "",
      businessAccountId: "",
      mmLiteEnabled: false,
      mmLiteApiUrl: "",
      mmLiteApiKey: "",
    },
  });

  useEffect(() => {
    if (editingChannel) {
      channelForm.reset({
        name: editingChannel.name,
        phoneNumber: editingChannel.phoneNumber || "",
        phoneNumberId: editingChannel.phoneNumberId,
        wabaId: editingChannel.whatsappBusinessAccountId || "",
        accessToken: editingChannel.accessToken,
        businessAccountId: "",
        mmLiteEnabled: editingChannel.mmLiteEnabled || false,
        mmLiteApiUrl: editingChannel.mmLiteApiUrl || "",
        mmLiteApiKey: editingChannel.mmLiteApiKey || "",
      });
    } else {
      channelForm.reset();
    }
  }, [editingChannel, channelForm]);

  // Create/Update channel mutation
  const createChannelMutation = useMutation({
    mutationFn: async (data: z.infer<typeof channelFormSchema>) => {
      const payload = {
        name: data.name,
        phoneNumber: data.phoneNumber,
        phoneNumberId: data.phoneNumberId,
        whatsappBusinessAccountId: data.wabaId,
        businessAccountId: data.businessAccountId,
        accessToken: data.accessToken,
        mmLiteEnabled: data.mmLiteEnabled,
        mmLiteApiUrl: data.mmLiteApiUrl,
        mmLiteApiKey: data.mmLiteApiKey,
      };
      
      if (editingChannel) {
        return await apiRequest("PATCH", `/api/channels/${editingChannel.id}`, payload);
      } else {
        return await apiRequest("POST", "/api/channels", payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/channels"] });
      toast({
        title: editingChannel ? "Channel updated" : "Channel created",
        description: editingChannel ? "Your channel has been updated successfully." : "Your new channel has been added successfully.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleChannelSubmit = (data: z.infer<typeof channelFormSchema>) => {
    createChannelMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editingChannel ? "Edit" : "Add New"} WhatsApp Channel</DialogTitle>
          <DialogDescription>
            Configure your WhatsApp Business API credentials and settings.
          </DialogDescription>
        </DialogHeader>
        <Form {...channelForm}>
          <form onSubmit={channelForm.handleSubmit(handleChannelSubmit)} className="space-y-4">
            <FormField
              control={channelForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Business" {...field} />
                  </FormControl>
                  <FormDescription>
                    A friendly name to identify this channel
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={channelForm.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1234567890" {...field} />
                  </FormControl>
                  <FormDescription>
                    The WhatsApp Business phone number
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={channelForm.control}
              name="phoneNumberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number ID</FormLabel>
                  <FormControl>
                    <Input placeholder="123456789012345" {...field} />
                  </FormControl>
                  <FormDescription>
                    Found in Meta Business Suite under WhatsApp settings
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={channelForm.control}
              name="wabaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp Business Account ID</FormLabel>
                  <FormControl>
                    <Input placeholder="123456789012345" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your WhatsApp Business Account ID from Meta
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={channelForm.control}
              name="accessToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Token</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Your access token" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your permanent access token from Meta
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={channelForm.control}
              name="businessAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Account ID (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="123456789012345" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your Meta Business Account ID (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* MM Lite Configuration */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-gray-500" />
                <h3 className="font-medium">MM Lite Configuration (Optional)</h3>
              </div>
              
              <FormField
                control={channelForm.control}
                name="mmLiteEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable MM Lite</FormLabel>
                      <FormDescription>
                        Use MM Lite API for high-volume messaging
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {channelForm.watch("mmLiteEnabled") && (
                <>
                  <FormField
                    control={channelForm.control}
                    name="mmLiteApiUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MM Lite API URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://api.mmlite.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          The base URL for MM Lite API
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={channelForm.control}
                    name="mmLiteApiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MM Lite API Key</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Your MM Lite API key" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your MM Lite API authentication key
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createChannelMutation.isPending}>
                {createChannelMutation.isPending ? "Saving..." : editingChannel ? "Update" : "Create"} Channel
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}