/**
 * auth.controller.js — HTTP request handlers for all auth endpoints.
 *
 * Controllers are thin — they:
 *   1. Extract validated data from req
 *   2. Call the appropriate auth service method
 *   3. Return a standardized ApiResponse
 *
 * All async errors bubble up through asyncHandler → error middleware.
 */

import * as authService from './auth.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import ApiError from '../../utils/ApiError.js';
import asyncHandler from '../../utils/asyncHandler.js';

// ── Helper: extract device context from the request ───────────────────────────
const getDeviceInfo = (req) => ({
    ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
    userAgent: req.headers['user-agent'] || null,
    deviceFingerprint: req.body?.deviceFingerprint || null,
});

// ── OTP ───────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/otp/send
 * Send an OTP to the provided phone number.
 * Rate limited by otpLimiter.
 */
export const sendOtp = asyncHandler(async (req, res) => {
    const { email, purpose } = req.body;

    await authService.sendOtp(email, purpose);

    res.status(200).json(
        new ApiResponse(200, null, `OTP sent successfully to ${email}`),
    );
});

/**
 * POST /api/v1/auth/otp/verify
 * Verify an OTP without logging in.
 * Useful for multi-step registration flows.
 */
export const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp, purpose } = req.body;

    await authService.verifyOtp(email, otp, purpose);

    res.status(200).json(
        new ApiResponse(200, { verified: true }, 'OTP verified successfully'),
    );
});

// ── Login ─────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/login/otp
 * Authenticate using phone number + OTP.
 * Returns access token, refresh token, and user profile.
 */
export const loginWithOtp = asyncHandler(async (req, res) => {
    const { email, otp, fcmToken } = req.body;
    const deviceInfo = getDeviceInfo(req);

    const { accessToken, refreshToken, user } = await authService.loginWithOtp(
        email,
        otp,
        deviceInfo,
    );

    // Register FCM token if provided
    if (fcmToken && user._id) {
        // Fire-and-forget — don't block the login response
        authService.registerFcmToken?.(user._id.toString(), fcmToken).catch(() => {});
    }

    res.status(200).json(
        new ApiResponse(200, { accessToken, refreshToken, user }, 'Login successful'),
    );
});

/**
 * POST /api/v1/auth/login/password
 * Authenticate using phone/email + password.
 */
export const loginWithPassword = asyncHandler(async (req, res) => {
    const { identifier, password, fcmToken } = req.body;
    const deviceInfo = getDeviceInfo(req);

    const { accessToken, refreshToken, user } = await authService.loginWithPassword(
        identifier,
        password,
        deviceInfo,
    );

    res.status(200).json(
        new ApiResponse(200, { accessToken, refreshToken, user }, 'Login successful'),
    );
});

// ── Token Refresh ─────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/refresh
 * Exchange a valid refresh token for a new access + refresh token pair.
 * Old refresh token is revoked (rotation).
 */
export const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken: rawRefreshToken } = req.body;
    const deviceInfo = getDeviceInfo(req);

    const { accessToken, refreshToken } = await authService.refreshTokens(
        rawRefreshToken,
        deviceInfo,
    );

    res.status(200).json(
        new ApiResponse(200, { accessToken, refreshToken }, 'Tokens refreshed successfully'),
    );
});

// ── Logout ────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/logout
 * Logout from the current device only.
 * Blacklists the current access token and revokes the provided refresh token.
 * Requires authentication.
 */
export const logout = asyncHandler(async (req, res) => {
    const { jti, sub: userId, exp } = req.user;
    const { refreshToken: rawRefreshToken } = req.body;

    // Convert exp (Unix seconds) to a Date for TTL storage
    const tokenExpiresAt = new Date(exp * 1000);

    await authService.logout(userId, jti, tokenExpiresAt, rawRefreshToken);

    res.status(200).json(
        new ApiResponse(200, null, 'Logged out successfully'),
    );
});

/**
 * POST /api/v1/auth/logout/all
 * Logout from all devices.
 * Revokes all refresh tokens for this user.
 * Requires authentication.
 */
export const logoutAll = asyncHandler(async (req, res) => {
    const { jti, sub: userId, exp } = req.user;
    const tokenExpiresAt = new Date(exp * 1000);

    await authService.logoutAll(userId, jti, tokenExpiresAt);

    res.status(200).json(
        new ApiResponse(200, null, 'Logged out from all devices successfully'),
    );
});

// ── Profile ───────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/auth/me
 * Return the currently authenticated user's profile.
 * The user context is already attached to req.user by auth.middleware.
 */
export const getMe = asyncHandler(async (req, res) => {
    // req.user contains the full JWT payload.
    // Fetch fresh user data from DB to ensure accuracy.
    const user = await authService.getAuthenticatedUser(req.user.sub);

    res.status(200).json(
        new ApiResponse(200, { user }, 'Profile retrieved successfully'),
    );
});

/**
 * PATCH /api/v1/auth/me/avatar
 * Update the authenticated user's avatar.
 */
export const updateMyAvatar = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    if (!req.file) throw ApiError.badRequest('Avatar image is required');
    const user = await authService.updateMyAvatar(userId, req.file.buffer);
    res.status(200).json(new ApiResponse(200, { user }, 'Avatar updated successfully'));
});

// ── Password ──────────────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/auth/change-password
 * Change the authenticated user's password.
 * Requires: current password, new password, confirmation.
 */
export const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.sub;

    await authService.changePassword(userId, oldPassword, newPassword);

    res.status(200).json(
        new ApiResponse(200, null, 'Password changed successfully. Please log in again.'),
    );
});

// ── Resident Registration ─────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register/resident/initiate
 * Step 1: Initiate resident registration
 */
export const initiateResidentRegistration = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    await authService.initiateResidentRegistration(firstName, lastName, email, password);

    res.status(201).json(
        new ApiResponse(201, null, `Registration initiated. An OTP has been sent to ${email}`),
    );
});

/**
 * POST /api/v1/auth/register/resident/verify
 * Step 2: Verify resident registration OTP
 */
export const verifyResidentRegistration = asyncHandler(async (req, res) => {
    const { email, otp, fcmToken } = req.body;
    const deviceInfo = getDeviceInfo(req);

    const { accessToken, refreshToken, user } = await authService.verifyResidentRegistration(
        email,
        otp,
        deviceInfo
    );

    if (fcmToken && user._id) {
        authService.registerFcmToken?.(user._id.toString(), fcmToken).catch(() => {});
    }

    res.status(200).json(
        new ApiResponse(200, { accessToken, refreshToken, user }, 'Email verified successfully. Please complete your profile.'),
    );
});

// ── Forgot Password ─────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/forgot-password/reset
 * Reset password using OTP
 */
export const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    await authService.resetPassword(email, otp, newPassword);

    res.status(200).json(
        new ApiResponse(200, null, 'Password has been reset successfully. Please log in.'),
    );
});
