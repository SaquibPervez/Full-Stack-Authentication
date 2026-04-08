import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Clock, CheckCircle2, Edit, Trash2, Calendar, AlertCircle, Search, Filter, Hash, User, Activity } from 'lucide-react';
import EditTaskModal from './EditTaskModal';
import TaskDetailDrawer from './TaskDetailDrawer';
import { motion, AnimatePresence } from 'framer-motion';

const TaskTable = ({ employees = [], filter = 'all', employeeFilter = 'all', search = '', limit = null, isDashboard = false }) => {
    const [editingTask, setEditingTask] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const queryClient = useQueryClient();

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: async (taskId) => {
            const res = await api.delete(`/tasks/delete/${taskId}`);
            return res.data;
        },
        onSuccess: (responseData) => {
            toast.success(responseData.message || "Objective decommissioned successfully");
            queryClient.invalidateQueries(['tasks']);
            queryClient.invalidateQueries(['dashboard']);
        },
    });

    const handleDelete = (taskId) => {
        if (window.confirm("Confirm deletion? This task will be permanently removed from the system.")) {
            deleteMutation.mutate(taskId);
        }
    };

    // Fetch Tasks
    const { data: tasks, isLoading, error, refetch } = useQuery({
        queryKey: ['tasks', filter, employeeFilter, search],
        queryFn: async () => {
            const res = await api.get('/tasks/task-details', {
                params: {
                    status: filter !== 'all' ? filter : undefined,
                    // Note: backend expects assignedToId as int, but here we might have name or ID.
                    // If employeeFilter is an ID, we'd pass it.
                }
            });
            // Backend returns { success: true, data: [...tasks], message: ... }
            return res.data.data;
        }
    });

    const filteredTasks = useMemo(() => {
        if (!tasks) return [];
        let filtered = [...tasks];
        // Client-side filtering as fallback/extra
        if (employeeFilter !== 'all') {
            filtered = filtered.filter(t => t.assignedTo?.username === employeeFilter);
        }
        if (search) {
            const query = search.toLowerCase();
            filtered = filtered.filter(t => 
                t.title.toLowerCase().includes(query) || 
                t.assignedTo?.username?.toLowerCase().includes(query)
            );
        }
        return limit ? filtered.slice(0, limit) : filtered;
    }, [tasks, employeeFilter, search, limit]);

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200/60 rounded-xl animate-pulse">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing Operations</p>
        </div>
    );
    
    if (error) return (
        <div className="flex flex-col items-center justify-center py-20 bg-rose-50/30 rounded-xl border border-rose-100 text-center px-10">
            <AlertCircle className="w-8 h-8 text-rose-500 mb-4" />
            <h4 className="text-rose-900 font-bold text-sm uppercase tracking-tight mb-1">Link Failure</h4>
            <p className="text-rose-600/70 text-[10px] font-bold uppercase tracking-widest">Could not retrieve mission telemetry</p>
            <button onClick={() => refetch()} className="mt-4 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">Retry Link</button>
        </div>
    );

    if (filteredTasks.length === 0) return (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-center px-10">
            <Filter className="w-8 h-8 text-slate-200 mb-4" />
            <h4 className="text-slate-900 font-bold text-sm uppercase tracking-tight mb-1">Sector Empty</h4>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">No matching telemetry found</p>
        </div>
    );

    return (
        <div className="overflow-hidden rounded-3xl bg-white border border-slate-200/60 shadow-2xl shadow-slate-200/20">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                            <th className="px-8 py-5">Mission Objective</th>
                            <th className="px-8 py-5">Status</th>
                            <th className="px-8 py-5">Assigned Agent</th>
                            <th className="px-8 py-5">Priority</th>
                            {!isDashboard && <th className="px-8 py-5 text-right">Protocol</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredTasks.map((task, idx) => (
                            <motion.tr 
                                initial={{ opacity: 0, x: -4 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.02 }}
                                key={task.id} 
                                className="group hover:bg-slate-50/50 transition-all cursor-pointer"
                                onClick={() => setSelectedTask(task)}
                            >
                                <td className="px-8 py-6">
                                    <div className="space-y-1.5">
                                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight flex items-center gap-3">
                                            {task.title}
                                            {task.comments?.length > 0 && (
                                                <span className="flex items-center gap-1 text-[8px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100 uppercase tracking-widest">
                                                    <Activity size={10} strokeWidth={3} />
                                                    {task.comments.length}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Calendar size={11} className="text-blue-500" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">
                                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Deadline'}
                                            </span>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-8 py-6">
                                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 border shadow-sm
                                        ${task.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/60' : 
                                          task.status === 'in_progress' ? 'bg-blue-50 text-blue-600 border-blue-100/60' : 
                                          'bg-amber-50 text-amber-600 border-amber-100/60'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${
                                            task.status === 'completed' ? 'bg-emerald-500' : 
                                            task.status === 'in_progress' ? 'bg-blue-500 animate-pulse' : 'bg-amber-500'
                                        }`} />
                                        {task.status.replace('_', ' ')}
                                    </span>
                                </td>

                                <td className="px-8 py-6">
                                    {task.assignedTo ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-[10px] uppercase shadow-lg shadow-slate-900/10">
                                                {task.assignedTo.username.charAt(0)}
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">{task.assignedTo.username}</span>
                                        </div>
                                    ) : (
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic opacity-50">Unassigned</span>
                                    )}
                                </td>

                                <td className="px-8 py-6">
                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg border ${
                                        task.priority === 'high' ? 'bg-rose-50 text-rose-500 border-rose-100' : 
                                        task.priority === 'medium' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                                        'bg-slate-50 text-slate-400 border-slate-100'
                                    }`}>
                                        {task.priority}
                                    </span>
                                </td>

                                {!isDashboard && (
                                    <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                            <button 
                                              onClick={() => setEditingTask(task)} 
                                              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 bg-white border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95"
                                              title="Modify Objective"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button 
                                              onClick={() => handleDelete(task.id)}
                                              disabled={deleteMutation.isPending}
                                              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 bg-white border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                              title="Decommission Objective"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {editingTask && (
                    <EditTaskModal 
                        isOpen={!!editingTask} 
                        onClose={() => {setEditingTask(null); queryClient.invalidateQueries(['tasks']);}} 
                        task={editingTask} 
                        employees={employees}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedTask && (
                    <TaskDetailDrawer 
                        task={tasks.find(t => t.id === selectedTask.id) || selectedTask} 
                        onClose={() => setSelectedTask(null)} 
                        onTaskUpdated={() => {
                            queryClient.invalidateQueries(['tasks']);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default TaskTable;