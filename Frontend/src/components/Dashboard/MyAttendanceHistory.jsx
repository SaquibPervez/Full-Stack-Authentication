import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../apis/axios';
import { motion } from 'framer-motion';
import { Activity, Clock } from 'lucide-react';

const MyAttendanceHistory = () => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['myAttendance'],
        queryFn: async () => {
            const res = await api.get('/attendance/me');
            return res.data;
        },
        retry: 1,
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-16">
                <Activity size={24} className="text-slate-300 animate-spin mb-4" />
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Loading attendance</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-8 rounded-xl border border-rose-100 text-center shadow-sm">
                <p className="text-rose-500 text-sm font-semibold mb-4">Failed to load attendance history</p>
                <button onClick={() => refetch()} className="px-5 py-2 bg-slate-900 text-white rounded-lg text-[10px] uppercase font-semibold active:scale-95 transition-all">Retry</button>
            </div>
        );
    }

    const timesheet = data?.timesheet || [];

    if (timesheet.length === 0) {
        return (
            <div className="bg-white p-12 rounded-xl border border-slate-200/60 text-center shadow-sm flex flex-col items-center">
                <Clock size={24} className="text-slate-200 mb-3" />
                <p className="text-xs text-slate-400">No attendance records found</p>
            </div>
        );
    }

    // Helper to format timestamps to readable time (e.g., 09:30 AM)
    const formatTime = (ts) => {
        if (!ts) return "—";
        return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50/50 border-b border-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                <div className="col-span-3">Date</div>
                <div className="col-span-3 text-center">Punch In</div>
                <div className="col-span-3 text-center">Punch Out</div>
                <div className="col-span-2 text-center">Hours Logged</div>
                <div className="col-span-1 text-center">Status</div>
            </div>

            <div className="divide-y divide-slate-100/60">
                {timesheet.map((record, idx) => {
                    const isAbsent = record.status === 'absent';
                    const isPresent = record.status === 'present';
                    const isLeave = record.status === 'on_leave';
                    
                    return (
                        <motion.div
                            key={record.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50/40 transition-colors"
                        >
                            <div className="col-span-3">
                                <span className="text-sm font-semibold text-slate-900">
                                    {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                            
                            <div className="col-span-3 text-center">
                                <span className={`text-xs font-semibold tabular-nums ${record.punch_in ? 'text-slate-600' : 'text-slate-300'}`}>
                                    {formatTime(record.punch_in)}
                                </span>
                            </div>

                            <div className="col-span-3 text-center">
                                <span className={`text-xs font-semibold tabular-nums ${record.punch_out ? 'text-slate-600' : 'text-slate-300'}`}>
                                    {formatTime(record.punch_out)}
                                </span>
                            </div>

                            <div className="col-span-2 text-center">
                                <span className="text-sm font-bold text-slate-900 tabular-nums">
                                    {record.total_hours ? parseFloat(record.total_hours).toFixed(2) : "—"}
                                </span>
                            </div>

                            <div className="col-span-1 flex justify-center">
                                {isPresent ? (
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
                                ) : isAbsent ? (
                                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                ) : isLeave ? (
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                ) : (
                                    <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default MyAttendanceHistory;
