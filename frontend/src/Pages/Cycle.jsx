import React, { useState, useEffect } from "react";
import cycleData from "@/entities/Cycle";
import projectData from "@/entities/Project";
// Removing incorrect Activity import
// import { Activity } from "@/entities/Activity";
import statusUpdateData from "@/entities/StatusUpdate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  RotateCcw, 
  Plus, 
  Calendar,
  TrendingUp,
  Target,
  Activity as ActivityIcon,
  Users,
  BarChart3
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

const statusColors = {
  "Planning": "bg-blue-100 text-blue-800",
  "Active": "bg-green-100 text-green-800", 
  "Completed": "bg-gray-100 text-gray-800",
  "Cancelled": "bg-red-100 text-red-800"
};

export default function Cycles() {
  const [cycles, setCycles] = useState(cycleData);
  const [projects, setProjects] = useState(projectData);
  const [activities, setActivities] = useState([]);
  const [statusUpdates, setStatusUpdates] = useState(statusUpdateData);
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewCycleOpen, setIsNewCycleOpen] = useState(false);
  const [newCycle, setNewCycle] = useState({
    title: '',
    description: '',
    project_id: '',
    start_date: '',
    end_date: '',
    status: 'Planning',
    goals: []
  });

  useEffect(() => {
    loadCyclesData();
  }, []);

  const loadCyclesData = async () => {
    setIsLoading(true);
    try {
      const [cyclesData, projectsData, activitiesData, updatesData] = await Promise.all([
        Cycle.list("-created_date"),
        Project.list("-created_date"),
        Activity.list("-created_date", 100),
        StatusUpdate.list("-created_date", 50)
      ]);
      setCycles(cyclesData);
      setProjects(projectsData);
      setActivities(activitiesData);
      setStatusUpdates(updatesData);
    } catch (error) {
      console.error("Error loading cycles data:", error);
    }
    setIsLoading(false);
  };

  const handleCreateCycle = async () => {
    if (!newCycle.title || !newCycle.project_id) return;
    
    try {
      await Cycle.create(newCycle);
      setIsNewCycleOpen(false);
      setNewCycle({
        title: '',
        description: '',
        project_id: '',
        start_date: '',
        end_date: '',
        status: 'Planning',
        goals: []
      });
      loadCyclesData();
    } catch (error) {
      console.error("Error creating cycle:", error);
    }
  };

  const getCycleStats = (cycle) => {
    const cycleActivities = activities.filter(a => a.project_id === cycle.project_id);
    const cycleUpdates = statusUpdates.filter(u => u.project_id === cycle.project_id);
    const project = projects.find(p => p.id === cycle.project_id);
    
    return {
      activitiesCount: cycleActivities.length,
      updatesCount: cycleUpdates.length,
      progress: project?.progress || 0,
      teamSize: project?.team_members?.length || 0
    };
  };

  const getRecentActivity = (projectId) => {
    return activities.filter(a => a.project_id === projectId).slice(0, 5);
  };

  return (
    <div className="p-6 space-y-6" style={{backgroundColor: 'var(--neutral-50)'}}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cycles</h1>
            <p className="text-gray-600 mt-1">Track project cycles and overall progress</p>
          </div>
          <Button onClick={() => setIsNewCycleOpen(true)} className="gap-2 text-white" style={{backgroundColor: 'var(--primary-blue)'}}>
            <Plus className="w-4 h-4" />
            New Cycle
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Cycles List */}
          <div className="lg:col-span-3">
            <div className="grid gap-6">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <Card key={i} className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="h-32 bg-gray-200 rounded animate-pulse" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                cycles.map((cycle) => {
                  const stats = getCycleStats(cycle);
                  const project = projects.find(p => p.id === cycle.project_id);
                  
                  return (
                    <Card 
                      key={cycle.id}
                      className={`border-0 shadow-lg glass-card hover-lift cursor-pointer transition-all duration-300 ${
                        selectedCycle?.id === cycle.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedCycle(cycle)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl text-gray-900 mb-2">{cycle.title}</CardTitle>
                            <p className="text-gray-600 text-sm mb-3">{cycle.description}</p>
                            <div className="flex items-center gap-3 flex-wrap">
                              <Badge className={statusColors[cycle.status]}>
                                {cycle.status}
                              </Badge>
                              {project && (
                                <Badge variant="outline" className="gap-1">
                                  <RotateCcw className="w-3 h-3" />
                                  {project.title}
                                </Badge>
                              )}
                              {cycle.start_date && cycle.end_date && (
                                <Badge variant="outline" className="gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {format(new Date(cycle.start_date), "MMM d")} - {format(new Date(cycle.end_date), "MMM d")}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">{stats.progress}%</div>
                            <div className="text-xs text-gray-500">Progress</div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          <Progress value={stats.progress} className="h-2" />
                          
                          <div className="grid grid-cols-4 gap-4 text-center">
                            <div className="p-2 bg-blue-50 rounded-lg">
                              <div className="text-lg font-semibold text-blue-700">{stats.activitiesCount}</div>
                              <div className="text-xs text-blue-600">Activities</div>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg">
                              <div className="text-lg font-semibold text-green-700">{stats.updatesCount}</div>
                              <div className="text-xs text-green-600">Updates</div>
                            </div>
                            <div className="p-2 bg-purple-50 rounded-lg">
                              <div className="text-lg font-semibold text-purple-700">{stats.teamSize}</div>
                              <div className="text-xs text-purple-600">Team</div>
                            </div>
                            <div className="p-2 bg-orange-50 rounded-lg">
                              <div className="text-lg font-semibold text-orange-700">{cycle.goals?.length || 0}</div>
                              <div className="text-xs text-orange-600">Goals</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
              
              {cycles.length === 0 && !isLoading && (
                <div className="text-center py-12 text-gray-500">
                  <RotateCcw className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No cycles found</h3>
                  <p className="text-gray-600">Create your first cycle to start tracking project progress</p>
                </div>
              )}
            </div>
          </div>

          {/* Cycle Details Sidebar */}
          <div className="lg:col-span-1">
            {selectedCycle ? (
              <Card className="border-0 shadow-lg glass-card sticky top-6">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <ActivityIcon className="w-5 h-5 text-green-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {getRecentActivity(selectedCycle.project_id).map(activity => (
                    <div key={activity.id} className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(activity.created_date), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {getRecentActivity(selectedCycle.project_id).length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <ActivityIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No recent activity</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-lg glass-card">
                <CardContent className="p-6 text-center">
                  <RotateCcw className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <h3 className="font-medium text-gray-900 mb-1">Select a Cycle</h3>
                  <p className="text-sm text-gray-500">Choose a cycle to view detailed activity and stats</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* New Cycle Modal */}
      <Dialog open={isNewCycleOpen} onOpenChange={setIsNewCycleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Cycle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Cycle title"
              value={newCycle.title}
              onChange={(e) => setNewCycle(prev => ({ ...prev, title: e.target.value }))}
            />
            <Textarea
              placeholder="Cycle description"
              value={newCycle.description}
              onChange={(e) => setNewCycle(prev => ({ ...prev, description: e.target.value }))}
            />
            <Select value={newCycle.project_id} onValueChange={(value) => setNewCycle(prev => ({ ...prev, project_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>{project.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                value={newCycle.start_date}
                onChange={(e) => setNewCycle(prev => ({ ...prev, start_date: e.target.value }))}
                placeholder="Start date"
              />
              <Input
                type="date"
                value={newCycle.end_date}
                onChange={(e) => setNewCycle(prev => ({ ...prev, end_date: e.target.value }))}
                placeholder="End date"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewCycleOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateCycle} disabled={!newCycle.title || !newCycle.project_id}>Create Cycle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}