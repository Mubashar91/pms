
import React from 'react'; // ✅ only import what you use

import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import { format } from 'date-fns';
import { Project } from "@/entities/Project";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  BarChart, 
  Calendar,
  SignalHigh,
  SignalMedium,
  SignalLow,
  UserCircle,
  ChevronDown
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const healthConfig = {
  'On Track': { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100', text: 'text-green-800' },
  'At Risk': { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'Delayed': { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100', text: 'text-red-800' },
  'Blocked': { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100', text: 'text-gray-800' },
};

const priorityConfig = {
  'Urgent': { icon: SignalHigh, color: 'text-red-500', bg: 'bg-red-100', text: 'text-red-800' },
  'High': { icon: SignalHigh, color: 'text-orange-500', bg: 'bg-orange-100', text: 'text-orange-800' },
  'Medium': { icon: SignalMedium, color: 'text-yellow-500', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'Low': { icon: SignalLow, color: 'text-blue-500', bg: 'bg-blue-100', text: 'text-blue-800' },
};

const statusConfig = {
  'Backlog': { bg: 'bg-gray-100', text: 'text-gray-800' },
  'Planned': { bg: 'bg-blue-100', text: 'text-blue-800' },
  'In Progress': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  'Completed': { bg: 'bg-green-100', text: 'text-green-800' },
  'Cancelled': { bg: 'bg-red-100', text: 'text-red-800' }
};

const ProgressCircle = ({ progress }) => {
  const radius = 12;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-8 h-8 flex items-center justify-center">
      <svg className="absolute w-full h-full transform -rotate-90">
        <circle
          className="text-gray-200"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="transparent"
          r={radius}
          cx="16"
          cy="16"
        />
        <circle
          className="text-indigo-600"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx="16"
          cy="16"
        />
      </svg>
      <span className="text-xs font-medium text-gray-600">{Math.round(progress)}%</span>
    </div>
  );
};

export default function ProjectListView({ projects, isLoading, users, onProjectUpdate }) {
  const navigate = useNavigate();

  const handleUpdateProject = async (projectId, updates) => {
    try {
      await Project.update(projectId, updates);
      onProjectUpdate?.();
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded animate-pulse mb-2" />
        ))}
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  const handleRowClick = (projectId, e) => {
    // Don't navigate if clicking on interactive elements
    if (e.target.closest('button') || e.target.closest('[role="button"]')) {
      return;
    }
    navigate(createPageUrl(`ProjectDetail?id=${projectId}`));
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="grid grid-cols-[3fr_repeat(5,1fr)] gap-4 px-4 py-2 text-xs font-medium text-gray-500 border-b">
        <div>Name</div>
        <div>Health</div>
        <div>Priority</div>
        <div>Lead</div>
        <div>Target Date</div>
        <div>Status</div>
      </div>

      {/* Rows */}
      <div className="space-y-1 mt-2">
        {projects.map((project, index) => {
          const healthItem = healthConfig[project.health] || healthConfig['On Track'];
          const priorityItem = priorityConfig[project.priority] || priorityConfig['Medium'];
          const statusItem = statusConfig[project.status] || statusConfig['Backlog'];
          const leadUser = users.find(u => u.email === project.lead_email);

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={(e) => handleRowClick(project.id, e)}
              className="grid grid-cols-[3fr_repeat(5,1fr)] gap-4 items-center px-4 py-2 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              {/* Name */}
              <div className="flex items-center gap-3">
                <BarChart className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-800 text-sm truncate">{project.title}</span>
              </div>

              {/* Health */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 p-2 h-auto justify-start">
                    <healthItem.icon className={`w-4 h-4 ${healthItem.color}`} />
                    <span className="text-sm">{project.health}</span>
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {Object.entries(healthConfig).map(([health, config]) => (
                    <DropdownMenuItem 
                      key={health}
                      onClick={() => handleUpdateProject(project.id, { health })}
                      className="gap-2"
                    >
                      <config.icon className={`w-4 h-4 ${config.color}`} />
                      {health}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Priority */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 p-2 h-auto justify-start">
                    <priorityItem.icon className={`w-4 h-4 ${priorityItem.color}`} />
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {Object.entries(priorityConfig).map(([priority, config]) => (
                    <DropdownMenuItem 
                      key={priority}
                      onClick={() => handleUpdateProject(project.id, { priority })}
                      className="gap-2"
                    >
                      <config.icon className={`w-4 h-4 ${config.color}`} />
                      {priority}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Lead */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 p-2 h-auto justify-start">
                    {leadUser ? (
                      <Avatar className="w-5 h-5">
                        <AvatarFallback className="text-xs bg-gray-200">{getInitials(leadUser.full_name)}</AvatarFallback>
                      </Avatar>
                    ) : <UserCircle className="w-5 h-5 text-gray-300"/>}
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {users.map(user => (
                    <DropdownMenuItem 
                      key={user.id}
                      onClick={() => handleUpdateProject(project.id, { lead_email: user.email })}
                      className="gap-2"
                    >
                      <Avatar className="w-5 h-5">
                        <AvatarFallback className="text-xs">{getInitials(user.full_name)}</AvatarFallback>
                      </Avatar>
                      {user.full_name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Target Date */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 p-2 h-auto justify-start">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{project.end_date ? format(new Date(project.end_date), "MMM d") : 'Set date'}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarPicker
                    mode="single"
                    selected={project.end_date ? new Date(project.end_date) : undefined}
                    onSelect={(date) => handleUpdateProject(project.id, { end_date: date })}
                  />
                </PopoverContent>
              </Popover>

              {/* Status */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 p-2 h-auto justify-start">
                    <Badge className={`${statusItem.bg} ${statusItem.text} border-0`}>
                      {project.status}
                    </Badge>
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <DropdownMenuItem 
                      key={status}
                      onClick={() => handleUpdateProject(project.id, { status })}
                    >
                      <Badge className={`${config.bg} ${config.text} border-0`}>
                        {status}
                      </Badge>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}