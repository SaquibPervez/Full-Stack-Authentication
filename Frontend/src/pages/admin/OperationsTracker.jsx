import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../../apis/axios';
import TaskTable from '../../components/Dashboard/TaskTable';
import CreateTaskModel from '../../components/Dashboard/CreateTaskModel';
import { ClipboardList, Activity, PlusCircle } from 'lucide-react';

const OperationsTracker = () => {
    const [openTaskModal, setOpenTaskModal] = useState(false);

    const { data: dashboardData, isLoading, error, refetch } = useQuery({
        queryKey: ['adminStats'],
        queryFn: async () => {
            const res = await api.get('/dashboard/admin');
            return res.data;
        },
    });

    if (isLoading) {
        return (
            <div className="h-full flex flex-col justify-center items-center p-20">
                <div className="w-10 h-10 border-[3px] border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="mt-5 text-[10px] tracking-wider uppercase font-semibold text-slate-400">Loading Operations</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex items-center justify-center p-20">
                <div className="text-center p-8 bg-white rounded-xl border border-rose-100 shadow-sm">
                    <p className="text-rose-500 text-sm font-semibold mb-4 uppercase tracking-wider">Sync Failed</p>
                    <button onClick={() => refetch()} className="px-5 py-2 bg-slate-900 text-white rounded-lg text-[10px] uppercase font-semibold active:scale-95 transition-all">Retry Link</button>
                </div>
            </div>
        );
    }

    const { employees = [] } = dashboardData || {};

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <ClipboardList size={14} className="text-indigo-600" />
                        <p className="text-[10px] tracking-wider uppercase font-semibold text-slate-400">
                            Global Strategy
                        </p>
                    </div>
                    <h1 className="text-xl font-semibold text-slate-900">
                        Operations Tracker
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-500/30 transition-all shadow-sm active:scale-95"
                    >
                        <Activity size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => setOpenTaskModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold text-[11px] uppercase tracking-wide shadow-indigo-200 shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
                    >
                        <PlusCircle size={14} /> Deploy Mission
                    </button>
                </div>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <TaskTable employees={employees} isDashboard={false} />
            </motion.div>

            {openTaskModal && (
                <CreateTaskModel 
                    onClose={() => setOpenTaskModal(false)} 
                    employees={employees} 
                />
            )}
        </div>
    );
};

export default OperationsTracker;
