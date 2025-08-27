import { useCallback, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  Handle,
  Position,
  Connection,
  Edge,
  Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Clock,
  FileText,
  Maximize2,
  MessageCircle,
  Plus,
  Reply,
  Save,
  Share2,
  Users,
  Zap,
  Image as ImageIcon,
  UserPlus,
  Trash2,
} from "lucide-react";

// -----------------------
// Types
// -----------------------
export type NodeKind =
  | "start"
  | "custom_reply"
  | "user_reply"
  | "time_gap"
  | "send_template"
  | "assign_user";

export interface BuilderNodeData {
  kind: NodeKind;
  label?: string;
  // Configs by type
  message?: string;
  imageUrl?: string | null;
  question?: string;
  saveAs?: string;
  delay?: number; // seconds
  templateId?: string;
  assigneeId?: string; // user id
}

interface AutomationFlowBuilderProps {
  automationId?: string; // existing automation ID (optional)
  channelId?: string; // channel this automation belongs to
  onClose: () => void;
}

// -----------------------
// Utility
// -----------------------
const uid = () =>
  `node_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// Default data for each node type
const defaultsByKind: Record<NodeKind, Partial<BuilderNodeData>> = {
  start: { kind: "start", label: "Start" },
  custom_reply: {
    kind: "custom_reply",
    label: "Message",
    message: "",
    imageUrl: null,
  },
  user_reply: {
    kind: "user_reply",
    label: "Question",
    question: "",
    saveAs: "",
    imageUrl: null,
  },
  time_gap: { kind: "time_gap", label: "Delay", delay: 60 },
  send_template: { kind: "send_template", label: "Template", templateId: "" },
  assign_user: { kind: "assign_user", label: "Assign User", assigneeId: "" },
};

// -----------------------
// Custom Node Components
// -----------------------
function Shell({
  children,
  tint,
}: {
  children: React.ReactNode;
  tint: string;
}) {
  return (
    <div
      className={`rounded-2xl shadow-sm border text-white ${tint} px-4 py-3 min-w-[220px] relative group`}
    >
      {children}
    </div>
  );
}

function StartNode() {
  return (
    <div className="rounded-full w-14 h-14 bg-green-500 flex items-center justify-center text-white shadow">
      <Zap className="w-6 h-6" />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

function CustomReplyNode({ data }: { data: BuilderNodeData }) {
  return (
    <Shell tint="bg-orange-500 border-orange-600">
      <div className="font-semibold flex items-center gap-2">
        <MessageCircle className="w-4 h-4" /> Message
      </div>
      {data.message && (
        <div className="text-white/90 text-sm mt-1 whitespace-pre-wrap">
          {data.message.length > 50 ? `${data.message.slice(0, 50)}...` : data.message}
        </div>
      )}
      {data.imageUrl && (
        <div className="mt-2 rounded-lg overflow-hidden bg-white/10">
          <img
            src={data.imageUrl}
            alt="message"
            className="max-h-32 object-cover w-full"
          />
        </div>
      )}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </Shell>
  );
}

function UserReplyNode({ data }: { data: BuilderNodeData }) {
  return (
    <Shell tint="bg-pink-500 border-pink-600">
      <div className="font-semibold flex items-center gap-2">
        <Reply className="w-4 h-4" /> Question
      </div>
      {data.question && (
        <div className="text-white/90 text-sm mt-1 whitespace-pre-wrap">
          {data.question.length > 50 ? `${data.question.slice(0, 50)}...` : data.question}
        </div>
      )}
      {data.imageUrl && (
        <div className="mt-2 rounded-lg overflow-hidden bg-white/10">
          <img
            src={data.imageUrl}
            alt="question"
            className="max-h-32 object-cover w-full"
          />
        </div>
      )}
      {data.saveAs && (
        <div className="text-[11px] mt-2 bg-white/15 rounded px-2 py-1 inline-block">
          save as: <span className="font-mono">{data.saveAs}</span>
        </div>
      )}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </Shell>
  );
}

function TimeGapNode({ data }: { data: BuilderNodeData }) {
  return (
    <Shell tint="bg-gray-600 border-gray-700">
      <div className="font-semibold flex items-center gap-2">
        <Clock className="w-4 h-4" /> Delay
      </div>
      <div className="text-white/90 text-sm mt-1">
        {data.delay ?? 0} seconds
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </Shell>
  );
}

function SendTemplateNode({ data }: { data: BuilderNodeData }) {
  return (
    <Shell tint="bg-blue-600 border-blue-700">
      <div className="font-semibold flex items-center gap-2">
        <FileText className="w-4 h-4" /> Template
      </div>
      <div className="text-white/90 text-sm mt-1">
        {data.templateId ? `Template: ${data.templateId}` : "Select a template"}
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </Shell>
  );
}

function AssignUserNode({ data }: { data: BuilderNodeData }) {
  return (
    <Shell tint="bg-indigo-600 border-indigo-700">
      <div className="font-semibold flex items-center gap-2">
        <Users className="w-4 h-4" /> Assign to
      </div>
      <div className="text-white/90 text-sm mt-1">
        {data.assigneeId ? data.assigneeId : "Select member"}
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </Shell>
  );
}

const nodeTypes = {
  start: StartNode,
  custom_reply: CustomReplyNode,
  user_reply: UserReplyNode,
  time_gap: TimeGapNode,
  send_template: SendTemplateNode,
  assign_user: AssignUserNode,
};

// -----------------------
// Right Panel (Config)
// -----------------------
function ConfigPanel({
  selected,
  onChange,
  onDelete,
  templates,
  members,
}: {
  selected: Node<BuilderNodeData> | null;
  onChange: (patch: Partial<BuilderNodeData>) => void;
  onDelete: () => void;
  templates: any[];
  members: any[];
}) {
  if (!selected || selected.data.kind === "start") {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Select a node to configure
      </div>
    );
  }

  const d = selected.data;

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Configure
            </div>
            <div className="text-lg font-semibold">{d.label}</div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {d.kind === "custom_reply" && (
          <Card className="p-3 space-y-3">
            <div>
              <Label>Message</Label>
              <Textarea
                rows={4}
                value={d.message || ""}
                onChange={(e) => onChange({ message: e.target.value })}
                placeholder="Enter your message here..."
              />
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Image URL (optional)
              </Label>
              <Input
                type="url"
                value={d.imageUrl || ""}
                onChange={(e) => onChange({ imageUrl: e.target.value || null })}
                placeholder="https://example.com/image.jpg"
              />
              {d.imageUrl && (
                <img
                  src={d.imageUrl}
                  alt="preview"
                  className="w-32 mt-2 rounded border"
                />
              )}
            </div>
          </Card>
        )}

        {d.kind === "user_reply" && (
          <Card className="p-3 space-y-3">
            <div>
              <Label>Question</Label>
              <Textarea
                rows={3}
                value={d.question || ""}
                onChange={(e) => onChange({ question: e.target.value })}
                placeholder="What question would you like to ask?"
              />
            </div>
            <div>
              <Label>Save Answer As</Label>
              <Input
                placeholder="e.g. full_name, email, phone"
                value={d.saveAs || ""}
                onChange={(e) => onChange({ saveAs: e.target.value })}
              />
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Image URL (optional)
              </Label>
              <Input
                type="url"
                value={d.imageUrl || ""}
                onChange={(e) => onChange({ imageUrl: e.target.value || null })}
                placeholder="https://example.com/image.jpg"
              />
              {d.imageUrl && (
                <img
                  src={d.imageUrl}
                  alt="preview"
                  className="w-32 mt-2 rounded border"
                />
              )}
            </div>
          </Card>
        )}

        {d.kind === "time_gap" && (
          <Card className="p-3 space-y-3">
            <div>
              <Label>Delay (seconds)</Label>
              <Input
                type="number"
                min={0}
                value={d.delay ?? 60}
                onChange={(e) =>
                  onChange({ delay: parseInt(e.target.value || "0", 10) })
                }
              />
            </div>
          </Card>
        )}

        {d.kind === "send_template" && (
          <Card className="p-3 space-y-3">
            <div>
              <Label>Choose Template</Label>
              <select
                className="w-full border rounded-md h-9 px-2"
                value={d.templateId || ""}
                onChange={(e) => onChange({ templateId: e.target.value })}
              >
                <option value="">Select template</option>
                {templates.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </Card>
        )}

        {d.kind === "assign_user" && (
          <Card className="p-3 space-y-3">
            <div>
              <Label className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Assign to Member
              </Label>
              <select
                className="w-full border rounded-md h-9 px-2"
                value={d.assigneeId || ""}
                onChange={(e) => onChange({ assigneeId: e.target.value })}
              >
                <option value="">Select member</option>
                {members.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.name || `${m.firstName || ""} ${m.lastName || ""}`}
                  </option>
                ))}
              </select>
            </div>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}

// -----------------------
// Main Component
// -----------------------
export default function AutomationFlowBuilderXYFlow({
  automationId,
  channelId,
  onClose,
}: AutomationFlowBuilderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load existing automation if editing
  const { data: automation, isLoading } = useQuery({
    queryKey: ["/api/automations", automationId],
    queryFn: () => automationId ? apiRequest("GET", `/api/automations/${automationId}`) : null,
    enabled: !!automationId,
  });

  // Name and description
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [trigger, setTrigger] = useState<string>("new_conversation");

  // Data sources
  const { data: templates = [] } = useQuery({ queryKey: ["/api/templates"] });

  const { data: members = [] } = useQuery({ queryKey: ["/api/team/members"] });;

  // Initialize from loaded automation
  const initialNodes: Node<BuilderNodeData>[] = useMemo(() => {
    if (automation?.diagram?.nodes) {
      return automation.diagram.nodes;
    }
    if (automation?.nodes) {
      // Convert legacy nodes to ReactFlow format
      const flowNodes: Node<BuilderNodeData>[] = [
        {
          id: "start",
          type: "start",
          position: { x: 200, y: 40 },
          data: { ...(defaultsByKind.start as BuilderNodeData) },
        }
      ];
      
      automation.nodes.forEach((node: any, index: number) => {
        flowNodes.push({
          id: node.nodeId || node.id,
          type: fromLegacyType(node.type),
          position: { x: 200, y: (index + 1) * 140 },
          data: fromLegacyConfig(node.type, node.data || {}),
        });
      });
      
      return flowNodes;
    }
    return [
      {
        id: "start",
        type: "start",
        position: { x: 200, y: 40 },
        data: { ...(defaultsByKind.start as BuilderNodeData) },
      },
    ];
  }, [automation]);

  const initialEdges = useMemo(() => {
    if (automation?.diagram?.edges) {
      return automation.diagram.edges;
    }
    if (automation?.nodes) {
      // Convert legacy nextNodeId to edges
      const edges: Edge[] = [];
      let prevNodeId = "start";
      
      automation.nodes.forEach((node: any) => {
        edges.push({
          id: `${prevNodeId}-${node.nodeId || node.id}`,
          source: prevNodeId,
          target: node.nodeId || node.id,
          animated: true,
        });
        prevNodeId = node.nodeId || node.id;
      });
      
      return edges;
    }
    return [];
  }, [automation]);

  // Nodes & Edges state (ReactFlow)
  const [nodes, setNodes, onNodesChange] = useNodesState<BuilderNodeData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update state when automation loads
  useMemo(() => {
    if (automation) {
      setName(automation.name || "");
      setDescription(automation.description || "");
      setTrigger(automation.trigger || "new_conversation");
    }
  }, [automation]);

  // Selection
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedId) || null,
    [nodes, selectedId]
  );

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback(
    (_: any, node: Node<BuilderNodeData>) => setSelectedId(node.id),
    []
  );

  // Add node actions
  const addNode = (kind: NodeKind) => {
    const id = uid();
    const base = defaultsByKind[kind];
    const newNode: Node<BuilderNodeData> = {
      id,
      type: kind,
      position: { x: 200, y: (nodes.length + 1) * 140 },
      data: { ...(base as BuilderNodeData) },
    };
    setNodes((nds) => [...nds, newNode]);
    setSelectedId(id);
  };

  // Delete node
  const deleteNode = () => {
    if (!selectedId || selectedId === "start") return;
    
    setNodes((nds) => nds.filter((n) => n.id !== selectedId));
    setEdges((eds) => eds.filter((e) => e.source !== selectedId && e.target !== selectedId));
    setSelectedId(null);
  };

  // Patch selected node data
  const patchSelected = (patch: Partial<BuilderNodeData>) => {
    if (!selectedId) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedId ? { ...n, data: { ...n.data, ...patch } } : n
      )
    );
  };

  // Save automation
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (automationId) {
        // Update existing automation
        await apiRequest("PUT", `/api/automations/${automationId}`, {
          name: payload.name,
          description: payload.description,
          trigger: payload.trigger,
          triggerConfig: payload.triggerConfig,
          diagram: payload.diagram,
        });
        
        // Update nodes
        await apiRequest("PUT", `/api/automations/${automationId}/nodes`, {
          nodes: payload.nodes,
        });
        
        return { id: automationId };
      } else {
        // Create new automation
        const automation = await apiRequest("POST", "/api/automations", {
          name: payload.name,
          description: payload.description,
          channelId: channelId,
          trigger: payload.trigger,
          triggerConfig: payload.triggerConfig,
          nodes: payload.nodes,
        });
        
        return automation;
      }
    },
    onSuccess: () => {
      toast({
        title: automationId ? "Automation updated" : "Automation created",
        description: "Your automation flow has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/automations"] });
      onClose();
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to save automation", 
        description: error?.message || "An error occurred while saving.",
        variant: "destructive" 
      });
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your automation.",
        variant: "destructive",
      });
      return;
    }

    // Convert ReactFlow nodes to backend format
    const backendNodes = nodes
      .filter((n) => n.type !== "start")
      .map((n, idx) => {
        const outgoingEdge = edges.find((e) => e.source === n.id);
        return {
          nodeId: n.id,
          type: toLegacyType(n.data.kind),
          subtype: null,
          position: idx,
          data: toLegacyConfig(n.data),
          connections: outgoingEdge ? [outgoingEdge.target] : [],
        };
      });

    const payload = {
      name,
      description,
      trigger,
      triggerConfig: {},
      nodes: backendNodes,
      diagram: { nodes, edges },
    };

    saveMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading automation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full grid grid-cols-12 bg-gray-50">
      {/* Left Sidebar */}
      <div className="col-span-2 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <div className="font-semibold">Operations</div>
        </div>
        <ScrollArea className="p-2">
          <div className="space-y-4">
            <div>
              <div className="text-[11px] uppercase text-gray-500 px-2 mb-1 flex items-center gap-2">
                <MessageCircle className="w-3 h-3" /> Send a message
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => addNode("custom_reply")}
                  className="w-full text-left text-sm px-3 py-2 hover:bg-orange-50 rounded flex items-center gap-2"
                >
                  <div className="w-2 h-2 bg-orange-500 rounded-full" /> Message
                </button>
                <button
                  onClick={() => addNode("send_template")}
                  className="w-full text-left text-sm px-3 py-2 hover:bg-blue-50 rounded flex items-center gap-2"
                >
                  <div className="w-2 h-2 bg-blue-600 rounded-full" /> Template
                </button>
              </div>
            </div>

            <div>
              <div className="text-[11px] uppercase text-gray-500 px-2 mb-1 flex items-center gap-2">
                <Reply className="w-3 h-3" /> Ask a question
              </div>
              <button
                onClick={() => addNode("user_reply")}
                className="w-full text-left text-sm px-3 py-2 hover:bg-pink-50 rounded flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-pink-500 rounded-full" /> Question
              </button>
            </div>

            <div>
              <div className="text-[11px] uppercase text-gray-500 px-2 mb-1 flex items-center gap-2">
                <Clock className="w-3 h-3" /> Operations
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => addNode("time_gap")}
                  className="w-full text-left text-sm px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2"
                >
                  <div className="w-2 h-2 bg-gray-600 rounded-full" /> Time
                  Delay
                </button>
                <button
                  onClick={() => addNode("assign_user")}
                  className="w-full text-left text-sm px-3 py-2 hover:bg-indigo-50 rounded flex items-center gap-2"
                >
                  <div className="w-2 h-2 bg-indigo-600 rounded-full" /> Assign
                  to Member
                </button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Center Canvas */}
      <div className="col-span-8 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col gap-1">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Automation name"
                className="h-8 w-72"
              />
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                className="h-6 w-72 text-xs"
              />
            </div>
            <Badge variant="outline" className="text-xs">
              {automationId ? "Edit" : "New"} Automation
            </Badge>
            <Badge className="bg-green-500 text-white text-xs">
              {trigger === "new_conversation" ? "New Chat" : trigger}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleSave}
              disabled={saveMutation.isPending}
            >
              <Save className="w-4 h-4 mr-1" /> 
              {saveMutation.isPending ? "Saving..." : "Save"}
            </Button>
            <Button size="sm" variant="ghost">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            fitView
          >
            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>
        </div>

        {/* Bottom bar add quick */}
        <div className="bg-white border-t px-4 py-2 flex items-center gap-2">
          <span className="text-sm text-gray-600">Add step:</span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => addNode("custom_reply")}
          >
            Message
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => addNode("user_reply")}
          >
            Question
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => addNode("send_template")}
          >
            Template
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => addNode("assign_user")}
          >
            Assign
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => addNode("time_gap")}
          >
            Delay
          </Button>
        </div>
      </div>

      {/* Right Config Panel */}
      <div className="col-span-2 border-l bg-white">
        <ConfigPanel
          selected={selectedNode}
          onChange={patchSelected}
          onDelete={deleteNode}
          templates={templates as any[]}
          members={members as any[]}
        />
      </div>
    </div>
  );
}

// -----------------------
// Helpers to map to/from legacy API
// -----------------------
function toLegacyType(
  kind: NodeKind
): "user_reply" | "time_gap" | "send_template" | "custom_reply" | "assign_user" {
  switch (kind) {
    case "user_reply":
      return "user_reply";
    case "time_gap":
      return "time_gap";
    case "send_template":
      return "send_template";
    case "assign_user":
      return "assign_user";
    default:
      return "custom_reply";
  }
}

function fromLegacyType(legacyType: string): NodeKind {
  switch (legacyType) {
    case "user_reply":
      return "user_reply";
    case "time_gap":
      return "time_gap";
    case "send_template":
      return "send_template";
    case "assign_user":
      return "assign_user";
    default:
      return "custom_reply";
  }
}

function toLegacyConfig(data: BuilderNodeData) {
  switch (data.kind) {
    case "custom_reply":
      return { 
        message: data.message || "", 
        imageUrl: data.imageUrl || null 
      };
    case "user_reply":
      return {
        question: data.question || "",
        saveAs: data.saveAs || "",
        imageUrl: data.imageUrl || null,
      };
    case "time_gap":
      return { delay: data.delay ?? 60 };
    case "send_template":
      return { templateId: data.templateId || "" };
    case "assign_user":
      return { assigneeId: data.assigneeId || "" };
    default:
      return {};
  }
}

function fromLegacyConfig(type: string, config: any): BuilderNodeData {
  const base = defaultsByKind[fromLegacyType(type)] as BuilderNodeData;
  
  switch (type) {
    case "custom_reply":
      return {
        ...base,
        message: config.message || "",
        imageUrl: config.imageUrl || null,
      };
    case "user_reply":
      return {
        ...base,
        question: config.question || "",
        saveAs: config.saveAs || "",
        imageUrl: config.imageUrl || null,
      };
    case "time_gap":
      return {
        ...base,
        delay: config.delay ?? 60,
      };
    case "send_template":
      return {
        ...base,
        templateId: config.templateId || "",
      };
    case "assign_user":
      return {
        ...base,
        assigneeId: config.assigneeId || "",
      };
    default:
      return base;
  }
}