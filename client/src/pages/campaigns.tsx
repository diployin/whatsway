import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Send, Pause, Play, BarChart, Users, FileSpreadsheet, Code, Clock, CheckCircle, XCircle, AlertCircle, Eye, Download, Trash2, Calendar, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useChannelContext } from "@/contexts/channel-context";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

export function Campaigns() {
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [campaignType, setCampaignType] = useState<"contacts" | "csv" | "api">("contacts");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [variableMapping, setVariableMapping] = useState<Record<string, string>>({});
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [scheduledTime, setScheduledTime] = useState("");
  const [autoRetry, setAutoRetry] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { selectedChannel } = useChannelContext();
  
  // Log selected channel for debugging
  useEffect(() => {
    console.log("Selected channel in campaigns:", selectedChannel);
  }, [selectedChannel]);

  // Fetch campaigns
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/campaigns"],
    enabled: !!selectedChannel,
    queryFn: async () => {
      const res = await fetch("/api/campaigns", {
        credentials: "include",
        headers: {
          "x-channel-id": selectedChannel?.id || "",
        },
      });
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      return res.json();
    },
  });

  // Fetch templates for campaign creation
  const { data: templates = [] } = useQuery({
    queryKey: ["/api/templates", selectedChannel?.id],
    enabled: createDialogOpen && !!selectedChannel,
    queryFn: async () => {
      const res = await fetch("/api/templates", {
        credentials: "include",
        headers: {
          "x-channel-id": selectedChannel?.id || "",
        },
      });
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      return res.json();
    },
  });

  // Fetch contacts for contacts-based campaigns
  const { data: contacts = [] } = useQuery({
    queryKey: ["/api/contacts"],
    enabled: createDialogOpen && campaignType === "contacts",
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      return await apiRequest("POST", "/api/campaigns", campaignData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      setCreateDialogOpen(false);
      toast({
        title: "Campaign created",
        description: "Your campaign has been created successfully",
      });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update campaign status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/campaigns/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Status updated",
        description: "Campaign status has been updated",
      });
    },
  });

  // Delete campaign mutation
  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/campaigns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campaign deleted",
        description: "Campaign has been deleted successfully",
      });
    },
  });

  const resetForm = () => {
    setSelectedTemplate(null);
    setVariableMapping({});
    setSelectedContacts([]);
    setCsvData([]);
    setScheduledTime("");
    setAutoRetry(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n').map(row => row.split(','));
      const headers = rows[0];
      const data = rows.slice(1).map(row => {
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header.trim()] = row[index]?.trim() || '';
        });
        return obj;
      });
      setCsvData(data);
    };
    reader.readAsText(file);
  };

  const extractTemplateVariables = (template: any) => {
    const variables: string[] = [];
    const regex = /\{\{(\d+)\}\}/g;
    
    if (template?.body) {
      let match;
      while ((match = regex.exec(template.body)) !== null) {
        variables.push(match[1]);
      }
    }
    
    return variables;
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      ["name", "phone", "email", "custom_field_1", "custom_field_2"],
      ["John Doe", "+1234567890", "john@example.com", "Value 1", "Value 2"],
      ["Jane Smith", "+0987654321", "jane@example.com", "Value 3", "Value 4"],
      ["Example User", "+1122334455", "example@email.com", "Value 5", "Value 6"]
    ];
    
    const csvContent = sampleData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'campaign_contacts_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleCreateCampaign = async (formData: any) => {
    if (!selectedTemplate) {
      toast({
        title: "Error",
        description: "Please select a template",
        variant: "destructive",
      });
      return;
    }

    if (!selectedChannel || !selectedChannel.id) {
      console.error("No selected channel:", selectedChannel);
      toast({
        title: "Error",
        description: "Please select a channel from the top navigation",
        variant: "destructive",
      });
      return;
    }

    let recipientCount = 0;
    if (campaignType === "contacts") {
      recipientCount = selectedContacts.length;
      if (recipientCount === 0) {
        toast({
          title: "Error",
          description: "Please select at least one contact",
          variant: "destructive",
        });
        return;
      }
    } else if (campaignType === "csv") {
      recipientCount = csvData.length;
      if (recipientCount === 0) {
        toast({
          title: "Error",
          description: "Please upload a CSV file with contacts",
          variant: "destructive",
        });
        return;
      }
    }

    const campaignData = {
      ...formData,
      channelId: selectedChannel.id,
      campaignType,
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      templateLanguage: selectedTemplate.language,
      variableMapping,
      status: scheduledTime ? "scheduled" : "active",
      scheduledAt: scheduledTime || null,
      contactGroups: campaignType === "contacts" ? selectedContacts : [],
      csvData: campaignType === "csv" ? csvData : [],
      recipientCount,
      type: "marketing", // Always marketing as requested
      apiType: "mm_lite", // Always MM Lite as requested
      autoRetry,
    };

    console.log("Creating campaign with data:", campaignData);
    createCampaignMutation.mutate(campaignData);
  };

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

  if (campaignsLoading) {
    return <div className="flex items-center justify-center h-96">Loading campaigns...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">Create and manage your WhatsApp marketing campaigns</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>
                Choose your campaign type and configure the details
              </DialogDescription>
            </DialogHeader>

            <Tabs value={campaignType} onValueChange={(v) => setCampaignType(v as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="contacts" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Contacts
                </TabsTrigger>
                <TabsTrigger value="csv" className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  CSV Import
                </TabsTrigger>
                <TabsTrigger value="api" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  API Based
                </TabsTrigger>
              </TabsList>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleCreateCampaign(Object.fromEntries(formData));
              }} className="space-y-4 mt-4">
                {/* Common fields */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Campaign Name</Label>
                    <Input id="name" name="name" required />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="autoRetry" 
                      checked={autoRetry}
                      onCheckedChange={(checked) => setAutoRetry(checked as boolean)}
                    />
                    <Label htmlFor="autoRetry" className="flex flex-col">
                      <span className="font-medium">Auto-retry Campaigns</span>
                      <span className="text-sm text-muted-foreground">
                        Boost your campaign reach with our auto-retry feature
                      </span>
                    </Label>
                  </div>

                  <div>
                    <Label>Template</Label>
                    <Select 
                      value={selectedTemplate?.id || ""} 
                      onValueChange={(value) => {
                        const template = templates.find((t: any) => t.id === value);
                        setSelectedTemplate(template);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template: any) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name} ({template.language})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* Template Preview */}
                    {selectedTemplate && (
                      <Card className="mt-3 p-4 bg-gray-50">
                        <h4 className="font-medium mb-2">Template Preview</h4>
                        <div className="space-y-2">
                          {selectedTemplate.header && (
                            <div className="text-sm">
                              <span className="font-medium">Header:</span> {selectedTemplate.header}
                            </div>
                          )}
                          <div className="text-sm">
                            <span className="font-medium">Body:</span>
                            <p className="mt-1 whitespace-pre-wrap">{selectedTemplate.body}</p>
                          </div>
                          {selectedTemplate.footer && (
                            <div className="text-sm">
                              <span className="font-medium">Footer:</span> {selectedTemplate.footer}
                            </div>
                          )}
                        </div>
                      </Card>
                    )}
                  </div>

                  {/* Variable mapping */}
                  {selectedTemplate && extractTemplateVariables(selectedTemplate).length > 0 && (
                    <div className="space-y-2">
                      <Label>Variable Mapping</Label>
                      <div className="space-y-2">
                        {extractTemplateVariables(selectedTemplate).map((variable) => (
                          <div key={variable} className="flex items-center gap-2">
                            <span className="text-sm font-medium w-20">{`{{${variable}}}`}:</span>
                            {campaignType === "csv" ? (
                              <Input
                                placeholder="CSV column name"
                                value={variableMapping[variable] || ""}
                                onChange={(e) => setVariableMapping({
                                  ...variableMapping,
                                  [variable]: e.target.value
                                })}
                              />
                            ) : (
                              <Select
                                value={variableMapping[variable] || ""}
                                onValueChange={(value) => {
                                  if (value === "custom") {
                                    const customValue = prompt("Enter custom text:");
                                    if (customValue) {
                                      setVariableMapping({
                                        ...variableMapping,
                                        [variable]: customValue
                                      });
                                    }
                                  } else {
                                    setVariableMapping({
                                      ...variableMapping,
                                      [variable]: value
                                    });
                                  }
                                }}
                              >
                                <SelectTrigger className="flex-1">
                                  <SelectValue placeholder="Select mapping" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="name">Contact Name</SelectItem>
                                  <SelectItem value="phone">Contact Number</SelectItem>
                                  <SelectItem value="email">Contact Email</SelectItem>
                                  <SelectItem value="custom">Custom Text...</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="scheduledAt">Schedule Campaign (Optional)</Label>
                    <Input 
                      id="scheduledAt" 
                      type="datetime-local" 
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                </div>

                <TabsContent value="contacts" className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Select Contacts</Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedContacts.length === contacts.length && contacts.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedContacts(contacts.map((c: any) => c.id));
                            } else {
                              setSelectedContacts([]);
                            }
                          }}
                        />
                        <Label className="font-normal text-sm">
                          Select All ({contacts.length})
                        </Label>
                      </div>
                    </div>
                    <ScrollArea className="h-64 border rounded-md p-4">
                      {contacts.map((contact: any) => (
                        <div key={contact.id} className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            checked={selectedContacts.includes(contact.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedContacts([...selectedContacts, contact.id]);
                              } else {
                                setSelectedContacts(selectedContacts.filter(id => id !== contact.id));
                              }
                            }}
                          />
                          <Label className="font-normal">
                            {contact.name} ({contact.phone})
                          </Label>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                </TabsContent>

                <TabsContent value="csv" className="space-y-4">
                  <div>
                    <Label htmlFor="csvFile">Upload CSV File</Label>
                    <Input 
                      id="csvFile" 
                      type="file" 
                      accept=".csv"
                      onChange={handleFileUpload}
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      <a 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          downloadSampleCSV();
                        }}
                        className="text-blue-500 hover:underline"
                      >
                        Download sample CSV template
                      </a>
                    </p>
                  </div>
                  
                  {csvData.length > 0 && (
                    <div>
                      <Label>CSV Preview ({csvData.length} rows)</Label>
                      <ScrollArea className="h-64 border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {Object.keys(csvData[0] || {}).map((header) => (
                                <TableHead key={header}>{header}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {csvData.slice(0, 5).map((row, index) => (
                              <TableRow key={index}>
                                {Object.values(row).map((value: any, i) => (
                                  <TableCell key={i}>{value}</TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="api" className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <p className="text-sm text-blue-800">
                      API campaigns allow external applications to trigger messages using your templates.
                      After creating the campaign, you'll receive an API endpoint and key.
                    </p>
                  </div>
                </TabsContent>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createCampaignMutation.isPending}>
                    {scheduledTime ? "Schedule Campaign" : "Start Campaign"}
                  </Button>
                </div>
              </form>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Campaign Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.filter((c: any) => c.status === "active").length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((acc: number, c: any) => acc + (c.sentCount || 0), 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.length > 0 
                ? Math.round(
                    (campaigns.reduce((acc: number, c: any) => acc + (c.deliveredCount || 0), 0) / 
                     campaigns.reduce((acc: number, c: any) => acc + (c.sentCount || 1), 1)) * 100
                  )
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
          <CardDescription>Manage and monitor your campaigns</CardDescription>
        </CardHeader>
        <CardContent>
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
                        onClick={() => setSelectedCampaign(campaign)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {campaign.status === "active" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateStatusMutation.mutate({ id: campaign.id, status: "paused" })}
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {campaign.status === "paused" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateStatusMutation.mutate({ id: campaign.id, status: "active" })}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {campaign.campaignType === "api" && (
                        <Button variant="ghost" size="icon">
                          <Code className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteCampaignMutation.mutate(campaign.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Campaign Details Dialog */}
      {selectedCampaign && (
        <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedCampaign.name}</DialogTitle>
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
                    <div className="text-2xl font-bold">{selectedCampaign.sentCount || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Delivered</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedCampaign.deliveredCount || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Read</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedCampaign.readCount || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Failed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedCampaign.failedCount || 0}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Campaign Info */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Type:</span>
                  <span>{selectedCampaign.campaignType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Template:</span>
                  <span>{selectedCampaign.templateName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <Badge className={getStatusColor(selectedCampaign.status)}>
                    {selectedCampaign.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Created:</span>
                  <span>{format(new Date(selectedCampaign.createdAt), "PPP")}</span>
                </div>
                {selectedCampaign.scheduledAt && (
                  <div className="flex justify-between">
                    <span className="font-medium">Scheduled:</span>
                    <span>{format(new Date(selectedCampaign.scheduledAt), "PPP p")}</span>
                  </div>
                )}
              </div>

              {/* API Details for API campaigns */}
              {selectedCampaign.campaignType === "api" && selectedCampaign.apiEndpoint && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">API Integration Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Endpoint URL</Label>
                      <div className="flex gap-2">
                        <Input value={selectedCampaign.apiEndpoint} readOnly />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigator.clipboard.writeText(selectedCampaign.apiEndpoint)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label>API Key</Label>
                      <div className="flex gap-2">
                        <Input value={selectedCampaign.apiKey} readOnly />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigator.clipboard.writeText(selectedCampaign.apiKey)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Sample Code</Label>
                      <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                        <pre>{`// Send WhatsApp message via API
const response = await fetch('${selectedCampaign.apiEndpoint}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    phone: '+1234567890',
    variables: {
      ${Object.entries(selectedCampaign.variableMapping || {}).map(([key, value]) => 
        `'${value}': 'Your value here'`
      ).join(',\n      ')}
    }
  })
});

const result = await response.json();
console.log(result);`}</pre>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const code = `// Send WhatsApp message via API
const response = await fetch('${selectedCampaign.apiEndpoint}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    phone: '+1234567890',
    variables: {
      ${Object.entries(selectedCampaign.variableMapping || {}).map(([key, value]) => 
        `'${value}': 'Your value here'`
      ).join(',\n      ')}
    }
  })
});

const result = await response.json();
console.log(result);`;
                          navigator.clipboard.writeText(code);
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Code
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedCampaign(null)}>
                  Close
                </Button>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default Campaigns;