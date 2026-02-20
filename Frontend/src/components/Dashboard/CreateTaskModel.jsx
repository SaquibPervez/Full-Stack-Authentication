import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../apis/axios";

function CreateTaskModel({ onClose, employees = [] }) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "",
    due_date: "",
    assigned_to: "",
    created_by: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const createMutation = useMutation({
    mutationFn: async (taskData) => {
      const { data } = await api.post("/tasks/create", taskData);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Task created successfully");

      // Refresh relevant details after creating a task
      queryClient.invalidateQueries(["adminTaskDetails"]);
      queryClient.invalidateQueries(["managerStats"]);

      onClose();  
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to create task");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <section className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-gray-900">Create New Task</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Task Title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border rounded-xl p-2.5"
            required
          />

          <textarea
            name="description"
            placeholder="Task Description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full border rounded-xl p-2.5"
            required
          />

          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full border rounded-xl p-2.5"
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
            min={new Date().toISOString().split("T")[0]}
            className="w-full border rounded-xl p-2.5"
            required
          />

          <select
            name="assigned_to"
            value={formData.assigned_to}
            onChange={handleChange}
            className="w-full border rounded-xl p-2.5"
            required
          >
            <option value="">Select Assignee</option>
            {employees.map((employee) => (
              <option
                key={employee.id} // unique key
                value={employee.id} // **send numeric/string ID, not name**
              >
                {employee.username}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-60"
          >
            {createMutation.isPending ? "Creating..." : "Create Task"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default CreateTaskModel;
