import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../apis/axios';
import {
    BarChart3, Activity, TrendingUp, CheckCircle2, Clock, Users,
    AlertTriangle, Target, Calendar, ChevronDown, ChevronUp, Zap,
    Award, UserCheck, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

const ManagerReports = () => {
    const [selectedEmployee, setSelectedEmployee] = useState('all');
    const [timeRange, setTimeRange] = useState('all');
    const [expandedSection, setExpandedSection] = useState(null);

    // Manager Stats
    const { data: dashboardData, isLoading: statsLoading } = useQuery({
        queryKey: ['managerStats'],
        queryFn: async () => {
            const res = await api.get('/dashboard/manager');
            return res.data;
        },
    });

    // Full Task Details (for deep analytics)
    const { data: taskData, isLoading: tasksLoading } = useQuery({
        queryKey: ['adminTaskDetails'],
        queryFn: async () => {
            const res = await api.get('/tasks/task-details');
            return res.data.tasks || res.data;
        },
    });

    // Attendance data
    const { data: attendanceData } = useQuery({
        queryKey: ['teamAttendance'],
        queryFn: async () => {
            const res = await api.get('/attendance/team');
            return res.data;
        },
    });

    const isLoading = statsLoading || tasksLoading;

    // ─── Derived Analytics ───
    const analytics = useMemo(() => {
        if (!taskData || !dashboardData) return null;

        const tasks = taskData || [];
        const employees = dashboardData.allEmployees || [];
        const distribution = dashboardData.taskDistribution || [];

        const totalTasks = dashboardData.totalTasks || 0;
        const completed = distribution.find(d => d.status === 'completed')?.count || 0;
        const inProgress = distribution.find(d => d.status === 'in_progress')?.count || 0;
        const pending = distribution.find(d => d.status === 'pending')?.count || 0;
        const completionRate = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

        // Filter by time range
        let filteredTasks = [...tasks];
        const now = new Date();
        if (timeRange === '7d') {
            filteredTasks = tasks.filter(t => (now - new Date(t.created_at)) / (1000 * 60 * 60 * 24) <= 7);
        } else if (timeRange === '30d') {
            filteredTasks = tasks.filter(t => (now - new Date(t.created_at)) / (1000 * 60 * 60 * 24) <= 30);
        }

        // Filter by employee
        if (selectedEmployee !== 'all') {
            filteredTasks = filteredTasks.filter(t => t.assigned_to_name === selectedEmployee);
        }

        // Per-employee breakdown
        const employeeStats = employees.map(emp => {
            const empTasks = tasks.filter(t => t.assigned_to_name === emp.username);
            const empCompleted = empTasks.filter(t => t.status === 'completed').length;
            const empInProgress = empTasks.filter(t => t.status === 'in_progress').length;
            const empPending = empTasks.filter(t => t.status === 'pending').length;
            const empTotal = empTasks.length;
            const empRate = empTotal > 0 ? Math.round((empCompleted / empTotal) * 100) : 0;

            // Overdue tasks
            const overdue = empTasks.filter(t =>
                t.status !== 'completed' && new Date(t.due_date) < now
            ).length;

            // Comments count (engagement)
            const totalComments = empTasks.reduce((sum, t) => sum + (t.comments?.length || 0), 0);

            return {
                ...emp,
                totalTasks: empTotal,
                completed: empCompleted,
                inProgress: empInProgress,
                pending: empPending,
                completionRate: empRate,
                overdue,
                totalComments,
            };
        }).sort((a, b) => b.completionRate - a.completionRate);

        // Priority breakdown
        const highPriority = filteredTasks.filter(t => t.priority === 'high');
        const medPriority = filteredTasks.filter(t => t.priority === 'medium');
        const lowPriority = filteredTasks.filter(t => t.priority === 'low');

        // Overdue tasks globally
        const overdueTasks = tasks.filter(t =>
            t.status !== 'completed' && new Date(t.due_date) < now
        );

        // Recent completions (last 7 days)
        const recentCompletions = tasks.filter(t =>
            t.status === 'completed' && (now - new Date(t.created_at)) / (1000 * 60 * 60 * 24) <= 7
        );

        return {
            totalTasks, completed, inProgress, pending, completionRate,
            employeeStats, overdueTasks, recentCompletions,
            highPriority, medPriority, lowPriority,
            filteredTasks,
        };
    }, [taskData, dashboardData, selectedEmployee, timeRange]);

    if (isLoading) {
        return (
            <div className="h-full flex flex-col justify-center items-center p-20">
                <div className="w-10 h-10 border-[3px] border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="mt-5 text-[10px] tracking-wider uppercase font-semibold text-slate-400">Generating Reports</p>
            </div>
        );
    }

    if (!analytics) return null;

    const { totalTasks, completed, inProgress, pending, completionRate, employeeStats, overdueTasks, filteredTasks } = analytics;
    const attendanceSummary = attendanceData?.summary || {};

    // ─── Visual Bar ───
    const ProgressBar = ({ value, max, color = 'bg-indigo-500', height = 'h-2' }) => {
        const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
        return (
            <div className={`w-full bg-slate-100 rounded-full ${height} overflow-hidden`}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`${height} ${color} rounded-full`}
                />
            </div>
        );
    };

    const MiniStat = ({ label, value, icon: Icon, color, trend }) => (
        <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgb(0,0,0,0.04)] transition-all group">
            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center border border-slate-100 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend !== undefined && (
                    <span className={`flex items-center gap-0.5 text-[10px] font-bold ${trend >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <p className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 mb-1">{label}</p>
            <h3 className="text-xl font-semibold text-slate-900 tracking-tight">{value}</h3>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
            {/* ─── Header ─── */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <BarChart3 size={14} className="text-indigo-600" />
                        <p className="text-[10px] tracking-wider uppercase font-semibold text-slate-400">
                            Performance Insights
                        </p>
                    </div>
                    <h1 className="text-xl font-semibold text-slate-900">
                        Mission Analytics
                    </h1>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 flex-wrap">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold uppercase tracking-wide text-slate-600 outline-none focus:border-indigo-500/30 transition-all shadow-sm"
                    >
                        <option value="all">All Time</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                    </select>

                    <select
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold uppercase tracking-wide text-slate-600 outline-none focus:border-indigo-500/30 transition-all shadow-sm"
                    >
                        <option value="all">All Personnel</option>
                        {(dashboardData?.allEmployees || []).map(emp => (
                            <option key={emp.id} value={emp.username}>{emp.username}</option>
                        ))}
                    </select>
                </div>
            </header>

            {/* ─── Top-Level KPIs ─── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 lg:grid-cols-5 gap-4"
            >
                <MiniStat label="Total Missions" value={totalTasks} icon={Target} color="bg-slate-50 text-slate-900" />
                <MiniStat label="Completion Rate" value={`${completionRate}%`} icon={TrendingUp} color="bg-emerald-50 text-emerald-600" />
                <MiniStat label="In Progress" value={inProgress} icon={Activity} color="bg-indigo-50 text-indigo-600" />
                <MiniStat label="Pending" value={pending} icon={Clock} color="bg-amber-50 text-amber-600" />
                <MiniStat label="Overdue" value={overdueTasks.length} icon={AlertTriangle} color={overdueTasks.length > 0 ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-400"} />
            </motion.div>

            {/* ─── Task Pipeline (Visual Status Bar) ─── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white border border-slate-200/60 rounded-xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
            >
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Task Pipeline</h3>
                <div className="flex rounded-full overflow-hidden h-4 bg-slate-100">
                    {totalTasks > 0 && (
                        <>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(completed / totalTasks) * 100}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className="bg-emerald-500 h-full"
                                title={`Completed: ${completed}`}
                            />
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(inProgress / totalTasks) * 100}%` }}
                                transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                                className="bg-indigo-500 h-full"
                                title={`In Progress: ${inProgress}`}
                            />
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(pending / totalTasks) * 100}%` }}
                                transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
                                className="bg-amber-400 h-full"
                                title={`Pending: ${pending}`}
                            />
                        </>
                    )}
                </div>
                <div className="flex items-center gap-6 mt-3">
                    <span className="flex items-center gap-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed ({completed})
                    </span>
                    <span className="flex items-center gap-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> In Progress ({inProgress})
                    </span>
                    <span className="flex items-center gap-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Pending ({pending})
                    </span>
                </div>
            </motion.div>

            {/* ─── Two-Column: Priority + Attendance ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Priority Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white border border-slate-200/60 rounded-xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
                >
                    <h3 className="text-sm font-semibold text-slate-900 mb-5">Priority Distribution</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-rose-600 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-rose-500" /> Critical
                            </span>
                            <span className="text-slate-500 font-bold">{analytics.highPriority.length}</span>
                        </div>
                        <ProgressBar value={analytics.highPriority.length} max={filteredTasks.length} color="bg-rose-500" />

                        <div className="flex items-center justify-between text-xs mt-3">
                            <span className="font-semibold text-amber-600 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500" /> Strategic
                            </span>
                            <span className="text-slate-500 font-bold">{analytics.medPriority.length}</span>
                        </div>
                        <ProgressBar value={analytics.medPriority.length} max={filteredTasks.length} color="bg-amber-500" />

                        <div className="flex items-center justify-between text-xs mt-3">
                            <span className="font-semibold text-slate-500 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-slate-400" /> Routine
                            </span>
                            <span className="text-slate-500 font-bold">{analytics.lowPriority.length}</span>
                        </div>
                        <ProgressBar value={analytics.lowPriority.length} max={filteredTasks.length} color="bg-slate-400" />
                    </div>
                </motion.div>

                {/* Team Attendance Snapshot */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white border border-slate-200/60 rounded-xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
                >
                    <h3 className="text-sm font-semibold text-slate-900 mb-5">Today's Attendance</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                            <div className="text-2xl font-bold text-emerald-600">{attendanceSummary.online || 0}</div>
                            <p className="text-[10px] font-semibold text-emerald-600/70 uppercase tracking-wider mt-1">Online</p>
                        </div>
                        <div className="text-center p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                            <div className="text-2xl font-bold text-indigo-600">{attendanceSummary.completed || 0}</div>
                            <p className="text-[10px] font-semibold text-indigo-600/70 uppercase tracking-wider mt-1">Completed</p>
                        </div>
                        <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="text-2xl font-bold text-slate-600">{attendanceSummary.offline || 0}</div>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Offline</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <ProgressBar
                            value={(attendanceSummary.online || 0) + (attendanceSummary.completed || 0)}
                            max={attendanceSummary.total || 1}
                            color="bg-emerald-500"
                            height="h-2"
                        />
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-2">
                            {attendanceSummary.total || 0} Total Personnel
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* ─── Employee Performance Leaderboard ─── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
            >
                <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">Employee Performance Board</h3>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Ranked by completion rate</p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                        <Users size={12} />
                        {employeeStats.length} Personnel
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/30">
                                <th className="px-6 py-3 border-b border-slate-100">#</th>
                                <th className="px-6 py-3 border-b border-slate-100">Operative</th>
                                <th className="px-6 py-3 border-b border-slate-100">Tasks</th>
                                <th className="px-6 py-3 border-b border-slate-100">Completed</th>
                                <th className="px-6 py-3 border-b border-slate-100">Active</th>
                                <th className="px-6 py-3 border-b border-slate-100">Overdue</th>
                                <th className="px-6 py-3 border-b border-slate-100">Engagement</th>
                                <th className="px-6 py-3 border-b border-slate-100">Completion</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {employeeStats.map((emp, idx) => (
                                <motion.tr
                                    key={emp.id}
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                    className="hover:bg-slate-50/50 transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-bold ${
                                            idx === 0 ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                                            idx === 1 ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                                            idx === 2 ? 'bg-orange-50 text-orange-600 border border-orange-200' :
                                            'bg-slate-50 text-slate-400 border border-slate-100'
                                        }`}>
                                            {idx + 1}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-[10px] uppercase text-slate-600 shadow-sm">
                                                {emp.username.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">{emp.username}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">{emp.designation || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-semibold text-slate-700">{emp.totalTasks}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-semibold text-emerald-600">{emp.completed}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-semibold text-indigo-600">{emp.inProgress + emp.pending}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {emp.overdue > 0 ? (
                                            <span className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                                                <AlertTriangle size={10} />
                                                {emp.overdue}
                                            </span>
                                        ) : (
                                            <span className="text-xs font-semibold text-emerald-500">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-semibold text-slate-500">{emp.totalComments} logs</span>
                                    </td>
                                    <td className="px-6 py-4 w-44">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <ProgressBar
                                                    value={emp.completed}
                                                    max={emp.totalTasks}
                                                    color={emp.completionRate >= 70 ? 'bg-emerald-500' : emp.completionRate >= 40 ? 'bg-amber-500' : 'bg-rose-500'}
                                                />
                                            </div>
                                            <span className={`text-xs font-bold w-10 text-right ${
                                                emp.completionRate >= 70 ? 'text-emerald-600' :
                                                emp.completionRate >= 40 ? 'text-amber-600' : 'text-rose-600'
                                            }`}>
                                                {emp.completionRate}%
                                            </span>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {employeeStats.length === 0 && (
                    <div className="p-12 text-center">
                        <p className="text-sm text-slate-400">No employee data available</p>
                    </div>
                )}
            </motion.div>

            {/* ─── Overdue Tasks Alert Panel ─── */}
            {overdueTasks.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white border border-rose-200/60 rounded-xl overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
                >
                    <div className="p-5 bg-rose-50/30 border-b border-rose-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={14} className="text-rose-500" />
                            <h3 className="text-sm font-semibold text-rose-900">Overdue Missions ({overdueTasks.length})</h3>
                        </div>
                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Requires Attention</span>
                    </div>
                    <div className="divide-y divide-rose-50">
                        {overdueTasks.slice(0, 8).map((task, idx) => (
                            <div key={task.id} className="px-6 py-4 flex items-center justify-between hover:bg-rose-50/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                        task.priority === 'high' ? 'bg-rose-500' :
                                        task.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-300'
                                    }`} />
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{task.title}</p>
                                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                            Assigned to: <span className="text-slate-600">{task.assigned_to_name || 'Unassigned'}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                                    <Calendar size={10} />
                                    Due: {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* ─── Team Workload Distribution ─── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-white border border-slate-200/60 rounded-xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
            >
                <h3 className="text-sm font-semibold text-slate-900 mb-5">Workload Distribution</h3>
                <div className="space-y-4">
                    {(dashboardData?.teamWorkload || []).map((member, idx) => {
                        const maxLoad = Math.max(...(dashboardData?.teamWorkload || []).map(m => parseInt(m.task_count)));
                        return (
                            <div key={idx} className="flex items-center gap-4">
                                <span className="text-xs font-medium text-slate-600 w-28 truncate">{member.username}</span>
                                <div className="flex-1">
                                    <ProgressBar
                                        value={parseInt(member.task_count)}
                                        max={maxLoad}
                                        color={parseInt(member.task_count) >= maxLoad * 0.8 ? 'bg-rose-500' : 'bg-indigo-500'}
                                    />
                                </div>
                                <span className="text-xs font-bold text-slate-500 w-10 text-right">{member.task_count}</span>
                            </div>
                        );
                    })}

                    {(!dashboardData?.teamWorkload || dashboardData.teamWorkload.length === 0) && (
                        <p className="text-sm text-slate-400 text-center py-4">No active workload data</p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ManagerReports;
