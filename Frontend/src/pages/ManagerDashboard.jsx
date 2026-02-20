import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../hooks/useAuth';
import api from '../apis/axios';

// Icons & Components
import StatCard from '../components/Dashboard/StatCard';
import EmployeeTable from '../components/Dashboard/EmployeeTable';
import TaskTable from '../components/Dashboard/TaskTable';
import {
  Users,
  ClipboardList,
  LogOut,
  LayoutDashboard,
  TrendingUp,
  Menu,
  X,
  ChevronRight,
  PlusCircle,
  Clock,
  CheckSquare,
  Activity,
  MessageSquare,
  Briefcase,
  AlertCircle,
  CalendarDays
} from 'lucide-react';
import CreateTaskModel from '../components/Dashboard/CreateTaskModel';

const ManagerDashboard = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [openTaskModal, setOpenTaskModal] = useState(false);

  // Fetch Manager Specific Data
  const { 
    data: dashboardData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['managerStats'], 
    queryFn: async () => {
      const res = await api.get('/dashboard/manager'); 
      return res.data;
    },
    retry: 2,
    staleTime: 30000,
  });

  const handleLogout = () => logout();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  // Helper for Status Badges
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckSquare size={12} />, label: 'Completed' };
      case 'in_progress': return { bg: 'bg-blue-100', text: 'text-blue-700', icon: <Activity size={12} />, label: 'In Progress' };
      case 'pending': return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <Clock size={12} />, label: 'Pending' };
      case 'overdue': return { bg: 'bg-red-100', text: 'text-red-700', icon: <AlertCircle size={12} />, label: 'Overdue' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', icon: <Clock size={12} />, label: status };
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="mt-6 text-lg font-medium text-gray-700">Loading Workspace...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center border border-red-100">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to load data</h3>
          <p className="text-sm text-gray-500 mb-6">There was a problem connecting to the server.</p>
          <button 
            onClick={() => refetch()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium w-full"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Destructure Data safely
  const { 
    teamSize = 0, 
    totalTasks = 0, 
    taskDistribution = [], 
    teamMembers = [], 
    teamWorkload = [],
    recentTasks = []
  } = dashboardData || {};

  // Calculations
  const completedTasks = parseInt(taskDistribution?.find(t => t.status === 'completed')?.count || 0);
  const inProgressTasks = parseInt(taskDistribution?.find(t => t.status === 'in_progress')?.count || 0);
  const pendingTasks = parseInt(taskDistribution?.find(t => t.status === 'pending')?.count || 0);
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Enhanced Workload - Map designations from teamMembers
  const enhancedWorkload = teamWorkload.map(work => {
    const member = teamMembers.find(m => m.username === work.username);
    return {
      ...work,
      designation: member?.designation || 'Team Member',
      countNum: parseInt(work.task_count)
    };
  });

  const renderContent = () => {
    switch(activeTab) {
      case 'team':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">My Team Members</h2>
                  <p className="text-sm text-gray-500 mt-1">Manage your team and view their details</p>
                </div>
              </div>
              <EmployeeTable employees={teamMembers} />
            </div>
          </div>
        );

      case 'tasks':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">Team Task Board</h2>
                  <p className="text-sm text-gray-500 mt-1">Assign new work and monitor existing progress.</p>
                </div>
                <button
                  onClick={() => setOpenTaskModal(true)}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 hover:-translate-y-0.5 active:scale-95">
                  <PlusCircle size={18} />
                  New Assignment
                </button>
              </div>
              {openTaskModal && <CreateTaskModel onClose={() => setOpenTaskModal(false)} employees={teamMembers} />}
              <TaskTable employees={teamMembers} />
            </div>
          </div>
        );

      default: // Dashboard Overview
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 📊 Top Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Team Members" value={teamSize} icon={Users} bgColor="bg-indigo-50" iconColor="text-indigo-600" />
              <StatCard title="Total Tasks" value={totalTasks} icon={ClipboardList} bgColor="bg-blue-50" iconColor="text-blue-600" />
              <StatCard title="Completion Rate" value={`${completionRate}%`} icon={TrendingUp} bgColor="bg-emerald-50" iconColor="text-emerald-600" />
              <StatCard title="Pending Review" value={pendingTasks} icon={Clock} bgColor="bg-amber-50" iconColor="text-amber-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* ⬅️ Left Column (Progress & Workload) */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* Team Workload Grid */}
                <div className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 tracking-tight">Active Workload</h2>
                      <p className="text-sm text-gray-500 mt-1">Ongoing tasks per team member</p>
                    </div>
                    <div className="bg-indigo-50 text-indigo-700 p-2 rounded-xl">
                      <Activity size={20} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {enhancedWorkload.map((work, index) => (
                      <div key={index} className="flex items-center p-5 border border-gray-100 rounded-2xl hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50/50 transition-all bg-white group cursor-default">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-700 flex items-center justify-center font-black text-lg mr-4 shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                          {work.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{work.username}</p>
                          <p className="text-[10px] text-gray-500 font-medium truncate mb-2">{work.designation}</p>
                          <div className="flex items-center">
                             <div className="flex-1 h-1.5 bg-gray-100 rounded-full mr-3 overflow-hidden">
                               <div 
                                 className="h-full bg-indigo-500 rounded-full" 
                                 style={{ width: `${Math.min((work.countNum / 5) * 100, 100)}%` }}
                               ></div>
                             </div>
                             <span className="text-[11px] font-bold text-gray-500 whitespace-nowrap">
                              {work.countNum} task{work.countNum !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {enhancedWorkload.length === 0 && (
                      <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/30">
                        <CheckSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        <p className="text-sm font-bold text-gray-400">All caught up! No active tasks.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Task Distribution Progress Bars */}
                <div className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 tracking-tight">System Progress</h2>
                      <p className="text-sm text-gray-500 mt-1">Lifecycle distribution of all tasks</p>
                    </div>
                    <TrendingUp className="text-emerald-500" size={24} />
                  </div>
                  
                  <div className="space-y-6">
                    {taskDistribution?.length > 0 ? taskDistribution.map((item) => {
                      const count = parseInt(item.count);
                      const percentage = totalTasks > 0 ? ((count / totalTasks) * 100).toFixed(0) : 0;
                      
                      let barColor = 'bg-indigo-500';
                      let iconPath = <Activity size={12} />;
                      if(item.status === 'completed') { barColor = 'bg-emerald-500'; iconPath = <CheckSquare size={12}/>; }
                      if(item.status === 'pending') { barColor = 'bg-amber-500'; iconPath = <Clock size={12}/>; }
                      if(item.status === 'in_progress') { barColor = 'bg-blue-500'; iconPath = <Activity size={12}/>; }

                      return (
                        <div key={item.status} className="group">
                          <div className="flex justify-between items-end mb-2.5">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${barColor}`}></span>
                              <span className="capitalize text-xs font-bold text-gray-700 tracking-wide uppercase">{item.status.replace('_', ' ')}</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-black text-gray-900">{count}</span>
                              <span className="text-[10px] font-bold text-gray-400">({percentage}%)</span>
                            </div>
                          </div>
                          <div className="h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-0.5">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor} shadow-sm shadow-black/5`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="py-8 text-center bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-sm text-gray-400 font-medium italic">Insufficient data for report.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* ➡️ Right Column (Recent Tasks & Tools) */}
              <div className="lg:col-span-4 space-y-8">
                
                {/* Action Tools */}
                <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl shadow-indigo-200/20 relative overflow-hidden group">
                  {/* Decorative background element */}
                  <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600 rounded-full blur-[80px] opacity-20 -mr-20 -mt-20 group-hover:opacity-30 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600 rounded-full blur-[60px] opacity-10 -ml-10 -mb-10"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                        <Briefcase size={22} className="text-indigo-300" />
                      </div>
                      <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] uppercase tracking-widest font-black border border-white/5">Tools</span>
                    </div>
                    <h3 className="text-xl font-bold mb-6 tracking-tight">Quick Actions</h3>
                    <div className="space-y-3">
                      <button 
                        onClick={() => setOpenTaskModal(true)}
                        className="w-full flex items-center gap-4 px-5 py-4 bg-indigo-600 rounded-2xl hover:bg-indigo-500 transition-all text-sm font-bold shadow-lg shadow-indigo-900/40 hover:-translate-y-0.5 active:scale-95"
                      >
                        <PlusCircle size={20} className="text-indigo-200" />
                        <span>Create New Task</span>
                      </button>
                      <button 
                        onClick={() => handleTabChange('team')}
                        className="w-full flex items-center gap-4 px-5 py-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-sm font-bold border border-white/5 hover:border-white/10"
                      >
                        <Users size={20} className="text-emerald-400" />
                        <span>Team Roster</span>
                      </button>
                      <button className="w-full flex items-center justify-between px-5 py-4 bg-white/5 rounded-2xl text-white/30 cursor-not-allowed border border-white/5 text-sm group/btn">
                        <div className="flex items-center gap-4">
                          <MessageSquare size={20} />
                          <span>Team Lounge</span>
                        </div>
                        <span className="text-[9px] bg-white/10 text-white/40 px-2 py-0.5 rounded-full border border-white/5 font-black uppercase tracking-tighter shadow-sm">Soon</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Tasks Widget */}
                <div className="bg-white p-7 rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                     <h2 className="text-lg font-black text-gray-900 tracking-tight">Recent Activity</h2>
                     <button onClick={() => handleTabChange('tasks')} className="text-xs font-black text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-lg">All</button>
                  </div>
                  
                  <div className="space-y-4">
                    {recentTasks.length > 0 ? recentTasks.map((task) => {
                      const badge = getStatusBadge(task.status);
                      return (
                        <div key={task.id} className="p-4 border border-gray-50 rounded-2xl hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-100/20 transition-all group cursor-pointer bg-gray-50/30 hover:bg-white">
                          <h4 className="text-sm font-bold text-gray-800 line-clamp-1 mb-3 group-hover:text-indigo-600 transition-colors leading-relaxed" title={task.title}>
                            {task.title}
                          </h4>
                          <div className="flex items-center justify-between">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${badge.bg} ${badge.text} border border-black/5`}>
                              {badge.icon}
                              {badge.label}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md">
                              <CalendarDays size={12} className="text-gray-400" />
                              {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      )
                    }) : (
                      <div className="text-center py-10 grayscale opacity-40">
                         <ClipboardList size={40} className="mx-auto mb-3 text-gray-300" />
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No Recent Tasks</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50/50 font-sans">
      {/* Sidebar Mobile Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-md text-gray-700 hover:bg-gray-50 border border-gray-200"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {sidebarOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar Layout */}
      <aside className={`
        fixed lg:static w-72 bg-white border-r border-gray-200
        flex flex-col h-full transition-transform duration-300 ease-in-out z-50 shadow-sm lg:shadow-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Area */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-200">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-gray-900">Work<span className="text-indigo-600">Flo</span></h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Manager Portal</p>
            </div>
          </div>
        </div>

        {/* User Profile Mini */}
        <div className="p-5">
          <div className="flex items-center space-x-3 bg-gray-50/80 p-3 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-100 to-blue-100 rounded-lg flex items-center justify-center text-indigo-700 font-bold text-lg shadow-inner">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-gray-900 truncate">{user?.username}</p>
              <p className="text-xs font-medium text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto mt-2">
          <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Main Menu</p>
          
          <button
            onClick={() => handleTabChange('dashboard')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all text-sm ${
              activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' : 'text-gray-600 font-medium hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard size={18} className={activeTab === 'dashboard' ? 'text-indigo-600' : 'text-gray-400'} />
              <span>Overview</span>
            </div>
            {activeTab === 'dashboard' && <ChevronRight size={14} className="text-indigo-400" />}
          </button>

          <button
            onClick={() => handleTabChange('team')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all text-sm ${
              activeTab === 'team' ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' : 'text-gray-600 font-medium hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users size={18} className={activeTab === 'team' ? 'text-indigo-600' : 'text-gray-400'} />
              <span>My Team</span>
            </div>
            {activeTab === 'team' && <ChevronRight size={14} className="text-indigo-400" />}
          </button>

          <button
            onClick={() => handleTabChange('tasks')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all text-sm ${
              activeTab === 'tasks' ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' : 'text-gray-600 font-medium hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <ClipboardList size={18} className={activeTab === 'tasks' ? 'text-indigo-600' : 'text-gray-400'} />
              <span>Team Tasks</span>
            </div>
            {activeTab === 'tasks' && <ChevronRight size={14} className="text-indigo-400" />}
          </button>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl w-full transition-colors text-sm font-semibold border border-transparent hover:border-red-100"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 overflow-y-auto w-full relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 px-6 md:px-10 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="pl-10 lg:pl-0"> {/* Padding added for mobile hamburger menu */}
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                {activeTab === 'dashboard' ? 'Team Dashboard' : 
                 activeTab === 'team' ? 'Team Management' : 'Task Board'}
              </h1>
              <p className="text-gray-500 text-sm mt-0.5 font-medium">
                {activeTab === 'dashboard' ? `Here's what your team is working on today.` : `Manage your ${activeTab} efficiently.`}
              </p>
            </div>
            
            {/* Quick Create Button in Header (Optional, looks professional) */}
            <div className="hidden md:block">
               {activeTab === 'dashboard' && (
                 <button onClick={() => setOpenTaskModal(true)} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
                   <PlusCircle size={16} className="text-indigo-600"/> New Task
                 </button>
               )}
            </div>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default ManagerDashboard;