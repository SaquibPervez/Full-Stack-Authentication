import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../api/axios';
import TeamAttendanceBoard from '../components/Dashboard/TeamAttendanceBoard';
// Components
import StatCard from '../components/Dashboard/StatCard';
import TaskTable from '../components/Dashboard/TaskTable';
import CreateTaskModel from '../components/Dashboard/CreateTaskModel';

import {
  ClipboardList, Clock, CheckCircle2, ShieldCheck, Activity, PlusCircle, ArrowRight
} from 'lucide-react';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [openTaskModal, setOpenTaskModal] = useState(false);

  const { data: dashboardData, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard', 'manager'], 
    queryFn: async () => {
      const res = await api.get('/dashboard/manager'); 
      return res.data.data;
    },
    refetchInterval: 30000,
  });

  const stats = useMemo(() => {
    if (!dashboardData) return { total: 0, completed: 0, pending: 0 };
    const workload = dashboardData.workload || [];
    const total = workload.reduce((acc, curr) => acc + curr._count.id, 0);
    const completed = workload.find(t => t.status === 'completed')?._count.id || 0;
    const pending = workload.find(t => t.status === 'pending')?._count.id || 0;
    return { total, completed, pending };
  }, [dashboardData]);

  if (isLoading && !dashboardData) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-white px-20">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-6 text-[10px] tracking-[0.3em] uppercase font-black text-slate-400 animate-pulse">Synchronizing Intelligence</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-white px-20">
        <div className="text-center p-12 bg-rose-50 rounded-[2.5rem] border border-rose-100 shadow-2xl shadow-rose-100/20">
          <p className="text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6">Nexus Disconnected</p>
          <button onClick={() => refetch()} className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] uppercase font-black tracking-widest active:scale-95 transition-all shadow-xl shadow-slate-900/20">Reconnect Link</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-12 bg-white min-h-screen">
      
      {/* ─── Header ─── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 pb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-600/20">
                <ShieldCheck size={20} strokeWidth={2.5} />
             </div>
             <div>
                <p className="text-[10px] tracking-[0.2em] uppercase font-black text-indigo-600 mb-0.5">Managerial Nexus</p>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
                   Operations Board
                </h1>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
            <button 
                onClick={() => refetch()} 
                className="group w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-500/30 transition-all shadow-xl shadow-slate-200/20 active:scale-95"
                title="Refresh Analytics"
            >
                <Activity size={20} className={isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
            </button>
            <button
                onClick={() => setOpenTaskModal(true)}
                className="flex items-center gap-3 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 active:scale-95 transition-all"
            >
                <PlusCircle size={16} strokeWidth={3} /> Deploy Directive
            </button>
        </div>
      </header>

      <TeamAttendanceBoard />

      {/* ─── High-Level Stats ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
            title="Assigned Objectives" 
            value={stats.total} 
            icon={ClipboardList} 
            className="bg-white border-slate-100 shadow-xl shadow-slate-200/20"
            iconColor="text-blue-600" 
        />
        <StatCard 
            title="Awaiting Action" 
            value={stats.pending} 
            icon={Clock} 
            className="bg-white border-slate-100 shadow-xl shadow-slate-200/20"
            iconColor="text-amber-600" 
        />
        <StatCard 
            title="Success Rate" 
            value={stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) + '%' : '0%'} 
            icon={CheckCircle2} 
            className="bg-slate-900 text-white shadow-2xl shadow-slate-900/30"
            iconColor="text-white" 
        />
      </div>

      {/* ─── Operations Preview ─── */}
      <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Team Missions</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live telemetry from assigned units</p>
                </div>
            </div>
            <Link 
              to="/manager-dashboard/missions" 
              className="group flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
            >
              Access All Missions
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <TaskTable limit={5} isDashboard={true} />
      </section>

      {/* ─── Modals ─── */}
      {openTaskModal && (
        <CreateTaskModel 
          onClose={() => setOpenTaskModal(false)} 
        />
      )}

    </div>
  );
};

export default ManagerDashboard;