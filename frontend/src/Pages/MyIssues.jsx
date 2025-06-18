import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Issue from "@/entities/Issue.json";
import Project from "@/entities/Project.json";
import User from "@/entities/User.json";
import IssueComment from "@/entities/IssueComment.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User as UserIcon,
  Search,
  Filter,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Bug,
  Lightbulb,
  CheckSquare,
  Zap,
  MoreHorizontal,
  MessageSquare,
  Send,
  ChevronDown,
  X
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

const typeIcons = {
  "Bug": Bug,
  "Feature": Lightbulb,
  "Task": CheckSquare,
  "Improvement": TrendingUp,
  "Epic": Zap,
  "Story": CheckSquare
};

const typeColors = {
  "Bug": "bg-red-100 text-red-800",
  "Feature": "bg-blue-100 text-blue-800",
  "Task": "bg-green-100 text-green-800",
  "Improvement": "bg-purple-100 text-purple-800",
  "Epic": "bg-yellow-100 text-yellow-800",
  "Story": "bg-indigo-100 text-indigo-800"
};

const priorityColors = {
  "Low": "bg-gray-100 text-gray-800",
  "Medium": "bg-yellow-100 text-yellow-800",
  "High": "bg-orange-100 text-orange-800",
  "Critical": "bg-red-100 text-red-800"
};

const statusColors = {
  "Backlog": "bg-slate-100 text-slate-800",
  "Planned": "bg-blue-100 text-blue-800",
  "In Progress": "bg-indigo-100 text-indigo-800",
  "Review": "bg-purple-100 text-purple-800",
  "Testing": "bg-amber-100 text-amber-800",
  "Done": "bg-green-100 text-green-800",
  "Cancelled": "bg-red-100 text-red-800"
};

