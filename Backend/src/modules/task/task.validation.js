// ══════════════════════════════════════════════════
// Task Validation — Zod Schemas
// Replaces inline if-checks with declarative schemas.
// ══════════════════════════════════════════════════

import { z } from 'zod';

/**
 * POST /api/tasks/create
 */
export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
    description: z.string().optional().default(''),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    dueDate: z.string().optional().nullable(),
    assignedToId: z.union([z.number().int().positive(), z.string().regex(/^\d+$/).transform(Number)]).optional().nullable(),
    // Legacy field name support (frontend sends assigned_to)
    assigned_to: z.union([z.number().int().positive(), z.string().regex(/^\d+$/).transform(Number)]).optional().nullable(),
    due_date: z.string().optional().nullable(),
  }).transform((data) => ({
    title: data.title,
    description: data.description,
    priority: data.priority,
    dueDate: data.dueDate || data.due_date || null,
    assignedToId: data.assignedToId || data.assigned_to || null,
  })),
});

/**
 * PUT /api/tasks/edit/:id
 */
export const editTaskSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid task ID').transform(Number),
  }),
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    status: z.enum(['pending', 'in_progress', 'completed']).optional(),
    dueDate: z.string().optional().nullable(),
    assignedToId: z.union([z.number().int().positive(), z.string().regex(/^\d+$/).transform(Number)]).optional().nullable(),
    // Legacy support
    assigned_to: z.union([z.number().int().positive(), z.string().regex(/^\d+$/).transform(Number)]).optional().nullable(),
    due_date: z.string().optional().nullable(),
  }).transform((data) => ({
    title: data.title,
    description: data.description,
    priority: data.priority,
    status: data.status,
    dueDate: data.dueDate || data.due_date,
    assignedToId: data.assignedToId || data.assigned_to,
  })),
});

/**
 * PATCH /api/tasks/status/:id
 */
export const updateStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid task ID').transform(Number),
  }),
  body: z.object({
    status: z.enum(['pending', 'in_progress', 'completed'], {
      required_error: 'Status is required',
      invalid_type_error: 'Invalid status value',
    }),
  }),
});

/**
 * DELETE /api/tasks/delete/:id
 */
export const deleteTaskSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid task ID').transform(Number),
  }),
});

/**
 * GET /api/tasks/task-details?status=pending&priority=high&sortBy=createdAt
 */
export const taskFilterSchema = z.object({
  query: z.object({
    status: z.enum(['pending', 'in_progress', 'completed']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    sortBy: z.enum(['dueDate', 'createdAt', 'priority', 'status']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }).optional().default({}),
});
