"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Loader2, Trash2, CalendarDays, Clock3, User2, CheckCircle2 } from "lucide-react";

export default function UserCompletedTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks/my-tasks?t=${new Date().getTime()}`);
      // Filter ONLY completed/accepted tasks
      const completedTasks = (res.data || []).filter((t: any) => t.status === 'accepted');
      // Sort tasks by date, newest first
      const sorted = completedTasks.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setTasks(sorted);
    } catch (error) {
      console.error("Failed to load tasks", error);
      toast.error("Failed to load your completed tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to permanently delete this completed task? This action cannot be undone.")) return;
    
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success("Task deleted successfully");
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error: any) {
      console.error("Delete failed", error);
      toast.error(error.response?.data?.error || "Failed to delete task");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
          <CheckCircle2 className="text-green-500" size={28} /> Completed Tasks
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          History of all your successfully generated and approved tasks.
        </p>
      </div>

      {tasks.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50 dark:bg-[#1a1818]">
          <p className="text-zinc-500 dark:text-zinc-400">You haven't completed any tasks yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tasks.map((task) => {
            return (
              <div
                key={task.id}
                className="rounded-3xl overflow-hidden border border-green-200 dark:border-green-900/30 bg-white dark:bg-[#1f1d1c] flex flex-col relative group shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Delete Icon (Top Right) */}
                <button
                  onClick={() => handleDelete(task.id)}
                  title="Delete Completed Task"
                  className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all bg-red-500/80 hover:bg-red-600 text-white cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>

                {/* IMAGE */}
                <div className="relative h-48 bg-zinc-100 dark:bg-zinc-800 p-2">
                  <img
                    src={task.product_image_url || "/placeholder.png"}
                    alt={task.task_title || "Task Image"}
                    className="w-full h-full object-contain drop-shadow-sm opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-green-900/40 to-transparent mix-blend-multiply" />
                  
                  {/* Status Badge */}
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-green-600/90 text-white shadow-sm flex items-center gap-1.5">
                      <CheckCircle2 size={12} />
                      Completed
                    </span>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-5 flex flex-col flex-1 opacity-80">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white truncate">
                    {task.task_title || task.product_name || "Untitled Task"}
                  </h2>
                  
                  <div className="mt-4 space-y-2.5 flex-1">
                    <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                      <User2 size={14} className="text-zinc-400" />
                      <span className="truncate">Approved by <strong className="text-zinc-900 dark:text-zinc-200">{task.admin_name}</strong></span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                      <CalendarDays size={14} className="text-zinc-400" />
                      <span>Assigned: {new Date(task.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                      <Clock3 size={14} className="text-zinc-400" />
                      <span>Deadline: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>

                  {/* ACTION BUTTON */}
                  <Link
                    href={`/user/tasks/${task.id}`}
                    className="mt-5 block text-center py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white text-sm font-bold transition-all w-full"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
