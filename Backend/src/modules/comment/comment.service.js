// ══════════════════════════════════════════════════
// Comment Service — Business Logic Layer
// Handles the Reddit-style tree building that was
// previously embedded in hrmsController.js
// ══════════════════════════════════════════════════

import commentRepository from './comment.repository.js';
import { ApiError } from '../../shared/ApiError.js';

class CommentService {
  /**
   * Add a comment (top-level or threaded reply).
   * If parentId is provided, validates the parent exists.
   */
  async addComment(taskId, userId, content, parentId = null) {
    if (!content?.trim()) {
      throw ApiError.badRequest('Comment content is required');
    }

    // Validate parent exists if this is a reply
    if (parentId) {
      const parent = await commentRepository.findById(parentId);
      if (!parent) throw ApiError.notFound('Parent comment not found');
      if (parent.taskId !== taskId) {
        throw ApiError.badRequest('Parent comment belongs to a different task');
      }
    }

    const comment = await commentRepository.create({
      taskId,
      userId,
      content: content.trim(),
      parentId: parentId || null,
    });

    // 🔌 Socket.io hook point:
    // io.to(`task:${taskId}`).emit('comment:new', comment);

    return comment;
  }

  /**
   * Get all comments for a task, structured as a threaded tree.
   * This is the Reddit-style recursive nesting logic that was
   * previously inside hrmsController.getTaskComments().
   *
   * Input:  Flat list of comments with parentId
   * Output: Nested tree with `replies: []` arrays
   */
  async getThreadedComments(taskId) {
    const flatComments = await commentRepository.findByTaskId(taskId);
    return this.#buildTree(flatComments);
  }

  /**
   * Private helper: Builds a comment tree from a flat list.
   * Uses a hashmap-based algorithm (O(n) time complexity).
   *
   * Migrated from: hrmsController.js lines 60-77
   */
  #buildTree(comments) {
    const commentMap = {};
    const tree = [];

    // First pass: Create a lookup map of all comments
    comments.forEach((comment) => {
      commentMap[comment.id] = {
        id: comment.id,
        text: comment.content,
        timestamp: comment.createdAt,
        username: comment.user?.username,
        user_id: comment.userId,
        parent_id: comment.parentId,
        role: comment.user?.role,
        replies: [],
      };
    });

    // Second pass: Build parent-child relationships
    comments.forEach((comment) => {
      if (comment.parentId && commentMap[comment.parentId]) {
        commentMap[comment.parentId].replies.push(commentMap[comment.id]);
      } else {
        tree.push(commentMap[comment.id]);
      }
    });

    return tree;
  }
}

export default new CommentService();
