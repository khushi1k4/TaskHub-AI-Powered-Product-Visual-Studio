"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CalendarDays,
  Clock3,
  User2,
  CheckCircle2,
  RefreshCcw,
  Sparkles,
  ArrowLeft,
  Eye
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function TaskDetailsPage() {
  const { taskId } = useParams();
  const router = useRouter();
  
  const [task, setTask] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [generations, setGenerations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [taskId]);

  const fetchData = async () => {
    try {
      // Fetch task details
      const taskRes = await api.get(`/tasks/${taskId}`);
      const fetchedTask = taskRes.data;
      setTask(fetchedTask);

      // Fetch user details & generations in parallel
      const [usersRes, genRes] = await Promise.all([
        api.get("/auth/users"), // Admin fetches all users
        api.get(`/ai/tasks/${taskId}/generations`)
      ]);
      
      const assignedUser = usersRes.data.find((u: any) => String(u.id) === String(fetchedTask.assigned_user_id));
      setUser(assignedUser || { full_name: "Unknown User", email: "Not Found" });
      setGenerations(genRes.data || []);
      
    } catch (error) {
      console.error("Error fetching task details:", error);
      toast.error("Failed to load task details");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!confirm("Are you sure you want to approve this submission?")) return;
    try {
      await api.put(`/tasks/${taskId}/accept`);
      toast.success("Submission approved!");
      fetchData(); // Refresh state
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to approve");
    }
  };

  const handleRevision = async () => {
    if (!confirm("Are you sure you want to request a revision?")) return;
    try {
      await api.put(`/tasks/${taskId}/request-revision`);
      toast.success("Revision requested!");
      fetchData(); // Refresh state
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to request revision");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-zinc-500 dark:text-zinc-400">Loading task details...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Task Not Found</h2>
        <button onClick={() => router.push('/admin/tasks')} className="mt-4 text-[#8b5e3c] hover:underline">
          Return to Tasks
        </button>
      </div>
    );
  }

  // Calculate Progress
  const progressSteps = ["assigned", "in_progress", "submitted", "accepted"];
  const currentStepIndex = progressSteps.indexOf(task.status === "revision_requested" ? "in_progress" : task.status);
  
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div>
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-3"
          >
            <ArrowLeft size={16} /> Back
          </button>
          
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {task.task_title}
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Review generated product visuals and manage task workflow.
          </p>
        </div>

        {/* STATUS */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider
          ${task.status === "submitted" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" : ""}
          ${task.status === "accepted" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : ""}
          ${task.status === "revision_requested" ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" : ""}
          ${task.status === "in_progress" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" : ""}
          ${task.status === "assigned" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" : ""}
        `}>
          <Clock3 size={16} />
          {task.status.replace("_", " ")}
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LEFT SIDE */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* PRODUCT IMAGE */}
          <div className="rounded-3xl overflow-hidden border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#1f1d1c]">
            <div className="relative h-[200px] sm:h-[280px] bg-zinc-100 dark:bg-zinc-800 group cursor-pointer">
              <img
                src={task.product_image_url || "/placeholder.png"}
                alt={task.task_title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <a href={task.product_image_url} target="_blank" rel="noreferrer" className="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center text-white backdrop-blur-md">
                   <Eye size={24} />
                </a>
              </div>
            </div>

            <div className="p-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Product Reference Image
              </h2>
              {/* <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {task.description || "No description provided."}
              </p> */}
            </div>
          </div>

          {/* GENERATED IMAGES */}
          <div className="rounded-3xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#1f1d1c] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Generated Outputs
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {generations.length} AI outputs submitted
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#8b5e3c] font-medium">
                <Sparkles size={16} />
                AI Generated
              </div>
            </div>

            {/* GRID */}
            {generations.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {generations.map((gen: any) => (
                  <div key={gen.id} className="relative aspect-square rounded-2xl overflow-hidden group bg-zinc-100 dark:bg-zinc-800">
                    <img
                      src={gen.image_url}
                      alt="Generated AI"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100">
                       <a href={gen.image_url} target="_blank" rel="noreferrer" className="text-white text-xs bg-black/60 px-2 py-1 rounded-md text-center backdrop-blur-md">
                         View Full
                       </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-zinc-500 dark:text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                No images have been generated for this task yet.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">
          
          {/* TASK INFO */}
          <div className="rounded-3xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#1f1d1c] p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">
              Task Information
            </h2>
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-[#262423] flex items-center justify-center">
                  <User2 size={18} className="text-zinc-700 dark:text-zinc-300" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Assigned User</p>
                  <h4 className="text-sm font-medium text-zinc-900 dark:text-white truncate">{user?.full_name}</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-[#262423] flex items-center justify-center">
                  <CalendarDays size={18} className="text-zinc-700 dark:text-zinc-300" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Created Date</p>
                  <h4 className="text-sm font-medium text-zinc-900 dark:text-white">
                    {new Date(task.created_at).toLocaleDateString()}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-[#262423] flex items-center justify-center">
                  <Clock3 size={18} className="text-zinc-700 dark:text-zinc-300" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Deadline</p>
                  <h4 className="text-sm font-medium text-zinc-900 dark:text-white">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
                  </h4>
                </div>
              </div>
            </div>
          </div>

          {/* TASK PROGRESS */}
          <div className="rounded-3xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#1f1d1c] p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-5">
              Task Progress
            </h2>
            <div className="space-y-4">
              {[
                { key: 'assigned', label: 'Assigned to User' },
                { key: 'in_progress', label: 'In Progress (Studio)' },
                { key: 'submitted', label: 'Submitted for Review' },
                { key: 'accepted', label: 'Accepted & Finalized' }
              ].map((step, idx) => {
                const isCompleted = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;
                
                return (
                  <div key={step.key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm ${isCurrent ? 'font-bold text-[#8b5e3c]' : 'text-zinc-700 dark:text-zinc-300'}`}>
                        {step.label}
                      </span>
                      {isCompleted && (
                        <span className="text-xs text-green-600 dark:text-green-400 font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100 dark:bg-[#262423] overflow-hidden">
                      <div className={`h-full bg-[#8b5e3c] rounded-full transition-all duration-500 ${isCompleted ? 'w-full' : 'w-0'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTIONS (Only if submitted) */}
          {task.status === "submitted" && (
            <div className="rounded-3xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#1f1d1c] p-6 space-y-4">
              <button
                onClick={handleAccept}
                className="w-full py-4 rounded-2xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} /> Accept Submission
              </button>

              <button
                onClick={handleRevision}
                className="w-full py-4 rounded-2xl bg-amber-100 dark:bg-amber-900/20 hover:bg-amber-200 text-amber-700 dark:text-amber-300 text-sm font-bold transition-all flex items-center justify-center gap-2"
              >
                <RefreshCcw size={18} /> Request Revision
              </button>
            </div>
          )}

          {/* ACTIVITY */}
          <div className="rounded-3xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#1f1d1c] p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-5">
              Activity Timeline
            </h2>
            <div className="space-y-5 relative">
              {/* Vertical line connecting dots */}
              <div className="absolute top-2 bottom-2 left-1 w-0.5 bg-zinc-200 dark:bg-zinc-800 -z-10" />
              
              <div className="flex gap-3 relative z-10">
                <div className="mt-1 w-2.5 h-2.5 rounded-full bg-green-500 ring-4 ring-white dark:ring-[#1f1d1c]" />
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">Task Assigned</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {new Date(task.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {task.status !== 'assigned' && (
                <div className="flex gap-3 relative z-10">
                  <div className="mt-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white dark:ring-[#1f1d1c]" />
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">Status Updated</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                       Transitioned to: {task.status.replace("_", " ")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}