/**
 * rbac.middleware.js — Role-Based Access Control (RBAC) middleware.
 *
 * Must be used AFTER `authenticate` so that req.user is populated.
 *
 * Provides two middleware factories:
 *
 *   `authorize(...roles)`           — Checks that the user's role is in the allowed list.
 *   `requirePermission(permission)` — Checks a fine-grained permission string from the
 *                                     `permissions` array in the JWT payload.
 *
 * Usage in routes:
 *   import { authorize, requirePermission } from '../../middleware/rbac.middleware.js';
 *   import { ROLES, PERMISSIONS } from '../../config/constants.js';
 *
 *   router.post('/approve', authenticate, authorize(ROLES.SOCIETY_ADMIN, ROLES.SUPER_ADMIN), controller);
 *   router.post('/book',    authenticate, requirePermission(PERMISSIONS.FACILITY_BOOK), controller);
 */

import { ROLES } from '../config/constants.js';
import ApiError from '../utils/ApiError.js';

/**
 * authorize — Role-based gate. Passes if the authenticated user's role
 * is in the provided list.
 *
 * @param {...string} roles - Allowed role(s) from the ROLES constant
 * @returns {import('express').RequestHandler}
 *
 * @example
 *   router.delete('/:id', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.SOCIETY_ADMIN), controller);
 */
export const authorize = (...roles) => (req, res, next) => {
    // req.user is set by authenticate middleware
    if (!req.user) {
        return next(ApiError.unauthorized('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
        return next(
            ApiError.forbidden(
                `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`,
            ),
        );
    }

    return next();
};

/**
 * requirePermission — Fine-grained permission gate. Passes if the user's
 * permissions array (from JWT) includes the specified permission string.
 *
 * SUPER_ADMIN bypasses this check entirely (has all permissions by definition).
 *
 * @param {string} permission - Permission string (e.g. 'visitor:create')
 * @returns {import('express').RequestHandler}
 *
 * @example
 *   router.post('/', authenticate, requirePermission(PERMISSIONS.COMPLAINT_CREATE), controller);
 */
export const requirePermission = (permission) => (req, res, next) => {
    if (!req.user) {
        return next(ApiError.unauthorized('Authentication required'));
    }

    // Super admin bypasses permission checks
    if (req.user.role === ROLES.SUPER_ADMIN) {
        return next();
    }

    const userPermissions = req.user.permissions ?? [];

    if (!userPermissions.includes(permission)) {
        return next(
            ApiError.forbidden(
                `Access denied. Missing permission: ${permission}`,
            ),
        );
    }

    return next();
};

/**
 * authorizeOwnerOrAdmin — Allows access if the user is an admin role OR
 * if the resource belongs to the current user (owner check).
 *
 * This is for "own records or admin" patterns (marked ⚠️ in the permission matrix).
 *
 * @param {Function} getOwnerId - Function that extracts the resource owner's userId from req
 *                                 e.g. (req) => req.params.userId
 * @param {...string} adminRoles - Roles that bypass the owner check
 * @returns {import('express').RequestHandler}
 *
 * @example
 *   // Residents can see their own invoices; admins see all
 *   router.get('/:id', authenticate, authorizeOwnerOrAdmin(
 *     (req) => req.invoice?.residentId?.toString(),
 *     ROLES.SOCIETY_ADMIN, ROLES.ACCOUNTANT,
 *   ), controller);
 */

export const authorizeOwnerOrAdmin = (getOwnerId, ...adminRoles) => (req, res, next) => {
    if (!req.user) {
        return next(ApiError.unauthorized('Authentication required'));
    }

    // Admin roles bypass ownership check
    if (adminRoles.includes(req.user.role) || req.user.role === ROLES.SUPER_ADMIN) {
        return next();
    }

    const ownerId = getOwnerId(req);

    if (ownerId && ownerId === req.user.sub) {
        return next();
    }

    return next(ApiError.forbidden('You do not have permission to access this resource'));
};
