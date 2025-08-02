import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UserPlus,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  Users,
  Activity,
  Clock,
} from "lucide-react";
import type { TeamMember } from "@shared/schema";

interface TeamMemberFormData {
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "manager" | "agent";
  department?: string;
  permissions: {
    canManageContacts?: boolean;
    canManageCampaigns?: boolean;
    canManageTemplates?: boolean;
    canViewAnalytics?: boolean;
    canManageTeam?: boolean;
    canExportData?: boolean;
  };
}

export default function TeamPage() {
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [activeTab, setActiveTab] = useState("members");

  // Fetch team members
  const { data: teamMembers = [], isLoading } = useQuery<TeamMember[]>({
    queryKey: ["/api/team/members"],
  });

  // Fetch team activity logs
  const { data: activityLogs = [] } = useQuery({
    queryKey: ["/api/team/activity-logs"],
    enabled: activeTab === "activity",
  });

  // Add/Update team member mutation
  const saveMemberMutation = useMutation({
    mutationFn: async (data: TeamMemberFormData) => {
      if (editingMember) {
        return apiRequest(`/api/team/members/${editingMember.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      } else {
        return apiRequest("/api/team/members", {
          method: "POST",
          body: JSON.stringify(data),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team/members"] });
      toast({
        title: editingMember ? "Member updated" : "Member added",
        description: `Team member has been ${editingMember ? "updated" : "added"} successfully.`,
      });
      setShowAddDialog(false);
      setEditingMember(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete team member mutation
  const deleteMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      return apiRequest(`/api/team/members/${memberId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team/members"] });
      toast({
        title: "Member removed",
        description: "Team member has been removed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update member status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ memberId, status }: { memberId: string; status: string }) => {
      return apiRequest(`/api/team/members/${memberId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team/members"] });
      toast({
        title: "Status updated",
        description: "Team member status has been updated.",
      });
    },
  });

  const handleOpenDialog = (member?: TeamMember) => {
    if (member) {
      setEditingMember(member);
    }
    setShowAddDialog(true);
  };

  const handleCloseDialog = () => {
    setShowAddDialog(false);
    setEditingMember(null);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "manager":
        return "default";
      default:
        return "secondary";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "secondary";
      case "suspended":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getOnlineStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="container max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your team members, roles, and permissions
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Team Member
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="members">
            <Users className="mr-2 h-4 w-4" />
            Team Members
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="mr-2 h-4 w-4" />
            Activity Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage team members and their access permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading team members...
                      </TableCell>
                    </TableRow>
                  ) : teamMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No team members found. Add your first team member.
                      </TableCell>
                    </TableRow>
                  ) : (
                    teamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar>
                                <AvatarImage src={member.avatar || undefined} />
                                <AvatarFallback>
                                  {member.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div
                                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${getOnlineStatusColor(
                                  member.onlineStatus || "offline"
                                )}`}
                              />
                            </div>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {member.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(member.role)}>
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{member.department || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(member.status)}>
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {member.lastActive
                                ? new Date(member.lastActive).toLocaleString()
                                : "Never"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleOpenDialog(member)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  updateStatusMutation.mutate({
                                    memberId: member.id,
                                    status:
                                      member.status === "active"
                                        ? "inactive"
                                        : "active",
                                  })
                                }
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                {member.status === "active"
                                  ? "Deactivate"
                                  : "Activate"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  if (
                                    confirm(
                                      "Are you sure you want to remove this team member?"
                                    )
                                  ) {
                                    deleteMemberMutation.mutate(member.id);
                                  }
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>
                Track team member activities and actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        No activity logs found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    activityLogs.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell>{log.memberName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.action}</Badge>
                        </TableCell>
                        <TableCell>{log.details || "-"}</TableCell>
                        <TableCell>
                          {new Date(log.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Team Member Dialog */}
      <TeamMemberDialog
        open={showAddDialog}
        onOpenChange={handleCloseDialog}
        member={editingMember}
        onSave={(data) => saveMemberMutation.mutate(data)}
      />
    </div>
  );
}

// Team Member Form Dialog Component
function TeamMemberDialog({
  open,
  onOpenChange,
  member,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
  onSave: (data: TeamMemberFormData) => void;
}) {
  const [formData, setFormData] = useState<TeamMemberFormData>({
    name: member?.name || "",
    email: member?.email || "",
    phone: member?.phone || "",
    role: (member?.role as "admin" | "manager" | "agent") || "agent",
    department: member?.department || "",
    permissions: (member?.permissions as any) || {},
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updatePermission = (key: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: value,
      },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {member ? "Edit Team Member" : "Add Team Member"}
          </DialogTitle>
          <DialogDescription>
            {member
              ? "Update team member details and permissions"
              : "Add a new team member to your organization"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department (Optional)</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    role: value as "admin" | "manager" | "agent",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>Permissions</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="perm-contacts"
                    className="text-sm font-normal"
                  >
                    Manage Contacts
                  </Label>
                  <Switch
                    id="perm-contacts"
                    checked={formData.permissions.canManageContacts || false}
                    onCheckedChange={(checked) =>
                      updatePermission("canManageContacts", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="perm-campaigns"
                    className="text-sm font-normal"
                  >
                    Manage Campaigns
                  </Label>
                  <Switch
                    id="perm-campaigns"
                    checked={formData.permissions.canManageCampaigns || false}
                    onCheckedChange={(checked) =>
                      updatePermission("canManageCampaigns", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="perm-templates"
                    className="text-sm font-normal"
                  >
                    Manage Templates
                  </Label>
                  <Switch
                    id="perm-templates"
                    checked={formData.permissions.canManageTemplates || false}
                    onCheckedChange={(checked) =>
                      updatePermission("canManageTemplates", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="perm-analytics"
                    className="text-sm font-normal"
                  >
                    View Analytics
                  </Label>
                  <Switch
                    id="perm-analytics"
                    checked={formData.permissions.canViewAnalytics || false}
                    onCheckedChange={(checked) =>
                      updatePermission("canViewAnalytics", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="perm-team" className="text-sm font-normal">
                    Manage Team
                  </Label>
                  <Switch
                    id="perm-team"
                    checked={formData.permissions.canManageTeam || false}
                    onCheckedChange={(checked) =>
                      updatePermission("canManageTeam", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="perm-export"
                    className="text-sm font-normal"
                  >
                    Export Data
                  </Label>
                  <Switch
                    id="perm-export"
                    checked={formData.permissions.canExportData || false}
                    onCheckedChange={(checked) =>
                      updatePermission("canExportData", checked)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit">
              {member ? "Update" : "Add"} Team Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}