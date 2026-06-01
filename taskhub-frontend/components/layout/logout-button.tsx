"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import toast from "react-hot-toast";

import { supabase } from "@/lib/supabase";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to log out");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="
      w-10 h-10 
      rounded-full 
      bg-zinc-100 dark:bg-[#1a1a1b] 
      border border-zinc-200 dark:border-white/5 
      flex items-center justify-center 
      text-zinc-600 dark:text-zinc-400 
      hover:text-red-500 dark:hover:text-red-400
      hover:bg-red-50 dark:hover:bg-red-950/20
      hover:border-red-200 dark:hover:border-red-900/30
      transition-all duration-300
      "
      title="Log out"
    >
      <LogOut size={18} />
    </button>
  );
}
