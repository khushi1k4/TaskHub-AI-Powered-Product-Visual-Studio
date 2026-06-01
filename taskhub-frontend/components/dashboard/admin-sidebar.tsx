"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  FolderKanban,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const links = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Tasks",
    href: "/admin/tasks",
    icon: ClipboardList,
  },
  {
    label: "Submissions",
    href: "/admin/submissions",
    icon: FolderKanban,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
];

interface AdminSidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export default function AdminSidebar({ isMobileOpen, setIsMobileOpen, isCollapsed, setIsCollapsed }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-50
        flex flex-col h-screen
        border-r border-zinc-200 dark:border-white/5
        bg-white dark:bg-[#1f1d1c]
        transition-all duration-300 ease-in-out
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${isCollapsed ? "w-20" : "w-72"}
        `}
      >
        {/* LOGO & CLOSE */}
        <div className={`flex items-center mt-6 px-4 ${isCollapsed ? "justify-center" : "justify-between"} mb-8`}>
          <div className={`flex flex-col ${isCollapsed ? "items-center" : ""}`}>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white transition-all">
              {isCollapsed ? "TH" : "TaskHub"}
            </h2>
            {!isCollapsed && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Admin Panel
              </p>
            )}
          </div>
          <button 
            className="lg:hidden p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
            onClick={() => setIsMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="space-y-2 flex-1 overflow-y-auto px-4">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center ${isCollapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-3"} rounded-2xl text-sm font-medium transition-all ${
                  active
                    ? "bg-[#8b5e3c] text-white"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5"
                }`}
                title={isCollapsed ? link.label : undefined}
              >
                <Icon size={isCollapsed ? 22 : 18} />
                {!isCollapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* COLLAPSE TOGGLE (Desktop only) */}
        <div className="hidden lg:flex p-4 border-t border-zinc-200 dark:border-white/5">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`flex items-center w-full p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-all ${isCollapsed ? "justify-center" : "justify-end"}`}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </aside>
    </>
  );
}