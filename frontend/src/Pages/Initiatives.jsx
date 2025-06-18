import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import initiativesData from "@/entities/initiativesData.json";
import projectData from "@/entities/Project.json";
import userData from "@/entities/usersData.json";
import updatesData from "@/entities/updatesData.json"; // This file needs to be created if it doesn't exist
// Removing UploadFile import since we're using static data
// import { UploadFile } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Target, 
  Plus, 
  Search,
  Filter,
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  FolderOpen,
  AlertCircle,
  CheckCircle2,
  Clock,
  Grid3X3,
  List,
  Edit3,
  MessageSquare,
  Paperclip,
  Send,
  Heart,
  ThumbsUp,
  Smile,
  FileText, // New
  User as UserIcon, // Renamed to avoid conflict with User entity
  Info, // New
  Flag, // New
  ListTodo, // New
  StickyNote, // New
  X // New
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { AnimatePresence } from "framer-motion";

const statusColors = {
  "Planning": "bg-blue-100 text-blue-800",
  "Active": "bg-green-100 text-green-800",
  "On Hold": "bg-yellow-100 text-yellow-800",
  "Completed": "bg-gray-100 text-gray-800",
  "Cancelled": "bg-red-100 text-red-800"
};

const priorityColors = {
  "Low": "bg-gray-100 text-gray-800",
  "Medium": "bg-yellow-100 text-yellow-800",
  "High": "bg-orange-100 text-orange-800",
  "Critical": "bg-red-100 text-red-800"
};

const statusIcons = {
  "Planning": Clock,
  "Active": TrendingUp,
  "On Hold": AlertCircle,
  "Completed": CheckCircle2,
  "Cancelled": AlertCircle
};

