"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Loader2, ArrowLeft, CheckCircle2, CalendarDays, Clock3 } from "lucide-react";
import toast from "react-hot-toast";

export default function CompletedTaskDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [task, setTask] = useState<any>(null);
  const [generations, setGenerations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.taskId) {
      fetchTaskDetails();
    }
  }, [params.taskId]);

  const fetchTaskDetails = async () => {
    try {
      // We don't have a single /tasks/:id endpoint exposed for users right now,
      // so we find it from /my-tasks.
      const res = await api.get('/tasks/my-tasks');
      const foundTask = (res.data || []).find((t: any) => t.id === params.taskId);
      
      if (!foundTask) {
        toast.error("Task not found");
        router.push("/user/completed");
        return;
      }
      setTask(foundTask);

      // Fetch generations
      const genRes = await api.get(`/ai-generations/${params.taskId}`);
      setGenerations(genRes.data || []);
      
    } catch (error) {
      console.error("Failed to load task details", error);
      toast.error("Failed to load task details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/user/completed"
            className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-zinc-600 dark:text-zinc-300" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
              {task.task_title || task.product_name || "Untitled Task"}
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Completed and approved by {task.admin_name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} /> Task Completed
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LEFT PANEL: Task Details */}
        <div className="xl:col-span-1 space-y-6">
          <div className="rounded-3xl overflow-hidden border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#1f1d1c]">
            <div className="relative h-[300px] bg-zinc-100 dark:bg-zinc-800 p-4">
              <img
                src={task.product_image_url || "/placeholder.png"}
                alt="Product Original"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Original Reference</h3>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <CalendarDays size={18} className="text-zinc-400" />
                  <span>Assigned: {new Date(task.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <Clock3 size={18} className="text-zinc-400" />
                  <span>Deadline: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Generated Images History */}
        <div className="xl:col-span-2">
          <div className="rounded-3xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#1f1d1c] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Generated Visuals History</h2>
              <span className="text-sm text-zinc-500 font-medium">Total: {generations.length}</span>
            </div>

            {generations.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 dark:text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                No generations were recorded for this task.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generations.map((gen, idx) => (
                  <div key={gen.id || idx} className="rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden group relative">
                    <div className="relative h-48 bg-zinc-50 dark:bg-zinc-900">
                      <img
                        src={gen.generated_image_url}
                        alt="Generated"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 bg-white dark:bg-[#1f1d1c]">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white line-clamp-2">
                        "{gen.prompt}"
                      </p>
                      <p className="mt-2 text-xs text-zinc-500">
                        {new Date(gen.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}