// ══════════════════════════════════════════════════
// Task Controller — Thin HTTP Layer
// ONLY extracts request data and calls the service.
// No SQL. No business logic. No try/catch.
// ══════════════════════════════════════════════════

import taskService from './task.service.js';
import { ApiResponse } from '../../shared/ApiResponse.js';
import { catchAsync } from '../../shared/catchAsync.js';

/**
 * POST /api/tasks/create
 * Creates a new task. Creator ID comes from JWT.
 */
export const createTask = catchAsync(async (req, res) => {
  const task = await taskService.createTask(req.body, req.user.id);
  ApiResponse.created(res, task, 'Task created successfully');
});

/**
 * PUT /api/tasks/edit/:id
 * Updates an existing task's fields.
 */
export const editTask = catchAsync(async (req, res) => {
  const task = await taskService.editTask(req.params.id, req.body);
  ApiResponse.success(res, task, 'Task updated successfully');
});

/**
 * PATCH /api/tasks/status/:id
 * Updates only the status with transition validation.
 */
export const updateTaskStatus = catchAsync(async (req, res) => {
  const task = await taskService.updateStatus(req.params.id, req.body.status);
  ApiResponse.success(res, task, 'Task status updated');
});

/**
 * DELETE /api/tasks/delete/:id
 * Deletes a task by ID.
 */
export const deleteTask = catchAsync(async (req, res) => {
  await taskService.deleteTask(req.params.id);
  ApiResponse.success(res, null, 'Task deleted successfully');
});

/**
 * GET /api/tasks/task-details
 * Gets all tasks with optional filters (status, priority, sorting).
 */
export const getFullTaskDetails = catchAsync(async (req, res) => {
  const tasks = await taskService.getAllTasks(req.query);
  ApiResponse.success(res, tasks);
});