const updateStatusConfig = {
  'On Track': { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', text: 'text-green-800' },
  'At Risk': { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'Off Track': { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', text: 'text-red-800' },
};

export default function Initiatives() {
  const [initiatives, setInitiatives] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("card");
  const [isLoading, setIsLoading] = useState(true);
  const [isNewInitiativeOpen, setIsNewInitiativeOpen] = useState(false);
  const [selectedInitiative, setSelectedInitiative] = useState(null);
  const [newInitiative, setNewInitiative] = useState({
    title: '',
    description: '',
    status: 'Planning',
    priority: 'Medium',
    owner_email: '',
    start_date: '',
    target_date: '',
    budget: '',
    quarter: '',
    objectives: [''],
    notes: ''
  });
  
  const [editingInitiative, setEditingInitiative] = useState(null);

  // Update state
  const [newUpdate, setNewUpdate] = useState({
    title: '',
    content: '',
    status: 'On Track',
    attachments: []
  });
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [replyContent, setReplyContent] = useState({});

  useEffect(() => {
    setInitiatives(initiativesData);
    setProjects(projectData);
    setUsers(userData);
    setUpdates(updatesData);
    setIsLoading(false);
  }, []);

  const handleSubmitUpdate = async () => {
    if (!newUpdate.content.trim() || !selectedInitiative) return;
    
    try {
      await ProjectUpdate.create({
        initiative_id: selectedInitiative.id,
        title: newUpdate.title,
        content: newUpdate.content,
        status: newUpdate.status,
        attachments: newUpdate.attachments
      });
      
      setNewUpdate({ title: '', content: '', status: 'On Track', attachments: [] });
      setShowUpdateForm(false);
      loadInitiativesData();
    } catch (error) {
      console.error("Failed to create update:", error);
    }
  };

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
      loadInitiativesData();
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
      loadInitiativesData();
    } catch (error) {
      console.error("Failed to add reply:", error);
    }
  };

  const getInitiativeStats = (initiative) => {
    const relatedProjects = projects.filter(p => 
      initiative.related_project_ids?.includes(p.id)
    );
    
    const completedProjects = relatedProjects.filter(p => p.status === 'Completed').length;
    const totalProjects = relatedProjects.length;
    const avgProgress = totalProjects > 0 
      ? relatedProjects.reduce((sum, p) => sum + (p.progress || 0), 0) / totalProjects
      : 0;

    return {
      relatedProjects: totalProjects,
      completedProjects,
      progress: Math.round(avgProgress),
      teamSize: new Set(relatedProjects.flatMap(p => p.team_members?.map(m => m.user_email) || [])).size
    };
  };

  const filteredInitiatives = initiatives.filter(initiative => {
    const titleMatch = initiative.title.toLowerCase().includes(searchTerm.toLowerCase());
    const phaseMatch = selectedPhase === "all" || initiative.status === selectedPhase;
    return titleMatch && phaseMatch;
  });

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  const getUser = (email) => users.find(u => u.email === email);

  const getInitiativeUpdates = (initiativeId) => {
    return updates.filter(update => update.initiative_id === initiativeId);
  };

  const handleOpenEditModal = (initiative) => {
    setEditingInitiative({ ...initiative });
    setIsNewInitiativeOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsNewInitiativeOpen(false);
    setEditingInitiative(null);
    setSelectedInitiative(null); // Ensure detail modal also closes if open
    setNewInitiative({ // Reset new initiative form to default
      title: '',
      description: '',
      status: 'Planning',
      priority: 'Medium',
      owner_email: '',
      start_date: '',
      target_date: '',
      budget: '',
      quarter: '',
      objectives: [''],
      notes: ''
    });
  };
  
  const currentInitiativeData = editingInitiative || newInitiative;
  
  const handleFieldChange = (field, value) => {
    const setter = editingInitiative ? setEditingInitiative : setNewInitiative;
    setter(prev => ({...prev, [field]: value}));
  };

  const handleObjectiveChange = (index, value) => {
    const setter = editingInitiative ? setEditingInitiative : setNewInitiative;
    setter(prev => {
      const newObjectives = [...(prev.objectives || [''])];
      newObjectives[index] = value;
      return {...prev, objectives: newObjectives };
    });
  };
  
  const handleAddObjective = () => {
    const setter = editingInitiative ? setEditingInitiative : setNewInitiative;
    setter(prev => ({ ...prev, objectives: [...(prev.objectives || []), ''] }));
  };

  const handleRemoveObjective = (index) => {
    const setter = editingInitiative ? setEditingInitiative : setNewInitiative;
    setter(prev => ({ ...prev, objectives: (prev.objectives || []).filter((_, i) => i !== index) }));
  };
  
  const handleSaveInitiative = async () => {
    if (!currentInitiativeData.title?.trim()) return;
    
    try {
      const cleanedObjectives = (currentInitiativeData.objectives || []).filter(obj => obj.trim());
      const dataToSave = {
        ...currentInitiativeData,
        objectives: cleanedObjectives,
        budget: currentInitiativeData.budget ? parseFloat(currentInitiativeData.budget) : undefined
      };

      if (editingInitiative) {
        await Initiative.update(editingInitiative.id, dataToSave);
      } else {
        await Initiative.create(dataToSave);
      }
      
      handleCloseModal();
      loadInitiativesData();
    } catch (error) {
      console.error("Error saving initiative:", error);
    }
  };

  return (
    <div className="p-6 space-y-6" style={{backgroundColor: 'var(--neutral-50)'}}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Initiatives</h1>
            <p className="text-gray-600 mt-1">Strategic goals and long-term project organization</p>
          </div>
          <Button onClick={() => setIsNewInitiativeOpen(true)} className="gap-2 text-white" style={{backgroundColor: 'var(--primary-blue)'}}>
            <Plus className="w-4 h-4" />
            New Initiative
          </Button>
        </div>

        {/* Filters and View Toggle */}
        <Card className="border-0 shadow-lg glass-card mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full md:max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search initiatives..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  {["all", "Planning", "Active", "On Hold", "Completed"].map(phase => (
                    <Button
                      key={phase}
                      variant={selectedPhase === phase ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPhase(phase)}
                      className="capitalize"
                    >
                      {phase === "all" ? "All Phases" : phase}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center border rounded-md">
                  <Button
                    variant={viewMode === "card" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("card")}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Initiatives Grid/List */}
        {viewMode === "card" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <Card key={i} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="h-48 bg-gray-200 rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))
            ) : (
              filteredInitiatives.map((initiative, index) => {
                const stats = getInitiativeStats(initiative);
                const owner = users.find(u => u.email === initiative.owner_email);
                const StatusIcon = statusIcons[initiative.status] || Clock;
                
                return (
                  <motion.div
                    key={initiative.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className="border-0 shadow-lg glass-card hover-lift cursor-pointer transition-all duration-300"
                      onClick={() => setSelectedInitiative(initiative)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <CardTitle className="text-xl text-gray-900 mb-2">{initiative.title}</CardTitle>
                            <p className="text-gray-600 text-sm line-clamp-2">{initiative.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusIcon className="w-6 h-6 text-gray-400" />
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditModal(initiative);
                              }}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={statusColors[initiative.status]}>
                            {initiative.status}
                          </Badge>
                          <Badge className={priorityColors[initiative.priority]}>
                            {initiative.priority}
                          </Badge>
                          {initiative.quarter && (
                            <Badge variant="outline" className="gap-1">
                              <Calendar className="w-3 h-3" />
                              {initiative.quarter}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              Overall Progress
                            </span>
                            <span className="font-semibold text-gray-900">{stats.progress}%</span>
                          </div>
                          <Progress value={stats.progress} className="h-2" />
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <FolderOpen className="w-3 h-3" />
                              Projects
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {stats.completedProjects}/{stats.relatedProjects}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Users className="w-3 h-3" />
                              Team
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {stats.teamSize} members
                            </div>
                          </div>
                        </div>

                        {/* Budget */}
                        {initiative.budget && (
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">Budget</span>
                            </div>
                            <span className="text-sm font-bold text-green-900">
                              ${initiative.budget.toLocaleString()}
                            </span>
                          </div>
                        )}

                        {/* Owner */}
                        {owner && (
                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                                {getInitials(owner.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{owner.full_name}</p>
                              <p className="text-xs text-gray-500">Initiative Owner</p>
                            </div>
                          </div>
                        )}













                        

                        {/* Timeline */}
                        {initiative.target_date && (
                          <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
                            <span>Target Date</span>
                            <span className="font-medium">
                              {format(new Date(initiative.target_date), "MMM d, yyyy")}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredInitiatives.map((initiative, index) => {
              const stats = getInitiativeStats(initiative);
              const owner = getUser(initiative.owner_email);
              const StatusIcon = statusIcons[initiative.status] || Clock;
              
              return (
                <motion.div
                  key={initiative.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className="border-0 shadow-lg glass-card hover-lift cursor-pointer transition-all duration-300"
                    onClick={() => setSelectedInitiative(initiative)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <StatusIcon className="w-8 h-8 text-gray-400" />
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{initiative.title}</h3>
                            <p className="text-gray-600 text-sm line-clamp-1">{initiative.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={statusColors[initiative.status]}>{initiative.status}</Badge>
                              <Badge className={priorityColors[initiative.priority]}>{initiative.priority}</Badge>
                              {owner && <span className="text-sm text-gray-500">Owner: {owner.full_name}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{stats.progress}%</div>
                            <div className="text-xs text-gray-500">Progress</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-900">{stats.relatedProjects}</div>
                            <div className="text-xs text-gray-500">Projects</div>
                          </div>
                          {initiative.budget && (
                            <div className="text-center">
                              <div className="text-lg font-semibold text-green-600">${(initiative.budget / 1000).toFixed(0)}K</div>
                              <div className="text-xs text-gray-500">Budget</div>
                            </div>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditModal(initiative);
                            }}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {filteredInitiatives.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">
            <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No initiatives found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedPhase !== "all" 
                ? "Try adjusting your search or filters" 
                : "Create your first initiative to organize strategic goals"
              }
            </p>
          </div>
        )}
      </div>

      {/* Initiative Detail Modal */}
      <Dialog open={!!selectedInitiative && !isNewInitiativeOpen} onOpenChange={() => setSelectedInitiative(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedInitiative && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-2xl">{selectedInitiative.title}</DialogTitle>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => setShowUpdateForm(!showUpdateForm)} size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Update
                    </Button>
                    <Button onClick={() => handleOpenEditModal(selectedInitiative)} size="sm" variant="outline" className="gap-2">
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Initiative Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                    <Badge className={statusColors[selectedInitiative.status]}>{selectedInitiative.status}</Badge>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Priority</h4>
                    <Badge className={priorityColors[selectedInitiative.priority]}>{selectedInitiative.priority}</Badge>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">{selectedInitiative.description}</p>
                </div>

                {/* Updates Section */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Updates</h4>
                  
                  <AnimatePresence>
                    {showUpdateForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="space-y-4">
                          <Input
                            placeholder="Update title (optional)"
                            value={newUpdate.title}
                            onChange={(e) => setNewUpdate(prev => ({ ...prev, title: e.target.value }))}
                          />
                          <Textarea
                            placeholder="What's the update?"
                            value={newUpdate.content}
                            onChange={(e) => setNewUpdate(prev => ({ ...prev, content: e.target.value }))}
                            rows={3}
                          />
                          <div className="flex items-center justify-between">
                            <Select
                              value={newUpdate.status}
                              onValueChange={(value) => setNewUpdate(prev => ({ ...prev, status: value }))}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(updateStatusConfig).map(status => (
                                  <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex gap-2">
                              <Button variant="outline" onClick={() => setShowUpdateForm(false)}>Cancel</Button>
                              <Button onClick={handleSubmitUpdate} disabled={!newUpdate.content.trim()}>Post Update</Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Updates List */}
                  <div className="space-y-4">
                    {getInitiativeUpdates(selectedInitiative.id).map(update => {
                      const author = getUser(update.created_by);
                      const StatusIcon = updateStatusConfig[update.status]?.icon || CheckCircle2;
                      
                      return (
                        <div key={update.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback>
                                {getInitials(author?.full_name || update.created_by)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">{author?.full_name || update.created_by}</span>
                                <Badge className={`${updateStatusConfig[update.status]?.bg} ${updateStatusConfig[update.status]?.text} gap-1`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {update.status}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  {formatDistanceToNow(new Date(update.created_date), { addSuffix: true })}
                                </span>
                              </div>
                              
                              {update.title && (
                                <h5 className="font-medium mb-2">{update.title}</h5>
                              )}
                              
                              <p className="text-gray-700 mb-3">{update.content}</p>
                              
                              {/* Reactions and Reply */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-1">
                                    {['👍', '❤️', '😄'].map(emoji => {
                                      const reactionCount = (update.reactions || []).filter(r => r.emoji === emoji).length;
                                      return (
                                        <Button
                                          key={emoji}
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleReaction(update.id, emoji)}
                                          className="h-8 px-2 gap-1"
                                        >
                                          <span>{emoji}</span>
                                          {reactionCount > 0 && <span className="text-xs">{reactionCount}</span>}
                                        </Button>
                                      );
                                    })}
                                  </div>
                                  <Button variant="ghost" size="sm" className="gap-1">
                                    <MessageSquare className="w-4 h-4" />
                                    Reply ({(update.replies || []).length})
                                  </Button>
                                </div>
                              </div>
                              
                              {/* Reply Input */}
                              <div className="mt-3 flex items-center gap-2">
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
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {getInitiativeUpdates(selectedInitiative.id).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No updates yet. Be the first to share an update!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New/Edit Initiative Modal */}
      <Dialog open={isNewInitiativeOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingInitiative ? 'Edit Initiative' : 'Create New Initiative'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FileText className="w-4 h-4 text-gray-500" />
                    Initiative Title
                </label>
                <Input
                  placeholder="E.g., Q3 Marketing Campaign"
                  value={currentInitiativeData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                />
            </div>
            
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Info className="w-4 h-4 text-gray-500" />
                    Description
                </label>
                <Textarea
                  placeholder="A brief description of the initiative's purpose and goals."
                  value={currentInitiativeData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  rows={3}
                />
            </div>
              
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Flag className="w-4 h-4 text-gray-500" />
                      Status
                  </label>
                  <Select value={currentInitiativeData.status} onValueChange={(value) => handleFieldChange('status', value)}>
                    <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(statusColors).map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                    </SelectContent>
                  </Select>
              </div>
              <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <AlertCircle className="w-4 h-4 text-gray-500" />
                      Priority
                  </label>
                  <Select value={currentInitiativeData.priority} onValueChange={(value) => handleFieldChange('priority', value)}>
                    <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(priorityColors).map(priority => <SelectItem key={priority} value={priority}>{priority}</SelectItem>)}
                    </SelectContent>
                  </Select>
              </div>
              <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <UserIcon className="w-4 h-4 text-gray-500" />
                      Owner
                  </label>
                  <Select value={currentInitiativeData.owner_email} onValueChange={(value) => handleFieldChange('owner_email', value)}>
                    <SelectTrigger><SelectValue placeholder="Initiative owner" /></SelectTrigger>
                    <SelectContent>
                      {users.map(user => <SelectItem key={user.id} value={user.email}>{user.full_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
              </div>
              <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      Quarter
                  </label>
                  <Input
                    placeholder="E.g., Q1 2025"
                    value={currentInitiativeData.quarter}
                    onChange={(e) => handleFieldChange('quarter', e.target.value)}
                  />
              </div>
              <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      Start Date
                  </label>
                  <Input
                    type="date"
                    value={currentInitiativeData.start_date?.split('T')[0] || ''}
                    onChange={(e) => handleFieldChange('start_date', e.target.value)}
                  />
              </div>
              <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Target className="w-4 h-4 text-gray-500" />
                      Target Date
                  </label>
                  <Input
                    type="date"
                    value={currentInitiativeData.target_date?.split('T')[0] || ''}
                    onChange={(e) => handleFieldChange('target_date', e.target.value)}
                  />
              </div>
              <div className="space-y-2 md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      Budget
                  </label>
                  <Input
                    type="number"
                    placeholder="Optional budget allocation"
                    value={currentInitiativeData.budget}
                    onChange={(e) => handleFieldChange('budget', e.target.value)}
                  />
              </div>
            </div>

            {/* Objectives */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <ListTodo className="w-4 h-4 text-gray-500" />
                    Strategic Objectives
                </label>
                <Button type="button" onClick={handleAddObjective} size="sm" variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {(currentInitiativeData.objectives || ['']).map((objective, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Objective ${index + 1}`}
                      value={objective}
                      onChange={(e) => handleObjectiveChange(index, e.target.value)}
                      className="flex-1"
                    />
                    {(currentInitiativeData.objectives?.length > 1) && (
                      <Button
                        type="button"
                        onClick={() => handleRemoveObjective(index)}
                        size="icon"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 h-9 w-9"
                      >
                        <X className="w-4 h-4"/>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Research Notes */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <StickyNote className="w-4 h-4 text-gray-500" />
                  Research Notes
              </label>
              <Textarea
                placeholder="Add research notes, findings, or additional context..."
                value={currentInitiativeData.notes}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
            <Button 
              onClick={handleSaveInitiative}
              disabled={!currentInitiativeData.title?.trim()}
            >
              {editingInitiative ? 'Update Initiative' : 'Create Initiative'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
