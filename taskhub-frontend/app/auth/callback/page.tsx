"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { api } from "@/lib/api";

import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase parses the URL hash automatically
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.error("Auth callback error:", error);
        router.push("/login");
        return;
      }

      // Sync the OAuth user with the backend database
      try {
        const storedRole = typeof window !== 'undefined' ? localStorage.getItem('oauth_role') : null;
        if (storedRole) {
            localStorage.removeItem('oauth_role');
        }

        const response = await api.post('/auth/oauth/callback', {
          user: session.user,
          role: storedRole
        }, {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });
        
        const role = response.data?.role || 'user';
        
        // Redirect based on role
        if (role === 'admin') {
          router.push("/admin/tasks");
        } else {
          router.push("/user/tasks");
        }
      } catch (err) {
        console.error("Failed to sync OAuth user:", err);
        // Fallback to user dashboard on error
        router.push("/user/tasks");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0b0b0c]">
      <div className="text-zinc-600 dark:text-zinc-400">Authenticating...</div>
    </div>
  );
}
