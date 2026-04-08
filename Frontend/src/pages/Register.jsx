import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, ShieldCheck, ArrowRight, Activity } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/auth/signup', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Agent registered successfully');
      navigate('/');
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 selection:bg-blue-600/10">
      <div className="w-full max-w-lg bg-white rounded-[3rem] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden flex flex-col items-center">
        
        {/* Identity Section */}
        <div className="w-full bg-slate-900 p-12 text-center relative overflow-hidden">
          {/* Subtle tactical grid pattern as background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/40 mb-6 group animate-in zoom-in duration-700">
               <UserPlus className="text-white w-8 h-8 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter leading-none mb-3">
              Join ProFlow
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none mb-1">
               Identity Synthesis Protocol
            </p>
          </div>
        </div>

        {/* Input Section */}
        <div className="w-full p-12 md:p-16">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Alias Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Agent Alias</label>
              <div className="relative group/field">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 group-focus-within/field:text-blue-600 transition-colors" />
                </div>
                <input
                  {...register('username', { required: 'Alias is mandatory' })}
                  autoComplete="off"
                  className="block w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500/30 focus:ring-8 focus:ring-blue-500/5 transition-all outline-none"
                  placeholder="ID_DESIGNATOR"
                />
              </div>
              {errors.username && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest pl-1">{errors.username.message}</p>}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Secure Email</label>
              <div className="relative group/field">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within/field:text-blue-600 transition-colors" />
                </div>
                <input
                  {...register('email', { 
                    required: 'Email is mandatory',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid protocol format' }
                  })}
                  className="block w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500/30 focus:ring-8 focus:ring-blue-500/5 transition-all outline-none"
                  placeholder="name@proflow.ai"
                />
              </div>
              {errors.email && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest pl-1">{errors.email.message}</p>}
            </div>

            {/* Credential Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Access Credential</label>
              <div className="relative group/field">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within/field:text-blue-600 transition-colors" />
                </div>
                <input
                  type="password"
                  {...register('password', { required: 'Credential is mandatory', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                  className="block w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500/30 focus:ring-8 focus:ring-blue-500/5 transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest pl-1">{errors.password.message}</p>}
            </div>

            {/* Registration Action */}
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full py-5 px-6 bg-slate-900 text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/40 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {mutation.isPending ? (
                 <>
                  <Activity size={16} className="animate-spin" /> Synchronizing Identity...
                 </>
              ) : (
                <>
                  Initialize Protocol <ArrowRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Back to Login */}
            <div className="pt-6 text-center">
              <Link
                to="/"
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
              >
                Already Commissioned? <span className="text-slate-900 underline underline-offset-4 decoration-slate-200 hover:decoration-blue-600 transition-all">Sign In</span>
              </Link>
            </div>
          </form>
        </div>

        {/* Tactical Footer */}
        <div className="w-full p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-4">
             <div className="flex items-center gap-1.5 opacity-30 grayscale">
                <ShieldCheck size={14} className="text-slate-900" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">Encrypted</span>
             </div>
             <div className="w-1 h-1 bg-slate-300 rounded-full" />
             <div className="flex items-center gap-1.5 opacity-30 grayscale">
                <ShieldCheck size={14} className="text-slate-900" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">Vetted</span>
             </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
