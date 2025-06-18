import React, { useState, useEffect } from "react";
import projectData from "@/entities/Project.json";
import taskData from "@/entities/Task.json";
import Team from '@/entities/Team.json';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Filter,
  TrendingUp,
  Users,
  FolderOpen,
  BarChart3,
  Clock,
  UserPlus
} from "lucide-react";
 
import ProjectCard from "../components/dashboard/ProjectCard";
import TeamSidebar from "../components/dashboard/TeamSidebar";
import StatusUpdates from "../components/dashboard/StatusUpdates";
import { createPageUrl } from "@/utils";
 
// Initialize projects as an array
const projects = Array.isArray(projectData) ? projectData : [];
 
export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
 
  // State for popups
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteTeamId, setInviteTeamId] = useState("");
 
  useEffect(() => {
    loadDashboardData();
  }, []);
 
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      setTasks(Array.isArray(taskData) ? taskData : []);
      setTeams(Array.isArray(Team) ? Team : []);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };
 
  const filteredProjects = projects.filter(project => {
    if (activeFilter === "all") return true;
    if (activeFilter === "active") return project.status === "In Progress";
    if (activeFilter === "at-risk") return project.health === "At Risk" || project.health === "Delayed";
    if (activeFilter === "completed") return project.status === "Completed";
    return true;
  });
 
  const getProjectStats = () => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === "In Progress").length;
    const atRiskProjects = projects.filter(p => p.health === "At Risk" || p.health === "Delayed").length;
    const completedProjects = projects.filter(p => p.status === "Completed").length;
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(t => t.status !== "Done").length;
 
    return { totalProjects, activeProjects, atRiskProjects, completedProjects, totalTasks, pendingTasks };
  };
 
  const stats = getProjectStats();
 
  const handleInviteSubmit = async () => {
    if (!inviteEmail || !inviteTeamId) return;
   
    try {
      console.log(`Inviting ${inviteEmail} to team ID ${inviteTeamId}`);
     
      const teamProjects = projects.filter(p => p.team_id === inviteTeamId);
      for (const project of teamProjects) {
        const currentMembers = project.team_members || [];
        const isAlreadyMember = currentMembers.some(member => member.user_email === inviteEmail);
       
        if (!isAlreadyMember) {
            const updatedMembers = [...currentMembers, {
                user_email: inviteEmail,
                role: "Team Member"
            }];
            await projectData.update(project.id, { team_members: updatedMembers });
        }
      }
     
      setIsInviteOpen(false);
      setInviteEmail("");
      setInviteTeamId("");
      loadDashboardData();
     
      alert(`Invitation sent to ${inviteEmail} successfully!`);
    } catch (error) {
      console.error("Error sending invitation:", error);
      alert("Failed to send invitation. Please try again.");
    }
  };
 
const StatsCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
  <Card className="border-0 shadow-lg glass-card hover-lift">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">{trend}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);
 
 
  return (
    <>
      <div className="p-6 space-y-8" style={{backgroundColor: 'var(--neutral-50)'}}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Project Dashboard</h1>
              <p className="text-gray-600 mt-1">Monitor and manage your team's projects and performance</p>
            </div>
           
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2" onClick={() => setIsFilterOpen(true)}>
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              <Button className="gap-2 text-white" style={{backgroundColor: 'var(--primary-blue)'}} onClick={() => setIsInviteOpen(true)}>
                <UserPlus className="w-4 h-4" />
                Invite Members
              </Button>
            </div>
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Active Projects"
              value={stats.activeProjects}
              subtitle={`${stats.totalProjects} total projects`}
              icon={FolderOpen}
              color="bg-blue-500"
              trend="+12% this month"
            />
            <StatsCard
              title="Pending Tasks"
              value={stats.pendingTasks}
              subtitle={`${stats.totalTasks} total tasks`}
              icon={Clock}
              color="bg-orange-500"
              trend="-8% from last week"
            />
            <StatsCard
              title="At Risk"
              value={stats.atRiskProjects}
              subtitle="Need attention"
              icon={BarChart3}
              color="bg-red-500"
            />
            <StatsCard
              title="Team Members"
              value={new Set(projects.flatMap(p => p.team_members?.map(m => m.user_email) || [])).size}
              subtitle="Active contributors"
              icon={Users}
              color="bg-green-500"
              trend="+3 new this month"
            />
          </div>
 
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <Tabs defaultValue="projects" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="projects">Projects Overview</TabsTrigger>
                  <TabsTrigger value="updates">Recent Updates</TabsTrigger>
                </TabsList>
               
                <TabsContent value="projects" className="space-y-6">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {[
                      { key: "all", label: "All Projects", count: projects.length },
                      { key: "active", label: "Active", count: stats.activeProjects },
                      { key: "at-risk", label: "At Risk", count: stats.atRiskProjects },
                      { key: "completed", label: "Completed", count: stats.completedProjects }
                    ].map(filter => (
                      <Button
                        key={filter.key}
                        variant={activeFilter === filter.key ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveFilter(filter.key)}
                        className="gap-2 whitespace-nowrap"
                      >
                        {filter.count > 0 && (
                          <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                            {filter.count}
                          </span>
                        )}
                        {filter.label}
                      </Button>
                    ))}
                  </div>
 
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isLoading ? (
                      Array(4).fill(0).map((_, i) => (
                        <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
                      ))
                    ) : (
                      filteredProjects.map((project) => (
                        <div
                          key={project.id}
                          className="transition-all duration-200"
                        >
                          <ProjectCard
                            project={project}
                            onEdit={(project) => console.log("Edit project:", project)}
                            onView={(project) => setSelectedProjectId(project.id)}
                            onClick={(project) => {
                              window.location.href = createPageUrl(`ProjectDetails?id=${project.id}`);
                            }}
                          />
                        </div>
                      ))
                    )}
                  </div>
 
                  {filteredProjects.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                      <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                      <p className="text-gray-600">Create a project from the sidebar to get started.</p>
                    </div>
                  )}
                </TabsContent>
               
                <TabsContent value="updates" className="space-y-6">
                  <StatusUpdates
                    projects={projects}
                    selectedProjectId={selectedProjectId}
                  />
                </TabsContent>
              </Tabs>
            </div>
 
            <div className="lg:col-span-1">
              <TeamSidebar projects={projects} onInviteMember={() => setIsInviteOpen(true)} />
            </div>
          </div>
        </div>
      </div>
 
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Dashboard</DialogTitle>
            <DialogDescription>Select a date range to filter projects and tasks.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              className="rounded-md border"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDateRange({ from: null, to: null }); }}>Clear</Button>
            <Button onClick={() => setIsFilterOpen(false)}>Apply Filter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
     
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
            <DialogDescription>Invite a new member to a team. They will receive an email to join.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="member@email.com"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              type="email"
            />
            <Select onValueChange={setInviteTeamId} value={inviteTeamId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a team to invite to" />
              </SelectTrigger>
              <SelectContent>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id}>{team.icon} {team.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
            <Button onClick={handleInviteSubmit} disabled={!inviteEmail || !inviteTeamId}>Send Invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}