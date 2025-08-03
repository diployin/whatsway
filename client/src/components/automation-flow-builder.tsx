import { useState, useEffect, useCallback, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  Clock, 
  FileText, 
  MessageCircle, 
  Hash,
  Trash2,
  X,
  Save,
  ChevronDown,
  ChevronUp,
  Bot,
  Plus,
  GripVertical
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AutomationNode {
  id: string;
  type: "user_reply" | "time_gap" | "send_template" | "custom_reply" | "keyword_catch";
  position: number;
  config: any;
  nextNodeId?: string | null;
}

interface AutomationFlowBuilderProps {
  automation?: any;
  onClose: () => void;
}

const nodeTypeIcons = {
  user_reply: MessageSquare,
  time_gap: Clock,
  send_template: FileText,
  custom_reply: MessageCircle,
  keyword_catch: Hash,
};

const nodeTypeLabels = {
  user_reply: "User Reply",
  time_gap: "Time Gap",
  send_template: "Send Template",
  custom_reply: "Custom Reply",
  keyword_catch: "Keyword Catch",
};

const nodeTypeDescriptions = {
  user_reply: "Wait for user to reply",
  time_gap: "Wait for a specific time",
  send_template: "Send a WhatsApp template",
  custom_reply: "Send a custom message",
  keyword_catch: "Detect specific keywords",
};

export default function AutomationFlowBuilder({ automation, onClose }: AutomationFlowBuilderProps) {
  const [name, setName] = useState(automation?.name || "");
  const [description, setDescription] = useState(automation?.description || "");
  const [trigger, setTrigger] = useState(automation?.trigger || "new_conversation");
  const [nodes, setNodes] = useState<AutomationNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showAddNodeDialog, setShowAddNodeDialog] = useState(false);
  const [addingAfterNode, setAddingAfterNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch templates for template selection
  const { data: templates = [] } = useQuery({
    queryKey: ["/api/templates"],
  });

  // Load existing automation data
  useEffect(() => {
    if (automation?.id) {
      fetch(`/api/automations/${automation.id}`, { credentials: "include" })
        .then(res => res.json())
        .then(data => {
          if (data.nodes) {
            setNodes(data.nodes.sort((a: any, b: any) => a.position - b.position));
          }
        });
    }
  }, [automation]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = automation?.id 
        ? `/api/automations/${automation.id}`
        : "/api/automations";
      const method = automation?.id ? "PUT" : "POST";
      
      return apiRequest(method, url, data);
    },
    onSuccess: () => {
      toast({ title: automation?.id ? "Automation updated" : "Automation created" });
      onClose();
    },
    onError: () => {
      toast({
        title: "Failed to save automation",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      toast({ title: "Please enter a name", variant: "destructive" });
      return;
    }

    const automationData = {
      automation: {
        name,
        description,
        trigger,
        triggerConfig: {},
        status: automation?.status || "active",
      },
      nodes: nodes.map((node, index) => ({
        id: node.id,
        type: node.type,
        position: index,
        config: node.config,
        nextNodeId: nodes[index + 1]?.id || null,
      })),
    };

    saveMutation.mutate(automationData);
  };

  const addNode = (type: AutomationNode["type"]) => {
    const newNode: AutomationNode = {
      id: `node-${Date.now()}`,
      type,
      position: nodes.length,
      config: getDefaultConfig(type),
    };

    if (addingAfterNode) {
      const afterIndex = nodes.findIndex(n => n.id === addingAfterNode);
      if (afterIndex >= 0) {
        const newNodes = [...nodes];
        newNodes.splice(afterIndex + 1, 0, newNode);
        setNodes(newNodes.map((n, i) => ({ ...n, position: i })));
      }
    } else {
      setNodes([...nodes, newNode]);
    }

    setShowAddNodeDialog(false);
    setAddingAfterNode(null);
  };

  const getDefaultConfig = (type: AutomationNode["type"]) => {
    switch (type) {
      case "user_reply":
        return { waitTime: 300 }; // 5 minutes default
      case "time_gap":
        return { delay: 60 }; // 1 minute default
      case "send_template":
        return { templateId: "", variables: [] };
      case "custom_reply":
        return { message: "" };
      case "keyword_catch":
        return { keywords: [], action: "continue" };
      default:
        return {};
    }
  };

  const updateNodeConfig = (nodeId: string, config: any) => {
    setNodes(nodes.map(node => 
      node.id === nodeId ? { ...node, config } : node
    ));
  };

  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId).map((n, i) => ({ ...n, position: i })));
    setSelectedNode(null);
  };

  const handleDragStart = (e: React.DragEvent, nodeId: string) => {
    setDraggedNode(nodeId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetNodeId: string) => {
    e.preventDefault();
    if (!draggedNode || draggedNode === targetNodeId) return;

    const draggedIndex = nodes.findIndex(n => n.id === draggedNode);
    const targetIndex = nodes.findIndex(n => n.id === targetNodeId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newNodes = [...nodes];
    const [removed] = newNodes.splice(draggedIndex, 1);
    newNodes.splice(targetIndex, 0, removed);

    setNodes(newNodes.map((n, i) => ({ ...n, position: i })));
    setDraggedNode(null);
  };

  const renderNodeConfig = (node: AutomationNode) => {
    switch (node.type) {
      case "user_reply":
        return (
          <div className="space-y-3">
            <div>
              <Label>Wait Time (seconds)</Label>
              <Input
                type="number"
                value={node.config.waitTime || 300}
                onChange={(e) => updateNodeConfig(node.id, { ...node.config, waitTime: parseInt(e.target.value) })}
                placeholder="300"
                data-testid={`input-waittime-${node.id}`}
              />
              <p className="text-xs text-muted-foreground mt-1">
                How long to wait for user reply before continuing
              </p>
            </div>
          </div>
        );

      case "time_gap":
        return (
          <div className="space-y-3">
            <div>
              <Label>Delay (seconds)</Label>
              <Input
                type="number"
                value={node.config.delay || 60}
                onChange={(e) => updateNodeConfig(node.id, { ...node.config, delay: parseInt(e.target.value) })}
                placeholder="60"
                data-testid={`input-delay-${node.id}`}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Wait time before proceeding to next action
              </p>
            </div>
          </div>
        );

      case "send_template":
        return (
          <div className="space-y-3">
            <div>
              <Label>Template</Label>
              <Select
                value={node.config.templateId}
                onValueChange={(value) => updateNodeConfig(node.id, { ...node.config, templateId: value })}
              >
                <SelectTrigger data-testid={`select-template-${node.id}`}>
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
            </div>
            <div>
              <Label>Variables (comma-separated)</Label>
              <Input
                value={node.config.variables?.join(", ") || ""}
                onChange={(e) => updateNodeConfig(node.id, { 
                  ...node.config, 
                  variables: e.target.value.split(",").map(v => v.trim()).filter(Boolean) 
                })}
                placeholder="Variable1, Variable2"
                data-testid={`input-variables-${node.id}`}
              />
            </div>
          </div>
        );

      case "custom_reply":
        return (
          <div className="space-y-3">
            <div>
              <Label>Message</Label>
              <Textarea
                value={node.config.message || ""}
                onChange={(e) => updateNodeConfig(node.id, { ...node.config, message: e.target.value })}
                placeholder="Enter your custom message..."
                rows={4}
                data-testid={`textarea-message-${node.id}`}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Custom text message to send
              </p>
            </div>
          </div>
        );

      case "keyword_catch":
        return (
          <div className="space-y-3">
            <div>
              <Label>Keywords (comma-separated)</Label>
              <Input
                value={node.config.keywords?.join(", ") || ""}
                onChange={(e) => updateNodeConfig(node.id, { 
                  ...node.config, 
                  keywords: e.target.value.split(",").map(k => k.trim()).filter(Boolean) 
                })}
                placeholder="yes, no, help, stop"
                data-testid={`input-keywords-${node.id}`}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Keywords to detect in user messages
              </p>
            </div>
            <div>
              <Label>Action</Label>
              <Select
                value={node.config.action || "continue"}
                onValueChange={(value) => updateNodeConfig(node.id, { ...node.config, action: value })}
              >
                <SelectTrigger data-testid={`select-action-${node.id}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="continue">Continue Flow</SelectItem>
                  <SelectItem value="stop">Stop Flow</SelectItem>
                  <SelectItem value="jump">Jump to Step</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <h2 className="text-lg font-semibold">
              {automation ? "Edit Automation" : "Create Automation"}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Flow Builder */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Automation name"
                  data-testid="input-automation-name"
                />
              </div>
              <div>
                <Label>Trigger</Label>
                <Select value={trigger} onValueChange={setTrigger}>
                  <SelectTrigger data-testid="select-trigger">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new_conversation">New Conversation</SelectItem>
                    <SelectItem value="keyword">Keyword Detected</SelectItem>
                    <SelectItem value="message_received">Message Received</SelectItem>
                    <SelectItem value="campaign_sent">Campaign Sent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this automation do?"
                rows={2}
                data-testid="textarea-description"
              />
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {/* Start Node */}
              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <span className="font-medium">Start</span>
                  <Badge variant="outline" className="ml-auto">{trigger}</Badge>
                </div>
              </Card>

              {/* Flow Nodes */}
              {nodes.map((node, index) => {
                const Icon = nodeTypeIcons[node.type];
                const isSelected = selectedNode === node.id;

                return (
                  <div key={node.id} className="relative">
                    {/* Connection Line */}
                    {index > 0 && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-border" />
                    )}

                    <Card
                      className={cn(
                        "p-4 cursor-pointer transition-colors",
                        isSelected && "ring-2 ring-primary"
                      )}
                      onClick={() => setSelectedNode(isSelected ? null : node.id)}
                      draggable
                      onDragStart={(e) => handleDragStart(e, node.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, node.id)}
                      data-testid={`card-node-${node.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                        <Icon className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{nodeTypeLabels[node.type]}</h4>
                              <p className="text-sm text-muted-foreground">
                                {nodeTypeDescriptions[node.type]}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {isSelected ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNode(node.id);
                                }}
                                data-testid={`button-delete-node-${node.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Node Configuration */}
                          {isSelected && (
                            <div className="mt-4 pt-4 border-t">
                              {renderNodeConfig(node)}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>

                    {/* Add Node Button */}
                    <div className="flex justify-center -mb-2 relative z-10">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 bg-background"
                        onClick={() => {
                          setAddingAfterNode(node.id);
                          setShowAddNodeDialog(true);
                        }}
                        data-testid={`button-add-after-${node.id}`}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Step
                      </Button>
                    </div>
                  </div>
                );
              })}

              {/* Add First Node */}
              {nodes.length === 0 && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAddingAfterNode(null);
                      setShowAddNodeDialog(true);
                    }}
                    data-testid="button-add-first-node"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Step
                  </Button>
                </div>
              )}

              {/* End Node */}
              {nodes.length > 0 && (
                <Card className="p-4 bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="h-5 w-5 rounded-full border-2 border-current" />
                    <span className="font-medium">End</span>
                  </div>
                </Card>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending ? "Saving..." : "Save Automation"}
            </Button>
          </div>
        </div>
      </div>

      {/* Add Node Dialog */}
      <Dialog open={showAddNodeDialog} onOpenChange={setShowAddNodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Step</DialogTitle>
            <DialogDescription>
              Choose the type of action for this step
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            {Object.entries(nodeTypeLabels).map(([type, label]) => {
              const Icon = nodeTypeIcons[type as keyof typeof nodeTypeIcons];
              return (
                <Button
                  key={type}
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => addNode(type as AutomationNode["type"])}
                  data-testid={`button-add-${type}`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">{label}</div>
                    <div className="text-sm text-muted-foreground">
                      {nodeTypeDescriptions[type as keyof typeof nodeTypeDescriptions]}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}