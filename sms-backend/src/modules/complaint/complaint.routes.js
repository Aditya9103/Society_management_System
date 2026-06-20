/**
 * complaint.routes.js — Express router for the Complaint module.
 *
 * Route prefix: /api/v1/complaints
 *
 * Permissions (from constants.js):
 *   complaint:create → RESIDENT, COMMITTEE, ACCOUNTANT, FACILITY_MGR, HELP_DESK, SOCIETY_ADMIN
 *   complaint:read   → RESIDENT (own), COMMITTEE, FACILITY_MGR, HELP_DESK, SOCIETY_ADMIN
 *   complaint:assign → SOCIETY_ADMIN, FACILITY_MANAGER
 *   complaint:close  → SOCIETY_ADMIN
 */

import { Router } from 'express';
import * as complaintController from './complaint.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { ROLES } from '../../config/constants.js';
import validate from '../../middleware/validate.middleware.js';
import {
    raiseComplaintSchema,
    assignComplaintSchema,
    closeComplaintSchema,
} from './complaint.validator.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

const CAN_CREATE = [
    ROLES.RESIDENT,
    ROLES.COMMITTEE_MEMBER,
    ROLES.ACCOUNTANT,
    ROLES.FACILITY_MANAGER,
    ROLES.HELP_DESK,
    ROLES.SOCIETY_ADMIN,
];

const CAN_READ_ALL = [
    ROLES.SOCIETY_ADMIN,
    ROLES.COMMITTEE_MEMBER,
    ROLES.FACILITY_MANAGER,
    ROLES.HELP_DESK,
];

/**
 * POST /api/v1/complaints
 * Raise a complaint (resident or staff).
 */
router.post('/', authorize(...CAN_CREATE), validate(raiseComplaintSchema), complaintController.raiseComplaint);

/**
 * GET /api/v1/complaints/my
 * List the authenticated resident's own complaints.
 */
router.get('/my', authorize(ROLES.RESIDENT), complaintController.listMyComplaints);

/**
 * GET /api/v1/complaints
 * List all society complaints (admin/staff view).
 */
router.get('/', authorize(...CAN_READ_ALL), complaintController.listAllComplaints);

/**
 * GET /api/v1/complaints/:id
 * Get a single complaint — ownership enforced in service layer.
 */
router.get('/:id', authorize(...CAN_CREATE), complaintController.getComplaintById);

/**
 * PATCH /api/v1/complaints/:id/assign
 * Assign complaint to a staff member.
 */
router.patch(
    '/:id/assign',
    authorize(ROLES.SOCIETY_ADMIN, ROLES.FACILITY_MANAGER),
    validate(assignComplaintSchema),
    complaintController.assignComplaint,
);

/**
 * PATCH /api/v1/complaints/:id/close
 * Resolve/close a complaint.
 */
router.patch(
    '/:id/close',
    authorize(ROLES.SOCIETY_ADMIN),
    validate(closeComplaintSchema),
    complaintController.closeComplaint,
);

export default router;
