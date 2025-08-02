import { useState, useEffect, useRef } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  Search, 
  Send,
  Paperclip,
  MoreVertical,
  Edit,
  User,
  Clock,
  Check,
  CheckCheck,
  AlertCircle,
  Phone,
  Video,
  Info
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Conversation, Message, Contact } from "@shared/schema";

export default function Inbox() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
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

  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ["/api/conversations", activeChannel?.id],
    queryFn: async () => {
      const response = await api.getConversations(activeChannel?.id);
      return await response.json();
    },
    enabled: !!activeChannel,
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
    queryKey: ["/api/contacts", activeChannel?.id],
    queryFn: async () => {
      const response = await api.getContacts(undefined, activeChannel?.id);
      return await response.json();
    },
    enabled: !!activeChannel,
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

  // Auto scroll to bottom on new messages
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // WebSocket connection for real-time messages
  useEffect(() => {
    if (!selectedConversation) return;
    
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      console.log('WebSocket connected');
      socket.send(JSON.stringify({
        type: 'join-conversation',
        conversationId: selectedConversation.id
      }));
    };
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new-message') {
        // Invalidate messages query to refetch
        queryClient.invalidateQueries({ 
          queryKey: ["/api/conversations", selectedConversation.id, "messages"] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ["/api/conversations"] 
        });
      }
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [selectedConversation, queryClient]);

  const getMessageStatus = (message: Message) => {
    if (message.status === 'failed') {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    } else if (message.status === 'read') {
      return <CheckCheck className="w-4 h-4 text-blue-500" />;
    } else if (message.status === 'delivered') {
      return <CheckCheck className="w-4 h-4 text-gray-400" />;
    } else if (message.status === 'sent') {
      return <Check className="w-4 h-4 text-gray-400" />;
    }
    return null;
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
        subtitle="Real-time customer conversations"
      />

      <main className="p-6">
        <div className="h-[calc(100vh-200px)] flex gap-6">
          {/* Conversations List */}
          <Card className="w-96 flex flex-col">
            <CardHeader className="pb-4">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter conversations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Conversations</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full">
                {!filteredConversations.length ? (
                  <EmptyState
                    icon={MessageSquare}
                    title="No conversations"
                    description="Start chatting when customers message you"
                    className="py-12"
                  />
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredConversations.map((conversation: Conversation) => {
                      const contact = getContactInfo(conversation.contactId);
                      const isSelected = selectedConversation?.id === conversation.id;
                      
                      return (
                        <div
                          key={conversation.id}
                          className={cn(
                            "p-4 hover:bg-gray-50 transition-colors cursor-pointer",
                            isSelected && "bg-green-50 border-l-4 border-green-500"
                          )}
                          onClick={() => setSelectedConversation(conversation)}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {contact?.name?.charAt(0).toUpperCase() || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium text-sm truncate">
                                  {contact?.name || conversation.contactPhone || "Unknown"}
                                </h3>
                                <span className="text-xs text-gray-500">
                                  {conversation.lastMessageAt ? 
                                    format(new Date(conversation.lastMessageAt), "HH:mm") : ""}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 truncate mt-1">
                                {conversation.contactPhone}
                              </p>
                              {conversation.unreadCount && conversation.unreadCount > 0 && (
                                <Badge className="mt-1 bg-green-600 text-white text-xs">
                                  {conversation.unreadCount} new
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Interface */}
          {selectedConversation ? (
            <Card className="flex-1 flex flex-col">
              {/* Chat Header */}
              <CardHeader className="border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {getContactInfo(selectedConversation.contactId)?.name?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-semibold">
                        {getContactInfo(selectedConversation.contactId)?.name || selectedConversation.contactPhone}
                      </h2>
                      <p className="text-sm text-gray-500">{selectedConversation.contactPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Info className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full p-4">
                  {messagesLoading ? (
                    <Loading text="Loading messages..." />
                  ) : messages && messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map((message: Message) => {
                        const isAgent = message.fromUser === true;
                        return (
                          <div
                            key={message.id}
                            className={cn(
                              "flex",
                              isAgent ? "justify-end" : "justify-start"
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-[70%] rounded-lg px-4 py-2",
                                isAgent 
                                  ? "bg-green-500 text-white" 
                                  : "bg-gray-100 text-gray-900"
                              )}
                            >
                              <p className="whitespace-pre-wrap break-words">{message.content}</p>
                              <div className={cn(
                                "flex items-center gap-1 mt-1",
                                isAgent ? "justify-end" : "justify-start"
                              )}>
                                <span className={cn(
                                  "text-xs",
                                  isAgent ? "text-green-100" : "text-gray-500"
                                )}>
                                  {message.createdAt ? format(new Date(message.createdAt), "HH:mm") : ""}
                                </span>
                                {isAgent && getMessageStatus(message)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <EmptyState
                      icon={MessageSquare}
                      title="No messages yet"
                      description="Start a conversation with this contact"
                      className="h-full"
                    />
                  )}
                </ScrollArea>
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex items-end gap-2">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 resize-none"
                    rows={1}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sendMessageMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={MessageSquare}
                title="Select a conversation"
                description="Choose a conversation from the list to start chatting"
              />
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
