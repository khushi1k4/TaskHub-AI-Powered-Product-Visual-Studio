"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import {
  ClipboardList,
  FolderKanban,
  Users,
  Clock3,
  Loader2
} from "lucide-react";

export default function AdminDashboardPage() {
  const [statsData, setStatsData] = useState({
    totalTasks: 0,
    pendingReviews: 0,
    submissions: 0,
    users: 0,
  });
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/tasks/dashboard-stats');
        setStatsData(response.data.stats);
        setRecentTasks(response.data.recentTasks);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
        toast.error("Failed to load dashboard statistics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    {
      title: "Total Tasks",
      value: statsData.totalTasks,
      icon: ClipboardList,
    },
    {
      title: "Pending Reviews",
      value: statsData.pendingReviews,
      icon: Clock3,
    },
    {
      title: "Submissions",
      value: statsData.submissions,
      icon: FolderKanban,
    },
    {
      title: "Users",
      value: statsData.users,
      icon: Users,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#8b5e3c]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* PAGE TITLE */}

      <div>
        <h2
          className="
          text-2xl
          font-bold
          text-zinc-900
          dark:text-white
          "
        >
          Welcome Back 👋
        </h2>

        <p
          className="
          mt-2
          text-sm
          text-zinc-500
          dark:text-zinc-400
          "
        >
          Manage tasks and review
          AI-generated submissions.
        </p>
      </div>

      {/* STATS */}

      <div
        className="
        grid
        grid-cols-1
        sm:grid-cols-2
        xl:grid-cols-4
        gap-5
        "
      >
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="
              rounded-3xl
              border
              border-zinc-200
              dark:border-white/5
              bg-white
              dark:bg-[#1f1d1c]
              p-6
              shadow-sm
              "
            >
              <div
                className="
                w-12
                h-12
                rounded-2xl
                bg-[#8b5e3c]/10
                text-[#8b5e3c]
                flex
                items-center
                justify-center
                mb-4
                "
              >
                <Icon size={22} />
              </div>

              <h3
                className="
                text-sm
                text-zinc-500
                dark:text-zinc-400
                "
              >
                {item.title}
              </h3>

              <p
                className="
                mt-2
                text-3xl
                font-bold
                text-zinc-900
                dark:text-white
                "
              >
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* RECENT TASKS */}

      <div
        className="
        rounded-3xl
        border
        border-zinc-200
        dark:border-white/5
        bg-white
        dark:bg-[#1f1d1c]
        p-6
        "
      >
        <h3
          className="
          text-lg
          font-semibold
          text-zinc-900
          dark:text-white
          mb-6
          "
        >
          Recent Tasks
        </h3>

        <div className="space-y-4">
          {recentTasks.length === 0 ? (
            <p className="text-sm text-zinc-500">No recent tasks found.</p>
          ) : (
            recentTasks.map((task) => (
              <div
                key={task.id}
                className="
                flex
                items-center
                justify-between
                p-4
                rounded-2xl
                bg-zinc-50
                dark:bg-[#262423]
                "
              >
                <div>
                  <h4
                    className="
                    text-sm
                    font-medium
                    text-zinc-900
                    dark:text-white
                    "
                  >
                    {task.task_title || task.product_name || "Untitled Task"}
                  </h4>

                  <p
                    className="
                    text-xs
                    text-zinc-500
                    dark:text-zinc-400
                    mt-1
                    "
                  >
                    Assigned to {task.assigned_user_name}
                  </p>
                </div>

                <span
                  className={`
                  px-3
                  py-1
                  rounded-full
                  text-xs
                  font-medium
                  capitalize
                  ${task.status === 'pending' || task.status === 'assigned' ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300' : ''}
                  ${task.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : ''}
                  ${task.status === 'submitted' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : ''}
                  ${task.status === 'accepted' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : ''}
                  ${task.status === 'revision_requested' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : ''}
                  `}
                >
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}