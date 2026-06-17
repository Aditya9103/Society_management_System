import rateLimit from 'express-rate-limit';
import ApiError from '../utils/ApiError.js';

/**
 * Rate limit response handler — returns a standard ApiError envelope
 * instead of the default plain-text response from express-rate-limit.
 */
const rateLimitHandler = (req, res) => {
  const error = new ApiError(429, 'Too many requests, please try again later.');
  res.status(429).json({
    success: false,
    error: error.errorCode,
    message: error.message,
  });
};

/**
 * globalLimiter — Applied to all /api/* routes.
 * 100 requests per IP per 15 minutes.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true, // Return RateLimit-* headers (RFC 6585)
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/**
 * authLimiter — Applied to sensitive auth endpoints (login, OTP, forgot password).
 * 15 requests per IP per 15 minutes to slow brute-force attacks.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/**
 * otpLimiter — Applied to OTP send/resend endpoints.
 * 10 requests per IP per hour.
 */
export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});
