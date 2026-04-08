import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../apis/axios';
import { MessageSquare, Activity, ChevronDown, ChevronUp, Send } from 'lucide-react';
import ThreadedComments from '../../components/Dashboard/ThreadedComments';

const ManagerCommunications = () => {
    const [expandedTaskId, setExpandedTaskId] = useState(null);
    const [newCommentText, setNewCommentText] = useState({});
    const queryClient = useQueryClient();

    const { data: tasks, isLoading, error, refetch } = useQuery({
        queryKey: ['adminTaskDetails'],
        queryFn: async () => {
            const res = await api.get('/tasks/task-details');
            return res.data.tasks || res.data;
        },
        refetchInterval: 30000,
    });

    // Comment mutation - reusable for any task
    const addCommentMutation = useMutation({
        mutationFn: async ({ taskId, content, parent_id = null }) => {
            const res = await api.post(`/tasks/${taskId}/comments`, { content, parent_id });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminTaskDetails']);
            setNewCommentText({});
        },
        onError: () => {}
    });

    const handlePostComment = (taskId, parentId, text) => {
        addCommentMutation.mutate({ taskId, content: text, parent_id: parentId });
    };

    const handleRootComment = (taskId) => {
        const text = newCommentText[taskId];
        if (!text?.trim()) return;
        addCommentMutation.mutate({ taskId, content: text, parent_id: null });
        setNewCommentText(prev => ({ ...prev, [taskId]: '' }));
    };

    if (isLoading) {
        return (
            <div className="h-full flex flex-col justify-center items-center p-20">
                <div className="w-10 h-10 border-[3px] border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="mt-5 text-[10px] tracking-wider uppercase font-semibold text-slate-400">Loading Communications</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex items-center justify-center p-20">
                <div className="text-center p-8 bg-white rounded-xl border border-rose-100 shadow-sm">
                    <p className="text-rose-500 text-sm font-semibold mb-4 uppercase tracking-wider">Log Access Failed</p>
                    <button onClick={() => refetch()} className="px-5 py-2 bg-slate-900 text-white rounded-lg text-[10px] uppercase font-semibold active:scale-95 transition-all">Retry Link</button>
                </div>
            </div>
        );
    }

    const availableTasks = tasks || [];

    // Only show tasks that have comments, sorted by most recent comment
    const tasksWithComments = availableTasks
        .filter(t => t.comments && t.comments.length > 0)
        .sort((a, b) => {
            const latestA = Math.max(...a.comments.map(c => new Date(c.timestamp || c.created_at).getTime()));
            const latestB = Math.max(...b.comments.map(c => new Date(c.timestamp || c.created_at).getTime()));
            return latestB - latestA;
        });

    // Also include tasks without comments so manager can start a conversation
    const tasksWithoutComments = availableTasks.filter(t => !t.comments || t.comments.length === 0);

    const totalComments = availableTasks.reduce((sum, t) => sum + (t.comments?.length || 0), 0);

    const toggleExpand = (taskId) => {
        setExpandedTaskId(prev => prev === taskId ? null : taskId);
    };

    const getPriorityDot = (priority) => {
        switch (priority) {
            case 'high': return 'bg-rose-500';
            case 'medium': return 'bg-amber-500';
            default: return 'bg-slate-300';
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'in_progress': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-200';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <MessageSquare size={14} className="text-indigo-600" />
                        <p className="text-[10px] tracking-wider uppercase font-semibold text-slate-400">
                            Team Communications
                        </p>
                    </div>
                    <h1 className="text-xl font-semibold text-slate-900">
                        Tactical Comms
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm">
                        <MessageSquare size={12} />
                        {totalComments} Total Signals
                    </div>
                    <button
                        onClick={() => refetch()}
                        className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-500/30 transition-all shadow-sm active:scale-95"
                    >
                        <Activity size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </header>

            {/* Tasks with Active Threads */}
            <div className="space-y-4">
                {tasksWithComments.length > 0 ? (
                    tasksWithComments.map((task, idx) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            className="bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
                        >
                            {/* Task Header - Click to Expand */}
                            <div
                                onClick={() => toggleExpand(task.id)}
                                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors group"
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityDot(task.priority)}`} />
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                                            {task.title}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getStatusStyle(task.status)}`}>
                                                {task.status.replace('_', ' ')}
                                            </span>
                                            {task.assigned_to_name && (
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    → {task.assigned_to_name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                                        <MessageSquare size={11} />
                                        {task.comments.length}
                                    </span>
                                    {expandedTaskId === task.id ? (
                                        <ChevronUp size={16} className="text-slate-400" />
                                    ) : (
                                        <ChevronDown size={16} className="text-slate-400" />
                                    )}
                                </div>
                            </div>

                            {/* Expanded Thread */}
                            <AnimatePresence>
                                {expandedTaskId === task.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-5 border-t border-slate-100">
                                            {/* Threaded Comments */}
                                            <ThreadedComments
                                                rawComments={task.comments}
                                                onPostComment={(parentId, text) => {
                                                    handlePostComment(task.id, parentId, text);
                                                }}
                                            />

                                            {/* Root-level new comment input */}
                                            <div className="mt-4 flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newCommentText[task.id] || ''}
                                                    onChange={(e) => setNewCommentText(prev => ({ ...prev, [task.id]: e.target.value }))}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleRootComment(task.id)}
                                                    placeholder="Add a new comment..."
                                                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/30 transition-all"
                                                />
                                                <button
                                                    onClick={() => handleRootComment(task.id)}
                                                    disabled={!newCommentText[task.id]?.trim() || addCommentMutation.isPending}
                                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                                                >
                                                    <Send size={12} />
                                                    Send
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))
                ) : null}

                {/* Tasks without comments - collapsed section */}
                {tasksWithoutComments.length > 0 && (
                    <div className="mt-6">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
                            Missions Without Comms ({tasksWithoutComments.length})
                        </p>
                        <div className="space-y-2">
                            {tasksWithoutComments.map(task => (
                                <div
                                    key={task.id}
                                    onClick={() => toggleExpand(task.id)}
                                    className="bg-white border border-slate-200/60 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors group"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getPriorityDot(task.priority)}`} />
                                        <span className="text-sm text-slate-600 group-hover:text-indigo-600 transition-colors truncate">{task.title}</span>
                                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border flex-shrink-0 ${getStatusStyle(task.status)}`}>
                                            {task.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    {expandedTaskId === task.id ? (
                                        <ChevronUp size={14} className="text-slate-400 flex-shrink-0" />
                                    ) : (
                                        <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
                                    )}

                                    {/* Inline expand for starting new conversations */}
                                </div>
                            ))}

                            <AnimatePresence>
                                {tasksWithoutComments.find(t => t.id === expandedTaskId) && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="bg-white border border-slate-200/60 rounded-xl p-5 -mt-1"
                                    >
                                        <p className="text-xs text-slate-400 mb-3">Start the conversation for this mission:</p>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newCommentText[expandedTaskId] || ''}
                                                onChange={(e) => setNewCommentText(prev => ({ ...prev, [expandedTaskId]: e.target.value }))}
                                                onKeyDown={(e) => e.key === 'Enter' && handleRootComment(expandedTaskId)}
                                                placeholder="Write the first update..."
                                                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/30 transition-all"
                                            />
                                            <button
                                                onClick={() => handleRootComment(expandedTaskId)}
                                                disabled={!newCommentText[expandedTaskId]?.trim() || addCommentMutation.isPending}
                                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                                            >
                                                <Send size={12} />
                                                Send
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {/* Empty state if no tasks at all */}
                {availableTasks.length === 0 && (
                    <div className="p-16 text-center bg-white border border-dashed border-slate-200 rounded-xl">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4">
                            <Activity size={24} />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-1">No recorded signals</h3>
                        <p className="text-xs text-slate-500">Team communications on active missions will stream here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagerCommunications;
