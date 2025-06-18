import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import projectData from "@/entities/Project.json"; // Import project data
import User from "@/entities/User.json"; // Import user data
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Plus, 
  List,
  Grid3X3,
  Calendar,
  Filter as FilterIcon
} from "lucide-react";
import { createPageUrl } from "@/utils";

import ProjectListView from "../components/projects/ProjectListView";
import ProjectBoardView from "../components/projects/ProjectBoardView";
import ProjectTimelineView from "../components/projects/ProjectTimelineView";
import ProjectForm from "../components/projects/ProjectForm";

export default function Projects() {
  const [projects, setProjects] = useState(projectData);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const viewMode = searchParams.get("view") || "list";
  const [activeFilters, setActiveFilters] = useState({
    text: searchParams.get("filter") || "",
    leads: [],
  });

  const [isFormOpen, setIsFormOpen] = useState(searchParams.get('action') === 'new');
  const [editingProject, setEditingProject] = useState(null);

  const handleProjectClick = (projectId) => {
    navigate(createPageUrl(`ProjectDetails?id=${projectId}`));
  };

  const handleOpenNewForm = (defaultStatus) => {
    const newProjectTemplate = defaultStatus ? { status: defaultStatus } : {};
    setEditingProject(newProjectTemplate);
    navigate(createPageUrl("Projects?view=" + viewMode + "&action=new"));
    setIsFormOpen(true);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingProject(null);
  };

  const handleFormSubmitSuccess = () => {
    setIsFormOpen(false);
    setEditingProject(null);
    navigate(createPageUrl("Projects?view=" + viewMode));
    const newProjects = [...projects, editingProject];
    setProjects(newProjects);
  };

  const handleProjectUpdate = (updatedProjects) => {
    setProjects(updatedProjects);
  };

  const handleFilterClick = (type, value) => {
    setActiveFilters(prev => {
      if (type === 'my_projects') {
        return { ...prev, leads: prev.leads.includes(currentUser.email) ? [] : [currentUser.email] };
      }
      if (type === 'lead') {
        const newLeads = prev.leads.includes(value) 
          ? prev.leads.filter(lead => lead !== value)
          : [...prev.leads, value];
        return { ...prev, leads: newLeads };
      }
      return prev;
    });
  };

  const setViewMode = (mode) => {
    navigate(createPageUrl(`Projects?view=${mode}`));
  };

  useEffect(() => {
    // Load initial data
    setIsLoading(true);
    try {
      // Create sample users with proper structure
      const usersData = [
        {
          email: "johndoe@example.com",
          fullName: "John Doe",
          username: "johndoe"
        },
        {
          email: "janedoe@example.com",
          fullName: "Jane Doe",
          username: "janedoe"
        },
        {
          email: "bobsmith@example.com",
          fullName: "Bob Smith",
          username: "bobsmith"
        }
      ];
      
      setUsers(usersData);
      setCurrentUser(usersData[0]); // Set first user as current user
      
      // Sort projects by created_date
      const sortedProjects = [...projects].sort(
        (a, b) => new Date(b.created_date) - new Date(a.created_date)
      );
      setProjects(sortedProjects);
      
      // Initialize teams from project data
      const uniqueTeams = [...new Set(projects.map(p => p.team_id).filter(Boolean))];
      setTeams(uniqueTeams.map(teamId => ({
        id: teamId,
        name: `Team ${teamId}`,
        icon: '👨‍💻'
      })));
    } catch (error) {
      console.error("Error loading projects or users:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredProjects = projects.filter(project => {
    const leadMatch = activeFilters.leads.length === 0 || activeFilters.leads.includes(project.lead_email);
    // Add more filter logic here (text, teams, etc.)
    return leadMatch;
  });
  
  const uniqueLeads = [...new Set(projects.map(p => p.lead_email).filter(Boolean))];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-gray-200">
        <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
                <Button variant={activeFilters.leads.length === 0 ? "secondary" : "outline"} size="sm" onClick={() => setActiveFilters(p => ({...p, leads: []}))}>All projects</Button>
                {currentUser && <Button variant={activeFilters.leads.includes(currentUser.email) ? "secondary" : "outline"} size="sm" onClick={() => handleFilterClick('my_projects')}>My projects</Button>}
                <div className="h-5 w-px bg-gray-200 mx-1"></div>
                {uniqueLeads.slice(0, 4).map(lead => {
                    const user = users.find(u => u.email === lead);
                    return user ? (
                      <Button key={lead} variant={activeFilters.leads.includes(lead) ? "secondary" : "outline"} size="sm" onClick={() => handleFilterClick('lead', lead)}>
                        Lead by {user.fullName.split(' ')[0]}
                      </Button>
                    ) : null;
                })}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-1">
                <FilterIcon className="w-3.5 h-3.5" /> Filter
              </Button>
              <div className="flex items-center rounded-md border bg-gray-50 p-0.5">
                <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("list")} className="w-7 h-7"><List className="w-4 h-4" /></Button>
                <Button variant={viewMode === "board" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("board")} className="w-7 h-7"><Grid3X3 className="w-4 h-4" /></Button>
                <Button variant={viewMode === "timeline" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("timeline")} className="w-7 h-7"><Calendar className="w-4 h-4" /></Button>
              </div>
              <Button onClick={() => handleOpenNewForm()} size="sm" className="gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700">
                <Plus className="w-4 h-4" /> Create project
              </Button>
            </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {viewMode === "list" && (
          <ProjectListView
            projects={filteredProjects}
            isLoading={isLoading}
            users={users}
            onProjectUpdate={(updatedProjects) => {
              // Update the projects state with the new data
              setProjects(updatedProjects);
            }}
            onProjectClick={handleProjectClick}
          />
        )}
        {viewMode === "board" && (
          <ProjectBoardView 
            projects={filteredProjects} 
            isLoading={isLoading}
            users={users}
            onNewProject={handleOpenNewForm}
            onProjectUpdate={(updatedProjects) => {
              // Update the projects state with the new data
              setProjects(updatedProjects);
            }}
          />
        )}
        {viewMode === "timeline" && (
          <ProjectTimelineView 
            projects={filteredProjects} 
            isLoading={isLoading}
            users={users}
            onEditProject={(project) => {
              setEditingProject(project);
              setIsFormOpen(true);
            }}
          />
        )}
      </main>

      {/* Project Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(open) => {
        if (!open) {
          // When dialog closes, return focus to the create project button
          document.querySelector('button[aria-label="Create project"]')?.focus();
          handleFormCancel();
        }
      }}>
        <DialogContent className="max-w-3xl p-0" onInteractOutside={handleFormCancel}>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>Create a new project with the details below.</DialogDescription>
          <ProjectForm
            project={editingProject}
            onSubmitSuccess={handleFormSubmitSuccess}
            onCancel={handleFormCancel}
            users={users}
            teams={teams}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
