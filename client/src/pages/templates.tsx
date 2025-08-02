import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "@/components/layout/header";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  FileText, 
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Hash,
  AlertCircle,
  Copy,
  MessageSquare,
  Plus,
  MoreVertical,
  Edit,
  Trash,
  Smartphone,
  Type,
  Link,
  Image,
  Video,
  FileText as FileIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Template, InsertTemplate } from "@shared/schema";
import { insertTemplateSchema } from "@shared/schema";
import { z } from "zod";

// WhatsApp template form schema matching database structure
const templateFormSchema = insertTemplateSchema.omit({ 
  id: true, 
  createdAt: true, 
  usage_count: true 
});

type TemplateFormData = z.infer<typeof templateFormSchema>;

// Component for WhatsApp-style preview
function WhatsAppPreview({ template }: { template: Partial<Template> }) {
  const renderTextWithVariables = (text: string) => {
    if (!text) return null;
    const parts = text.split(/({{\d+}})/g);
    return parts.map((part, index) => {
      if (part.match(/^{{\d+}}$/)) {
        return <span key={index} className="font-semibold text-blue-600">{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <div className="max-w-sm mx-auto">
        {/* Phone Frame */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Chat Header */}
          <div className="bg-green-600 text-white p-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <p className="font-medium">Business Name</p>
              <p className="text-xs opacity-80">WhatsApp Business Account</p>
            </div>
          </div>
          
          {/* Chat Body */}
          <div className="bg-gray-50 p-4 min-h-[300px]">
            <div className="bg-white rounded-lg p-3 shadow-sm max-w-[80%]">
              {/* Header */}
              {template.header && (
                <div className="mb-2">
                  <p className="font-bold text-gray-900">{template.header}</p>
                </div>
              )}
              
              {/* Body */}
              {template.body && (
                <div className="text-gray-700 text-sm whitespace-pre-wrap">
                  {renderTextWithVariables(template.body)}
                </div>
              )}
              
              {/* Footer */}
              {template.footer && (
                <p className="text-xs text-gray-500 mt-2">{template.footer}</p>
              )}
              
              {/* Buttons */}
              {template.buttons && Array.isArray(template.buttons) && template.buttons.length > 0 && (
                <div className="mt-3 space-y-2">
                  {(template.buttons as any[]).map((button: any, index) => (
                    <button key={index} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded text-sm font-medium transition-colors">
                      {button.text || button}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-2">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Templates() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form for creating/editing templates
  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: "",
      body: "",
      language: "en_US",
      category: "MARKETING",
      status: "PENDING",
      header: "",
      footer: "",
      buttons: [],
      variables: [],
    },
  });

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["/api/templates"],
  });

  // Mutations
  const createTemplateMutation = useMutation({
    mutationFn: async (data: TemplateFormData) => {
      // Extract variables from body text
      const matches = data.body.match(/{{(\d+)}}/g) || [];
      const variables: string[] = [];
      matches.forEach((match: string) => {
        const num = parseInt(match.replace('{{', '').replace('}}', ''));
        variables[num - 1] = `Variable ${num}`;
      });

      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          variables,
        }),
      });
      if (!response.ok) throw new Error("Failed to create template");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Template created",
        description: "Your template has been created successfully.",
      });
      setShowFormDialog(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error creating template",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TemplateFormData }) => {
      // Extract variables from body text
      const matches = data.body.match(/{{(\d+)}}/g) || [];
      const variables: string[] = [];
      matches.forEach((match: string) => {
        const num = parseInt(match.replace('{{', '').replace('}}', ''));
        variables[num - 1] = `Variable ${num}`;
      });

      const response = await fetch(`/api/templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          variables,
        }),
      });
      if (!response.ok) throw new Error("Failed to update template");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Template updated",
        description: "Your template has been updated successfully.",
      });
      setShowFormDialog(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error updating template",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/templates/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete template");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Template deleted",
        description: "The template has been deleted successfully.",
      });
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error deleting template",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredTemplates = templates.filter((template: Template) => {
    if (selectedCategory !== "all" && template.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  // Helper functions
  const openCreateDialog = () => {
    setIsEditMode(false);
    setSelectedTemplate(null);
    form.reset({
      name: "",
      body: "",
      language: "en_US",
      category: "MARKETING",
      status: "PENDING",
      header: "",
      footer: "",
      buttons: [],
      variables: [],
    });
    setShowFormDialog(true);
  };

  const openEditDialog = (template: Template) => {
    setIsEditMode(true);
    setSelectedTemplate(template);
    form.reset({
      name: template.name,
      body: template.body,
      language: template.language || "en_US",
      category: template.category,
      status: template.status || "PENDING",
      header: template.header || "",
      footer: template.footer || "",
      buttons: template.buttons || [],
      variables: template.variables || [],
    });
    setShowFormDialog(true);
  };

  const handleDelete = (id: string) => {
    setTemplateToDelete(id);
    setShowDeleteDialog(true);
  };

  const onSubmit = (data: TemplateFormData) => {
    if (isEditMode && selectedTemplate) {
      updateTemplateMutation.mutate({ id: selectedTemplate.id, data });
    } else {
      createTemplateMutation.mutate(data);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "MARKETING":
        return <Badge className="bg-purple-100 text-purple-800">Marketing</Badge>;
      case "UTILITY":
        return <Badge className="bg-blue-100 text-blue-800">Utility</Badge>;
      case "AUTHENTICATION":
        return <Badge className="bg-indigo-100 text-indigo-800">Authentication</Badge>;
      default:
        return <Badge>{category}</Badge>;
    }
  };

  const renderVariables = (template: Template) => {
    if (!template.variables || template.variables.length === 0) return null;
    
    return (
      <div className="mt-3">
        <p className="text-sm font-medium text-gray-700 mb-2">Variables:</p>
        <div className="flex flex-wrap gap-2">
          {(template.variables as string[]).map((variable, index) => (
            <Badge key={index} variant="outline" className="text-xs bg-gray-50">
              <Hash className="w-3 h-3 mr-1" />{`{{${index + 1}}}`} {variable}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  const copyTemplateContent = (template: Template) => {
    navigator.clipboard.writeText(template.body);
    toast({
      title: "Copied!",
      description: "Template content copied to clipboard",
    });
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
        title="Message Templates" 
        subtitle="Pre-approved WhatsApp message templates for your campaigns"
      />

      <main className="p-6 space-y-6">
        {/* Category Filter and Add Button */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <span className="font-medium text-gray-700">Filter by category:</span>
              <div className="flex gap-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                >
                  All ({templates.length})
                </Button>
                <Button
                  variant={selectedCategory === "MARKETING" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("MARKETING")}
                >
                  Marketing
                </Button>
                <Button
                  variant={selectedCategory === "UTILITY" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("UTILITY")}
                >
                  Utility
                </Button>
                <Button
                  variant={selectedCategory === "AUTHENTICATION" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("AUTHENTICATION")}
                >
                  Authentication
                </Button>
              </div>
            </div>
            <Button 
              onClick={openCreateDialog}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Template
            </Button>
          </div>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent>
              <EmptyState
                icon={FileText}
                title="No templates found"
                description="No templates match your selected filters."
                className="py-12"
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex gap-2 items-center">
                      {getCategoryBadge(template.category)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(template)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Template
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(template.id)}
                            className="text-red-600"
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            Delete Template
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusBadge(template.status)}
                    <Badge variant="outline" className="text-xs">
                      {template.language}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">
                      {template.body}
                    </p>
                  </div>
                  
                  {renderVariables(template)}
                  
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowPreviewDialog(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyTemplateContent(template)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Use
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>
              {selectedTemplate?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="flex gap-2">
                {getCategoryBadge(selectedTemplate.category)}
                {getStatusBadge(selectedTemplate.status)}
                <Badge variant="outline" className="text-xs">
                  {selectedTemplate.language}
                </Badge>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{selectedTemplate.body}</p>
              </div>
              
              {renderVariables(selectedTemplate)}
              
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800 font-medium">Template Usage</p>
                    <p className="text-xs text-amber-700 mt-1">
                      This template has been pre-approved by WhatsApp. When using it, replace the variable placeholders {`{{1}}, {{2}}, etc.`} with actual values in the order shown above.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
                  Close
                </Button>
                <Button onClick={() => copyTemplateContent(selectedTemplate)}>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy Content
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Form Dialog for Create/Edit */}
      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Template" : "Create New Template"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update your WhatsApp message template" : "Create a pre-approved WhatsApp message template"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Form Section */}
            <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., welcome_message" {...field} />
                        </FormControl>
                        <FormDescription>
                          Use lowercase letters, numbers, and underscores only
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="MARKETING">Marketing</SelectItem>
                              <SelectItem value="UTILITY">Utility</SelectItem>
                              <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language</FormLabel>
                          <Select value={field.value || "en_US"} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="en_US">English (US)</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="pt_BR">Portuguese (BR)</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="header"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Header (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Welcome to our service!" {...field} />
                        </FormControl>
                        <FormDescription>
                          Displayed as bold text at the top of the message
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Body Text *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Hi {{1}}, welcome to {{2}}! We're excited to have you on board."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Use {"{{1}}"}, {"{{2}}"}, etc. for variables that will be replaced with actual values
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="footer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Footer (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Reply STOP to unsubscribe" {...field} />
                        </FormControl>
                        <FormDescription>
                          Small text displayed at the bottom
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowFormDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isEditMode 
                        ? (updateTemplateMutation.isPending ? "Updating..." : "Update Template")
                        : (createTemplateMutation.isPending ? "Creating..." : "Create Template")
                      }
                    </Button>
                  </div>
                </form>
              </Form>
            </div>

            {/* Preview Section */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-gray-700">Live Preview</h3>
              <WhatsAppPreview template={form.watch()} />
              
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800 font-medium">WhatsApp Guidelines</p>
                    <ul className="text-xs text-amber-700 mt-1 space-y-1">
                      <li>• Templates must be approved by WhatsApp before use</li>
                      <li>• Marketing templates require opt-in consent</li>
                      <li>• Variables must be replaced with actual values when sending</li>
                      <li>• Avoid promotional content in utility templates</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (templateToDelete) {
                  deleteTemplateMutation.mutate(templateToDelete);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}