import { X } from "lucide-react";
import React from "react";

function EditTaskModal() {
  return (
    <section>
      <div className="fixed inset-0 bg-white/10 backdrop-blur-2xl flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Edit Task</h2>
            <button type="button">
              <X />
            </button>
          </div>

          <form className="space-y-4">
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
                <option key={employee.id} value={employee.id}>
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
      </div>
    </section>
  );
}

export default EditTaskModal;
