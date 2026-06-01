"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  RefreshCcw,
  CheckCircle2,
  Sparkles,
  Loader2
} from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function UserDashboardPage() {
  const [stats, setStats] = useState({
    assigned: 0,
    generating: 0,
    revision: 0,
    completed: 0
  });
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get(`/tasks/my-tasks?t=${new Date().getTime()}`);
      const allTasks = res.data || [];
      
      const newStats = {
        assigned: allTasks.filter((t: any) => t.status === 'assigned').length,
        generating: allTasks.filter((t: any) => t.status === 'in_progress').length,
        revision: allTasks.filter((t: any) => t.status === 'revision_requested' || t.status === 'submitted').length,
        completed: allTasks.filter((t: any) => t.status === 'accepted').length,
      };
      
      setStats(newStats);
      
      // Sort and get 4 most recent tasks
      const sorted = allTasks.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRecentTasks(sorted.slice(0, 4));
      
    } catch (error) {
      console.error("Failed to load user dashboard", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#8b5e3c]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Welcome Back 👋
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Manage your assigned AI generation tasks.
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {[
          { title: "Assigned", value: stats.assigned, icon: ClipboardList },
          { title: "Generating", value: stats.generating, icon: Sparkles },
          { title: "In Review", value: stats.revision, icon: RefreshCcw },
          { title: "Completed", value: stats.completed, icon: CheckCircle2 },
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="rounded-3xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#1f1d1c] p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{item.title}</p>
                  <h2 className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{item.value}</h2>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#8b5e3c]/10 flex items-center justify-center">
                  <Icon size={22} className="text-[#8b5e3c]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* RECENT TASKS */}
      <div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-5">
          Recent Tasks
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {recentTasks.length === 0 ? (
            <div className="text-sm text-zinc-500">No tasks assigned yet.</div>
          ) : (
            recentTasks.map((task) => {
              
              let progressWidth = "w-[10%]";
              if (task.status === "in_progress") progressWidth = "w-[30%]";
              if (task.status === "submitted" || task.status === "revision_requested") progressWidth = "w-[75%]";
              if (task.status === "accepted") progressWidth = "w-full";
              
              return (
                <div key={task.id} className="rounded-3xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#1f1d1c] p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white truncate max-w-[200px] sm:max-w-[300px]">
                        {task.task_title || task.product_name || "Untitled Task"}
                      </h3>
                      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                        Assigned by {task.admin_name}
                      </p>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize
                      ${task.status === 'assigned' ? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' : ''}
                      ${task.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                      ${task.status === 'submitted' || task.status === 'revision_requested' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                      ${task.status === 'accepted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                    `}>
                      {task.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="mt-5 w-full h-3 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                    <div className={`h-full ${progressWidth} bg-[#8b5e3c] rounded-full transition-all duration-500`} />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  );
}