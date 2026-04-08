import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { X, Layout, FileText, BarChart3, Calendar, User, Send, Activity, AlignLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../api/axios";

function CreateTaskModel({ onClose }) {
  const queryClient = useQueryClient();

  // Fetch users for assignment
  const { data: userData } = useQuery({
    queryKey: ['users', 'list'],
    queryFn: async () => {
        const res = await api.get('/admin/users'); // Assuming this endpoint exists or will be aligned
        return res.data.data || [];
    }
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    assignedToId: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const createMutation = useMutation({
    mutationFn: async (taskData) => {
      // Ensure IDs are numbers
      const payload = {
          ...taskData,
          assignedToId: taskData.assignedToId ? parseInt(taskData.assignedToId) : null
      };
      const { data } = await api.post("/tasks/create", payload);
      return data;
    },
    onSuccess: (responseData) => {
      toast.success(responseData.message || "Mission objective initialized");
      queryClient.invalidateQueries(["tasks"]);
      queryClient.invalidateQueries(["dashboard"]);
      onClose();  
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-900/20">
                    <Layout size={24} strokeWidth={2.5} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Initialize Mission</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Directive</p>
                </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 border border-slate-200 bg-white rounded-xl text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all active:scale-95 flex items-center justify-center"
            >
              <X size={20} />
            </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-10 space-y-8">
            <div className="space-y-2.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Mission Title</label>
                <div className="relative group">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                    <input
                        type="text"
                        name="title"
                        placeholder="Define the core objective..."
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none shadow-inner"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Context briefing</label>
                <div className="relative group">
                    <AlignLeft className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                    <textarea
                        name="description"
                        placeholder="Detailed operational parameters..."
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none min-h-[120px] shadow-inner"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Priority Strategy</label>
                    <div className="relative group">
                        <BarChart3 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                        <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-8 text-sm font-bold uppercase tracking-widest focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 appearance-none outline-none shadow-inner"
                            required
                        >
                            <option value="high">Critical / High</option>
                            <option value="medium">Strategic / Med</option>
                            <option value="low">Routine / Low</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Expiry Date</label>
                    <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                        <input
                            type="date"
                            name="dueDate"
                            value={formData.dueDate || ""}
                            onChange={handleChange}
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none shadow-inner"
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Primary Agent</label>
                <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                    <select
                        name="assignedToId"
                        value={formData.assignedToId}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-8 text-sm font-bold uppercase tracking-widest focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 appearance-none outline-none shadow-inner"
                        required
                    >
                        <option value="">Select Deployable Unit</option>
                        {userData?.map((emp) => (
                            <option key={emp.id} value={emp.id}>{emp.username} ({emp.role})</option>
                        ))}
                    </select>
                </div>
            </div>

            <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full py-5 rounded-[2rem] bg-slate-900 text-white font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-slate-800 active:scale-95 transition-all shadow-2xl shadow-slate-900/30 disabled:opacity-50"
            >
                {createMutation.isPending ? (
                    <Activity size={20} className="animate-spin" />
                ) : (
                    <>
                        <Send size={18} strokeWidth={3} />
                        Transmit Directive
                    </>
                )}
            </button>
        </form>
      </div>
    </div>
  );
}

export default CreateTaskModel;
