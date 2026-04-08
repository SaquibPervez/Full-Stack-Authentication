// ══════════════════════════════════════════════════
// ApiError — Custom Error Class
// Provides factory methods for common HTTP errors.
// Works with the global errorHandler middleware.
// ══════════════════════════════════════════════════

export class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.name = 'ApiError';

    // Capture clean stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  // ─── Factory Methods ───
  static badRequest(msg = 'Bad Request', errors = []) {
    return new ApiError(400, msg, errors);
  }

  static unauthorized(msg = 'Unauthorized') {
    return new ApiError(401, msg);
  }

  static forbidden(msg = 'Forbidden') {
    return new ApiError(403, msg);
  }

  static notFound(msg = 'Resource not found') {
    return new ApiError(404, msg);
  }

  static conflict(msg = 'Conflict') {
    return new ApiError(409, msg);
  }

  static internal(msg = 'Internal Server Error') {
    return new ApiError(500, msg);
  }
}
