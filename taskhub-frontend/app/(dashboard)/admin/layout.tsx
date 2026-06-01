"use client";

import { ReactNode, useState } from "react";
import AdminSidebar from "@/components/dashboard/admin-sidebar";
import AdminHeader from "@/components/dashboard/admin-header";
import AuthProvider from "@/components/providers/AuthProvider";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <AuthProvider requireRole="admin">
      <div className="min-h-screen bg-zinc-100 dark:bg-[#181716] transition-colors relative">
        <div className="flex h-screen overflow-hidden">
          {/* SIDEBAR */}
          <AdminSidebar 
            isMobileOpen={isMobileOpen} 
            setIsMobileOpen={setIsMobileOpen} 
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />

          {/* CONTENT */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* HEADER */}
            <AdminHeader toggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)} />

            {/* PAGE CONTENT */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}