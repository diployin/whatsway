import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
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
  DialogFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  FileText as FileIcon,
  Phone,
  RefreshCw,
  Globe,
  X,
  Send,
  User,
  Building,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Template, InsertTemplate } from "@shared/schema";
import { insertTemplateSchema } from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";

// Enhanced form schema with buttons and validation
const templateFormSchema = z.object({
  name: z.string()
    .min(1, "Template name is required")
    .max(512, "Template name must be less than 512 characters")
    .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores allowed"),
  category: z.enum(["MARKETING", "UTILITY", "AUTHENTICATION"]),
  language: z.string().default("en_US"),
  mediaType: z.enum(["text", "image", "video", "carousel"]).default("text"),
  mediaUrl: z.string().optional(),
  carouselCards: z.array(z.object({
    imageUrl: z.string(),
    title: z.string().max(60),
    body: z.string().max(160),
    buttons: z.array(z.object({
      type: z.enum(["URL", "QUICK_REPLY"]),
      text: z.string().max(20),
      url: z.string().optional(),
    })).max(2),
  })).optional(),
  header: z.string().max(60, "Header must be less than 60 characters").optional().default(""),
  body: z.string()
    .min(1, "Message body is required")
    .max(1024, "Body must be less than 1024 characters"),
  footer: z.string().max(60, "Footer must be less than 60 characters").optional().default(""),
  buttons: z.array(z.object({
    type: z.enum(["QUICK_REPLY", "URL", "PHONE_NUMBER"]),
    text: z.string().min(1).max(20, "Button text must be less than 20 characters"),
    url: z.string().url().optional(),
    phoneNumber: z.string().optional(),
  })).max(3, "Maximum 3 buttons allowed").default([]),
  variables: z.array(z.string()).default([]),
  status: z.string().default("PENDING"),
});

type TemplateFormData = z.infer<typeof templateFormSchema>;

// Sample data for variable replacement
const SAMPLE_DATA: Record<string, string> = {
  "{{1}}": "John Doe",
  "{{2}}": "WhatsWay",
  "{{3}}": "123-456-7890",
  "{{4}}": "john@example.com",
  "{{5}}": "Today",
  "{{6}}": "$99.99",
  "{{7}}": "ABC123",
  "{{8}}": "New York",
};