export default function MyIssues() {
  const [issues, setIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("priority");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    loadMyIssues();
  }, []);

  const loadMyIssues = async () => {
    setIsLoading(true);
    try {
      const user = User;
      const allIssues = Array.isArray(Issue) ? Issue : [];
      const projectsData = Array.isArray(Project) ? Project : [];
      const commentsData = Array.isArray(IssueComment) ? IssueComment : [];

      setCurrentUser(user);
      const myIssues = allIssues.filter(issue =>
        issue.assignee_email === user.email ||
        (issue.assignees && issue.assignees.includes(user.email))
      );
      setIssues(myIssues);
      setProjects(projectsData);
      setComments(commentsData);
    } catch (error) {
      console.error("Error loading my issues:", error);
    }
    setIsLoading(false);
  };

  const handleUpdateIssue = async (issueId, updates) => {
    try {
      setIssues(issues.map(issue => 
        issue.id === issueId ? { ...issue, ...updates } : issue
      ));
    } catch (error) {
      console.error("Error updating issue:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedIssue) return;

    try {
      const newCommentObj = {
        id: `comment${comments.length + 1}`,
        issue_id: selectedIssue.id,
        content: newComment,
        author_email: currentUser.email,
        created_date: new Date().toISOString()
      };
      setComments([...comments, newCommentObj]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const filteredAndSortedIssues = issues
    .filter(issue => {
      const titleMatch = issue.title.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = filterStatus === "all" || issue.status === filterStatus;
      return titleMatch && statusMatch;
    })
    .sort((a, b) => {
      const priorityOrder = { "Critical": 4, "High": 3, "Medium": 2, "Low": 1 };
      switch (sortBy) {
        case "priority":
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case "due_date":
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date) - new Date(b.due_date);
        case "created_date":
          return new Date(b.created_date) - new Date(a.created_date);
        default:
          return 0;
      }
    });

  const getWorkloadSummary = () => {
    const total = issues.length;
    const byStatus = issues.reduce((acc, issue) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1;
      return acc;
    }, {});

    const overdue = issues.filter(issue =>
      issue.due_date && new Date(issue.due_date) < new Date() && issue.status !== "Done"
    ).length;

    return { total, byStatus, overdue };
  };

  const workload = getWorkloadSummary();
  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <div className="flex h-full bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Issues</h1>
          <p className="text-gray-600">Track and manage issues assigned to you</p>
        </div>

        {/* Workload Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Issues</p>
                  <p className="text-2xl font-bold text-gray-900">{workload.total}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{workload.byStatus["In Progress"] || 0}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-gray-900">{workload.overdue}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{workload.byStatus["Done"] || 0}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full md:max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search my issues..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="due_date">Due Date</SelectItem>
                    <SelectItem value="created_date">Created</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {Object.keys(statusColors).map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issues List */}
        <div className="space-y-4">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="h-20 bg-gray-200 rounded animate-pulse" />
                </CardContent>
              </Card>
            ))
          ) : (
            <AnimatePresence>
              {filteredAndSortedIssues.map((issue, index) => {
                const TypeIcon = typeIcons[issue.type] || CheckSquare;
                const project = projects.find(p => p.id === issue.project_id);
                const issueComments = comments.filter(c => c.issue_id === issue.id);

                return (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedIssue(issue)}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className={`${typeColors[issue.type]} text-xs`}>
                                <TypeIcon className="w-3 h-3 mr-1" />
                                {issue.type}
                              </Badge>
                              <Badge className={`${priorityColors[issue.priority]} text-xs`}>
                                {issue.priority}
                              </Badge>
                              <Badge className={`${statusColors[issue.status]} text-xs`}>
                                {issue.status}
                              </Badge>
                              {project && (
                                <Badge variant="outline" className="text-xs">
                                  {project.title}
                                </Badge>
                              )}
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{issue.title}</h3>

                            {issue.description && (
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{issue.description}</p>
                            )}

                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              {issue.due_date && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span className={
                                    new Date(issue.due_date) < new Date() && issue.status !== "Done"
                                      ? "text-red-600 font-medium"
                                      : ""
                                  }>
                                    Due {format(new Date(issue.due_date), "MMM d")}
                                  </span>
                                </div>
                              )}

                              {issueComments.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="w-4 h-4" />
                                  <span>{issueComments.length} comments</span>
                                </div>
                              )}

                              <span>Created {formatDistanceToNow(new Date(issue.created_date), { addSuffix: true })}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                  {issue.status}
                                  <ChevronDown className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {Object.keys(statusColors).map(status => (
                                  <DropdownMenuItem
                                    key={status}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateIssue(issue.id, { status });
                                    }}
                                  >
                                    <Badge className={`${statusColors[status]} mr-2`}>
                                      {status}
                                    </Badge>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>

                            <Button variant="ghost" size="icon" onClick={() => setSelectedIssue(issue)}>
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}

          {filteredAndSortedIssues.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <UserIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
              <p className="text-gray-600">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "You don't have any issues assigned yet"
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Issue Detail Slide-over */}
      <AnimatePresence>
        {selectedIssue && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Issue Details</h2>
              <Button variant="ghost" size="icon" onClick={() => setSelectedIssue(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                {/* Issue Info */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    {React.createElement(typeIcons[selectedIssue.type] || CheckSquare, { className: "w-5 h-5 text-blue-600" })}
                    <h3 className="text-xl font-semibold">{selectedIssue.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <Badge className={`${typeColors[selectedIssue.type]}`}>
                      {selectedIssue.type}
                    </Badge>
                    <Badge className={`${priorityColors[selectedIssue.priority]}`}>
                      {selectedIssue.priority}
                    </Badge>
                    <Badge className={`${statusColors[selectedIssue.status]}`}>
                      {selectedIssue.status}
                    </Badge>
                  </div>

                  {selectedIssue.description && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-700">{selectedIssue.description}</p>
                    </div>
                  )}
                </div>

                {/* Properties */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Properties</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Project</span>
                      <span>{projects.find(p => p.id === selectedIssue.project_id)?.title || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Assignee</span>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback className="text-xs">
                            {getInitials(currentUser?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{currentUser?.full_name}</span>
                      </div>
                    </div>
                    {selectedIssue.due_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Due Date</span>
                        <span className={
                          new Date(selectedIssue.due_date) < new Date() && selectedIssue.status !== "Done"
                            ? "text-red-600 font-medium"
                            : ""
                        }>
                          {format(new Date(selectedIssue.due_date), "MMM d, yyyy")}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Created</span>
                      <span>{format(new Date(selectedIssue.created_date), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Comments</h4>
                  <div className="space-y-3">
                    {comments.filter(c => c.issue_id === selectedIssue.id).map(comment => (
                      <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                            {comment.author_email.split('@')[0].slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{comment.author_email}</span>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(comment.created_date), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment */}
                  <div className="flex gap-2 mt-3">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1"
                      rows={3}
                    />
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      size="sm"
                      className="self-end"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Actions */}
            <div className="border-t p-4 space-y-2">
              <Select value={selectedIssue.status} onValueChange={(value) => handleUpdateIssue(selectedIssue.id, { status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(statusColors).map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedIssue.priority} onValueChange={(value) => handleUpdateIssue(selectedIssue.id, { priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(priorityColors).map(priority => (
                    <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

 