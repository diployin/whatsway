import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { FileText, Plus, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Template } from "@shared/schema";
import { TemplatesTable } from "@/components/templates/TemplatesTable";
import { TemplatePreview } from "@/components/templates/TemplatePreview";
import { TemplateDialog } from "@/components/templates/TemplateDialog";
import { useAuth } from "@/contexts/auth-context";

export default function Templates() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [showDialog, setShowDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const userRole = user?.role;

  // Fetch active channel
  const { data: activeChannel } = useQuery({
    queryKey: ["/api/channels/active"],
  });

  // // Fetch templates
  // const { data: templates = [], isLoading: templatesLoading } = useQuery<
  //   Template[]
  // >({
  //   queryKey: ["/api/templates"],
  //   enabled: !!activeChannel,
  // });


  // Fetch templates
const { data: templates = [], isLoading: templatesLoading } = useQuery<Template[]>({
  queryKey: ["templates", user?.id, userRole],
  queryFn: async () => {
    let res: Response;

    if (userRole === "superadmin") {
      // Superadmin ke liye: saare templates
      res = await fetch("/api/templates", {
        credentials: "include",
      });
    } else {
      // Normal user ke liye: apne templates
      res = await fetch("/api/getTemplateByUserId", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
    }

    if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
    const json = await res.json();

    // Hamesha array return karo
    if (Array.isArray(json)) return json;
    if (json?.data && Array.isArray(json.data)) return json.data;
    if (json) return [json]; // wrap single object into array
    return [];
  },
  enabled: !!user?.id && !!activeChannel,
});


  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (data: any) => {
      const components = [];

      // Add header component if present
      if (data.header || data.mediaType !== "text") {
        components.push({
          type: "HEADER",
          format:
            data.mediaType === "text" ? "TEXT" : data.mediaType.toUpperCase(),
          text: data.header,
        });
      }

      // Add body component
      components.push({
        type: "BODY",
        text: data.body,
      });

      // Add footer component if present
      if (data.footer) {
        components.push({
          type: "FOOTER",
          text: data.footer,
        });
      }

      // Add buttons component if present
      if (data.buttons && data.buttons.length > 0) {
        components.push({
          type: "BUTTONS",
          buttons: data.buttons.map((button: any) => ({
            type: button.type,
            text: button.text,
            url: button.url,
            phone_number: button.phoneNumber,
          })),
        });
      }

      const payload = {
        name: data.name,
        category: data.category,
        language: data.language,
        components,
        header: data.header,
        body: data.body,
        footer: data.footer,
        channelId: activeChannel?.id,
      };

      if (editingTemplate) {
        return await apiRequest(
          "PATCH",
          `/api/templates/${editingTemplate.id}`,
          payload
        );
      } else {
        return await apiRequest("POST", "/api/templates", payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: editingTemplate ? "Template updated" : "Template created",
        description: editingTemplate
          ? "Your template has been updated successfully."
          : "Your template has been created and submitted for approval.",
      });
      setShowDialog(false);
      setEditingTemplate(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      return await apiRequest("DELETE", `/api/templates/${templateId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Template deleted",
        description: "The template has been deleted successfully.",
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

  // Sync templates mutation
  const syncTemplatesMutation = useMutation({
    mutationFn: async () => {
      if (!activeChannel) throw new Error("No active channel");
      return await apiRequest("POST", `/api/templates/sync`);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Templates synced",
        description: `Synced ${data.synced || 0} templates from WhatsApp`,
      });
    },
    onError: (error) => {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowDialog(true);
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setShowDialog(true);
  };

  const handleDuplicateTemplate = (template: Template) => {
    const duplicatedTemplate = {
      ...template,
      name: `${template.name}_copy`,
    };
    setEditingTemplate(duplicatedTemplate);
    setShowDialog(true);
  };

  const handleDeleteTemplate = (template: Template) => {
    if (
      confirm(
        `Are you sure you want to delete the template "${template.name}"?`
      )
    ) {
      deleteTemplateMutation.mutate(template.id);
    }
  };

  const handleSyncTemplates = () => {
    syncTemplatesMutation.mutate();
  };

  if (!activeChannel) {
    return (
      <div className="flex-1 dots-bg min-h-screen">
        <Header
          title="Templates"
          subtitle="manage WhatsApp message templates"
        />
        <main className="p-6">
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">
                  Please select or create a WhatsApp channel first
                </p>
                <Button
                  className="mt-4"
                  onClick={() => (window.location.href = "/settings")}
                >
                  Go to Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 dots-bg min-h-screen">
      <Header
        title="Templates"
        subtitle="Create and manage WhatsApp message templates"
      />

      <main className="p-6">
        <Card>
        <CardHeader>
  <div className="flex items-center justify-between">
    <CardTitle className="flex items-center">
      <FileText className="w-5 h-5 mr-2" />
      Message Templates
    </CardTitle>

    {/* Buttons sirf normal users ke liye */}
    {userRole !== "superadmin" && (
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSyncTemplates}
          disabled={syncTemplatesMutation.isPending}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${
              syncTemplatesMutation.isPending ? "animate-spin" : ""
            }`}
          />
          Sync from WhatsApp
        </Button>
        <Button onClick={handleCreateTemplate}>
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>
    )}
  </div>
</CardHeader>

<CardContent>
  {templatesLoading ? (
    <Loading />
  ) : userRole === "superadmin" ? (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 bg-white rounded-lg shadow-sm">
        <thead className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
          <tr>
            <th className="py-3 px-4 border-b">Name</th>
            <th className="py-3 px-4 border-b">Category</th>
            <th className="py-3 px-4 border-b">Status</th>
            <th className="py-3 px-4 border-b">Body</th>
            <th className="py-3 px-4 border-b">Created At</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((template) => (
            <tr
              key={template.id}
              className="hover:bg-gray-50 transition-colors text-sm text-gray-700"
            >
              <td className="py-3 px-4 border-b">{template.name}</td>
              <td className="py-3 px-4 border-b">{template.category}</td>
              <td className="py-3 px-4 border-b">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    template.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : template.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {template.status}
                </span>
              </td>
              <td className="py-3 px-4 border-b">{template.body}</td>
              <td className="py-3 px-4 border-b">
                {new Date(template.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <TemplatesTable
      templates={templates}
      onViewTemplate={setSelectedTemplate}
      onEditTemplate={handleEditTemplate}
      onDuplicateTemplate={handleDuplicateTemplate}
      onDeleteTemplate={handleDeleteTemplate}
    />
  )}
</CardContent>
</Card>
      </main>

      {/* Template Preview */}
      {selectedTemplate && (
        <TemplatePreview
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
        />
      )}

      {/* Template Dialog */}
      <TemplateDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        template={editingTemplate}
        onSubmit={(data) => createTemplateMutation.mutate(data)}
        isSubmitting={createTemplateMutation.isPending}
      />
    </div>
  );
}
