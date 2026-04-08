import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../apis/axios';
import { motion } from 'framer-motion';
import { Activity, BadgeDollarSign, CheckCircle2 } from 'lucide-react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const MyPayslips = () => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['myPayslips'],
        queryFn: async () => {
            const res = await api.get('/payroll/me');
            return res.data;
        },
        retry: 1,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-16">
                <Activity size={24} className="text-slate-300 animate-spin mb-4" />
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Loading your payslips</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-8 rounded-xl border border-rose-100 text-center shadow-sm">
                <p className="text-rose-500 text-sm font-semibold mb-4">Failed to load payslips</p>
                <button onClick={() => refetch()} className="px-5 py-2 bg-slate-900 text-white rounded-lg text-[10px] uppercase font-semibold active:scale-95 transition-all">Retry</button>
            </div>
        );
    }

    const payslips = data?.payslips || [];

    if (payslips.length === 0) {
        return (
            <div className="bg-white p-12 rounded-xl border border-slate-200/60 text-center shadow-sm flex flex-col items-center">
                <BadgeDollarSign size={24} className="text-slate-200 mb-3" />
                <p className="text-xs text-slate-400">No payslips generated yet</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50/50 border-b border-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                <div className="col-span-3">Month</div>
                <div className="col-span-2 text-center">Basic (₹)</div>
                <div className="col-span-3 text-center">Allowances / Deductions</div>
                <div className="col-span-2 text-center">Net Payable</div>
                <div className="col-span-2 text-center">Status</div>
            </div>

            <div className="divide-y divide-slate-100/60">
                {payslips.map((slip, idx) => {
                    const isPaid = slip.status === 'paid';
                    
                    return (
                        <motion.div
                            key={slip.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50/40 transition-colors"
                        >
                            <div className="col-span-3">
                                <span className="text-sm font-bold text-slate-900">
                                    {MONTHS[slip.month - 1]} {slip.year}
                                </span>
                            </div>
                            
                            <div className="col-span-2 text-center">
                                <span className="text-xs font-semibold text-slate-600 tabular-nums">
                                    {Number(slip.basic_salary).toLocaleString()}
                                </span>
                            </div>

                            <div className="col-span-3 flex items-center justify-center gap-2">
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md tabular-nums">
                                    +{Number(slip.allowances || 0).toLocaleString()}
                                </span>
                                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md tabular-nums">
                                    -{Number(slip.deductions || 0).toLocaleString()}
                                </span>
                            </div>

                            <div className="col-span-2 text-center">
                                <span className="text-sm font-black text-slate-900 tabular-nums">
                                    ₹{Number(slip.net_payable).toLocaleString()}
                                </span>
                            </div>

                            <div className="col-span-2 flex justify-center">
                                {isPaid ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-[9px] font-bold text-emerald-600 uppercase tracking-widest">
                                        <CheckCircle2 size={10} /> Paid
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                        Pending
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default MyPayslips;
