"use client";

import { Menu } from "lucide-react";
import ThemeToggle from "@/components/layout/theme-toggle";
import LogoutButton from "@/components/layout/logout-button";

interface AdminHeaderProps {
  toggleMobileSidebar: () => void;
}

export default function AdminHeader({ toggleMobileSidebar }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-zinc-200 dark:border-white/5 bg-white/80 dark:bg-[#1f1d1c]/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          className="p-2 -ml-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg lg:hidden"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-white hidden sm:block">
          Admin Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <LogoutButton />
      </div>
    </header>
  );
}