import React, { useState, useEffect } from "react";
import Conversation from "@/entities/Conversation.json";
import Message from "@/entities/Message.json";
import User from "@/entities/User.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Plus, 
  Send,
  Smile,
  Paperclip,
  Phone,
  Video,
  MoreHorizontal
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Inbox() {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [conversationType, setConversationType] = useState("direct");

  useEffect(() => {
    loadInboxData();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      // Auto-refresh messages every 5 seconds for real-time feel
      const interval = setInterval(() => {
        loadMessages();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  const loadInboxData = async () => {
    setIsLoading(true);
    try {
      // Use static JSON data directly
      setConversations(Array.isArray(Conversation) ? Conversation : []);
      setMessages(Array.isArray(Message) ? Message : []);
      setUsers(Array.isArray(User) ? User : []);
      // Set current user (for demo, using the first user)
      setCurrentUser(Array.isArray(User) && User.length > 0 ? User[0] : null);
    } catch (error) {
      console.error("Error loading inbox data:", error);
    }
    setIsLoading(false);
  };

  const loadMessages = async () => {
    try {
      // Use static JSON data directly
      setMessages(Array.isArray(Message) ? Message : []);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const getConversationMessages = (conversationId) => {
    return messages.filter(m => m.conversation_id === conversationId);
  };

  const getOtherParticipants = (conversation) => {
    if (!currentUser) return [];
    const otherEmails = conversation.participants.filter(p => p !== currentUser.email);
    return users.filter(u => otherEmails.includes(u.email));
  };

  const getConversationTitle = (conversation) => {
    const otherParticipants = getOtherParticipants(conversation);
    if (conversation.title) return conversation.title;
    if (otherParticipants.length === 1) return otherParticipants[0].full_name;
    if (otherParticipants.length > 1) return otherParticipants.map(u => u.full_name.split(' ')[0]).join(', ');
    return 'Unknown';
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;

    try {
      // Create new message object
      const newMsg = {
        id: `msg${messages.length + 1}`,
        conversation_id: selectedConversation.id,
        content: newMessage,
        sender_email: currentUser.email,
        created_date: new Date().toISOString()
      };
      
      // Update messages state
      setMessages([newMsg, ...messages]);
      
      // Update conversation last message time
      const updatedConversations = conversations.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, last_message_at: new Date().toISOString() }
          : conv
      );
      setConversations(updatedConversations);
      
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0 || !currentUser) return;

    try {
      const newConversation = {
        id: `conv${conversations.length + 1}`,
        participants: [currentUser.email, ...selectedUsers],
        type: conversationType,
        last_message_at: new Date().toISOString()
      };

      setConversations([newConversation, ...conversations]);
      setIsNewConversationOpen(false);
      setSelectedUsers([]);
      setConversationType("direct");
      setSelectedConversation(newConversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const filteredConversations = conversations.filter(conversation => {
    const title = getConversationTitle(conversation).toLowerCase();
    return title.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="h-full flex bg-white">
      {/* Conversations List */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <Button 
              size="icon" 
              variant="ghost" 
              className="hover:bg-blue-50"
              onClick={() => setIsNewConversationOpen(true)}
            >
              <Plus className="w-5 h-5 text-blue-600" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="p-3 rounded-lg mb-1">
                  <div className="h-10 bg-gray-200 rounded animate-pulse" />
                </div>
              ))
            ) : (
              filteredConversations.map((conversation) => {
                const otherParticipants = getOtherParticipants(conversation);
                const lastMessage = getConversationMessages(conversation.id)[0];
                const isSelected = selectedConversation?.id === conversation.id;
                
                return (
                  <div
                    key={conversation.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                      isSelected 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        {otherParticipants.length === 1 ? (
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                              {getInitials(otherParticipants[0]?.full_name)}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="relative w-10 h-10">
                            <Avatar className="w-6 h-6 absolute top-0 right-0 border-2 border-white">
                              <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                                {getInitials(otherParticipants[0]?.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <Avatar className="w-6 h-6 absolute bottom-0 left-0 border-2 border-white">
                              <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                                {getInitials(otherParticipants[1]?.full_name)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {getConversationTitle(conversation)}
                          </h3>
                          {lastMessage && (
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(lastMessage.created_date), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {lastMessage?.content || 'No messages yet'}
                        </p>
                        {conversation.type === 'group' && (
                          <span className="text-xs text-gray-400 mt-1 block">
                            {conversation.participants.length} participants
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            
            {filteredConversations.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-500">
                <h3 className="font-medium mb-1">No conversations</h3>
                <p className="text-sm">Start a new conversation to get started</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {getOtherParticipants(selectedConversation).length === 1 ? (
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {getInitials(getOtherParticipants(selectedConversation)[0]?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="relative w-10 h-10">
                      <Avatar className="w-6 h-6 absolute top-0 right-0 border-2 border-white">
                        <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                          {getInitials(getOtherParticipants(selectedConversation)[0]?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <Avatar className="w-6 h-6 absolute bottom-0 left-0 border-2 border-white">
                        <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                          {getInitials(getOtherParticipants(selectedConversation)[1]?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {getConversationTitle(selectedConversation)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedConversation.type === 'group' ? 
                      `${selectedConversation.participants.length} members` : 
                      'Online'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {getConversationMessages(selectedConversation.id).reverse().map((message) => {
                  const isOwnMessage = message.sender_email === currentUser?.email;
                  const sender = users.find(u => u.email === message.sender_email);
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwnMessage 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        {!isOwnMessage && selectedConversation.type === 'group' && (
                          <p className="text-xs opacity-75 mb-1">{sender?.full_name}</p>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatDistanceToNow(new Date(message.created_date), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="w-5 h-5" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button variant="ghost" size="icon">
                  <Smile className="w-5 h-5" />
                </Button>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500 mb-4">Choose a conversation from the list to start messaging</p>
              <Button onClick={() => setIsNewConversationOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Start New Conversation
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      <Dialog open={isNewConversationOpen} onOpenChange={setIsNewConversationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Conversation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={conversationType} onValueChange={setConversationType}>
              <SelectTrigger>
                <SelectValue placeholder="Conversation type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">Direct Message</SelectItem>
                <SelectItem value="group">Group Chat</SelectItem>
              </SelectContent>
            </Select>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Select participants:</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {users.filter(u => u.email !== currentUser?.email).map(user => (
                  <div key={user.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={user.id}
                      checked={selectedUsers.includes(user.email)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(prev => [...prev, user.email]);
                        } else {
                          setSelectedUsers(prev => prev.filter(email => email !== user.email));
                        }
                      }}
                      className="rounded"
                    />
                    <label htmlFor={user.id} className="flex items-center gap-2 cursor-pointer">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{user.full_name}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewConversationOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateConversation}
              disabled={selectedUsers.length === 0}
            >
              Start Conversation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}