import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import api from '../api/axios';
import TaskDetailDrawer from '../components/Dashboard/TaskDetailDrawer';
import StatCard from '../components/Dashboard/StatCard';
import MyPayslips from '../components/Dashboard/MyPayslips';
import MyAttendanceHistory from '../components/Dashboard/MyAttendanceHistory';
import { 
  CheckCircle2, 
  Calendar, 
  Activity, 
  ArrowRight,
  Zap,
  Clock,
  BadgeDollarSign,
  Target,
  Trophy
} from 'lucide-react';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTab, setActiveTab] = useState('missions'); // 'missions' | 'attendance' | 'payroll'

  const { data: dashboardData, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard', 'employee'],
    queryFn: async () => {
      const res = await api.get('/dashboard/employee');
      return res.data.data;
    },
    refetchInterval: 30000,
  });

  if (isLoading && !dashboardData) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-white px-20">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-6 text-[10px] tracking-[0.3em] uppercase font-black text-slate-400">Syncing Personal Data</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-white px-20">
        <div className="text-center p-12 bg-rose-50 rounded-[2.5rem] border border-rose-100 shadow-2xl shadow-rose-100/20">
          <p className="text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6">Sync Failed</p>
          <button onClick={() => refetch()} className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] uppercase font-black tracking-widest active:scale-95 transition-all shadow-xl shadow-slate-900/20">Retry Link</button>
        </div>
      </div>
    );
  }

  const tasks = dashboardData?.tasks || [];
  const pendingTasksCount = dashboardData?.pendingTasks || 0;
  const completedTasksCount = dashboardData?.completedTasks || 0;

  const columns = {
    pending: tasks.filter(t => t.status === 'pending'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    completed: tasks.filter(t => t.status === 'completed'),
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-200/60';
    }
  };

  const TaskCard = ({ task }) => (
    <motion.div
      layoutId={`task-${task.id}`}
      whileHover={{ y: -2 }}
      onClick={() => setSelectedTask(task)}
      className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-slate-200/40 transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-4">
        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getPriorityStyle(task.priority)}`}>
          {task.priority === 'high' ? 'Critical' : task.priority === 'medium' ? 'Strategic' : 'Routine'}
        </span>
      </div>
      <h3 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight mb-4">
        {task.title}
      </h3>
      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex items-center gap-2 text-slate-400">
          <Calendar size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No Expiry'}
          </span>
        </div>
        <ArrowRight size={14} className="text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
      </div>
    </motion.div>
  );

  const EmptyState = ({ status }) => (
    <div className="py-12 px-6 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-center bg-slate-50/30">
        <CheckCircle2 size={24} className="text-slate-200 mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
            No {status.replace('_', ' ')} tasks
        </p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-12 bg-white min-h-screen">
      
      {/* ─── Header ─── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 pb-10">
        <div className="space-y-2">
            <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-slate-900/20">
                    <Zap size={20} strokeWidth={2.5} />
                 </div>
                 <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase font-black text-indigo-600 mb-0.5">Personal Logistics</p>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
                       Directive Board
                    </h1>
                 </div>
            </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            <button
                onClick={() => setActiveTab('missions')}
                className={`flex items-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.1em] rounded-xl transition-all ${activeTab === 'missions' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-500 hover:bg-white/50'}`}
            >
                <Target size={14} strokeWidth={2.5} /> Missions
            </button>
            <button
                onClick={() => setActiveTab('attendance')}
                className={`flex items-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.1em] rounded-xl transition-all ${activeTab === 'attendance' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-500 hover:bg-white/50'}`}
            >
                <Clock size={14} strokeWidth={2.5} /> Attendance
            </button>
            <button
                onClick={() => setActiveTab('payroll')}
                className={`flex items-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.1em] rounded-xl transition-all ${activeTab === 'payroll' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-500 hover:bg-white/50'}`}
            >
                <BadgeDollarSign size={14} strokeWidth={2.5} /> Financials
            </button>
        </div>
      </header>

      {/* ─── Main Content Area ─── */}
      {activeTab === 'missions' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
          {/* ─── Personal Achievement Stats ─── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <StatCard 
                title="Active Objectives" 
                value={pendingTasksCount} 
                icon={Target} 
                className="bg-white border-slate-100 shadow-xl shadow-slate-200/20"
                iconColor="text-indigo-600" 
            />
            <StatCard 
                title="Accomplished" 
                value={completedTasksCount} 
                icon={Trophy} 
                className="bg-slate-900 text-white shadow-2xl shadow-slate-900/30"
                iconColor="text-white" 
            />
            <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-[2rem] flex flex-col justify-between">
                <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Fleet Presence</p>
                    <p className="text-3xl font-black text-slate-900">{dashboardData?.daysPresent || 0} Cycles</p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase">
                    <Activity size={12} strokeWidth={3} /> Status: Synchronized
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            {/* Pending */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-slate-300" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Queue</h3>
                    </div>
                </div>
                <div className="space-y-6">
                    {columns.pending.map((task) => <TaskCard key={task.id} task={task} />)}
                    {columns.pending.length === 0 && <EmptyState status="pending" />}
                </div>
            </div>

            {/* In Progress */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_rgb(99,102,241)]" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-500">Execution</h3>
                    </div>
                </div>
                <div className="space-y-6">
                    {columns.in_progress.map((task) => <TaskCard key={task.id} task={task} />)}
                    {columns.in_progress.length === 0 && <EmptyState status="active" />}
                </div>
            </div>

            {/* Completed */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgb(16,185,129)]" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500">Archive</h3>
                    </div>
                </div>
                <div className="space-y-6">
                    {columns.completed.map((task) => <TaskCard key={task.id} task={task} />)}
                    {columns.completed.length === 0 && <EmptyState status="completed" />}
                </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'attendance' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Deployment History</h2>
            <MyAttendanceHistory />
        </motion.div>
      )}

      {activeTab === 'payroll' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Mission Remuneration</h2>
            <MyPayslips />
        </motion.div>
      )}
      {/* ─── Task Drawer ─── */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetailDrawer 
            task={selectedTask} 
            onClose={() => setSelectedTask(null)} 
            onTaskUpdated={refetch}
          />
        )}
      </AnimatePresence>

    </div>
  );
};

export default EmployeeDashboard;