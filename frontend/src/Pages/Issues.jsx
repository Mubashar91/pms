import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Issue } from "@/entities/Issue";
import { Project } from "@/entities/Project";
import { User } from "@/entities/User";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Search,
  Filter,
  Bug,
  Lightbulb,
  CheckSquare,
  TrendingUp,
  Zap,
} from "lucide-react";
import IssueDetailPanel from "../components/issues/IssueDetailPanel";

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
  "Low": "bg-blue-100 text-blue-800",
  "Medium": "bg-yellow-100 text-yellow-800",
  "High": "bg-orange-100 text-orange-800",
  "Critical": "bg-red-100 text-red-800"
};

const columns = [
  { id: "Backlog", title: "Backlog" },
  { id: "Planned", title: "Planned" },
  { id: "In Progress", title: "In Progress" },
  { id: "Review", title: "Review" },
  { id: "Testing", title: "Testing" },
  { id: "Done", title: "Done" },
];

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    project: "all",
    type: "all",
    priority: "all",
    assignee: "all",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [draggedIssue, setDraggedIssue] = useState(null);
  const [selectedIssueId, setSelectedIssueId] = useState(null);

  useEffect(() => {
    loadIssuesData();
  }, []);

  const loadIssuesData = async () => {
    setIsLoading(true);
    try {
      const [issuesData, projectsData, usersData] = await Promise.all([
        Issue.list("-created_date"),
        Project.list("-created_date"),
        User.list()
      ]);
      setIssues(issuesData);
      setProjects(projectsData);
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading issues data:", error);
    }
    setIsLoading(false);
  };

  const handleUpdateIssue = async (issueId, updates) => {
    try {
      await Issue.update(issueId, updates);
      loadIssuesData();
    } catch (error) {
      console.error("Error updating issue:", error);
    }
  };

  const handleDragStart = (e, issue) => {
    setDraggedIssue(issue);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (draggedIssue && draggedIssue.status !== newStatus) {
      await handleUpdateIssue(draggedIssue.id, { status: newStatus });
    }
    setDraggedIssue(null);
  };
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredIssues = issues.filter(issue => {
    const titleMatch = issue.title.toLowerCase().includes(searchTerm.toLowerCase());
    const projectMatch = filters.project === "all" || issue.project_id === filters.project;
    const typeMatch = filters.type === "all" || issue.type === filters.type;
    const priorityMatch = filters.priority === "all" || issue.priority === filters.priority;
    const assigneeMatch = filters.assignee === "all" || issue.assignee_email === filters.assignee;
    return titleMatch && projectMatch && typeMatch && priorityMatch && assigneeMatch;
  });

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <>
      <div className="p-6 space-y-6 flex flex-col h-full" style={{backgroundColor: 'var(--neutral-50)'}}>
        <div className="max-w-full mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Issues</h1>
              <p className="text-gray-600 mt-1">Track bugs, features, and tasks across projects</p>
            </div>
            <Button onClick={() => setSelectedIssueId('new')} className="gap-2 text-white" style={{backgroundColor: 'var(--primary-blue)'}}>
              <Plus className="w-4 h-4" />
              New Issue
            </Button>
          </div>

          {/* Filters */}
          <Card className="border-0 shadow-lg glass-card mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-center flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search issues..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filters.project} onValueChange={(v) => handleFilterChange('project', v)}>
                  <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="All Projects" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filters.type} onValueChange={(v) => handleFilterChange('type', v)}>
                  <SelectTrigger className="w-full md:w-32"><SelectValue placeholder="All Types" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.keys(typeIcons).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filters.priority} onValueChange={(v) => handleFilterChange('priority', v)}>
                  <SelectTrigger className="w-full md:w-32"><SelectValue placeholder="Priority" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    {Object.keys(priorityColors).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filters.assignee} onValueChange={(v) => handleFilterChange('assignee', v)}>
                  <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="All Assignees" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assignees</SelectItem>
                    {users.map(u => <SelectItem key={u.id} value={u.email}>{u.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Issues Board */}
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
          {columns.map(column => {
            const columnIssues = filteredIssues.filter(i => i.status === column.id);
            return (
              <div
                key={column.id}
                className="flex-shrink-0 w-80 bg-white rounded-lg border border-gray-200 h-full flex flex-col"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-medium text-sm text-gray-700">
                    {column.title} <span className="text-gray-400">({columnIssues.length})</span>
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-6 h-6"
                    onClick={() => {
                      setSelectedIssueId('new');
                      // TODO: Prefill status in the modal
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                  {isLoading && <div className="h-20 bg-gray-200 rounded animate-pulse" />}
                  {columnIssues.map((issue) => {
                    const TypeIcon = typeIcons[issue.type] || CheckSquare;
                    const assignee = users.find(u => u.email === issue.assignee_email);
                    
                    return (
                      <motion.div
                        key={issue.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, issue)}
                        onClick={() => setSelectedIssueId(issue.id)}
                        className="bg-white p-3 rounded-md border border-gray-200 hover:border-blue-300 cursor-pointer shadow-sm hover:shadow-md transition-all"
                      >
                        <h4 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">
                          {issue.title}
                        </h4>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <Badge className={`${typeColors[issue.type]} text-xs`}>
                              <TypeIcon className="w-3 h-3 mr-1" />
                              {issue.type}
                            </Badge>
                            <Badge className={`${priorityColors[issue.priority]} text-xs`}>
                              {issue.priority}
                            </Badge>
                          </div>
                          
                          {assignee && (
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                                {getInitials(assignee.full_name)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <IssueDetailPanel 
        issueId={selectedIssueId} 
        onClose={() => setSelectedIssueId(null)}
        onUpdate={loadIssuesData}
        projects={projects}
        users={users}
      />
    </>
  );
}