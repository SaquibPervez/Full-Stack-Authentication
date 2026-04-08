import { Mail, Calendar, Briefcase, Trash2, MoreHorizontal, Shield, User, Users } from 'lucide-react';
import api from '../../apis/axios';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const EmployeeTable = ({ employees }) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (employeeId) => {
      const { data } = await api.post(`/admin/delete-user/${employeeId}`);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Member removed from workspace");
      queryClient.invalidateQueries(['adminStats']);
      queryClient.invalidateQueries(['managerStats']);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ??
        error?.response?.data?.error ??
        "Internal system error during deletion"
      );
    }
  });

const handleDelete = (employeeId) => {
  const confirmationMessage =
    "Are you sure you want to delete this employee? This action is permanent and cannot be undone.";

  if (!window.confirm(confirmationMessage)) return;

  deleteMutation.mutate(employeeId);
};

  return (
    <div className="overflow-hidden rounded-2xl bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-[11px] font-black uppercase tracking-[0.15em]">
              <th className="px-8 py-5 border-b border-slate-100 first:rounded-tl-2xl">Member</th>
              <th className="px-8 py-5 border-b border-slate-100">Designation</th>
              <th className="px-8 py-5 border-b border-slate-100">Status</th>
              <th className="px-8 py-5 border-b border-slate-100">Enrolled</th>
              <th className="px-8 py-5 border-b border-slate-100 last:rounded-tr-2xl text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {employees && employees.length > 0 ? (
              employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-black text-sm border border-slate-200 group-hover:scale-105 transition-transform">
                        {emp.username?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          {emp.username || emp.name}
                          {emp.role === 'admin' && (
                            <span className="p-1 bg-blue-50 rounded-md">
                              <Shield size={10} className="text-blue-600" />
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-black uppercase tracking-wider">
                        {emp.designation || emp.role || 'Contributor'}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {(emp.is_active ?? (emp.status === 'Active')) ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        Online
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider border border-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        Offline
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold font-mono">
                      {emp.created_at 
                        ? new Date(emp.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: '2-digit',
                            year: 'numeric'
                          })
                        : '—'}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 outline-none">
                      <button 
                        onClick={() => handleDelete(emp.id)}
                        disabled={deleteMutation.isPending}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                      <Users className="w-8 h-8 text-slate-200" />
                    </div>
                    <p className="text-slate-400 text-sm font-bold tracking-tight">Ecosystem directory is currently empty.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeTable;
