import React, { useState, useEffect } from "react";
import { startOfWeek, addDays, format, subWeeks, addWeeks, isSameDay } from "date-fns";
import Project from "@/entities/Project.json";
import User from "@/entities/User.json";
import Task from "@/entities/Task.json";
import Initiative from "@/entities/Initiative.json";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Target,
  Flag,
  Calendar as CalendarIcon,
} from "lucide-react";
import TimelineCell from "../components/timeline/TimelineCell";

export default function Timeline() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [initiatives, setInitiatives] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Use static JSON data directly
        setProjects(Array.isArray(Project) ? Project : []);
        setUsers(User ? [User] : []); // User.json is a single object
        setTasks(Array.isArray(Task) ? Task : []);
        setInitiatives(Array.isArray(Initiative) ? Initiative : []);
      } catch (error) {
        console.error("Error fetching timeline data:", error);
      }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getInitiativeById = (id) => initiatives.find(i => i.id === id);
  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  const getTasksForMemberForDate = (memberEmail, projectId, date) => {
    return tasks.filter(
      (task) =>
        task.assignee_email === memberEmail &&
        task.project_id === projectId &&
        task.due_date &&
        isSameDay(new Date(task.due_date), date)
    );
  };
  
  // No status updates for now, just tasks
  const getUpdatesForMemberForDate = () => [];

  return (
    <div className="p-6 h-full flex flex-col" style={{backgroundColor: 'var(--neutral-50)'}}>
      <div className="flex items-center justify-between mb-6">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Timeline</h1>
            <p className="text-gray-600 mt-1">Weekly overview of team activities and project progress.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={() => setCurrentWeek(new Date())}>
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[300px_200px_200px_repeat(7,_1fr)] sticky top-0 bg-gray-100 z-10 font-medium text-gray-600 text-sm">
              <div className="px-4 py-3 border-r">Member</div>
              <div className="px-4 py-3 border-r">Initiatives</div>
              <div className="px-4 py-3 border-r">Goals</div>
              {weekDays.map((day) => (
                <div key={day.toString()} className="px-4 py-3 border-r text-center">
                  <div>{format(day, "EEE")}</div>
                  <div className="text-lg font-semibold">{format(day, "d")}</div>
                </div>
              ))}
            </div>

            {/* Body */}
            {isLoading ? (
                <div className="p-4 text-center text-gray-500">Loading timeline...</div>
            ) : (
            <div className="bg-white">
              {projects.map((project) => (
                <div key={project.id} className="contents">
                  {/* Project Row */}
                  <div className="grid grid-cols-[300px_200px_200px_repeat(7,_1fr)] border-t border-gray-200 bg-gray-50/70 font-semibold">
                    <div className="px-4 py-3 flex items-center gap-2 col-span-3 text-gray-800">
                      <Briefcase className="w-4 h-4" />
                      {project.title}
                    </div>
                    <div className="col-span-7 border-l"></div>
                  </div>

                  {/* Team Member Rows */}
                  {(project.team_members || []).map((member) => {
                    const user = users.find(u => u.email === member.user_email);
                    return (
                      <div
                        key={member.user_email}
                        className="grid grid-cols-[300px_200px_200px_repeat(7,_1fr)] border-t border-gray-200 hover:bg-blue-50/20 transition-colors"
                      >
                        <div className="px-4 py-2 flex items-center gap-3 border-r">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{user ? getInitials(user.full_name) : '?'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-800">{user?.full_name}</div>
                            <div className="text-xs text-gray-500">{member.role}</div>
                          </div>
                        </div>
                        <div className="px-3 py-2 border-r space-y-1">
                          {(project.initiatives || []).slice(0,2).map(id => {
                            const initiative = getInitiativeById(id);
                            return initiative ? (
                              <Badge key={id} variant="outline" className="flex gap-1.5 items-center">
                                <Target className="w-3 h-3 text-purple-600" />
                                <span className="truncate">{initiative.title}</span>
                              </Badge>
                            ) : null;
                          })}
                          {(project.initiatives || []).length > 2 && <Badge variant="outline">+{ (project.initiatives || []).length-2} more</Badge>}
                        </div>
                        <div className="px-3 py-2 border-r space-y-1">
                          {(project.goals || []).slice(0,2).map((goal, index) => (
                              <Badge key={index} variant="outline" className="flex gap-1.5 items-center">
                                 <Flag className="w-3 h-3 text-orange-600" />
                                 <span className="truncate">{goal}</span>
                              </Badge>
                          ))}
                           {(project.goals || []).length > 2 && <Badge variant="outline">+{ (project.goals || []).length-2} more</Badge>}
                        </div>
                        {weekDays.map((day) => (
                          <div key={day.toString()} className="border-r last:border-r-0">
                            <TimelineCell
                              date={day}
                              tasks={getTasksForMemberForDate(
                                member.user_email,
                                project.id,
                                day
                              )}
                              updates={getUpdatesForMemberForDate(
                                member.user_email,
                                project.id,
                                day
                              )}
                            />
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}