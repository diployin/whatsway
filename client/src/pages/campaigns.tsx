import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useChannelContext } from "@/contexts/channel-context";
import { CampaignStatistics } from "@/components/campaigns/CampaignStatistics";
import { CampaignsTable } from "@/components/campaigns/CampaignsTable";
import { CampaignDetailsDialog } from "@/components/campaigns/CampaignDetailsDialog";
import { CreateCampaignDialog } from "@/components/campaigns/CreateCampaignDialog";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";

export default function Campaigns() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { selectedChannel } = useChannelContext();
  const { user } = useAuth();
  const userId = user?.id;
  const userRole = user?.role;

  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [campaignType, setCampaignType] = useState<string>("");

  // Pagination state
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: activeChannel } = useQuery({
    queryKey: ["/api/channels/active"],
  });

  const channelId = activeChannel?.id;

  // Fetch campaigns
  const { data: campaignResponse, isLoading: campaignsLoading } = useQuery({
    queryKey: ["campaigns", userId, userRole, page],
    queryFn: async () => {
      let res;
      if (userRole === "superadmin") {
        res = await fetch(`/api/campaigns?page=${page}&limit=${limit}`, {
          credentials: "include",
        });
      } else {
        res = await fetch("/api/getCampaignsByUserId", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, page, limit }),
        });
      }

      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: !!userId,
  });

  const campaigns = campaignResponse?.data || [];
  const total = campaignResponse?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Fetch templates
  const { data: templates = [] } = useQuery({
    queryKey: ["/api/getTemplateByUserId", userId, channelId], // <-- channelId add kiya
    enabled: !!userId && !!channelId, // <-- dono available honi chahiye
    queryFn: async () => {
      // New API call
      const response = await api.getTemplates(channelId);
      const data = await response.json();

      // Return clean array
      return Array.isArray(data) ? data : [];
    },
  });

  // Fetch contacts
  const { data: contactsResponse } = useQuery({
    queryKey: ["/api/user/contacts", userId],
    enabled: createDialogOpen && !!selectedChannel && !!userId,
    queryFn: async () => {
      const res = await fetch(`/api/user/contacts/${userId}`, {
        method: "GET",
        credentials: "include",
        headers: { "x-channel-id": selectedChannel?.id || "" },
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });
  const contacts = contactsResponse?.data || [];

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) =>
      apiRequest("POST", "/api/campaigns", campaignData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setCreateDialogOpen(false);
      toast({
        title: "Campaign created",
        description: "Your campaign has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update campaign status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      apiRequest("PATCH", `/api/campaigns/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast({
        title: "Status updated",
        description: "Campaign status has been updated",
      });
    },
  });

  // Delete campaign
  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: string) =>
      apiRequest("DELETE", `/api/campaigns/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast({
        title: "Campaign deleted",
        description: "Campaign has been deleted successfully",
      });
    },
  });

  // Handle create campaign
  const handleCreateCampaign = async (campaignData: any) => {
    const {
      selectedTemplate,
      selectedContacts,
      csvData,
      campaignType,
      scheduledTime,
      autoRetry,
    } = campaignData;

    if (!selectedTemplate)
      return toast({
        title: "Error",
        description: "Please select a template",
        variant: "destructive",
      });
    if (!selectedChannel?.id)
      return toast({
        title: "Error",
        description: "Please select a channel",
        variant: "destructive",
      });

    let recipientCount = 0;
    if (campaignType === "contacts") recipientCount = selectedContacts.length;
    if (campaignType === "csv") recipientCount = csvData.length;

    if (recipientCount === 0)
      return toast({
        title: "Error",
        description: "No recipients selected",
        variant: "destructive",
      });

    createCampaignMutation.mutate({
      ...campaignData,
      channelId: selectedChannel.id,
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      templateLanguage: selectedTemplate.language,
      status: scheduledTime ? "scheduled" : "active",
      scheduledAt: scheduledTime || null,
      contactGroups: campaignType === "contacts" ? selectedContacts : [],
      csvData: campaignType === "csv" ? csvData : [],
      recipientCount,
      type: "marketing",
      apiType: "mm_lite",
      campaignType,
      variableMapping: campaignData.variableMapping || {},
      autoRetry,
    });
  };

  // Update status & delete handlers
  const handleUpdateStatus = (id: string, status: string) =>
    updateStatusMutation.mutate({ id, status });
  const handleDeleteCampaign = (id: string) => {
    if (confirm("Are you sure you want to delete this campaign?"))
      deleteCampaignMutation.mutate(id);
  };

  if (campaignsLoading)
    return (
      <div className="flex items-center justify-center h-96">
        Loading campaigns...
      </div>
    );

  return (
    <div className="container mx-auto">
      <Header
        title={t("campaigns.title")}
        subtitle={t("campaigns.subtitle")}
        action={
          userRole !== "superadmin"
            ? {
                label: t("campaigns.createCampaign"),
                onClick: () => setCreateDialogOpen(true),
              }
            : undefined
        }
      />

      <div className="px-4 py-4">
        <CampaignStatistics campaigns={campaigns} />
      </div>

      <div className="px-4 py-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("campaigns.allCampaigns")}</CardTitle>
            <CardDescription>{t("campaigns.listDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <CampaignsTable
              campaigns={campaigns}
              onViewCampaign={setSelectedCampaign}
              onUpdateStatus={handleUpdateStatus}
              onDeleteCampaign={handleDeleteCampaign}
            />

            {/* Pagination */}
            {campaigns && campaigns.length >= 0 ? (
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            ) : (
              ""
            )}
          </CardContent>
        </Card>
      </div>

      <CreateCampaignDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        templates={templates}
        contacts={contacts}
        onCreateCampaign={handleCreateCampaign}
        isCreating={createCampaignMutation.isPending}
      />

      <CampaignDetailsDialog
        campaign={selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
      />
    </div>
  );
}
