import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * errorMiddleware — Global Express error handler.
 *
 * Must be registered LAST in app.js (after all routes).
 * Normalises all error types into the standard API error envelope:
 *   { success, error, message, details? }
 *
 * Handled cases:
 *   - ApiError (operational — known, expected errors)
 *   - Mongoose ValidationError
 *   - Mongoose CastError   (invalid ObjectId)
 *   - Mongoose duplicate key (code 11000)
 *   - JWT errors (handled upstream in auth middleware, but caught here as fallback)
 *   - Unhandled programmer errors (500)
 */
const errorMiddleware = (err, req, res, next) => {
  // ── 1. Normalise error into an ApiError ────────────────────────────────────

  let error = err;

  /** Mongoose document validation failure */
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = ApiError.validationError(errors);
  } else if (err instanceof mongoose.Error.CastError) {

    /** Mongoose invalid ObjectId (e.g. /residents/not-an-id) */
    error = ApiError.badRequest(`Invalid value for field '${err.path}'`);
  } else if (err.code === 11000) {

    /** MongoDB duplicate key (unique constraint) */
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'field';
    error = ApiError.conflict(`A record with this ${field} already exists`);
  } else if (!(err instanceof ApiError)) {

    /** Fallback: treat unknown errors as internal server errors */
    error = ApiError.internal(
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
    );
  }

  // ── 2. Log programmer errors (non-operational) ─────────────────────────────
  if (!error.isOperational || error.statusCode === 500) {
    logger.error('[UNHANDLED ERROR]', err);
    console.error('[UNHANDLED ERROR]', err);
  }

  // ── 3. Send standardised response ──────────────────────────────────────────
  const body = {
    success: false,
    error: error.errorCode,
    message: error.message,
  };

  if (error.errors?.length) {
    body.details = error.errors;
  }

  // Avoid "Cannot set headers after they are sent"
  if (res.headersSent) return next(err);

  return res.status(error.statusCode).json(body);
};

export default errorMiddleware;
