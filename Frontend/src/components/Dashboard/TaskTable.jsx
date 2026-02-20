import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../apis/axios';
import { Clock, CheckCircle2, Edit, Trash2 } from 'lucide-react';
import EditTaskModal from './EditTaskModal';

const TaskTable = ({ employees = [] }) => {
    const [editingTask, setEditingTask] = useState(null);

    // 1. Fetch Data
    const { data: tasks, isLoading, error } = useQuery({
        queryKey: ['adminTaskDetails'],
        queryFn: async () => {
            const res = await api.get('/tasks/task-details');
            return res.data;
        }
    });
    console.log(tasks);

    if (isLoading) return <div className="p-5 text-gray-500">Loading Tasks...</div>;
    if (error) return <div className="p-5 text-red-500">Failed to load tasks</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">All Company Tasks</h2>
                <p className="text-sm text-gray-500">Monitor task progress and assignments.</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                            <th className="p-4 font-semibold">Task Title</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold">Assigned To</th>
                            <th className="p-4 font-semibold">Created By</th>
                            <th className="p-4 font-semibold">Priority</th>
                            <th className="p-4 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {tasks?.map((task) => (
                            <tr key={task.id} className="hover:bg-gray-50 transition">
                                
                                {/* 1. Task Title */}
                                <td className="p-4">
                                    <div className="font-medium text-gray-800">{task.title}</div>
                                    <div className="text-xs text-gray-400">Due: {new Date(task.due_date).toLocaleDateString()}</div>
                                </td>

                                {/* 2. Status Badge */}
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex w-fit items-center gap-1
                                        ${task.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 
                                          'bg-yellow-100 text-yellow-700'}`}>
                                        {task.status === 'completed' ? <CheckCircle2 size={12}/> : <Clock size={12}/>}
                                        {task.status.replace('_', ' ')}
                                    </span>
                                </td>

                                {/* 3. Assigned To */}
                                <td className="p-4">
                                    {task.assigned_to_name ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                {task.assigned_to_name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-700">{task.assigned_to_name}</div>
                                                <div className="text-xs text-gray-500">{task.assigned_to_designation || 'Employee'}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 text-sm italic">Unassigned</span>
                                    )}
                                </td>

                                {/* 4. Created By */}
                                <td className="p-4">
                                    <div className="text-sm text-gray-600">{task.created_by_name}</div>
                                </td>

                                {/* 5. Priority */}
                                <td className="p-4">
                                    <span className={`text-xs font-bold uppercase 
                                        ${task.priority === 'high' ? 'text-red-500' : 
                                          task.priority === 'medium' ? 'text-orange-500' : 'text-gray-500'}`}>
                                        {task.priority}
                                    </span>
                                </td>

                                {/* 6. Actions */}
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        {/* Yahan click karne se editingTask set ho jayega */}
                                        <button onClick={() => setEditingTask(task)} className="text-blue-500 hover:text-blue-700 cursor-pointer">
                                            <Edit size={16} />
                                        </button>
                                        <button className="text-red-500 hover:text-red-700 cursor-pointer">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editingTask && (
                <EditTaskModal 
                    isOpen={!!editingTask} 
                    onClose={() => setEditingTask(null)} 
                    task={editingTask} 
                    employees={employees}
                />
            )}
        </div>
    );
};

export default TaskTable;