import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageSquare, 
  Search, 
  Send,
  Paperclip,
  MoreVertical,
  Edit,
  User,
  Clock
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Conversation, Message, Contact } from "@shared/schema";

export default function Inbox() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const response = await api.getConversations();
      return await response.json();
    },
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/conversations", selectedConversation?.id, "messages"],
    queryFn: async () => {
      if (!selectedConversation?.id) return [];
      const response = await api.getMessages(selectedConversation.id);
      return await response.json();
    },
    enabled: !!selectedConversation?.id,
  });

  const { data: contacts } = useQuery({
    queryKey: ["/api/contacts"],
    queryFn: async () => {
      const response = await api.getContacts();
      return await response.json();
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data: { conversationId: string; content: string }) => 
      api.createMessage(data.conversationId, { content: data.content, fromUser: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversation?.id, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
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

  const updateConversationMutation = useMutation({
    mutationFn: (data: { id: string; updates: any }) => 
      api.updateConversation(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;
    
    sendMessageMutation.mutate({
      conversationId: selectedConversation.id,
      content: messageText.trim(),
    });
  };

  const handleAssignConversation = (assignedTo: string) => {
    if (!selectedConversation) return;
    
    updateConversationMutation.mutate({
      id: selectedConversation.id,
      updates: { assignedTo, status: "assigned" }
    });
  };

  const filteredConversations = conversations?.filter((conv: Conversation) => {
    const statusMatch = filterStatus === "all" || conv.status === filterStatus;
    const contact = contacts?.find((c: Contact) => c.id === conv.contactId);
    const searchMatch = !searchQuery || 
      contact?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact?.phone.includes(searchQuery);
    return statusMatch && searchMatch;
  }) || [];

  const getContactInfo = (contactId: string) => {
    return contacts?.find((c: Contact) => c.id === contactId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "normal": return "bg-blue-100 text-blue-800";
      case "low": return "bg-gray-100 text-gray-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  if (conversationsLoading) {
    return (
      <div className="flex-1 dots-bg">
        <Header title="Team Inbox" subtitle="Loading conversations..." />
        <div className="p-6">
          <Loading size="lg" text="Loading inbox..." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 dots-bg min-h-screen">
      <Header 
        title="Team Inbox" 
        subtitle="Collaborate on customer conversations"
      />

      <main className="p-6 space-y-6">
        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { value: "all", label: "All Chats" },
            { value: "open", label: "Open" },
            { value: "assigned", label: "Assigned to Me" },
            { value: "closed", label: "Closed" }
          ].map((filter) => (
            <Button
              key={filter.value}
              variant={filterStatus === filter.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterStatus(filter.value)}
              className={filterStatus === filter.value ? "bg-green-600 text-white" : ""}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {!filteredConversations.length ? (
                <EmptyState
                  icon={MessageSquare}
                  title="No conversations"
                  description="You don't have any conversations yet. Conversations will appear here when customers message you."
                  className="py-8"
                />
              ) : (
                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {filteredConversations.map((conversation: Conversation) => {
                    const contact = getContactInfo(conversation.contactId);
                    const isSelected = selectedConversation?.id === conversation.id;
                    
                    return (
                      <div
                        key={conversation.id}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                          isSelected ? "bg-green-50 border-l-4 border-green-600" : ""
                        }`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-gray-600">
                              {contact?.name?.charAt(0).toUpperCase() || "?"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {contact?.name || "Unknown Contact"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {conversation.lastMessageAt 
                                  ? new Date(conversation.lastMessageAt).toLocaleTimeString('en-US', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })
                                  : ""
                                }
                              </p>
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              {contact?.phone || "No phone number"}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex space-x-1">
                                <Badge 
                                  variant="outline" 
                                  className={getPriorityColor(conversation.priority || "normal")}
                                >
                                  {conversation.priority || "normal"}
                                </Badge>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  {conversation.status}
                                </Badge>
                              </div>
                              {conversation.status === "open" && (
                                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Messages */}
          <Card className="lg:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {getContactInfo(selectedConversation.contactId)?.name?.charAt(0).toUpperCase() || "?"}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {getContactInfo(selectedConversation.contactId)?.name || "Unknown Contact"}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {getContactInfo(selectedConversation.contactId)?.phone || "No phone"} • Online
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Select 
                        value={selectedConversation.assignedTo || ""} 
                        onValueChange={handleAssignConversation}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Assign to..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Unassigned</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="agent1">Agent 1</SelectItem>
                          <SelectItem value="agent2">Agent 2</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages Area */}
                <CardContent className="flex-1 p-4 space-y-4 max-h-96 overflow-y-auto">
                  {messagesLoading ? (
                    <Loading text="Loading messages..." />
                  ) : messages?.length ? (
                    messages.map((message: Message) => (
                      <div
                        key={message.id}
                        className={`flex items-start space-x-2 ${
                          message.fromUser ? "justify-end" : ""
                        }`}
                      >
                        {!message.fromUser && (
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                        <div
                          className={`rounded-2xl p-3 max-w-xs ${
                            message.fromUser
                              ? "bg-green-600 text-white rounded-tr-sm"
                              : "bg-gray-100 text-gray-800 rounded-tl-sm"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.fromUser ? "text-green-100" : "text-gray-500"
                          }`}>
                            {message.createdAt 
                              ? new Date(message.createdAt).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })
                              : ""
                            }
                            {message.fromUser && " ✓✓"}
                          </p>
                        </div>
                        {message.fromUser && (
                          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-white">A</span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No messages yet. Start the conversation!
                    </div>
                  )}
                </CardContent>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  {/* Quick Responses */}
                  <div className="mb-3 flex flex-wrap gap-2">
                    {[
                      "Thank you for contacting us",
                      "Let me check that for you",
                      "Is there anything else?"
                    ].map((quickReply) => (
                      <Button
                        key={quickReply}
                        variant="outline"
                        size="sm"
                        onClick={() => setMessageText(quickReply)}
                        className="text-xs"
                      >
                        {quickReply}
                      </Button>
                    ))}
                  </div>

                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <Textarea
                        rows={2}
                        placeholder="Type your message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="resize-none"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm"
                        onClick={handleSendMessage}
                        disabled={!messageText.trim() || sendMessageMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Internal Notes */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <Edit className="w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Add internal note..."
                        className="text-sm"
                      />
                      <Button variant="ghost" size="sm" className="text-blue-600">
                        Add Note
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState
                  icon={MessageSquare}
                  title="Select a conversation"
                  description="Choose a conversation from the list to start chatting with your customers."
                  className="py-12"
                />
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
