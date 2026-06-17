/**
 * refresh.strategy.js — Token generation logic.
 *
 * Provides functions to generate signed access tokens and
 * cryptographically random refresh tokens.
 *
 * Access tokens carry the full user context (per JWT spec in the SMS spec).
 * Refresh tokens are opaque random strings stored hashed in the DB.
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import env from '../../../config/env.js';
import { ROLE_PERMISSIONS, JWT_CONFIG } from '../../../config/constants.js';
import { hashToken } from './jwt.strategy.js';
import RefreshToken from '../RefreshToken.model.js';

/**
 * Generate a signed JWT access token for a user.
 *
 * The payload matches the structure specified in the SMS spec (section 4.3):
 * sub, email, phone, role, societyId, tenantId, unitId, residentId, permissions, jti
 *
 * @param {object} user         - User document (Mongoose)
 * @param {object} [extra]      - Optional extra claims (unitId, residentId)
 * @returns {string} Signed JWT
 */
export const generateAccessToken = (user, extra = {}) => {
    const jti = uuidv4(); // Unique token ID — used for blacklisting

    const payload = {
        // Standard claims
        sub: user._id.toString(),
        jti,

        // Identity
        email: user.email ?? null,
        phone: user.phone,

        // Role & tenant context
        role: user.role,
        societyId: user.societyId?.toString() ?? null,
        tenantId: user.tenantId?.toString() ?? null,

        // Resident-specific context (provided after resident record is resolved)
        unitId: extra.unitId?.toString() ?? null,
        residentId: extra.residentId?.toString() ?? null,

        // Fine-grained permissions derived from role
        permissions: ROLE_PERMISSIONS[user.role] ?? [],
    };

    return jwt.sign(payload, env.jwt.accessSecret, {
        expiresIn: env.jwt.accessExpires || JWT_CONFIG.ACCESS_EXPIRES,
        issuer: 'sms-api',
        audience: 'sms-client',
    });
};

/**
 * Generate a cryptographically secure opaque refresh token.
 *
 * The raw token is returned (to be sent to the client once).
 * Only its SHA-256 hash is persisted in MongoDB.
 *
 * @param {string}  userId      - User's MongoDB ObjectId as string
 * @param {object}  [deviceInfo] - { ipAddress, userAgent, deviceFingerprint }
 * @returns {Promise<{ rawToken: string, record: RefreshTokenDocument }>}
 */
export const generateRefreshToken = async (userId, deviceInfo = {}) => {
    // Generate 64 bytes of random data → 128 char hex string
    const rawToken = crypto.randomBytes(64).toString('hex');
    const tokenHash = hashToken(rawToken);

    const expiresAt = new Date(Date.now() + JWT_CONFIG.REFRESH_EXPIRES_MS);

    const record = await RefreshToken.create({
        userId,
        tokenHash,
        expiresAt,
        ipAddress: deviceInfo.ipAddress ?? null,
        userAgent: deviceInfo.userAgent ?? null,
        deviceFingerprint: deviceInfo.deviceFingerprint ?? null,
    });

    return { rawToken, record };
};

/**
 * Revoke a specific refresh token by marking it as revoked in the DB.
 *
 * @param {string} rawToken - The raw refresh token to revoke
 * @returns {Promise<void>}
 */
export const revokeRefreshToken = async (rawToken) => {
    const tokenHash = hashToken(rawToken);
    await RefreshToken.findOneAndUpdate(
        { tokenHash },
        { revokedAt: new Date() },
    );
};

/**
 * Revoke ALL refresh tokens for a user (logout from all devices).
 *
 * @param {string} userId - User's MongoDB ObjectId as string
 * @returns {Promise<void>}
 */
export const revokeAllRefreshTokens = async (userId) => {
    await RefreshToken.updateMany(
        { userId, revokedAt: null },
        { revokedAt: new Date() },
    );
};
