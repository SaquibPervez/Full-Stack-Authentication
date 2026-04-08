// ══════════════════════════════════════════════════
// Comment Controller — Thin HTTP Layer
// ══════════════════════════════════════════════════

import commentService from './comment.service.js';
import { ApiResponse } from '../../shared/ApiResponse.js';
import { catchAsync } from '../../shared/catchAsync.js';

/**
 * POST /api/tasks/:taskId/comments
 * Add a new comment (or threaded reply) to a task.
 */
export const addComment = catchAsync(async (req, res) => {
  const taskId = parseInt(req.params.taskId);
  const { content, parent_id } = req.body;
  const userId = req.user.id;

  const comment = await commentService.addComment(taskId, userId, content, parent_id || null);
  ApiResponse.created(res, comment, 'Comment added');
});

/**
 * GET /api/tasks/:taskId/comments
 * Get all comments for a task as a threaded tree.
 */
export const getComments = catchAsync(async (req, res) => {
  const taskId = parseInt(req.params.taskId);
  const comments = await commentService.getThreadedComments(taskId);
  ApiResponse.success(res, comments);
});
