import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../../apis/axios';
import { Users, Clock, Activity, CheckCircle2, WifiOff } from 'lucide-react';

const TeamAttendanceBoard = () => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['teamAttendance'],
        queryFn: async () => {
            const res = await api.get('/attendance/team');
            return res.data;
        },
        refetchInterval: 60000,
    });

    const team = data?.team || [];
    const summary = data?.summary || { total: 0, online: 0, completed: 0, offline: 0 };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'online':
                return { label: 'Active', dotColor: 'bg-emerald-500', textColor: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-100', ping: true };
            case 'completed':
                return { label: 'Done', dotColor: 'bg-indigo-500', textColor: 'text-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-100', ping: false };
            default:
                return { label: 'Offline', dotColor: 'bg-slate-300', textColor: 'text-slate-400', bgColor: 'bg-slate-50', borderColor: 'border-slate-100', ping: false };
        }
    };

    if (error) {
        return (
            <div className="bg-white rounded-xl border border-rose-100 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-rose-500">Team sync failed</p>
                    <button onClick={() => refetch()} className="p-2 bg-rose-50 rounded-lg text-rose-400 hover:text-rose-600 transition-colors">
                        <Activity size={14} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-shadow hover:shadow-[0_8px_20px_rgb(0,0,0,0.04)]">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                            <Users size={18} className="text-slate-500" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Team Attendance</h2>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">Live Status</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => refetch()} 
                        className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all active:scale-95"
                    >
                        <Activity size={14} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* Summary Chips */}
                <div className="flex gap-2 mt-5">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 tabular-nums">{summary.online}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100">
                        <CheckCircle2 size={10} className="text-indigo-500" />
                        <span className="text-[10px] font-bold text-indigo-700 tabular-nums">{summary.completed}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60">
                        <WifiOff size={10} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500 tabular-nums">{summary.offline}</span>
                    </div>
                </div>
            </div>

            {/* Team List */}
            <div className="divide-y divide-slate-100/60">
                {isLoading ? (
                    <div className="p-12 flex flex-col items-center justify-center">
                        <Activity size={20} className="text-slate-300 animate-spin mb-3" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Syncing roster</p>
                    </div>
                ) : team.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users size={24} className="text-slate-200 mx-auto mb-3" />
                        <p className="text-xs text-slate-400">No team members found.</p>
                    </div>
                ) : (
                    team.map((member, idx) => {
                        const status = getStatusConfig(member.live_status);
                        const hoursLogged = member.total_hours ? Number(member.total_hours) : 0;
                        const progressPercent = Math.min((hoursLogged / 8) * 100, 100);

                        return (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors"
                            >
                                {/* Avatar */}
                                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-sm font-bold text-slate-600 uppercase flex-shrink-0 shadow-sm">
                                    {member.username?.charAt(0)}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-semibold text-slate-900 truncate">{member.username}</p>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${status.bgColor} ${status.textColor} ${status.borderColor}`}>
                                            <span className="relative flex h-1.5 w-1.5">
                                                {status.ping && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                                                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${status.dotColor}`}></span>
                                            </span>
                                            {status.label}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium truncate">
                                        {member.designation || 'Team Member'}
                                    </p>
                                </div>

                                {/* Punch Time */}
                                <div className="text-right flex-shrink-0 hidden sm:block">
                                    {member.punch_in ? (
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Clock In</p>
                                            <p className="text-xs font-semibold text-slate-700 tabular-nums">
                                                {new Date(member.punch_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-[10px] text-slate-300 italic">—</p>
                                    )}
                                </div>

                                {/* Hours Progress */}
                                <div className="w-24 flex-shrink-0 hidden md:block">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Hours</span>
                                        <span className="text-[10px] font-bold text-slate-700 tabular-nums">
                                            {hoursLogged > 0 ? `${hoursLogged.toFixed(1)}h` : '0h'}
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPercent}%` }}
                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                            className={`h-full rounded-full ${
                                                member.live_status === 'online' ? 'bg-emerald-500' :
                                                member.live_status === 'completed' ? 'bg-indigo-500' : 'bg-slate-300'
                                            }`}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default TeamAttendanceBoard;
