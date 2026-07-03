/**
 * superadmin.routes.js — Express router for all SuperAdmin endpoints.
 *
 * ALL routes in this file require:
 *   - authenticate: Valid JWT
 *   - authorize(ROLES.SUPER_ADMIN): Caller must be a Super Admin
 *
 * Route prefix (mounted in routes/index.js): /api/v1/admin
 */

import { Router } from 'express';
import * as superAdminController from './superadmin.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { ROLES } from '../../config/constants.js';
import validate from '../../middleware/validate.middleware.js';
import {
    createSocietyAdminSchema,
    createTenantWithSocietySchema,
    listQuerySchema,
} from './superadmin.validator.js';
import { uploadSingle } from '../../middleware/upload.middleware.js';

const router = Router();

// ── Global auth guard — all routes below require SUPER_ADMIN ─────────────────
router.use(authenticate, authorize(ROLES.SUPER_ADMIN));

// ── Dashboard ─────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/dashboard
 * Platform-level stats: total tenants, societies, users.
 */
router.get('/dashboard', superAdminController.getDashboardStats);

// ── Tenant Management ─────────────────────────────────────────────────────────

/**
 * POST /api/v1/admin/tenants
 * Provision a new Tenant + Society.
 */
router.post(
    '/tenants',
    uploadSingle('logo', 'societies', 'image'),
    validate(createTenantWithSocietySchema),
    superAdminController.createTenantWithSociety,
);

/**
 * GET /api/v1/admin/tenants
 * List all tenants (paginated, searchable).
 */
router.get(
    '/tenants',
    validate(listQuerySchema),
    superAdminController.listTenants,
);

/**
 * PATCH /api/v1/admin/tenants/:id/toggle
 * Toggle Tenant active/inactive status.
 */
router.patch('/tenants/:id/toggle', superAdminController.toggleTenantStatus);

// ── Society Management ────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/societies
 * List all societies across all tenants (paginated, searchable).
 */
router.get(
    '/societies',
    validate(listQuerySchema),
    superAdminController.listSocieties,
);

/**
 * PATCH /api/v1/admin/societies/:id/toggle
 * Toggle Society active/inactive status.
 */
router.patch('/societies/:id/toggle', superAdminController.toggleSocietyStatus);

// ── Society Admin Provisioning ────────────────────────────────────────────────

/**
 * POST /api/v1/admin/society-admin
 * Provision a new SOCIETY_ADMIN user for an existing society.
 */
router.post(
    '/society-admin',
    validate(createSocietyAdminSchema),
    superAdminController.createSocietyAdmin,
);

// ── Audit Logs ────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/audit-logs
 * List system audit logs.
 */
router.get(
    '/audit-logs',
    validate(listQuerySchema),
    superAdminController.getAuditLogs,
);

/**
 * DELETE /api/v1/admin/audit-logs
 * Delete audit logs based on time criteria
 */
router.delete(
    '/audit-logs',
    superAdminController.deleteAuditLogs,
);

export default router;
