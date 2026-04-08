import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../../apis/axios';
import { Activity, Clock, LogIn, LogOut, CheckCircle2 } from 'lucide-react';

const AttendanceWidget = () => {
    const queryClient = useQueryClient();

    // Fetch Timesheet
    const { data, isLoading, error } = useQuery({
        queryKey: ['myAttendance'],
        queryFn: async () => {
            const res = await api.get('/attendance/me');
            return res.data;
        },
        refetchInterval: 60000, // Refresh every minute
    });

    // Punch Mutation
    const punchMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post('/attendance/punch');
            return res.data;
        },
        onSuccess: (response) => {
            toast.success(response.message || 'Status updated');
            queryClient.invalidateQueries(['myAttendance']);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Action failed');
        }
    });

    if (error) {
        return (
            <div className="bg-white p-5 rounded-xl border border-rose-100 shadow-sm flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">Time Clock Disconnected</h3>
                    <p className="text-xs text-slate-500">Failed to sync attendance data.</p>
                </div>
                <button 
                    onClick={() => queryClient.invalidateQueries(['myAttendance'])}
                    className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-rose-500 hover:bg-rose-50 transition-all"
                >
                    <Activity size={16} />
                </button>
            </div>
        );
    }

    const currentState = data?.currentState || 'offline';
    const timesheet = data?.timesheet || [];
    const todayRecord = data?.today || null;

    // Check if the user has already punched out for today
    const isShiftComplete = todayRecord && todayRecord.punch_in && todayRecord.punch_out;

    const handlePunch = () => {
        if (!isShiftComplete) {
            punchMutation.mutate();
        }
    };

    return (
        <div className="bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-shadow duration-300 hover:shadow-[0_8px_20px_rgb(0,0,0,0.04)] font-sans">
            <div className="p-6">
                
                {/* Header & Status Indicator */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                            <Clock size={18} className="text-slate-500" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Daily Timesheet</h2>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="relative flex h-2 w-2">
                                    {currentState === 'online' && (
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    )}
                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${currentState === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                </span>
                                <span className={`text-[10px] uppercase font-bold tracking-widest ${currentState === 'online' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {currentState === 'online' ? 'Active Shift' : 'Offline'}
                                </span>
                            </div>
                        </div>
                    </div>
                    {todayRecord && todayRecord.total_hours && (
                        <div className="text-right">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Logged Today</p>
                           <p className="text-lg font-bold text-slate-900 tabular-nums">{Number(todayRecord.total_hours).toFixed(2)}<span className="text-xs text-slate-400 font-medium ml-1">hrs</span></p>
                        </div>
                    )}
                </div>

                {/* Primary Action Area */}
                <div className="mb-8">
                    {isLoading ? (
                        <div className="w-full h-14 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center">
                            <Activity size={18} className="text-slate-300 animate-spin" />
                        </div>
                    ) : isShiftComplete ? (
                        <div className="w-full py-4 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center justify-center gap-2 text-emerald-600">
                            <CheckCircle2 size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">Shift Completed</span>
                        </div>
                    ) : (
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={handlePunch}
                            disabled={punchMutation.isPending}
                            className={`w-full py-4 rounded-xl flexItems-center justify-center gap-2 font-bold text-[11px] uppercase tracking-[0.2em] transition-all shadow-sm
                                ${currentState === 'online' 
                                    ? 'bg-rose-50 text-rose-600 border border-rose-200/60 hover:bg-rose-100 hover:border-rose-300 shadow-rose-100/50' 
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
                                }
                                disabled:opacity-70 disabled:cursor-not-allowed
                            `}
                        >
                            {punchMutation.isPending ? (
                                <Activity size={16} className="animate-spin mx-auto" />
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                   {currentState === 'online' ? <LogOut size={14} /> : <LogIn size={14} />}
                                   {currentState === 'online' ? 'End Shift' : 'Punch In'}
                                </div>
                            )}
                        </motion.button>
                    )}
                </div>

                {/* Micro Timesheet (Last 7 Days) */}
                <div>
                    <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 border-b border-slate-100 pb-2">Recent Logs</h3>
                    <div className="space-y-2">
                        {timesheet.slice(0, 5).map((log, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-lg border border-slate-100/50">
                                <span className="text-xs font-medium text-slate-600">
                                    {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                                <span className="text-xs font-bold text-slate-900 bg-white px-2 py-1 rounded shadow-sm border border-slate-100 tabular-nums">
                                    {log.total_hours ? `${Number(log.total_hours).toFixed(2)}h` : 'Active'}
                                </span>
                            </div>
                        ))}
                        {timesheet.length === 0 && !isLoading && (
                            <p className="text-xs text-slate-400 italic text-center py-4">No recent attendance records.</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AttendanceWidget;
