/**
 * ApiError — Standardized operational error class.
 * All thrown errors in controllers/services should use this class.
 *
 * Usage:
 *   throw new ApiError(404, 'Resident not found');
 *   throw new ApiError(422, 'Validation failed', errors);
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message    - Human-readable message
   * @param {Array}  errors     - Field-level error details (e.g. from Joi)
   * @param {string} errorCode  - Machine-readable error code (e.g. 'VALIDATION_ERROR')
   */

  constructor(
    statusCode,
    message = 'Something went wrong',
    errors = [],
    errorCode = null,
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.errorCode = errorCode ?? ApiError.defaultCode(statusCode);
    this.isOperational = true; // Distinguish from programmer errors

    // Capture stack trace (V8-specific, no-op elsewhere)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /** Map common HTTP codes to a default error code string */
  static defaultCode(status) {
    const map = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      429: 'RATE_LIMIT_EXCEEDED',
      500: 'INTERNAL_SERVER_ERROR',
    };
    return map[status] ?? 'API_ERROR';
  }

  /** Convenience factories */
  static badRequest(message, errors) {
    return new ApiError(400, message, errors);
  }
  static unauthorized(message) {
    return new ApiError(401, message ?? 'Unauthorized');
  }
  static forbidden(message) {
    return new ApiError(403, message ?? 'Forbidden');
  }
  static notFound(resource) {
    return new ApiError(404, `${resource ?? 'Resource'} not found`);
  }
  static conflict(message) {
    return new ApiError(409, message);
  }
  static validationError(errors) {
    return new ApiError(422, 'Validation failed', errors);
  }
  static internal(message) {
    return new ApiError(500, message ?? 'Internal server error');
  }
}

export default ApiError;
