import { X, UserPlus, Shield, User, Mail, Lock, Briefcase } from 'lucide-react';
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import toast from 'react-hot-toast';

function AddEmployeeModal({ onClose }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (employeeData) => {
      const { data } = await api.post('/admin/create-user', employeeData);
      return data;
    },
    onSuccess: (responseData) => {
      toast.success(responseData.message || "New agent synchronized successfully");
      queryClient.invalidateQueries(['dashboard']);
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const employeeData = {
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password'),
      role: formData.get('role'),
      designation: formData.get('designation'),
    };
    mutation.mutate(employeeData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="bg-slate-900 p-10 text-white relative">
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tighter">Onboard Agent</h2>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Ecosystem Expansion</p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Alias</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600" size={16} />
                  <input type="text" name="username" required placeholder="User-ID" className="premium-input-field pl-12" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secure Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="email" name="email" required placeholder="name@proflow.ai" className="premium-input-field pl-12" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Credential</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="password" name="password" required placeholder="********" className="premium-input-field pl-12" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Clearance LVL</label>
                <div className="relative group">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select name="role" className="premium-input-field pl-12 appearance-none bg-slate-50">
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Specialization</label>
                <div className="relative group">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" name="designation" required placeholder="e.g. Architect" className="premium-input-field pl-12" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full py-5 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/20 active:scale-95 disabled:opacity-50"
            >
              {mutation.isPending ? "Synchronizing..." : "Initiate Onboarding"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddEmployeeModal;
