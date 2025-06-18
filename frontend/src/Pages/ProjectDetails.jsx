import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import Project from "@/entities/Project.json";
import User from "@/entities/User.json";
import ProjectUpdate from "@/entities/ProjectUpdate.json";
import Milestone from "@/entities/Milestone.json";
import Activity from "@/entities/Activity.json";
import Initiative from "@/entities/Initiative.json";
import Team from "@/entities/Team.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft,
  BarChart, 
  ChevronsUpDown, 
  Calendar,
  User as UserIcon,
  Users,
  Hash,
  Plus,
  MessageSquare,
  Activity as ActivityIcon,
  Target,
  Heart,
  ThumbsUp,
  Smile,
  Send,
  Reply,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Edit3,
  Save,
  X,
  Paperclip,
  Link as LinkIcon,
  FileText,
  Building,
  MapPin,
  Flag
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { createPageUrl } from "@/utils";

const healthConfig = {
  'On Track': { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  'At Risk': { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  'Delayed': { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  'Blocked': { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
};

const priorityConfig = {
  'Urgent': { icon: SignalHigh, color: 'text-red-600', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  'High': { icon: SignalHigh, color: 'text-orange-600', bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  'Medium': { icon: SignalMedium, color: 'text-blue-600', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  'Low': { icon: SignalLow, color: 'text-gray-600', bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
};

const statusConfig = {
  'Backlog': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
  'Planned': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  'In Progress': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  'Completed': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  'Cancelled': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' }
};

export default function ProjectDetails() {
    const [project, setProject] = useState(null);
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [projectUpdates, setProjectUpdates] = useState([]);
    const [milestones, setMilestones] = useState([]);
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProject, setEditedProject] = useState(null);
    
    // Update states
    const [newUpdate, setNewUpdate] = useState({ content: '', status: 'On Track', attachments: [] });
    const [replyContent, setReplyContent] = useState({});
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    
    // Modal states
    const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
    const [newMilestone, setNewMilestone] = useState({ title: '', description: '', due_date: '' });
    const [isInitiativeModalOpen, setIsInitiativeModalOpen] = useState(false);
    const [newInitiative, setNewInitiative] = useState('');
    const [newGoal, setNewGoal] = useState('');
    
    const location = useLocation();
    const navigate = useNavigate();
    
    const searchParams = new URLSearchParams(location.search);
    const projectId = searchParams.get('id');

    useEffect(() => {
        console.log('ProjectDetails component mounted');
        console.log('Project ID from URL:', projectId);
        if (projectId) {
            loadProjectData();
        } else {
            console.log('No project ID found in URL');
            setIsLoading(false);
        }
    }, [projectId]);

    const loadProjectData = async () => {
        setIsLoading(true);
        try {
            console.log('Loading project data for ID:', projectId);
            
            // Since we're using static JSON data, we'll just set the data directly
            const allProjects = Array.isArray(Project) ? Project : [];
            const teamsData = Array.isArray(Team) ? Team : [];
            const usersData = Array.isArray(User) ? User : [];
            const updatesData = Array.isArray(ProjectUpdate) ? ProjectUpdate.filter(u => u.project_id === projectId) : [];
            const milestonesData = Array.isArray(Milestone) ? Milestone.filter(m => m.project_id === projectId) : [];
            const activitiesData = Array.isArray(Activity) ? Activity.filter(a => a.project_id === projectId) : [];

            console.log('All projects:', allProjects);
            console.log('Looking for project with ID:', projectId);

            const projectData = allProjects.find(p => p.id === projectId);
            console.log('Found project:', projectData);
            
            if (!projectData) {
                console.error('Project not found with ID:', projectId);
                setIsLoading(false);
                return;
            }
            
            setProject(projectData);
            setEditedProject({...projectData});
            setTeams(teamsData);
            setUsers(usersData);
            setProjectUpdates(updatesData);
            setMilestones(milestonesData);
            setActivities(activitiesData);
        } catch (error) {
            console.error("Failed to load project details:", error);
        }
        setIsLoading(false);
    };

    const handleSaveProject = async () => {
        try {
            // Since we're using static data, we'll just update the local state
            setProject({...editedProject});
            setIsEditing(false);
            
            // Add activity entry
            const newActivity = {
                id: Date.now().toString(),
                project_id: projectId,
                description: `Project details updated`,
                created_date: new Date().toISOString()
            };
            setActivities(prev => [newActivity, ...prev]);
        } catch (error) {
            console.error("Failed to update project:", error);
        }
    };

    const handleUpdateField = (field, value) => {
        setEditedProject(prev => ({ ...prev, [field]: value }));
    };

    const handleQuickUpdate = async (field, value) => {
        try {
            // Update the project state
            setProject(prev => ({ ...prev, [field]: value }));
            setEditedProject(prev => ({ ...prev, [field]: value }));
            
            // Add activity entry
            const newActivity = {
                id: Date.now().toString(),
                project_id: projectId,
                description: `${field} changed to ${value}`,
                created_date: new Date().toISOString()
            };
            setActivities(prev => [newActivity, ...prev]);
        } catch (error) {
            console.error("Failed to update project:", error);
        }
    };

    const handleAddUpdate = async () => {
        if (!newUpdate.content.trim()) return;
        
        try {
            const newProjectUpdate = {
                id: Date.now().toString(),
                project_id: projectId,
                content: newUpdate.content,
                status: newUpdate.status,
                attachments: newUpdate.attachments,
                created_date: new Date().toISOString(),
                created_by: 'current-user@example.com' // Mock user
            };
            
            setProjectUpdates(prev => [newProjectUpdate, ...prev]);
            setNewUpdate({ content: '', status: 'On Track', attachments: [] });
            setShowUpdateForm(false);
        } catch (error) {
            console.error("Failed to create update:", error);
        }
    };

    const handleReaction = async (updateId, emoji) => {
        try {
            const updatedUpdates = projectUpdates.map(update => {
                if (update.id === updateId) {
                    const currentReactions = update.reactions || [];
                    const existingReaction = currentReactions.find(r => r.user_email === 'current-user@example.com' && r.emoji === emoji);
                    
                    let newReactions;
                    if (existingReaction) {
                        newReactions = currentReactions.filter(r => !(r.user_email === 'current-user@example.com' && r.emoji === emoji));
                    } else {
                        newReactions = [...currentReactions, { emoji, user_email: 'current-user@example.com' }];
                    }
                    
                    return { ...update, reactions: newReactions };
                }
                return update;
            });
            
            setProjectUpdates(updatedUpdates);
        } catch (error) {
            console.error("Failed to update reaction:", error);
        }
    };

    const handleReply = async (updateId) => {
        const content = replyContent[updateId];
        if (!content?.trim()) return;
        
        try {
            const updatedUpdates = projectUpdates.map(update => {
                if (update.id === updateId) {
                    const currentReplies = update.replies || [];
                    const newReplies = [...currentReplies, {
                        content,
                        author_email: 'current-user@example.com',
                        created_date: new Date().toISOString()
                    }];
                    
                    return { ...update, replies: newReplies };
                }
                return update;
            });
            
            setProjectUpdates(updatedUpdates);
            setReplyContent(prev => ({ ...prev, [updateId]: '' }));
        } catch (error) {
            console.error("Failed to add reply:", error);
        }
    };

    const handleAddMilestone = async () => {
        if (!newMilestone.title.trim() || !newMilestone.due_date) return;
        
        try {
            const newMilestoneData = {
                id: Date.now().toString(),
                ...newMilestone,
                project_id: projectId,
                status: 'Pending'
            };
            
            setMilestones(prev => [newMilestoneData, ...prev]);
            setNewMilestone({ title: '', description: '', due_date: '' });
            setIsMilestoneModalOpen(false);
        } catch (error) {
            console.error("Failed to create milestone:", error);
        }
    };

    const handleAddInitiative = async () => {
        if (!newInitiative.trim()) return;
        
        const updatedInitiatives = [...(editedProject.initiatives || []), newInitiative];
        handleUpdateField('initiatives', updatedInitiatives);
        setNewInitiative('');
        setIsInitiativeModalOpen(false);
    };

    const handleAddGoal = async () => {
        if (!newGoal.trim()) return;
        
        const updatedGoals = [...(editedProject.goals || []), newGoal];
        handleUpdateField('goals', updatedGoals);
        setNewGoal('');
    };

    const handleRemoveInitiative = (index) => {
        const updatedInitiatives = editedProject.initiatives.filter((_, i) => i !== index);
        handleUpdateField('initiatives', updatedInitiatives);
    };

    const handleRemoveGoal = (index) => {
        const updatedGoals = editedProject.goals.filter((_, i) => i !== index);
        handleUpdateField('goals', updatedGoals);
    };

    const handleFileUpload = async (file) => {
        try {
            // Since we're using static data, we'll just create a mock file URL
            const newAttachment = {
                url: URL.createObjectURL(file),
                filename: file.name,
                type: file.type.startsWith('image/') ? 'image' : 'document'
            };
            setNewUpdate(prev => ({
                ...prev,
                attachments: [...prev.attachments, newAttachment]
            }));
        } catch (error) {
            console.error("Failed to upload file:", error);
        }
    };

    const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
    const getUser = (email) => users.find(u => u.email === email);
    const getTeam = (teamId) => teams.find(t => t.id === teamId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Project not found</h2>
                <p className="text-gray-600 mb-4">Project with ID "{projectId}" could not be found.</p>
                <Button onClick={() => navigate(createPageUrl('Projects'))} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Projects
                </Button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
                * { font-family: 'Poppins', sans-serif; }
            `}</style>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button 
                        onClick={() => navigate(createPageUrl('Projects'))} 
                        variant="ghost" 
                        size="icon"
                        className="hover:bg-gray-100"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <BarChart className="w-8 h-8 text-blue-600" />
                        {isEditing ? (
                            <Input
                                value={editedProject.title}
                                onChange={(e) => handleUpdateField('title', e.target.value)}
                                className="text-2xl font-bold border-none shadow-none p-0 h-auto text-gray-900"
                            />
                        ) : (
                            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {isEditing ? (
                        <>
                            <Button onClick={() => setIsEditing(false)} variant="outline">
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                            <Button onClick={handleSaveProject} className="bg-blue-600 text-white">
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditing(true)} variant="outline">
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Project
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Project Overview */}
                    <Card className="shadow-lg border-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Project Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isEditing ? (
                                <Textarea
                                    value={editedProject.description}
                                    onChange={(e) => handleUpdateField('description', e.target.value)}
                                    placeholder="Project description"
                                    rows={4}
                                />
                            ) : (
                                <p className="text-gray-700">{project.description}</p>
                            )}

                            {/* Quick Edit Fields */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {/* Status */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <ChevronsUpDown className="w-4 h-4 text-blue-600" />
                                        Status
                                    </label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className={`w-full justify-start ${statusConfig[project.status]?.bg} ${statusConfig[project.status]?.text} ${statusConfig[project.status]?.border} border`}>
                                                {project.status}
                                                <ChevronsUpDown className="w-4 h-4 ml-auto" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            {Object.keys(statusConfig).map(status => (
                                                <DropdownMenuItem 
                                                    key={status}
                                                    onClick={() => handleQuickUpdate('status', status)}
                                                >
                                                    {status}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Priority */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <SignalHigh className="w-4 h-4 text-orange-600" />
                                        Priority
                                    </label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            {(() => {
                                                const PriorityIcon = priorityConfig[project.priority]?.icon;
                                                return (
                                                    <Button variant="outline" className={`w-full justify-start ${priorityConfig[project.priority]?.bg} ${priorityConfig[project.priority]?.text} ${priorityConfig[project.priority]?.border} border`}>
                                                        {PriorityIcon && <PriorityIcon className={`w-4 h-4 mr-2 ${priorityConfig[project.priority]?.color}`} />}
                                                        {project.priority}
                                                        <ChevronsUpDown className="w-4 h-4 ml-auto" />
                                                    </Button>
                                                );
                                            })()}
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            {Object.entries(priorityConfig).map(([priority, config]) => (
                                                <DropdownMenuItem 
                                                    key={priority}
                                                    onClick={() => handleQuickUpdate('priority', priority)}
                                                    className="gap-2"
                                                >
                                                    <config.icon className={`w-4 h-4 ${config.color}`} />
                                                    {priority}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Health */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        Health
                                    </label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            {(() => {
                                                const HealthIcon = healthConfig[project.health]?.icon;
                                                return (
                                                    <Button variant="outline" className={`w-full justify-start ${healthConfig[project.health]?.bg} ${healthConfig[project.health]?.text} ${healthConfig[project.health]?.border} border`}>
                                                        {HealthIcon && <HealthIcon className={`w-4 h-4 mr-2 ${healthConfig[project.health]?.color}`} />}
                                                        {project.health}
                                                        <ChevronsUpDown className="w-4 h-4 ml-auto" />
                                                    </Button>
                                                );
                                            })()}
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            {Object.entries(healthConfig).map(([health, config]) => (
                                                <DropdownMenuItem 
                                                    key={health}
                                                    onClick={() => handleQuickUpdate('health', health)}
                                                    className="gap-2"
                                                >
                                                    <config.icon className={`w-4 h-4 ${config.color}`} />
                                                    {health}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Team */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Building className="w-4 h-4 text-purple-600" />
                                        Team
                                    </label>
                                    {isEditing ? (
                                        <Select 
                                            value={editedProject.team_id} 
                                            onValueChange={(value) => handleUpdateField('team_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select team" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {teams.map(team => (
                                                    <SelectItem key={team.id} value={team.id}>
                                                        <span className="mr-2">{team.icon}</span>
                                                        {team.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Badge variant="outline" className="w-full justify-start p-2">
                                            <span className="mr-2">{getTeam(project.team_id)?.icon}</span>
                                            {getTeam(project.team_id)?.name || 'No team'}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-green-600" />
                                        Start Date
                                    </label>
                                    {isEditing ? (
                                        <Input
                                            type="date"
                                            value={editedProject.start_date || ''}
                                            onChange={(e) => handleUpdateField('start_date', e.target.value)}
                                        />
                                    ) : (
                                        <div className="p-2 bg-gray-50 rounded border text-sm">
                                            {project.start_date ? format(new Date(project.start_date), 'MMM d, yyyy') : 'Not set'}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-red-600" />
                                        Target Date
                                    </label>
                                    {isEditing ? (
                                        <Input
                                            type="date"
                                            value={editedProject.end_date || ''}
                                            onChange={(e) => handleUpdateField('end_date', e.target.value)}
                                        />
                                    ) : (
                                        <div className="p-2 bg-gray-50 rounded border text-sm">
                                            {project.end_date ? format(new Date(project.end_date), 'MMM d, yyyy') : 'Not set'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700">Progress</label>
                                    <span className="text-sm font-semibold text-gray-900">{project.progress || 0}%</span>
                                </div>
                                <Progress value={project.progress || 0} className="h-2" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Initiatives & Goals */}
                    <Card className="shadow-lg border-0">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="w-5 h-5 text-purple-600" />
                                    Initiatives & Goals
                                </CardTitle>
                                {isEditing && (
                                    <Button 
                                        onClick={() => setIsInitiativeModalOpen(true)} 
                                        size="sm" 
                                        variant="outline"
                                        className="gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Initiative
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Initiatives */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                    <Flag className="w-4 h-4 text-orange-600" />
                                    Initiatives
                                </h4>
                                <div className="space-y-2">
                                    {(editedProject.initiatives || []).map((initiative, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded border border-orange-200">
                                            <span className="text-sm text-orange-800">{initiative}</span>
                                            {isEditing && (
                                                <Button
                                                    onClick={() => handleRemoveInitiative(index)}
                                                    size="icon"
                                                    variant="ghost"
                                                    className="w-6 h-6 text-red-500 hover:text-red-700"
                                                >
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    {(!editedProject.initiatives || editedProject.initiatives.length === 0) && (
                                        <p className="text-sm text-gray-500 italic">No initiatives defined</p>
                                    )}
                                </div>
                            </div>

                            {/* Goals */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                        <Target className="w-4 h-4 text-blue-600" />
                                        Goals
                                    </h4>
                                    {isEditing && (
                                        <div className="flex items-center gap-2">
                                            <Input
                                                placeholder="Add new goal"
                                                value={newGoal}
                                                onChange={(e) => setNewGoal(e.target.value)}
                                                className="w-48 h-8"
                                                onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
                                            />
                                            <Button onClick={handleAddGoal} size="sm" disabled={!newGoal.trim()}>
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {(editedProject.goals || []).map((goal, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
                                            <span className="text-sm text-blue-800">{goal}</span>
                                            {isEditing && (
                                                <Button
                                                    onClick={() => handleRemoveGoal(index)}
                                                    size="icon"
                                                    variant="ghost"
                                                    className="w-6 h-6 text-red-500 hover:text-red-700"
                                                >
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    {(!editedProject.goals || editedProject.goals.length === 0) && (
                                        <p className="text-sm text-gray-500 italic">No goals defined</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Updates Section */}
                    <Card className="shadow-lg border-0">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-blue-600" />
                                    Project Updates
                                </CardTitle>
                                <Button 
                                    onClick={() => setShowUpdateForm(!showUpdateForm)} 
                                    size="sm"
                                    className="gap-2 bg-blue-600 text-white"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Update
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <AnimatePresence>
                                {showUpdateForm && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50"
                                    >
                                        <div className="space-y-4">
                                            <Textarea
                                                placeholder="What's the update on this project?"
                                                value={newUpdate.content}
                                                onChange={(e) => setNewUpdate(prev => ({ ...prev, content: e.target.value }))}
                                                rows={3}
                                            />
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <Select
                                                        value={newUpdate.status}
                                                        onValueChange={(value) => setNewUpdate(prev => ({ ...prev, status: value }))}
                                                    >
                                                        <SelectTrigger className="w-32">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="On Track">On Track</SelectItem>
                                                            <SelectItem value="At Risk">At Risk</SelectItem>
                                                            <SelectItem value="Off Track">Off Track</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <input
                                                        type="file"
                                                        onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                                                        className="hidden"
                                                        id="file-upload"
                                                    />
                                                    <label htmlFor="file-upload">
                                                        <Button variant="outline" size="sm" className="gap-2" type="button">
                                                            <Paperclip className="w-4 h-4" />
                                                            Attach
                                                        </Button>
                                                    </label>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" onClick={() => setShowUpdateForm(false)}>Cancel</Button>
                                                    <Button onClick={handleAddUpdate} disabled={!newUpdate.content.trim()}>Post Update</Button>
                                                </div>
                                            </div>
                                            {newUpdate.attachments.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {newUpdate.attachments.map((attachment, index) => (
                                                        <Badge key={index} variant="outline" className="gap-1">
                                                            <FileText className="w-3 h-3" />
                                                            {attachment.filename}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Updates List */}
                            <div className="space-y-4">
                                {projectUpdates.map(update => {
                                    const author = getUser(update.created_by);
                                    const updateStatusConfig = {
                                        'On Track': { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', text: 'text-green-800' },
                                        'At Risk': { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'text-yellow-800' },
                                        'Off Track': { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', text: 'text-red-800' },
                                    };
                                    const StatusIcon = updateStatusConfig[update.status]?.icon || CheckCircle;
                                    
                                    return (
                                        <motion.div
                                            key={update.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="border border-gray-200 rounded-lg p-4 bg-white"
                                        >
                                            <div className="flex items-start gap-3">
                                                <Avatar className="w-10 h-10">
                                                    <AvatarFallback className="bg-blue-100 text-blue-700">
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
                                                    
                                                    {update.attachments && update.attachments.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mb-3">
                                                            {update.attachments.map((attachment, index) => (
                                                                <Badge key={index} variant="outline" className="gap-1">
                                                                    {attachment.type === 'link' ? <LinkIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                                                    <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                                        {attachment.filename}
                                                                    </a>
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                    
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
                                                                <Reply className="w-4 h-4" />
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

                                                    {/* Replies */}
                                                    {update.replies && update.replies.length > 0 && (
                                                        <div className="mt-3 pl-4 border-l-2 border-gray-200 space-y-2">
                                                            {update.replies.map((reply, index) => {
                                                                const replyAuthor = getUser(reply.author_email);
                                                                return (
                                                                    <div key={index} className="flex items-start gap-2">
                                                                        <Avatar className="w-6 h-6">
                                                                            <AvatarFallback className="text-xs bg-gray-100">
                                                                                {getInitials(replyAuthor?.full_name || reply.author_email)}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <span className="text-sm font-medium">{replyAuthor?.full_name || reply.author_email}</span>
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
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                                
                                {projectUpdates.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p>No updates yet. Be the first to share an update!</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Team Members */}
                    <Card className="shadow-lg border-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-600" />
                                Team Members
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {/* Project Lead */}
                                {project.lead_email && (
                                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-10 h-10">
                                                <AvatarFallback className="bg-blue-600 text-white">
                                                    {getInitials(getUser(project.lead_email)?.full_name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="font-medium text-blue-900">{getUser(project.lead_email)?.full_name}</p>
                                                <p className="text-sm text-blue-700">Project Lead</p>
                                            </div>
                                            <Badge className="bg-blue-600 text-white">Lead</Badge>
                                        </div>
                                    </div>
                                )}

                                {/* Team Members */}
                                {project.team_members?.map((member, index) => {
                                    const user = getUser(member.user_email);
                                    if (member.user_email === project.lead_email) return null; // Don't duplicate lead
                                    
                                    return (
                                        <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                                            <Avatar className="w-8 h-8">
                                                <AvatarFallback style={{backgroundColor: `hsl(${index * 60 % 360}, 60%, 70%)`, color: 'white'}}>
                                                    {getInitials(user?.full_name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{user?.full_name || member.user_email}</p>
                                                <p className="text-sm text-gray-600">{member.role}</p>
                                            </div>
                                        </div>
                                    );
                                })}

                                {(!project.team_members || project.team_members.length === 0) && !project.lead_email && (
                                    <p className="text-sm text-gray-500 italic text-center py-4">No team members assigned</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Milestones */}
                    <Card className="shadow-lg border-0">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="w-5 h-5 text-purple-600" />
                                    Milestones
                                </CardTitle>
                                <Button 
                                    onClick={() => setIsMilestoneModalOpen(true)} 
                                    size="sm" 
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {milestones.map(milestone => (
                                    <div key={milestone.id} className="p-3 border border-purple-200 rounded-lg bg-purple-50">
                                        <h4 className="font-medium text-purple-900">{milestone.title}</h4>
                                        {milestone.description && (
                                            <p className="text-sm text-purple-700 mt-1">{milestone.description}</p>
                                        )}
                                        <div className="flex items-center gap-2 mt-2">
                                            <Calendar className="w-4 h-4 text-purple-600" />
                                            <span className="text-sm text-purple-800">
                                                {format(new Date(milestone.due_date), 'MMM d, yyyy')}
                                            </span>
                                            <Badge className={`ml-auto ${
                                                milestone.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                milestone.status === 'Delayed' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {milestone.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                                {milestones.length === 0 && (
                                    <p className="text-sm text-gray-500 italic text-center py-4">No milestones set</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="shadow-lg border-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ActivityIcon className="w-5 h-5 text-green-600" />
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-64">
                                <div className="space-y-3">
                                    {activities.slice(0, 10).map(activity => (
                                        <div key={activity.id} className="text-sm">
                                            <p className="text-gray-700">{activity.description}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formatDistanceToNow(new Date(activity.created_date), { addSuffix: true })}
                                            </p>
                                        </div>
                                    ))}
                                    {activities.length === 0 && (
                                        <p className="text-sm text-gray-500 italic text-center py-4">No recent activity</p>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Add Initiative Modal */}
            <Dialog open={isInitiativeModalOpen} onOpenChange={setIsInitiativeModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Initiative</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="Initiative name"
                            value={newInitiative}
                            onChange={(e) => setNewInitiative(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddInitiative()}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsInitiativeModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddInitiative} disabled={!newInitiative.trim()}>Add Initiative</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Milestone Modal */}
            <Dialog open={isMilestoneModalOpen} onOpenChange={setIsMilestoneModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Milestone</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Input
                            placeholder="Milestone title"
                            value={newMilestone.title}
                            onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                        />
                        <Textarea
                            placeholder="Milestone description (optional)"
                            value={newMilestone.description}
                            onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                        />
                        <Input
                            type="date"
                            value={newMilestone.due_date}
                            onChange={(e) => setNewMilestone(prev => ({ ...prev, due_date: e.target.value }))}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsMilestoneModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddMilestone} disabled={!newMilestone.title.trim() || !newMilestone.due_date}>
                            Add Milestone
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
