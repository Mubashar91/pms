import React from "react";
import { Bell, Search, Settings } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Header({ currentPageName, onLogout }) {
  return (
    <>
      {/* Mobile Header */}
      <header className="bg-white border-b px-6 py-4 md:hidden" style={{ borderColor: 'var(--neutral-200)' }}>
        <div className="flex items-center gap-4">
          <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200" />
          <h1 className="text-xl font-semibold" style={{ color: 'var(--neutral-900)' }}>StridePM</h1>
        </div>
      </header>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between bg-white border-b px-8 py-4" style={{ borderColor: 'var(--neutral-200)' }}>
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--neutral-900)' }}>{currentPageName}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--neutral-400)' }} />
            <Input
              placeholder="Search projects, tasks..."
              className="pl-10 w-64 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <Button variant="ghost" size="icon" className="hover:bg-gray-100 relative">
            <Bell className="w-5 h-5" style={{ color: 'var(--neutral-600)' }} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-gray-100" onClick={onLogout}>
            <Settings className="w-5 h-5" style={{ color: 'var(--neutral-600)' }} />
          </Button>
        </div>
      </div>
    </>
  );
}
