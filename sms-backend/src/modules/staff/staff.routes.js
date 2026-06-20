/**
 * staff.routes.js — Express router for Staff portal endpoints.
 *
 * Route prefix (mounted at): /api/v1/staff
 *
 * All routes:
 *   - authenticate: Valid JWT required
 *   - authorize: Must be one of the 4 staff roles
 *
 * Staff roles: COMMITTEE_MEMBER | ACCOUNTANT | FACILITY_MANAGER | SECURITY_GUARD
 */

import { Router } from 'express';
import * as staffController from './staff.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { ROLES } from '../../config/constants.js';

const router = Router();

// All staff routes require authentication and a staff role
// Staff portal roles (Committee, Accountant, Facility Mgr, Help Desk)
// SECURITY_GUARD has its own portal at /guard/*
const STAFF_ROLES = [
    ROLES.COMMITTEE_MEMBER,
    ROLES.ACCOUNTANT,
    ROLES.FACILITY_MANAGER,
    ROLES.HELP_DESK,
    ROLES.SECURITY_GUARD, // Guard also uses the same backend endpoints
];

router.use(authenticate, authorize(...STAFF_ROLES));

/**
 * GET /api/v1/staff/dashboard
 * Role-aware stats dashboard.
 */
router.get('/dashboard', staffController.getDashboard);

/**
 * GET /api/v1/staff/society/profile
 * Read-only view of the society (all staff roles).
 */
router.get('/society/profile', staffController.getSocietyProfile);

/**
 * GET /api/v1/staff/residents
 * Resident directory (COMMITTEE_MEMBER, SECURITY_GUARD, HELP_DESK).
 */
router.get('/residents', authorize(ROLES.COMMITTEE_MEMBER, ROLES.SECURITY_GUARD, ROLES.HELP_DESK), staffController.getResidents);

/**
 * GET /api/v1/staff/units
 * Unit directory (COMMITTEE_MEMBER, FACILITY_MANAGER, ACCOUNTANT, HELP_DESK).
 */
router.get(
    '/units',
    authorize(ROLES.COMMITTEE_MEMBER, ROLES.FACILITY_MANAGER, ROLES.ACCOUNTANT, ROLES.HELP_DESK),
    staffController.getUnits
);

export default router;
