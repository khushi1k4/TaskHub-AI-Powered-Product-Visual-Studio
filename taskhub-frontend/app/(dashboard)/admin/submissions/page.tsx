"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, RefreshCcw, Clock3, Sparkles, User2, CalendarDays, Eye, X } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import Image from "next/image";

export default function AdminSubmissionsPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, usersRes] = await Promise.all([
        api.get("/tasks/?scope=me"),
        api.get("/auth/users")
      ]);
      setTasks(tasksRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserDetails = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return { name: "Unknown User", email: "" };
    return { name: user.full_name, email: user.email };
  };

  const openReviewModal = async (task: any) => {
    setSelectedTask(task);
    setLoadingImages(true);
    try {
      const res = await api.get(`/ai/tasks/${task.id}/generations`);
      setGeneratedImages(res.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load generated images");
      setGeneratedImages([]);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleAccept = async (taskId: string) => {
    if (!confirm("Are you sure you want to approve this submission?")) return;
    try {
      await api.put(`/tasks/${taskId}/accept`);
      toast.success("Submission approved!");
      setSelectedTask(null);
      fetchData(); // Refresh to update stats and statuses
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to approve");
    }
  };

  const handleRevision = async (taskId: string) => {
    if (!confirm("Are you sure you want to request a revision?")) return;
    try {
      await api.put(`/tasks/${taskId}/request-revision`);
      toast.success("Revision requested!");
      setSelectedTask(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to request revision");
    }
  };

  const submissions = tasks.filter(t => ['submitted', 'accepted', 'revision_requested'].includes(t.status));
  const pendingCount = submissions.filter(s => s.status === 'submitted').length;
  const approvedCount = submissions.filter(s => s.status === 'accepted').length;
  const revisionCount = submissions.filter(s => s.status === 'revision_requested').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-zinc-500 dark:text-zinc-400">Loading submissions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* TOP HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Task Submissions
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Review AI-generated product image submissions from users.
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="rounded-3xl bg-white dark:bg-[#1f1d1c] border border-zinc-200 dark:border-white/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Submissions</p>
              <h2 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">{submissions.length}</h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Sparkles size={22} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#1f1d1c] border border-zinc-200 dark:border-white/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Pending Review</p>
              <h2 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">{pendingCount}</h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
              <Clock3 size={22} className="text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#1f1d1c] border border-zinc-200 dark:border-white/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Approved</p>
              <h2 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">{approvedCount}</h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle2 size={22} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#1f1d1c] border border-zinc-200 dark:border-white/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Revisions</p>
              <h2 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">{revisionCount}</h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <RefreshCcw size={22} className="text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* SUBMISSION CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {submissions.map((submission) => {
          const userDetails = getUserDetails(submission.assigned_user_id);
          return (
            <div
              key={submission.id}
              className="rounded-2xl overflow-hidden bg-white dark:bg-[#1f1d1c] border border-zinc-200 dark:border-white/5 shadow-sm hover:shadow-lg transition-all flex flex-col group"
            >
              {/* IMAGE */}
              <div className="relative h-36 w-full shrink-0 bg-zinc-100 dark:bg-zinc-800">
                <img
                  src={submission.product_image_url || "/placeholder.png"}
                  alt={submission.task_title || "Task"}
                  className="w-full h-full object-cover"
                />

                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider
                    ${
                      submission.status === "submitted"
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300"
                        : ""
                    }
                    ${
                      submission.status === "accepted"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300"
                        : ""
                    }
                    ${
                      submission.status === "revision_requested"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300"
                        : ""
                    }
                    `}
                  >
                    {submission.status?.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-4 flex-1 flex flex-col">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-white line-clamp-1">
                  {submission.task_title}
                </h2>

                <div className="mt-4 space-y-2 flex-1">
                  <div className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <User2 size={14} className="mt-0.5 shrink-0" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium text-zinc-900 dark:text-zinc-200 truncate">{userDetails.name}</span>
                      <span className="truncate text-zinc-500">{userDetails.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <CalendarDays size={14} className="shrink-0" />
                    <span className="font-medium">Due: {submission.due_date ? new Date(submission.due_date).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>

                {/* ACTIONS */}
                {submission.status === "submitted" && (
                  <div className="mt-5">
                    <button
                      onClick={() => openReviewModal(submission)}
                      className="w-full py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-sm"
                    >
                      <Eye size={14} /> Review Outputs
                    </button>
                  </div>
                )}
                
                {submission.status !== "submitted" && (
                   <div className="mt-5">
                      <button 
                        onClick={() => openReviewModal(submission)}
                        className="w-full py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold border border-zinc-200 dark:border-zinc-700 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Eye size={14} /> View Details
                      </button>
                   </div>
                )}
              </div>
            </div>
          );
        })}

        {submissions.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-zinc-500 dark:text-zinc-400">
            No tasks have been submitted for review yet.
          </div>
        )}
      </div>

      {/* REVIEW MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-[#1f1d1c] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200 dark:border-white/10">
            <div className="sticky top-0 bg-white/80 dark:bg-[#1f1d1c]/80 backdrop-blur-md p-6 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Review Task: {selectedTask.task_title}</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Review the AI generated outputs before making a decision.</p>
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {loadingImages ? (
                <div className="py-20 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white"></div>
                </div>
              ) : generatedImages.length === 0 ? (
                <div className="py-20 text-center text-zinc-500 dark:text-zinc-400">
                  <p>No generated images found for this task.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {generatedImages.map((img, idx) => (
                    <div key={img.id || idx} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-zinc-800">
                      <Image
                        src={img.image_url}
                        alt={`Output ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedTask.status === "submitted" && (
              <div className="sticky bottom-0 bg-white/90 dark:bg-[#1f1d1c]/90 backdrop-blur-md p-6 border-t border-zinc-200 dark:border-white/5 flex items-center justify-end gap-3 z-10">
                <button
                  onClick={() => handleRevision(selectedTask.id)}
                  className="px-6 py-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/20 hover:bg-amber-200 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-sm font-semibold transition-all flex items-center gap-2"
                >
                  <RefreshCcw size={16} /> Request Revision
                </button>
                <button
                  onClick={() => handleAccept(selectedTask.id)}
                  className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
                >
                  <CheckCircle2 size={16} /> Approve Outputs
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}