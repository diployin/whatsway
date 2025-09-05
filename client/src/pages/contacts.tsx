import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import Papa from "papaparse";
import * as XLSX from "xlsx";

// Edit Contact Form Component
function EditContactForm({ 
  contact, 
  onSuccess, 
  onCancel 
}: { 
  contact: Contact; 
  onSuccess: () => void; 
  onCancel: () => void; 
}) {
  const form = useForm<InsertContact>({
    resolver: zodResolver(insertContactSchema),
    defaultValues: {
      name: contact.name,
      email: contact.email || "",
      phone: contact.phone,
      groups: contact.groups || [],
      tags: contact.tags || [],

      status: contact.status,
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: async (data: InsertContact) => {
      const response = await fetch(`/api/contacts/${contact.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update contact");
      return response.json();
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: () => {
      // Handle error
    },
  });

  const onSubmit = (data: InsertContact) => {
    updateContactMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="groups"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Groups</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Enter groups separated by commas"
                  value={Array.isArray(field.value) ? field.value.join(", ") : ""}
                  onChange={(e) => {
                    const groups = e.target.value
                      .split(",")
                      .map(g => g.trim())
                      .filter(g => g.length > 0);
                    field.onChange(groups);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={updateContactMutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {updateContactMutation.isPending ? "Updating..." : "Update Contact"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Contacts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageText, setMessageText] = useState("");
  const [messageType, setMessageType] = useState("text");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const phone = params.get("phone");
    if (phone) {
      setSearchQuery(phone);
    }
    console.log("Initial search query from URL:", phone);
  }, []);

  

// const { data: contacts, isLoading } = useQuery({
//   queryKey: ["/api/contacts", searchQuery, activeChannel?.id],
//   queryFn: async () => {
//     const response = await api.getContacts(searchQuery, activeChannel?.id);
//     return await response.json();
//   },
//   enabled: !!activeChannel,
// });

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

  // First, get the active channel
  const { data: activeChannel } = useQuery({
    queryKey: ["/api/channels/active"],
    queryFn: async () => {
      const response = await fetch("/api/channels/active");
      if (!response.ok) return null;
      return await response.json();
    },
  });

  // Then use it in other queries
  const { data: contacts, isLoading } = useQuery({
    queryKey: ["/api/contacts", searchQuery, activeChannel?.id],
    queryFn: async () => {
      const response = await api.getContacts(searchQuery, activeChannel?.id);
      return await response.json();
    },
    enabled: !!activeChannel,
  });

  const { data: channels } = useQuery({
    queryKey: ["/api/whatsapp/channels"],
    queryFn: async () => {
      const response = await fetch("/api/whatsapp/channels");
      return await response.json();
    },
  });
  
  const { data: availableTemplates = [] } = useQuery({
    queryKey: ["/api/templates", activeChannel?.id],
    queryFn: async () => {
      const response = await fetch("/api/templates");
      return await response.json();
    },
    enabled: !!activeChannel,
  });

  // Extract unique groups from all contacts
  const uniqueGroups = useMemo(() => {
    if (!contacts) return [];
    const groups = new Set<string>();
    contacts.forEach((contact: Contact) => {
      if (Array.isArray(contact.groups)) {
        contact.groups.forEach((group: string) => groups.add(group));
      }
    });
    return Array.from(groups).sort();
  }, [contacts]);

  // Filter contacts based on selected group
  const filteredContacts = useMemo(() => {
    if (!contacts) return [];
    if (!selectedGroup) return contacts;
    
    return contacts.filter((contact: Contact) => 
      Array.isArray(contact.groups) && contact.groups.includes(selectedGroup)
    );
  }, [contacts, selectedGroup]);

  const createContactMutation = useMutation({
    mutationFn: async (data: InsertContact) => {
      const response = await fetch(`/api/contacts${activeChannel?.id ? `?channelId=${activeChannel.id}` : ""}`, {
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
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/contacts/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete contact");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Contact deleted",
        description: "The contact has been successfully deleted.",
      });
      setShowDeleteDialog(false);
      setContactToDelete(null);
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
    mutationFn: async (data: any) => {
      const { phone, type, message, templateName, templateLanguage, templateVariables } = data;
      
      if (!activeChannel?.id) {
        throw new Error("No active channel selected");
      }
      
      const payload = type === "template" ? {
        to: phone,
        type: "template",
        templateName,
        templateLanguage,
        templateVariables
      } : {
        to: phone,
        type: "text",
        message
      };
      
      const response = await fetch(`/api/whatsapp/channels/${activeChannel.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message sent",
        description: "Your WhatsApp message has been sent successfully.",
      });
      setShowMessageDialog(false);
      setMessageText("");
      setMessageType("text");
      setSelectedTemplateId("");
      setTemplateVariables({});
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please check your WhatsApp configuration and template settings.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteContact = (id: string) => {
    setContactToDelete(id);
    setShowDeleteDialog(true);
  };


  const importContactsMutation = useMutation({
    mutationFn: async (contacts: InsertContact[]) => {
      const response = await fetch(`/api/contacts/import${activeChannel?.id ? `?channelId=${activeChannel.id}` : ""}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts }),
      });
      if (!response.ok) throw new Error("Failed to import contacts");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Import Completed",
        description: `Imported: ${data.created}, Duplicates: ${data.duplicates}, Failed: ${data.failed}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to import contacts. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedContacts: InsertContact[] = (results.data as any[])
            .filter((row) => row && Object.keys(row).length > 0) // filter out empty rows
            .map((row: any) => ({
              name: row?.name?.toString().trim() || "",
              phone: row?.phone ? String(row.phone).trim() : "",
              email: row?.email?.toString().trim() || "",
              groups: row?.groups
                ? row.groups.split(",").map((g: string) => g.trim())
                : [],
              tags: row?.tags
                ? row.tags.split(",").map((t: string) => t.trim())
                : [],
            }))
            .filter((c) => c.name || c.phone); // ignore completely empty rows
  
          if (parsedContacts.length === 0) {
            toast({
              title: "CSV Error",
              description: "No valid contacts found in the file.",
              variant: "destructive",
            });
            return;
          }
  
          importContactsMutation.mutate(parsedContacts);
        } catch (err: any) {
          toast({
            title: "CSV Parse Error",
            description: err.message || "Failed to parse CSV file.",
            variant: "destructive",
          });
        }
      },
      error: (err) => {
        toast({
          title: "CSV Error",
          description: err.message,
          variant: "destructive",
        });
      },
    });
  
    // Reset input so same file can be selected again
    event.target.value = "";
  };


  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);
  
      const parsedContacts: InsertContact[] = rows.map((row: any) => ({
        name: row?.name?.toString().trim() || "",
        phone: row?.phone ? String(row.phone).trim() : "",
        email: row?.email?.toString().trim() || "",
        groups: row?.groups
          ? row.groups.split(",").map((g: string) => g.trim())
          : [],
        tags: row?.tags
          ? row.tags.split(",").map((t: string) => t.trim())
          : [],
      }));
  
      importContactsMutation.mutate(parsedContacts);
    };
    reader.readAsArrayBuffer(file);
  
    event.target.value = "";
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    {selectedGroup || "All Groups"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => setSelectedGroup(null)}
                    className={!selectedGroup ? "bg-gray-100" : ""}
                  >
                    All Groups
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setShowGroupDialog(true)}
                    className="text-green-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Group
                  </DropdownMenuItem>
                  {uniqueGroups.length > 0 && (
                    <>
                      <DropdownMenuItem disabled className="py-1">
                        <span className="text-xs text-gray-500 uppercase">Available Groups</span>
                      </DropdownMenuItem>
                      {uniqueGroups.map((group) => (
                        <DropdownMenuItem 
                          key={group}
                          onClick={() => setSelectedGroup(group)}
                          className={selectedGroup === group ? "bg-gray-100" : ""}
                        >
                          {group}
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                All Status
              </Button>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".csv,.xlsx"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]?.name.endsWith(".csv")) {
                    handleCSVUpload(e);
                  } else {
                    handleExcelUpload(e);
                  }
                }}
              />
              <Button variant="outline" className="" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV
                </span>
              </Button>
            </label>
            </div>
          </CardContent>
        </Card>

        {/* Contacts List */}
        <Card>
          <CardContent className="p-0">
            {!filteredContacts?.length ? (
              <EmptyState
                icon={Users}
                title="No contacts found"
                description={
                  searchQuery ? 
                    "No contacts match your search criteria. Try adjusting your search." :
                  selectedGroup ?
                    `No contacts found in the "${selectedGroup}" group. Try selecting a different group.` :
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
                    {filteredContacts.map((contact: Contact) => (
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
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedContact(contact);
                                setShowEditDialog(true);
                              }}
                            >
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
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedContact(contact);
                                    setShowEditDialog(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Contact
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedContact(contact);
                                    setShowMessageDialog(true);
                                  }}
                                  disabled={!channels || channels.length === 0}
                                >
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Send Message
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteContact(contact.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Contact
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {filteredContacts?.length > 0 && (
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to{" "}
                  <span className="font-medium">{Math.min(10, filteredContacts.length)}</span> of{" "}
                  <span className="font-medium">{filteredContacts.length}</span> contacts
                  {selectedGroup && ` in "${selectedGroup}" group`}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send WhatsApp Message</DialogTitle>
            <DialogDescription>
              Send a message to {selectedContact?.name} ({selectedContact?.phone})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {activeChannel && (
              <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-600" />
                  <div className="text-sm">
                    <span className="font-medium">Active Channel:</span>{" "}
                    <span className="text-gray-700">{activeChannel.name}</span>
                  </div>
                </div>
              </div>
            )}
            
            {!activeChannel && (
              <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  No active channel selected. Please select a channel from the header to send messages.
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Message Type</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={messageType}
                onChange={(e) => {
                  setMessageType(e.target.value);
                  setSelectedTemplateId("");
                  setTemplateVariables({});
                }}
              >
                <option value="text">Regular Text Message</option>
                <option value="template">WhatsApp Template</option>
              </select>
            </div>

            {messageType === "template" ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Template</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={selectedTemplateId}
                    onChange={(e) => {
                      setSelectedTemplateId(e.target.value);
                      const template = availableTemplates?.find((t: any) => t.id === e.target.value);
                      if (template && template.variables) {
                        const vars: any = {};
                        (template.variables as string[]).forEach((v, i) => {
                          vars[i + 1] = "";
                        });
                        setTemplateVariables(vars);
                      }
                    }}
                  >
                    <option value="">Select a template</option>
                    {availableTemplates?.filter((t: any) => t.status?.toLowerCase() === "approved").map((template: any) => (
                      <option key={template.id} value={template.id}>
                        {template.name} ({template.category})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedTemplateId && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Template Variables</label>
                    {Object.keys(templateVariables).map((key) => {
                      const template = availableTemplates?.find((t: any) => t.id === selectedTemplateId);
                      const variableName = template?.variables?.[parseInt(key) - 1] || `Variable ${key}`;
                      return (
                        <div key={key} className="space-y-1">
                          <label className="text-xs text-gray-600">{`{{${key}}} - ${variableName}`}</label>
                          <Input
                            placeholder={`Enter ${variableName}`}
                            value={templateVariables[key] || ""}
                            onChange={(e) => setTemplateVariables({
                              ...templateVariables,
                              [key]: e.target.value
                            })}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
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
            )}

            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowMessageDialog(false);
                  setMessageText("");
                  setMessageType("text");
                  setSelectedTemplateId("");
                  setTemplateVariables({});
                }}
              >
                Cancel
              </Button>
              <Button 
                disabled={
                  !activeChannel || 
                  sendMessageMutation.isPending ||
                  (messageType === "text" && !messageText) ||
                  (messageType === "template" && (!selectedTemplateId || Object.values(templateVariables).some(v => !v)))
                }
                onClick={() => {
                  if (selectedContact && activeChannel) {
                    if (messageType === "template" && selectedTemplateId) {
                      const template = availableTemplates?.find((t: any) => t.id === selectedTemplateId);
                      if (template) {
                        sendMessageMutation.mutate({
                          phone: selectedContact.phone,
                          type: "template",
                          templateName: template.name,
                          templateLanguage: template.language,
                          templateVariables: Object.values(templateVariables),
                        });
                      }
                    } else {
                      sendMessageMutation.mutate({
                        phone: selectedContact.phone,
                        type: "text",
                        message: messageText,
                      });
                    }
                  }
                }}
              >
                {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this contact? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteDialog(false);
                setContactToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (contactToDelete) {
                  deleteContactMutation.mutate(contactToDelete);
                }
              }}
              disabled={deleteContactMutation.isPending}
            >
              {deleteContactMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Contact Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>
              Update contact information
            </DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <EditContactForm
              contact={selectedContact}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
                setShowEditDialog(false);
                setSelectedContact(null);
                toast({
                  title: "Contact updated",
                  description: "The contact has been successfully updated.",
                });
              }}
              onCancel={() => {
                setShowEditDialog(false);
                setSelectedContact(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create Group Dialog */}
      <Dialog open={showGroupDialog} onOpenChange={setShowGroupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Contact Group</DialogTitle>
            <DialogDescription>
              Create a new group to organize your contacts
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium">Group Name</label>
              <Input 
                placeholder="e.g., VIP Customers, Marketing List" 
                className="mt-1"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description (Optional)</label>
              <Textarea 
                placeholder="Describe the purpose of this group..."
                className="mt-1"
                rows={3}
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowGroupDialog(false);
                  setGroupName("");
                  setGroupDescription("");
                }}
              >
                Cancel
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  if (groupName.trim()) {
                    toast({
                      title: "Group created",
                      description: `Group "${groupName}" has been created. You can now add contacts to this group.`,
                    });
                    setShowGroupDialog(false);
                    setGroupName("");
                    setGroupDescription("");
                  } else {
                    toast({
                      title: "Error",
                      description: "Please enter a group name",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Create Group
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
