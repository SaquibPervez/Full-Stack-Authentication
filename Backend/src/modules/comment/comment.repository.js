// ══════════════════════════════════════════════════
// Comment Repository — Data Access Layer
// Handles all Prisma queries for task_comments.
// ══════════════════════════════════════════════════

import prisma from '../../config/prisma.js';

class CommentRepository {
  /**
   * Create a new comment (top-level or reply)
   */
  async create(data) {
    return prisma.taskComment.create({
      data,
      include: {
        user: { select: { id: true, username: true, role: true } },
      },
    });
  }

  /**
   * Find all comments for a specific task (flat list with parent_id)
   * Tree building is done in the Service layer.
   */
  async findByTaskId(taskId) {
    return prisma.taskComment.findMany({
      where: { taskId },
      include: {
        user: { select: { id: true, username: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Find a comment by ID
   */
  async findById(id) {
    return prisma.taskComment.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, role: true } },
      },
    });
  }

  /**
   * Delete a comment by ID (CASCADE deletes child replies via Prisma relation)
   */
  async delete(id) {
    return prisma.taskComment.delete({ where: { id } });
  }
}

export default new CommentRepository();
