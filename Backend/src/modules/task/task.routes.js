// ══════════════════════════════════════════════════
// Task Routes (New — Prisma-backed)
// Uses Zod validation middleware before controller.
// ══════════════════════════════════════════════════

import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.js';
import {
  createTask,
  editTask,
  updateTaskStatus,
  deleteTask,
  getFullTaskDetails,
} from './task.controller.js';
import {
  createTaskSchema,
  editTaskSchema,
  updateStatusSchema,
  deleteTaskSchema,
  taskFilterSchema,
} from './task.validation.js';

const router = express.Router();

// ─── Task CRUD ───
router.post('/create', authenticate, validate(createTaskSchema), createTask);
router.put('/edit/:id', authenticate, validate(editTaskSchema), editTask);
router.patch('/status/:id', authenticate, validate(updateStatusSchema), updateTaskStatus);
router.delete('/delete/:id', authenticate, validate(deleteTaskSchema), deleteTask);

// ─── Task Queries ───
router.get('/task-details', authenticate, validate(taskFilterSchema), getFullTaskDetails);

export default router;
