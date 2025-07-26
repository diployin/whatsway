import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Edit, 
  Copy, 
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Smartphone
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Template } from "@shared/schema";
import { TEMPLATE_CATEGORIES, TEMPLATE_STATUS } from "@/lib/constants";

export default function Templates() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["/api/templates"],
    queryFn: async () => {
      const response = await api.getTemplates();
      return await response.json();
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data: any) => api.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      setIsCreating(false);
      toast({
        title: "Template created",
        description: "Your template has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create template. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => api.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Template deleted",
        description: "The template has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete template. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateTemplate = (formData: FormData) => {
    const templateData = {
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      language: formData.get("language") as string || "en_US",
      header: formData.get("header") as string,
      body: formData.get("body") as string,
      footer: formData.get("footer") as string,
      variables: [],
      buttons: [],
    };
    createTemplateMutation.mutate(templateData);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteTemplateMutation.mutate(id);
    }
  };

  const filteredTemplates = templates?.filter((template: Template) => {
    const categoryMatch = selectedCategory === "all" || template.category === selectedCategory;
    const statusMatch = selectedStatus === "all" || template.status === selectedStatus;
    return categoryMatch && statusMatch;
  }) || [];

  const categoryStats = {
    marketing: templates?.filter((t: Template) => t.category === "marketing").length || 0,
    transactional: templates?.filter((t: Template) => t.category === "transactional").length || 0,
    authentication: templates?.filter((t: Template) => t.category === "authentication").length || 0,
    utility: templates?.filter((t: Template) => t.category === "utility").length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex-1 dots-bg">
        <Header title="Templates" subtitle="Loading templates..." />
        <div className="p-6">
          <Loading size="lg" text="Loading templates..." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 dots-bg min-h-screen">
      <Header 
        title="Template Management" 
        subtitle="Create and manage WhatsApp message templates"
        action={{
          label: "Create Template",
          onClick: () => setIsCreating(true)
        }}
      />

      <main className="p-6 space-y-6">
        {/* Template Categories */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Marketing</p>
                  <p className="text-2xl font-bold text-purple-600">{categoryStats.marketing}</p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Transactional</p>
                  <p className="text-2xl font-bold text-blue-600">{categoryStats.transactional}</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Authentication</p>
                  <p className="text-2xl font-bold text-orange-600">{categoryStats.authentication}</p>
                </div>
                <div className="p-2 bg-orange-50 rounded-lg">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Utility</p>
                  <p className="text-2xl font-bold text-green-600">{categoryStats.utility}</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Template Editor & Preview */}
        {(isCreating || editingTemplate) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Template Editor */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingTemplate ? "Edit Template" : "Create Template"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleCreateTemplate(formData);
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name
                    </label>
                    <Input
                      name="name"
                      placeholder="e.g., welcome_message"
                      defaultValue={editingTemplate?.name || ""}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <Select name="category" defaultValue={editingTemplate?.category || "marketing"}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="transactional">Transactional</SelectItem>
                        <SelectItem value="authentication">Authentication</SelectItem>
                        <SelectItem value="utility">Utility</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <Select name="language" defaultValue={editingTemplate?.language || "en_US"}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en_US">English (US)</SelectItem>
                        <SelectItem value="es_ES">Spanish (ES)</SelectItem>
                        <SelectItem value="pt_BR">Portuguese (BR)</SelectItem>
                        <SelectItem value="fr_FR">French (FR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Header (Optional)
                    </label>
                    <Input
                      name="header"
                      placeholder="Add a header text"
                      defaultValue={editingTemplate?.header || ""}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Body Message
                    </label>
                    <Textarea
                      name="body"
                      rows={4}
                      placeholder="Your message content with {{variables}}"
                      defaultValue={editingTemplate?.body || ""}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Footer (Optional)
                    </label>
                    <Input
                      name="footer"
                      placeholder="Add a footer text"
                      defaultValue={editingTemplate?.footer || ""}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setIsCreating(false);
                        setEditingTemplate(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={createTemplateMutation.isPending}
                    >
                      {createTemplateMutation.isPending ? "Creating..." : "Create Template"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* WhatsApp Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smartphone className="w-5 h-5 mr-2" />
                  WhatsApp Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mx-auto max-w-sm bg-gray-100 rounded-3xl p-4">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                    {/* WhatsApp Header */}
                    <div className="bg-green-600 text-white px-4 py-3 flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">YB</span>
                      </div>
                      <div>
                        <div className="font-semibold text-sm">Your Business</div>
                        <div className="text-xs opacity-75">Online</div>
                      </div>
                    </div>
                    
                    {/* Message Preview */}
                    <div className="p-4">
                      <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3 max-w-xs">
                        <div className="text-sm text-gray-800 space-y-2">
                          <div className="font-semibold">Sample Header</div>
                          <div className="leading-relaxed">
                            Hi there! This is a preview of your template message. 
                            Variables like {{name}} will be replaced with actual values.
                          </div>
                          <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                            Sample footer text
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 mt-2">10:30 AM</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Templates List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Templates</CardTitle>
              <div className="flex space-x-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="transactional">Transactional</SelectItem>
                    <SelectItem value="authentication">Authentication</SelectItem>
                    <SelectItem value="utility">Utility</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!filteredTemplates.length ? (
              <EmptyState
                icon={FileText}
                title="No templates found"
                description="You haven't created any templates yet. Create your first template to start sending structured WhatsApp messages."
                action={{
                  label: "Create First Template",
                  onClick: () => setIsCreating(true)
                }}
                className="py-12"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Template
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Language
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usage
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
                    {filteredTemplates.map((template: Template) => (
                      <tr key={template.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              template.category === "marketing" ? "bg-purple-50" :
                              template.category === "transactional" ? "bg-blue-50" :
                              template.category === "authentication" ? "bg-orange-50" :
                              "bg-green-50"
                            }`}>
                              <FileText className={`w-5 h-5 ${
                                template.category === "marketing" ? "text-purple-600" :
                                template.category === "transactional" ? "text-blue-600" :
                                template.category === "authentication" ? "text-orange-600" :
                                "text-green-600"
                              }`} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {template.name}
                              </div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {template.body}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge 
                            variant="outline"
                            className={
                              template.category === "marketing" ? "bg-purple-50 text-purple-700 border-purple-200" :
                              template.category === "transactional" ? "bg-blue-50 text-blue-700 border-blue-200" :
                              template.category === "authentication" ? "bg-orange-50 text-orange-700 border-orange-200" :
                              "bg-green-50 text-green-700 border-green-200"
                            }
                          >
                            {template.category}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {template.language || "en_US"}
                        </td>
                        <td className="px-6 py-4">
                          <Badge 
                            variant="outline"
                            className={
                              template.status === "approved" ? "bg-green-50 text-green-700 border-green-200" :
                              template.status === "pending" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                              template.status === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
                              "bg-gray-50 text-gray-700 border-gray-200"
                            }
                          >
                            <div className="flex items-center">
                              {template.status === "approved" && <CheckCircle className="w-3 h-3 mr-1" />}
                              {template.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                              {template.status === "rejected" && <XCircle className="w-3 h-3 mr-1" />}
                              {template.status}
                            </div>
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {template.usage_count || 0} times
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {template.createdAt 
                            ? new Date(template.createdAt).toLocaleDateString()
                            : "Unknown"
                          }
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Edit Template"
                              onClick={() => setEditingTemplate(template)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Clone Template">
                              <Copy className="w-4 h-4 text-orange-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Delete Template"
                              onClick={() => handleDeleteTemplate(template.id)}
                              disabled={deleteTemplateMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
