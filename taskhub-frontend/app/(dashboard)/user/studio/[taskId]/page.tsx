"use client";

import Image from "next/image";
import {
  Calendar,
  User,
  Clock,
  CheckSquare,
  AlertCircle,
  Loader2,
  Sparkles,
  Eye,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import toast from "react-hot-toast";



export default function StudioPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId as string;
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);
  const [generatingAction, setGeneratingAction] = useState<string | null>(null);

  useEffect(() => {
    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  const fetchTask = async () => {
    try {
      const res = await api.get(`/tasks/${taskId}`);
      setTask(res.data);
      
      const genRes = await api.get(`/ai/tasks/${taskId}/generations`);
      setGeneratedImages(genRes.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load task details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post(`/tasks/${taskId}/submit`);
      toast.success("Task submitted successfully!");
      fetchTask();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to submit task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateAction = async (prompt: string) => {
    setGeneratingAction(prompt);
    try {
      if (task.status === "assigned") {
        await api.put(`/tasks/${taskId}/start`);
        fetchTask();
      }

      const res = await api.post(`/ai/tasks/${taskId}/generate`, { prompt });
      const jobId = res.data.job_id;
      
      toast.success(`${prompt} generation started!`);
      
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await api.get(`/ai/jobs/${jobId}/status`);
          const status = statusRes.data.status;
          
          if (status === 'SUCCESS' || status === 'FAILURE') {
            clearInterval(pollInterval);
            if (status === 'SUCCESS') {
              toast.success(`${prompt} generated successfully!`);
            } else {
              toast.error(`Failed to generate ${prompt}`);
            }
            fetchTask();
            setGeneratingAction(null);
          }
        } catch (e) {
          console.error("Polling error", e);
          clearInterval(pollInterval);
          setGeneratingAction(null);
        }
      }, 2000);
      
    } catch (error: any) {
      toast.error(error.response?.data?.error || `Failed to start ${prompt} generation`);
      setGeneratingAction(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#8b5e3c]" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold">Task not found</h2>
      </div>
    );
  }

  const stages = [
    { id: "assigned", label: "Assigned" },
    { id: "in_progress", label: "In Progress" },
    { id: "submitted", label: "Submitted" },
    { id: "accepted", label: "Accepted" }
  ];

  // Map revision_requested to submitted for timeline logic
  const currentStageIndex = stages.findIndex(s => {
    if (task.status === "revision_requested") return s.id === "submitted";
    return s.id === task.status;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      
      {/* TOP */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-zinc-900 dark:text-white capitalize">
          {task.task_title || "Task Studio"}
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 capitalize">
          Product: {task.product_name}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* LEFT PANEL */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* PRODUCT REFERENCE */}
          <div className="rounded-3xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#1f1d1c] p-6 flex flex-col sm:flex-row gap-6 items-start">
            <div className="group relative w-full sm:w-48 h-48 rounded-2xl overflow-hidden flex-shrink-0 border border-zinc-100 dark:border-white/10 cursor-pointer">
              <Image
                src={task.product_image_url || "/image-1.png"}
                alt="Product"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div 
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                onClick={() => setPreviewImage(task.product_image_url || "/image-1.png")}
              >
                <Eye className="text-white w-8 h-8" />
              </div>
            </div>
            <div className="flex flex-col justify-center h-full">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Reference Information</h2>
              <div className="mt-4 space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
                {/* <p><strong>Description:</strong> {task.description || "No description provided."}</p> */}
                <p><strong>Gender:</strong> <span className="capitalize">{task.gender}</span></p>
              </div>
            </div>
          </div>

          {/* AI GENERATED IMAGES */}
          <div className="rounded-3xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#1f1d1c] p-6">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                 <Sparkles size={18} className="text-[#8b5e3c]" />
                 AI Generated Images
               </h3>
               <span className="text-xs px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full font-medium">{generatedImages.length} outputs</span>
             </div>

             <div className="flex flex-wrap gap-4 mb-8">
               <button 
                 onClick={() => handleGenerateAction("White Background")}
                 disabled={generatingAction !== null}
                 className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 text-slate-700 dark:text-slate-200 shadow-sm"
               >
                 {generatingAction === "White Background" ? (
                   <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                 ) : (
                   "Generate White Background Image"
                 )}
               </button>
               
               <button 
                 onClick={() => handleGenerateAction("Luxury Background")}
                 disabled={generatingAction !== null}
                 className="px-5 py-2.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 text-amber-800 dark:text-amber-300 shadow-sm"
               >
                 {generatingAction === "Luxury Background" ? (
                   <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                 ) : (
                   "Generate Luxury Background Images"
                 )}
               </button>
               
               <button 
                 onClick={() => handleGenerateAction("Creative/Artistic Background")}
                 disabled={generatingAction !== null}
                 className="px-5 py-2.5 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/40 dark:hover:bg-purple-900/60 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 text-purple-800 dark:text-purple-300 shadow-sm"
               >
                 {generatingAction === "Creative/Artistic Background" ? (
                   <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                 ) : (
                   "Generate Creative / Artistic Background Images"
                 )}
               </button>
               
               <button 
                 onClick={() => handleGenerateAction("Model Generation")}
                 disabled={generatingAction !== null}
                 className="px-5 py-2.5 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/60 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 text-emerald-800 dark:text-emerald-300 shadow-sm"
               >
                 {generatingAction === "Model Generation" ? (
                   <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                 ) : (
                   "Generate Model Image"
                 )}
               </button>
             </div>

             {generatedImages.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-10 text-zinc-500 dark:text-zinc-400">
                 <p className="text-sm">No images generated yet. Click on buttons to generate.</p>
               </div>
             ) : (
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                 {generatedImages.map((item, index) => (
                   <div key={item.id || index} className="group relative rounded-xl overflow-hidden border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-[#2a2827]">
                     <div className="relative h-28 sm:h-32 w-full cursor-pointer">
                       <Image
                         src={item.image_url}
                         alt={`Output ${index + 1}`}
                         fill
                         sizes="(max-width: 640px) 50vw, 25vw"
                         className="object-cover transition-transform group-hover:scale-105"
                       />
                       <div 
                         className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                         onClick={() => setPreviewImage(item.image_url)}
                       >
                         <Eye className="text-white w-6 h-6" />
                       </div>
                     </div>
                     <div className="p-2 text-center border-t border-zinc-200 dark:border-white/5">
                       <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">Output {index + 1}</span>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>

        {/* RIGHT PANEL - DETAILS & TIMELINE */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* TASK DETAILS */}
          <div className="rounded-3xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#1f1d1c] p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-5">Task Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                  <User size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Assigned By</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white mt-0.5">{task.admin_name || "Admin"}</p>
                  {task.admin_email && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{task.admin_email}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                  <Calendar size={18} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Assigned On</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white mt-0.5">
                    {new Date(task.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Deadline</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white mt-0.5">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "No deadline"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* TIMELINE / STAGES */}
          <div className="rounded-3xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#1f1d1c] p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-5 flex justify-between items-center">
              Status Timeline
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 capitalize">
                {task.status.replace("_", " ")}
              </span>
            </h3>

            <div className="relative space-y-0 pl-4 border-l-2 border-zinc-100 dark:border-zinc-800 ml-3">
              {stages.map((stage, index) => {
                const isCompleted = index <= currentStageIndex;
                const isCurrent = index === currentStageIndex;
                
                let dotColor = isCompleted ? "bg-[#8b5e3c]" : "bg-zinc-200 dark:bg-zinc-700";
                if (task.status === "revision_requested" && stage.id === "submitted") {
                   dotColor = "bg-amber-500";
                }

                return (
                  <div key={stage.id} className="relative pb-8 last:pb-0 pl-6">
                    {/* Circle */}
                    <div className={`absolute -left-[27px] top-0.5 w-3 h-3 rounded-full ${dotColor} transition-colors duration-300`} />
                    
                    <div>
                      <h4 className={`text-sm font-semibold ${isCompleted ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-600'}`}>
                        {stage.id === "submitted" && task.status === "revision_requested" ? "Revision Requested" : stage.label}
                      </h4>
                      {isCurrent && stage.id === "in_progress" && (
                        <p className="text-xs text-zinc-500 mt-1">You are currently working on this task.</p>
                      )}
                      {isCurrent && stage.id === "submitted" && task.status !== "revision_requested" && (
                        <p className="text-xs text-zinc-500 mt-1">Pending admin approval.</p>
                      )}
                      {task.status === "revision_requested" && stage.id === "submitted" && (
                        <p className="text-xs text-amber-600 mt-1">Admin has requested a revision.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SUBMIT ACTION */}
          <div className="pt-2">
            <button
              onClick={handleSubmit}
              disabled={submitting || task.status === 'submitted' || task.status === 'accepted'}
              className="
                w-full
                py-4
                rounded-2xl
                bg-green-600
                hover:bg-green-700
                disabled:bg-zinc-300
                disabled:dark:bg-zinc-800
                disabled:cursor-not-allowed
                text-white
                font-semibold
                transition-all
                flex items-center justify-center gap-2
              "
            >
              {submitting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <CheckSquare size={20} />
              )}
              {submitting ? 'Submitting...' : task.status === 'submitted' ? 'Waiting for Approval' : task.status === 'accepted' ? 'Completed' : 'Submit Completed Task'}
            </button>
            {(task.status === 'assigned' || task.status === 'revision_requested' || task.status === 'in_progress') && (
               <p className="text-xs text-center text-zinc-500 mt-3">Make sure to complete all required outputs before submitting.</p>
            )}
          </div>
        </div>
      </div>

      {/* IMAGE PREVIEW MODAL */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" 
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center" 
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-zinc-300 transition-colors bg-black/50 hover:bg-black/80 rounded-full"
            >
              <X size={24} />
            </button>
            <div className="relative w-full h-[80vh] rounded-xl overflow-hidden">
              <Image
                src={previewImage}
                alt="Preview"
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}