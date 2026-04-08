// ══════════════════════════════════════════════════
// Role-Based Access Control (RBAC) Middleware
// Replaces: middleware/roleMiddleware.js
//
// Usage: authorize('admin', 'manager')
// ══════════════════════════════════════════════════

import { ApiError } from '../shared/ApiError.js';

export const authorize = (...allowedRoles) => (req, res, next) => {
  const userRole = req.user?.role;

  if (!userRole) {
    throw ApiError.forbidden('Access Denied: No Role Found');
  }

  if (!allowedRoles.includes(userRole)) {
    throw ApiError.forbidden('Access Denied: Insufficient Permissions');
  }

  next();
};
