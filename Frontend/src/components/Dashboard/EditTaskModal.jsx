import { X } from "lucide-react";
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../apis/axios";
import toast from "react-hot-toast";

function EditTaskModal({onClose, task, employees }) {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    priority: task?.priority || "",
    due_date: task?.due_date ? new Date(task.due_date).toISOString().split("T")[0] : "",
    assigned_to: employees?.find(emp => emp.username === task?.assigned_to_name)?.id || "",
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
      toast.success("Task updated successfully");
      queryClient.invalidateQueries(['adminTaskDetails']);
      onClose(); 
    },
    onError: (error) => {
      console.error("Error updating task:", error);
      toast("Failed to update task");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };
// if (!task) return null;

  return (
    <section>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Edit Task</h2>
            <button onClick={onClose} className="hover:bg-gray-100 p-1 rounded-full">
              <X />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="title"
              placeholder="Task Title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border outline-none focus:border-blue-500 rounded-xl p-2.5"
              required
            />

            <textarea
              name="description"
              placeholder="Task Description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full border outline-none focus:border-blue-500 rounded-xl p-2.5"
              required
            />

            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full border outline-none focus:border-blue-500 rounded-xl p-2.5"
              required
            >
              <option value="">Select Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="w-full border outline-none focus:border-blue-500 rounded-xl p-2.5"
              required
            />

            {/* Agar employee list available ho to ise use karein */}
            <select
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
              className="w-full border rounded-xl p-2.5"
              required
            >
              <option value="">Select Assignee</option>
              {employees?.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.username || employee.name}
                </option>
              ))}
            </select>

            {/* status */}
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border outline-none focus:border-blue-500 rounded-xl p-2.5"
              required
            >
              <option value="">Select Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <button 
              type="submit"
              disabled={updateMutation.isPending}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-60 flex justify-center items-center"
            >
              {updateMutation.isPending ? "Updating..." : "Update Task"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default EditTaskModal;