"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Loader2, Bell, CheckCircle2, AlertCircle, FilePlus2, RefreshCcw } from "lucide-react";
import Link from "next/link";

interface NotificationAlert {
  id: string;
  type: 'assigned' | 'revision' | 'accepted';
  title: string;
  message: string;
  date: Date;
  taskId: string;
  adminName: string;
}

export default function UserNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasksAndBuildNotifications = async () => {
    try {
      const res = await api.get(`/tasks/my-tasks?t=${new Date().getTime()}`);
      const tasks = res.data || [];
      
      const alerts: NotificationAlert[] = [];
      
      tasks.forEach((task: any) => {
        const adminName = task.admin_name || 'Admin';
        const taskTitle = task.task_title || task.product_name || 'Untitled Task';
        const createdAt = new Date(task.created_at);
        
        // 1. Every task was initially assigned
        alerts.push({
          id: `${task.id}-assigned`,
          type: 'assigned',
          title: 'New Task Assigned',
          message: `${adminName} assigned you a new task: "${taskTitle}"`,
          date: createdAt,
          taskId: task.id,
          adminName
        });
        
        // 2. If revision requested, add a revision alert
        if (task.status === 'revision_requested') {
          // Simulate updated_at if not present in DB
          const updatedAt = task.updated_at ? new Date(task.updated_at) : new Date(createdAt.getTime() + 1000 * 60 * 60 * 24); 
          alerts.push({
            id: `${task.id}-revision`,
            type: 'revision',
            title: 'Revision Requested',
            message: `${adminName} requested revisions for: "${taskTitle}"`,
            date: updatedAt,
            taskId: task.id,
            adminName
          });
        }
        
        // 3. If accepted, add an accepted alert
        if (task.status === 'accepted') {
          const updatedAt = task.updated_at ? new Date(task.updated_at) : new Date(createdAt.getTime() + 1000 * 60 * 60 * 48);
          alerts.push({
            id: `${task.id}-accepted`,
            type: 'accepted',
            title: 'Task Accepted',
            message: `${adminName} has approved and accepted your work for: "${taskTitle}"!`,
            date: updatedAt,
            taskId: task.id,
            adminName
          });
        }
      });
      
      // Sort all alerts descending by date
      alerts.sort((a, b) => b.date.getTime() - a.date.getTime());
      
      setNotifications(alerts);
    } catch (error) {
      console.error("Failed to load notifications", error);
      toast.error("Failed to load your notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndBuildNotifications();
    const interval = setInterval(fetchTasksAndBuildNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#8b5e3c]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
          <Bell className="text-[#8b5e3c]" size={28} /> Notifications
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Recent updates and alerts from Admins.
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white dark:bg-[#1f1d1c]">
          <div className="mx-auto w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <Bell size={24} className="text-zinc-400" />
          </div>
          <p className="text-zinc-500 dark:text-zinc-400">You're all caught up! No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((alert) => {
            let Icon = FilePlus2;
            let iconColor = "text-blue-500";
            let bgColor = "bg-blue-50 dark:bg-blue-500/10";
            let borderColor = "border-blue-100 dark:border-blue-900/30";
            let route = `/user/studio/${alert.taskId}`;

            if (alert.type === 'revision') {
              Icon = AlertCircle;
              iconColor = "text-red-500";
              bgColor = "bg-red-50 dark:bg-red-500/10";
              borderColor = "border-red-100 dark:border-red-900/30";
            } else if (alert.type === 'accepted') {
              Icon = CheckCircle2;
              iconColor = "text-green-500";
              bgColor = "bg-green-50 dark:bg-green-500/10";
              borderColor = "border-green-100 dark:border-green-900/30";
              route = `/user/tasks`; // Just link back to tasks if done
            }

            return (
              <Link
                key={alert.id}
                href={route}
                className={`block p-5 rounded-2xl border ${borderColor} ${bgColor} hover:shadow-md transition-all group`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full bg-white dark:bg-[#1a1818] shadow-sm ${iconColor}`}>
                    <Icon size={20} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-bold text-sm ${iconColor}`}>
                        {alert.title}
                      </h3>
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        {alert.date.toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                      {alert.message}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
