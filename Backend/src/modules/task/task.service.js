// ══════════════════════════════════════════════════
// Task Service — Business Logic Layer
// All rules, calculations, and orchestration live here.
// Controllers call services. Services call repositories.
// ══════════════════════════════════════════════════

import taskRepository from './task.repository.js';
import { ApiError } from '../../shared/ApiError.js';
import { VALID_STATUS_TRANSITIONS } from '../../shared/constants.js';

class TaskService {
  /**
   * Create a new task.
   * Business rules:
   *  - Title is mandatory
   *  - Default priority is 'medium'
   * Socket.io integration point: emit 'task:assigned' event
   */
  async createTask(data, creatorId) {
    if (!data.title?.trim()) {
      throw ApiError.badRequest('Task title is required');
    }

    const taskData = {
      title: data.title.trim(),
      description: data.description || null,
      priority: data.priority || 'medium',
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      createdById: creatorId,
      assignedToId: data.assignedToId || null,
    };

    const task = await taskRepository.create(taskData);

    // 🔌 Socket.io hook point:
    // if (data.assignedToId) {
    //   io.to(`user:${data.assignedToId}`).emit('task:assigned', task);
    // }

    return task;
  }

  /**
   * Update task status with lifecycle validation.
   * Enforces valid transitions:
   *   pending → in_progress
   *   in_progress → completed | pending
   *   completed → pending (re-open)
   */
  async updateStatus(taskId, newStatus) {
    const task = await taskRepository.findById(taskId);
    if (!task) throw ApiError.notFound('Task not found');

    const allowedNextStates = VALID_STATUS_TRANSITIONS[task.status];
    if (!allowedNextStates?.includes(newStatus)) {
      throw ApiError.badRequest(
        `Cannot transition from "${task.status}" to "${newStatus}". Allowed: [${allowedNextStates?.join(', ') || 'none'}]`
      );
    }

    const updated = await taskRepository.update(taskId, { status: newStatus });

    // 🔌 Socket.io hook point:
    // io.to(`task:${taskId}`).emit('task:statusChanged', { taskId, status: newStatus });

    return updated;
  }

  /**
   * Get full task details by ID
   */
  async getTaskById(taskId) {
    const task = await taskRepository.findById(taskId);
    if (!task) throw ApiError.notFound('Task not found');
    return task;
  }

  /**
   * Get all tasks with optional filters
   * Used by: Admin task list, Manager mission board
   */
  async getAllTasks(filters = {}) {
    return taskRepository.findAll(filters);
  }

  /**
   * Get tasks assigned to a specific employee
   * Used by: Employee dashboard
   */
  async getTasksByAssignee(userId, filters = {}) {
    return taskRepository.findByAssignee(userId, filters);
  }

  /**
   * Edit/update an existing task
   */
  async editTask(taskId, data) {
    const existing = await taskRepository.findById(taskId);
    if (!existing) throw ApiError.notFound('Task not found');

    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId;
    if (data.status !== undefined) updateData.status = data.status;

    return taskRepository.update(taskId, updateData);
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId) {
    const existing = await taskRepository.findById(taskId);
    if (!existing) throw ApiError.notFound('Task not found');
    return taskRepository.delete(taskId);
  }

  /**
   * Get task status distribution (for charts/dashboards)
   * Returns: [{ status: 'pending', _count: { status: 5 } }, ...]
   */
  async getStatusDistribution(createdById = null) {
    const groups = await taskRepository.countByStatus(createdById);
    // Transform to a simpler format: { pending: 5, in_progress: 3, completed: 2 }
    const distribution = {};
    groups.forEach((g) => {
      distribution[g.status] = g._count.status;
    });
    return distribution;
  }

  /**
   * Get employee-specific task stats
   */
  async getEmployeeTaskStats(userId) {
    const groups = await taskRepository.countByAssigneeStatus(userId);
    const stats = { pending: 0, in_progress: 0, completed: 0, total: 0 };
    groups.forEach((g) => {
      stats[g.status] = g._count.status;
      stats.total += g._count.status;
    });
    return stats;
  }
}

export default new TaskService();
