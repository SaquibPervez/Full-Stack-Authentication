import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../../apis/axios';
import { Timer, Activity, CheckCircle2, MessageSquare, Clock } from 'lucide-react';

const EmployeeActivity = () => {
    const { data: dashboardData, isLoading, error, refetch } = useQuery({
        queryKey: ['employeeStats'],
        queryFn: async () => {
            const res = await api.get('/dashboard/employee');
            return res.data;
        },
    });

    if (isLoading) {
        return (
            <div className="h-full flex flex-col justify-center items-center p-20">
                <div className="w-10 h-10 border-[3px] border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="mt-5 text-[10px] tracking-wider uppercase font-semibold text-slate-400">Loading Signal Log</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex items-center justify-center p-20">
                <div className="text-center p-8 bg-white rounded-xl border border-rose-100 shadow-sm">
                    <p className="text-rose-500 text-sm font-semibold mb-4 uppercase tracking-wider">Log Access Failed</p>
                    <button onClick={() => refetch()} className="px-5 py-2 bg-slate-900 text-white rounded-lg text-[10px] uppercase font-semibold active:scale-95 transition-all">Retry Link</button>
                </div>
            </div>
        );
    }

    const tasks = dashboardData?.tasks || [];
    // Flatten all comments from all tasks to simulate an "activity" log
    const activities = tasks.flatMap(task => 
        (task.comments || []).map(comment => ({
            ...comment,
            taskTitle: task.title,
            type: 'comment'
        }))
    ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Timer size={14} className="text-indigo-600" />
                        <p className="text-[10px] tracking-wider uppercase font-semibold text-slate-400">
                            Telemetry History
                        </p>
                    </div>
                    <h1 className="text-xl font-semibold text-slate-900">
                        Activity Log
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-500/30 transition-all shadow-sm active:scale-95"
                    >
                        <Activity size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </header>

            <div className="bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                    <h3 className="text-sm font-medium text-slate-900">Recent Stream</h3>
                </div>
                
                <div className="divide-y divide-slate-100">
                    {activities.length > 0 ? (
                        activities.map((activity, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="p-5 hover:bg-slate-50/50 transition-colors flex gap-4"
                            >
                                <div className="mt-1">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                                        <MessageSquare size={14} />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-4 mb-1">
                                        <p className="text-sm font-medium text-slate-900 truncate">
                                            Added a note to <span className="text-indigo-600">"{activity.taskTitle}"</span>
                                        </p>
                                        <span className="text-[10px] font-semibold text-slate-400 uppercase whitespace-nowrap bg-slate-100 px-2 py-0.5 rounded">
                                            {activity.type}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 leading-relaxed mb-2">
                                        "{activity.text}"
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
                                        <Clock size={10} />
                                        {new Date(activity.timestamp).toLocaleString()}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="p-16 text-center">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4">
                                <Activity size={24} />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900 mb-1">No recorded activity</h3>
                            <p className="text-xs text-slate-500">Your mission updates and task communications will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmployeeActivity;
