import React, { useState, useMemo } from 'react';
import { Search, ShieldAlert, ShieldCheck, User, Mail, Calendar, CircleDot } from 'lucide-react';
import { motion } from 'framer-motion';

const UsersTable = ({ users = [], limit = null, hideSearch = false }) => {
    const [search, setSearch] = useState('');

    const filteredUsers = useMemo(() => {
        let result = users;
        if (search) {
            result = result.filter(u => 
                u.username.toLowerCase().includes(search.toLowerCase()) || 
                u.email.toLowerCase().includes(search.toLowerCase())
            );
        }
        return limit ? result.slice(0, limit) : result;
    }, [users, search, limit]);

    // Role badge styles following ProFlow standards
    const getRoleStyle = (role) => {
        switch(role) {
            case 'admin': return 'bg-slate-900 text-white border-slate-800';
            case 'manager': return 'bg-blue-50 text-blue-600 border-blue-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-200/60';
        }
    };

    return (
        <div className="overflow-hidden rounded-[2rem] bg-white border border-slate-200/60 shadow-2xl shadow-slate-200/20">
            {!hideSearch && (
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="relative w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search personnel database..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-6 text-sm font-medium focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                        />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Synchronized <span className="text-slate-900">{filteredUsers.length}</span> Active Units
                    </div>
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
                            <th className="px-8 py-5 border-b border-slate-100">Designation</th>
                            <th className="px-8 py-5 border-b border-slate-100">Clearance</th>
                            <th className="px-8 py-5 border-b border-slate-100">Comms Link</th>
                            <th className="px-8 py-5 border-b border-slate-100">Status</th>
                            <th className="px-8 py-5 border-b border-slate-100 text-right">Commissioned</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredUsers.length > 0 ? filteredUsers.map((user, idx) => (
                            <motion.tr 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={user.id} 
                                className="hover:bg-slate-50/40 transition-colors group"
                            >
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-900 font-black text-xs uppercase group-hover:bg-slate-900 group-hover:text-white transition-all group-hover:scale-110">
                                            {user.username.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{user.username}</div>
                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                                {user.designation || 'Specialist'}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border inline-flex items-center gap-2 shadow-sm ${getRoleStyle(user.role)}`}>
                                        {user.role === 'admin' && <ShieldAlert size={12} strokeWidth={2.5} />}
                                        {user.role === 'manager' && <ShieldCheck size={12} strokeWidth={2.5} />}
                                        {user.role === 'employee' && <User size={12} strokeWidth={2.5} />}
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3 text-slate-500 text-xs font-bold leading-none">
                                        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                            <Mail size={14} strokeWidth={2.5} />
                                        </div>
                                        {user.email}
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className={`inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${
                                        user.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'
                                    }`}>
                                        <CircleDot size={10} strokeWidth={3} className={user.isActive ? 'animate-pulse' : ''} />
                                        {user.isActive ? 'Online' : 'Offline'}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <div className="flex items-center justify-end gap-2 text-[11px] font-bold text-slate-400 whitespace-nowrap">
                                        <Calendar size={14} strokeWidth={2.5} />
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                    </div>
                                </td>
                            </motion.tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="px-8 py-20 text-center text-slate-400 text-xs font-black uppercase tracking-widest italic bg-slate-50/30">
                                    No personnel identified in search parameters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersTable;
