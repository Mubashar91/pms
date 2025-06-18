import React, { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  AlertTriangle, 
  CheckCircle2,
  Clock,
  SignalHigh,
  SignalMedium,
  SignalLow
} from "lucide-react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,

  isToday,
  isWithinInterval
} from "date-fns";

const healthConfig = {
  "On Track": { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
  "At Risk": { icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-100" },
  "Delayed": { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100" },
  "Blocked": { icon: Clock, color: "text-gray-600", bg: "bg-gray-100" },
};

const priorityConfig = {
  "Low": { icon: SignalLow, color: "text-blue-600", bg: "bg-blue-100" },
  "Medium": { icon: SignalMedium, color: "text-yellow-600", bg: "bg-yellow-100" },
  "High": { icon: SignalHigh, color: "text-orange-600", bg: "bg-orange-100" },
  "Urgent": { icon: SignalHigh, color: "text-red-600", bg: "bg-red-100" }
};

const statusColors = {
  "Backlog": "bg-gray-100 text-gray-800 border-gray-200",
  "Planned": "bg-blue-100 text-blue-800 border-blue-200",
  "In Progress": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Completed": "bg-green-100 text-green-800 border-green-200",
  "Cancelled": "bg-red-100 text-red-800 border-red-200"
};

export default function ProjectTimelineView({ projects, isLoading, users, onEditProject }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getProjectsForDate = (date) => {
    return projects.filter(project => {
      const startDate = project.start_date ? new Date(project.start_date) : null;
      const endDate = project.end_date ? new Date(project.end_date) : null;
      
      if (!startDate || !endDate) return false;
      
      return isWithinInterval(date, { start: startDate, end: endDate });
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg glass-card">
        <CardContent className="p-6">
          <div className="h-96 bg-gray-200 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-4">
      <Card className="border-0 shadow-lg glass-card">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Project Timeline - {format(currentMonth, "MMMM yyyy")}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setCurrentMonth(new Date())}
              >
                Today
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {/* Calendar Header */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-700">
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {monthDays.map(day => {
              const dayProjects = getProjectsForDate(day);
              const isCurrentDay = isToday(day);
              
              return (
                <div 
                  key={day.toISOString()} 
                  className={`bg-white p-2 min-h-[140px] ${isCurrentDay ? 'bg-blue-50' : ''}`}
                >
                  <div className={`text-sm font-medium mb-2 ${isCurrentDay ? 'text-blue-700' : 'text-gray-700'}`}>
                    {format(day, 'd')}
                    {isCurrentDay && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mx-auto mt-1" />}
                  </div>
                  
                  <div className="space-y-1">
                    {dayProjects.slice(0, 3).map(project => {
                      const healthItem = healthConfig[project.health] || healthConfig["On Track"];
                      const priorityItem = priorityConfig[project.priority] || priorityConfig["Medium"];
                      const leadUser = users.find(u => u.email === project.lead_email);
                      
                      return (
                        <motion.div
                          key={project.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`border rounded p-2 hover:shadow-sm transition-all cursor-pointer ${statusColors[project.status]} border`}
                          onClick={() => onEditProject && onEditProject(project)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-xs font-medium truncate flex-1">
                              {project.title}
                            </div>
                            <div className="flex items-center gap-1">
                              <healthItem.icon className={`w-3 h-3 ${healthItem.color}`} />
                              <priorityItem.icon className={`w-3 h-3 ${priorityItem.color}`} />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Badge className={`text-xs px-1 py-0 ${statusColors[project.status]}`}>
                              {project.status}
                            </Badge>
                            
                            {leadUser && (
                              <Avatar className="w-4 h-4">
                                <AvatarFallback className="text-xs bg-white/50">
                                  {getInitials(leadUser.full_name)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                    
                    {dayProjects.length > 3 && (
                      <div className="text-xs text-gray-500 text-center py-1">
                        +{dayProjects.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}