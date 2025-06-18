import React, { useState, useEffect } from "react";
import Project from "@/entities/Project.json";
import Task from "@/entities/Task.json";
import TeamData from "@/entities/Team.json";
import User from "@/entities/User.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Mail,
  Briefcase,
  TrendingUp,
  ListChecks,
  ExternalLink,
  UserPlus
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

// Predefined user details as per user request
const TEAM_MEMBER_BASE_DETAILS = {
  "jawad.sharif@company.com": { name: "Jawad Sharif", baseRole: "Project Manager" },
  "muhammad.junaid@company.com": { name: "Muhammad Junaid", baseRole: "Team Lead" },
  "atta.rehman@company.com": { name: "Atta Rehman", baseRole: "Senior SQA" },
  "hassan.majid@company.com": { name: "Hassan Majid", baseRole: "UI UX Designer" },
  "waqas.ilyas@company.com": { name: "Waqas Ilyas", baseRole: "Software Engineer" },
  "usama.sohaib@company.com": { name: "Usama Sohaib", baseRole: "Software Engineer" },
  "sohaib.amjad@company.com": { name: "Sohaib Amjad", baseRole: "Project Coordinator" }
};


export default function Team() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]); // State for teams
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    setIsLoading(true);
    try {
      // Since we're using static JSON data, we'll just set the data directly
      setProjects(Array.isArray(Project) ? Project : []);
      setTasks(Array.isArray(Task) ? Task : []);
      setTeams(Array.isArray(TeamData) ? TeamData : []);
    } catch (error) {
      console.error("Error loading team data:", error);
    }
    setIsLoading(false);
  };

  const getTeamMemberProfiles = () => {
    const membersMap = new Map();

    // Initialize members from the predefined list
    Object.entries(TEAM_MEMBER_BASE_DETAILS).forEach(([email, details]) => {
        membersMap.set(email, {
            email: email,
            name: details.name,
            baseRole: details.baseRole,
            teamsIn: new Set(),
            projects: [],
            tasks: [],
            joinedDate: "2024-01-15", // Mock joined date
        });
    });
    
    projects.forEach(project => {
      const team = teams.find(t => t.id === project.team_id); // Find team name
      project.team_members?.forEach(memberRef => {
        if (!membersMap.has(memberRef.user_email)) {
          const nameFromEmail = memberRef.user_email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase());
           membersMap.set(memberRef.user_email, {
            email: memberRef.user_email,
            name: nameFromEmail,
            baseRole: memberRef.role || 'Team Member',
            teamsIn: new Set(),
            projects: [],
            tasks: [],
            joinedDate: "2024-01-15",
          });
        }
        const memberProfile = membersMap.get(memberRef.user_email);
        memberProfile.projects.push({ title: project.title, id: project.id, teamName: team?.name || "Unknown Team" });
        if(team?.name) memberProfile.teamsIn.add(team.name);
      });
    });

    tasks.forEach(task => {
      if (task.assignee_email && membersMap.has(task.assignee_email)) {
        membersMap.get(task.assignee_email).tasks.push(task);
      }
    });
    
    return Array.from(membersMap.values()).filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.baseRole.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const teamMembers = getTeamMemberProfiles();

  const getTaskStats = (memberTasks) => {
    const total = memberTasks.length;
    const completed = memberTasks.filter(task => task.status === 'Done').length;
    const inProgress = memberTasks.filter(task => task.status === 'In Progress').length;
    const todo = memberTasks.filter(task => task.status === 'Todo').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, todo, completionRate };
  };

  const handleInviteMember = async () => {
    if (!inviteEmail) return;
    console.log(`Invite sent to ${inviteEmail}`);
    alert(`Simulated invite for ${inviteEmail}. In a real app, an email would be sent.`);
    setInviteEmail("");
    setIsInviteModalOpen(false);
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <div className="p-6 space-y-6" style={{backgroundColor: 'var(--neutral-50)'}}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Members</h1>
            <p className="text-gray-600 mt-1">Manage team members and their assignments</p>
          </div>
          
          <Button onClick={() => setIsInviteModalOpen(true)} className="gap-2 text-white" style={{backgroundColor: 'var(--primary-blue)'}}>
            <UserPlus className="w-4 h-4" />
            Invite Member
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-lg glass-card mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full md:max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Members Table */}
        <Card className="border-0 shadow-lg glass-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[250px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teams</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined Date</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Role</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projects</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6} className="p-4">
                        <div className="h-10 bg-gray-200 rounded animate-pulse" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : teamMembers.length > 0 ? (
                  teamMembers.map((member, index) => {
                    const taskStats = getTaskStats(member.tasks);
                    return (
                      <TableRow
                        key={member.email}
                        className="hover:bg-blue-50/30 transition-colors duration-150"
                      >
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3">
                               <AvatarFallback style={{backgroundColor: `hsl(${index * 60 % 360}, 60%, 70%)`, color: 'white'}}>
                                {getInitials(member.name)}
                               </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{member.name}</div>
                              <div className="text-xs text-gray-500">{member.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {Array.from(member.teamsIn).slice(0,2).map(team => 
                              <Badge key={team} variant="outline" className="text-xs">{team}</Badge>
                            )}
                            {member.teamsIn.size > 2 && <Badge variant="outline" className="text-xs">+{member.teamsIn.size-2} more</Badge>}
                            {member.teamsIn.size === 0 && <span className="text-xs text-gray-400">No teams</span>}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{member.joinedDate}</div>
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="secondary">{member.baseRole}</Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{member.projects.length} project(s)</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {taskStats.completed}/{taskStats.total} tasks completed
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button asChild variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                            <Link to={`${createPageUrl('MemberProfile')}?email=${member.email}`}>
                              View Profile
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="px-6 py-12 text-center">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {searchTerm ? "No members match your search" : "No team members found"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {searchTerm ? "Try a different search term." : "Invite members or assign them to projects."}
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Invite Member Modal */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite New Member</DialogTitle>
            <DialogDescription>
              Enter the email address of the person you want to invite. They will receive an email to join StridePM.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              id="invite-email"
              placeholder="name@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              type="email"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsInviteModalOpen(false)}>Cancel</Button>
            <Button type="button" onClick={handleInviteMember} style={{backgroundColor: 'var(--primary-blue)'}} className="text-white">Send Invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
