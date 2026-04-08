import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import UsersTable from '../../components/Dashboard/UsersTable';
import { Users, ShieldAlert, Activity } from 'lucide-react';

const PersonnelDirectory = () => {
    const { data: users, isLoading, error, refetch } = useQuery({
        queryKey: ['users', 'list'],
        queryFn: async () => {
            const res = await api.get('/admin/users');
            return res.data.data;
        },
    });

    if (isLoading) {
        return (
            <div className="h-screen flex flex-col justify-center items-center bg-white px-20">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="mt-6 text-[10px] tracking-[0.3em] uppercase font-black text-slate-400">Accessing Personnel DB</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen flex items-center justify-center bg-white px-20">
                <div className="text-center p-12 bg-rose-50 rounded-[2.5rem] border border-rose-100 shadow-2xl shadow-rose-100/20">
                    <p className="text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6">Uplink Interrupted</p>
                    <button onClick={() => refetch()} className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] uppercase font-black tracking-widest active:scale-95 transition-all shadow-xl shadow-slate-900/20">Re-establish Link</button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-12 bg-white min-h-screen">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 pb-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/20">
                            <Users size={20} strokeWidth={2.5} />
                         </div>
                         <div>
                            <p className="text-[10px] tracking-[0.2em] uppercase font-black text-blue-600 mb-0.5">Admin Central</p>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
                                Personnel Directory
                            </h1>
                         </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => refetch()}
                        className="group w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-500/30 transition-all shadow-xl shadow-slate-200/20 active:scale-95"
                    >
                        <Activity size={20} className={isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
                    </button>
                </div>
            </header>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <UsersTable users={users} hideSearch={false} />
            </motion.div>
        </div>
    );
};

export default PersonnelDirectory;
