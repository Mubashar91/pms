import React from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  User as UserIcon,
  Inbox,
  FolderOpen,
  Target,
  RotateCcw,
  Calendar,
  AlertTriangle,
  BarChart3,
  Users,
  Plus,
  Trash2,
  ChevronsUpDown,
  Settings,
} from "lucide-react";

import { createPageUrl } from "@/utils";
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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const SidebarComponent = ({
  location,
  navigationGroups,
  teams,
  projects,
  isLoading,
  setIsNewTeamModalOpen,
  handleDeleteTeam,
  handleLogout,
}) => {
  return (
    <Sidebar className="border-r" style={{ borderColor: 'var(--neutral-200)', backgroundColor: 'white' }}>
      <SidebarHeader className="border-b p-6" style={{ borderColor: 'var(--neutral-200)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{ background: 'linear-gradient(135deg, var(--primary-blue), var(--accent-purple))' }}
          >
            SPM
          </div>
          <div>
            <h2 className="font-semibold text-lg" style={{ color: 'var(--neutral-900)' }}>StridePM</h2>
            <p className="text-sm" style={{ color: 'var(--neutral-500)' }}>Project Management</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        {navigationGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider px-2 py-2" style={{ color: 'var(--neutral-500)' }}>
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
          <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider px-2 py-2 flex items-center justify-between" style={{ color: 'var(--neutral-500)' }}>
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
                              <Plus className="w-3.5 h-3.5" />
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

      <SidebarFooter className="border-t p-4" style={{ borderColor: 'var(--neutral-200)' }}>
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback style={{ backgroundColor: 'var(--primary-blue)', color: 'white' }}>
              JS
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate" style={{ color: 'var(--neutral-900)' }}>Jawad Sharif</p>
            <p className="text-xs truncate" style={{ color: 'var(--neutral-500)' }}>jawad.sharif@company.com</p>
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
  );
};

export default SidebarComponent;
