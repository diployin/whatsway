"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash, Edit, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GroupsUI() {
    const { toast } = useToast();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [editId, setEditId] = useState(null);

  // Fetch groups
  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups");
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Create or update group
  const saveGroup = async () => {
    if (!groupName.trim()) {
       return toast({
            title: "Error",
            description: "Group name is required",
            variant: "destructive",
          });
    }

    const payload = {
      name: groupName,
      description: groupDescription,
      created_by: 1,
    };

    try {
      let res;
      if (editMode) {
        // UPDATE API
        res = await fetch(`/api/groups/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // CREATE API
        res = await fetch("/api/groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!data.success) {
       return toast({
            title: "Error",
            description: data.error || "Something went wrong",
            variant: "destructive",
          });
      }
      toast({
        title: editMode ? "Group updated!" : "Group created!",
        description:
          data.message ||
          "Payment provider settings have been saved successfully.",
      });

      setOpenDialog(false);
      setGroupName("");
      setGroupDescription("");
      setEditMode(false);
      setEditId(null);

      fetchGroups();
    } catch (error) {
        return toast({
            title: "Error",
            description: data.error || "Something went wrong",
            variant: "destructive",
          });
    }
  };

  // Delete group
  const deleteGroup = async (id: any) => {
    if (!confirm("Are you sure you want to delete this group?")) return;

    try {
      const res = await fetch(`/api/groups/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        toast({
            title: "Group delete!",
            description:
              data.message ||
              "Group delete successfully",
          });
        fetchGroups();
      }
    } catch (error) {
        return toast({
            title: "Error",
            description: "Something went wrong",
            variant: "destructive",
          });
    }
  };

  // Open edit modal
  const openEdit = (group: never) => {
    setEditMode(true);
    setEditId(group.id);
    setGroupName(group.name);
    setGroupDescription(group.description);
    setOpenDialog(true);
  };

  return (
    <div className="w-full p-4">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Groups</h2>

        <Button
          className="bg-green-600 text-white"
          onClick={() => {
            setEditMode(false);
            setEditId(null);
            setGroupName("");
            setGroupDescription("");
            setOpenDialog(true);
          }}
        >
          <Plus className="mr-2" size={16} /> Create Group
        </Button>
      </div>

      {/* Group List */}
      <div className="space-y-3">
        {loading ? (
          <p>Loading...</p>
        ) : groups.length === 0 ? (
          <p className="text-gray-500">No groups found.</p>
        ) : (
          groups.map((group) => (
            <Card key={group.id}>
              <CardContent className="p-4 flex justify-between items-center">
                
                <div>
                  <div className="text-lg font-medium">{group.name}</div>
                  <div className="text-gray-600 text-sm">{group.description}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(group.created_at).toLocaleString()}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex gap-2"
                    onClick={() => openEdit(group)}
                  >
                    <Edit size={16} /> Edit
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() => deleteGroup(group.id)}
                    className="flex gap-2"
                  >
                    <Trash size={16} /> Delete
                  </Button>
                </div>

              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Edit Group" : "Create Group"}
            </DialogTitle>
            <DialogDescription>
              {editMode ? "Update your group details." : "Create a new group."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium">Group Name</label>
              <Input
                placeholder="Enter group name"
                className="mt-1"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Enter description (optional)"
                className="mt-1"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button className="bg-green-600 text-white" onClick={saveGroup}>
                {editMode ? "Save Changes" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
