/**
 * society.middleware.js — Multi-tenancy / Society isolation middleware.
 *
 * Ensures that every authenticated request is scoped to the correct society
 * extracted from the user's JWT. Prevents any cross-society data leakage.
 *
 * Usage in routes (after authenticate):
 *   router.get('/residents', authenticate, injectSociety, authorize(ROLES.SOCIETY_ADMIN), controller);
 *
 * After `injectSociety`:
 *   req.societyId  — the societyId from the JWT (MongoDB ObjectId string)
 *   req.tenantId   — the tenantId from the JWT
 *
 * Then in services/repositories, always filter with:
 *   { societyId: req.societyId, ...otherFilters }
 *
 * SUPER_ADMIN bypasses society injection (they operate across all societies).
 */

import mongoose from 'mongoose';
import { ROLES } from '../config/constants.js';
import ApiError from '../utils/ApiError.js';

/**
 * injectSociety — Extracts and validates societyId from the JWT payload.
 *
 * Attaches:
 *   req.societyId {string} — MongoDB ObjectId string of the user's society
 *   req.tenantId  {string} — MongoDB ObjectId string of the user's tenant
 *
 * Throws 403 if a non-SUPER_ADMIN user has no societyId in their token.
 *
 * @type {import('express').RequestHandler}
 */
export const injectSociety = (req, res, next) => {
    if (!req.user) {
        return next(ApiError.unauthorized('Authentication required before society injection'));
    }

    // SUPER_ADMIN operates globally — no society context required
    if (req.user.role === ROLES.SUPER_ADMIN) {
        req.societyId = req.user.societyId ?? null;
        req.tenantId = req.user.tenantId ?? null;
        return next();
    }

    // All other roles must have a societyId in their token
    if (!req.user.societyId) {
        return next(
            ApiError.forbidden('User is not associated with any society. Contact your administrator.'),
        );
    }

    req.societyId = req.user.societyId;
    req.tenantId = req.user.tenantId ?? null;

    return next();
};

/**
 * guardSocietyResource — Verifies that a fetched resource belongs to the
 * requesting user's society. Used in individual resource routes.
 *
 * Usage (in a controller after fetching the resource):
 *   guardSocietyMembership(req, fetchedDocument.societyId);
 *
 * @param {import('express').Request} req
 * @param {string|mongoose.Types.ObjectId} resourceSocietyId
 * @throws {ApiError} 403 if resource doesn't belong to req's society
 */
export const guardSocietyMembership = (req, resourceSocietyId) => {
    // SUPER_ADMIN can access any society's resources
    if (req.user?.role === ROLES.SUPER_ADMIN) return;

    if (!resourceSocietyId) return; // Resource has no societyId (e.g. global resources)

    const resourceSociety = resourceSocietyId.toString();
    const userSociety = req.societyId;

    if (resourceSociety !== userSociety) {
        throw ApiError.forbidden('Access denied. Resource does not belong to your society.');
    }
};

/**
 * requireSocietyAdmin — Convenience middleware combining authenticate + injectSociety
 * + authorize for SOCIETY_ADMIN or SUPER_ADMIN.
 *
 * @example
 *   router.post('/settings', requireSocietyAdmin, controller);
 */
export const requireSocietyAdmin = [
    injectSociety,
    (req, res, next) => {
        if (![ROLES.SUPER_ADMIN, ROLES.SOCIETY_ADMIN].includes(req.user.role)) {
            return next(ApiError.forbidden('Society admin privileges required'));
        }
        return next();
    },
];
