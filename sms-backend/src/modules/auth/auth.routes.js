/**
 * auth.routes.js — Express router for all authentication endpoints.
 *
 * Route convention: /api/v1/auth/<endpoint>
 *
 * Security layers applied per-route:
 *   - authLimiter / otpLimiter — rate limiting for brute-force protection
 *   - validate(schema) — Joi request validation
 *   - authenticate — JWT verification (protected routes only)
 */

import { Router } from 'express';
import * as authController from './auth.controller.js';
import {
    sendOtpSchema,
    verifyOtpSchema,
    loginOtpSchema,
    loginPasswordSchema,
    refreshTokenSchema,
    changePasswordSchema,
    initiateResidentRegistrationSchema,
    verifyResidentRegistrationSchema,
    resetPasswordSchema,
} from './auth.validator.js';
import validate from '../../middleware/validate.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authLimiter, otpLimiter } from '../../middleware/rateLimit.middleware.js';

const router = Router();

// ── Resident Registration ─────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register/resident/initiate
 * Initiate resident registration.
 */
router.post(
    '/register/resident/initiate',
    authLimiter,
    validate(initiateResidentRegistrationSchema),
    authController.initiateResidentRegistration,
);

/**
 * POST /api/v1/auth/register/resident/verify
 * Verify OTP and issue tokens for profile completion.
 */
router.post(
    '/register/resident/verify',
    authLimiter,
    validate(verifyResidentRegistrationSchema),
    authController.verifyResidentRegistration,
);

// ── OTP Endpoints ─────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/otp/send
 * Send an OTP to a phone number.
 * Heavy rate-limit: 10 req/hour (otpLimiter).
 */
router.post(
    '/otp/send',
    otpLimiter,
    validate(sendOtpSchema),
    authController.sendOtp,
);

/**
 * POST /api/v1/auth/otp/verify
 * Verify an OTP without performing a login.
 * Used in multi-step registration flows.
 */
router.post(
    '/otp/verify',
    authLimiter,
    validate(verifyOtpSchema),
    authController.verifyOtp,
);

// ── Login Endpoints ───────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/login/otp
 * Login using phone + OTP. Returns token pair.
 */
router.post(
    '/login/otp',
    authLimiter,
    validate(loginOtpSchema),
    authController.loginWithOtp,
);

/**
 * POST /api/v1/auth/login/password
 * Login using phone/email + password. Returns token pair.
 */
router.post(
    '/login/password',
    authLimiter,
    validate(loginPasswordSchema),
    authController.loginWithPassword,
);

// ── Token Management ──────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/refresh
 * Rotate refresh token → get a new access + refresh token pair.
 * No auth required (refresh token is the credential here).
 */
router.post(
    '/refresh',
    validate(refreshTokenSchema),
    authController.refreshToken,
);

/**
 * POST /api/v1/auth/logout
 * Logout from the current device.
 * Requires a valid access token.
 */
router.post(
    '/logout',
    authenticate,
    authController.logout,
);

/**
 * POST /api/v1/auth/logout/all
 * Logout from all devices — revokes all refresh tokens.
 * Requires a valid access token.
 */
router.post(
    '/logout/all',
    authenticate,
    authController.logoutAll,
);

// ── Authenticated User Endpoints ──────────────────────────────────────────────

/**
 * GET /api/v1/auth/me
 * Get the currently authenticated user's profile.
 * Requires a valid access token.
 */
router.get(
    '/me',
    authenticate,
    authController.getMe,
);

/**
 * PATCH /api/v1/auth/change-password
 * Change the authenticated user's password.
 * Requires a valid access token.
 */
router.patch(
    '/change-password',
    authenticate,
    validate(changePasswordSchema),
    authController.changePassword,
);

// ── Forgot Password ─────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/forgot-password/reset
 * Reset password using OTP
 */
router.post(
    '/forgot-password/reset',
    authLimiter,
    validate(resetPasswordSchema),
    authController.resetPassword,
);

export default router;
