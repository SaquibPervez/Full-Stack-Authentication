// ══════════════════════════════════════════════════
// Enhanced Global Error Handler
// Works with ApiError class for structured errors.
// Falls back to 500 for unknown errors.
// ══════════════════════════════════════════════════

import { ApiError } from '../shared/ApiError.js';
import { Prisma } from '@prisma/client';

export const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.name}: ${err.message}`);

  if (res.headersSent) {
    return next(err);
  }

  // ─── Known ApiError ───
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors.length > 0 ? err.errors : undefined,
    });
  }

  // ─── Prisma Known Request Error ───
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Unique constraint violation
    if (err.code === 'P2002') {
      const field = err.meta?.target?.join(', ') || 'field';
      return res.status(409).json({
        success: false,
        message: `Duplicate value: ${field} already exists`,
      });
    }

    // P2025: Record not found
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
      });
    }

    // P2003: Foreign key constraint failed
    if (err.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Related record not found',
      });
    }
  }

  // ─── Prisma Validation Error ───
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      message: 'Database validation failed. Check your request data.',
    });
  }

  // ─── JWT Errors ───
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
    });
  }

  // ─── Unknown / Default Error ───
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
