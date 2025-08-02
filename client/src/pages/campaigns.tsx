import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Megaphone, 
  Activity, 
  Clock, 
  CheckCircle, 
  Eye,
  Copy,
  Trash2,
  Zap,
  Calendar,
  Upload,
  Users as UsersIcon,
  Send,
  MessageSquare
} from "lucide-react";
import { api } from "@/lib/api";
import type { Campaign, WhatsappChannel, Template } from "@shared/schema";

// Campaign creation form schema
const campaignFormSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  templateId: z.string().min(1, "Template is required"),
  channelId: z.string().min(1, "WhatsApp channel is required"),
  recipientType: z.enum(["contacts", "groups", "csv"]),
  recipientIds: z.array(z.string()).optional(),
  csvData: z.string().optional(),
  scheduledFor: z.string().optional(),
  type: z.enum(["marketing", "transactional", "utility"]),
  templateVariables: z.record(z.string()).optional(),
});

type CampaignFormValues = z.infer<typeof campaignFormSchema>;

export default function Campaigns() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const { toast } = useToast();
  
  // Query for active channel
  const { data: activeChannel } = useQuery({
    queryKey: ["/api/channels/active"],
    queryFn: async () => {
      const response = await fetch("/api/channels/active");
      if (!response.ok) return null;
      return await response.json();
    },
  });

  // Query for campaigns
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["/api/campaigns", activeChannel?.id],
    queryFn: async () => {
      const response = await api.getCampaigns(activeChannel?.id);
      return await response.json();
    },
    enabled: !!activeChannel,
  });

  // Query for WhatsApp channels
  const { data: whatsappChannels } = useQuery({
    queryKey: ["/api/whatsapp/channels"],
  });

  // Query for templates
  const { data: templates } = useQuery({
    queryKey: ["/api/templates", activeChannel?.id],
    queryFn: async () => {
      const response = await api.getTemplates(activeChannel?.id);
      return await response.json();
    },
    enabled: !!activeChannel,
  });

  // Query for contacts and groups
  const { data: contacts } = useQuery({
    queryKey: ["/api/contacts", activeChannel?.id],
    queryFn: async () => {
      const response = await api.getContacts(undefined, activeChannel?.id);
      return await response.json();
    },
    enabled: !!activeChannel,
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (data: CampaignFormValues) => {
      const response = await api.createCampaign(data, activeChannel?.id);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setIsCreateOpen(false);
      form.reset();
      setCsvFile(null);
      toast({
        title: "Campaign created successfully",
        description: "Your campaign has been queued for sending.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create campaign",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form setup
  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      name: "",
      templateId: "",
      channelId: "",
      recipientType: "contacts",
      recipientIds: [],
      type: "marketing",
      templateVariables: {},
    },
  });

  const activeCampaigns = campaigns?.filter((c: Campaign) => c.status === "active").length || 0;
  const scheduledCampaigns = campaigns?.filter((c: Campaign) => c.status === "scheduled").length || 0;
  const completedCampaigns = campaigns?.filter((c: Campaign) => c.status === "completed").length || 0;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        form.setValue("csvData", text);
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: CampaignFormValues) => {
    createCampaignMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex-1 dots-bg">
        <Header title="Campaigns" subtitle="Loading campaigns..." />
        <div className="p-6">
          <Loading size="lg" text="Loading campaigns..." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 dots-bg min-h-screen">
      <Header 
        title="Campaign Management" 
        subtitle="Create and manage your WhatsApp marketing campaigns"
        action={{
          label: "Create Campaign",
          onClick: () => setIsCreateOpen(true)
        }}
      />

      <main className="p-6 space-y-6">
        {/* API Selection Banner */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Choose Your Campaign Type</h3>
                <p className="text-blue-100 text-sm">Select the best API for your campaign goals</p>
              </div>
              <div className="flex space-x-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                  <div className="text-sm font-medium">Cloud API</div>
                  <div className="text-xs text-blue-100">Two-way conversations</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                  <div className="text-sm font-medium">MM Lite API</div>
                  <div className="text-xs text-blue-100">Marketing optimization</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Campaigns</p>
                  <p className="text-2xl font-bold text-gray-900">{campaigns?.length || 0}</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Megaphone className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{activeCampaigns}</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold text-orange-600">{scheduledCampaigns}</p>
                </div>
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completedCampaigns}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Campaigns</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">All Campaigns</Button>
                <Button variant="outline" size="sm">Active</Button>
                <Button variant="outline" size="sm">Scheduled</Button>
                <Button variant="outline" size="sm">Completed</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!campaigns?.length ? (
              <EmptyState
                icon={Megaphone}
                title="No campaigns yet"
                description="You haven't created any campaigns yet. Create your first campaign to start sending WhatsApp messages to your contacts."
                action={{
                  label: "Create First Campaign",
                  onClick: () => setIsCreateOpen(true)
                }}
                className="py-12"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Campaign
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        API Type
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recipients
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Delivery Rate
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {campaigns.map((campaign: Campaign) => {
                      const deliveryRate = campaign.sentCount 
                        ? ((campaign.deliveredCount || 0) / campaign.sentCount) * 100 
                        : 0;
                      
                      return (
                        <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                                <Megaphone className="w-5 h-5 text-green-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {campaign.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {campaign.type} campaign
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge 
                              variant="outline"
                              className={campaign.apiType === "mm_lite" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200"}
                            >
                              {campaign.apiType === "mm_lite" ? "MM Lite" : "Cloud API"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {Array.isArray(campaign.recipients) ? campaign.recipients.length : 0}
                          </td>
                          <td className="px-6 py-4">
                            <Badge 
                              variant={campaign.status === "active" ? "default" : "secondary"}
                              className={
                                campaign.status === "active" ? "bg-green-100 text-green-800" :
                                campaign.status === "completed" ? "bg-gray-100 text-gray-800" :
                                campaign.status === "scheduled" ? "bg-orange-100 text-orange-800" :
                                "bg-gray-100 text-gray-800"
                              }
                            >
                              {campaign.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {campaign.sentCount > 0 ? (
                              <div className="flex items-center">
                                <span className="text-green-600 font-medium">
                                  {deliveryRate.toFixed(1)}%
                                </span>
                                <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-500 h-2 rounded-full" 
                                    style={{ width: `${deliveryRate}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {campaign.createdAt 
                              ? new Date(campaign.createdAt).toLocaleDateString()
                              : "Unknown"
                            }
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" title="View Details">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Clone Campaign">
                                <Copy className="w-4 h-4 text-orange-600" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Delete">
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Create Campaign Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Set up a new WhatsApp campaign using your configured channels and templates
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">Basic Information</h3>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter campaign name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select campaign type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="transactional">Transactional</SelectItem>
                          <SelectItem value="utility">Utility</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* WhatsApp Configuration */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">WhatsApp Configuration</h3>
                
                <FormField
                  control={form.control}
                  name="channelId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp Channel</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select WhatsApp channel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {whatsappChannels?.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No channels configured
                            </SelectItem>
                          ) : (
                            whatsappChannels?.map((channel: WhatsappChannel) => (
                              <SelectItem key={channel.id} value={channel.id}>
                                {channel.name} ({channel.apiType === "cloud" ? "Cloud API" : "MM Lite"})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose the WhatsApp channel to send messages from
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="templateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message Template</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select message template" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {templates?.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No templates available
                            </SelectItem>
                          ) : (
                            templates?.filter((t: Template) => t.status === "approved").map((template: Template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name} ({template.category})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Only approved templates can be used for campaigns
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Recipients */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">Recipients</h3>
                
                <FormField
                  control={form.control}
                  name="recipientType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Recipients</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="space-y-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="contacts" id="contacts" />
                            <Label htmlFor="contacts" className="flex-1 cursor-pointer">
                              <div>
                                <div className="font-medium">Contacts</div>
                                <div className="text-sm text-gray-500">
                                  Select from your saved contacts
                                </div>
                              </div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="groups" id="groups" />
                            <Label htmlFor="groups" className="flex-1 cursor-pointer">
                              <div>
                                <div className="font-medium">Contact Groups</div>
                                <div className="text-sm text-gray-500">
                                  Send to specific contact groups
                                </div>
                              </div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="csv" id="csv" />
                            <Label htmlFor="csv" className="flex-1 cursor-pointer">
                              <div>
                                <div className="font-medium">CSV Upload</div>
                                <div className="text-sm text-gray-500">
                                  Upload a CSV file with phone numbers
                                </div>
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("recipientType") === "csv" && (
                  <FormItem>
                    <FormLabel>Upload CSV File</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-4">
                        <Input
                          type="file"
                          accept=".csv"
                          onChange={handleFileUpload}
                          className="flex-1"
                        />
                        {csvFile && (
                          <Badge variant="outline" className="bg-green-50">
                            <Upload className="w-3 h-3 mr-1" />
                            {csvFile.name}
                          </Badge>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      CSV should contain phone numbers in the first column
                    </FormDescription>
                  </FormItem>
                )}
              </div>

              {/* Schedule */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">Schedule</h3>
                
                <FormField
                  control={form.control}
                  name="scheduledFor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schedule Campaign (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          min={new Date().toISOString().slice(0, 16)}
                        />
                      </FormControl>
                      <FormDescription>
                        Leave empty to send immediately
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createCampaignMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {createCampaignMutation.isPending ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Create Campaign
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
