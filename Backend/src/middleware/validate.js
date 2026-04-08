// ══════════════════════════════════════════════════
// Zod Validation Middleware
// Replaces: middleware/validate.js (Joi-based)
//
// Usage in routes:
//   import { validate } from '../middleware/validate.js';
//   import { createTaskSchema } from './task.validation.js';
//   router.post('/create', validate(createTaskSchema), createTask);
// ══════════════════════════════════════════════════

import { ApiError } from '../shared/ApiError.js';

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    throw ApiError.badRequest('Validation failed', errors);
  }

  // Overwrite with parsed + coerced values (Zod may transform types)
  if (result.data.body) req.body = result.data.body;
  if (result.data.query) {
    // req.query is often a getter in recent Express/Node versions, 
    // we must modify its contents rather than replacing the object.
    Object.keys(req.query).forEach(key => delete req.query[key]);
    Object.assign(req.query, result.data.query);
  }
  if (result.data.params) {
    Object.keys(req.params).forEach(key => delete req.params[key]);
    Object.assign(req.params, result.data.params);
  }

  next();
};
