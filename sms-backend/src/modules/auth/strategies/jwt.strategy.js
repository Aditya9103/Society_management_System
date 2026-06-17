/**
 * jwt.strategy.js — JWT token verification logic.
 *
 * Provides functions to verify access and refresh tokens.
 * Used by auth.middleware.js — not tied to Passport.js strategy pattern,
 * keeping it simpler and more testable.
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import env from '../../../config/env.js';
import TokenBlacklist from '../tokenBlacklist.model.js';
import RefreshToken from '../RefreshToken.model.js';
import ApiError from '../../../utils/ApiError.js';

/**
 * Verify an access token.
 *
 * 1. Validates JWT signature + expiry
 * 2. Checks that the token's `jti` is not blacklisted
 *
 * @param {string} token - Raw JWT string
 * @returns {Promise<object>} Decoded payload
 * @throws {ApiError} 401 if invalid, expired, or blacklisted
 */
export const verifyAccessToken = async (token) => {
    let payload;

    try {
        payload = jwt.verify(token, env.jwt.accessSecret, {
            issuer: 'sms-api',
            audience: 'sms-client',
        });
    } catch (err) {
        // Distinguish between expired and otherwise invalid
        if (err.name === 'TokenExpiredError') {
            throw ApiError.unauthorized('Access token has expired');
        }
        throw ApiError.unauthorized('Invalid access token');
    }

    // Check if this specific token has been blacklisted (e.g. after logout)
    const isBlacklisted = await TokenBlacklist.exists({ jti: payload.jti });
    if (isBlacklisted) {
        throw ApiError.unauthorized('Token has been revoked');
    }

    return payload;
};

/**
 * Verify a refresh token by looking it up in the database.
 *
 * Refresh tokens are stored as SHA-256 hashes — never plaintext.
 * This also checks that the token hasn't been revoked or expired.
 *
 * @param {string} rawToken - Raw refresh token string
 * @returns {Promise<object>} The RefreshToken document
 * @throws {ApiError} 401 if not found, revoked, or expired
 */
export const verifyRefreshToken = async (rawToken) => {
    const tokenHash = hashToken(rawToken);

    const storedToken = await RefreshToken.findOne({ tokenHash });

    if (!storedToken) {
        throw ApiError.unauthorized('Invalid refresh token');
    }

    if (storedToken.revokedAt) {
        throw ApiError.unauthorized('Refresh token has been revoked');
    }

    if (storedToken.expiresAt < new Date()) {
        throw ApiError.unauthorized('Refresh token has expired');
    }

    return storedToken;
};

/**
 * Hash a token using SHA-256 for safe DB storage.
 * We never store plaintext tokens — only their hashes.
 *
 * @param {string} token
 * @returns {string} hex digest
 */
export const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};
