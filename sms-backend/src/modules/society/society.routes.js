/**
 * society.routes.js — Express router for all Society Admin endpoints.
 *
 * Route prefix (mounted in routes/index.js): /api/v1/societies
 *
 * All routes require:
 *   - authenticate: Valid JWT
 *   - authorize(ROLES.SOCIETY_ADMIN): Caller must be a Society Admin
 */

import { Router } from 'express';
import * as societyController from './society.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { ROLES } from '../../config/constants.js';
import validate from '../../middleware/validate.middleware.js';
import {
    createStaffSchema,
    approveResidentSchema,
    rejectResidentSchema,
    updateSocietySchema,
    createTowerSchema,
    updateTowerSchema,
    createFloorSchema,
    createUnitSchema,
    updateUnitSchema,
    listQuerySchema,
    updateFloorSchema,
} from './society.validator.js';

const router = Router();

// ── Global auth guard ─────────────────────────────────────────────────────────
router.use(authenticate);

// Apply role-based access to specific path prefixes
router.use('/dashboard', authorize(ROLES.SOCIETY_ADMIN));
router.use('/profile', authorize(ROLES.SOCIETY_ADMIN));
router.use('/staff', authorize(ROLES.SOCIETY_ADMIN));
router.use('/residents', authorize(ROLES.SOCIETY_ADMIN, ROLES.HELP_DESK));
router.use('/resident', authorize(ROLES.SOCIETY_ADMIN, ROLES.HELP_DESK));
router.use('/towers', authorize(ROLES.SOCIETY_ADMIN));
router.use('/units', authorize(ROLES.SOCIETY_ADMIN));

// ── Dashboard ─────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/societies/dashboard
 * Dashboard stats for the society admin.
 */
router.get('/dashboard', societyController.getDashboardStats);

// ── Society Profile ───────────────────────────────────────────────────────────

/**
 * GET /api/v1/societies/profile
 * Fetch own society's full profile.
 */
router.get('/profile', societyController.getSocietyProfile);

/**
 * PATCH /api/v1/societies/profile
 * Update society profile / settings / emergency contacts.
 */
router.patch('/profile', validate(updateSocietySchema), societyController.updateSociety);

/**
 * PATCH /api/v1/societies/profile/logo
 * Update society logo.
 */
import { uploadSingle } from '../../middleware/upload.middleware.js';
router.patch('/profile/logo', uploadSingle('logo'), societyController.updateSocietyLogo);

// ── Staff ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/societies/staff
 * List staff members.
 */
router.get('/staff', validate(listQuerySchema), societyController.listStaff);

/**
 * POST /api/v1/societies/staff
 * Create a staff account.
 */
router.post('/staff', validate(createStaffSchema), societyController.createStaff);

/**
 * PATCH /api/v1/societies/staff/:id/deactivate
 * Deactivate a staff member.
 */
router.patch('/staff/:id/deactivate', societyController.deactivateStaff);

// ── Residents ─────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/societies/residents
 * List residents filtered by registrationStatus (query param).
 */
router.get('/residents', validate(listQuerySchema), societyController.listResidents);

/**
 * GET /api/v1/societies/residents/profiles
 * List resident profiles with unit + family info.
 */
router.get('/residents/profiles', societyController.listResidentProfiles);

/**
 * PATCH /api/v1/societies/resident/:id/approve
 * Approve a pending resident registration.
 */
router.patch(
    '/resident/:id/approve',
    validate(approveResidentSchema),
    societyController.approveResident,
);

/**
 * PATCH /api/v1/societies/resident/:id/reject
 * Reject a pending resident registration.
 */
router.patch(
    '/resident/:id/reject',
    validate(rejectResidentSchema),
    societyController.rejectResident,
);

/**
 * PATCH /api/v1/societies/resident/:id/revoke
 * Revoke an approved resident.
 */
router.patch(
    '/resident/:id/revoke',
    validate(rejectResidentSchema), // Re-using schema for reason
    societyController.revokeResident,
);

/**
 * GET /api/v1/societies/resident/:id
 * Get detailed resident profile.
 */
router.get('/resident/:id', societyController.getResidentProfile);

// ── Towers ────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/societies/towers
 * List all towers for the society (includes floors).
 */
router.get('/towers', societyController.listTowers);

/**
 * POST /api/v1/societies/towers
 * Create a new tower (with optional auto floor generation).
 */
router.post('/towers', validate(createTowerSchema), societyController.createTower);

/**
 * PATCH /api/v1/societies/towers/:id
 * Update tower metadata.
 */
router.patch('/towers/:id', validate(updateTowerSchema), societyController.updateTower);

/**
 * DELETE /api/v1/societies/towers/:id
 * Delete a tower, its floors, and units.
 */
router.delete('/towers/:id', societyController.deleteTower);

// ── Floors ────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/societies/towers/:towerId/floors
 * List all floors in a tower.
 */
router.get('/towers/:towerId/floors', societyController.listFloors);

/**
 * POST /api/v1/societies/towers/:towerId/floors
 * Add a floor to a tower.
 */
router.post(
    '/towers/:towerId/floors',
    validate(createFloorSchema),
    societyController.createFloor,
);

/**
 * PATCH /api/v1/societies/towers/:towerId/floors/:floorId
 * Update floor metadata.
 */
router.patch(
    '/towers/:towerId/floors/:floorId',
    validate(updateFloorSchema),
    societyController.updateFloor,
);

/**
 * DELETE /api/v1/societies/towers/:towerId/floors/:floorId
 * Delete a floor.
 */
router.delete('/towers/:towerId/floors/:floorId', societyController.deleteFloor);

// ── Units ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/societies/units
 * List units with optional tower/floor/occupancy filter.
 */
router.get('/units', societyController.listUnits);

/**
 * POST /api/v1/societies/units
 * Create a new unit.
 */
router.post('/units', validate(createUnitSchema), societyController.createUnit);

/**
 * PATCH /api/v1/societies/units/:id
 * Update a unit's details.
 */
router.patch('/units/:id', validate(updateUnitSchema), societyController.updateUnit);

/**
 * DELETE /api/v1/societies/units/:id
 * Delete a unit.
 */
router.delete('/units/:id', societyController.deleteUnit);

export default router;
