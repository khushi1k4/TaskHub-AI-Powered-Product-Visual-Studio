"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  RefreshCcw,
  CheckCircle2,
  Bell,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { api } from "@/lib/api";

const links = [
  {
    name: "Dashboard",
    href: "/user",
    icon: LayoutDashboard,
  },
  {
    name: "Assigned Tasks",
    href: "/user/tasks",
    icon: ClipboardList,
  },
  {
    name: "Revisions",
    href: "/user/revisions",
    icon: RefreshCcw,
  },
  {
    name: "Completed",
    href: "/user/completed",
    icon: CheckCircle2,
  },
  {
    name: "Notifications",
    href: "/user/notifications",
    icon: Bell,
  },
];

interface UserSidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export default function UserSidebar({ isMobileOpen, setIsMobileOpen, isCollapsed, setIsCollapsed }: UserSidebarProps) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const res = await api.get(`/tasks/my-tasks?t=${new Date().getTime()}`);
        const tasks = res.data || [];
        const alerts: any[] = [];

        tasks.forEach((task: any) => {
          const createdAt = new Date(task.created_at);
          alerts.push({ date: createdAt });
          
          if (task.status === 'revision_requested') {
            const updatedAt = task.updated_at ? new Date(task.updated_at) : new Date(createdAt.getTime() + 1000 * 60 * 60 * 24); 
            alerts.push({ date: updatedAt });
          }
          
          if (task.status === 'accepted') {
            const updatedAt = task.updated_at ? new Date(task.updated_at) : new Date(createdAt.getTime() + 1000 * 60 * 60 * 48);
            alerts.push({ date: updatedAt });
          }
        });

        const lastSeenStr = localStorage.getItem('last_seen_notifications');
        const lastSeen = lastSeenStr ? parseInt(lastSeenStr) : 0;
        
        const newCount = alerts.filter(a => a.date.getTime() > lastSeen).length;
        setUnreadCount(newCount);

      } catch (error) {
        console.error("Failed to fetch notification count", error);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (pathname === '/user/notifications') {
      localStorage.setItem('last_seen_notifications', Date.now().toString());
      setUnreadCount(0);
    }
  }, [pathname]);

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
        ${isCollapsed ? "w-20" : "w-[260px]"}
        `}
      >
        {/* LOGO & CLOSE */}
        <div className={`flex items-center mt-6 px-4 ${isCollapsed ? "justify-center" : "justify-between"} mb-8`}>
          <div className={`flex flex-col ${isCollapsed ? "items-center" : ""}`}>
            <h1 className="text-2xl font-bold text-[#8b5e3c] transition-all">
              {isCollapsed ? "TH" : "TaskHub"}
            </h1>
            {!isCollapsed && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                AI Product Studio
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
        <nav className="space-y-3 flex-1 overflow-y-auto px-4">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center ${isCollapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-3"} rounded-2xl text-sm font-medium transition-all ${
                  active
                    ? "bg-[#8b5e3c] text-white"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-[#2a2827]"
                }`}
                title={isCollapsed ? link.name : undefined}
              >
                <div className="relative">
                  <Icon size={isCollapsed ? 22 : 18} />
                  {link.name === "Notifications" && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-[#1f1d1c]">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                {!isCollapsed && <span>{link.name}</span>}
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