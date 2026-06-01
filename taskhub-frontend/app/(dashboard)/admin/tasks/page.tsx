"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, CalendarDays, User2, Trash2, Clock, X } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete/Reassign Modal State
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [reassignEmail, setReassignEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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

  const initiateDelete = (task: any) => {
    // If the task is already accepted, just delete it directly
    if (task.status === 'accepted') {
      if (confirm("Are you sure you want to delete this completed task?")) {
        executeDelete(task.id);
      }
    } else {
      // If incomplete, show the Reassign/Delete modal
      setSelectedTask(task);
      setShowModal(true);
      setReassignEmail("");
    }
  };

  const executeDelete = async (taskId: string) => {
    setIsProcessing(true);
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success("Task deleted successfully");
      setTasks(tasks.filter(t => t.id !== taskId));
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete task");
    } finally {
      setIsProcessing(false);
    }
  };

  const executeReassign = async () => {
    if (!reassignEmail) {
      toast.error("Please enter a new user's email");
      return;
    }
    
    setIsProcessing(true);
    try {
      const response = await api.post(`/tasks/${selectedTask.id}/assign`, {
        assigned_user_email: reassignEmail
      });
      toast.success("Task reassigned successfully");
      
      // Update local state
      setTasks(tasks.map(t => t.id === selectedTask.id ? response.data : t));
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to reassign task");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-zinc-500 dark:text-zinc-400">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* DELETE / REASSIGN MODAL */}
      {showModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1f1d1c] w-full max-w-md rounded-3xl p-6 shadow-xl border border-zinc-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Task Management</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                <X size={20} className="text-zinc-500" />
              </button>
            </div>
            
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              The task <strong>"{selectedTask.task_title}"</strong> is not yet completed. 
              Would you like to reassign this task to another user, or permanently delete it?
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/5">
                <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2">
                  Reassign to New User
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="User's email address..."
                    value={reassignEmail}
                    onChange={(e) => setReassignEmail(e.target.value)}
                    className="flex-1 rounded-xl bg-white dark:bg-[#1f1d1c] border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
                  />
                  <button 
                    onClick={executeReassign}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-[#8b5e3c] hover:bg-[#a06c45] text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Reassign
                  </button>
                </div>
                <p className="mt-2 text-xs text-zinc-500">The original user will be notified of the cancellation.</p>
              </div>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-zinc-200 dark:border-zinc-700"></div>
                <span className="flex-shrink-0 mx-4 text-xs font-semibold text-zinc-400 uppercase tracking-widest">OR</span>
                <div className="flex-grow border-t border-zinc-200 dark:border-zinc-700"></div>
              </div>

              <button
                onClick={() => executeDelete(selectedTask.id)}
                disabled={isProcessing}
                className="w-full py-3 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 font-bold rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Task Management
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Assign, manage, and review AI-generated product tasks.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/admin/tasks/create"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#8b5e3c] hover:bg-[#a06c45] text-white text-sm font-medium transition-all"
          >
            <Plus size={18} />
            Create Task
          </Link>
        </div>
      </div>

      {/* TASK GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tasks.map((task) => {
          const userDetails = getUserDetails(task.assigned_user_id);
          return (
            <div
              key={task.id}
              className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#1f1d1c] shadow-sm hover:shadow-lg transition-all flex flex-col group relative"
            >
              {/* DELETE BUTTON */}
              <button
                onClick={() => initiateDelete(task)}
                className="absolute top-3 left-3 z-10 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                title="Manage / Delete Task"
              >
                <Trash2 size={16} />
              </button>

              {/* IMAGE */}
              <div className="relative h-36 w-full shrink-0 bg-zinc-100 dark:bg-zinc-800">
                <img
                  src={task.product_image_url || "/placeholder.png"}
                  alt={task.task_title || "Task"}
                  className="w-full h-full object-cover"
                />

                {/* STATUS */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider backdrop-blur-sm shadow-sm
                    ${task.status === "assigned" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/80 dark:text-amber-300" : ""}
                    ${task.status === "in_progress" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/80 dark:text-blue-300" : ""}
                    ${task.status === "submitted" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/80 dark:text-purple-300" : ""}
                    ${task.status === "accepted" ? "bg-green-100 text-green-700 dark:bg-green-900/80 dark:text-green-300" : ""}
                    ${task.status === "revision_requested" ? "bg-red-100 text-red-700 dark:bg-red-900/80 dark:text-red-300" : ""}
                    `}
                  >
                    {task.status?.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white line-clamp-1">
                  {task.task_title}
                </h3>

                <div className="mt-4 space-y-2 flex-1">
                  <div className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <User2 size={14} className="mt-0.5 shrink-0" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium text-zinc-900 dark:text-zinc-200 truncate">{userDetails.name}</span>
                      <span className="truncate text-zinc-500">{userDetails.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <Clock size={14} className="shrink-0" />
                    <span>Assigned: {task.created_at ? new Date(task.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <CalendarDays size={14} className="shrink-0" />
                    <span className="font-medium">Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>

                {/* BUTTONS */}
                <div className="mt-5">
                  <Link
                    href={`/admin/tasks/${task.id}`}
                    className="block w-full py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-[#8b5e3c] hover:text-white text-center text-zinc-900 dark:text-zinc-100 text-xs font-semibold transition-all border border-zinc-200 dark:border-zinc-700 hover:border-transparent"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {tasks.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-zinc-500 dark:text-zinc-400">
            No tasks have been created yet.
          </div>
        )}
      </div>
    </div>
  );
}