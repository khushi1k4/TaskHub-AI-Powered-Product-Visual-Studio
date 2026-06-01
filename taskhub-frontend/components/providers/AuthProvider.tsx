"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { api } from "@/lib/api";

import { supabase } from "@/lib/supabase";

interface AuthProviderProps {
  children: React.ReactNode;
  requireRole?: "admin" | "user";
}

export default function AuthProvider({ children, requireRole }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push("/login");
          return;
        }

        // We have a session, let's verify the role from our backend
        const response = await api.get("/auth/me");
        const role = response.data?.user?.role || "user";
        
        // If a specific role is required for this route layout
        if (requireRole && role !== requireRole) {
          // If they are an admin trying to access user dashboard, or vice versa
          if (role === "admin") {
            router.push("/admin/tasks");
          } else {
            router.push("/user/tasks");
          }
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname, requireRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0b0b0c]">
        <div className="text-zinc-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
