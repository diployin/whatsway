// AutomationFlowBuilder.tsx - Main Component

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  Connection,
  Edge,
  Node,
  ReactFlowInstance,
  NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";

import {
  AutomationFlowBuilderProps,
  BuilderNodeData,
  NodeKind,
  Template,
  Member,
} from "./types";
import { uid, defaultsByKind, transformAutomationToFlow } from "./utils";
import { nodeTypes } from "./NodeComponents";
import { CustomEdge } from "./CustomEdge";
import { ConfigPanel } from "./ConfigPanel";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export default function AutomationFlowBuilder({
  automation,
  channelId,
  onClose,
}: AutomationFlowBuilderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [name, setName] = useState<string>(
    automation?.name || "Send a message"
  );
  const [description, setDescription] = useState<string>(
    automation?.description || ""
  );
  const [trigger, setTrigger] = useState<string>(
    automation?.trigger || "new_conversation"
  );

  const initialFlowRef = useRef<{
    nodes: Node<BuilderNodeData>[];
    edges: Edge[];
  } | null>(null);

  if (!initialFlowRef.current) {
    initialFlowRef.current = transformAutomationToFlow(automation);
  }

  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialFlowRef.current?.nodes || []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialFlowRef.current.edges
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedId) || null,
    [nodes, selectedId]
  );

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) =>
        addEdge({ ...params, animated: true, type: "custom" }, eds)
      ),
    [setEdges]
  );

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    const builderNode = node as Node<BuilderNodeData>;
    setSelectedId(builderNode.id);
  }, []);

  const { data: templateDataOld } = useQuery({
    queryKey: ["/api/templates"],
    queryFn: () =>
      apiRequest("GET", "/api/templates").then((res) => res.json()),
  });
  const templateData: Template[] = templateDataOld?.data || [];
  const templates =
    templateData?.filter((t: Template) => t.status === "APPROVED") || [];

  const { data: teamMembers } = useQuery({
    queryKey: ["/api/team/members"],
    queryFn: () =>
      apiRequest("GET", "/api/team/members").then((res) => res.json()),
  });

  
  const members = teamMembers?.data || [];

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

  const deleteNode = () => {
    if (!selectedId || selectedId === "start") return;

    setNodes((nds) => nds.filter((n) => n.id !== selectedId));
    setEdges((eds) =>
      eds.filter((e) => e.source !== selectedId && e.target !== selectedId)
    );
    setSelectedId(null);
  };

  const patchSelected = (patch: Partial<BuilderNodeData>) => {
    if (!selectedId) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedId ? { ...n, data: { ...n.data, ...patch } } : n
      )
    );
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const formData = new FormData();
      formData.append("name", payload.name);
      formData.append("description", payload.description);
      formData.append("trigger", payload.trigger);
      formData.append("triggerConfig", JSON.stringify(payload.triggerConfig));
      formData.append("nodes", JSON.stringify(payload.nodes));
      formData.append("edges", JSON.stringify(payload.edges));

      payload.nodes.forEach((node: any) => {
        if (node.data.imageFile && node.data.imageFile instanceof File) {
          formData.append(`${node.id}_imageFile`, node.data.imageFile);
        }
        if (node.data.videoFile && node.data.videoFile instanceof File) {
          formData.append(`${node.id}_videoFile`, node.data.videoFile);
        }
        if (node.data.audioFile && node.data.audioFile instanceof File) {
          formData.append(`${node.id}_audioFile`, node.data.audioFile);
        }
        if (node.data.documentFile && node.data.documentFile instanceof File) {
          formData.append(`${node.id}_documentFile`, node.data.documentFile);
        }
      });

      if (payload.automationId) {
        return await fetch(`/api/automations/${payload.automationId}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        return await fetch("/api/automations", {
          method: "POST",
          body: formData,
        });
      }
    },
    onSuccess: () => {
      toast({
        title: automation?.id ? "Automation updated" : "Automation created",
        description: "Your automation flow has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/automations"] });
      onClose();
    },
    onError: (error: any) => {
      console.error("Save mutation error:", error);
      toast({
        title: "Failed to save automation",
        description: error?.message || "An error occurred while saving.",
        variant: "destructive",
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

    const backendNodes = nodes
      .filter((n) => n.id !== "start")
      .map((node) => ({
        ...node,
        position: {
          x: node.position.x,
          y: node.position.y,
        },
      }));

    const normalizedEdges = edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type || "custom",
      animated: edge.animated || true,
    }));

    const uniqueEdges: typeof normalizedEdges = [];
    const seenConnections = new Set<string>();

    normalizedEdges.forEach((edge) => {
      const connectionKey = `${edge.source}-${edge.target}`;
      if (!seenConnections.has(connectionKey)) {
        seenConnections.add(connectionKey);
        uniqueEdges.push(edge);
      }
    });

    const mainEdges = uniqueEdges.filter((e) => e.source !== "start");

    const payload = {
      name,
      description,
      trigger,
      triggerConfig: {},
      nodes: backendNodes,
      edges: mainEdges,
      automationId: automation?.id || null,
    };

    saveMutation.mutate(payload);
  };

  const cleanupEdges = useCallback(() => {
    setEdges((currentEdges) => {
      const cleaned: Edge[] = [];
      const seen = new Set<string>();

      currentEdges.forEach((edge) => {
        const key = `${edge.source}-${edge.target}`;
        if (!seen.has(key)) {
          seen.add(key);
          cleaned.push(edge);
        }
      });

      return cleaned;
    });
  }, [setEdges]);

  useEffect(() => {
    if (edges.length > nodes.length * 2) {
      cleanupEdges();
    }
  }, [edges.length, nodes.length, cleanupEdges]);

  const onInit = useCallback((reactFlowInstance: any) => {
    (
      reactFlowInstance as ReactFlowInstance<Node<BuilderNodeData>, Edge>
    ).setViewport({ x: 0, y: 0, zoom: 1 });
  }, []);

  const edgeTypes = {
    custom: (props: any) => <CustomEdge {...props} setEdges={setEdges} />,
  };

  return (
    <div className="h-screen w-full grid grid-cols-12 bg-gray-50">
      <Sidebar onAddNode={addNode} />

      <div className="col-span-8 flex flex-col">
        <Header
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          trigger={trigger}
          setTrigger={setTrigger}
          automation={automation}
          onClose={onClose}
          onSave={handleSave}
          isSaving={saveMutation.isPending}
          isDemo={user?.username === "demouser"}
        />

        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            onInit={onInit}
            fitView
            edgeTypes={edgeTypes}
          >
            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>
        </div>

        <div className="bg-white border-t px-4 py-2 flex items-center gap-2">
          <span className="text-sm text-gray-600">Add step:</span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => addNode("conditions")}
          >
            Conditions
          </Button>
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

      <div className="col-span-2 border-l bg-white">
        <ConfigPanel
          selected={selectedNode}
          onChange={patchSelected}
          onDelete={deleteNode}
          templates={templates as Template[]}
          members={members as Member[]}
        />
      </div>
    </div>
  );
}