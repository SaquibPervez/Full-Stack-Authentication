// ══════════════════════════════════════════════════
// Comment Routes (New — Prisma-backed)
// ══════════════════════════════════════════════════

import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.js';
import { addComment, getComments } from './comment.controller.js';
import { addCommentSchema, getCommentsSchema } from './comment.validation.js';

const router = express.Router();

router.post('/:taskId/comments', authenticate, validate(addCommentSchema), addComment);
router.get('/:taskId/comments', authenticate, validate(getCommentsSchema), getComments);

export default router;
