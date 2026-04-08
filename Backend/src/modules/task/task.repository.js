// ══════════════════════════════════════════════════
// Task Repository — Data Access Layer
// ONLY Prisma queries live here. Zero business logic.
// ══════════════════════════════════════════════════

import prisma from '../../config/prisma.js';

class TaskRepository {
  /**
   * Create a new task with creator & assignee relations
   */
  async create(data) {
    return prisma.task.create({
      data,
      include: {
        createdBy: { select: { id: true, username: true, email: true } },
        assignedTo: { select: { id: true, username: true, designation: true, email: true } },
      },
    });
  }

  /**
   * Find a single task by ID with full details (comments, users)
   */
  async findById(id) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, username: true, email: true } },
        assignedTo: { select: { id: true, username: true, designation: true, email: true } },
        comments: {
          include: {
            user: { select: { id: true, username: true, role: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  /**
   * Find all tasks with dynamic filters, sorting, and full relations
   */
  async findAll(filters = {}) {
    const { status, priority, assignedToId, createdById, sortBy = 'createdAt', sortOrder = 'desc' } = filters;

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = parseInt(assignedToId);
    if (createdById) where.createdById = parseInt(createdById);

    return prisma.task.findMany({
      where,
      include: {
        createdBy: { select: { id: true, username: true, email: true } },
        assignedTo: { select: { id: true, username: true, designation: true, email: true } },
        comments: {
          include: {
            user: { select: { id: true, username: true, role: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { [sortBy]: sortOrder },
    });
  }

  /**
   * Find tasks assigned to a specific user
   */
  async findByAssignee(userId, filters = {}) {
    const { status, priority, sortBy = 'createdAt', sortOrder = 'desc' } = filters;

    const where = { assignedToId: userId };
    if (status) where.status = status;
    if (priority) where.priority = priority;

    return prisma.task.findMany({
      where,
      include: {
        createdBy: { select: { id: true, username: true, email: true } },
        assignedTo: { select: { id: true, username: true, designation: true, email: true } },
        comments: {
          include: {
            user: { select: { id: true, username: true, role: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { [sortBy]: sortOrder },
    });
  }

  /**
   * Update a task by ID
   */
  async update(id, data) {
    return prisma.task.update({
      where: { id },
      data,
      include: {
        createdBy: { select: { id: true, username: true, email: true } },
        assignedTo: { select: { id: true, username: true, designation: true, email: true } },
      },
    });
  }

  /**
   * Delete a task by ID
   */
  async delete(id) {
    return prisma.task.delete({ where: { id } });
  }

  /**
   * Count tasks grouped by status (for dashboard charts)
   */
  async countByStatus(createdById = null) {
    const where = createdById ? { createdById } : {};
    return prisma.task.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
    });
  }

  /**
   * Count tasks assigned to a specific user by status
   */
  async countByAssigneeStatus(userId) {
    return prisma.task.groupBy({
      by: ['status'],
      where: { assignedToId: userId },
      _count: { status: true },
    });
  }

  /**
   * Get total count of tasks
   */
  async totalCount(where = {}) {
    return prisma.task.count({ where });
  }
}

export default new TaskRepository();
