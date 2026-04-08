// ══════════════════════════════════════════════════
// ApiResponse — Standardized Response Builder
// Every API response goes through this utility
// for consistent { success, message, data } format.
// ══════════════════════════════════════════════════

export class ApiResponse {
  /**
   * 200 OK — Standard success response
   */
  static success(res, data = null, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * 201 Created — Resource created
   */
  static created(res, data = null, message = 'Created successfully') {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * 204 No Content — Deleted or no body needed
   */
  static noContent(res) {
    return res.status(204).end();
  }

  /**
   * Custom — For paginated or custom responses
   */
  static custom(res, statusCode, payload) {
    return res.status(statusCode).json({
      success: true,
      ...payload,
    });
  }
}
