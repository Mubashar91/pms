import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  Plus, 
  Calendar, 
  Clock,
  TrendingUp,
  User
} from "lucide-react";
import taskData from "@/entities/Task.json"; // Use the correct path

export default function TeamSidebar({ projects }) {
  const [teamMembers, setTeamMembers] = useState([]);
  const [tasks, setTasks] = useState([]);


  
 const loadTeamData = useCallback(async () => {
  try {
    const allTasks = taskData;
    setTasks(allTasks);

    const memberMap = new Map();
    projects.forEach(project => {
      project.team_members?.forEach(member => {
        if (!memberMap.has(member.user_email)) {
          const nameParts = member.user_email.split('@')[0].split('.');
          const fullName = nameParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
          memberMap.set(member.user_email, {
            email: member.user_email,
            full_name: fullName,
            role: member.role || 'Team Member',
            status: 'active'
          });
        } else {
          const existingMember = memberMap.get(member.user_email);
          if (member.role && existingMember.role === 'Team Member') {
            existingMember.role = member.role;
          }
        }
      });
    });

    setTeamMembers(Array.from(memberMap.values()));
  } catch (error) {
    console.error("Error loading team data:", error);
  }
}, [projects]); // ✅ dependency

  
useEffect(() => {
  loadTeamData();
}, [loadTeamData]);
  
  const getTasksForMember = (email) => {
    return tasks.filter(task => task.assignee_email === email);
  };
  
  const getActiveTasks = (email) => {
    return getTasksForMember(email).filter(task => 
      task.status !== 'Done' && task.status !== 'Cancelled'
    );
  };

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <Card className="border-0 shadow-lg glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-blue-600" />
            Team Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{teamMembers.length}</div>
              <div className="text-xs text-blue-600">Active Members</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{tasks.length}</div>
              <div className="text-xs text-green-600">Total Tasks</div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full justify-center gap-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <Plus className="w-4 h-4" />
            Invite Member
          </Button>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card className="border-0 shadow-lg glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5 text-purple-600" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-96">
            <div className="p-4 space-y-3">
              {teamMembers.map((member, index) => {
                const activeTasks = getActiveTasks(member.email);
                const completedToday = getTasksForMember(member.email).filter(task => 
                  task.status === 'Done' && 
                  new Date(task.updated_date).toDateString() === new Date().toDateString()
                ).length;
                
                return (
                  <div key={member.email} className="p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback style={{backgroundColor: `hsl(${index * 137.5 % 360}, 70%, 60%)`, color: 'white'}}>
                          {member.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {member.full_name}
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            {member.role}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-gray-500 mb-2">{member.email}</p>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <Clock className="w-3 h-3 text-orange-500" />
                            <span className="text-gray-600">{activeTasks.length} active tasks</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            <span className="text-gray-600">{completedToday} completed today</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {teamMembers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No team members assigned</p>
                  <p className="text-xs text-gray-400">Add members to projects to see them here</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
