/**
 * audit.middleware.js — Automatic audit log middleware factory.
 *
 * Creates an audit log entry in MongoDB after a request completes successfully.
 * Captures: who did what, to which resource, from where, and when.
 *
 * Uses the `res.on('finish')` event so audit logging never blocks the response.
 * Only logs when the HTTP status code indicates success (< 400).
 *
 * Usage in routes (after authenticate + injectSociety):
 *   router.post(
 *     '/residents/:id/approve',
 *     authenticate,
 *     injectSociety,
 *     auditLog('APPROVE', 'RESIDENT'),
 *     controller,
 *   );
 *
 * The controller can attach `req.auditResourceId` to log the specific resource ID,
 * and `req.auditBeforeState` / `req.auditAfterState` for state diffs.
 */

import AuditLog from '../shared/models/AuditLog.js';

/**
 * auditLog — Middleware factory for post-request audit logging.
 *
 * @param {string} action        - Audit action (e.g. 'CREATE', 'APPROVE', 'LOGIN')
 * @param {string} resourceType  - Resource being acted on (e.g. 'RESIDENT', 'VISITOR')
 * @returns {import('express').RequestHandler}
 */
export const auditLog = (action, resourceType) => (req, res, next) => {
    // Listen for response finish to log after the request completes
    res.on('finish', () => {
        // Only log successful operations (2xx, 3xx status codes)
        if (res.statusCode >= 400) return;

        // Fire-and-forget: don't await, don't block
        _writeAuditLog(req, res, action, resourceType).catch((err) => {
            // Audit logging failure should never crash the server
            console.error('[AuditLog] Failed to write audit entry:', err.message);
        });
    });

    return next();
};

/**
 * Internal helper: persist the audit log entry to MongoDB.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {string} action
 * @param {string} resourceType
 */

const _writeAuditLog = async (req, res, action, resourceType) => {
    const actor = req.user ?? null;

    await AuditLog.create({
        // Who performed the action
        tenantId: actor?.tenantId ?? null,
        societyId: actor?.societyId ?? req.societyId ?? null,
        actorId: actor?.sub ?? null,
        actorRole: actor?.role ?? null,

        // What was done
        action,
        resourceType,

        // Which specific resource (controller sets this on req if applicable)
        resourceId: req.auditResourceId ?? null,

        // State diff (controller sets these for updates/deletes)
        beforeState: req.auditBeforeState ?? null,
        afterState: req.auditAfterState ?? null,

        // Request context
        ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
        userAgent: req.headers['user-agent'] || null,
        sessionId: actor?.jti ?? null, // JWT ID doubles as session identifier
    });
};

/**
 * auditLogin — Specialized audit helper for login events.
 * Call this directly from the auth service (not as middleware) since login
 * doesn't go through the standard resource route pattern.
 *
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.role
 * @param {string} params.societyId
 * @param {string} params.tenantId
 * @param {string} params.ipAddress
 * @param {string} params.userAgent
 * @param {string} params.jti
 */
export const auditLogin = async ({
    userId,
    role,
    societyId,
    tenantId,
    ipAddress,
    userAgent,
    jti,
}) => {
    await AuditLog.create({
        actorId: userId,
        actorRole: role,
        societyId: societyId ?? null,
        tenantId: tenantId ?? null,
        action: 'LOGIN',
        resourceType: 'USER',
        resourceId: userId,
        ipAddress,
        userAgent,
        sessionId: jti ?? null,
    }).catch((err) => {
        console.error('[AuditLog] Failed to write login audit:', err.message);
    });
};

/**
 * auditLogout — Specialized audit helper for logout events.
 *
 * @param {object} params - Same shape as auditLogin
 */
export const auditLogout = async ({ userId, role, societyId, tenantId, jti, ipAddress, userAgent }) => {
    await AuditLog.create({
        actorId: userId,
        actorRole: role,
        societyId: societyId ?? null,
        tenantId: tenantId ?? null,
        action: 'LOGOUT',
        resourceType: 'USER',
        resourceId: userId,
        sessionId: jti ?? null,
        ipAddress,
        userAgent,
    }).catch((err) => {
        console.error('[AuditLog] Failed to write logout audit:', err.message);
    });
};
