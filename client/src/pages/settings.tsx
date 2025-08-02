import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import { Loading } from "@/components/ui/loading";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings as SettingsIcon, 
  Smartphone, 
  Webhook, 
  Key, 
  User, 
  Users, 
  Shield,
  Bell,
  Zap,
  CheckCircle,
  XCircle,
  TestTube,
  Eye,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  Copy,
  RefreshCw,
  Activity,
  Edit,
  Info,
  MessageSquare,
  HelpCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Channel, WebhookConfig } from "@shared/schema";
import { WebhookFlowDiagram } from "@/components/webhook-flow-diagram";

// Form schemas
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

const webhookFormSchema = z.object({
  verifyToken: z.string().min(8, "Verify token must be at least 8 characters").max(100, "Verify token must be less than 100 characters"),
  appSecret: z.string().optional(),
  events: z.array(z.string()).min(1, "Select at least one event"),
});

export default function Settings() {
  const [activeTab, setActiveTab] = useState("whatsapp");
  const [showChannelDialog, setShowChannelDialog] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [showWebhookDialog, setShowWebhookDialog] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState("919310797700");
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testingChannelId, setTestingChannelId] = useState<string | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Fetch WhatsApp channels
  const { data: channels = [], isLoading: channelsLoading } = useQuery<Channel[]>({
    queryKey: ["/api/channels"],
  });

  // Fetch webhook configs
  const { data: webhookConfigs = [], isLoading: webhooksLoading, refetch: refetchWebhookConfigs } = useQuery<WebhookConfig[]>({
    queryKey: ["/api/whatsapp/webhooks"],
  });

  // Channel form
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

  // Webhook form
  // Generate a secure random token
  const generateSecureToken = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return token;
  };

  const webhookForm = useForm<z.infer<typeof webhookFormSchema>>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: {
      verifyToken: generateSecureToken(),
      appSecret: "",
      events: ["messages", "message_status", "message_template_status_update"],
    },
  });

  // Create channel mutation
  const createChannelMutation = useMutation({
    mutationFn: async (data: z.infer<typeof channelFormSchema>) => {
      if (editingChannel) {
        // Map form data to channel schema
        const channelData = {
          name: data.name,
          phoneNumber: data.phoneNumber,
          phoneNumberId: data.phoneNumberId,
          whatsappBusinessAccountId: data.wabaId,
          accessToken: data.accessToken,
          mmLiteEnabled: data.mmLiteEnabled,
          mmLiteApiUrl: data.mmLiteApiUrl || null,
          mmLiteApiKey: data.mmLiteApiKey || null,
        };
        return await apiRequest("PUT", `/api/channels/${editingChannel.id}`, channelData);
      }
      // Map form data to channel schema
      const channelData = {
        name: data.name,
        phoneNumber: data.phoneNumber,
        phoneNumberId: data.phoneNumberId,
        whatsappBusinessAccountId: data.wabaId,
        accessToken: data.accessToken,
        isActive: channels.length === 0, // Make first channel active by default
        mmLiteEnabled: data.mmLiteEnabled,
        mmLiteApiUrl: data.mmLiteApiUrl || null,
        mmLiteApiKey: data.mmLiteApiKey || null,
      };
      
      return await apiRequest("POST", "/api/channels", channelData);
    },
    onSuccess: () => {
      toast({
        title: editingChannel ? "Channel updated" : "Channel added",
        description: "WhatsApp channel has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/channels"] });
      setShowChannelDialog(false);
      setEditingChannel(null);
      channelForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete channel mutation
  const deleteChannelMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/channels/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Channel deleted",
        description: "WhatsApp channel has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/channels"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Test channel mutation
  const testChannelMutation = useMutation({
    mutationFn: async ({ id, testPhone }: { id: string; testPhone: string }) => {
      const res = await apiRequest("POST", `/api/whatsapp/channels/${id}/test`, { testPhone });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Test successful",
        description: "WhatsApp message sent successfully. Check your phone!",
      });
      setShowTestDialog(false);
      // Refresh channels to show updated status
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/channels"] });
    },
    onError: (error) => {
      toast({
        title: "Test failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create webhook config mutation
  const createWebhookMutation = useMutation({
    mutationFn: async (data: z.infer<typeof webhookFormSchema> & { channelId: string }) => {
      const res = await apiRequest("POST", "/api/whatsapp/webhooks", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Webhook configured",
        description: "Webhook configuration has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/webhooks"] });
      setShowWebhookDialog(false);
      webhookForm.reset();
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
    channelForm.reset({
      name: channel.name,
      phoneNumber: channel.phoneNumber || "",
      phoneNumberId: channel.phoneNumberId,
      wabaId: channel.whatsappBusinessAccountId || "",
      accessToken: channel.accessToken,
      businessAccountId: "",
      mmLiteEnabled: channel.mmLiteEnabled || false,
      mmLiteApiUrl: channel.mmLiteApiUrl || "",
      mmLiteApiKey: channel.mmLiteApiKey || "",
    });
    setShowChannelDialog(true);
  };

  const handleChannelSubmit = (data: z.infer<typeof channelFormSchema>) => {
    createChannelMutation.mutate(data);
  };

  const handleWebhookSubmit = (data: z.infer<typeof webhookFormSchema>) => {
    // Use a simple webhook ID for the global webhook
    const webhookId = 'd420e261-9c12-4cee-9d65-253cda8ab4bc'; // Fixed webhook ID for global webhook
    const webhookUrl = `${window.location.origin}/webhook/${webhookId}`;
    createWebhookMutation.mutate({ 
      ...data, 
      webhookUrl,
      channelId: null, // Global webhook - not tied to a specific channel
    });
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    });
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

  return (
    <div className="flex-1 dots-bg min-h-screen">
      <Header 
        title="Settings" 
        subtitle="Manage your WhatsApp business configuration"
      />

      <main className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="whatsapp" className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4" />
              <span>WhatsApp</span>
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center space-x-2">
              <Webhook className="w-4 h-4" />
              <span>Webhooks</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center space-x-2">
              <Key className="w-4 h-4" />
              <span>API Keys</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Team</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Account</span>
            </TabsTrigger>
          </TabsList>

          {/* WhatsApp Numbers Tab */}
          <TabsContent value="whatsapp" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Smartphone className="w-5 h-5 mr-2" />
                    WhatsApp Channels
                  </CardTitle>
                  <Button onClick={() => {
                    setEditingChannel(null);
                    channelForm.reset();
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
                              <h3 className="text-lg font-medium text-gray-900">{channel.name}</h3>
                              <Badge className={channel.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                {channel.isActive ? (
                                  <>
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Inactive
                                  </>
                                )}
                              </Badge>
                              {channel.mmLiteEnabled && (
                                <Badge className="bg-purple-100 text-purple-800">
                                  <Zap className="w-3 h-3 mr-1" />
                                  MM Lite
                                </Badge>
                              )}
                              {/* Health Status Badge */}
                              <Badge 
                                className={
                                  channel.healthStatus === 'healthy' ? "bg-green-100 text-green-800" :
                                  channel.healthStatus === 'warning' ? "bg-yellow-100 text-yellow-800" :
                                  channel.healthStatus === 'error' ? "bg-red-100 text-red-800" :
                                  "bg-gray-100 text-gray-800"
                                }
                              >
                                {channel.healthStatus === 'healthy' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                                 channel.healthStatus === 'warning' ? <AlertCircle className="w-3 h-3 mr-1" /> :
                                 channel.healthStatus === 'error' ? <XCircle className="w-3 h-3 mr-1" /> :
                                 <HelpCircle className="w-3 h-3 mr-1" />}
                                {channel.healthStatus === 'unknown' ? 'Health Unknown' : channel.healthStatus}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                <strong>Phone:</strong> {channel.phoneNumber}
                              </div>
                              <div>
                                <strong>Status:</strong>{' '}
                                <span className={`font-medium ${channel.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                  {channel.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <div>
                                <strong>Phone Number ID:</strong> {channel.phoneNumberId}
                              </div>
                              <div>
                                <strong>Business Account ID:</strong> {channel.whatsappBusinessAccountId}
                              </div>
                              {channel.lastHealthCheck && (
                                <div className="col-span-2">
                                  <strong>Last Health Check:</strong> {new Date(channel.lastHealthCheck).toLocaleString()}
                                </div>
                              )}
                              {channel.healthDetails && Object.keys(channel.healthDetails).length > 0 && (
                                <div className="col-span-2 mt-2 p-3 bg-gray-50 rounded-md">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Activity className="w-4 h-4" />
                                    <strong>Health Details:</strong>
                                  </div>
                                  <div className="space-y-1 text-xs">
                                    {Object.entries(channel.healthDetails).map(([key, value]) => (
                                      <div key={key} className="flex justify-between">
                                        <span className="text-gray-600">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>
                                        <span className="font-medium">{String(value)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => checkChannelHealth(channel.id)}
                              title="Check channel health"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditChannel(channel)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this channel?")) {
                                  deleteChannelMutation.mutate(channel.id);
                                }
                              }}
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
            <Dialog open={showChannelDialog} onOpenChange={setShowChannelDialog}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingChannel ? "Edit WhatsApp Channel" : "Add WhatsApp Channel"}
                  </DialogTitle>
                  <DialogDescription>
                    Configure your WhatsApp Business API credentials
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
                            <Input placeholder="e.g., Main Business Number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={channelForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+1234567890" {...field} />
                            </FormControl>
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={channelForm.control}
                        name="wabaId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>WhatsApp Business Account ID</FormLabel>
                            <FormControl>
                              <Input placeholder="987654321098765" {...field} />
                            </FormControl>
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
                              <Input placeholder="Optional" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={channelForm.control}
                      name="accessToken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Access Token</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="EAAxxxxxxx..." {...field} />
                          </FormControl>
                          <FormDescription>
                            Your Meta Business Platform access token
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={channelForm.control}
                      name="mmLiteEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Enable MM Lite API
                            </FormLabel>
                            <FormDescription>
                              Use MM Lite for optimized marketing message delivery
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    {channelForm.watch("mmLiteEnabled") && (
                      <div className="space-y-4 pl-8 border-l-2 border-gray-200">
                        <FormField
                          control={channelForm.control}
                          name="mmLiteApiUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>MM Lite API URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://api.mmlite.com/v1" {...field} />
                              </FormControl>
                              <FormDescription>
                                The endpoint URL for your MM Lite API
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
                                <Input type="password" placeholder="Your MM Lite API Key" {...field} />
                              </FormControl>
                              <FormDescription>
                                API key for authenticating with MM Lite
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowChannelDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createChannelMutation.isPending}>
                        {createChannelMutation.isPending ? "Saving..." : "Save Channel"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Webhook className="w-5 h-5 mr-2" />
                    Webhook Configuration
                  </CardTitle>
                  <Button onClick={() => setShowWebhookDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Configure Webhook
                  </Button>
                </div>
                <CardDescription>
                  Set up webhooks to receive real-time notifications for message events
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Webhook Setup Instructions */}
                <div className="space-y-4 mb-6">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-lg text-white">
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      One-Click Webhook Setup
                    </h3>
                    <p className="mb-4 text-purple-100">
                      Configure your WhatsApp webhook in seconds with our automated wizard
                    </p>
                    <Button 
                      onClick={() => {
                        if (channels.length === 0) {
                          toast({
                            title: "No channels found",
                            description: "Please add a WhatsApp channel first",
                            variant: "destructive",
                          });
                          return;
                        }
                        setShowWebhookDialog(true);
                        // Pre-select the first channel if available
                        if (channels.length > 0 && !webhookForm.getValues("channelId")) {
                          webhookForm.setValue("channelId", channels[0].id);
                        }
                      }}
                      className="bg-white text-purple-600 hover:bg-purple-50"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Start Quick Setup
                    </Button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                      <Info className="w-4 h-4 mr-2" />
                      Quick Setup Guide
                    </h4>
                    <ol className="text-sm text-blue-800 space-y-2">
                      <li>1. Copy the global webhook URL below</li>
                      <li>2. Go to Facebook Business Manager → WhatsApp → Configuration</li>
                      <li>3. Paste the webhook URL and verify token</li>
                      <li>4. Subscribe to "messages" and "message_status" fields</li>
                      <li>5. All your WhatsApp channels will receive events through this single webhook</li>
                    </ol>
                  </div>
                </div>



                {webhooksLoading ? (
                  <Loading />
                ) : channels.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-4">No WhatsApp channels configured yet</p>
                    <p className="text-sm text-gray-400 mb-4">Create a channel first to set up webhooks</p>
                    <Button onClick={() => navigate('/settings?tab=channels')}>
                      Go to Channels
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">

                    {/* Global Webhook Information */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-3">Global Webhook URL</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700 mb-2">
                          Use this single webhook URL for all your WhatsApp Business accounts:
                        </p>
                        <code className="bg-white px-3 py-2 rounded text-sm block break-all mb-3">
                          {window.location.origin}/webhook/d420e261-9c12-4cee-9d65-253cda8ab4bc
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const url = `${window.location.origin}/webhook/d420e261-9c12-4cee-9d65-253cda8ab4bc`;
                            navigator.clipboard.writeText(url);
                            toast({
                              title: "Webhook URL copied",
                              description: "Paste this in your WhatsApp Business configuration",
                            });
                          }}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy URL
                        </Button>
                      </div>
                    </div>

                    {/* Webhook Configuration Status - Only show button if no active webhook */}
                    {webhookConfigs.length === 0 && (
                      <div className="text-center py-8 border border-gray-200 rounded-lg">
                        <Webhook className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-600 font-medium mb-2">No Webhook Configuration Saved</p>
                        <p className="text-sm text-gray-500 mb-4">Save your webhook configuration to track its status</p>
                        <Button onClick={() => setShowWebhookDialog(true)} variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Save Webhook Configuration
                        </Button>
                      </div>
                    )}

                    {webhookConfigs.map((config) => (
                      <div key={config.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-medium text-gray-900">
                                Global Webhook Configuration
                              </h3>
                              <Badge className={config.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                <Webhook className="w-3 h-3 mr-1" />
                                {config.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                              <div>
                                <strong>Webhook URL:</strong> 
                                <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">
                                  {config.webhookUrl}
                                </code>
                              </div>
                              <div className="flex items-center gap-2">
                                <strong>Verify Token:</strong>
                                <code className="bg-yellow-100 px-2 py-1 rounded text-xs font-mono">
                                  {config.verifyToken}
                                </code>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    navigator.clipboard.writeText(config.verifyToken);
                                    toast({
                                      title: "Verify token copied!",
                                      description: "Use this exact token in Facebook Business Manager",
                                    });
                                  }}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              <div>
                                <strong>Events:</strong> {(config.events as string[]).join(', ')}
                              </div>
                              <div>
                                <strong>Last Ping:</strong> {config.lastPingAt ? new Date(config.lastPingAt).toLocaleString() : 'Never'}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(config.webhookUrl);
                                toast({
                                  title: "Webhook URL copied",
                                  description: config.webhookUrl,
                                });
                              }}
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              Copy URL
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this webhook configuration?')) {
                                  fetch(`/api/whatsapp/webhooks/${config.id}`, { method: 'DELETE' })
                                    .then(() => {
                                      toast({
                                        title: "Webhook deleted",
                                        description: "Webhook configuration has been removed",
                                      });
                                      refetchWebhookConfigs();
                                    })
                                    .catch(() => {
                                      toast({
                                        title: "Error",
                                        description: "Failed to delete webhook configuration",
                                        variant: "destructive",
                                      });
                                    });
                                }
                              }}
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

            {/* Webhook Dialog */}
            <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Configure Webhook</DialogTitle>
                  <DialogDescription>
                    Set up webhook to receive real-time message events
                  </DialogDescription>
                </DialogHeader>
                <Form {...webhookForm}>
                  <form onSubmit={webhookForm.handleSubmit(handleWebhookSubmit)} className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Your global webhook URL (for all WhatsApp channels):</strong>
                      </p>
                      <code className="bg-white px-3 py-2 rounded text-sm block break-all">
                        {window.location.origin}/webhook/d420e261-9c12-4cee-9d65-253cda8ab4bc
                      </code>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          const url = `${window.location.origin}/webhook/d420e261-9c12-4cee-9d65-253cda8ab4bc`;
                          navigator.clipboard.writeText(url);
                          toast({
                            title: "Webhook URL copied",
                            description: "Paste this in Facebook Business Manager",
                          });
                        }}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy URL
                      </Button>
                      <p className="text-xs text-gray-600 mt-2">
                        Use this single URL for all your WhatsApp Business accounts. Events from all channels will be received here.
                      </p>
                    </div>
                    <FormField
                      control={webhookForm.control}
                      name="webhookUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Webhook URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://your-domain.com/webhook" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            URL where WhatsApp will send event notifications
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={webhookForm.control}
                      name="verifyToken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Verify Token</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input 
                                placeholder="Auto-generated secure token" 
                                {...field} 
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  const newToken = generateSecureToken();
                                  field.onChange(newToken);
                                  toast({
                                    title: "Token regenerated",
                                    description: "A new secure token has been generated",
                                  });
                                }}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            </div>
                          </FormControl>
                          <FormDescription>
                            <span className="text-yellow-600 font-medium">Important:</span> Copy this token and use it in Facebook Business Manager<br />
                            <span className="text-muted-foreground">Max 100 characters • Auto-generated for security</span>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                      <strong className="text-yellow-800">⚠️ Facebook Webhook Setup Tips:</strong>
                      <ul className="mt-2 space-y-1 text-yellow-700">
                        <li>• Copy the webhook URL above and paste it in Facebook's "Callback URL" field</li>
                        <li>• Enter your verify token in BOTH Facebook and here (must match exactly)</li>
                        <li>• Click "Verify and save" in Facebook first</li>
                        <li>• Then save the configuration here in WhatsWay</li>
                      </ul>
                    </div>
                    <FormField
                      control={webhookForm.control}
                      name="appSecret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>App Secret (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="password"
                              placeholder="Optional app secret for signature verification" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={webhookForm.control}
                      name="events"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subscribe to Events</FormLabel>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {[
                              { value: "messages", label: "Messages" },
                              { value: "message_status", label: "Message Status" },
                              { value: "message_reads", label: "Message Reads" },
                              { value: "message_reactions", label: "Reactions" }
                            ].map((event) => (
                              <div key={event.value} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={event.value}
                                  checked={field.value.includes(event.value)}
                                  onChange={(e) => {
                                    const newValue = e.target.checked
                                      ? [...field.value, event.value]
                                      : field.value.filter(v => v !== event.value);
                                    field.onChange(newValue);
                                  }}
                                  className="rounded"
                                />
                                <label htmlFor={event.value} className="text-sm text-gray-700">
                                  {event.label}
                                </label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowWebhookDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createWebhookMutation.isPending}>
                        {createWebhookMutation.isPending ? "Saving..." : "Save Configuration"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  API Keys & Integrations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* OpenAI Integration */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">OpenAI ChatGPT</h3>
                      <p className="text-sm text-gray-600">AI-powered chatbot responses</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key
                      </label>
                      <Input 
                        type="password" 
                        placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        defaultValue="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Model
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent">
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        System Instructions
                      </label>
                      <Textarea 
                        rows={3}
                        placeholder="You are a helpful customer service assistant..."
                        defaultValue="You are a helpful customer service assistant for our business. Be friendly, professional, and concise in your responses."
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="ai-enabled" defaultChecked />
                      <label htmlFor="ai-enabled" className="text-sm text-gray-700">
                        Enable AI responses
                      </label>
                    </div>
                  </div>
                </div>

                {/* External API Keys */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">External Integrations</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CRM API Key
                      </label>
                      <Input type="password" placeholder="Enter your CRM API key" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Analytics Webhook URL
                      </label>
                      <Input placeholder="https://your-analytics-service.com/webhook" />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    toast({
                      title: "Settings saved",
                      description: "API settings have been saved successfully.",
                    });
                  }} 
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save API Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Team Management
                  </CardTitle>
                  <Button>
                    <User className="w-4 h-4 mr-2" />
                    Invite Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Member
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Active
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-white">JD</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">John Doe</div>
                              <div className="text-sm text-gray-500">john@company.com</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className="bg-purple-100 text-purple-800">Admin</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">2 minutes ago</td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <SettingsIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Profile Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <Input defaultValue="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input type="email" defaultValue="john@company.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <Input defaultValue="Acme Corp" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <Input type="password" placeholder="Enter current password" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <Input type="password" placeholder="Enter new password" />
                  </div>
                  <Button onClick={handleSaveSettings} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Update Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="w-5 h-5 mr-2" />
                    Notification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">New Messages</h4>
                      <p className="text-sm text-gray-500">Get notified when you receive new messages</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Campaign Updates</h4>
                      <p className="text-sm text-gray-500">Notifications about campaign status changes</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">System Alerts</h4>
                      <p className="text-sm text-gray-500">Important system notifications and alerts</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Weekly Reports</h4>
                      <p className="text-sm text-gray-500">Receive weekly performance reports</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Marketing Updates</h4>
                      <p className="text-sm text-gray-500">Product updates and feature announcements</p>
                    </div>
                    <Switch />
                  </div>
                  <Button onClick={handleSaveSettings} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Test Connection Dialog */}
        <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test WhatsApp Connection</DialogTitle>
              <DialogDescription>
                Send a test message to verify your WhatsApp channel configuration
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="test-phone">Test Phone Number</Label>
                <Input
                  id="test-phone"
                  value={testPhoneNumber}
                  onChange={(e) => setTestPhoneNumber(e.target.value)}
                  placeholder="919310797700"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter phone number with country code (without + sign)
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTestDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (testingChannelId) {
                    testChannelMutation.mutate({
                      id: testingChannelId,
                      testPhone: testPhoneNumber,
                    });
                  }
                }}
                disabled={testChannelMutation.isPending}
              >
                {testChannelMutation.isPending ? "Sending..." : "Send Test Message"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
