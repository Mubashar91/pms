import React, { useState, useEffect, useCallback } from "react";
import {motion, AnimatePresence } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Calendar,
  Send
} from "lucide-react";
import statusUpdates from "@/entities/StatusUpdate.json";
import User from "@/entities/User.json";
import { format, formatDistanceToNow } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const updateTypeIcons = {
  "Daily Standup": Clock,
  "Weekly Summary": Calendar,
  "Milestone": CheckCircle2,
  "Issue": AlertTriangle,
  "General": Info
};

const updateTypeColors = {
  "Daily Standup": "bg-blue-100 text-blue-800",
  "Weekly Summary": "bg-purple-100 text-purple-800",
  "Milestone": "bg-green-100 text-green-800",
  "Issue": "bg-red-100 text-red-800",
  "General": "bg-gray-100 text-gray-800"
};

export default function StatusUpdates({ projects, selectedProjectId }) {
  const [updates, setUpdates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newUpdate, setNewUpdate] = useState({
    project_id: selectedProjectId || '',
    update_text: '',
    update_type: 'General',
    blockers: '',
    next_steps: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const loadUpdates = useCallback(() => {
    try {
      const filteredUpdates = selectedProjectId 
        ? statusUpdates.filter(update => update.project_id === selectedProjectId)
        : statusUpdates;
      setUpdates(filteredUpdates);
    } catch (error) {
      console.error("Error loading updates:", error);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    loadUpdates();
  }, [loadUpdates]);
  
  useEffect(() => {
    if (selectedProjectId) {
      setNewUpdate(prev => ({ ...prev, project_id: selectedProjectId }));
    }
  }, [selectedProjectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newUpdate.update_text.trim() || !newUpdate.project_id) return;
    
    setIsSubmitting(true);
    try {
      // Create a new update object
      const newUpdateObj = {
        id: String(updates.length + 1),
        ...newUpdate,
        created_by: "current.user@company.com", // Replace with actual user email
        created_date: new Date().toISOString()
      };
      
      // Update the local state
      setUpdates(prev => [newUpdateObj, ...prev]);
      
      // Reset form
      setNewUpdate({
        project_id: selectedProjectId || '',
        update_text: '',
        update_type: 'General',
        blockers: '',
        next_steps: ''
      });
      setShowForm(false);
    } catch (error) {
      console.error("Error creating update:", error);
    }
    setIsSubmitting(false);
  };
  
  const getProjectTitle = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.title || 'Unknown Project';
  };

  return (
    <Card className="border-0 shadow-lg glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="w-5 h-5 text-green-600" />
            Status Updates
            {selectedProjectId && (
              <Badge variant="outline" className="ml-2">
                {getProjectTitle(selectedProjectId)}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(!showForm)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Update
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 border-b border-gray-100"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    value={newUpdate.project_id}
                    onValueChange={(value) => setNewUpdate(prev => ({ ...prev, project_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={newUpdate.update_type}
                    onValueChange={(value) => setNewUpdate(prev => ({ ...prev, update_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Update type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(updateTypeIcons).map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Textarea
                  placeholder="What's the current status? What progress has been made?"
                  value={newUpdate.update_text}
                  onChange={(e) => setNewUpdate(prev => ({ ...prev, update_text: e.target.value }))}
                  className="min-h-20"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Textarea
                    placeholder="Any blockers or issues?"
                    value={newUpdate.blockers}
                    onChange={(e) => setNewUpdate(prev => ({ ...prev, blockers: e.target.value }))}
                    className="min-h-16"
                  />
                  
                  <Textarea
                    placeholder="Next steps planned?"
                    value={newUpdate.next_steps}
                    onChange={(e) => setNewUpdate(prev => ({ ...prev, next_steps: e.target.value }))}
                    className="min-h-16"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!newUpdate.update_text.trim() || !newUpdate.project_id || isSubmitting}
                    className="gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? "Posting..." : "Post Update"}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        
        <ScrollArea className="h-96">
          <div className="p-4 space-y-4">
            {updates.map((update) => {
              const UpdateIcon = updateTypeIcons[update.update_type] || Info;
              
              return (
                <motion.div
                  key={update.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8 mt-1">
                      <AvatarFallback className="text-xs">
                        {update.created_by?.split('@')[0]?.slice(0, 2)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${updateTypeColors[update.update_type]} text-xs`}>
                          <UpdateIcon className="w-3 h-3 mr-1" />
                          {update.update_type}
                        </Badge>
                        
                        {!selectedProjectId && (
                          <Badge variant="outline" className="text-xs">
                            {getProjectTitle(update.project_id)}
                          </Badge>
                        )}
                        
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(update.created_date), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-900 mb-3 leading-relaxed">
                        {update.update_text}
                      </p>
                      
                      {(update.blockers || update.next_steps) && (
                        <div className="space-y-2">
                          {update.blockers && (
                            <div className="p-2 bg-red-50 border-l-2 border-red-300 rounded-r">
                              <div className="text-xs font-medium text-red-700 mb-1">Blockers:</div>
                              <div className="text-xs text-red-600">{update.blockers}</div>
                            </div>
                          )}
                          
                          {update.next_steps && (
                            <div className="p-2 bg-blue-50 border-l-2 border-blue-300 rounded-r">
                              <div className="text-xs font-medium text-blue-700 mb-1">Next Steps:</div>
                              <div className="text-xs text-blue-600">{update.next_steps}</div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                        <span>by {update.created_by}</span>
                        <span>•</span>
                        <span>{format(new Date(update.created_date), "MMM d, yyyy 'at' h:mm a")}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            
            {updates.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No status updates yet</p>
                <p className="text-xs text-gray-400">Be the first to share an update</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}