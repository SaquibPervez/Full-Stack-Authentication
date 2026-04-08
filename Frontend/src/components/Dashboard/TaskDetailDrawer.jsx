import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import {
  X, Clock, Calendar, Activity, MessageSquare, Briefcase, User, Send, CheckCircle2
} from 'lucide-react';
import ThreadedComments from './ThreadedComments';

const TaskDetailDrawer = ({ task, onClose, onTaskUpdated }) => {
  const [commentText, setCommentText] = useState('');
  const queryClient = useQueryClient();

  // Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus) => {
      const res = await api.patch(`/tasks/status/${task.id}`, { status: newStatus });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Mission status updated.');
      onTaskUpdated();
    },
  });

  // Comment Mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({ text, parentId = null }) => {
      const res = await api.post(`/tasks/${task.id}/comments`, { content: text, parentId });
      return res.data;
    },
    onSuccess: () => {
      setCommentText('');
      toast.success('Log entry added.');
      onTaskUpdated();
    },
  });

  const handleStatusChange = (status) => {
    updateStatusMutation.mutate(status);
  };

  const handleReplyTransmission = (text, parentId) => {
    addCommentMutation.mutate({ text, parentId });
  };

  const submitComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addCommentMutation.mutate({ text: commentText });
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'medium': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-200/60';
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex justify-end"
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200"
        >
          {/* Header */}
          <div className="p-10 border-b border-slate-100 flex items-start justify-between bg-slate-50/30">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg border shadow-sm ${getPriorityStyle(task.priority)}`}>
                  Priority: {task.priority}
                </span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Telemetry ID: {task.id}
                </span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{task.title}</h2>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 border border-slate-200 bg-white rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-500/30 transition-all active:scale-95 flex items-center justify-center shadow-sm"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-10 space-y-12">
            
            {/* Meta Stats */}
            <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm group hover:border-blue-100 transition-all">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Deadline</p>
                    <p className="text-sm font-bold text-slate-900 flex items-center gap-3">
                        <Calendar size={16} className="text-blue-500" />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Expiry'}
                    </p>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm group hover:border-blue-100 transition-all">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Initiator</p>
                    <p className="text-sm font-bold text-slate-900 flex items-center gap-3">
                        <User size={16} className="text-blue-500" />
                        {task.createdBy?.username || 'System'}
                    </p>
                </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/40" /> Objective Details
              </h3>
              <div className="p-6 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm text-slate-600 leading-relaxed italic">
                "{task.description || 'No detailed mission parameters provided.'}"
              </div>
            </div>

            {/* Status Flow */}
            <div className="space-y-4">
               <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                 <Briefcase size={16} className="text-blue-500" /> Lifecycle State
               </h3>
               <div className="flex bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/60">
                  {['pending', 'in_progress', 'completed'].map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        disabled={updateStatusMutation.isPending}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                            task.status === status 
                            ? 'bg-white shadow-xl text-blue-600 border border-slate-200' 
                            : 'text-slate-400 hover:text-slate-500'
                        }`}
                      >
                          {status.replace('_', ' ')}
                      </button>
                  ))}
               </div>
            </div>

            {/* Tactical Logs */}
            <div className="space-y-6 pt-4">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                <Activity size={16} className="text-blue-500" /> Communications
              </h3>
              
              <ThreadedComments 
                 rawComments={task.comments} 
                 onPostComment={(parentId, text) => {
                   addCommentMutation.mutate({ text, parentId });
                 }} 
              />
            </div>
          </div>

          {/* Comment Footer */}
          <div className="p-8 border-t border-slate-100 bg-white/80 backdrop-blur-xl">
             <form onSubmit={submitComment} className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200 focus-within:border-blue-500/30 transition-all shadow-inner">
                <input 
                   type="text"
                   value={commentText}
                   onChange={e => setCommentText(e.target.value)}
                   placeholder="Enter log entry..."
                   className="flex-1 bg-transparent px-4 py-2 text-sm outline-none placeholder:text-slate-300 font-medium"
                   disabled={addCommentMutation.isPending}
                />
                <button 
                  type="submit"
                  disabled={!commentText.trim() || addCommentMutation.isPending}
                  className="px-6 py-3 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95 shadow-2xl shadow-blue-600/20"
                >
                    {addCommentMutation.isPending ? <Activity size={14} className="animate-spin" /> : <Send size={14} />}
                    Transmit
                </button>
             </form>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default TaskDetailDrawer;
