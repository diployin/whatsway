import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Play, 
  Pause, 
  Edit, 
  Trash2,
  Bot,
  MessageSquare,
  Clock,
  Users,
  GitBranch,
  Settings
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Automation } from "@shared/schema";

export default function AutomationPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activeChannel } = useQuery({
    queryKey: ["/api/channels/active"],
    queryFn: async () => {
      const response = await fetch("/api/channels/active");
      if (!response.ok) return null;
      return await response.json();
    },
  });

  const { data: automations, isLoading } = useQuery({
    queryKey: ["/api/automations", activeChannel?.id],
    queryFn: async () => {
      const response = await api.getAutomations(activeChannel?.id);
      return await response.json();
    },
    enabled: !!activeChannel,
  });

  const updateAutomationMutation = useMutation({
    mutationFn: (data: { id: string; updates: any }) => 
      api.updateAutomation(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automations"] });
      toast({
        title: "Automation updated",
        description: "The automation has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update automation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteAutomationMutation = useMutation({
    mutationFn: (id: string) => api.deleteAutomation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automations"] });
      toast({
        title: "Automation deleted",
        description: "The automation has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete automation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggleAutomation = (automation: Automation) => {
    const newStatus = automation.status === "active" ? "inactive" : "active";
    updateAutomationMutation.mutate({
      id: automation.id,
      updates: { status: newStatus }
    });
  };

  const handleDeleteAutomation = (id: string) => {
    if (confirm("Are you sure you want to delete this automation?")) {
      deleteAutomationMutation.mutate(id);
    }
  };

  const filteredAutomations = automations?.filter((automation: Automation) => {
    if (selectedStatus === "all") return true;
    return automation.status === selectedStatus;
  }) || [];

  const activeAutomations = automations?.filter((a: Automation) => a.status === "active").length || 0;
  const inactiveAutomations = automations?.filter((a: Automation) => a.status === "inactive").length || 0;
  const totalExecutions = automations?.reduce((sum: number, a: Automation) => sum + (a.executionCount || 0), 0) || 0;

  if (isLoading) {
    return (
      <div className="flex-1 dots-bg">
        <Header title="Automation" subtitle="Loading automations..." />
        <div className="p-6">
          <Loading size="lg" text="Loading automations..." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 dots-bg min-h-screen">
      <Header 
        title="Automation Flow Builder" 
        subtitle="Create intelligent workflows for your WhatsApp communications"
        action={{
          label: "Create Flow",
          onClick: () => console.log("Create automation")
        }}
      />

      <main className="p-6 space-y-6">
        {/* AI Bot Status Banner */}
        <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Bot className="w-5 h-5 mr-2" />
                  AI ChatGPT Bot Status
                </h3>
                <p className="text-indigo-100 text-sm">OpenAI integration for automated customer interactions</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                  <div className="text-sm font-medium">Auto-Resolved</div>
                  <div className="text-2xl font-bold">78%</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                  <div className="text-sm font-medium">Handovers</div>
                  <div className="text-2xl font-bold">12</div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm font-medium">Active</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Automation Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Automations</p>
                  <p className="text-2xl font-bold text-gray-900">{automations?.length || 0}</p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{activeAutomations}</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <Play className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inactive</p>
                  <p className="text-2xl font-bold text-gray-600">{inactiveAutomations}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Pause className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Executions</p>
                  <p className="text-2xl font-bold text-blue-600">{totalExecutions.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <GitBranch className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pre-built Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Pre-built Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Welcome Flow</h4>
                    <p className="text-sm text-gray-600">Greet new contacts</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  Automatically welcome new contacts and introduce your business.
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  Use Template
                </Button>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Lead Nurturing</h4>
                    <p className="text-sm text-gray-600">Follow up prospects</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  Send targeted messages to nurture leads through your sales funnel.
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  Use Template
                </Button>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Drip Campaign</h4>
                    <p className="text-sm text-gray-600">Scheduled messaging</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  Send a series of messages over time to educate and engage.
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  Use Template
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Automations List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Automations</CardTitle>
              <div className="flex space-x-2">
                <Button 
                  variant={selectedStatus === "all" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSelectedStatus("all")}
                  className={selectedStatus === "all" ? "bg-green-600" : ""}
                >
                  All
                </Button>
                <Button 
                  variant={selectedStatus === "active" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSelectedStatus("active")}
                  className={selectedStatus === "active" ? "bg-green-600" : ""}
                >
                  Active
                </Button>
                <Button 
                  variant={selectedStatus === "inactive" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSelectedStatus("inactive")}
                  className={selectedStatus === "inactive" ? "bg-green-600" : ""}
                >
                  Inactive
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!filteredAutomations.length ? (
              <EmptyState
                icon={Zap}
                title="No automations yet"
                description="You haven't created any automations yet. Create your first automation to start automating your WhatsApp communications."
                action={{
                  label: "Create First Automation",
                  onClick: () => console.log("Create automation")
                }}
                className="py-12"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Automation
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trigger
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Executions
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
                    {filteredAutomations.map((automation: Automation) => (
                      <tr key={automation.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                              <Zap className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {automation.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {automation.description || "No description"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {typeof automation.trigger === 'object' && automation.trigger 
                              ? (automation.trigger as any).type || "Custom"
                              : "Manual"
                            }
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={automation.status === "active" ? "default" : "secondary"}
                              className={automation.status === "active" ? "bg-green-100 text-green-800" : ""}
                            >
                              {automation.status}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleAutomation(automation)}
                              disabled={updateAutomationMutation.isPending}
                            >
                              {automation.status === "active" ? (
                                <Pause className="w-4 h-4 text-orange-600" />
                              ) : (
                                <Play className="w-4 h-4 text-green-600" />
                              )}
                            </Button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {(automation.executionCount || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {automation.createdAt 
                            ? new Date(automation.createdAt).toLocaleDateString()
                            : "Unknown"
                          }
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" title="Edit Automation">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Settings">
                              <Settings className="w-4 h-4 text-gray-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Delete Automation"
                              onClick={() => handleDeleteAutomation(automation.id)}
                              disabled={deleteAutomationMutation.isPending}
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
