/**
 * auth.middleware.js — JWT authentication middleware.
 *
 * Provides two middleware functions:
 *
 *   `authenticate`     — Requires a valid JWT. Throws 401 if missing/invalid.
 *   `optionalAuth`     — Attaches user context if a token is present, but
 *                        doesn't throw if it's missing. Use for endpoints
 *                        that behave differently for authenticated vs guest users.
 *
 * After successful verification, req.user contains the full JWT payload:
 *   { sub, email, phone, role, societyId, tenantId, unitId, residentId, permissions, jti, exp }
 */

import { verifyAccessToken } from '../modules/auth/strategies/jwt.strategy.js';
import ApiError from '../utils/ApiError.js';

/**
 * Extract the raw token from the Authorization header.
 * Expected format: "Bearer <token>"
 *
 * @param {import('express').Request} req
 * @returns {string|null} The raw token or null if not present
 */
const extractToken = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.slice(7); // Remove "Bearer " prefix
};

/**
 * authenticate — Requires a valid JWT access token.
 *
 * Flow:
 *   1. Extract token from Authorization header
 *   2. Verify signature + expiry (via jwt.strategy)
 *   3. Check token is not blacklisted
 *   4. Attach decoded payload to req.user
 *
 * @throws {ApiError} 401 UNAUTHORIZED if token is missing, invalid, expired, or blacklisted
 */
export const authenticate = async (req, res, next) => {
    try {
        const token = extractToken(req);

        if (!token) {
            return next(ApiError.unauthorized('Authentication required. Please provide a Bearer token.'));
        }

        // Verify and decode — throws ApiError on failure
        const payload = await verifyAccessToken(token);

        // Attach user context to request for downstream middleware/controllers
        req.user = payload;

        return next();
    } catch (err) {
        // Pass ApiErrors through; wrap unexpected errors
        return next(err instanceof ApiError ? err : ApiError.unauthorized('Authentication failed'));
    }
};

/**
 * optionalAuth — Attaches user context if a token is present, but does NOT require it.
 *
 * If the token is invalid or missing, req.user remains undefined.
 * Use this for public endpoints that have optional personalization (e.g. viewing
 * public notices — registered users see additional actions).
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const token = extractToken(req);
        if (token) {
            const payload = await verifyAccessToken(token);
            req.user = payload;
        }
    } catch {
        // Silently ignore auth errors for optional auth
        req.user = undefined;
    }
    return next();
};
