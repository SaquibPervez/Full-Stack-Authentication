// ══════════════════════════════════════════════════
// Comment Validation — Zod Schemas
// ══════════════════════════════════════════════════

import { z } from 'zod';

export const addCommentSchema = z.object({
  params: z.object({
    taskId: z.string().regex(/^\d+$/, 'Invalid task ID').transform(Number),
  }),
  body: z.object({
    content: z.string().min(1, 'Comment content is required').max(5000),
    parent_id: z.number().int().positive().optional().nullable(),
  }),
});

export const getCommentsSchema = z.object({
  params: z.object({
    taskId: z.string().regex(/^\d+$/, 'Invalid task ID').transform(Number),
  }),
});