// Enhanced WhatsApp preview component
function WhatsAppPreview({ template, sampleData = SAMPLE_DATA }: { 
  template: Partial<TemplateFormData>, 
  sampleData?: Record<string, string> 
}) {
  const replaceVariables = (text: string) => {
    if (!text) return "";
    return text.replace(/{{(\d+)}}/g, (match) => {
      return sampleData[match] || match;
    });
  };

  const renderTextWithVariables = (text: string) => {
    if (!text) return null;
    const replacedText = replaceVariables(text);
    const parts = replacedText.split(/(\{\{\d+\}\})/g);
    
    return parts.map((part, index) => {
      if (part.match(/^{{\d+}}$/)) {
        return <span key={index} className="font-semibold text-blue-600">{part}</span>;
      }
      return part;
    });
  };

  const currentTime = format(new Date(), 'h:mm a');

  return (
    <div className="bg-gradient-to-b from-teal-900 to-teal-700 p-6 rounded-xl">
      <div className="max-w-sm mx-auto">
        {/* Phone Frame */}
        <div className="bg-black rounded-[2.5rem] p-2">
          <div className="bg-white rounded-[2rem] overflow-hidden">
            {/* Status Bar */}
            <div className="bg-gray-900 text-white px-6 py-1 text-xs flex justify-between items-center">
              <span>9:41 AM</span>
              <div className="flex gap-1">
                <div className="w-4 h-3 bg-white rounded-sm"></div>
                <div className="w-4 h-3 bg-white rounded-sm"></div>
                <div className="w-4 h-3 bg-white rounded-sm"></div>
              </div>
            </div>

            {/* WhatsApp Header */}
            <div className="bg-[#075e54] text-white p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <Building className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Business Name</p>
                <p className="text-xs opacity-80">WhatsApp Business Account</p>
              </div>
              <Phone className="w-5 h-5" />
              <Video className="w-5 h-5" />
              <MoreVertical className="w-5 h-5" />
            </div>
            
            {/* Chat Body */}
            <div 
              className="bg-[#e5ddd5] p-4 min-h-[400px] relative"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.3'%3E%3Cpath d='M0 0h20v20H0z'/%3E%3Cpath d='M20 20h20v20H20z'/%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: '40px 40px'
              }}
            >
              {/* Business Info Message */}
              <div className="text-center mb-4">
                <div className="bg-[#fdf4c5] text-gray-700 text-xs px-3 py-1 rounded-lg inline-block">
                  <Lock className="w-3 h-3 inline mr-1" />
                  Messages are end-to-end encrypted
                </div>
              </div>

              {/* Template Message */}
              <div className="flex gap-2 mb-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <Building className="w-5 h-5 text-gray-600" />
                </div>
                <div className="max-w-[80%]">
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* Media Display */}
                    {template.mediaType === "image" && template.mediaUrl && (
                      <div className="relative">
                        <img 
                          src={template.mediaUrl} 
                          alt="Template media" 
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23e5e7eb'/%3E%3Cpath d='M70 85v30l25-15z' fill='%236b7280'/%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                    )}
                    {template.mediaType === "video" && template.mediaUrl && (
                      <div className="relative bg-gray-900">
                        <div className="w-full h-48 flex items-center justify-center">
                          <div className="text-white">
                            <Video className="w-12 h-12 mx-auto mb-2" />
                            <p className="text-sm">Video Message</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Header */}
                    {template.header && template.mediaType === "text" && (
                      <div className="p-3 border-b">
                        <p className="font-bold text-gray-900">
                          {renderTextWithVariables(template.header)}
                        </p>
                      </div>
                    )}
                    
                    {/* Body */}
                    <div className="p-3">
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {renderTextWithVariables(template.body || "")}
                      </p>
                    </div>
                    
                    {/* Footer */}
                    {template.footer && (
                      <div className="px-3 pb-2">
                        <p className="text-xs text-gray-500">
                          {renderTextWithVariables(template.footer)}
                        </p>
                      </div>
                    )}
                    
                    {/* Buttons */}
                    {template.buttons && template.buttons.length > 0 && (
                      <div className="border-t p-2 space-y-1">
                        {template.buttons.map((button, index) => (
                          <button
                            key={index}
                            className="w-full p-2 text-center text-blue-600 hover:bg-gray-50 rounded transition-colors flex items-center justify-center gap-2"
                          >
                            {button.type === "URL" && <Globe className="w-4 h-4" />}
                            {button.type === "PHONE_NUMBER" && <Phone className="w-4 h-4" />}
                            <span className="font-medium">{button.text}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Time */}
                    <div className="px-3 pb-1 flex items-center justify-end gap-1">
                      <span className="text-xs text-gray-500">{currentTime}</span>
                      <CheckCircle className="w-3 h-3 text-blue-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Input Bar */}
            <div className="bg-white border-t p-2 flex items-center gap-2">
              <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center gap-2">
                <span className="text-gray-500 text-sm">Type a message</span>
              </div>
              <div className="w-10 h-10 bg-[#075e54] rounded-full flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Templates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();

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

  const { fields: buttonFields, append: appendButton, remove: removeButton } = useFieldArray({
    control: form.control,
    name: "buttons",
  });

  // Queries
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
        title: "Error",
        description: "Failed to create template. Please try again.",
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
        title: "Error",
        description: "Failed to update template. Please try again.",
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
      setTemplateToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete template. Please try again.",
        variant: "destructive",
      });
    },
  });

  const submitToWhatsAppMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const response = await fetch(`/api/templates/${templateId}/submit`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to submit template");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Template submitted",
        description: "Template has been submitted to WhatsApp for approval.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit template to WhatsApp.",
        variant: "destructive",
      });
    },
  });

  const syncTemplatesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/templates/sync", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to sync templates");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Templates synced",
        description: data.message || "Template statuses have been synced with WhatsApp.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to sync templates. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter templates
  const filteredTemplates = (templates as Template[]).filter((template: Template) => {
    if (searchQuery && !template.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !template.body.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedCategory !== "all" && template.category !== selectedCategory) {
      return false;
    }
    if (selectedLanguage !== "all" && template.language !== selectedLanguage) {
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
      mediaType: "text",
      mediaUrl: undefined,
      carouselCards: undefined,
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
      category: template.category as any,
      status: template.status || "PENDING",
      header: template.header || "",
      footer: template.footer || "",
      buttons: (template.buttons as any[]) || [],
      variables: (template.variables as string[]) || [],
      mediaType: (template.mediaType as "text" | "image" | "video" | "carousel") || "text",
      mediaUrl: template.mediaUrl || undefined,
      carouselCards: (template.carouselCards as any[]) || undefined,
    });
    setShowFormDialog(true);
  };

  const onSubmit = (data: TemplateFormData) => {
    if (isEditMode && selectedTemplate) {
      updateTemplateMutation.mutate({ id: selectedTemplate.id, data });
    } else {
      createTemplateMutation.mutate(data);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" />Draft</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category?.toUpperCase()) {
      case 'MARKETING':
        return <Badge className="bg-purple-100 text-purple-800">Marketing</Badge>;
      case 'UTILITY':
        return <Badge className="bg-blue-100 text-blue-800">Utility</Badge>;
      case 'AUTHENTICATION':
        return <Badge className="bg-orange-100 text-orange-800">Authentication</Badge>;
      default:
        return <Badge>{category}</Badge>;
    }
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
      <div className="min-h-screen bg-gray-50">
        <Header title="Message Templates" />
        <div className="p-8">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Message Templates" />
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Message Templates</h1>
            <p className="text-gray-600">Create and manage WhatsApp-approved message templates</p>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="MARKETING">Marketing</SelectItem>
                  <SelectItem value="UTILITY">Utility</SelectItem>
                  <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Languages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="en_US">English (US)</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="pt_BR">Portuguese (BR)</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={() => syncTemplatesMutation.mutate()}
                disabled={syncTemplatesMutation.isPending}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${syncTemplatesMutation.isPending ? 'animate-spin' : ''}`} />
                Sync
              </Button>
              <Button onClick={openCreateDialog} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
          </div>

          {/* Templates Grid */}
          {filteredTemplates.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No templates found"
              description="Create your first template to start sending messages"
              action={{
                label: "Create Template",
                onClick: openCreateDialog
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template: Template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedTemplate(template);
                            setShowPreviewDialog(true);
                          }}>
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(template)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyTemplateContent(template)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Content
                          </DropdownMenuItem>
                          {template.status === 'draft' && (
                            <DropdownMenuItem onClick={() => submitToWhatsAppMutation.mutate(template.id)}>
                              <Send className="w-4 h-4 mr-2" />
                              Submit to WhatsApp
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => {
                              setTemplateToDelete(template.id);
                              setShowDeleteDialog(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex gap-2 mb-2">
                      {getStatusBadge(template.status)}
                      {getCategoryBadge(template.category)}
                      <Badge variant="outline">
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
                    {(template.variables as string[])?.length > 0 && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                        <Hash className="w-4 h-4" />
                        <span>{(template.variables as string[]).length} variables</span>
                      </div>
                    )}
                    {(template.buttons as any[])?.length > 0 && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                        <MessageSquare className="w-4 h-4" />
                        <span>{(template.buttons as any[]).length} buttons</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Preview Dialog */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Template Preview</DialogTitle>
              <DialogDescription>
                See how your template will appear in WhatsApp
              </DialogDescription>
            </DialogHeader>
            {selectedTemplate && (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Template Details</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Name:</span>
                        <span className="text-sm font-medium">{selectedTemplate.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        {getStatusBadge(selectedTemplate.status)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Category:</span>
                        {getCategoryBadge(selectedTemplate.category)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Language:</span>
                        <Badge variant="outline">{selectedTemplate.language}</Badge>
                      </div>
                    </div>
                  </div>

                  {(selectedTemplate.variables as string[])?.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Variables</Label>
                      <div className="mt-2 space-y-1">
                        {(selectedTemplate.variables as string[]).map((variable: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Badge variant="outline" className="font-mono">
                              {`{{${index + 1}}}`}
                            </Badge>
                            <span className="text-gray-600">→</span>
                            <span className="font-medium">{SAMPLE_DATA[`{{${index + 1}}}`] || variable}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">WhatsApp Preview</Label>
                  <WhatsAppPreview 
                    template={{
                      name: selectedTemplate.name,
                      body: selectedTemplate.body,
                      category: selectedTemplate.category as any,
                      language: selectedTemplate.language || "en_US",
                      header: selectedTemplate.header || "",
                      footer: selectedTemplate.footer || "",
                      buttons: (selectedTemplate.buttons as any[]) || [],
                      variables: (selectedTemplate.variables as string[]) || [],
                      status: selectedTemplate.status || "PENDING"
                    }} 
                  />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Form Dialog */}
        <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Edit Template" : "Create New Template"}</DialogTitle>
              <DialogDescription>
                {isEditMode ? "Update your WhatsApp message template" : "Create a pre-approved WhatsApp message template"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-6 overflow-y-auto max-h-[calc(90vh-200px)] pr-2">
              {/* Form Section */}
              <div className="space-y-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template Name *</FormLabel>
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
                            <FormLabel>Category *</FormLabel>
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
                            <FormLabel>Language *</FormLabel>
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

                    {/* Media Type Selection */}
                    <FormField
                      control={form.control}
                      name="mediaType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Media Type *</FormLabel>
                          <Select value={field.value || "text"} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select media type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="text">
                                <div className="flex items-center gap-2">
                                  <Type className="w-4 h-4" />
                                  <span>Text Only</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="image">
                                <div className="flex items-center gap-2">
                                  <Image className="w-4 h-4" />
                                  <span>Image</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="video">
                                <div className="flex items-center gap-2">
                                  <Video className="w-4 h-4" />
                                  <span>Video</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="carousel">
                                <div className="flex items-center gap-2">
                                  <FileIcon className="w-4 h-4" />
                                  <span>Carousel</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Media Upload for Image/Video */}
                    {(form.watch("mediaType") === "image" || form.watch("mediaType") === "video") && (
                      <FormField
                        control={form.control}
                        name="mediaUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Upload {form.watch("mediaType") === "image" ? "Image" : "Video"}</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Input
                                  type="file"
                                  accept={form.watch("mediaType") === "image" ? "image/*" : "video/*"}
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      try {
                                        // Get upload URL
                                        const response = await fetch("/api/media/upload-url", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ contentType: file.type }),
                                        });
                                        const { uploadURL } = await response.json();

                                        // Upload file
                                        await fetch(uploadURL, {
                                          method: "PUT",
                                          body: file,
                                          headers: { "Content-Type": file.type },
                                        });

                                        // Set the URL in the form
                                        field.onChange(uploadURL.split("?")[0]);
                                        toast({
                                          title: "Upload successful",
                                          description: `${form.watch("mediaType")} uploaded successfully`,
                                        });
                                      } catch (error) {
                                        toast({
                                          title: "Upload failed",
                                          description: "Failed to upload media file",
                                          variant: "destructive",
                                        });
                                      }
                                    }
                                  }}
                                />
                                {field.value && (
                                  <div className="mt-2 p-2 bg-gray-50 rounded">
                                    <p className="text-sm text-gray-600">Media uploaded successfully</p>
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormDescription>
                              Upload {form.watch("mediaType") === "image" ? "an image (JPEG, PNG)" : "a video (MP4)"} for your template
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="header"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Header (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Welcome to our service!" 
                              {...field} 
                              maxLength={60}
                              disabled={form.watch("mediaType") !== "text"}
                            />
                          </FormControl>
                          <FormDescription>
                            {form.watch("mediaType") !== "text" 
                              ? "Header text is disabled when using media"
                              : `Bold text at the top (max 60 chars) - ${field.value?.length || 0}/60`}
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
                          <FormLabel>Message Body *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Hi {{1}}, welcome to {{2}}! We're excited to have you on board."
                              className="min-h-[120px]"
                              {...field}
                              maxLength={1024}
                            />
                          </FormControl>
                          <FormDescription>
                            Use {"{{1}}"}, {"{{2}}"}, etc. for variables (max 1024 chars) - {field.value?.length || 0}/1024
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
                            <Input 
                              placeholder="e.g., Reply STOP to unsubscribe" 
                              {...field}
                              maxLength={60}
                            />
                          </FormControl>
                          <FormDescription>
                            Small text at the bottom (max 60 chars) - {field.value?.length || 0}/60
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Buttons Section */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label>Buttons (Optional)</Label>
                        {buttonFields.length < 3 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => appendButton({ type: "QUICK_REPLY", text: "", url: "", phoneNumber: "" })}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Button
                          </Button>
                        )}
                      </div>
                      
                      {buttonFields.map((field, index) => (
                        <div key={field.id} className="p-3 border rounded-lg space-y-3">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm">Button {index + 1}</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeButton(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={form.control}
                              name={`buttons.${index}.type`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Type</FormLabel>
                                  <Select value={field.value} onValueChange={field.onChange}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="QUICK_REPLY">Quick Reply</SelectItem>
                                      <SelectItem value="URL">URL</SelectItem>
                                      <SelectItem value="PHONE_NUMBER">Phone</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`buttons.${index}.text`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Button Text</FormLabel>
                                  <FormControl>
                                    <Input {...field} maxLength={20} placeholder="e.g., Learn More" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          {form.watch(`buttons.${index}.type`) === "URL" && (
                            <FormField
                              control={form.control}
                              name={`buttons.${index}.url`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">URL</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="https://example.com" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          )}
                          
                          {form.watch(`buttons.${index}.type`) === "PHONE_NUMBER" && (
                            <FormField
                              control={form.control}
                              name={`buttons.${index}.phoneNumber`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Phone Number</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="+1234567890" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                      ))}
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
                        <li>• Maximum 3 buttons per template</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowFormDialog(false);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button 
                onClick={form.handleSubmit(onSubmit)}
                disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isEditMode 
                  ? (updateTemplateMutation.isPending ? "Updating..." : "Update Template")
                  : (createTemplateMutation.isPending ? "Creating..." : "Create Template")
                }
              </Button>
            </DialogFooter>
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
    </div>
  );
}