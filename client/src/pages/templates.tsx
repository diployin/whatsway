import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  FileText, 
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Hash,
  AlertCircle,
  Copy,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Template } from "@shared/schema";

export default function Templates() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["/api/templates"],
  });

  const filteredTemplates = templates.filter((template: Template) => {
    if (selectedCategory !== "all" && template.category !== selectedCategory) {
      return false;
    }
    return true;
  });

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
    navigator.clipboard.writeText(template.content);
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
        {/* Category Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4">
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
                    <div className="flex gap-2">
                      {getCategoryBadge(template.category)}
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
                      {template.content}
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
                <p className="text-sm whitespace-pre-wrap">{selectedTemplate.content}</p>
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
    </div>
  );
}