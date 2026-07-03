/**
 * superadmin.controller.js — HTTP handlers for the SuperAdmin module.
 *
 * All handlers use asyncHandler for clean error propagation and
 * return standardized ApiResponse envelopes.
 */

import * as superAdminService from './superadmin.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

// ── Dashboard ─────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/dashboard
 * Returns platform-level stats.
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await superAdminService.getDashboardStats();
    res.status(200).json(new ApiResponse(200, stats, 'Dashboard stats fetched successfully'));
});

// ── Tenant Management ─────────────────────────────────────────────────────────

/**
 * POST /api/v1/admin/tenants
 * Provision a new Tenant + Society in one atomic operation.
 */
export const createTenantWithSociety = asyncHandler(async (req, res) => {
    const payload = { ...req.body, logoBuffer: req.file?.buffer };
    const result = await superAdminService.createTenantWithSociety(payload, req.user.sub, req.ip, req.headers['user-agent']);
    res.status(201).json(
        new ApiResponse(201, result, 'Tenant and Society provisioned successfully'),
    );
});


/**
 * GET /api/v1/admin/tenants
 * List all tenants (paginated, with optional search).
 */
export const listTenants = asyncHandler(async (req, res) => {
    const { data, pagination } = await superAdminService.listTenants(req.query);
    res.status(200).json(
        new ApiResponse(200, data, 'Tenants fetched successfully', pagination),
    );
});

/**
 * PATCH /api/v1/admin/tenants/:id/toggle
 * Toggle the active/inactive status of a tenant.
 */
export const toggleTenantStatus = asyncHandler(async (req, res) => {
    const tenant = await superAdminService.toggleTenantStatus(req.params.id, req.user.sub, req.ip, req.headers['user-agent']);
    const msg = tenant.isActive ? 'Tenant activated successfully' : 'Tenant deactivated successfully';
    res.status(200).json(new ApiResponse(200, tenant, msg));
});

// ── Society Management ────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/societies
 * List all societies across all tenants (paginated, with optional search).
 */
export const listSocieties = asyncHandler(async (req, res) => {
    const { data, pagination } = await superAdminService.listSocieties(req.query);
    res.status(200).json(
        new ApiResponse(200, data, 'Societies fetched successfully', pagination),
    );
});

/**
 * PATCH /api/v1/admin/societies/:id/toggle
 * Toggle the active/inactive status of a society.
 */
export const toggleSocietyStatus = asyncHandler(async (req, res) => {
    const society = await superAdminService.toggleSocietyStatus(req.params.id, req.user.sub, req.ip, req.headers['user-agent']);
    const msg = society.isActive ? 'Society activated successfully' : 'Society deactivated successfully';
    res.status(200).json(new ApiResponse(200, society, msg));
});

// ── Society Admin Provisioning ────────────────────────────────────────────────

/**
 * POST /api/v1/admin/society-admin
 * Provision a new SOCIETY_ADMIN user for an existing society.
 */
export const createSocietyAdmin = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, phone, societyId } = req.body;
    const admin = await superAdminService.createSocietyAdmin({
        firstName, lastName, email, phone, societyId,
    }, req.user.sub, req.ip, req.headers['user-agent']);
    res.status(201).json(
        new ApiResponse(201, { user: admin }, 'Society Admin provisioned successfully'),
    );
});

// ── Audit Logs ────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/audit-logs
 * List all system audit logs.
 */
export const getAuditLogs = asyncHandler(async (req, res) => {
    const { data, pagination } = await superAdminService.listAuditLogs(req.query);
    res.status(200).json(
        new ApiResponse(200, data, 'Audit logs fetched successfully', pagination),
    );
});
