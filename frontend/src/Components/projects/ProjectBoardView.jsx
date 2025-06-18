import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


import { createPageUrl } from "@/utils";
import Project  from "@/entities/Project.json";
import { format } from "date-fns";
import { 
  Plus, 
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  SignalHigh,
  SignalMedium,
  SignalLow,
  UserCircle,
  ChevronDown,
  Calendar
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";

const columns = [
  { id: "Backlog", title: "Backlog", count: 0 },
  { id: "Planned", title: "Planned", count: 0 },
  { id: "In Progress", title: "In Progress", count: 0 },
  { id: "Completed", title: "Completed", count: 0 },
  { id: "Cancelled", title: "Cancelled", count: 0 }
];

const healthConfig = {
  'On Track': { icon: CheckCircle, color: 'text-green-500' },
  'At Risk': { icon: AlertCircle, color: 'text-yellow-500' },
  'Delayed': { icon: XCircle, color: 'text-red-500' },
  'Blocked': { icon: Clock, color: 'text-gray-500' },
};

const priorityConfig = {
  'Urgent': { icon: SignalHigh, color: 'text-red-500' },
  'High': { icon: SignalHigh, color: 'text-orange-500' },
  'Medium': { icon: SignalMedium, color: 'text-yellow-500' },
  'Low': { icon: SignalLow, color: 'text-blue-500' },
};

export default function ProjectBoardView({ projects, isLoading, users, onNewProject, onProjectUpdate }) {
  const [draggedProject, setDraggedProject] = useState(null);
  const navigate = useNavigate();

  const handleDragStart = (e, project) => {
    setDraggedProject(project);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (draggedProject && draggedProject.status !== newStatus) {
      try {
        await Project.update(draggedProject.id, { status: newStatus });
        onProjectUpdate();
      } catch (error) {
        console.error("Error updating project status:", error);
      }
    }
    setDraggedProject(null);
  };

  const handleUpdateProject = async (projectId, updates) => {
    try {
      await Project.update(projectId, updates);
      onProjectUpdate();
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };
  
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  const handleCardClick = (projectId, e) => {
    // Don't navigate if clicking on interactive elements
    if (e.target.closest('button') || e.target.closest('[role="button"]')) {
      return;
    }
    navigate(createPageUrl(`ProjectDetails?id=${projectId}`));
  };

  return (
    <div className="flex gap-4 p-4 h-full overflow-x-auto">
      {columns.map(column => {
        const columnProjects = projects.filter(p => p.status === column.id);
        return (
          <div
            key={column.id}
            className="flex-shrink-0 w-80 bg-gray-50 rounded-lg h-full flex flex-col"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="font-medium text-sm text-gray-700">
                {column.title} <span className="text-gray-400">{columnProjects.length}</span>
              </h3>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="w-6 h-6">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-6 h-6" 
                  onClick={() => onNewProject(column.id)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 p-2 space-y-2 overflow-y-auto">
              {isLoading && <div className="h-20 bg-gray-200 rounded animate-pulse" />}
              {columnProjects.map((project) => {
                const healthItem = healthConfig[project.health] || healthConfig['On Track'];
                const priorityItem = priorityConfig[project.priority] || priorityConfig['Medium'];
                const leadUser = users.find(u => u.email === project.lead_email);
                
                return (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, project)}
                    onClick={(e) => handleCardClick(project.id, e)}
                    className="bg-white p-3 rounded-md border border-gray-200 hover:border-indigo-300 cursor-pointer shadow-sm"
                  >
                    {/* Header with interactive controls */}
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-800 truncate flex-1 mr-2">
                        {project.title}
                      </h4>
                      <div className="flex items-center gap-1">
                        {/* Health Indicator */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-5 h-5 hover:bg-gray-100">
                              <healthItem.icon className={`w-3 h-3 ${healthItem.color}`} />
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

                        {/* Priority Indicator */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-5 h-5 hover:bg-gray-100">
                              <priorityItem.icon className={`w-3 h-3 ${priorityItem.color}`} />
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
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                      {project.description || "No description"}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      {/* Lead Avatar */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-gray-100">
                            {leadUser ? (
                              <Avatar className="w-5 h-5">
                                <AvatarFallback className="text-xs bg-gray-200">
                                  {getInitials(leadUser.full_name)}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <UserCircle className="w-5 h-5 text-gray-300"/>
                            )}
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
                          <Button variant="ghost" size="sm" className="text-xs text-gray-400 hover:text-gray-600 p-1 h-auto">
                            {project.end_date ? format(new Date(project.end_date), "MMM d") : 'No date'}
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
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}