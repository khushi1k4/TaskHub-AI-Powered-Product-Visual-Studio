"use client";

import { useState } from "react";
import UserSidebar from "@/components/user/user-sidebar";
import ThemeToggle from "@/components/layout/theme-toggle";
import AuthProvider from "@/components/providers/AuthProvider";
import LogoutButton from "@/components/layout/logout-button";
import { Menu } from "lucide-react";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <AuthProvider requireRole="user">
      <div className="min-h-screen flex bg-zinc-50 dark:bg-[#181716] overflow-hidden relative">
        <UserSidebar 
          isMobileOpen={isMobileOpen} 
          setIsMobileOpen={setIsMobileOpen} 
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        <main className="flex-1 flex flex-col h-screen overflow-y-auto">
          {/* TOPBAR */}
          <div className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200 dark:border-white/5 bg-white/80 dark:bg-[#1f1d1c]/80 backdrop-blur-xl px-4 sm:px-6 py-4 shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="p-2 -ml-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg lg:hidden"
              >
                <Menu size={24} />
              </button>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white hidden sm:block">
                User Workspace
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8 flex-1">
            {children}
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}