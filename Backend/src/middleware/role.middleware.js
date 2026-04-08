import { ApiError } from '../shared/ApiError.js';

export const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    throw ApiError.forbidden('Insufficient permissions');
  }
  next();
};
