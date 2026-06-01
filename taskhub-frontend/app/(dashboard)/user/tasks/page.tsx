"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Loader2, Trash2, CalendarDays, Clock3, User2 } from "lucide-react";

export default function UserTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks/my-tasks?t=${new Date().getTime()}`);
      console.log("MY TASKS RESPONSE:", res.data);
      // Only show assigned, in progress, or submitted tasks.
      // Accepted or revision requested tasks go to their respective pages.
      const activeTasks = (res.data || []).filter((t: any) => ['assigned', 'in_progress', 'submitted'].includes(t.status));
      // Sort tasks by date, newest first
      const sorted = activeTasks.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setTasks(sorted);
    } catch (error) {
      console.error("Failed to load tasks", error);
      toast.error("Failed to load your tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (taskId: string, status: string) => {
    if (status !== 'accepted') {
      toast.error("You can only delete tasks that have been accepted by the admin.");
      return;
    }
    
    if (!confirm("Are you sure you want to delete this task? This action cannot be undone.")) return;
    
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success("Task deleted successfully");
      fetchTasks();
    } catch (error: any) {
      console.error("Delete failed", error);
      toast.error(error.response?.data?.error || "Failed to delete task");
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
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Assigned Tasks
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          View and manage all your AI generation tasks.
        </p>
      </div>

      {tasks.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
          <p className="text-zinc-500 dark:text-zinc-400">No tasks have been assigned to you yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tasks.map((task) => {
            const isAccepted = task.status === 'accepted';
            
            return (
              <div
                key={task.id}
                className="rounded-3xl overflow-hidden border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#1f1d1c] flex flex-col relative group shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Delete Icon (Top Right) */}
                <button
                  onClick={() => handleDelete(task.id, task.status)}
                  disabled={!isAccepted}
                  title={isAccepted ? "Delete Task" : "Cannot delete until accepted"}
                  className={`absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all
                    ${isAccepted 
                      ? 'bg-red-500/80 hover:bg-red-600 text-white cursor-pointer' 
                      : 'bg-black/30 text-white/50 cursor-not-allowed opacity-0 group-hover:opacity-100'}
                  `}
                >
                  <Trash2 size={16} />
                </button>

                {/* IMAGE */}
                <div className="relative h-48 bg-zinc-100 dark:bg-zinc-800 p-2">
                  <img
                    src={task.product_image_url || "/placeholder.png"}
                    alt={task.task_title || "Task Image"}
                    className="w-full h-full object-contain drop-shadow-sm"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  
                  {/* Status Badge */}
                  <div className="absolute bottom-3 left-3">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md
                      ${task.status === 'assigned' ? 'bg-zinc-900/60 text-zinc-100' : ''}
                      ${task.status === 'in_progress' ? 'bg-blue-900/60 text-blue-100' : ''}
                      ${task.status === 'submitted' || task.status === 'revision_requested' ? 'bg-amber-900/60 text-amber-100' : ''}
                      ${task.status === 'accepted' ? 'bg-green-900/60 text-green-100' : ''}
                    `}>
                      {task.status.replace("_", " ")}
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
                      <User2 size={14} className="text-zinc-400" />
                      <span className="truncate">Assigned by <strong className="text-zinc-900 dark:text-zinc-200">{task.admin_name}</strong></span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                      <CalendarDays size={14} className="text-zinc-400" />
                      <span>Assigned: {new Date(task.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                      <Clock3 size={14} className="text-zinc-400" />
                      <span>Deadline: <strong className={task.due_date ? "text-amber-600 dark:text-amber-400" : ""}>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</strong></span>
                    </div>
                  </div>

                  {/* ACTION BUTTON */}
                  <Link
                    href={`/user/studio/${task.id}`}
                    className="mt-5 block text-center py-3 rounded-2xl bg-[#8b5e3c] hover:bg-[#9b6d4d] text-white text-sm font-bold transition-all w-full"
                  >
                    Open AI Studio
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