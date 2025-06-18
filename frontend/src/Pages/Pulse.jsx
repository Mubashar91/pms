import React, { useState, useEffect } from "react";
import projectData from "@/entities/Project";
import projectUpdateData from "@/entities/ProjectUpdate";
import userData from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Activity,
  MessageSquare,
  Heart,
  ThumbsUp,
  Smile,
  Send,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Filter,
  Calendar,
  Paperclip,
  FileText
} from "lucide-react";
import { formatDistanceToNow, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from "date-fns";
import { AnimatePresence } from "framer-motion";

const updateStatusConfig = {
  'On Track': { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', text: 'text-green-800' },
  'At Risk': { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'Off Track': { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', text: 'text-red-800' },
};

export default function Pulse() {
  const [projects, setProjects] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("this_week");
  const [statusFilter, setStatusFilter] = useState("all");
  const [replyContent, setReplyContent] = useState({});

  useEffect(() => {
    // Initialize with static data
    setProjects(Array.isArray(projectData) ? projectData : []);
    setUpdates(Array.isArray(projectUpdateData) ? projectUpdateData : []);
    setUsers(Array.isArray(userData) ? userData : []);
    setIsLoading(false);
  }, []);

  const getDateRange = (filter) => {
    const now = new Date();
    switch (filter) {
      case "this_week":
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case "last_week":
        return { start: startOfWeek(subWeeks(now, 1)), end: endOfWeek(subWeeks(now, 1)) };
      case "this_month":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case "last_month":
        return { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) };
      default:
        return { start: null, end: null };
    }
  };

  const filteredUpdates = updates.filter(update => {
    const updateDate = new Date(update.created_date);
    const { start, end } = getDateRange(timeFilter);
    
    const timeMatch = !start || !end || (updateDate >= start && updateDate <= end);
    const statusMatch = statusFilter === "all" || update.status === statusFilter;
    
    return timeMatch && statusMatch;
  });

  const handleReaction = async (updateId, emoji) => {
    try {
      const update = updates.find(u => u.id === updateId);
      const currentUser = await User.me();
      const existingReactions = update.reactions || [];
      const existingReaction = existingReactions.find(r => r.user_email === currentUser.email && r.emoji === emoji);
      
      let newReactions;
      if (existingReaction) {
        newReactions = existingReactions.filter(r => !(r.user_email === currentUser.email && r.emoji === emoji));
      } else {
        newReactions = [...existingReactions, { emoji, user_email: currentUser.email }];
      }
      
      await ProjectUpdate.update(updateId, { reactions: newReactions });
      loadPulseData();
    } catch (error) {
      console.error("Failed to update reaction:", error);
    }
  };

  const handleReply = async (updateId) => {
    const content = replyContent[updateId];
    if (!content?.trim()) return;
    
    try {
      const currentUser = await User.me();
      const update = updates.find(u => u.id === updateId);
      const currentReplies = update.replies || [];
      
      const newReplies = [...currentReplies, {
        content,
        author_email: currentUser.email,
        created_date: new Date().toISOString()
      }];
      
      await ProjectUpdate.update(updateId, { replies: newReplies });
      setReplyContent(prev => ({ ...prev, [updateId]: '' }));
      loadPulseData();
    } catch (error) {
      console.error("Failed to add reply:", error);
    }
  };

  const getUser = (email) => users.find(u => u.email === email);
  const getProject = (projectId) => projects.find(p => p.id === projectId);
  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  const getTimeFilterLabel = (filter) => {
    switch (filter) {
      case "this_week": return "This Week";
      case "last_week": return "Last Week";
      case "this_month": return "This Month";
      case "last_month": return "Last Month";
      default: return "All Time";
    }
  };

  const getUpdateStats = () => {
    const onTrack = filteredUpdates.filter(u => u.status === "On Track").length;
    const atRisk = filteredUpdates.filter(u => u.status === "At Risk").length;
    const offTrack = filteredUpdates.filter(u => u.status === "Off Track").length;
    
    return { onTrack, atRisk, offTrack, total: filteredUpdates.length };
  };

  const stats = getUpdateStats();

  return (
    <div className="p-6 space-y-6" style={{backgroundColor: 'var(--neutral-50)'}}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pulse</h1>
            <p className="text-gray-600 mt-1">Latest project updates and team activity</p>
          </div>
        </div>

        {/* Filters and Stats */}
        <Card className="border-0 shadow-lg glass-card mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="this_week">This Week</SelectItem>
                      <SelectItem value="last_week">Last Week</SelectItem>
                      <SelectItem value="this_month">This Month</SelectItem>
                      <SelectItem value="last_month">Last Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="On Track">On Track</SelectItem>
                      <SelectItem value="At Risk">At Risk</SelectItem>
                      <SelectItem value="Off Track">Off Track</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{stats.onTrack}</div>
                <div className="text-sm text-green-600">On Track</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-700">{stats.atRisk}</div>
                <div className="text-sm text-yellow-600">At Risk</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-700">{stats.offTrack}</div>
                <div className="text-sm text-red-600">Off Track</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
                <div className="text-sm text-blue-600">Total Updates</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Updates Feed */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Project Updates - {getTimeFilterLabel(timeFilter)}
            </h2>
            <Badge variant="outline" className="ml-2">{filteredUpdates.length} updates</Badge>
          </div>

          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <Card key={i} className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="h-24 bg-gray-200 rounded animate-pulse" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                <AnimatePresence>
                  {filteredUpdates.map((update) => {
                    const author = getUser(update.created_by);
                    const project = getProject(update.project_id);
                    const StatusIcon = updateStatusConfig[update.status]?.icon || CheckCircle2;
                    
                    return (
                      <Card className="border-0 shadow-lg glass-card hover-lift transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="font-medium">
                                {getInitials(author?.full_name || update.created_by)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900">
                                      {author?.full_name || update.created_by}
                                    </span>
                                    <span className="text-gray-500">posted an update for</span>
                                    <span className="font-medium text-blue-600">
                                      {project?.title || 'Unknown Project'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge className={`${updateStatusConfig[update.status]?.bg} ${updateStatusConfig[update.status]?.text} gap-1`}>
                                      <StatusIcon className="w-3 h-3" />
                                      {update.status}
                                    </Badge>
                                    <span className="text-sm text-gray-500">
                                      {formatDistanceToNow(new Date(update.created_date), { addSuffix: true })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {update.title && (
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{update.title}</h3>
                              )}
                              
                              <p className="text-gray-700 mb-4 leading-relaxed">{update.content}</p>
                              
                              {/* Attachments */}
                              {update.attachments && update.attachments.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {update.attachments.map((attachment, index) => (
                                    <a
                                      key={index}
                                      href={attachment.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 bg-blue-50 text-blue-700 rounded-lg px-3 py-2 hover:bg-blue-100 transition-colors text-sm"
                                    >
                                      {attachment.type === 'link' ? (
                                        <Paperclip className="w-4 h-4" />
                                      ) : (
                                        <FileText className="w-4 h-4" />
                                      )}
                                      <span>{attachment.filename}</span>
                                    </a>
                                  ))}
                                </div>
                              )}
                              
                              {/* Reactions */}
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-1">
                                  {['👍', '❤️', '😄'].map(emoji => {
                                    const reactionCount = (update.reactions || []).filter(r => r.emoji === emoji).length;
                                    return (
                                      <Button
                                        key={emoji}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleReaction(update.id, emoji)}
                                        className="h-8 px-3 gap-1 hover:bg-gray-100"
                                      >
                                        <span className="text-base">{emoji}</span>
                                        {reactionCount > 0 && (
                                          <span className="text-xs font-medium text-gray-600">
                                            {reactionCount}
                                          </span>
                                        )}
                                      </Button>
                                    );
                                  })}
                                </div>
                                <Button variant="ghost" size="sm" className="gap-2 text-gray-600">
                                  <MessageSquare className="w-4 h-4" />
                                  {(update.replies || []).length} replies
                                </Button>
                              </div>
                              
                              {/* Replies */}
                              {update.replies && update.replies.length > 0 && (
                                <div className="space-y-3 pl-4 border-l-2 border-gray-200 mb-4">
                                  {update.replies.map((reply, replyIndex) => {
                                    const replyAuthor = getUser(reply.author_email);
                                    return (
                                      <div key={replyIndex} className="flex items-start gap-3">
                                        <Avatar className="w-8 h-8">
                                          <AvatarFallback className="text-xs">
                                            {getInitials(replyAuthor?.full_name || reply.author_email)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium text-gray-900">
                                              {replyAuthor?.full_name || reply.author_email}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                              {formatDistanceToNow(new Date(reply.created_date), { addSuffix: true })}
                                            </span>
                                          </div>
                                          <p className="text-sm text-gray-700">{reply.content}</p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                              
                              {/* Reply Input */}
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                                    You
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 flex items-center gap-2">
                                  <Input
                                    placeholder="Write a reply..."
                                    value={replyContent[update.id] || ''}
                                    onChange={(e) => setReplyContent(prev => ({ ...prev, [update.id]: e.target.value }))}
                                    className="flex-1"
                                    onKeyPress={(e) => e.key === 'Enter' && handleReply(update.id)}
                                  />
                                  <Button
                                    size="icon"
                                    onClick={() => handleReply(update.id)}
                                    disabled={!replyContent[update.id]?.trim()}
                                    className="shrink-0"
                                  >
                                    <Send className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </AnimatePresence>
              )}
              
              {filteredUpdates.length === 0 && !isLoading && (
                <Card className="border-0 shadow-lg glass-card">
                  <CardContent className="p-12 text-center">
                    <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No updates found</h3>
                    <p className="text-gray-600">
                      {timeFilter !== "all" 
                        ? `No project updates were posted ${getTimeFilterLabel(timeFilter).toLowerCase()}.`
                        : "No project updates have been posted yet."
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}