"use client";

import { useState, useEffect } from "react";
import { Search, Users, ShieldCheck, UserCheck, BriefcaseBusiness, Mail } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, tasksRes] = await Promise.all([
        api.get("/auth/users"),
        api.get("/tasks/")
      ]);
      setUsers(usersRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // 1. Compute stats for all users
  const enrichedUsers = users.map(user => {
    const userTasks = tasks.filter(t => t.assigned_user_id === user.id);
    const totalTasks = userTasks.length;
    const completedTasks = userTasks.filter(t => t.status === 'accepted').length;
    const pendingTasks = userTasks.filter(t => 
      ['assigned', 'in_progress', 'submitted', 'revision_requested'].includes(t.status)
    ).length;
    const adminTasks = tasks.filter(t => t.admin_id === user.id);
    const adminTotalTasks = adminTasks.length;
    const adminApprovedTasks = adminTasks.filter(t => t.status === 'accepted').length;
    const adminRequestedTasks = adminTasks.filter(t => t.status === 'revision_requested').length;
    
    return { 
      ...user, 
      totalTasks, 
      completedTasks, 
      pendingTasks,
      adminTotalTasks,
      adminApprovedTasks,
      adminRequestedTasks
    };
  });

  // 2. Filter by search query
  const filteredUsers = enrichedUsers.filter(u => 
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 3. Separate Active vs Inactive based on role-specific tasks
  const activeUsers = filteredUsers.filter(u => u.role === 'admin' ? u.adminTotalTasks > 0 : u.totalTasks > 0);
  const inactiveUsers = filteredUsers.filter(u => u.role === 'admin' ? u.adminTotalTasks === 0 : u.totalTasks === 0);

  // Stats for the top cards
  const totalUsersCount = users.length;
  const adminsCount = users.filter(u => u.role === 'admin').length;
  const activeUsersCount = enrichedUsers.filter(u => u.totalTasks > 0).length;
  const totalTasksCount = tasks.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-zinc-500 dark:text-zinc-400">Loading team members...</div>
      </div>
    );
  }

  const renderUserCard = (user: any) => (
    <div
      key={user.id}
      className="rounded-3xl overflow-hidden bg-white dark:bg-[#1f1d1c] border border-zinc-200 dark:border-white/5 p-6 transition-all hover:shadow-lg flex flex-col"
    >
      {/* USER TOP */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white line-clamp-1">
              {user.full_name}
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shrink-0
              ${
                user.role === "admin"
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
              }`}
            >
              {user.role}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <Mail size={14} className="shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {user.role === 'admin' ? (
          <>
            <div className="rounded-2xl bg-zinc-50 dark:bg-[#262423] p-3 text-center border border-zinc-100 dark:border-white/5">
              <p className="text-[10px] uppercase font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider">Assigned</p>
              <h3 className="mt-1 text-xl font-bold text-zinc-900 dark:text-white">{user.adminTotalTasks}</h3>
            </div>

            <div className="rounded-2xl bg-amber-50 dark:bg-[#2a2418] p-3 text-center border border-amber-100 dark:border-amber-900/30">
              <p className="text-[10px] uppercase font-semibold text-amber-600 dark:text-amber-500 tracking-wider">Requested</p>
              <h3 className="mt-1 text-xl font-bold text-amber-700 dark:text-amber-400">{user.adminRequestedTasks}</h3>
            </div>

            <div className="rounded-2xl bg-green-50 dark:bg-[#1a2820] p-3 text-center border border-green-100 dark:border-green-900/30">
              <p className="text-[10px] uppercase font-semibold text-green-600 dark:text-green-500 tracking-wider">Approved</p>
              <h3 className="mt-1 text-xl font-bold text-green-700 dark:text-green-400">{user.adminApprovedTasks}</h3>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-2xl bg-zinc-50 dark:bg-[#262423] p-3 text-center border border-zinc-100 dark:border-white/5">
              <p className="text-[10px] uppercase font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider">Assigned</p>
              <h3 className="mt-1 text-xl font-bold text-zinc-900 dark:text-white">{user.totalTasks}</h3>
            </div>

            <div className="rounded-2xl bg-amber-50 dark:bg-[#2a2418] p-3 text-center border border-amber-100 dark:border-amber-900/30">
              <p className="text-[10px] uppercase font-semibold text-amber-600 dark:text-amber-500 tracking-wider">Pending</p>
              <h3 className="mt-1 text-xl font-bold text-amber-700 dark:text-amber-400">{user.pendingTasks}</h3>
            </div>

            <div className="rounded-2xl bg-green-50 dark:bg-[#1a2820] p-3 text-center border border-green-100 dark:border-green-900/30">
              <p className="text-[10px] uppercase font-semibold text-green-600 dark:text-green-500 tracking-wider">Completed</p>
              <h3 className="mt-1 text-xl font-bold text-green-700 dark:text-green-400">{user.completedTasks}</h3>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* TOP HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Team Members
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Manage platform users, roles, and task productivity.
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full sm:w-[280px] pl-10 pr-4 py-3 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#1f1d1c] text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-[#8b5e3c]"
          />
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="rounded-3xl bg-white dark:bg-[#1f1d1c] border border-zinc-200 dark:border-white/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Users</p>
              <h2 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">{totalUsersCount}</h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Users size={22} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#1f1d1c] border border-zinc-200 dark:border-white/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Admins</p>
              <h2 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">{adminsCount}</h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <ShieldCheck size={22} className="text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#1f1d1c] border border-zinc-200 dark:border-white/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Active Users</p>
              <h2 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">{activeUsersCount}</h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <UserCheck size={22} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#1f1d1c] border border-zinc-200 dark:border-white/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Tasks</p>
              <h2 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">{totalTasksCount}</h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
              <BriefcaseBusiness size={22} className="text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE USERS SECTION */}
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Active Team Members</h2>
        {activeUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {activeUsers.map(renderUserCard)}
          </div>
        ) : (
          <div className="py-12 text-center text-zinc-500 dark:text-zinc-400 bg-white dark:bg-[#1f1d1c] rounded-3xl border border-zinc-200 dark:border-white/5">
            No active users found matching your search.
          </div>
        )}
      </div>

      {/* INACTIVE USERS SECTION */}
      <div className="pt-8 border-t border-zinc-200 dark:border-white/5">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Inactive Users</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Users currently with zero assigned tasks.</p>
        </div>
        
        {inactiveUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 opacity-80">
            {inactiveUsers.map(renderUserCard)}
          </div>
        ) : (
          <div className="py-12 text-center text-zinc-500 dark:text-zinc-400 bg-white dark:bg-[#1f1d1c] rounded-3xl border border-zinc-200 dark:border-white/5">
            No inactive users found.
          </div>
        )}
      </div>
    </div>
  );
}