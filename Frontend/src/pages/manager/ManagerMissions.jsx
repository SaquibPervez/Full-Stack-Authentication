import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../../apis/axios';
import TaskTable from '../../components/Dashboard/TaskTable';
import CreateTaskModel from '../../components/Dashboard/CreateTaskModel';
import { ClipboardList, Activity, PlusCircle, Filter, User } from 'lucide-react';

const ManagerMissions = () => {
    const [openTaskModal, setOpenTaskModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [employeeFilter, setEmployeeFilter] = useState('all');

    const { data: dashboardData, isLoading, error, refetch } = useQuery({
        queryKey: ['managerStats'],
        queryFn: async () => {
            const res = await api.get('/dashboard/manager');
            return res.data;
        },
    });

    if (isLoading) {
        return (
            <div className="h-full flex flex-col justify-center items-center p-20">
                <div className="w-10 h-10 border-[3px] border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="mt-5 text-[10px] tracking-wider uppercase font-semibold text-slate-400">Loading Missions</p>
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

    const { allEmployees = [] } = dashboardData || {};

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <ClipboardList size={14} className="text-indigo-600" />
                        <p className="text-[10px] tracking-wider uppercase font-semibold text-slate-400">
                            Team Operations
                        </p>
                    </div>
                    <h1 className="text-xl font-semibold text-slate-900">
                        Active Missions
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 mr-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold uppercase tracking-wide text-slate-600 outline-none focus:border-indigo-500/30 transition-all"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>

                        <select
                            value={employeeFilter}
                            onChange={(e) => setEmployeeFilter(e.target.value)}
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold uppercase tracking-wide text-slate-600 outline-none focus:border-indigo-500/30 transition-all"
                        >
                            <option value="all">All Personnel</option>
                            {allEmployees.map(emp => (
                                <option key={emp.id} value={emp.username}>{emp.username}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={() => setOpenTaskModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-[11px] uppercase tracking-wide shadow-indigo-200 shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
                    >
                        <PlusCircle size={14} /> Deploy Mission
                    </button>
                </div>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <TaskTable 
                    employees={allEmployees} 
                    filter={statusFilter}
                    employeeFilter={employeeFilter}
                    isDashboard={false} 
                />
            </motion.div>

            {openTaskModal && (
                <CreateTaskModel 
                    onClose={() => setOpenTaskModal(false)} 
                    employees={allEmployees} 
                />
            )}
        </div>
    );
};

export default ManagerMissions;
