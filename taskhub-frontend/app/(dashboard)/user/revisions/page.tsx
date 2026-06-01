"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Loader2, CalendarDays, Clock3, User2, AlertCircle } from "lucide-react";

export default function UserRevisionsPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks/my-tasks?t=${new Date().getTime()}`);
      // Filter ONLY tasks that require revision
      const revisionTasks = (res.data || []).filter((t: any) => t.status === 'revision_requested');
      // Sort tasks by date, newest first
      const sorted = revisionTasks.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setTasks(sorted);
    } catch (error) {
      console.error("Failed to load tasks", error);
      toast.error("Failed to load your revision tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
          <AlertCircle className="text-red-500" size={28} /> Action Required: Revisions
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          The Admin has requested revisions on the following tasks. Please review and resubmit them.
        </p>
      </div>

      {tasks.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50 dark:bg-[#1a1818]">
          <p className="text-zinc-500 dark:text-zinc-400">Great job! You have no pending revisions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="rounded-3xl overflow-hidden border border-red-200 dark:border-red-900/50 bg-white dark:bg-[#1f1d1c] flex flex-col relative group shadow-sm hover:shadow-md transition-shadow"
            >
              {/* IMAGE */}
              <div className="relative h-48 bg-zinc-100 dark:bg-zinc-800 p-2">
                <img
                  src={task.product_image_url || "/placeholder.png"}
                  alt={task.task_title || "Task Image"}
                  className="w-full h-full object-contain drop-shadow-sm"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-red-900/60 to-transparent mix-blend-multiply" />
                
                {/* Status Badge */}
                <div className="absolute bottom-3 left-3">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-red-600/90 text-white shadow-lg flex items-center gap-1.5">
                    <RefreshIcon size={12} />
                    Revision Requested
                  </span>
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-5 flex flex-col flex-1">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white truncate">
                  {task.task_title || task.product_name || "Untitled Task"}
                </h2>
                
                <div className="mt-4 space-y-2.5 flex-1">
                  <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <User2 size={14} className="text-red-400" />
                    <span className="truncate">Reviewed by <strong className="text-zinc-900 dark:text-zinc-200">{task.admin_name}</strong></span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <CalendarDays size={14} className="text-zinc-400" />
                    <span>Assigned: {new Date(task.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <Clock3 size={14} className="text-red-500" />
                    <span className="text-red-600 dark:text-red-400 font-semibold">
                      Deadline: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'ASAP'}
                    </span>
                  </div>
                </div>

                {/* ACTION BUTTON */}
                <Link
                  href={`/user/studio/${task.id}`}
                  className="mt-5 block text-center py-3 rounded-2xl bg-red-500 hover:bg-red-700 text-white text-sm font-bold transition-all w-full shadow-md hover:shadow-lg"
                >
                  Open Studio & Fix
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RefreshIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
      <path d="M3 3v5h5"></path>
    </svg>
  );
}
