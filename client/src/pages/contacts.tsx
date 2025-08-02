import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  Upload,
  Plus,
  MessageSquare,
  Phone
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactSchema, type Contact, type InsertContact } from "@shared/schema";

export default function Contacts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [messageText, setMessageText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form for adding contacts
  const form = useForm<InsertContact>({
    resolver: zodResolver(insertContactSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      groups: [],
      tags: [],
    },
  });

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["/api/contacts", searchQuery],
    queryFn: async () => {
      const response = await api.getContacts(searchQuery);
      return await response.json();
    },
  });

  const { data: channels } = useQuery({
    queryKey: ["/api/whatsapp/channels"],
    queryFn: async () => {
      const response = await fetch("/api/whatsapp/channels");
      return await response.json();
    },
  });

  const createContactMutation = useMutation({
    mutationFn: async (data: InsertContact) => {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create contact");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Contact created",
        description: "The contact has been successfully added.",
      });
      setShowAddDialog(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create contact. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: (id: string) => api.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Contact deleted",
        description: "The contact has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete contact. Please try again.",
        variant: "destructive",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ channelId, phone, message }: { channelId: string; phone: string; message: string }) => {
      const response = await fetch(`/api/whatsapp/channels/${channelId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: phone, message }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
      setShowMessageDialog(false);
      setMessageText("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteContact = (id: string) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      deleteContactMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 dots-bg">
        <Header title="Contacts" subtitle="Loading contacts..." />
        <div className="p-6">
          <Loading size="lg" text="Loading contacts..." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 dots-bg min-h-screen">
      <Header 
        title="Contacts Management" 
        subtitle="Manage your WhatsApp contacts and groups"
        action={{
          label: "Add Contact",
          onClick: () => setShowAddDialog(true)
        }}
      />

      <main className="p-6 space-y-6">
        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-64 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                All Groups
              </Button>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                All Status
              </Button>
              <Button variant="outline" className="bg-gray-100">
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contacts List */}
        <Card>
          <CardContent className="p-0">
            {!contacts?.length ? (
              <EmptyState
                icon={Users}
                title="No contacts found"
                description={searchQuery ? 
                  "No contacts match your search criteria. Try adjusting your search." :
                  "You haven't added any contacts yet. Import contacts or add them manually to get started."
                }
                action={!searchQuery ? {
                  label: "Add First Contact",
                  onClick: () => setShowAddDialog(true)
                } : undefined}
                className="py-12"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Groups
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Contact
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contacts.map((contact: Contact) => (
                      <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <input type="checkbox" className="rounded border-gray-300" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {contact.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {contact.name}
                              </div>
                              {contact.email && (
                                <div className="text-sm text-gray-500">
                                  {contact.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {contact.phone}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-1">
                            {Array.isArray(contact.groups) && contact.groups.length > 0 ? (
                              contact.groups.map((group: string, index: number) => (
                                <Badge key={index} variant="secondary">
                                  {group}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-gray-400">No groups</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge 
                            variant={contact.status === "active" ? "default" : "secondary"}
                            className={contact.status === "active" ? "bg-green-100 text-green-800" : ""}
                          >
                            {contact.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {contact.lastContact 
                            ? new Date(contact.lastContact).toLocaleDateString()
                            : "Never"
                          }
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedContact(contact);
                                setShowMessageDialog(true);
                              }}
                              disabled={!channels || channels.length === 0}
                              title={!channels || channels.length === 0 ? "No WhatsApp channels configured" : "Send message"}
                            >
                              <MessageSquare className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteContact(contact.id)}
                              disabled={deleteContactMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {contacts?.length > 0 && (
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to{" "}
                  <span className="font-medium">{Math.min(10, contacts.length)}</span> of{" "}
                  <span className="font-medium">{contacts.length}</span> contacts
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" className="bg-green-600 text-white">
                    1
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Add Contact Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>
              Add a new WhatsApp contact to your contact list.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => createContactMutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormDescription>
                      Contact's full name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1234567890" {...field} />
                    </FormControl>
                    <FormDescription>
                      WhatsApp phone number with country code
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="john@example.com" 
                        {...field} 
                        value={field.value || ""} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createContactMutation.isPending}>
                  {createContactMutation.isPending ? "Adding..." : "Add Contact"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send WhatsApp Message</DialogTitle>
            <DialogDescription>
              Send a message to {selectedContact?.name} ({selectedContact?.phone})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {channels && channels.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select WhatsApp Channel</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  onChange={(e) => setSelectedChannel(e.target.value)}
                >
                  <option value="">Select a channel</option>
                  {channels.map((channel: any) => (
                    <option key={channel.id} value={channel.id}>
                      {channel.name} ({channel.phoneNumber})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <textarea
                className="w-full p-3 border rounded-md resize-none"
                rows={4}
                placeholder="Type your message here..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowMessageDialog(false);
                  setMessageText("");
                }}
              >
                Cancel
              </Button>
              <Button 
                disabled={!messageText || !selectedChannel || sendMessageMutation.isPending}
                onClick={() => {
                  if (selectedContact && selectedChannel) {
                    sendMessageMutation.mutate({
                      channelId: selectedChannel,
                      phone: selectedContact.phone,
                      message: messageText,
                    });
                  }
                }}
              >
                {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
