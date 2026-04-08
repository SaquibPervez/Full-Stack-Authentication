import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../api/axios';

// Components
import StatCard from '../components/Dashboard/StatCard';
import TaskTable from '../components/Dashboard/TaskTable';
import {
  ClipboardList, CheckCircle2, ShieldAlert, Activity, Users, PlusCircle, Zap, ArrowRight, 
  Target, TrendingUp, Globe, Clock, UserCheck, AlertTriangle
} from 'lucide-react';
import CreateTaskModel from '../components/Dashboard/CreateTaskModel';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [openTaskModal, setOpenTaskModal] = useState(false);

  // 1. Fetch System-wide Stats (Tasks, Users, Payouts)
  const { data: systemData, isLoading: isSystemLoading, refetch: refetchSystem } = useQuery({
    queryKey: ['dashboard', 'admin'], 
    queryFn: async () => {
      const res = await api.get('/dashboard/admin'); 
      return res.data.data;
    },
    refetchInterval: 30000,
  });

  // 2. Fetch Live Fleet Status (Attendance)
  const { data: fleetData, isLoading: isFleetLoading, refetch: refetchFleet } = useQuery({
    queryKey: ['attendance', 'status'],
    queryFn: async () => {
        const res = await api.get('/attendance/status');
        return res.data.data;
    },
    refetchInterval: 15000,
  });

  const isLoading = isSystemLoading || isFleetLoading;

  const stats = useMemo(() => {
    if (!systemData) return { totalUsers: 0, totalTasks: 0, completionRate: 0, totalPayout: 0 };
    
    const taskGroups = systemData.tasks || [];
    const totalTasks = taskGroups.reduce((acc, curr) => acc + curr._count.id, 0);
    const completedTasks = taskGroups.find(t => t.status === 'completed')?._count.id || 0;
    const rate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
        totalUsers: systemData.totalUsers || 0,
        totalTasks,
        completionRate: Math.round(rate),
        totalPayout: systemData.totalPayout || 0
    };
  }, [systemData]);

  if (isLoading && !systemData) {
    return (
      <div className="h-[90vh] flex flex-col justify-center items-center bg-white">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin shadow-lg"></div>
        <p className="mt-6 text-[10px] tracking-[0.3em] uppercase font-black text-slate-400 animate-pulse">Establishing Secure Uplink</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-12 bg-white min-h-screen">
      
      {/* ─── Strategic Header ─── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 pb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-slate-900/20">
                <ShieldAlert size={20} strokeWidth={2.5} />
             </div>
             <div>
                <p className="text-[10px] tracking-[0.2em] uppercase font-black text-blue-600 mb-0.5">Tactical Command</p>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
                    Operations Center
                </h1>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
            <button 
                onClick={() => { refetchSystem(); refetchFleet(); }} 
                className="group w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-500/30 transition-all shadow-xl shadow-slate-200/20 active:scale-95"
                title="Synchronize Data"
            >
                <Activity size={20} className={isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
            </button>
            <button
                onClick={() => setOpenTaskModal(true)}
                className="flex items-center gap-3 px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-slate-900/30 hover:bg-slate-800 active:scale-95 transition-all"
            >
                <PlusCircle size={16} strokeWidth={3} /> Initiate Mission
            </button>
        </div>
      </header>

      {/* ─── Global System Stats ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
            title="Total Assets" 
            value={stats.totalUsers} 
            icon={Users} 
            bgColor="bg-white" 
            iconColor="text-slate-900" 
            className="border-slate-100 shadow-xl shadow-slate-200/20"
        />
        <StatCard 
            title="Active Missions" 
            value={stats.totalTasks} 
            icon={Target} 
            bgColor="bg-white" 
            iconColor="text-blue-600"
            className="border-slate-100 shadow-xl shadow-slate-200/20"
        />
        <StatCard 
            title="Strategic Payout" 
            value={`$${(stats.totalPayout / 1000).toFixed(1)}k`} 
            icon={Globe} 
            bgColor="bg-white" 
            iconColor="text-emerald-600"
            className="border-slate-100 shadow-xl shadow-slate-200/20"
        />
        <StatCard 
            title="Efficiency" 
            value={`${stats.completionRate}%`} 
            icon={TrendingUp} 
            bgColor="bg-slate-900 text-white" 
            iconColor="text-white"
            className="border-slate-900 shadow-2xl shadow-slate-900/30"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* ─── Mission Analytics (Left Column) ─── */}
          <div className="lg:col-span-2 space-y-12">
              <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Mission Metrics</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregate Completion Data</p>
                        </div>
                    </div>
                  </div>
                  
                  <div className="p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/20 space-y-10">
                      <div className="space-y-4">
                          <div className="flex justify-between items-end">
                              <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Overall Completion Rate</span>
                              <span className="text-2xl font-black text-blue-600 tracking-tighter">{stats.completionRate}%</span>
                          </div>
                          <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                              <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${stats.completionRate}%` }}
                                  transition={{ duration: 1.5, ease: "easeOut" }}
                                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg shadow-blue-500/20"
                              />
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                          {systemData?.tasks?.map((group) => (
                              <div key={group.status} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100/50">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{group.status.replace('_', ' ')}</p>
                                  <p className="text-2xl font-black text-slate-900">{group._count.id}</p>
                                  <div className="mt-3 h-1 bg-slate-200 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full ${group.status === 'completed' ? 'bg-emerald-500' : group.status === 'in_progress' ? 'bg-blue-500' : 'bg-amber-500'}`} 
                                        style={{ width: `${(group._count.id / stats.totalTasks) * 100}%` }}
                                      />
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </section>

              <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Operations</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Deployment Tracking</p>
                        </div>
                    </div>
                    <Link to="/admin-dashboard/operations" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-2">
                        System Logs <ArrowRight size={12} />
                    </Link>
                  </div>
                  <TaskTable limit={5} isDashboard={true} />
              </section>
          </div>

          {/* ─── Team Intelligence (Right Column) ─── */}
          <div className="space-y-12">
              <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Fleet Status</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Presence Data</p>
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-900/30 text-white space-y-8">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Online</p>
                            <p className="text-3xl font-black text-emerald-400">{fleetData?.summary?.online || 0}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Offline</p>
                            <p className="text-3xl font-black text-slate-500">{fleetData?.summary?.offline || 0}</p>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] pb-2 border-b border-white/5">Active Agents</p>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                           {fleetData?.team?.filter(u => u.live_status === 'online').map(member => (
                               <div key={member.id} className="flex items-center justify-between group">
                                  <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-[10px] font-black uppercase border border-emerald-500/30 transition-all group-hover:scale-110">
                                        {member.username.charAt(0)}
                                     </div>
                                     <div>
                                        <p className="text-[11px] font-black tracking-tight">{member.username}</p>
                                        <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">{member.designation}</p>
                                     </div>
                                  </div>
                                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgb(16,185,129)]" />
                               </div>
                           ))}
                           {fleetData?.summary?.online === 0 && (
                               <div className="py-10 text-center opacity-20">
                                  <Clock size={32} className="mx-auto mb-4" />
                                  <p className="text-[10px] font-black uppercase tracking-widest">No Active Sessions</p>
                               </div>
                           )}
                        </div>
                     </div>
                  </div>
              </section>

              <section className="space-y-6">
                <div className="p-8 bg-blue-50 border border-blue-100 rounded-3xl space-y-4">
                    <div className="flex items-center gap-3 text-blue-600">
                        <Zap size={18} strokeWidth={3} />
                        <h4 className="text-[11px] font-black uppercase tracking-widest">System Advisory</h4>
                    </div>
                    <p className="text-xs text-blue-900/60 leading-relaxed font-medium">
                        Unified communications and mission telemetry are currently stable. Next automated sync in 30 seconds.
                    </p>
                    <Link to="/admin-dashboard/directory" className="flex items-center justify-between p-4 bg-white rounded-2xl border border-blue-200 text-blue-600 group transition-all hover:bg-blue-600 hover:text-white">
                        <span className="text-[10px] font-black uppercase tracking-widest">Personnel DB</span>
                        <UserCheck size={16} className="group-hover:rotate-12 transition-transform" />
                    </Link>
                </div>
              </section>
          </div>
      </div>

      {/* ─── Modals ─── */}
      {openTaskModal && (
        <CreateTaskModel 
          onClose={() => setOpenTaskModal(false)} 
        />
      )}

    </div>
  );
};

export default AdminDashboard;