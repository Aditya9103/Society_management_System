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
    changeStatusSchema,
} from './complaint.validator.js';
import { uploadMultiple } from '../../middleware/upload.middleware.js';

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
router.post(
    '/',
    authorize(...CAN_CREATE),
    uploadMultiple('images', 3, 'complaints', 'image'),
    validate(raiseComplaintSchema),
    complaintController.raiseComplaint
);

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
 * PATCH /api/v1/complaints/:id/status
 * Change complaint status (assignment, resolution, reopen, etc).
 * Role checks and state transition validations happen in service.
 */
router.patch(
    '/:id/status',
    authorize(...CAN_CREATE),
    validate(changeStatusSchema),
    complaintController.changeStatus,
);

/**
 * DELETE /api/v1/complaints/:id
 * Delete a closed complaint (admin only).
 */
router.delete('/:id', authorize(ROLES.SOCIETY_ADMIN), complaintController.deleteComplaint);

export default router;
