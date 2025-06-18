
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Team from '@/entities/Team.json';
import { Outlet } from 'react-router-dom';
import Project from "@/entities/Project.json"; // ✅ CORRECT for default import from JSON
import  User  from "@/entities/User.json"; // Added User import
import { 
  LayoutDashboard, 
  Calendar, 
  FolderOpen, 
  Users, 
  Settings,
  Bell,
  Search,
  Plus,
  ChevronsUpDown,

  Inbox,
  Trash2,
  X,
  RotateCcw,
  AlertTriangle,
  Target,
  User as UserIcon, // Renamed to avoid conflict with imported User entity
  BarChart3,
  Activity
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigationGroups = [
  {
    label: "Dashboard",
    items: [
      {
        title: "Dashboard",
        url: createPageUrl("Dashboard"),
        icon: LayoutDashboard,
      },
      {
        title: "My Issues",
        url: createPageUrl("MyIssues"),
        icon: UserIcon, // Using UserIcon here
      },
      {
        title: "Inbox",
        url: createPageUrl("Inbox"),
        icon: Inbox,
      },
    ]
  },
  {
    label: "Planning",
    items: [
      {
        title: "Projects",
        url: createPageUrl("Projects"),
        icon: FolderOpen,
      },
      {
        title: "Initiatives",
        url: createPageUrl("Initiatives"),
        icon: Target,
      },
      {
        title: "Cycles",
        url: createPageUrl("Cycles"),
        icon: RotateCcw,
      },
    ]
  },
  {
    label: "Tracking",
    items: [
      {
        title: "Timeline",
        url: createPageUrl("Timeline"),
        icon: Calendar,
      },
      {
        title: "Issues",
        url: createPageUrl("Issues"),
        icon: AlertTriangle,
      },
      {
        title: "Pulse",
        url: createPageUrl("Pulse"),
        icon: BarChart3,
      },
    ]
  },
  {
    label: "Team",
    items: [
      {
        title: "Members",
        url: createPageUrl("Team"),
        icon: Users,
      },
    ]
  }
];

export default function Layout({ currentPageName }) {
  const location = useLocation();
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewTeamModalOpen, setIsNewTeamModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamIcon, setNewTeamIcon] = useState("📁");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [teamsData, projectsData] = await Promise.all([
        Team.list(),
        Project.list()
      ]);
      setTeams(teamsData);
      setProjects(projectsData);
    } catch (error) {
      console.error("Failed to fetch teams and projects for layout:", error);
    }
    setIsLoading(false);
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    
    try {
      await Team.create({
        name: newTeamName,
        icon: newTeamIcon,
        description: `${newTeamName} team workspace`
      });
      setNewTeamName("");
      setNewTeamIcon("📁");
      setIsNewTeamModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error creating team:", error);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!confirm("Are you sure you want to delete this team? This action cannot be undone.")) return;
    
    try {
      const teamProjects = projects.filter(p => p.team_id === teamId);
      await Promise.all(teamProjects.map(p => Project.delete(p.id)));
      await Team.delete(teamId);
      fetchData();
    } catch (error) {
      console.error("Error deleting team:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      // The base44 SDK will handle redirecting to the login page.
    } catch (error) {
      console.error("Logout error:", error);
      // As a fallback, reload the page to trigger an auth check.
      window.location.reload();
    }
  };

  return (
    <SidebarProvider>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        :root {
          --primary-navy: #1a1f36;
          --primary-blue: #4f46e5;
          --secondary-blue: #6366f1;
          --accent-purple: #8b5cf6;
          --success-green: #10b981;
          --warning-yellow: #f59e0b;
          --error-red: #ef4444;
          --neutral-50: #f8fafc;
          --neutral-100: #f1f5f9;
          --neutral-200: #e2e8f0;
          --neutral-300: #cbd5e1;
          --neutral-400: #94a3b8;
          --neutral-500: #64748b;
          --neutral-600: #475569;
          --neutral-700: #334155;
          --neutral-800: #1e293b;
          --neutral-900: #0f172a;
        }
        
        * {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }
        
        .glass-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .hover-lift {
          transition: all 0.2s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .sidebar-item {
          transition: all 0.2s ease;
          border-radius: 8px;
        }

        .sidebar-item:hover {
          background: linear-gradient(135deg, var(--primary-blue), var(--secondary-blue));
          color: white;
        }

        .sidebar-item.active {
          background: linear-gradient(135deg, var(--primary-blue), var(--accent-purple));
          color: white;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }
      `}</style>
      
      <div className="min-h-screen flex w-full" style={{backgroundColor: 'var(--neutral-50)'}}>
        <Sidebar className="border-r" style={{borderColor: 'var(--neutral-200)', backgroundColor: 'white'}}>
          <SidebarHeader className="border-b p-6" style={{borderColor: 'var(--neutral-200)'}}>
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                style={{background: 'linear-gradient(135deg, var(--primary-blue), var(--accent-purple))'}}
              >
                SPM
              </div>
              <div>
                <h2 className="font-semibold text-lg" style={{color: 'var(--neutral-900)'}}>StridePM</h2>
                <p className="text-sm" style={{color: 'var(--neutral-500)'}}>Project Management</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            {navigationGroups.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider px-2 py-2" style={{color: 'var(--neutral-500)'}}>
                  {group.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`sidebar-item px-3 py-2 ${
                            location.pathname.includes(item.url.split('?')[0])
                              ? 'active' 
                              : 'text-gray-700 hover:text-white'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3">
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}

            <SidebarGroup className="mt-6">
              <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider px-2 py-2 flex items-center justify-between" style={{color: 'var(--neutral-500)'}}>
                Your Teams
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-5 h-5 hover:bg-blue-100 hover:text-blue-600"
                  onClick={() => setIsNewTeamModalOpen(true)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                 <SidebarMenu className="space-y-1">
                  {isLoading ? (
                    <div className="px-3 text-sm text-gray-400">Loading teams...</div>
                  ) : (
                    teams.map(team => (
                      <Collapsible key={team.id} className="group">
                        <CollapsibleTrigger className="w-full">
                          <SidebarMenuItem>
                            <SidebarMenuButton className="sidebar-item flex items-center justify-between w-full text-gray-700 hover:text-white px-3 py-2">
                               <div className="flex items-center gap-3">
                                <span className="text-lg">{team.icon}</span>
                                <span className="font-medium text-sm">{team.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="w-5 h-5 opacity-0 group-hover:opacity-100">
                                      <Trash2 className="w-3 h-3 text-red-500" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTeam(team.id);
                                      }}
                                      className="text-red-600"
                                    >
                                      Delete Team
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                <ChevronsUpDown className="w-4 h-4 group-data-[state=open]:rotate-180 transition-transform" />
                              </div>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pl-6 ml-2 border-l border-gray-200">
                          <SidebarMenu className="space-y-1 py-1">
                            {projects.filter(p => p.team_id === team.id).map(p => (
                               <SidebarMenuItem key={p.id}>
                                <SidebarMenuButton 
                                  asChild 
                                  className={`sidebar-item w-full text-left justify-start px-3 py-1.5 ${
                                    location.search.includes(p.id)
                                      ? 'active' 
                                      : 'text-gray-600 hover:text-white'
                                  }`}
                                >
                                  <Link to={createPageUrl(`ProjectDetail?id=${p.id}`)} className="flex items-center gap-3 text-sm truncate">
                                    <span className={`w-2 h-2 rounded-full ${p.status === 'Completed' ? 'bg-green-500' : p.status === 'In Progress' ? 'bg-blue-500' : 'bg-gray-400'}`}></span>
                                    <span>{p.title}</span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            ))}
                             <SidebarMenuItem>
                                <SidebarMenuButton asChild className="sidebar-item w-full text-left justify-start px-3 py-1.5 text-gray-500 hover:text-white">
                                    <Link to={createPageUrl('Projects?action=new&teamId=' + team.id)} className="flex items-center gap-2 text-sm">
                                        <Plus className="w-3.5 h-3.5"/>
                                        New Project
                                    </Link>
                                </SidebarMenuButton>
                             </SidebarMenuItem>
                          </SidebarMenu>
                        </CollapsibleContent>
                      </Collapsible>
                    ))
                  )}
                 </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t p-4" style={{borderColor: 'var(--neutral-200)'}}>
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback style={{backgroundColor: 'var(--primary-blue)', color: 'white'}}>
                  JS
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate" style={{color: 'var(--neutral-900)'}}>Jawad Sharif</p>
                <p className="text-xs truncate" style={{color: 'var(--neutral-500)'}}>jawad.sharif@company.com</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b px-6 py-4 md:hidden" style={{borderColor: 'var(--neutral-200)'}}>
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-semibold" style={{color: 'var(--neutral-900)'}}>StridePM</h1>
            </div>
          </header>

          <div className="hidden md:flex items-center justify-between bg-white border-b px-8 py-4" style={{borderColor: 'var(--neutral-200)'}}>
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-semibold" style={{color: 'var(--neutral-900)'}}>{currentPageName}</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{color: 'var(--neutral-400)'}} />
                <Input 
                  placeholder="Search projects, tasks..." 
                  className="pl-10 w-64 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <Button variant="ghost" size="icon" className="hover:bg-gray-100 relative">
                <Bell className="w-5 h-5" style={{color: 'var(--neutral-600)'}} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                <Settings className="w-5 h-5" style={{color: 'var(--neutral-600)'}} />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
           <Outlet/>
          </div>
        </main>
      </div>

      <Dialog open={isNewTeamModalOpen} onOpenChange={setIsNewTeamModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3">
              <Input
                placeholder="Team icon (emoji)"
                value={newTeamIcon}
                onChange={(e) => setNewTeamIcon(e.target.value)}
                className="w-16 text-center"
                maxLength={2}
              />
              <Input
                placeholder="Team name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewTeamModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTeam} disabled={!newTeamName.trim()}>Create Team</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
