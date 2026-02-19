import React from 'react';
import { User, Mail, Calendar, Briefcase, Trash2 } from 'lucide-react';
import api from '../../apis/axios';
import toast from 'react-hot-toast';
import { useMutation,useQueryClient } from '@tanstack/react-query';

const EmployeeTable = ({ employees }) => {
  const queryClient = useQueryClient()

const deleteMutation = useMutation({
    mutationFn: async (employeeId) => {
        const { data } = await api.post(`/admin/delete-user/${employeeId}`)
        return data
    },
    onSuccess: (data) => {
        toast.success(data.message || "Employee deleted successfully")

        // 🔥 This refetches employees automatically
        queryClient.invalidateQueries(['adminStats'])
    },
    onError: (error) => {
        toast.error(
            error?.response?.data?.message ??
            error?.response?.data?.error ??
            "Failed to delete employee"
        )
    }
})
const handleDelete = (employeeId) => {
    deleteMutation.mutate(employeeId)
}
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Team Members</h2>
                    <p className="text-sm text-gray-500">Active employees and their roles.</p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {employees?.length || 0} Members
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                            <th className="p-4 font-semibold">Employee</th>
                            <th className="p-4 font-semibold">Role / Designation</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold">Joined Date</th>
                            <th className="p-4 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {employees && employees.length > 0 ? (
                            employees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-gray-50 transition duration-150">
                                    
                                    {/* 1. Name & Email */}
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {/* Avatar with Initials */}
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                                {(emp.username?.charAt(0)?.toUpperCase() || emp.name?.charAt(0)?.toUpperCase() || '?')}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-800">{emp.username || emp.name || 'Unknown'}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Mail size={10} /> {emp.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* 2. Designation */}
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Briefcase size={14} className="text-gray-400" />
                                            <span className="bg-gray-100 text-gray-700 border border-gray-200 px-2 py-1 rounded text-xs font-medium">
                                                {emp.designation || emp.role || 'Not Assigned'}
                                            </span>
                                        </div>
                                    </td>

                                    {/* 3. Active Status */}
                                    <td className="p-4">
                                        {(emp.is_active ?? (emp.status === 'Active')) ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-200">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium border border-red-200">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                Inactive
                                            </span>
                                        )}
                                    </td>

                                    {/* 4. Joined Date */}
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                                            <Calendar size={14} />
                                            {emp.created_at 
                                                ? new Date(emp.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                  })
                                                : '—'}
                                        </div>
                                    </td>

                                    {/* 5. Actions */}
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => handleDelete(emp.id)}
                                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="p-6 text-center text-gray-400">
                                    No employees found.
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
