import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Layout, FileText, BarChart3, Calendar, User, Save, Activity, AlignLeft } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../apis/axios";

function EditTaskModal({ onClose, task, employees }) {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    priority: task?.priority || "",
    due_date: task?.due_date ? new Date(task.due_date).toISOString().split("T")[0] : "",
    assigned_to: task?.assigned_to || employees?.find(emp => emp.username === task?.assigned_to_name)?.id || "",
    status: task?.status || ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const updateMutation = useMutation({
    mutationFn: async (updatedData) => {
      const res = await api.put(`/tasks/edit/${task.id}`, updatedData);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Mission intelligence updated");
      queryClient.invalidateQueries(['adminTaskDetails']);
      queryClient.invalidateQueries(['adminStats']);
      queryClient.invalidateQueries(['managerStats']);
      queryClient.invalidateQueries(['employeeStats']);
      onClose(); 
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Tactical update failed");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200/60">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                    <Activity size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Modify Objective</h2>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Configuration Module</p>
                </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all active:scale-95"
            >
              <X size={16} />
            </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Objective Title</label>
                <div className="relative">
                    <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                        type="text"
                        name="title"
                        placeholder="Define mission objective..."
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                        required
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Refined Briefing</label>
                <div className="relative">
                    <AlignLeft className="absolute left-3.5 top-3.5 text-slate-400" size={14} />
                    <textarea
                        name="description"
                        placeholder="Updated operational details..."
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none min-h-[100px]"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Priority Level</label>
                    <div className="relative">
                        <BarChart3 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 appearance-none outline-none"
                            required
                        >
                            <option value="">Status</option>
                            <option value="high">Critical</option>
                            <option value="medium">Strategic</option>
                            <option value="low">Routine</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Workflow State</label>
                    <div className="relative">
                        <Activity className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 appearance-none outline-none"
                            required
                        >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Assign Operator</label>
                    <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <select
                            name="assigned_to"
                            value={formData.assigned_to}
                            onChange={handleChange}
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 appearance-none outline-none"
                            required
                        >
                            <option value="">Personnel</option>
                            {employees?.map((emp) => (
                                <option key={emp.id} value={emp.id}>{emp.username}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">New Target</label>
                    <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="date"
                            name="due_date"
                            value={formData.due_date}
                            onChange={handleChange}
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                            required
                        />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
            >
                {updateMutation.isPending ? (
                    <Activity size={16} className="animate-spin" />
                ) : (
                    <>
                        <Save size={14} />
                        Commit Changes
                    </>
                )}
            </button>
        </form>
      </div>
    </div>
  );
}

export default EditTaskModal;